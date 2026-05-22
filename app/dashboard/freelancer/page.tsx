"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FreelancerStatsCards from "../../components/dashboard/freelancer/FreelancerStatsCards";
import MilestoneManager from "../../components/dashboard/freelancer/MilestoneManager";
import ChangeRequestModal from "../../components/dashboard/freelancer/ChangeRequestModal";
import PaymentTracker from "../../components/dashboard/PaymentTracker";
import MessagesPreview from "../../components/dashboard/MessagesPreview";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import ProgressTrackerCard from "../../components/dashboard/ProgressTrackerCard";
import ProjectMarketFeed from "../../components/dashboard/ProjectMarketFeed";
import { useUser } from "../layout";

import OnboardingWelcomeBanner from "../../components/dashboard/OnboardingWelcomeBanner";
import { supabase } from "@/lib/supabase";
import FreelancerReviewsCard from "../../components/dashboard/freelancer/FreelancerReviewsCard";
import { Star } from "lucide-react";

export default function FreelancerDashboardPage() {
  const { user } = useUser();
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ratingData, setRatingData] = useState({
    averageRating: 0,
    totalReviews: 0
  });

  useEffect(() => {
    if (!user?.id) return;
    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/reviews?freelancerId=${user.id}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const sum = json.data.reduce((acc: number, r: any) => acc + r.rating, 0);
          setRatingData({
            averageRating: Math.round((sum / json.data.length) * 10) / 10,
            totalReviews: json.data.length
          });
        }
      } catch (err) {
        console.error("Failed to fetch rating data in dashboard:", err);
      }
    };
    fetchRating();
  }, [user?.id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [progressData, setProgressData] = useState({
    percentage: 0,
    completedCount: 0,
    totalCount: 0,
    nextMilestone: ""
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchProgress = async () => {
      // 1. Get the latest active project
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("freelancer_id", user.id)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (project) {
        // 2. Get milestones for this project
        const { data: milestones } = await supabase
          .from("milestones")
          .select("title, status")
          .eq("project_id", project.id)
          .order("created_at", { ascending: true });

        if (milestones && milestones.length > 0) {
          const total = milestones.length;
          const completed = milestones.filter(m => ["Approved", "Disetujui", "Completed"].includes(m.status)).length;
          const next = milestones.find(m => !["Approved", "Disetujui", "Completed"].includes(m.status))?.title || "";
          
          setProgressData({
            percentage: Math.round((completed / total) * 100),
            completedCount: completed,
            totalCount: total,
            nextMilestone: next
          });
        }
      }
    };

    fetchProgress();
  }, [user?.id]);

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Onboarding Welcome Banner */}
      <OnboardingWelcomeBanner role="freelancer" />

      {/* Bagian Header */}
      <header>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
            <h1 style={{ 
              fontSize: "28px", 
              fontWeight: "900", 
              color: "#fff", 
              letterSpacing: "-0.5px",
              margin: 0
            }}>
              Selamat datang kembali, <span className="gradient-text-emerald">{user?.profile?.full_name || "Freelancer"}</span>
            </h1>
            {ratingData.totalReviews > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255, 215, 0, 0.08)",
                  border: "1px solid rgba(255, 215, 0, 0.2)",
                  borderRadius: "12px",
                  padding: "5px 12px",
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#FFD700"
                }}
              >
                <Star size={13} fill="#FFD700" color="#FFD700" />
                {ratingData.averageRating.toFixed(1)} ({ratingData.totalReviews} Ulasan)
              </motion.div>
            )}
          </div>
          <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "15px" }}>
            Berikut adalah apa yang terjadi di ruang kerja pribadi Anda hari ini.
          </p>
        </motion.div>
      </header>

      {/* Statistik Ringkasan */}
      <FreelancerStatsCards />

      {/* Progres & Payment Side-by-Side (50/50) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "32px",
        width: "100%"
      }}>
        <ProgressTrackerCard 
          percentage={progressData.percentage}
          completedCount={progressData.completedCount}
          totalCount={progressData.totalCount}
          nextMilestone={progressData.nextMilestone}
          variant="compact"
        />
        <PaymentTracker />
      </div>

      {/* Layout Grid Utama */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)", 
        gap: "32px",
        alignItems: "stretch", 
        width: "100%"
      }}>
        {/* Kolom Kiri */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>
          <ProjectMarketFeed />
          <MilestoneManager />
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "32px" 
          }}>
            <MessagesPreview />
            <ActivityTimeline />
          </div>
        </div>

        {/* Kolom Kanan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>
          
          {/* Aksi Cepat / Kontrol Scope Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{
              padding: "24px",
              background: "var(--gradient-emerald)",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              border: "none",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            {/* Overlay Bentuk Abstrak */}
            <div style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "150px",
              height: "150px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              filter: "blur(40px)"
            }} />

            <div style={{ zIndex: 1 }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>Scope Creep Terdeteksi?</h3>
              <p style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5", marginBottom: "16px" }}>
                Jika klien meminta fitur tambahan di luar kontrak asli, Anda dapat mengajukan Permintaan Perubahan untuk memperbarui anggaran atau lini masa.
              </p>
              <button 
                onClick={() => setIsChangeRequestOpen(true)}
                style={{ 
                  background: "#fff", 
                  color: "var(--accent)", 
                  border: "none", 
                  padding: "10px 20px", 
                  borderRadius: "10px", 
                  fontWeight: "700", 
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                Ajukan Permintaan Perubahan
              </button>
            </div>
          </motion.div>

          {/* Widget Reputasi & Ulasan Klien */}
          {user?.id && <FreelancerReviewsCard freelancerId={user.id} />}
        </div>
      </div>

      <ChangeRequestModal 
        isOpen={isChangeRequestOpen} 
        onClose={() => setIsChangeRequestOpen(false)} 
      />

      {/* Gaya kustom untuk penyesuaian grid pada layar kecil */}
      <style jsx>{`
        @media (max-width: 1200px) {
          div[style*="gridTemplateColumns: minmax(0, 7fr) minmax(0, 5fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
