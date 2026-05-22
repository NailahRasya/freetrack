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
import { ONBOARDING_CATEGORIES, getLabelById, getCategoryIdBySkillId } from "@/app/constants/onboarding-categories";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useContacts } from "@/lib/hooks/useContacts";

function findSkillAndCategory(searchStr: string) {
  try {
    if (!searchStr) return { categoryId: null, skillId: null };
    const normalized = String(searchStr).toLowerCase().trim();
    if (typeof ONBOARDING_CATEGORIES === "undefined" || !ONBOARDING_CATEGORIES) {
      return { categoryId: null, skillId: null };
    }
    for (const cat of ONBOARDING_CATEGORIES) {
      if (!cat) continue;
      const catId = cat.id ? String(cat.id).toLowerCase() : "";
      const catLabel = cat.label ? String(cat.label).toLowerCase() : "";
      if (catId === normalized || catLabel === normalized) {
        return { categoryId: cat.id, skillId: null };
      }
      if (cat.skills && Array.isArray(cat.skills)) {
        for (const skill of cat.skills) {
          if (!skill) continue;
          const skillId = skill.id ? String(skill.id).toLowerCase() : "";
          const skillLabel = skill.label ? String(skill.label).toLowerCase() : "";
          if (skillId === normalized || skillLabel === normalized) {
            return { categoryId: cat.id, skillId: skill.id };
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in findSkillAndCategory:", err);
  }
  return { categoryId: null, skillId: null };
}

export default function ProjectMarketFeed({ onEdit, onDelete }: { onEdit?: (p: any) => void, onDelete?: (id: string) => void }) {
  const { user, role } = useUser();
  const router = useRouter();
  const { ensureContact } = useContacts();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(role === "freelancer");

  const isClient = role === "client";

  useEffect(() => {
    setFilterActive(role === "freelancer");
  }, [role]);

  useEffect(() => {
    async function fetchMarket() {
      try {
        setLoading(true);
        const res = await fetch("/api/projects/market");
        const json = await res.json();
        
        if (json.data) {
          let marketProjects = json.data;

          let freelancerPref: any = null;
          let appliedProjectSourceIds = new Set<string>();
          if (!isClient && user?.id) {
            const { data: prefs } = await supabase
              .from("onboarding_freelancer")
              .select("*")
              .eq("user_id", user.id);
            freelancerPref = prefs && prefs.length > 0 ? prefs[0] : null;
            console.log("🔍 [Marketplace] freelancerPref:", JSON.stringify(freelancerPref));

            const { data: appliedProjs } = await supabase
              .from("projects")
              .select("description")
              .eq("freelancer_id", user.id);
            if (appliedProjs) {
              appliedProjs.forEach((ap: any) => {
                const match = ap.description?.match(/\[source_id:([a-f0-9-]+)\]/);
                if (match && match[1]) {
                  appliedProjectSourceIds.add(match[1]);
                }
              });
            }
          }

          const { data: clientOnboardings } = await supabase.from("onboarding_client").select("*");

          const processed = marketProjects.map((p: any) => {
            const clientOb = clientOnboardings?.find(ob => ob.user_id === p.client_id) || {};
            const cleanSkills = p.required_skills?.filter((s: string) => s && !s.startsWith("EXP:") && !s.startsWith("WORK:")) || [];
            
            const embeddedExp = p.required_skills?.find((s: string) => s && s.startsWith("EXP:"))?.replace("EXP:", "");
            const embeddedWork = p.required_skills?.find((s: string) => s && s.startsWith("WORK:"))?.replace("WORK:", "");
            
            const effectiveExp = embeddedExp || clientOb.experience_preference;
            const effectiveWork = embeddedWork || clientOb.work_type;

            let matchScore = 0;
            if (freelancerPref) {
              const freelancerSkillIds: string[] = Array.isArray(freelancerPref.skill_categories)
                ? freelancerPref.skill_categories.filter(Boolean).map((s: string) => String(s).toLowerCase())
                : [];

              // Resolve each freelancer skill ID to its parent category ID
              const freelancerCategoryIds: string[] = Array.from(new Set(
                freelancerSkillIds.map(sid => {
                  const match = findSkillAndCategory(sid);
                  return match?.categoryId ?? null;
                }).filter(Boolean) as string[]
              ));

              console.log(`🔍 [Marketplace] Project "${p.title}" | category_id: "${p.category_id}" | required_skills:`, cleanSkills);
              console.log(`🔍 [Marketplace] Freelancer skill IDs: [${freelancerSkillIds.join(", ")}] → categories: [${freelancerCategoryIds.join(", ")}]`);

              // ✅ Match 1: Project category matches any freelancer's resolved category
              const categoryMatch = freelancerCategoryIds.includes(String(p.category_id || "").toLowerCase());
              if (categoryMatch) {
                matchScore += 50;
                console.log(`  ✅ Category match! +50`);
              }

              // ✅ Match 2: Any required skill of the project matches freelancer's skills
              for (const skillLabel of cleanSkills) {
                const resolved = findSkillAndCategory(String(skillLabel));
                const skillMatchesFreelancer =
                  // skill ID matches a freelancer skill ID directly
                  (resolved.skillId && freelancerSkillIds.includes(resolved.skillId.toLowerCase())) ||
                  // skill's parent category matches a freelancer category
                  (resolved.categoryId && freelancerCategoryIds.includes(resolved.categoryId.toLowerCase())) ||
                  // raw label matches a freelancer skill ID or category ID
                  freelancerSkillIds.includes(String(skillLabel).toLowerCase()) ||
                  freelancerCategoryIds.includes(String(skillLabel).toLowerCase());

                if (skillMatchesFreelancer) {
                  matchScore += 15;
                  console.log(`  ✅ Skill match: "${skillLabel}" → +15`);
                }
              }

              // ✅ Match 3: Work type / scale / exp level bonus points
              if (Array.isArray(freelancerPref.preferred_client_scales) && freelancerPref.preferred_client_scales.includes(clientOb.business_scale)) matchScore += 20;
              if (Array.isArray(freelancerPref.work_type_preference) && freelancerPref.work_type_preference.includes(effectiveWork)) matchScore += 20;
              if (freelancerPref.experience_level === effectiveExp) matchScore += 30;

              console.log(`  📊 Final matchScore for "${p.title}": ${matchScore}`);
            }

            return { 
              ...p, 
              clientOb, 
              matchScore, 
              cleanSkills,
              hasApplied: appliedProjectSourceIds.has(p.id),
              displayExp: effectiveExp === 'mid' ? 'Intermediate' : (effectiveExp === 'senior' ? 'Expert' : (effectiveExp === 'junior' ? 'Junior' : effectiveExp)),
              displayWork: effectiveWork === 'ongoing' ? 'Berkelanjutan' : 'Satu Kali'
            };
          });

          if (!isClient) processed.sort((a: any, b: any) => b.matchScore - a.matchScore);

          if (isClient) {
            const draftRes = await fetch("/api/projects");
            const draftJson = await draftRes.json();
            const myDrafts = (draftJson.data || []).filter((p: any) => p.status === "draft");
            const myPublished = processed.filter((p: any) => p.client_id === user?.id);
            const allProjects = [...myDrafts, ...myPublished];
            const uniqueProjects = Array.from(new Map(allProjects.map(p => [p.id, p])).values());
            setProjects(uniqueProjects);
          } else {
            setProjects(processed);
            const hasMatch = processed.some((p: any) => p.matchScore >= 50);
            if (!hasMatch) {
              setFilterActive(false);
            }
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
    ? projects.filter(p => p.matchScore >= 50)
    : projects;

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "60px", textAlign: "center", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={32} style={{ margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Memuat marketplace...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
        {!isClient && (
          <div style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "4px",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            <button 
              onClick={() => setFilterActive(false)}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px",
                background: !filterActive ? "rgba(16, 185, 129, 0.1)" : "transparent",
                border: "none",
                color: !filterActive ? "#10B981" : "rgba(226, 232, 240, 0.6)",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Semua Proyek
            </button>
            <button 
              onClick={() => setFilterActive(true)}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px",
                background: filterActive ? "rgba(16, 185, 129, 0.1)" : "transparent",
                border: "none",
                color: filterActive ? "#10B981" : "rgba(226, 232, 240, 0.6)",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <Filter size={14} />
              Sesuai Keahlian
            </button>
          </div>
        )}
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", 
        gap: "24px" 
      }}>
        <AnimatePresence mode="popLayout">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="futuristic-card"
                style={{
                  padding: "28px", background: "rgba(13, 25, 48, 0.4)", backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px",
                  display: "flex", flexDirection: "column", gap: "20px", position: "relative",
                  cursor: "pointer"
                }}
              >
                 {/* Bagian Atas: Kategori & Aksi (Client) atau Budget */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ padding: "6px 12px", background: "rgba(77, 99, 255, 0.08)", borderRadius: "8px", color: "#4D63FF", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}>
                      {getLabelById(project.category_id) || "Design"}
                    </div>
                    
                    {isClient && (
                      <div style={{ 
                        display: "flex", 
                        gap: "4px", 
                        background: "rgba(255, 255, 255, 0.03)", 
                        padding: "4px", 
                        borderRadius: "10px", 
                        border: "1px solid rgba(255, 255, 255, 0.05)"
                      }}>
                        <motion.button 
                          whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.05)" }} 
                          onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(project); }} 
                          style={{ width: "24px", height: "24px", borderRadius: "6px", background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Edit3 size={12} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1, background: "rgba(239,68,68,0.1)" }} 
                          onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(project.id); }} 
                          style={{ width: "24px", height: "24px", borderRadius: "6px", background: "transparent", border: "none", color: "rgba(239, 68, 68, 0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={12} />
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: "900", color: "#00FFA3" }}>{project.budget}</div>
                    <div style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)" }}>Est. Budget</div>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "12px" }}>{project.title}</h4>
                  <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.45)", lineHeight: "1.7", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {project.description}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "60%" }}>
                    {project.cleanSkills?.slice(0, 3).map((skill: string) => (
                      <span key={skill} style={{ 
                        fontSize: "10px", 
                        fontWeight: "700", 
                        color: "#10B981", 
                        background: "rgba(16, 185, 129, 0.05)", 
                        padding: "5px 10px", 
                        borderRadius: "8px",
                        whiteSpace: "nowrap",
                        border: "1px solid rgba(16, 185, 129, 0.1)"
                      }}>
                        #{skill}
                      </span>
                    ))}
                  </div>

                  {!isClient && (
                    project.hasApplied ? (
                      <button 
                        disabled
                        style={{
                          padding: "10px 20px", 
                          background: "rgba(16, 185, 129, 0.06)", 
                          color: "rgba(16, 185, 129, 0.7)",
                          border: "1px solid rgba(16, 185, 129, 0.18)", 
                          borderRadius: "12px", 
                          fontSize: "12px", 
                          fontWeight: "800", 
                          cursor: "not-allowed",
                          display: "flex", 
                          alignItems: "center", 
                          gap: "8px"
                        }}
                      >
                        Sudah Dilamar
                      </button>
                    ) : (
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await ensureContact(project.client_id);
                            router.push(`/dashboard/messages?chat=${project.client_id}&project=${project.id}`);
                          } catch (err) {
                            router.push(`/dashboard/messages?chat=${project.client_id}&project=${project.id}`);
                          }
                        }}
                        className="cta-button"
                        style={{
                          padding: "10px 20px", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", color: "#fff",
                          border: "none", borderRadius: "12px", fontSize: "12px", fontWeight: "800", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: "8px"
                        }}
                      >
                        <MessageSquare size={14} /> Hubungi
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", padding: "100px 40px", textAlign: "center", color: "rgba(226,232,240,0.2)" }}>
              <Briefcase size={48} style={{ margin: "0 auto 20px", opacity: 0.3 }} />
              <p>Belum ada proyek tersedia.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .futuristic-card:hover { transform: translateY(-5px); background: rgba(18, 32, 60, 0.6) !important; border-color: rgba(77, 99, 255, 0.3) !important; }
        .cta-button:hover { transform: scale(1.05); }
      `}</style>
    </div>
  );
}
