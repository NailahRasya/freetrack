"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Plus, Trash2, Calendar, DollarSign, 
  Briefcase, FileText, Clock, ChevronRight, CheckCircle2 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Milestone {
  title: string;
  amount: string;
  description: string;
  deadline: string;
}

interface ContractInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSuccess?: () => void;
}

export default function ContractInitiationModal({ isOpen, onClose, project, onSuccess }: ContractInitiationModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    initiation_details: "",
    deliverables: "",
    timeline: "",
    payment_breakdown: ""
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "Initial Research & Design", amount: "", description: "", deadline: "" }
  ]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", amount: "", description: "", deadline: "" }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // 1. Create contract record
      const { data: contract, error: contractError } = await supabase
        .from("contracts")
        .insert({
          project_id: project.id,
          freelancer_id: user.id,
          client_id: project.client_id,
          initiation_details: form.initiation_details,
          deliverables: form.deliverables,
          timeline: form.timeline,
          payment_breakdown: form.payment_breakdown,
          status: 'pending'
        })
        .select()
        .single();

      if (contractError) throw contractError;

      // 2. Create milestones in the milestones table
      const milestoneData = milestones.map(m => ({
        project_id: project.id,
        client_id: project.client_id,
        freelancer_id: user.id,
        title: m.title,
        description: m.description,
        amount: parseFloat(m.amount.replace(/[^0-9.]/g, "")) || 0,
        deadline: m.deadline,
        status: 'Contract Pending',
        created_by: user.id
      }));

      const { error: milError } = await supabase
        .from("milestones")
        .insert(milestoneData);

      if (milError) throw milError;

      // 3. Update project status
      const { error: projError } = await supabase
        .from("projects")
        .update({ 
          status: 'contract_pending',
          contract_id: contract.id,
          freelancer_id: user.id // Lock freelancer to project
        })
        .eq("id", project.id);

      if (projError) throw projError;

      // 4. Send chat message
      await supabase.from("messages").insert({
        project_id: project.id,
        sender_id: user.id,
        receiver_id: project.client_id,
        content: `Saya telah mengirimkan proposal kontrak untuk proyek "${project.title}". Silakan tinjau milestone dan detail pembayarannya.`
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Contract initiation failed:", err);
      alert("Gagal mengirim kontrak. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={overlayStyle}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={modalStyle}
        >
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={iconBoxStyle}>
                <FileText size={20} color="#4D63FF" />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Inisiasi Kontrak</h3>
                <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>Proyek: {project.title}</p>
              </div>
            </div>
            <button onClick={onClose} style={closeButtonStyle}><X size={20} /></button>
          </div>

          {/* Stepper */}
          <div style={stepperContainer}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: step >= s ? "linear-gradient(135deg, #4D63FF, #06B6D4)" : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "800", color: "#fff",
                  boxShadow: step >= s ? "0 0 15px rgba(77,99,255,0.3)" : "none"
                }}>{step > s ? <CheckCircle2 size={16} /> : s}</div>
                {s < 3 && <div style={{ width: "40px", height: "2px", background: step > s ? "#4D63FF" : "rgba(255,255,255,0.05)" }} />}
              </div>
            ))}
          </div>

          {/* Body Content */}
          <div style={bodyStyle}>
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={formSection}>
                <label style={labelStyle}>Ringkasan Pendahuluan</label>
                <textarea 
                  placeholder="Jelaskan secara singkat bagaimana Anda akan memulai proyek ini..."
                  style={textareaStyle}
                  value={form.initiation_details}
                  onChange={(e) => setForm({...form, initiation_details: e.target.value})}
                />
                
                <label style={labelStyle}>Deliverables (Hasil Akhir)</label>
                <textarea 
                  placeholder="Apa saja yang akan diterima klien? Contoh: File desain Figma, Source code, Dokumentasi API..."
                  style={textareaStyle}
                  value={form.deliverables}
                  onChange={(e) => setForm({...form, deliverables: e.target.value})}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={formSection}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <label style={labelStyle}>Perencanaan Milestone</label>
                  <button onClick={addMilestone} style={addMilestoneBtn}>
                    <Plus size={14} /> Tambah
                  </button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "350px", overflowY: "auto", paddingRight: "10px" }}>
                  {milestones.map((m, idx) => (
                    <div key={idx} style={milestoneCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#4D63FF", textTransform: "uppercase" }}>Milestone {idx + 1}</span>
                        {milestones.length > 1 && (
                          <button onClick={() => removeMilestone(idx)} style={{ color: "rgba(255,77,106,0.5)", background: "none", border: "none", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={inputWrapper}>
                          <FileText size={14} style={inputIcon} />
                          <input 
                            placeholder="Nama Milestone" 
                            style={inputStyle}
                            value={m.title}
                            onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                          />
                        </div>
                        <div style={inputWrapper}>
                          <DollarSign size={14} style={inputIcon} />
                          <input 
                            placeholder="Anggaran (IDR)" 
                            style={inputStyle}
                            value={m.amount}
                            onChange={(e) => updateMilestone(idx, 'amount', e.target.value)}
                          />
                        </div>
                        <div style={{ ...inputWrapper, gridColumn: "span 2" }}>
                          <Calendar size={14} style={inputIcon} />
                          <input 
                            type="date" 
                            style={inputStyle}
                            value={m.deadline}
                            onChange={(e) => updateMilestone(idx, 'deadline', e.target.value)}
                          />
                        </div>
                        <textarea 
                          placeholder="Deskripsi pengerjaan..." 
                          style={{ ...textareaStyle, gridColumn: "span 2", minHeight: "60px", fontSize: "13px" }}
                          value={m.description}
                          onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={formSection}>
                <label style={labelStyle}>Estimasi Timeline</label>
                <div style={inputWrapper}>
                  <Clock size={16} style={inputIcon} />
                  <input 
                    placeholder="Contoh: 4 Minggu / 2 Bulan" 
                    style={inputStyle}
                    value={form.timeline}
                    onChange={(e) => setForm({...form, timeline: e.target.value})}
                  />
                </div>

                <label style={{ ...labelStyle, marginTop: "20px" }}>Rincian Pembayaran</label>
                <textarea 
                  placeholder="Misal: 30% DP, 40% Tengah Proyek, 30% Final..."
                  style={textareaStyle}
                  value={form.payment_breakdown}
                  onChange={(e) => setForm({...form, payment_breakdown: e.target.value})}
                />

                <div style={summaryBox}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "rgba(226,232,240,0.4)", fontSize: "13px" }}>Total Milestones</span>
                    <span style={{ color: "#fff", fontWeight: "700" }}>{milestones.length}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(226,232,240,0.4)", fontSize: "13px" }}>Total Anggaran</span>
                    <span style={{ color: "#00FFA3", fontWeight: "900" }}>
                      IDR {milestones.reduce((acc, m) => acc + (parseFloat(m.amount) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} style={backBtn}>Kembali</button>
            ) : (
              <div />
            )}
            
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} style={nextBtn}>
                Lanjut <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                style={submitBtn}
              >
                {loading ? "Mengirim..." : (
                  <>
                    <Send size={18} /> Kirim Proposal Kontrak
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
};

const modalStyle: React.CSSProperties = {
  width: "100%", maxWidth: "600px", background: "rgba(13, 25, 48, 0.95)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "32px", overflow: "hidden",
  display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
};

const headerStyle: React.CSSProperties = {
  padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)",
  display: "flex", justifyContent: "space-between", alignItems: "center"
};

const iconBoxStyle: React.CSSProperties = {
  width: "44px", height: "44px", borderRadius: "14px", background: "rgba(77, 99, 255, 0.1)",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const closeButtonStyle: React.CSSProperties = {
  background: "none", border: "none", color: "rgba(226,232,240,0.3)", cursor: "pointer"
};

const stepperContainer: React.CSSProperties = {
  display: "flex", justifyContent: "center", gap: "0px", padding: "20px", background: "rgba(255,255,255,0.02)"
};

const bodyStyle: React.CSSProperties = {
  padding: "32px", flex: 1, minHeight: "450px"
};

const formSection: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: "16px"
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px", fontWeight: "800", color: "rgba(226,232,240,0.6)", textTransform: "uppercase", letterSpacing: "1px"
};

const textareaStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px", padding: "16px", color: "#fff", fontSize: "14px", minHeight: "100px",
  outline: "none", resize: "none", transition: "all 0.2s"
};

const inputWrapper: React.CSSProperties = {
  position: "relative", display: "flex", alignItems: "center"
};

const inputIcon: React.CSSProperties = {
  position: "absolute", left: "16px", color: "rgba(226,232,240,0.3)"
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px", padding: "12px 12px 12px 44px", color: "#fff", fontSize: "14px", outline: "none"
};

const milestoneCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "20px", padding: "20px"
};

const addMilestoneBtn: React.CSSProperties = {
  padding: "6px 12px", background: "rgba(77, 99, 255, 0.1)", color: "#4D63FF",
  border: "none", borderRadius: "8px", fontSize: "11px", fontWeight: "800", cursor: "pointer",
  display: "flex", alignItems: "center", gap: "6px"
};

const summaryBox: React.CSSProperties = {
  marginTop: "20px", padding: "20px", background: "rgba(16, 185, 129, 0.05)",
  border: "1px solid rgba(16, 185, 129, 0.1)", borderRadius: "20px"
};

const footerStyle: React.CSSProperties = {
  padding: "24px 32px", borderTop: "1px solid rgba(255,255,255,0.05)",
  display: "flex", justifyContent: "space-between", alignItems: "center"
};

const backBtn: React.CSSProperties = {
  background: "none", border: "none", color: "rgba(226,232,240,0.4)", fontSize: "14px", fontWeight: "700", cursor: "pointer"
};

const nextBtn: React.CSSProperties = {
  padding: "12px 24px", background: "rgba(255,255,255,0.05)", color: "#fff",
  border: "none", borderRadius: "14px", fontSize: "14px", fontWeight: "800", cursor: "pointer",
  display: "flex", alignItems: "center", gap: "8px"
};

const submitBtn: React.CSSProperties = {
  padding: "14px 28px", background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff",
  border: "none", borderRadius: "16px", fontSize: "14px", fontWeight: "800", cursor: "pointer",
  display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)"
};
