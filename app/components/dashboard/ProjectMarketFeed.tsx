"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Clock, 
  MessageSquare, 
  Sparkles,
  Loader2,
  Filter,
  DollarSign,
  Building2,
  User,
  Zap,
  Target,
  Send,
  Star,
  Edit3,
  Trash2
} from "lucide-react";
import { useUser } from "../../dashboard/layout";
import { getLabelById, getCategoryIdBySkillId } from "@/app/constants/onboarding-categories";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProjectMarketFeed({ onEdit, onDelete }: { onEdit?: (p: any) => void, onDelete?: (id: string) => void }) {
  const { user, role } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(role === "freelancer");

  const isClient = role === "client";

  useEffect(() => {
    async function fetchMarket() {
      try {
        setLoading(true);
        // 1. Ambil data proyek marketplace
        const res = await fetch("/api/projects/market");
        const json = await res.json();
        
        if (json.data) {
          let marketProjects = json.data;

          // 2. Ambil preferensi onboarding jika user adalah freelancer untuk scoring
          let freelancerPref: any = null;
          if (!isClient && user?.id) {
            const { data: pref } = await supabase
              .from("onboarding_freelancer")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();
            freelancerPref = pref;
          }

          // 3. Ambil data onboarding client untuk setiap proyek (untuk info skala bisnis, dll)
          const { data: clientOnboardings } = await supabase.from("onboarding_client").select("*");

            // 4. Proses Scoring & Metadata
            const processed = marketProjects.map((p: any) => {
              const clientOb = clientOnboardings?.find(ob => ob.user_id === p.client_id) || {};
              
              // Extract embedded metadata from required_skills
              const embeddedExp = p.required_skills?.find((s: string) => s.startsWith("EXP:"))?.replace("EXP:", "");
              const embeddedWork = p.required_skills?.find((s: string) => s.startsWith("WORK:"))?.replace("WORK:", "");
              
              // Clean skills list (remove metadata)
              const cleanSkills = p.required_skills?.filter((s: string) => !s.startsWith("EXP:") && !s.startsWith("WORK:"));

              let matchScore = 0;
              const effectiveExp = embeddedExp || clientOb.experience_preference;
              const effectiveWork = embeddedWork || clientOb.work_type;

              if (freelancerPref) {
                // 1. Match Category (Very Important)
                if (freelancerPref.skill_categories?.includes(p.category_id)) matchScore += 50;
                
                // 2. Match Business Scale
                if (freelancerPref.preferred_client_scales?.includes(clientOb.business_scale)) matchScore += 20;
                
                // 3. Match Work Type
                if (freelancerPref.work_type_preference?.includes(effectiveWork)) matchScore += 20;
                
                // 4. Match Exp Level
                if (freelancerPref.experience_level === effectiveExp) matchScore += 30;
                
                // 5. Match Skills / Tools
                const overlap = (cleanSkills || []).filter((s: string) => {
                  const sLower = s.toLowerCase();
                  const belongsToCat = getCategoryIdBySkillId(sLower);
                  
                  return (
                    freelancerPref.tools?.some((t: string) => t.toLowerCase() === sLower) ||
                    freelancerPref.skill_categories?.some((c: string) => 
                      c.toLowerCase() === sLower || (belongsToCat && c.toLowerCase() === belongsToCat.toLowerCase())
                    )
                  );
                }).length;
                matchScore += overlap * 15;
              }

              return { 
                ...p, 
                clientOb, 
                matchScore, 
                cleanSkills,
                displayExp: effectiveExp === 'mid' ? 'Intermediate' : (effectiveExp === 'senior' ? 'Expert / Senior' : (effectiveExp === 'junior' ? 'Junior' : effectiveExp)),
                displayWork: effectiveWork === 'ongoing' ? 'Berkelanjutan' : 'Satu Kali'
              };
            });

          // Sort by match score if freelancer
          if (!isClient) {
            processed.sort((a: any, b: any) => b.matchScore - a.matchScore);
          }

          if (isClient) {
            // Ambil juga draft milik klien ini
            const draftRes = await fetch("/api/projects");
            const draftJson = await draftRes.json();
            const myDrafts = (draftJson.data || []).filter((p: any) => p.status === "draft");
            
            const myPublished = processed.filter((p: any) => p.client_id === user?.id);
            const allProjects = [...myDrafts, ...myPublished];
            const uniqueProjects = Array.from(new Map(allProjects.map(p => [p.id, p])).values());
            setProjects(uniqueProjects);
          } else {
            setProjects(processed);
          }
        }
      } catch (err) {
        console.error("Failed to fetch market projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMarket();
  }, [isClient, user?.id]);

  const filteredProjects = !isClient && filterActive 
    ? projects.filter(p => p.matchScore >= 50) // Minimal kategori cocok atau banyak skill cocok
    : projects;

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "60px", textAlign: "center", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={32} style={{ margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: "16px", fontWeight: "600" }}>
          {isClient ? "Menyusun postingan Anda..." : "Menyesuaikan peluang terbaik untuk Anda..."}
        </p>
      </div>
    );
  }

  const badgeStyle = {
    display: "flex", 
    alignItems: "center", 
    gap: "6px", 
    padding: "6px 12px", 
    background: "rgba(255,255,255,0.03)", 
    borderRadius: "10px", 
    fontSize: "11px", 
    fontWeight: "600", 
    color: "rgba(255,255,255,0.6)"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Grid Filter (if needed) or directly Grid */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
        {!isClient && (
          <button 
            onClick={() => setFilterActive(!filterActive)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "12px",
              background: filterActive ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.03)",
              border: `1px solid ${filterActive ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)"}`,
              color: filterActive ? "#10B981" : "rgba(226, 232, 240, 0.6)",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <Filter size={16} />
            {filterActive ? "Sesuai Keahlian" : "Semua Proyek"}
          </button>
        )}
      </div>

      {/* Grid Postingan */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", 
        gap: "24px" 
      }}>
        <AnimatePresence mode="popLayout">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, idx) => (
              <motion.div
                key={`${project.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="futuristic-card"
                style={{
                  padding: "28px",
                  background: "rgba(13, 25, 48, 0.4)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  position: "relative",
                  boxShadow: project.matchScore > 80 ? "0 0 30px rgba(16, 185, 129, 0.05)" : "none",
                  cursor: "pointer"
                }}
              >
                {/* Glow Effect on Hover (handled by CSS) */}
                <div className="card-glow" />

                {/* Floating Actions (Top Left) */}
                {isClient && (
                   <div style={{ 
                     position: "absolute", 
                     top: "14px", 
                     left: "14px", 
                     display: "flex", 
                     gap: "6px", 
                     zIndex: 30,
                     background: "rgba(13, 25, 48, 0.6)",
                     padding: "4px",
                     borderRadius: "10px",
                     border: "1px solid rgba(255, 255, 255, 0.05)",
                     backdropFilter: "blur(4px)"
                   }}>
                      <motion.button
                        whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.08)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(project); }}
                        style={{ width: "26px", height: "26px", borderRadius: "6px", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Edit3 size={13} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, background: "rgba(239, 68, 68, 0.1)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(project.id); }}
                        style={{ width: "26px", height: "26px", borderRadius: "6px", background: "transparent", border: "none", color: "rgba(239, 68, 68, 0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Trash2 size={13} />
                      </motion.button>
                   </div>
                 )}

                {/* Badge Rekomendasi */}
                {!isClient && project.matchScore > 80 && (
                  <div style={{
                    position: "absolute",
                    top: "-10px",
                    right: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)",
                    zIndex: 10
                  }}>
                    <Sparkles size={12} fill="white" />
                    Top Match
                  </div>
                )}

                {/* Top Section: Category & Budget */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: isClient ? "24px" : "0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ 
                      padding: "6px 12px", 
                      background: "rgba(77, 99, 255, 0.08)", 
                      borderRadius: "8px", 
                      color: "#4D63FF", 
                      fontSize: "10px", 
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      border: "1px solid rgba(77, 99, 255, 0.15)",
                      width: "fit-content"
                    }}>
                      {getLabelById(project.category_id) || "Design"}
                    </div>
                    
                    {/* Status Indicator */}
                    {isClient && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "2px 4px" }}>
                        <div style={{ 
                          width: "6px", 
                          height: "6px", 
                          borderRadius: "50%", 
                          background: project.status === 'published' ? "#00FFA3" : "#F59E0B",
                          boxShadow: `0 0 10px ${project.status === 'published' ? "#00FFA3" : "#F59E0B"}`
                        }} />
                        <span style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.4)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
                          {project.status === 'published' ? "PROJECT LIVE" : "DRAFT PROYEK"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: "900", color: "#00FFA3", letterSpacing: "-0.5px" }}>
                      {project.budget}
                    </div>
                    <div style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>Est. Budget</div>
                  </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "12px", lineHeight: "1.3" }}>
                    {project.title}
                  </h4>
                  <p style={{ 
                    fontSize: "14px", 
                    color: "rgba(226, 232, 240, 0.45)", 
                    lineHeight: "1.7", 
                    display: "-webkit-box", 
                    WebkitLineClamp: 3, 
                    WebkitBoxOrient: "vertical", 
                    overflow: "hidden",
                    marginBottom: "16px"
                  }}>
                    {project.description}
                  </p>

                  {/* Metadata Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    <div style={badgeStyle}>
                      <Target size={12} color="#22D3EE" />
                      <span>{project.displayExp || "Intermediate"}</span>
                    </div>
                    <div style={badgeStyle}>
                      <Clock size={12} color="#8B5CF6" />
                      <span>{project.displayWork || "Satu Kali"}</span>
                    </div>
                    <div style={badgeStyle}>
                      <Building2 size={12} color="#F59E0B" />
                      <span>{project.clientOb?.business_scale || "Enterprise"}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  marginTop: "8px",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)"
                }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {project.cleanSkills?.slice(0, 3).map((skill: string) => (
                      <span key={skill} style={{ 
                        fontSize: "11px", 
                        fontWeight: "700", 
                        color: "#10B981", 
                        background: "rgba(16, 185, 129, 0.06)", 
                        padding: "4px 12px", 
                        borderRadius: "8px",
                        border: "1px solid rgba(16, 185, 129, 0.1)"
                      }}>
                        #{skill}
                      </span>
                    ))}
                  </div>

                  {!isClient && (
                    <button 
                      onClick={() => router.push(`/dashboard/messages?chat=${project.client_id}&project=${project.id}`)}
                      className="cta-button"
                      style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 8px 20px rgba(77, 99, 255, 0.2)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <MessageSquare size={14} />
                      Hubungi
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", padding: "100px 40px", textAlign: "center", color: "rgba(226,232,240,0.2)", background: "rgba(255,255,255,0.01)", borderRadius: "32px", border: "2px dashed rgba(255,255,255,0.05)" }}>
              <Briefcase size={48} style={{ margin: "0 auto 20px", opacity: 0.3 }} />
              <p style={{ fontSize: "18px", fontWeight: "600" }}>
                {isClient ? "Belum ada proyek yang Anda publikasikan." : "Tidak ada proyek yang sesuai kriteria Anda saat ini."}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .futuristic-card { transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
        .futuristic-card:hover { 
          transform: translateY(-8px) scale(1.02); 
          background: rgba(18, 32, 60, 0.6) !important; 
          border-color: rgba(77, 99, 255, 0.3) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(77, 99, 255, 0.1);
        }
        .cta-button:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 25px rgba(77, 99, 255, 0.4);
        }
        .futuristic-card .card-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.05) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          border-radius: 24px;
        }
        .futuristic-card:hover .card-glow {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

const badgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "rgba(255, 255, 255, 0.03)",
  padding: "6px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  fontSize: "11px",
  fontWeight: "700",
  color: "rgba(226, 232, 240, 0.8)"
};
