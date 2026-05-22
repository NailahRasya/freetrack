"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Star, Zap, ArrowRight, ShieldCheck, Search, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "../../dashboard/layout";
import { useContacts } from "@/lib/hooks/useContacts";
import { useRouter } from "next/navigation";

export default function RecommendedFreelancers() {
  const { user } = useUser();
  const router = useRouter();
  const { ensureContact } = useContacts();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchRecommendations() {
      try {
        const { data: clientPrefList } = await supabase
          .from("onboarding_client")
          .select("*")
          .eq("user_id", user.id);
        
        const clientPref = clientPrefList && clientPrefList.length > 0 ? clientPrefList[0] : null;

        if (!clientPref) {
          setLoading(false);
          return;
        }

        const { data: freelancers, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "freelancer");

        if (profilesError) throw profilesError;

        const { data: allOnboarding, error: onboardingError } = await supabase
          .from("onboarding_freelancer")
          .select("*");

        if (onboardingError) throw onboardingError;

        const { data: allReviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("freelancer_id, rating");

        if (reviewsError) throw reviewsError;

        const ratingMap: Record<string, { totalRating: number, count: number }> = {};
        if (allReviews) {
          allReviews.forEach((r: any) => {
            if (!r.freelancer_id) return;
            if (!ratingMap[r.freelancer_id]) {
              ratingMap[r.freelancer_id] = { totalRating: 0, count: 0 };
            }
            ratingMap[r.freelancer_id].totalRating += r.rating;
            ratingMap[r.freelancer_id].count += 1;
          });
        }

        const matched = freelancers.map((f: any) => {
          let score = 10;
          const ob = allOnboarding?.find(o => o.user_id === f.id) || {};
          
          if (ob.experience_level && ob.experience_level === clientPref.experience_preference) score += 40;
          if (ob.work_type_preference?.includes(clientPref.work_type)) score += 30;
          if (ob.preferred_client_scales?.includes(clientPref.business_scale)) score += 20;

          const clientSkills = clientPref.required_skills || [];
          const freelancerTools = ob.tools || [];
          const freelancerSkills = f.skills || [];

          const skillOverlap = clientSkills.filter((s: string) => freelancerTools.includes(s) || freelancerSkills.includes(s)).length;
          score += (skillOverlap * 15);

          const ratingInfo = ratingMap[f.id] || { totalRating: 0, count: 0 };
          const averageRating = ratingInfo.count > 0 ? ratingInfo.totalRating / ratingInfo.count : 0;

          return { 
            ...f, 
            score, 
            ob,
            displayExp: (ob.experience_level || "Junior").toUpperCase(),
            yearsExp: ob.years_of_experience || 1,
            average_rating: averageRating,
            total_reviews: ratingInfo.count
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
            Berdasarkan kriteria proyek dan preferensi Anda.
          </p>
        </div>
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
              position: "relative"
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
                <p style={{ fontSize: "11px", color: "#10B981", fontWeight: "800", textTransform: "uppercase", marginTop: "4px" }}>
                  {freelancer.displayExp} • {freelancer.yearsExp} Thn Exp
                </p>
                {freelancer.average_rating && freelancer.average_rating > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <Star size={12} fill="#FFD700" color="#FFD700" />
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#FFD700" }}>{freelancer.average_rating.toFixed(1)}</span>
                    <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.4)" }}>({freelancer.total_reviews} ulasan)</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <Star size={12} color="rgba(255,255,255,0.15)" />
                    <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)", fontWeight: "600" }}>Baru / Belum ada ulasan</span>
                  </div>
                )}
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

            <button 
              onClick={async () => {
                try {
                  await ensureContact(freelancer.id);
                  router.push(`/dashboard/messages?chat=${freelancer.id}`);
                } catch (err) {
                  router.push(`/dashboard/messages?chat=${freelancer.id}`);
                }
              }}
              style={{ 
                width: "100%", 
                padding: "10px", 
                borderRadius: "10px", 
                background: "linear-gradient(135deg, #4D63FF, #06B6D4)", 
                border: "none",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <MessageSquare size={14} /> Mulai Diskusi
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
