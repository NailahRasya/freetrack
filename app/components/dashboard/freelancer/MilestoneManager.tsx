"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, CheckCircle2, Lock, UploadCloud, Clock } from "lucide-react";
import UploadEvidenceModal from "./UploadEvidenceModal";

type MilestoneStatus = "Waiting DP" | "In Progress" | "Pending Approval" | "Approved";

interface Milestone {
  id: number;
  title: string;
  price: string;
  deadline: string;
  status: MilestoneStatus;
}

const initialMilestones: Milestone[] = [
  { id: 1, title: "Wireframing & UI Design", price: "Rp 3.000.000", deadline: "2026-05-10", status: "Approved" },
  { id: 2, title: "Frontend Development", price: "Rp 5.000.000", deadline: "2026-05-20", status: "In Progress" },
  { id: 3, title: "Backend Integration", price: "Rp 4.000.000", deadline: "2026-06-05", status: "Waiting DP" }
];

export default function MilestoneManager() {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [isEditingId, setIsEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Milestone>>({});
  const [isAdding, setIsAdding] = useState(false);
  
  const [uploadModalState, setUploadModalState] = useState<{isOpen: boolean, milestoneId: number | null, title: string}>({
    isOpen: false,
    milestoneId: null,
    title: ""
  });

  // Menghitung persentase progres
  const progressPercentage = useMemo(() => {
    if (milestones.length === 0) return 0;
    const approvedCount = milestones.filter(m => m.status === "Approved").length;
    return Math.round((approvedCount / milestones.length) * 100);
  }, [milestones]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title || !editForm.price || !editForm.deadline) return;
    
    const newId = Math.max(...milestones.map(m => m.id), 0) + 1;
    setMilestones([...milestones, {
      id: newId,
      title: editForm.title,
      price: editForm.price,
      deadline: editForm.deadline,
      status: "Waiting DP" // Milestone baru default ke Waiting DP sampai klien menyetujui kontrak
    }]);
    setIsAdding(false);
    setEditForm({});
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMilestones(milestones.map(m => 
      m.id === isEditingId 
        ? { ...m, ...editForm } as Milestone 
        : m
    ));
    setIsEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: number) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case "Approved": return "var(--accent)"; // Emerald
      case "In Progress": return "var(--cyan)";
      case "Pending Approval": return "var(--primary-light)";
      case "Waiting DP": return "var(--warning)"; // Orange
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
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Project Milestones</h3>
              <p style={{ color: "rgba(226, 232, 240, 0.5)", fontSize: "13px" }}>Manage stages and upload evidence.</p>
            </div>
            <button 
              onClick={() => { setIsAdding(true); setEditForm({}); setIsEditingId(null); }}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              <Plus size={16} /> Add Milestone
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", fontWeight: "700" }}>
              <span style={{ color: "rgba(226, 232, 240, 0.6)" }}>Overall Progress</span>
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

        {/* Formulir Tambah Inline */}
        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddSubmit}
              style={{
                background: "rgba(26, 54, 240, 0.05)",
                border: "1px solid rgba(26, 54, 240, 0.2)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
                overflow: "hidden"
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "12px" }}>Create New Milestone</h4>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <input required placeholder="Milestone Title" value={editForm.title || ""} onChange={e => setEditForm({...editForm, title: e.target.value})} style={inputStyle} />
                <input required placeholder="Price (Rp)" value={editForm.price || ""} onChange={e => setEditForm({...editForm, price: e.target.value})} style={inputStyle} />
                <input required type="date" value={editForm.deadline || ""} onChange={e => setEditForm({...editForm, deadline: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setIsAdding(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={saveBtnStyle}>Save</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Daftar Milestone */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <AnimatePresence>
            {milestones.map((milestone) => {
              const isLocked = milestone.status === "Approved" || milestone.status === "Pending Approval";
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
                      <input required value={editForm.price || ""} onChange={e => setEditForm({...editForm, price: e.target.value})} style={inputStyle} />
                      <input required type="date" value={editForm.deadline || ""} onChange={e => setEditForm({...editForm, deadline: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => setIsEditingId(null)} style={cancelBtnStyle}>Cancel</button>
                      <button type="submit" style={saveBtnStyle}>Update</button>
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
                        {isLocked && <Lock size={12} style={{ color: "rgba(255,255,255,0.3)" }} title="Locked from editing" />}
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "rgba(226, 232, 240, 0.5)", fontWeight: "500" }}>
                        <span>{milestone.price}</span>
                        <span>•</span>
                        <span>Due {milestone.deadline}</span>
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
                      {milestone.status === "Approved" && <CheckCircle2 size={12} />}
                      {milestone.status === "Waiting DP" && <Clock size={12} />}
                      {milestone.status}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    
                    {/* Aksi: Upload Bukti */}
                    <div>
                      {milestone.status === "Waiting DP" ? (
                         <div style={{ fontSize: "12px", color: "var(--warning)", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                           <Clock size={14} /> Upload locked until DP is paid
                         </div>
                      ) : milestone.status === "Approved" ? (
                         <div style={{ fontSize: "12px", color: "var(--accent)", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                           <CheckCircle2 size={14} /> Completed & Approved
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
                            onClick={() => { setIsEditingId(milestone.id); setEditForm(milestone); setIsAdding(false); }}
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
