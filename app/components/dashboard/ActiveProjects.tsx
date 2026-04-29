"use client";

import { motion } from "framer-motion";
import { MoreVertical, Users, Calendar, DollarSign } from "lucide-react";
import { useUser } from "../../dashboard/layout";

/**
 * Data dummy untuk daftar proyek yang sedang berjalan.
 */
const projects = [
  {
    id: 1,
    name: "E-Commerce Mobile App",
    freelancer: "Sarah Jenkins",
    progress: 75,
    budget: "Rp 12.5M",
    deadline: "May 15, 2026",
    status: "Aktif",
    statusColor: "var(--cyan)",
  },
  {
    id: 2,
    name: "Corporate Website Redesign",
    freelancer: "Aris Munandar",
    progress: 40,
    budget: "Rp 8.0M",
    deadline: "June 02, 2026",
    status: "Ditinjau",
    statusColor: "var(--warning)",
  },
  {
    id: 3,
    name: "Smart Contract Audit",
    freelancer: "David Chen",
    progress: 100,
    budget: "Rp 15.0M",
    deadline: "Apr 20, 2026",
    status: "Selesai",
    statusColor: "var(--accent)",
  },
];

/**
 * Komponen ActiveProjects menampilkan daftar proyek aktif dengan progress bar dan detail ringkas.
 */
export default function ActiveProjects() {
  const { role } = useUser();
  const isClient = role === "client";

  return (
    <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", width: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Proyek Aktif</h3>
        <button style={{ background: "transparent", border: "none", color: "rgba(226, 232, 240, 0.4)", cursor: "pointer", fontSize: "13px" }}>
          Lihat Semua
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ 
              y: -4,
              background: "rgba(255, 255, 255, 0.04)",
              borderColor: `${project.statusColor}50`,
              boxShadow: `0 12px 32px rgba(0,0,0,0.3), 0 0 16px ${project.statusColor}15`
            }}
            whileTap={{ 
              scale: 0.97,
              background: "rgba(255, 255, 255, 0.06)",
              transition: { duration: 0.1 }
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
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#E2E8F0", marginBottom: "4px" }}>{project.name}</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(226, 232, 240, 0.4)" }}>
                  <Users size={12} />
                  <span>{project.freelancer}</span>
                </div>
              </div>
              <div style={{ 
                padding: "4px 12px", 
                borderRadius: "8px", 
                fontSize: "10px", 
                fontWeight: "700", 
                textTransform: "uppercase",
                background: `${project.statusColor}15`,
                color: project.statusColor,
                border: `1px solid ${project.statusColor}30`,
                height: "fit-content",
                whiteSpace: "nowrap"
              }}>
                {project.status}
              </div>
            </div>

            {/* Bilah Kemajuan (Progress Bar) */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", fontWeight: "600" }}>
                <span style={{ color: "rgba(226, 232, 240, 0.5)" }}>Kemajuan</span>
                <span style={{ color: project.statusColor }}>{project.progress}%</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "3px", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${project.statusColor}, #06B6D4)`,
                    boxShadow: `0 0 10px ${project.statusColor}40`
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.04)", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(226, 232, 240, 0.4)" }}>
                  <Calendar size={12} />
                  <span style={{ whiteSpace: "nowrap" }}>{project.deadline}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(226, 232, 240, 0.4)" }}>
                  <DollarSign size={12} />
                  <span style={{ whiteSpace: "nowrap" }}>{project.budget}</span>
                </div>
              </div>
              {!isClient && (
                <button style={{ background: "transparent", border: "none", color: "rgba(226, 232, 240, 0.3)", cursor: "pointer" }}>
                  <MoreVertical size={16} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

