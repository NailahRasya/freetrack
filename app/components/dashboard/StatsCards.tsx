"use client";

import { motion } from "framer-motion";
import { Briefcase, DollarSign, Flag, Clock, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Active Projects",
    value: "12",
    change: "+2 this month",
    icon: Briefcase,
    color: "#00E5FF",
    gradient: "linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(0, 229, 255, 0) 100%)",
  },
  {
    label: "Total Budget Spent",
    value: "Rp 45.2M",
    change: "+15% vs last month",
    icon: DollarSign,
    color: "#00FFA3",
    gradient: "linear-gradient(135deg, rgba(0, 255, 163, 0.15) 0%, rgba(0, 255, 163, 0) 100%)",
  },
  {
    label: "Ongoing Milestones",
    value: "8",
    change: "3 due this week",
    icon: Flag,
    color: "#4D63FF",
    gradient: "linear-gradient(135deg, rgba(77, 99, 255, 0.2) 0%, rgba(77, 99, 255, 0) 100%)",
  },
  {
    label: "Pending Payments",
    value: "Rp 8.5M",
    change: "2 invoices waiting",
    icon: Clock,
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 100%)",
  },
];

export default function StatsCards() {
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
          whileHover={{ 
            y: -6, 
            borderColor: `${stat.color}60`,
            boxShadow: `0 20px 48px rgba(0,0,0,0.4), 0 0 24px ${stat.color}20`
          }}
          whileTap={{ 
            scale: 0.95,
            background: "rgba(25, 42, 70, 0.7)",
            transition: { duration: 0.1 }
          }}
          className="glass-card"
          style={{
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            background: "rgba(15, 27, 46, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex",
            flexDirection: "column",
            minWidth: 0 // Allow content to shrink
          }}
        >
          {/* Subtle Background Glow */}
          <div style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "100px",
            height: "100px",
            background: stat.gradient,
            filter: "blur(30px)",
            opacity: 0.5,
            pointerEvents: "none"
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: `${stat.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: stat.color,
              border: `1px solid ${stat.color}30`,
              flexShrink: 0
            }}>
              <stat.icon size={22} />
            </div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "4px", 
              fontSize: "11px", 
              fontWeight: "700", 
              color: stat.color,
              background: `${stat.color}10`,
              padding: "4px 8px",
              borderRadius: "6px",
              whiteSpace: "nowrap"
            }}>
              <TrendingUp size={10} />
              {stat.change.split(' ')[0]}
            </div>
          </div>

          <div style={{ fontSize: "24px", fontWeight: "900", color: "#fff", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {stat.value}
          </div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "rgba(226, 232, 240, 0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {stat.label}
          </div>
          
          <div style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)", marginTop: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {stat.change}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
