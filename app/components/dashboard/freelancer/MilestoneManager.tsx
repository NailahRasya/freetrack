"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, CheckCircle2, Lock, UploadCloud, Clock } from "lucide-react";
import UploadEvidenceModal from "./UploadEvidenceModal";

import CreateMilestoneModal from "./CreateMilestoneModal";
import { useProjects } from "@/lib/hooks/useProjects";
import { useContacts } from "@/lib/hooks/useContacts";
import { ChevronDown, User, Briefcase as BriefcaseIcon } from "lucide-react";

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
  initialMilestones,
  onMilestoneCreated,
  readOnly = false
}: { 
  clientName?: string; 
  projectId?: string;
  initialMilestones?: any[];
  onMilestoneCreated?: () => void;
  readOnly?: boolean;
}) {
  const { contacts } = useContacts();
  const { projects } = useProjects();
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Milestone>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Internal selection state for dashboard usage
  const [localProjectId, setLocalProjectId] = useState<string | null>(projectId || null);
  const [localMilestones, setLocalMilestones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (projectId) setLocalProjectId(projectId);
  }, [projectId]);

  // Fetch milestones if using local selection
  useEffect(() => {
    const fetchMilestones = async () => {
      const pid = projectId || localProjectId;
      if (!pid) {
        setLocalMilestones([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await fetch(`/api/milestones?project_id=${pid}`);
        const json = await res.json();
        setLocalMilestones(json.data || []);
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have initialMilestones from props
    if (!initialMilestones || initialMilestones.length === 0) {
       fetchMilestones();
    }
  }, [projectId, localProjectId, !!initialMilestones]);

  const activeProjects = useMemo(() => {
    return projects.filter(p => p.status !== "draft" && p.status !== "completed");
  }, [projects]);

  // Projects filtered by selected client (if any)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const clientFilteredProjects = useMemo(() => {
    if (!selectedClientId) return activeProjects;
    return activeProjects.filter(p => p.client_id === selectedClientId);
  }, [activeProjects, selectedClientId]);
  
  const [uploadModalState, setUploadModalState] = useState<{isOpen: boolean, milestoneId: string | null, title: string}>({
    isOpen: false,
    milestoneId: null,
    title: ""
  });

  const milestones = useMemo(() => {
    const source = (initialMilestones && initialMilestones.length > 0) ? initialMilestones : localMilestones;
    return source.map(m => ({
      ...m,
      price: m.amount ? formatRupiah(m.amount) : (m.price || "Rp 0")
    }));
  }, [initialMilestones, localMilestones]);

  const progressPercentage = useMemo(() => {
    if (milestones.length === 0) return 0;
    const approvedCount = milestones.filter(m => 
      ["Approved", "Disetujui", "Completed", "Waiting for Approval", "Menunggu Persetujuan"].includes(m.status)
    ).length;
    return Math.round((approvedCount / milestones.length) * 100);
  }, [milestones]);

  const handleCreateMilestone = async (data: { title: string; price: string; deadline: string; description: string; project_id?: string }) => {
    setIsSubmitting(true);
    try {
      const amount = parseRupiah(data.price);
      const finalProjectId = data.project_id || projectId || localProjectId;

      if (!finalProjectId) {
        alert("Silakan pilih proyek/klien terlebih dahulu.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          amount,
          project_id: finalProjectId,
          status: "Menunggu DP"
        }),
      });

      if (res.ok) {
        // Refresh local milestones if we are managing them
        if (!initialMilestones || initialMilestones.length === 0) {
          const r = await fetch(`/api/milestones?project_id=${finalProjectId}`);
          const j = await r.json();
          setLocalMilestones(j.data || []);
        }
        onMilestoneCreated?.();
        setIsModalOpen(false); // Only close on success
      } else {
        const errorData = await res.json();
        console.error("Server error creating milestone:", errorData.error);
        alert("Gagal membuat milestone: " + (errorData.error || "Terjadi kesalahan server"));
      }
    } catch (err) {
      console.error("Network error creating milestone:", err);
      alert("Gagal membuat milestone: Masalah koneksi jaringan");
    } finally {
      setIsSubmitting(false);
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                Target Pencapaian {clientName || (localProjectId && activeProjects.find(p => p.id === localProjectId)?.client?.full_name) ? `— ${clientName || activeProjects.find(p => p.id === localProjectId)?.client?.full_name}` : ""}
              </h3>
              <p style={{ color: "rgba(226, 232, 240, 0.5)", fontSize: "13px" }}>Kelola tahapan dan unggah bukti proyek.</p>
            </div>
            {!readOnly && (
              <button 
                onClick={() => setIsModalOpen(true)}
                style={{ 
                  padding: "8px 16px", 
                  fontSize: "12px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  background: "var(--gradient-primary)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(26,54,240,0.3)"
                }}
              >
                <Plus size={14} /> Buat Milestone
              </button>
            )}
          </div>

          {/* Selector Proyek (Muncul jika tidak ada projectId dari props) */}
          {!projectId && (
            <div style={{ 
              display: "flex", 
              gap: "12px", 
              marginBottom: "20px", 
              background: "rgba(255,255,255,0.03)", 
              padding: "12px", 
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.05)"
            }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: "800", color: "rgba(226,232,240,0.3)", textTransform: "uppercase" }}>Klien</label>
                <div style={{ position: "relative" }}>
                  <User size={12} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                  <select 
                    value={selectedClientId || ""} 
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      setLocalProjectId(null);
                    }}
                    style={{ ...selectStyle, paddingLeft: "28px" }}
                  >
                    <option value="" style={{ background: "#0F172A" }}>Pilih Klien...</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.client?.id} style={{ background: "#0F172A" }}>
                        {c.client?.full_name || "Tanpa Nama"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "10px", fontWeight: "800", color: "rgba(226,232,240,0.3)", textTransform: "uppercase" }}>Proyek</label>
                <div style={{ position: "relative" }}>
                  <BriefcaseIcon size={12} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
                  <select 
                    value={localProjectId || ""} 
                    onChange={(e) => setLocalProjectId(e.target.value)}
                    style={{ ...selectStyle, paddingLeft: "28px" }}
                  >
                    <option value="" style={{ background: "#0F172A" }}>Pilih Proyek...</option>
                    {clientFilteredProjects.map(p => (
                      <option key={p.id} value={p.id} style={{ background: "#0F172A" }}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

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
            {milestones.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.01)",
                  borderRadius: "16px",
                  border: "1px dashed rgba(255,255,255,0.1)",
                  color: "rgba(226, 232, 240, 0.3)",
                  fontSize: "14px"
                }}
              >
                {isLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <Clock size={16} className="animate-spin" /> Memuat...
                  </div>
                ) : localProjectId || projectId ? "Belum ada milestone untuk proyek ini." : "Silakan pilih proyek untuk mengelola milestone."}
              </motion.div>
            ) : milestones.map((milestone) => {
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
                        {isLocked && (
                          <span title="Terkunci dari penyuntingan" style={{ display: "inline-flex" }}>
                            <Lock size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                          </span>
                        )}
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
                      {!readOnly && (
                        <>
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
                        </>
                      )}
                    </div>

                    {/* Aksi: CRUD (Edit/Hapus) */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      {!readOnly && !isLocked && (
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
        isSubmitting={isSubmitting}
        projects={activeProjects}
        defaultProjectId={projectId || localProjectId || undefined}
      />

      <UploadEvidenceModal 
        isOpen={uploadModalState.isOpen} 
        onClose={() => setUploadModalState({ ...uploadModalState, isOpen: false })} 
        milestoneId={uploadModalState.milestoneId}
        milestoneTitle={uploadModalState.title}
        onSuccess={onMilestoneCreated}
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

const selectStyle = {
  width: "100%",
  padding: "8px 12px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
  outline: "none",
  cursor: "pointer",
  appearance: "none" as const
};
