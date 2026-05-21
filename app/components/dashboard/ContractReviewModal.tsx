"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, AlertCircle, FileText, Calendar, DollarSign, 
  ChevronRight, Lock, Unlock, ShieldCheck, Info, Clock
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Swal from "sweetalert2";

interface ContractReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSuccess?: () => void;
}

export default function ContractReviewModal({ isOpen, onClose, project, onSuccess }: ContractReviewModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen && project?.id) {
      fetchContractData();
    }
  }, [isOpen, project]);

  const fetchContractData = async () => {
    setFetching(true);
    try {
      // 1. Fetch Contract
      const { data: con, error: conError } = await supabase
        .from("contracts")
        .select("*")
        .eq("project_id", project.id)
        .eq("status", "pending")
        .maybeSingle();

      if (conError) throw conError;
      setContract(con);

      // 2. Fetch Milestones associated with this project (sent with the contract)
      const { data: mils, error: milError } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", project.id)
        .eq("status", "Contract Pending");

      if (milError) throw milError;
      setMilestones(mils || []);
    } catch (err) {
      console.error("Error fetching contract data:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleApproval = async (approve: boolean) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      if (approve) {
        // 1. Update Contract Status
        const { error: conError } = await supabase
          .from("contracts")
          .update({ status: 'approved', locked: true })
          .eq("id", contract.id);
        if (conError) throw conError;

        // 2. Update Project Status to Active
        const { error: projError } = await supabase
          .from("projects")
          .update({ status: 'active' })
          .eq("id", project.id);
        if (projError) throw projError;

        // 3. Update Milestones to Active/In Progress
        const { error: milError } = await supabase
          .from("milestones")
          .update({ status: 'In Progress' })
          .eq("project_id", project.id)
          .eq("status", "Contract Pending");
        if (milError) throw milError;

        // 4. Send notification message
        await supabase.from("messages").insert({
          project_id: project.id,
          sender_id: user.id,
          receiver_id: project.freelancer_id,
          content: `Kontrak digital untuk proyek "${project.title}" telah disetujui! Proyek kini berstatus Aktif. Mari kita mulai pengerjaannya.`
        });

        Swal.fire({
          icon: 'success',
          title: 'Kontrak Disetujui!',
          text: 'Proyek kini aktif dan freelancer telah diberitahu.',
          background: '#0D1930',
          color: '#fff',
          confirmButtonColor: '#10B981'
        });
      } else {
        // Reject Logic
        const { error: conError } = await supabase
          .from("contracts")
          .update({ status: 'rejected' })
          .eq("id", contract.id);
        if (conError) throw conError;

        const { error: projError } = await supabase
          .from("projects")
          .update({ status: 'pending_freelancer' }) // Send back to freelancer
          .eq("id", project.id);
        if (projError) throw projError;

        // Delete pending milestones? Or just mark as rejected
        await supabase
          .from("milestones")
          .delete()
          .eq("project_id", project.id)
          .eq("status", "Contract Pending");

        await supabase.from("messages").insert({
          project_id: project.id,
          sender_id: user.id,
          receiver_id: project.freelancer_id,
          content: `Saya telah meninjau proposal kontrak untuk "${project.title}" namun ada beberapa hal yang perlu disesuaikan kembali. Mari diskusikan.`
        });

        Swal.fire({
          icon: 'info',
          title: 'Kontrak Dikembalikan',
          text: 'Proposal telah dikembalikan ke freelancer untuk revisi.',
          background: '#0D1930',
          color: '#fff',
          confirmButtonColor: '#4D63FF'
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Approval action failed:", err);
      alert("Terjadi kesalahan saat memproses persetujuan.");
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
                <ShieldCheck size={20} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Tinjau Kontrak</h3>
                <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>{project.title}</p>
              </div>
            </div>
            <button onClick={onClose} style={closeButtonStyle}><X size={20} /></button>
          </div>

          {fetching ? (
            <div style={{ padding: "100px", textAlign: "center", color: "rgba(226,232,240,0.3)" }}>
              <div className="loader" style={{ margin: "0 auto 20px" }} />
              Memuat detail kontrak...
            </div>
          ) : !contract ? (
            <div style={{ padding: "60px 40px", textAlign: "center" }}>
              <AlertCircle size={48} color="#F59E0B" style={{ margin: "0 auto 20px", opacity: 0.5 }} />
              <p style={{ color: "rgba(226,232,240,0.6)", fontSize: "15px" }}>
                Tidak ada proposal kontrak aktif untuk ditinjau saat ini.
              </p>
              <button onClick={onClose} style={{ marginTop: "24px", color: "#4D63FF", background: "none", border: "none", fontWeight: "700" }}>Tutup</button>
            </div>
          ) : (
            <div style={bodyStyle}>
              {/* Initiation Section */}
              <div style={reviewSection}>
                <div style={sectionHeader}><Info size={14} /> Ringkasan Inisiasi</div>
                <p style={reviewText}>{contract.initiation_details || "Tidak ada detail."}</p>
              </div>

              {/* Milestones Section */}
              <div style={reviewSection}>
                <div style={sectionHeader}><Calendar size={14} /> Rencana Milestone</div>
                <div style={milestoneGrid}>
                  {milestones.map((m, idx) => (
                    <div key={m.id} style={milestoneBox}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={milestoneNum}>#{idx + 1}</span>
                        <span style={milestoneAmount}>IDR {m.amount?.toLocaleString()}</span>
                      </div>
                      <h6 style={milestoneTitle}>{m.title}</h6>
                      <p style={milestoneDesc}>{m.description}</p>
                      <div style={milestoneDate}>Deadline: {new Date(m.deadline).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extras Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div style={reviewSection}>
                  <div style={sectionHeader}><Lock size={14} /> Deliverables</div>
                  <p style={reviewTextSmall}>{contract.deliverables || "Belum ditentukan."}</p>
                </div>
                <div style={reviewSection}>
                  <div style={sectionHeader}><Clock size={14} /> Timeline & Pembayaran</div>
                  <p style={reviewTextSmall}>
                    <strong>Timeline:</strong> {contract.timeline}<br />
                    <strong>Ketentuan:</strong> {contract.payment_breakdown}
                  </p>
                </div>
              </div>

              {/* Total Box */}
              <div style={totalBox}>
                <span style={{ fontSize: "14px", color: "rgba(226,232,240,0.5)" }}>Total Investasi Proyek</span>
                <span style={{ fontSize: "24px", fontWeight: "900", color: "#00FFA3" }}>
                  IDR {milestones.reduce((acc, m) => acc + (m.amount || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {contract && !fetching && (
            <div style={footerStyle}>
              <button 
                onClick={() => handleApproval(false)} 
                disabled={loading}
                style={rejectBtn}
              >
                Kembalikan / Revisi
              </button>
              <button 
                onClick={() => handleApproval(true)} 
                disabled={loading}
                style={approveBtn}
              >
                {loading ? "Memproses..." : (
                  <>
                    <Check size={18} /> Setujui Kontrak
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        .loader { width: 40px; height: 40px; border: 4px solid rgba(77,99,255,0.1); border-top-color: #4D63FF; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AnimatePresence>
  );
}

// Styles
const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001, padding: "20px"
};

const modalStyle: React.CSSProperties = {
  width: "100%", maxWidth: "700px", background: "rgba(13, 25, 48, 0.98)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "32px", overflow: "hidden",
  display: "flex", flexDirection: "column", boxShadow: "0 30px 60px rgba(0,0,0,0.6)"
};

const headerStyle: React.CSSProperties = {
  padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)",
  display: "flex", justifyContent: "space-between", alignItems: "center"
};

const iconBoxStyle: React.CSSProperties = {
  width: "44px", height: "44px", borderRadius: "14px", background: "rgba(16, 185, 129, 0.1)",
  display: "flex", alignItems: "center", justifyContent: "center"
};

const closeButtonStyle: React.CSSProperties = {
  background: "none", border: "none", color: "rgba(226,232,240,0.3)", cursor: "pointer"
};

const bodyStyle: React.CSSProperties = {
  padding: "32px", overflowY: "auto", maxHeight: "70vh"
};

const reviewSection: React.CSSProperties = {
  marginBottom: "24px"
};

const sectionHeader: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: "900",
  color: "rgba(226,232,240,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px"
};

const reviewText: React.CSSProperties = {
  fontSize: "15px", color: "rgba(226,232,240,0.8)", lineHeight: "1.7",
  padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)"
};

const reviewTextSmall: React.CSSProperties = {
  fontSize: "13px", color: "rgba(226,232,240,0.7)", lineHeight: "1.6",
  padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)"
};

const milestoneGrid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"
};

const milestoneBox: React.CSSProperties = {
  padding: "16px", background: "rgba(77, 99, 255, 0.03)", border: "1px solid rgba(77, 99, 255, 0.1)",
  borderRadius: "16px"
};

const milestoneNum: React.CSSProperties = {
  fontSize: "10px", fontWeight: "900", color: "#4D63FF"
};

const milestoneAmount: React.CSSProperties = {
  fontSize: "13px", fontWeight: "800", color: "#fff"
};

const milestoneTitle: React.CSSProperties = {
  fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "6px"
};

const milestoneDesc: React.CSSProperties = {
  fontSize: "12px", color: "rgba(226,232,240,0.4)", lineHeight: "1.5", marginBottom: "10px"
};

const milestoneDate: React.CSSProperties = {
  fontSize: "10px", color: "rgba(226,232,240,0.3)", fontWeight: "600"
};

const totalBox: React.CSSProperties = {
  padding: "24px", background: "linear-gradient(135deg, rgba(0,255,163,0.05), rgba(6,182,212,0.05))",
  borderRadius: "24px", border: "1px solid rgba(0,255,163,0.1)", display: "flex",
  flexDirection: "column", alignItems: "center", gap: "8px"
};

const footerStyle: React.CSSProperties = {
  padding: "24px 32px", borderTop: "1px solid rgba(255,255,255,0.05)",
  display: "flex", justifyContent: "space-between", gap: "16px"
};

const rejectBtn: React.CSSProperties = {
  flex: 1, padding: "14px", background: "rgba(255,77,106,0.05)", color: "#FF4D6A",
  border: "1px solid rgba(255,77,106,0.1)", borderRadius: "16px", fontSize: "14px", fontWeight: "800", cursor: "pointer"
};

const approveBtn: React.CSSProperties = {
  flex: 2, padding: "14px", background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff",
  border: "none", borderRadius: "16px", fontSize: "14px", fontWeight: "800", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)"
};
