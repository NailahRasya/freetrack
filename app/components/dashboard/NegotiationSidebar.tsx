"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Send, 
  ChevronRight, 
  FileText,
  Flag,
  Save,
  Loader2
} from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import MilestoneManager from "./freelancer/MilestoneManager";
import { formatRupiah, parseRupiah } from "@/utils/format";

interface Project {
  id: string;
  title: string;
  budget: string;
  deadline: string;
  status: string;
  description: string;
  negotiation_count: number;
  planning_context?: string;
  proposal_reason?: string;
  client_id: string;
  freelancer_id: string;
}

interface Props {
  project: Project;
  role: "client" | "freelancer";
  userId: string;
  onUpdate: () => void;
}

export default function NegotiationSidebar({ project, role, userId, onUpdate }: Props) {
  const router = useRouter();
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negoBudget, setNegoBudget] = useState(project.budget || "");
  const [negoDeadline, setNegoDeadline] = useState(project.deadline || "");
  const [loading, setLoading] = useState(false);

  // Planning states
  const [reason, setReason] = useState(project.proposal_reason || "");
  const [planning, setPlanning] = useState(project.planning_context || "");

  // Sync states when project changes
  useEffect(() => {
    setNegoBudget(project.budget || "");
    setNegoDeadline(project.deadline || "");
    setReason(project.proposal_reason || "");
    setPlanning(project.planning_context || "");
  }, [project.id, project.budget, project.deadline, project.proposal_reason, project.planning_context]);

  const formatRupiah = (val: string) => {
    if (!val || val === "Rp 0") return "";
    const numberString = val.replace(/[^0-9]/g, "");
    if (!numberString) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseInt(numberString));
  };

  // Milestones local state for refresh
  const [milestoneRefreshKey, setMilestoneRefreshKey] = useState(0);

  const [milestones, setMilestones] = useState<any[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  const isClient = role === "client";
  const status = project.status;

  useEffect(() => {
    if (project.id) {
      fetchMilestones();
    }
  }, [project.id, milestoneRefreshKey]);

  const fetchMilestones = async () => {
    setLoadingMilestones(true);
    try {
      const res = await fetch(`/api/milestones?project_id=${project.id}`);
      if (res.ok) {
        const json = await res.json();
        setMilestones(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch milestones:", err);
    } finally {
      setLoadingMilestones(false);
    }
  };

  // Logika Visibilitas Tombol
  const showFreelancerActions = !isClient && status === "pending_freelancer";
  const showClientActions = isClient && status === "pending_client";
  const isAgreed = status === "agreed";
  const isActive = status === "active" || status === "ongoing";
  const isPublished = status === "published";
  const showApplyButton = !isClient && isPublished;

  const handleStatusUpdate = async (newStatus: string, extraPayload: any = {}) => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: project.id, 
          status: newStatus,
          ...extraPayload
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const updatedProject = result.data;

        Swal.fire({ 
          title: "Berhasil", 
          text: newStatus === "agreed" ? "Kesepakatan telah disetujui!" : "Penawaran telah dikirim.", 
          icon: "success", 
          timer: 1500, 
          showConfirmButton: false, 
          background: "#0F1B2E", 
          color: "#fff" 
        });

        // Jika ID berubah (misal: melamar dari marketplace membuat record baru)
        if (updatedProject && updatedProject.id !== project.id) {
          const params = new URLSearchParams(window.location.search);
          params.set("project", updatedProject.id);
          router.replace(`${window.location.pathname}?${params.toString()}`);
        }

        onUpdate();
        setIsNegotiating(false);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memperbarui status");
      }
    } catch (err: any) {
      Swal.fire({ 
        title: "Gagal", 
        text: err.message, 
        icon: "error", 
        background: "#0F1B2E", 
        color: "#fff" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlanning = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: project.id, 
          proposal_reason: reason,
          planning_context: planning,
          // If planning is filled, we can move to active or stay in agreed
          // The user said: "sepakat approve -> fill fields -> milestone planning"
        }),
      });
      if (res.ok) {
        Swal.fire({ title: "Tersimpan", text: "Rencana pengerjaan telah disimpan.", icon: "success", timer: 1500, showConfirmButton: false, background: "#0F1B2E", color: "#fff" });
        onUpdate();
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan rencana", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "380px", display: "flex", flexDirection: "column", background: "rgba(10, 20, 45, 0.4)", borderLeft: "1px solid rgba(255, 255, 255, 0.05)", overflowY: "auto" }}>
      <div style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Briefcase size={18} style={{ color: "var(--cyan)" }} /> Detail Negosiasi
        </h3>

        {/* Project Card Summary */}
        <div className="glass-card" style={{ padding: "20px", background: "rgba(255, 255, 255, 0.03)", marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Status Proyek</div>
          <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: "8px", background: getStatusBg(status), color: getStatusColor(status), fontSize: "11px", fontWeight: "900", marginBottom: "16px" }}>
            {getStatusLabel(status).toUpperCase()}
          </div>

          <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "16px" }}>{project.title}</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <DollarSign size={14} style={{ color: "#00FFA3" }} />
              <div style={{ fontSize: "14px", color: "#fff", fontWeight: "700" }}>{formatRupiah(String(project.budget || ""))}</div>
            </div>
          </div>
        </div>

        {/* Negotiation Actions */}
        <AnimatePresence mode="wait">
          {!isAgreed && !isActive && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {isNegotiating ? (
                <div className="glass-card" style={{ padding: "20px", background: "rgba(77, 99, 255, 0.05)", border: "1px solid rgba(77, 99, 255, 0.2)" }}>
                  <h5 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", marginBottom: "16px" }}>Ajukan Revisi</h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={labelStyle}>Budget (IDR)</label>
                      <input 
                        value={negoBudget} 
                        onChange={e => setNegoBudget(formatRupiah(e.target.value))} 
                        style={inputStyle} 
                        placeholder="Contoh: Rp 5.000.000" 
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button onClick={() => setIsNegotiating(false)} style={btnSecondary}>Batal</button>
                      <button 
                        onClick={() => handleStatusUpdate(isClient ? "pending_freelancer" : "pending_client", { 
                          budget: negoBudget.replace(/[^0-9]/g, ""), 
                          negotiation_count: (project.negotiation_count || 0) + 1
                        })} 
                        disabled={loading}
                        style={btnPrimary}
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : "Kirim Nego"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {showApplyButton ? (
                    <button onClick={() => handleStatusUpdate("pending_client")} disabled={loading} style={btnApprove}>
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Ajukan Lamaran
                    </button>
                  ) : (showFreelancerActions || showClientActions) ? (
                    <>
                      <button onClick={() => handleStatusUpdate("agreed")} disabled={loading} style={btnApprove}>
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Sepakat & Approve
                      </button>
                      <button onClick={() => setIsNegotiating(true)} style={btnNego}>
                        <RefreshCw size={16} /> Ajukan Nego
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                      <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)" }}>
                        {isClient && isPublished ? "Menunggu pelamar..." : `Menunggu respon dari ${isClient ? "Freelancer" : "Klien"}...`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Milestone Planning Card for active project (Freelancer) */}
        {!isClient && isActive && (
          <div className="glass-card" style={{ 
            padding: "20px", 
            background: "rgba(6, 182, 212, 0.04)", 
            border: "1px solid rgba(6, 182, 212, 0.15)", 
            borderRadius: "16px",
            marginTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}>
            <h5 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Flag size={16} style={{ color: "var(--cyan)" }} /> Rencana Kerja & Milestone
            </h5>
            <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.6" }}>
              Proyek telah disetujui! Hubungkan rencana kerja Anda dengan membuat milestone pengerjaan sekarang untuk memantau progress pengerjaan.
            </p>
            <button 
              onClick={() => router.push(`/dashboard/milestones?project_id=${project.id}`)}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #06B6D4, #4D63FF)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
              className="cta-button"
            >
              Buat Milestone Planning
            </button>
          </div>
        )}

        {/* Planning Section (After Agreed) */}
        {isAgreed && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: "8px" }}>
            <div className="glass-card" style={{ padding: "20px", background: "rgba(0, 255, 163, 0.03)", border: "1px solid rgba(0, 255, 163, 0.1)" }}>
              <h5 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={16} style={{ color: "#00FFA3" }} /> Rencana Pengerjaan
              </h5>
              
              {!isClient ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Alasan & Konteks</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Mengapa Anda cocok untuk proyek ini?" style={{ ...inputStyle, minHeight: "80px", resize: "none" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Rencana (Planning)</label>
                    <textarea value={planning} onChange={e => setPlanning(e.target.value)} placeholder="Langkah-langkah yang akan dikerjakan..." style={{ ...inputStyle, minHeight: "80px", resize: "none" }} />
                  </div>
                  <button onClick={handleSavePlanning} disabled={loading} style={btnPrimary}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan Rencana
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                    <div style={labelStyle}>Alasan Freelancer</div>
                    <p style={{ fontSize: "13px", color: "#fff", marginTop: "4px" }}>{project.proposal_reason || "Belum diisi."}</p>
                  </div>
                  <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                    <div style={labelStyle}>Planning</div>
                    <p style={{ fontSize: "13px", color: "#fff", marginTop: "4px" }}>{project.planning_context || "Belum diisi."}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Milestone Planning Integration */}
            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <h5 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Flag size={16} style={{ color: "var(--cyan)" }} /> Milestone Planning
                </h5>
                <a href={`/dashboard/milestones?project_id=${project.id}`} style={{ fontSize: "11px", color: "var(--cyan)", fontWeight: "700", textDecoration: "none" }}>Detail →</a>
              </div>
              
              {/* Reuse MilestoneManager or a compact version */}
              <div style={{ zoom: 0.85 }}>
                 <MilestoneManager 
                   projectId={project.id} 
                   initialMilestones={milestones} 
                   onMilestoneCreated={() => setMilestoneRefreshKey(k => k + 1)}
                   readOnly={role === "client"}
                 />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Helpers
function getStatusLabel(s: string) {
  switch (s) {
    case "draft": return "Draf";
    case "pending_client": return "Menunggu Klien";
    case "pending_freelancer": return "Menunggu Freelancer";
    case "agreed": return "Disepakati";
    case "active": return "Proyek Aktif";
    case "published": return "Marketplace";
    default: return s;
  }
}

function getStatusColor(s: string) {
  switch (s) {
    case "agreed": return "#00FFA3";
    case "active": return "var(--cyan)";
    case "pending_client":
    case "pending_freelancer": return "#F59E0B";
    default: return "rgba(226, 232, 240, 0.4)";
  }
}

function getStatusBg(s: string) {
  switch (s) {
    case "agreed": return "rgba(0, 255, 163, 0.1)";
    case "active": return "rgba(6, 182, 212, 0.1)";
    case "pending_client":
    case "pending_freelancer": return "rgba(245, 158, 11, 0.1)";
    default: return "rgba(255, 255, 255, 0.05)";
  }
}

// Styles
const inputStyle = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "10px",
  padding: "10px 12px",
  color: "#fff",
  fontSize: "13px",
  outline: "none"
};

const labelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "rgba(226, 232, 240, 0.4)",
  textTransform: "uppercase" as const,
  marginBottom: "6px",
  display: "block"
};

const btnPrimary = {
  flex: 1,
  padding: "10px",
  background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
  border: "none",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "13px",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px"
};

const btnSecondary = {
  padding: "10px 16px",
  background: "transparent",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  color: "rgba(226, 232, 240, 0.6)",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer"
};

const btnApprove = {
  width: "100%",
  padding: "14px",
  background: "rgba(0, 255, 163, 0.1)",
  border: "1px solid rgba(0, 255, 163, 0.2)",
  borderRadius: "14px",
  color: "#00FFA3",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px"
};

const btnNego = {
  width: "100%",
  padding: "14px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "14px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px"
};
