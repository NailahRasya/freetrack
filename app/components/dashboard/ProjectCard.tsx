"use client";

import { motion } from "framer-motion";
import { MoreVertical, Users, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { useUser } from "../../dashboard/layout";

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    freelancer: string;
    progress: number;
    budget: string;
    deadline: string;
    status: string;
    statusColor: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { role } = useUser();
  const isClient = role === "client";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, borderColor: `${project.statusColor}40` }}
      className="glass-card"
      style={{
        padding: "24px",
        background: "rgba(15, 27, 46, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "20px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.3s ease"
      }}
    >
      {/* Background Glow */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-10%",
        width: "120px",
        height: "120px",
        background: project.statusColor,
        filter: "blur(60px)",
        opacity: 0.05,
        pointerEvents: "none"
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            fontSize: "17px", 
            fontWeight: "800", 
            color: "#fff", 
            marginBottom: "6px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {project.name}
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(226, 232, 240, 0.4)", fontSize: "13px" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={12} />
            </div>
            <span>{project.freelancer}</span>
          </div>
        </div>
        <div style={{ 
          padding: "5px 12px", 
          borderRadius: "8px", 
          fontSize: "11px", 
          fontWeight: "800", 
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          background: `${project.statusColor}15`,
          color: project.statusColor,
          border: `1px solid ${project.statusColor}30`,
          whiteSpace: "nowrap"
        }}>
          {project.status}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", fontWeight: "700" }}>
          <span style={{ color: "rgba(226, 232, 240, 0.4)" }}>Milestones</span>
          <span style={{ color: project.statusColor }}>{project.progress}%</span>
        </div>
        <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "4px", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${project.statusColor}, #06B6D4)`,
              boxShadow: `0 0 10px ${project.statusColor}30`
            }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        paddingTop: "20px", 
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        gap: "12px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Budget</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fff", fontWeight: "700", fontSize: "14px" }}>
            <DollarSign size={14} style={{ color: "var(--cyan)" }} />
            {project.budget}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
          <span style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Deadline</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(226, 232, 240, 0.7)", fontWeight: "600", fontSize: "14px" }}>
            <Calendar size={14} style={{ color: "rgba(226, 232, 240, 0.3)" }} />
            {project.deadline}
          </div>
        </div>
      </div>

      {/* Action Menu - Bottom Row */}
      {!isClient && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button style={{ 
            background: "rgba(255,255,255,0.03)", 
            border: "1px solid rgba(255,255,255,0.06)", 
            color: "rgba(226, 232, 240, 0.4)",
            padding: "6px",
            borderRadius: "8px",
            cursor: "pointer"
          }}>
            <MoreVertical size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
