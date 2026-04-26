"use client";

import { motion } from "framer-motion";
import { Plus, Check, CreditCard, UserPlus, FileText } from "lucide-react";

const activities = [
  {
    id: 1,
    title: "Project Created",
    desc: "New project 'Smart Contract Audit' has been posted.",
    time: "4 hours ago",
    icon: Plus,
    color: "var(--cyan)",
  },
  {
    id: 2,
    title: "Milestone Approved",
    desc: "You approved 'UI Design Hi-Fi' for E-Commerce App.",
    time: "Yesterday",
    icon: Check,
    color: "var(--accent)",
  },
  {
    id: 3,
    title: "Payment Released",
    desc: "Rp 4,500,000 released to Sarah Jenkins.",
    time: "2 days ago",
    icon: CreditCard,
    color: "var(--primary-light)",
  },
  {
    id: 4,
    title: "Contract Signed",
    desc: "Aris Munandar signed the contract for Website Redesign.",
    time: "3 days ago",
    icon: FileText,
    color: "var(--warning)",
  },
];

export default function ActivityTimeline() {
  return (
    <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", height: "100%" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "24px" }}>Activity Timeline</h3>

      <div style={{ position: "relative" }}>
        {/* Vertical Line */}
        <div style={{
          position: "absolute",
          left: "15px",
          top: "0",
          bottom: "0",
          width: "2px",
          background: "linear-gradient(to bottom, var(--cyan) 0%, rgba(255, 255, 255, 0.05) 100%)",
          opacity: 0.3
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {activities.map((activity, idx) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ 
                x: 6,
                background: "rgba(255, 255, 255, 0.02)",
              }}
              whileTap={{ scale: 0.98 }}
              style={{ display: "flex", gap: "20px", position: "relative", cursor: "pointer" }}
            >
              {/* Dot / Icon */}
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(15, 27, 46, 1)",
                border: `2px solid ${activity.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: activity.color,
                zIndex: 1,
                boxShadow: `0 0 10px ${activity.color}40`,
                flexShrink: 0,
                transition: "box-shadow 0.3s ease",
              }}>
                <activity.icon size={14} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#E2E8F0" }}>{activity.title}</h4>
                  <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)" }}>{activity.time}</span>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", lineHeight: "1.5" }}>
                  {activity.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
