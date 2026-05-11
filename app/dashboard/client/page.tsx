"use client";

import { motion } from "framer-motion";
import StatsCards from "../../components/dashboard/StatsCards";
import ProjectMarketFeed from "../../components/dashboard/ProjectMarketFeed";
import ActiveProjects from "../../components/dashboard/ActiveProjects";
import PaymentTracker from "../../components/dashboard/PaymentTracker";
import MessagesPreview from "../../components/dashboard/MessagesPreview";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import { useUser } from "../layout";

import OnboardingWelcomeBanner from "../../components/dashboard/OnboardingWelcomeBanner";
import RecommendedFreelancers from "../../components/dashboard/RecommendedFreelancers";
import ProgressTrackerCard from "../../components/dashboard/ProgressTrackerCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

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
        .eq("client_id", user.id)
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
      <OnboardingWelcomeBanner role="client" />

      {/* Bagian Header */}
      <header>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ 
            fontSize: "28px", 
            fontWeight: "900", 
            color: "#fff", 
            letterSpacing: "-0.5px",
            marginBottom: "8px"
          }}>
            Selamat datang kembali, <span className="gradient-text">{user?.profile?.full_name || "Client"}</span>
          </h1>
          <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "15px" }}>
            Berikut adalah apa yang terjadi dengan proyek Anda hari ini.
          </p>
        </motion.div>
      </header>

      {/* Ringkasan Statistik (Stats Overview) */}
      <StatsCards />

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

      {/* Rekomendasi Freelancer (Berdasarkan Onboarding) */}
      <RecommendedFreelancers />

      {/* Project Market Feed (Postingan Saya) */}
      <ProjectMarketFeed />

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
          <ActiveProjects />
          
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
          
        </div>
      </div>

      {/* Gaya kustom untuk penyesuaian grid pada layar kecil */}
      <style jsx>{`
        @media (max-width: 1200px) {
          div[style*="gridTemplateColumns: 1.8fr 1.2fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

