"use client";

import { motion } from "framer-motion";
import { Target, CheckCircle2, Clock, ArrowUpRight } from "lucide-react";

interface ProgressTrackerCardProps {
  percentage: number;
  completedCount: number;
  totalCount: number;
  nextMilestone?: string;
  variant?: "compact" | "full";
}

export default function ProgressTrackerCard({
  percentage,
  completedCount,
  totalCount,
  nextMilestone,
  variant = "full"
}: ProgressTrackerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{
        padding: variant === "compact" ? "20px" : "24px",
        background: "rgba(15, 27, 46, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        height: "100%",
        minHeight: variant === "compact" ? "auto" : "240px",
      }}
    >
      {/* Background Glow */}
      <div style={{
        position: "absolute",
        top: "-20%",
        right: "-10%",
        width: "140px",
        height: "140px",
        background: percentage === 100 ? "rgba(16, 185, 129, 0.15)" : "rgba(77, 99, 255, 0.15)",
        borderRadius: "50%",
        filter: "blur(40px)",
        zIndex: 0
      }} />

      <div style={{ zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cyan)"
          }}>
            <Target size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>Progres Proyek</h3>
            <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", margin: 0 }}>Pelacakan Milestone</p>
          </div>
        </div>
        <div style={{ 
          padding: "4px 8px", 
          borderRadius: "8px", 
          background: "rgba(255,255,255,0.03)", 
          fontSize: "11px", 
          fontWeight: "700", 
          color: "rgba(226, 232, 240, 0.6)",
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          {completedCount}/{totalCount} <span style={{ opacity: 0.5 }}>Selesai</span>
        </div>
      </div>

      <div style={{ zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
          <span style={{ fontSize: "36px", fontWeight: "900", color: "#fff", letterSpacing: "-1px" }}>
            {percentage}<span style={{ fontSize: "18px", color: "var(--cyan)", fontWeight: "700" }}>%</span>
          </span>
          <div style={{ textAlign: "right" }}>
             <div style={{ fontSize: "11px", fontWeight: "700", color: "rgba(226, 232, 240, 0.3)", textTransform: "uppercase", marginBottom: "2px" }}>Status</div>
             <div style={{ fontSize: "13px", fontWeight: "800", color: percentage === 100 ? "var(--accent)" : "var(--cyan)" }}>
               {percentage === 100 ? "Selesai" : "Sedang Berjalan"}
             </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: "10px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "5px", overflow: "hidden", position: "relative" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            style={{
              height: "100%",
              background: percentage === 100 ? "var(--gradient-emerald)" : "var(--gradient-primary)",
              boxShadow: percentage === 100 ? "0 0 15px rgba(16, 185, 129, 0.3)" : "0 0 15px rgba(77, 99, 255, 0.3)",
              borderRadius: "5px"
            }}
          />
        </div>
      </div>

      {variant === "full" && (
        <div style={{ 
          zIndex: 1,
          paddingTop: "16px", 
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          {nextMilestone ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ color: "var(--warning)" }}><Clock size={14} /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.4)", margin: 0, fontWeight: "600" }}>TARGET BERIKUTNYA</p>
                <p style={{ fontSize: "13px", color: "#fff", margin: 0, fontWeight: "700" }}>{nextMilestone}</p>
              </div>
            </div>
          ) : percentage === 100 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ color: "var(--accent)" }}><CheckCircle2 size={14} /></div>
              <p style={{ fontSize: "13px", color: "rgba(16, 185, 129, 0.8)", margin: 0, fontWeight: "700" }}>Semua milestone telah diselesaikan!</p>
            </div>
          ) : (
             <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ color: "rgba(226, 232, 240, 0.2)" }}><Clock size={14} /></div>
              <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.3)", margin: 0, fontWeight: "600" }}>Belum ada milestone selanjutnya.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
