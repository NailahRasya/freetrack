"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useUser } from "../../dashboard/layout";

/**
 * Data dummy untuk riwayat pembayaran.
 */
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatRupiah } from "@/utils/format";

/**
 * Komponen PaymentTracker memantau status dana dan pembayaran per milestone.
 */
export default function PaymentTracker() {
  const { user, role } = useUser();
  const isFreelancer = role === "freelancer";
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from("milestones")
          .select(`
            id,
            title,
            amount,
            status,
            created_at,
            projects!inner (
              title,
              client_id,
              freelancer_id
            )
          `)
          .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`, { foreignTable: 'projects' })
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        if (data) {
          const mapped = data.map(m => {
            const statusMap: any = {
              "Approved": { label: "Dirilis", color: "var(--accent)", icon: CheckCircle2 },
              "Disetujui": { label: "Dirilis", color: "var(--accent)", icon: CheckCircle2 },
              "Menunggu DP": { label: "Menunggu DP", color: "var(--warning)", icon: Clock },
              "Waiting for Approval": { label: "Menunggu Persetujuan", color: "var(--warning)", icon: Clock },
              "Menunggu Persetujuan": { label: "Menunggu Persetujuan", color: "var(--warning)", icon: Clock },
              "Dalam Pengerjaan": { label: "Dalam Escrow", color: "var(--cyan)", icon: ShieldCheck },
              "In Progress": { label: "Dalam Escrow", color: "var(--cyan)", icon: ShieldCheck },
            };
            const s = statusMap[m.status] || { label: m.status, color: "rgba(226, 232, 240, 0.4)", icon: Clock };
            
            return {
              id: m.id,
              milestone: m.title,
              project: (m.projects as any).title,
              amount: formatRupiah(m.amount || 0),
              status: s.label,
              color: s.color,
              icon: s.icon,
            };
          });
          setPayments(mapped);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?.id]);

  return (
    <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Pelacak Pembayaran</h3>
        <ArrowUpRight size={18} style={{ color: "rgba(226, 232, 240, 0.4)", cursor: "pointer" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "rgba(226, 232, 240, 0.3)", fontSize: "12px", padding: "20px" }}>Memuat data...</p>
        ) : payments.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(226, 232, 240, 0.3)", fontSize: "12px", padding: "20px" }}>Belum ada riwayat pembayaran.</p>
        ) : payments.map((payment, idx) => (
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
            {/* Kiri: Ikon Status */}
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

            {/* Kanan: Konten Detail */}
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

            {/* Tombol Aksi khusus Freelancer jika status dana ada di Escrow */}
            {isFreelancer && payment.status === "Dalam Escrow" && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                suppressHydrationWarning
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
                Kirim Bukti
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ 
          background: "rgba(6, 182, 212, 0.08)", 
          borderColor: "rgba(6, 182, 212, 0.3)",
          color: "#22D3EE"
        }}
        whileTap={{ scale: 0.98 }}
        suppressHydrationWarning
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
        Lihat Riwayat
      </motion.button>
    </div>
  );
}

