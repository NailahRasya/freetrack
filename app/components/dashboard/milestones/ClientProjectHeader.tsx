"use client";

import { motion } from "framer-motion";
import { Briefcase, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";

interface ClientProjectHeaderProps {
  projectName: string;
  totalBudget: string;
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
}

export default function ClientProjectHeader({
  projectName,
  totalBudget,
  completionPercentage,
  completedCount,
  totalCount,
}: ClientProjectHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
      style={{
        padding: "32px",
        background: "rgba(13, 27, 62, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "24px",
        position: "relative",
        overflow: "hidden",
        marginBottom: "32px",
      }}
    >
      {/* Decorative orbs */}
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "220px", height: "220px",
        background: "radial-gradient(circle, rgba(26,54,240,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-30px", left: "40%",
        width: "180px", height: "180px",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top line accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, var(--primary), var(--cyan))",
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
        {/* Badge + title */}
        <div>
          <div className="section-badge" style={{ marginBottom: "12px", display: "inline-flex" }}>
            <Briefcase size={13} />
            Active Project
          </div>
          <h1 style={{
            fontSize: "clamp(20px, 2.5vw, 28px)",
            fontWeight: "900",
            color: "#fff",
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}>
            {projectName}
          </h1>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-start" }}>
          {/* Budget */}
          <div style={{
            display: "flex", flexDirection: "column", gap: "6px",
            padding: "14px 20px",
            background: "rgba(6, 182, 212, 0.08)",
            border: "1px solid rgba(6, 182, 212, 0.15)",
            borderRadius: "14px",
          }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Total Budget
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fff", fontWeight: "800", fontSize: "18px" }}>
              <DollarSign size={16} style={{ color: "var(--cyan)" }} />
              {totalBudget}
            </div>
          </div>

          {/* Milestones completed */}
          <div style={{
            display: "flex", flexDirection: "column", gap: "6px",
            padding: "14px 20px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
            borderRadius: "14px",
          }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Milestones
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fff", fontWeight: "800", fontSize: "18px" }}>
              <CheckCircle2 size={16} style={{ color: "var(--accent)" }} />
              {completedCount} / {totalCount}
            </div>
          </div>

          {/* Progress */}
          <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.5)", display: "flex", alignItems: "center", gap: "6px" }}>
                <TrendingUp size={14} style={{ color: "var(--accent-light)" }} />
                Overall Progress
              </span>
              <span style={{
                fontWeight: "900", fontSize: "22px",
                background: "linear-gradient(135deg, var(--accent-light), var(--cyan))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {completionPercentage}%
              </span>
            </div>
            {/* Track */}
            <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, var(--accent), var(--cyan))",
                  boxShadow: "0 0 12px rgba(16,185,129,0.4)",
                  borderRadius: "4px",
                  position: "relative",
                }}
              >
                {/* Shimmer */}
                <div style={{
                  position: "absolute", top: 0, right: 0, bottom: 0, width: "30px",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3))",
                  borderRadius: "4px",
                }} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
