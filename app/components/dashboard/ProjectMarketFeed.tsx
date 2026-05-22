"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Loader2,
  Filter,
  Edit3,
  Trash2,
  Bookmark,
  Calendar,
  Clock,
  ChevronRight
} from "lucide-react";
import { useUser } from "../../dashboard/layout";
import { ONBOARDING_CATEGORIES, getLabelById } from "@/app/constants/onboarding-categories";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useContacts } from "@/lib/hooks/useContacts";
import { parseProjectDescription } from "@/app/lib/project-helper";
import Swal from "sweetalert2";

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
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "skills" | "saved">("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const isClient = role === "client";

  useEffect(() => {
    setFilterTab(role === "freelancer" ? "skills" : "all");
  }, [role]);

  // Load saved projects from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("freetrack_saved_projects");
    if (saved) {
      try { setSavedIds(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let nextSaved = [...savedIds];
    if (savedIds.includes(id)) {
      nextSaved = nextSaved.filter(item => item !== id);
      Swal.fire({ 
        title: "Dihapus!", 
        text: "Proyek dihapus dari daftar simpanan.", 
        icon: "info", 
        timer: 1200, 
        showConfirmButton: false, 
        background: "#0F1B2E", 
        color: "#fff" 
      });
    } else {
      nextSaved.push(id);
      Swal.fire({ 
        title: "Disimpan!", 
        text: "Proyek berhasil disimpan ke bookmark Anda.", 
        icon: "success", 
        timer: 1200, 
        showConfirmButton: false, 
        background: "#0F1B2E", 
        color: "#fff" 
      });
    }
    setSavedIds(nextSaved);
    localStorage.setItem("freetrack_saved_projects", JSON.stringify(nextSaved));
  };

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

              const freelancerCategoryIds: string[] = Array.from(new Set(
                freelancerSkillIds.map(sid => {
                  const match = findSkillAndCategory(sid);
                  return match?.categoryId ?? null;
                }).filter(Boolean) as string[]
              ));

              const categoryMatch = freelancerCategoryIds.includes(String(p.category_id || "").toLowerCase());
              if (categoryMatch) {
                matchScore += 50;
              }

              for (const skillLabel of cleanSkills) {
                const resolved = findSkillAndCategory(String(skillLabel));
                const skillMatchesFreelancer =
                  (resolved.skillId && freelancerSkillIds.includes(resolved.skillId.toLowerCase())) ||
                  (resolved.categoryId && freelancerCategoryIds.includes(resolved.categoryId.toLowerCase())) ||
                  freelancerSkillIds.includes(String(skillLabel).toLowerCase()) ||
                  freelancerCategoryIds.includes(String(skillLabel).toLowerCase());

                if (skillMatchesFreelancer) {
                  matchScore += 15;
                }
              }

              if (Array.isArray(freelancerPref.preferred_client_scales) && freelancerPref.preferred_client_scales.includes(clientOb.business_scale)) matchScore += 20;
              if (Array.isArray(freelancerPref.work_type_preference) && freelancerPref.work_type_preference.includes(effectiveWork)) matchScore += 20;
              if (freelancerPref.experience_level === effectiveExp) matchScore += 30;
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
              setFilterTab("all");
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

  const filteredProjects = isClient
    ? projects
    : filterTab === "skills"
      ? projects.filter(p => p.matchScore >= 50)
      : filterTab === "saved"
        ? projects.filter(p => savedIds.includes(p.id))
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
              onClick={() => setFilterTab("all")}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px",
                background: filterTab === "all" ? "rgba(16, 185, 129, 0.1)" : "transparent",
                border: "none",
                color: filterTab === "all" ? "#10B981" : "rgba(226, 232, 240, 0.6)",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Semua Proyek
            </button>
            <button 
              onClick={() => setFilterTab("skills")}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px",
                background: filterTab === "skills" ? "rgba(16, 185, 129, 0.1)" : "transparent",
                border: "none",
                color: filterTab === "skills" ? "#10B981" : "rgba(226, 232, 240, 0.6)",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <Filter size={14} />
              Sesuai Keahlian
            </button>
            <button 
              onClick={() => setFilterTab("saved")}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px",
                background: filterTab === "saved" ? "rgba(255, 191, 0, 0.1)" : "transparent",
                border: "none",
                color: filterTab === "saved" ? "#FFBF00" : "rgba(226, 232, 240, 0.6)",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <Bookmark size={14} fill={filterTab === "saved" ? "#FFBF00" : "none"} />
              Tersimpan ({savedIds.length})
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
            filteredProjects.map((project, idx) => {
              const parsed = parseProjectDescription(project.description);
              const isSaved = savedIds.includes(project.id);
              const formattedDate = new Date(project.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="futuristic-card"
                  onClick={() => router.push(`/dashboard/marketplace/${project.id}`)}
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
                      <div style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)" }}>
                        {parsed.budget_type === "hourly" ? "Hourly Rate" : "Est. Budget"}
                      </div>
                    </div>
                  </div>

                  {/* Body: Title, Client Name, Summary */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>{project.title}</h4>
                    <div style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.35)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      <span>oleh {project.client?.full_name || "Klien FreeTrack"}</span>
                      <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={11} /> {formattedDate}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.45)", lineHeight: "1.6", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                      {parsed.summary || parsed.description || "Tidak ada deskripsi singkat."}
                    </p>
                  </div>

                  {/* Meta Details: Duration / Deadline */}
                  {(parsed.duration || parsed.deadline || project.deadline) && (
                    <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "rgba(226, 232, 240, 0.4)" }}>
                      {parsed.duration && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Clock size={13} style={{ color: "#06B6D4" }} />
                          <span>{parsed.duration}</span>
                        </div>
                      )}
                      {(parsed.deadline || project.deadline) && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Calendar size={13} style={{ color: "#E11D48" }} />
                          <span>Sampai: {parsed.deadline || project.deadline}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer: Skills & CTAs */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "55%" }}>
                      {project.cleanSkills?.slice(0, 2).map((skill: string) => (
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
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {/* Bookmark Icon Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => toggleSave(e, project.id)}
                          style={{
                            width: "36px", height: "36px", borderRadius: "10px",
                            background: isSaved ? "rgba(255, 191, 0, 0.1)" : "rgba(255, 255, 255, 0.03)",
                            border: `1px solid ${isSaved ? "rgba(255, 191, 0, 0.25)" : "rgba(255, 255, 255, 0.08)"}`,
                            color: isSaved ? "#FFBF00" : "rgba(226, 232, 240, 0.6)",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.2s"
                          }}
                        >
                          <Bookmark size={15} fill={isSaved ? "#FFBF00" : "none"} />
                        </motion.button>

                        {project.hasApplied ? (
                          <button 
                            disabled
                            style={{
                              padding: "10px 18px", 
                              background: "rgba(16, 185, 129, 0.06)", 
                              color: "rgba(16, 185, 129, 0.7)",
                              border: "1px solid rgba(16, 185, 129, 0.18)", 
                              borderRadius: "12px", 
                              fontSize: "12px", 
                              fontWeight: "800", 
                              cursor: "not-allowed",
                              display: "flex", 
                              alignItems: "center", 
                              gap: "6px"
                            }}
                          >
                            Sudah Dilamar
                          </button>
                        ) : (
                          <button 
                            onClick={() => router.push(`/dashboard/marketplace/${project.id}`)}
                            className="cta-button"
                            style={{
                              padding: "10px 18px", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", color: "#fff",
                              border: "none", borderRadius: "12px", fontSize: "12px", fontWeight: "800", cursor: "pointer",
                              display: "flex", alignItems: "center", gap: "6px"
                            }}
                          >
                            Lihat Proyek <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
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
        .cta-button:hover { transform: scale(1.03); }
      `}</style>
    </div>
  );
}
