"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { 
  GitPullRequest, 
  Loader2, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  MessageSquare,
  FileText,
  User
} from "lucide-react";
import Swal from "sweetalert2";
import { useUser } from "../layout";
import ChangeRequestModal from "../../components/dashboard/freelancer/ChangeRequestModal";
import { formatRupiah } from "@/utils/format";

function ChangeRequestsContent() {
  const { role, loading: userLoading, user } = useUser();
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch change requests
  useEffect(() => {
    if (userLoading || !user?.id) return;

    const fetchChangeRequests = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/change-requests");
        const json = await res.json();
        if (res.ok) {
          setChangeRequests(json.data || []);
        } else {
          console.error("Failed to fetch change requests:", json.error);
        }
      } catch (err) {
        console.error("Error fetching change requests:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChangeRequests();
  }, [userLoading, user?.id, refreshKey]);

  // Handle client response (Approve / Reject)
  const handleClientResponse = async (id: string, approve: boolean) => {
    const actionLabel = approve ? "menyetujui" : "menolak";
    const confirmButtonColor = approve ? "var(--accent)" : "#ef4444";

    const { value: clientNote, isConfirmed } = await Swal.fire({
      title: `Konfirmasi ${approve ? "Persetujuan" : "Penolakan"}`,
      text: `Apakah Anda yakin ingin ${actionLabel} permintaan perubahan ini? Anda dapat menambahkan catatan opsional di bawah ini:`,
      input: "textarea",
      inputPlaceholder: "Tulis catatan tambahan untuk freelancer di sini...",
      showCancelButton: true,
      confirmButtonText: approve ? "Ya, Setujui" : "Ya, Tolak",
      cancelButtonText: "Batal",
      background: "rgba(13, 27, 62, 0.95)",
      color: "#fff",
      confirmButtonColor,
      inputAttributes: {
        style: "color: #fff; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;",
      }
    });

    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/change-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: approve ? "approved" : "rejected",
          client_note: clientNote || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui status permintaan.");
      }

      Swal.fire({
        icon: "success",
        title: `Berhasil ${approve ? "Disetujui" : "Ditolak"}`,
        text: `Permintaan perubahan telah berhasil ${approve ? "disetujui" : "ditolak"}.`,
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        confirmButtonColor: "var(--accent)",
      });

      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error("Failed to respond to change request:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menanggapi",
        text: err.message || "Terjadi kesalahan saat memproses keputusan Anda.",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "approved":
        return {
          bg: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "var(--accent)",
          text: "Disetujui",
          icon: CheckCircle2
        };
      case "rejected":
        return {
          bg: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#ef4444",
          text: "Ditolak",
          icon: XCircle
        };
      default:
        return {
          bg: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          color: "var(--warning)",
          text: "Menunggu Persetujuan",
          icon: Clock
        };
    }
  };

  if (userLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "15px", fontWeight: "600" }}>Loading data…</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(77, 99, 255, 0.12)",
              border: "1px solid rgba(77, 99, 255, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GitPullRequest size={18} style={{ color: "var(--primary-light)" }} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px" }}>
              Permintaan Perubahan (Change Request)
            </h2>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", paddingLeft: "46px" }}>
            {role === "freelancer"
              ? "Ajukan dan kelola permintaan perubahan anggaran atau lini masa untuk proyek aktif Anda."
              : "Tinjau dan setujui permintaan penyesuaian anggaran atau tenggat waktu dari freelancer Anda."}
          </p>
        </div>

        {role === "freelancer" && (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "700",
              fontSize: "14px"
            }}
          >
            <Plus size={16} /> Ajukan Perubahan
          </motion.button>
        )}
      </motion.div>

      {/* Main List */}
      {isLoading && changeRequests.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "30vh", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          <span>Mengambil data permintaan...</span>
        </div>
      ) : changeRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{
            padding: "80px 40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            background: "rgba(15, 27, 46, 0.6)"
          }}
        >
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.1)" }}>
            <GitPullRequest size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
              Belum Ada Permintaan Perubahan
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.4)", maxWidth: "400px", margin: "0 auto" }}>
              {role === "freelancer"
                ? "Semua proyek Anda berjalan sesuai rencana. Klik tombol di atas jika ada lingkup kerja yang perlu diubah."
                : "Belum ada ajuan perubahan lingkup kerja atau anggaran dari freelancer Anda saat ini."}
            </p>
          </div>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {changeRequests.map((req, idx) => {
            const badge = getStatusBadgeStyle(req.status);
            const StatusIcon = badge.icon;
            
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card"
                style={{
                  padding: "24px",
                  background: "rgba(15, 27, 46, 0.45)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px"
                }}
              >
                {/* Header Card */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>
                      {req.project?.title || "Proyek Tidak Diketahui"}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(226, 232, 240, 0.5)", fontSize: "13px" }}>
                      <User size={14} />
                      <span>
                        {role === "client" 
                          ? `Diajukan oleh: ${req.freelancer?.full_name || "Freelancer"}`
                          : `Penerima: ${req.client?.full_name || "Klien"}`}
                      </span>
                      <span>•</span>
                      <Calendar size={14} />
                      <span>{new Date(req.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: badge.bg,
                    border: badge.border,
                    color: badge.color,
                    padding: "6px 12px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}>
                    <StatusIcon size={14} />
                    <span>{badge.text}</span>
                  </div>
                </div>

                {/* Scope changes details */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                  gap: "16px",
                  padding: "16px",
                  background: "rgba(0,0,0,0.15)",
                  borderRadius: "12px"
                }}>
                  {req.new_budget && (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)", fontWeight: "600" }}>Anggaran yang Diajukan</p>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>Rp {formatRupiah(parseInt(req.new_budget))}</p>
                      </div>
                    </div>
                  )}

                  {req.new_deadline && (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(77, 99, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-light)" }}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)", fontWeight: "600" }}>Tenggat Waktu Baru</p>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>
                          {new Date(req.new_deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reason box */}
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", color: "rgba(226,232,240,0.6)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileText size={14} /> Alasan Pengajuan:
                  </h4>
                  <p style={{ fontSize: "14px", color: "#E2E8F0", lineHeight: "1.6", whiteSpace: "pre-line", paddingLeft: "20px" }}>
                    {req.reason}
                  </p>
                </div>

                {/* Client Response Notes */}
                {req.client_note && (
                  <div style={{ 
                    padding: "16px", 
                    background: "rgba(255, 255, 255, 0.02)", 
                    borderLeft: `3px solid ${req.status === "approved" ? "var(--accent)" : "#ef4444"}`,
                    borderRadius: "0 12px 12px 0"
                  }}>
                    <h4 style={{ fontSize: "13px", fontWeight: "700", color: "rgba(226,232,240,0.6)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <MessageSquare size={14} /> Catatan Klien:
                    </h4>
                    <p style={{ fontSize: "14px", color: "#E2E8F0", fontStyle: "italic" }}>
                      "{req.client_note}"
                    </p>
                  </div>
                )}

                {/* Actions for Client */}
                {role === "client" && req.status === "pending" && (
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
                    <button
                      onClick={() => handleClientResponse(req.id, false)}
                      style={{
                        padding: "8px 16px",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        borderRadius: "10px",
                        color: "#ef4444",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"}
                      onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleClientResponse(req.id, true)}
                      className="btn-primary"
                      style={{
                        padding: "8px 24px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "700"
                      }}
                    >
                      Setujui Perubahan
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Trigger for Freelancer */}
      <ChangeRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}

export default function ChangeRequestsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "15px", fontWeight: "600" }}>Loading…</span>
      </div>
    }>
      <ChangeRequestsContent />
    </Suspense>
  );
}
