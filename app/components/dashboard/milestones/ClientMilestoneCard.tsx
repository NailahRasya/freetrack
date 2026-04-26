"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Loader2,
  DollarSign,
  FileText,
  Eye,
  ThumbsUp,
  AlertCircle,
  LockKeyhole,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: "In Progress" | "Waiting for Approval" | "Completed";
  paymentStatus: "Escrowed" | "Released";
}

interface ClientMilestoneCardProps {
  milestone: Milestone;
  index: number;
  onApprove?: (id: string) => void;
  onReview?: (id: string) => void;
}

const STATUS_CONFIG: Record<
  Milestone["status"],
  { color: string; bg: string; border: string; icon: React.ElementType; label: string }
> = {
  "Completed": {
    color: "var(--accent-light)",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    icon: CheckCircle2,
    label: "Completed",
  },
  "Waiting for Approval": {
    color: "var(--warning)",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    icon: Loader2,
    label: "Waiting for Approval",
  },
  "In Progress": {
    color: "var(--cyan)",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
    icon: Clock,
    label: "In Progress",
  },
};

const PAYMENT_CONFIG: Record<
  Milestone["paymentStatus"],
  { color: string; bg: string; border: string; label: string }
> = {
  "Released": {
    color: "var(--accent-light)",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    label: "Released",
  },
  "Escrowed": {
    color: "var(--cyan)",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
    label: "Escrowed",
  },
};

export default function ClientMilestoneCard({
  milestone,
  index,
  onApprove,
  onReview,
}: ClientMilestoneCardProps) {
  const isActionable = milestone.status === "Waiting for Approval";
  const isCompleted = milestone.status === "Completed";
  const statusCfg = STATUS_CONFIG[milestone.status];
  const paymentCfg = PAYMENT_CONFIG[milestone.paymentStatus];
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      whileHover={{ y: -4, borderColor: `${statusCfg.color}40` }}
      className="glass-card"
      style={{
        padding: "24px",
        background: "rgba(13, 27, 62, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {/* Corner glow */}
      <div style={{
        position: "absolute", top: "-20px", right: "-20px",
        width: "120px", height: "120px",
        background: statusCfg.color,
        filter: "blur(60px)",
        opacity: 0.06,
        pointerEvents: "none",
      }} />

      {/* Left accent stripe */}
      <div style={{
        position: "absolute", left: 0, top: "20px", bottom: "20px",
        width: "3px", borderRadius: "0 3px 3px 0",
        background: `linear-gradient(180deg, ${statusCfg.color}, transparent)`,
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: "16px", fontWeight: "800", color: "#E2E8F0",
            marginBottom: "8px", letterSpacing: "-0.2px",
          }}>
            {milestone.title}
          </h3>

          {/* Badges row */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {/* Status badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "4px 10px",
              background: statusCfg.bg,
              border: `1px solid ${statusCfg.border}`,
              borderRadius: "8px",
              fontSize: "11px", fontWeight: "700",
              color: statusCfg.color,
              textTransform: "uppercase", letterSpacing: "0.4px",
            }}>
              <StatusIcon size={11} />
              {statusCfg.label}
            </div>

            {/* Payment badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "4px 10px",
              background: paymentCfg.bg,
              border: `1px solid ${paymentCfg.border}`,
              borderRadius: "8px",
              fontSize: "11px", fontWeight: "700",
              color: paymentCfg.color,
            }}>
              <DollarSign size={11} />
              {paymentCfg.label}
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0,
        }}>
          <span style={{ fontSize: "10px", color: "rgba(226,232,240,0.3)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Deadline
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.6)" }}>
            <Clock size={12} />
            {milestone.deadline}
          </div>
        </div>
      </div>

      {/* Read-only description */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "12px",
        padding: "14px 16px",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
          <FileText size={13} style={{ color: "rgba(226,232,240,0.3)" }} />
          <span style={{ fontSize: "11px", fontWeight: "700", color: "rgba(226,232,240,0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Task Description
          </span>
          <div style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px",
            fontSize: "10px", fontWeight: "600",
            color: "rgba(226,232,240,0.25)",
          }}>
            <LockKeyhole size={10} />
            Read-only
          </div>
        </div>
        <p style={{
          fontSize: "13px", color: "rgba(226,232,240,0.55)",
          lineHeight: "1.7", whiteSpace: "pre-wrap",
        }}>
          {milestone.description}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />

      {/* Action footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        {isCompleted ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "7px",
            fontSize: "13px", fontWeight: "700",
            color: "var(--accent-light)",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.18)",
            padding: "8px 16px", borderRadius: "10px",
          }}>
            <CheckCircle2 size={15} />
            Milestone Approved
          </div>
        ) : isActionable ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onReview?.(milestone.id)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 18px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(226,232,240,0.7)",
                borderRadius: "10px",
                fontSize: "13px", fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
                e.currentTarget.style.color = "var(--cyan-light)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(226,232,240,0.7)";
              }}
            >
              <Eye size={14} />
              Review Submission
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onApprove?.(milestone.id)}
              className="btn-emerald"
              style={{ padding: "9px 20px", fontSize: "13px", borderRadius: "10px" }}
            >
              <ThumbsUp size={14} />
              Approve
            </motion.button>
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "12px", fontWeight: "600",
            color: "rgba(226,232,240,0.25)",
          }}>
            <AlertCircle size={13} />
            Waiting for freelancer submission
          </div>
        )}
      </div>
    </motion.div>
  );
}
