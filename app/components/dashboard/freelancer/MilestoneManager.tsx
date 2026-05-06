"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, CheckCircle2, Lock, UploadCloud, Clock } from "lucide-react";
import UploadEvidenceModal from "./UploadEvidenceModal";

import CreateMilestoneModal from "./CreateMilestoneModal";

import { formatRupiah, parseRupiah } from "@/utils/format";

interface Milestone {
  id: string;
  title: string;
  amount?: string;
  price?: string; // mapping for UI compatibility
  deadline: string;
  status: string;
  description?: string;
}

export default function MilestoneManager({ 
  clientName, 
  projectId, 
  initialMilestones = [],
  onMilestoneCreated
}: { 
  clientName?: string; 
  projectId: string;
  initialMilestones?: any[];
  onMilestoneCreated?: () => void;
}) {
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Milestone>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [uploadModalState, setUploadModalState] = useState<{isOpen: boolean, milestoneId: string | null, title: string}>({
    isOpen: false,
    milestoneId: null,
    title: ""
  });

  const milestones = useMemo(() => {
    return initialMilestones.map(m => ({
      ...m,
      price: m.amount ? formatRupiah(m.amount) : (m.price || "Rp 0")
    }));
  }, [initialMilestones]);

  const progressPercentage = useMemo(() => {
    if (milestones.length === 0) return 0;
    const approvedCount = milestones.filter(m => m.status === "Approved" || m.status === "Disetujui").length;
    return Math.round((approvedCount / milestones.length) * 100);
  }, [milestones]);

  const handleCreateMilestone = async (data: { title: string; price: string; deadline: string; description: string }) => {
    setIsSubmitting(true);
    try {
      const amount = parseRupiah(data.price);
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          amount, // Sending as numeric string/number
          project_id: projectId,
          status: "Menunggu DP"
        }),
      });

      if (res.ok) {
        onMilestoneCreated?.();
      }
    } catch (err) {
      console.error("Failed to create milestone:", err);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingId) return;
    
    setIsSubmitting(true);
    try {
      const payload = { ...editForm, id: isEditingId };
      if (editForm.price) {
        (payload as any).amount = parseRupiah(editForm.price);
      }
      
      const res = await fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onMilestoneCreated?.();
        setIsEditingId(null);
      }
    } catch (err) {
      console.error("Failed to update milestone:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseRupiah(e.target.value);
    const formattedValue = formatRupiah(rawValue);
    setEditForm({ ...editForm, price: formattedValue });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus milestone ini?")) return;
    
    try {
      const res = await fetch(`/api/milestones?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onMilestoneCreated?.();
      }
    } catch (err) {
      console.error("Failed to delete milestone:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
      case "Disetujui": return "var(--accent)"; 
      case "Dalam Pengerjaan": 
      case "In Progress": return "var(--cyan)";
      case "Menunggu Persetujuan": 
      case "Review": return "var(--primary-light)";
      case "Menunggu DP": return "var(--warning)"; 
      default: return "#E2E8F0";
    }
  };

  return (
    <>
      <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", width: "100%", display: "flex", flexDirection: "column" }}>
        
        {/* Header & Progres Keseluruhan */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Target Pencapaian {clientName ? `— ${clientName}` : ""}</h3>
              <p style={{ color: "rgba(226, 232, 240, 0.5)", fontSize: "13px" }}>Kelola tahapan dan unggah bukti proyek.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Plus size={16} /> Buat Milestone
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", fontWeight: "700" }}>
              <span style={{ color: "rgba(226, 232, 240, 0.6)" }}>Kemajuan Keseluruhan</span>
              <span style={{ color: progressPercentage === 100 ? "var(--accent)" : "var(--cyan)" }}>{progressPercentage}%</span>
            </div>
            <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: progressPercentage === 100 ? "var(--accent)" : "var(--gradient-primary)",
                  boxShadow: `0 0 10px ${progressPercentage === 100 ? "var(--accent)" : "var(--cyan)"}40`
                }}
              />
            </div>
          </div>
        </div>

        {/* Daftar Milestone */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <AnimatePresence>
            {milestones.map((milestone) => {
              const isLocked = milestone.status === "Disetujui" || milestone.status === "Menunggu Persetujuan";
              const isEditing = isEditingId === milestone.id;

              if (isEditing) {
                return (
                  <motion.form 
                    key={milestone.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onSubmit={handleEditSubmit}
                    style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <input required value={editForm.title || ""} onChange={e => setEditForm({...editForm, title: e.target.value})} style={inputStyle} />
                      <input required value={editForm.price || ""} onChange={handleEditPriceChange} style={inputStyle} />
                      <input required type="date" value={editForm.deadline || ""} onChange={e => setEditForm({...editForm, deadline: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => setIsEditingId(null)} style={cancelBtnStyle}>Batal</button>
                      <button type="submit" style={saveBtnStyle}>Perbarui</button>
                    </div>
                  </motion.form>
                );
              }

              return (
                <motion.div
                  key={milestone.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    background: "rgba(255, 255, 255, 0.01)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>{milestone.title}</h4>
                        {isLocked && <Lock size={12} style={{ color: "rgba(255,255,255,0.3)" }} title="Terkunci dari penyuntingan" />}
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "rgba(226, 232, 240, 0.5)", fontWeight: "500" }}>
                        <span>{milestone.price}</span>
                        <span>•</span>
                        <span>Jatuh tempo {milestone.deadline}</span>
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: "6px 12px", 
                      borderRadius: "8px", 
                      fontSize: "11px", 
                      fontWeight: "800", 
                      textTransform: "uppercase",
                      background: `${getStatusColor(milestone.status)}15`,
                      color: getStatusColor(milestone.status),
                      border: `1px solid ${getStatusColor(milestone.status)}30`,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      {milestone.status === "Disetujui" && <CheckCircle2 size={12} />}
                      {milestone.status === "Menunggu DP" && <Clock size={12} />}
                      {milestone.status}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    
                    {/* Aksi: Upload Bukti */}
                    <div>
                      {milestone.status === "Menunggu DP" ? (
                         <div style={{ fontSize: "12px", color: "var(--warning)", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                           <Clock size={14} /> Unggahan terkunci sampai DP dibayar
                         </div>
                      ) : milestone.status === "Disetujui" ? (
                         <div style={{ fontSize: "12px", color: "var(--accent)", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                           <CheckCircle2 size={14} /> Selesai & Disetujui
                         </div>
                      ) : (
                        <button
                          onClick={() => setUploadModalState({ isOpen: true, milestoneId: milestone.id, title: milestone.title })}
                          style={{
                            background: "rgba(6, 182, 212, 0.1)",
                            color: "var(--cyan)",
                            border: "1px solid rgba(6, 182, 212, 0.3)",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = "rgba(6, 182, 212, 0.2)"}
                          onMouseOut={(e) => e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)"}
                        >
                          <UploadCloud size={14} /> Upload Bukti
                        </button>
                      )}
                    </div>

                    {/* Aksi: CRUD (Edit/Hapus) */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      {!isLocked && (
                        <>
                          <button 
                            onClick={() => { setIsEditingId(milestone.id); setEditForm(milestone); }}
                            style={iconBtnStyle}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(milestone.id)}
                            style={{ ...iconBtnStyle, color: "var(--danger)" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <CreateMilestoneModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMilestone}
      />

      <UploadEvidenceModal 
        isOpen={uploadModalState.isOpen} 
        onClose={() => setUploadModalState({ ...uploadModalState, isOpen: false })} 
        milestoneId={uploadModalState.milestoneId}
        milestoneTitle={uploadModalState.title}
      />
    </>
  );
}

// Gaya Bersama (Shared Styles)
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  outline: "none",
  fontSize: "13px"
};

const iconBtnStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  color: "rgba(226, 232, 240, 0.5)",
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s"
};

const cancelBtnStyle = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.5)",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: "600" as const,
  cursor: "pointer"
};

const saveBtnStyle = {
  background: "var(--gradient-primary)",
  border: "none",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "700" as const,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(26,54,240,0.2)"
};
