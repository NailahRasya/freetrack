"use client";

import { motion } from "framer-motion";
import { Briefcase, DollarSign, Flag, Clock, TrendingUp, Loader2 } from "lucide-react";
import { useProjects } from "@/lib/hooks/useProjects";

export default function StatsCards() {
  const { projects, loading } = useProjects();

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="glass-card" style={{ padding: "24px", height: "140px", background: "rgba(15, 27, 46, 0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "rgba(226,232,240,0.1)" }} />
        </div>
      ))}
    </div>
  );

  const activeCount = projects.filter(p => p.status === "active").length;
  const pendingCount = projects.filter(p => p.status === "pending_client").length;
  const completedCount = projects.filter(p => p.status === "completed").length;

  const stats = [
    {
      label: "Proyek Aktif",
      value: String(activeCount),
      change: "Berjalan saat ini",
      icon: Briefcase,
      color: "#00E5FF",
      gradient: "linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(0, 229, 255, 0) 100%)",
    },
    {
      label: "Menunggu Persetujuan",
      value: String(pendingCount),
      change: "Butuh konfirmasi Anda",
      icon: Clock,
      color: "#F59E0B",
      gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 100%)",
    },
    {
      label: "Proyek Selesai",
      value: String(completedCount),
      change: "Total proyek sukses",
      icon: CheckCircle2Icon, // Wait, I need to check if I have this icon
      color: "#00FFA3",
      gradient: "linear-gradient(135deg, rgba(0, 255, 163, 0.15) 0%, rgba(0, 255, 163, 0) 100%)",
    },
    {
      label: "Total Proyek",
      value: String(projects.length),
      change: "Keseluruhan riwayat",
      icon: Flag,
      color: "#4D63FF",
      gradient: "linear-gradient(135deg, rgba(77, 99, 255, 0.2) 0%, rgba(77, 99, 255, 0) 100%)",
    },
  ];

  // Map icons safely
  const icons = { Briefcase, Clock, Flag, Check: Flag };

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
      gap: "20px",
      marginBottom: "32px",
      width: "100%"
    }}>
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -6, borderColor: `${stat.color}60` }}
          className="glass-card"
          style={{
            padding: "24px",
            background: "rgba(15, 27, 46, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex",
            flexDirection: "column",
            minWidth: 0
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
              color: stat.color, border: `1px solid ${stat.color}30`,
            }}>
              <stat.icon size={22} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: "#fff", marginBottom: "4px" }}>
            {stat.value}
          </div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "rgba(226, 232, 240, 0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {stat.label}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)", marginTop: "12px" }}>
            {stat.change}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Simple internal icon for CheckCircle if lucide fails or just use Flag
function CheckCircle2Icon({ size }: { size: number }) {
  return <Flag size={size} />;
}
