"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Calendar, DollarSign, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/app/dashboard/layout";
import { ONBOARDING_CATEGORIES, getLabelById } from "@/app/constants/onboarding-categories";
import { parseProjectDescription } from "@/app/lib/project-helper";

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

export default function RecommendedProjects() {
  const { user } = useUser();
  const router = useRouter();
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function loadRecommendations() {
      try {
        setLoading(true);

        // 1. Fetch market projects
        const res = await fetch("/api/projects/market");
        const json = await res.json();
        if (!json.data || json.data.length === 0) {
          setRecommended([]);
          return;
        }

        const marketProjects = json.data;

        // 2. Fetch current freelancer onboarding preferences
        const { data: prefs } = await supabase
          .from("onboarding_freelancer")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        const freelancerPref = prefs || null;

        // 3. Get already applied project source IDs to exclude them from recommendations
        const { data: appliedProjs } = await supabase
          .from("projects")
          .select("description")
          .eq("freelancer_id", user.id);

        const appliedProjectSourceIds = new Set<string>();
        if (appliedProjs) {
          appliedProjs.forEach((ap: any) => {
            const match = ap.description?.match(/\[source_id:([a-f0-9-]+)\]/);
            if (match && match[1]) {
              appliedProjectSourceIds.add(match[1]);
            }
          });
        }

        // 4. Fetch all client onboarding infos
        const { data: clientOnboardings } = await supabase.from("onboarding_client").select("*");

        // 5. Calculate scores
        const scored = marketProjects
          .filter((p: any) => !appliedProjectSourceIds.has(p.id)) // exclude applied
          .map((p: any) => {
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

            // Percentage conversion
            let matchPercent = 60;
            if (matchScore >= 100) matchPercent = 95;
            else if (matchScore >= 70) matchPercent = 88;
            else if (matchScore >= 40) matchPercent = 75;

            return {
              ...p,
              matchScore,
              matchPercent,
              clientOb,
              cleanSkills,
              parsed: parseProjectDescription(p.description)
            };
          });

        // Sort descending, take top 3 high-match items
        scored.sort((a: any, b: any) => b.matchScore - a.matchScore);
        setRecommended(scored.slice(0, 3));
      } catch (err) {
        console.error("Failed to load recommended projects:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={18} className="text-emerald" style={{ color: "#10B981" }} />
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>Recommended Projects</h3>
        </div>
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "14px" }}>
            <div style={{ width: "60%", height: "14px", background: "rgba(255,255,255,0.04)", borderRadius: "4px" }} />
            <div style={{ width: "40%", height: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
          </div>
        ))}
      </div>
    );
  }

  if (recommended.length === 0) {
    return null; // Don't show anything if no recommendations are found
  }

  return (
    <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", background: "rgba(16, 185, 129, 0.02)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
            <Sparkles size={16} />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>Rekomendasi Proyek Khusus Anda</h3>
        </div>
        <button 
          onClick={() => router.push("/dashboard/marketplace")}
          style={{ background: "none", border: "none", color: "#10B981", fontSize: "12px", fontWeight: "750", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
        >
          Lihat Semua <ArrowRight size={12} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {recommended.map((proj) => {
          const isHighMatch = proj.matchPercent >= 85;
          return (
            <div 
              key={proj.id}
              onClick={() => router.push(`/dashboard/marketplace/${proj.id}`)}
              style={{
                padding: "16px",
                background: "rgba(13, 22, 45, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                borderRadius: "16px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)";
                e.currentTarget.style.background = "rgba(13, 22, 45, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                e.currentTarget.style.background = "rgba(13, 22, 45, 0.3)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", margin: "0 0 4px 0" }}>{proj.title}</h4>
                  <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.35)" }}>oleh {proj.client?.full_name || "Klien"}</span>
                </div>
                
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "800",
                  background: isHighMatch ? "rgba(16,185,129,0.1)" : "rgba(6,182,212,0.1)",
                  color: isHighMatch ? "#10B981" : "#06B6D4",
                  border: `1px solid ${isHighMatch ? "rgba(16,185,129,0.15)" : "rgba(6,182,212,0.15)"}`
                }}>
                  {proj.matchPercent}% Match
                </span>
              </div>

              <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.45)", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "1.5" }}>
                {proj.parsed?.summary || proj.parsed?.description || "Tidak ada rincian proyek."}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "8px", marginTop: "4px" }}>
                <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "rgba(226,232,240,0.35)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <DollarSign size={12} style={{ color: "#00FFA3" }} />
                    <strong style={{ color: "#00FFA3" }}>{proj.budget}</strong>
                  </div>
                  {proj.parsed?.duration && (
                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <Clock size={12} />
                      <span>{proj.parsed.duration}</span>
                    </div>
                  )}
                </div>

                <span style={{ fontSize: "10px", fontWeight: "700", color: "#10B981", background: "rgba(16, 185, 129, 0.05)", padding: "3px 8px", borderRadius: "6px" }}>
                  {getLabelById(proj.category_id) || "Lainnya"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
