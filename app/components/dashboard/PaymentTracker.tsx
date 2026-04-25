"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useUser } from "../../dashboard/layout";

const payments = [
  {
    id: 1,
    milestone: "UI/UX High Fidelity Design",
    project: "E-Commerce Mobile App",
    amount: "Rp 4.5M",
    status: "Released",
    date: "2 hours ago",
    icon: CheckCircle2,
    color: "var(--accent)",
  },
  {
    id: 2,
    milestone: "API Integration",
    project: "Corporate Website Redesign",
    amount: "Rp 3.2M",
    status: "In Escrow",
    date: "Yesterday",
    icon: ShieldCheck,
    color: "var(--cyan)",
  },
  {
    id: 3,
    milestone: "Landing Page Development",
    project: "Startup Landing Page",
    amount: "Rp 2.8M",
    status: "Pending Approval",
    date: "2 days ago",
    icon: Clock,
    color: "var(--warning)",
  },
];

export default function PaymentTracker() {
  const { role } = useUser();
  const isFreelancer = role === "freelancer";

  return (
    <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Payment Tracker</h3>
        <ArrowUpRight size={18} style={{ color: "rgba(226, 232, 240, 0.4)", cursor: "pointer" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {payments.map((payment, idx) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              display: "flex",
              gap: "12px",
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              transition: "all 0.3s ease",
            }}
            whileHover={{ background: "rgba(255, 255, 255, 0.04)", borderColor: `${payment.color}30` }}
          >
            {/* Left: Icon */}
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: `${payment.color}10`,
              color: payment.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `1px solid ${payment.color}20`
            }}>
              <payment.icon size={18} />
            </div>

            {/* Right: Content */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <h4 style={{ 
                  fontSize: "13px", 
                  fontWeight: "700", 
                  color: "#E2E8F0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1
                }}>
                  {payment.milestone}
                </h4>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#fff", whiteSpace: "nowrap" }}>
                  {payment.amount}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
                  {payment.project}
                </span>
                <span style={{ 
                  fontSize: "9px", 
                  color: payment.color, 
                  fontWeight: "800", 
                  textTransform: "uppercase",
                  background: `${payment.color}10`,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: `1px solid ${payment.color}20`,
                  whiteSpace: "nowrap"
                }}>
                  {payment.status}
                </span>
              </div>
            </div>

            {/* Action for Freelancer */}
            {isFreelancer && payment.status === "In Escrow" && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "10px",
                  fontWeight: "800",
                  color: "#0B1220",
                  cursor: "pointer",
                  alignSelf: "center",
                  boxShadow: "0 4px 12px rgba(0, 255, 163, 0.2)"
                }}
              >
                Upload Bukti
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      <button
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "10px",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          color: "rgba(226, 232, 240, 0.6)",
          fontSize: "12px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        View History
      </button>
    </div>
  );
}
