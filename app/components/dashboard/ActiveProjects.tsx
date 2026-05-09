"use client";

import { motion } from "framer-motion";
import { MoreVertical, Users, Calendar, DollarSign, Loader2, Briefcase } from "lucide-react";
import { useUser } from "../../dashboard/layout";
import { useProjects } from "@/lib/hooks/useProjects";
import Link from "next/link";

const STATUS_COLOR: Record<string, string> = {
  draft: "#7C3AED", pending_client: "#F59E0B",
  active: "#00E5FF", review: "#F59E0B",
  completed: "#00FFA3", rejected: "#FF4D6A",
  published: "#4D63FF",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Draf", pending_client: "Menunggu Klien",
  active: "Aktif", review: "Tinjauan",
  completed: "Selesai", rejected: "Ditolak",
  published: "Dipublikasikan",
};

export default function ActiveProjects() {
  const { role } = useUser();
  const { projects, loading } = useProjects();
  const isClient = role === "client";

  // Filter untuk menampilkan hanya proyek yang butuh perhatian (Active, Review, Pending Client, Published, atau Draft)
  const activeProjects = projects
    .filter(p => ["active", "review", "pending_client", "published", "draft"].includes(p.status))
    .slice(0, 3); // Hanya tampilkan 3 teratas di dashboard

  if (loading) return (
    <div className="glass-card" style={{ padding: "40px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", color: "rgba(226,232,240,0.4)" }}>
      <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
      <span>Memuat proyek...</span>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", width: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Proyek Berjalan</h3>
        <Link href="/dashboard/projects" style={{ background: "transparent", border: "none", color: "var(--cyan)", cursor: "pointer", fontSize: "13px", textDecoration: "none", fontWeight: "600" }}>
          Lihat Semua
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {activeProjects.length > 0 ? (
          activeProjects.map((project, idx) => {
            const color = STATUS_COLOR[project.status] || "#666";
            const label = STATUS_LABEL[project.status] || project.status;
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ 
                  y: -4,
                  background: "rgba(255, 255, 255, 0.04)",
                  borderColor: `${color}50`,
                  boxShadow: `0 12px 32px rgba(0,0,0,0.3), 0 0 16px ${color}15`
                }}
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  background: "rgba(255, 255, 255, 0.01)",
                  cursor: "pointer",
                  minWidth: 0
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "150px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#E2E8F0", marginBottom: "4px" }}>{project.title}</h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(226, 232, 240, 0.4)" }}>
                      <Users size={12} />
                      <span>{isClient ? (project.freelancer?.full_name ?? "-") : (project.client?.full_name ?? "-")}</span>
                    </div>
                  </div>
                  <div style={{ 
                    padding: "4px 12px", 
                    borderRadius: "8px", 
                    fontSize: "10px", 
                    fontWeight: "700", 
                    textTransform: "uppercase",
                    background: `${color}15`,
                    color: color,
                    border: `1px solid ${color}30`,
                    height: "fit-content",
                    whiteSpace: "nowrap"
                  }}>
                    {label}
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", fontWeight: "600" }}>
                    <span style={{ color: "rgba(226, 232, 240, 0.5)" }}>Kemajuan</span>
                    <span style={{ color: color }}>{project.progress}%</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{
                        height: "100%",
                        background: `linear-gradient(90deg, ${color}, #06B6D4)`,
                        boxShadow: `0 0 10px ${color}40`
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.04)", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(226, 232, 240, 0.4)" }}>
                      <Calendar size={12} />
                      <span style={{ whiteSpace: "nowrap" }}>{project.deadline ?? "-"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(226, 232, 240, 0.4)" }}>
                      <span style={{ fontSize: "11px", fontWeight: "900", color: "rgba(226, 232, 240, 0.3)" }}>Rp</span>
                      <span style={{ whiteSpace: "nowrap" }}>{project.budget ?? "-"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(226,232,240,0.2)" }}>
            <Briefcase size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <p style={{ fontSize: "14px" }}>Tidak ada proyek aktif saat ini</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
