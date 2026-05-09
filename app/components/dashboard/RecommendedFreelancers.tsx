"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Star, Zap, ArrowRight, ShieldCheck, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "../../dashboard/layout";

export default function RecommendedFreelancers() {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchRecommendations() {
      try {
        // 1. Ambil preferensi client
        const { data: clientPref } = await supabase
          .from("onboarding_client")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!clientPref) {
          setLoading(false);
          return;
        }

        // 2. Ambil semua freelancer
        const { data: freelancers, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "freelancer");

        if (profilesError) throw profilesError;

        // 3. Ambil data onboarding freelancer
        const { data: allOnboarding, error: onboardingError } = await supabase
          .from("onboarding_freelancer")
          .select("*");

        if (onboardingError) throw onboardingError;

        // 4. Logika Matching (Scoring)
        const matched = freelancers.map((f: any) => {
          let score = 10;
          const ob = allOnboarding?.find(o => o.user_id === f.id) || {};
          
          // Match Exp Level
          if (ob.experience_level && ob.experience_level === clientPref.experience_preference) score += 40;
          
          // Match Work Type
          if (ob.work_type_preference?.includes(clientPref.work_type)) score += 30;

          // Match Business Scale
          if (ob.preferred_client_scales?.includes(clientPref.business_scale)) score += 20;

          // Match Tech Stack
          const clientSkills = clientPref.required_skills || [];
          const clientCats = clientPref.project_categories || [];
          const freelancerTools = ob.tools || [];
          const freelancerSkills = f.skills || [];

          const skillOverlap = clientSkills.filter((s: string) => freelancerTools.includes(s) || freelancerSkills.includes(s)).length;
          const catOverlap = clientCats.filter((c: string) => freelancerSkills.includes(c)).length;
          
          score += (skillOverlap * 15) + (catOverlap * 10);

          return { 
            ...f, 
            score, 
            ob,
            displayExp: (ob.experience_level || "Junior").toUpperCase(),
            yearsExp: ob.years_of_experience || 1
          };
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 4);

        setRecommendations(matched);
      } catch (err: any) {
        console.error("Error fetching recommended freelancers:", err.message || err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [user?.id]);

  if (loading) return null;
  if (recommendations.length === 0) return null;

  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Zap size={20} color="#FFD700" fill="#FFD700" />
            Rekomendasi Freelancer Untuk Anda
          </h3>
          <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", marginTop: "4px" }}>
            Berdasarkan kriteria {recommendations[0].displayExp} & {recommendations[0].ob?.preferred_client_scales?.includes('startup') ? 'Startup' : 'Bisnis'} Anda.
          </p>
        </div>
        <button style={{ 
          fontSize: "13px", 
          color: "var(--cyan)", 
          background: "none", 
          border: "none", 
          cursor: "pointer",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          Lihat Semua <ArrowRight size={14} />
        </button>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "20px" 
      }}>
        {recommendations.map((freelancer, idx) => (
          <motion.div
            key={freelancer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card"
            style={{ 
              padding: "20px", 
              background: "rgba(15, 27, 46, 0.4)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ 
                width: "56px", 
                height: "56px", 
                borderRadius: "16px", 
                background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "800",
                color: "#fff"
              }}>
                {freelancer.full_name?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>{freelancer.full_name}</h4>
                  <ShieldCheck size={14} color="#00FFA3" />
                </div>
                <p style={{ fontSize: "11px", color: "#10B981", fontWeight: "800", textTransform: "uppercase", marginTop: "4px", letterSpacing: "0.5px" }}>
                  {freelancer.displayExp} • {freelancer.yearsExp} Thn Exp
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
              {(freelancer.ob?.tools || freelancer.skills || []).slice(0, 3).map((tool: string) => (
                <span key={tool} style={{ 
                  fontSize: "10px", 
                  padding: "4px 8px", 
                  borderRadius: "6px", 
                  background: "rgba(255,255,255,0.05)", 
                  color: "rgba(226, 232, 240, 0.7)",
                  border: "1px solid rgba(255,255,255,0.08)"
                }}>
                  {tool}
                </span>
              ))}
            </div>

            <button style={{ 
              width: "100%", 
              padding: "10px", 
              borderRadius: "10px", 
              background: "rgba(77, 99, 255, 0.1)", 
              border: "1px solid rgba(77, 99, 255, 0.2)",
              color: "#4D63FF",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s"
            }}>
              Mulai Diskusi
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
