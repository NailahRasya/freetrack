"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Wallet, CheckCircle, AlertCircle, ArrowLeft, Clock, Shield, ShieldCheck, Lock, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useUser } from "../layout";
import { formatRupiah } from "@/utils/format";

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useUser();
  
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingMilestones();
  }, []);

  const fetchPendingMilestones = async () => {
    try {
      const res = await fetch("/api/milestones");
      const data = await res.json();
      
      // Filter milestone yang statusnya "Menunggu DP"
      const pending = (data.data || []).filter(
        (m: any) => m.status === "Menunggu DP"
      );
      
      setMilestones(pending);
    } catch (err) {
      console.error("Failed to fetch milestones:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayDP = async (milestone: any) => {
    // Konfirmasi dulu
    const result = await Swal.fire({
      title: "Bayar Down Payment?",
      html: `
        <div style="text-align: left; padding: 20px;">
          <p style="margin-bottom: 12px;"><strong>Milestone:</strong> ${milestone.title}</p>
          <p style="margin-bottom: 12px;"><strong>Jumlah DP:</strong> Rp ${milestone.amount?.toLocaleString("id-ID") || "0"}</p>
          <p style="margin-bottom: 12px; color: #6b7280; font-size: 14px;">
            Uang akan ditahan di escrow dan akan dilepas ke freelancer setelah Anda menyetujui hasil kerja.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Bayar Sekarang",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      background: "rgba(13, 27, 62, 0.95)",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    setProcessing(milestone.id);

    try {
      // Simulasi payment processing (2 detik)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update milestone status ke "In Progress"
      const res = await fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: milestone.id,
          status: "In Progress",
          payment_status: "Escrowed",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process payment");
      }

      // Success!
      await Swal.fire({
        icon: "success",
        title: "Pembayaran Berhasil!",
        html: `
          <div style="text-align: center; padding: 20px;">
            <p style="margin-bottom: 12px; color: #10b981; font-size: 16px; font-weight: 600;">
              ✅ DP telah dibayar dan disimpan di escrow
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              Freelancer sekarang dapat mulai mengerjakan milestone ini.
            </p>
          </div>
        `,
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        timer: 3000,
        showConfirmButton: false,
      });

      // Refresh list
      fetchPendingMilestones();

    } catch (err: any) {
      console.error("Payment error:", err);
      
      // Better error message
      let errorMessage = err.message || "Terjadi kesalahan saat memproses pembayaran";
      
      if (err.message?.includes("Unauthorized")) {
        errorMessage = "Anda tidak memiliki izin untuk melakukan pembayaran ini. Pastikan Anda adalah pemilik proyek.";
      } else if (err.message?.includes("403")) {
        errorMessage = "Akses ditolak. Silakan refresh halaman dan coba lagi.";
      }
      
      Swal.fire({
        icon: "error",
        title: "Pembayaran Gagal",
        text: errorMessage,
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
        <div style={{ width: "24px", height: "24px", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid var(--primary-light)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "15px", fontWeight: "600" }}>Loading payments...</span>
      </div>
    );
  }

  // ── Freelancer: Read-only view (status pembayaran saja, tanpa tombol bayar) ──
  if (role === "freelancer") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => router.back()}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              padding: "8px 16px", borderRadius: "10px",
              color: "rgba(226,232,240,0.6)", fontSize: "14px", fontWeight: "600",
              cursor: "pointer", marginBottom: "20px", transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(226,232,240,0.6)"; }}
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} style={{ color: "var(--cyan)" }} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px" }}>
              Status Pembayaran Milestone
            </h2>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", paddingLeft: "46px" }}>
            Pantau status escrow untuk setiap milestone Anda. Pembayaran DP dilakukan oleh klien.
          </p>
        </motion.div>

        {/* Info banner: freelancer read-only */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: "20px 24px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <Lock size={24} style={{ color: "var(--warning)", flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
              Pembayaran DP dilakukan oleh Klien
            </h4>
            <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.6)", lineHeight: "1.6" }}>
              Klien yang bertanggung jawab membayar DP sebelum Anda dapat mengunggah bukti kerja.
              Halaman ini hanya menampilkan status pembayaran untuk informasi Anda.
            </p>
          </div>
        </motion.div>

        {/* Milestone list — read only */}
        {milestones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card"
            style={{ padding: "80px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
          >
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cyan)" }}>
              <CheckCircle size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>Tidak Ada Milestone Pending</h3>
              <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.4)", maxWidth: "400px" }}>
                Semua milestone sudah dibayar atau belum ada milestone yang dibuat.
              </p>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="glass-card"
                style={{ padding: "24px", background: "rgba(13, 27, 62, 0.5)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "18px", position: "relative", overflow: "hidden" }}
              >
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "#f59e0b", filter: "blur(60px)", opacity: 0.06, pointerEvents: "none" }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ padding: "4px 10px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", fontSize: "11px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Clock size={11} /> Menunggu Pembayaran Klien
                    </div>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>{milestone.title}</h3>
                  <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.6" }}>{milestone.description || "Tidak ada deskripsi"}</p>
                </div>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", fontWeight: "600" }}>Jumlah DP</span>
                    <span style={{ fontSize: "20px", fontWeight: "900", color: "var(--warning)" }}>{formatCurrency(milestone.amount || 0)}</span>
                  </div>
                </div>
                {milestone.deadline && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(226, 232, 240, 0.5)" }}>
                    <Clock size={14} /> Deadline: {milestone.deadline}
                  </div>
                )}
                {/* No pay button for freelancer — just info */}
                <div style={{ padding: "12px 16px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Lock size={14} style={{ color: "var(--warning)", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)", lineHeight: "1.5" }}>
                    Menunggu klien membayar DP. Setelah terbayar, Anda dapat mengunggah bukti kerja di tab <strong style={{ color: "#fff" }}>Target Pencapaian</strong>.
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 16px",
            borderRadius: "10px",
            color: "rgba(226,232,240,0.6)",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(226,232,240,0.6)";
          }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Wallet size={18} style={{ color: "var(--accent)" }} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px" }}>
            Pembayaran Down Payment
          </h2>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", paddingLeft: "46px" }}>
          Bayar DP untuk milestone yang menunggu pembayaran. Uang akan disimpan di escrow hingga Anda menyetujui hasil kerja freelancer.
        </p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          padding: "20px 24px",
          background: "rgba(6, 182, 212, 0.05)",
          border: "1px solid rgba(6, 182, 212, 0.2)",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Shield size={24} style={{ color: "var(--cyan)", flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
            🔒 Sistem Escrow Aman
          </h4>
          <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.6)", lineHeight: "1.6" }}>
            Uang Anda akan ditahan oleh platform dan hanya akan dilepas ke freelancer setelah Anda menyetujui hasil kerja. 
            Jika tidak sesuai, Anda dapat meminta revisi atau dispute.
          </p>
        </div>
      </motion.div>

      {/* Milestone List */}
      {milestones.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{
            padding: "80px 40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
              Tidak Ada Pembayaran Pending
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.4)", maxWidth: "400px" }}>
              Semua milestone sudah dibayar atau belum ada milestone yang dibuat.
            </p>
          </div>
        </motion.div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card"
              style={{
                padding: "24px",
                background: "rgba(13, 27, 62, 0.5)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow effect */}
              <div style={{
                position: "absolute", top: "-20px", right: "-20px",
                width: "120px", height: "120px",
                background: "#f59e0b",
                filter: "blur(60px)",
                opacity: 0.08,
                pointerEvents: "none",
              }} />

              {/* Header */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{
                    padding: "4px 10px",
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#f59e0b",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}>
                    <Clock size={11} />
                    Menunggu DP
                  </div>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>
                  {milestone.title}
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.6" }}>
                  {milestone.description || "Tidak ada deskripsi"}
                </p>
              </div>

              {/* Amount */}
              <div style={{
                padding: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", fontWeight: "600" }}>
                    Jumlah DP
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: "900", color: "var(--accent)" }}>
                    {formatCurrency(milestone.amount || 0)}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              {milestone.deadline && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(226, 232, 240, 0.5)" }}>
                  <Clock size={14} />
                  Deadline: {milestone.deadline}
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={() => handlePayDP(milestone)}
                disabled={processing === milestone.id}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: processing === milestone.id 
                    ? "rgba(16, 185, 129, 0.5)" 
                    : "linear-gradient(135deg, #10b981, #059669)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: processing === milestone.id ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  opacity: processing === milestone.id ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (processing !== milestone.id) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.3)";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {processing === milestone.id ? (
                  <>
                    <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Bayar DP Sekarang
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
        style={{
          padding: "20px 24px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "16px",
        }}
      >
        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "rgba(226, 232, 240, 0.6)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          ℹ️ Catatan Penting
        </h4>
        <ul style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.8", paddingLeft: "20px" }}>
          <li>Pembayaran ini adalah simulasi untuk testing. Di production akan terintegrasi dengan payment gateway.</li>
          <li>Uang akan disimpan di escrow (ditahan platform) hingga Anda approve hasil kerja freelancer.</li>
          <li>Setelah DP dibayar, freelancer dapat mulai mengerjakan milestone.</li>
          <li>Anda dapat meminta revisi jika hasil tidak sesuai sebelum approve.</li>
        </ul>
      </motion.div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function Payments() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 140px)", background: "rgba(15, 27, 46, 0.4)", borderRadius: "24px", color: "rgba(226,232,240,0.4)", padding: "40px" }}>
        <Loader2 style={{ animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <PaymentsContent />
    </Suspense>
  );
}
