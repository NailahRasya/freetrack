"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertTriangle, Briefcase, Calendar, DollarSign } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import { useUser } from "../../../dashboard/layout";
import { formatRupiah, parseRupiah } from "@/utils/format";
import CustomFilterDropdown from "../CustomFilterDropdown";

interface ChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  clientId?: string;
  onSuccess?: () => void;
}

export default function ChangeRequestModal({ 
  isOpen, 
  onClose, 
  projectId: propProjectId, 
  clientId: propClientId,
  onSuccess 
}: ChangeRequestModalProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form fields state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [budgetDisplay, setBudgetDisplay] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reason, setReason] = useState("");

  // Projects list state
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Sync propProjectId if provided
  useEffect(() => {
    if (propProjectId) {
      setSelectedProjectId(propProjectId);
    }
  }, [propProjectId]);

  // Fetch active projects for this freelancer if isOpen is true
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, title, client_id, budget, deadline, client:profiles!projects_client_id_fkey(full_name)")
          .eq("freelancer_id", user.id)
          .eq("status", "active");

        if (error) throw error;
        setActiveProjects(data || []);
        
        // Auto-select if there's only 1 project and no prop passed
        if (data && data.length === 1 && !propProjectId) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching active projects:", err);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [isOpen, user?.id, propProjectId]);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setBudgetDisplay("");
      setDeadline("");
      setReason("");
      if (propProjectId) {
        setSelectedProjectId(propProjectId);
      } else if (activeProjects.length > 0) {
        setSelectedProjectId(activeProjects[0].id);
      } else {
        setSelectedProjectId("");
      }
    }
  }, [isOpen, propProjectId]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseRupiah(e.target.value);
    if (!rawValue || rawValue === "0") {
      setBudgetDisplay("");
    } else {
      setBudgetDisplay(formatRupiah(rawValue));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalProjectId = propProjectId || selectedProjectId;

    if (!finalProjectId) {
      Swal.fire({
        icon: "warning",
        title: "Proyek Belum Dipilih",
        text: "Silakan pilih proyek aktif terlebih dahulu.",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        confirmButtonColor: "var(--warning)",
      });
      return;
    }

    if (!reason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Alasan Diperlukan",
        text: "Silakan isi alasan permintaan perubahan.",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        confirmButtonColor: "var(--warning)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const budgetAmount = budgetDisplay ? parseRupiah(budgetDisplay).toString() : null;

      const res = await fetch("/api/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: finalProjectId,
          reason: reason.trim(),
          new_budget: budgetAmount,
          new_deadline: deadline || null
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengajukan permintaan perubahan.");
      }

      setIsSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error("Failed to submit change request:", err);
      Swal.fire({
        icon: "error",
        title: "Pengajuan Gagal",
        text: err.message || "Terjadi kesalahan saat mengirimkan permintaan.",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          {/* Latar Belakang Gelap (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(6, 13, 32, 0.8)",
              backdropFilter: "blur(8px)"
            }}
          />

          {/* Kotak Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "550px",
              background: "rgba(13, 27, 62, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
              zIndex: 1
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "rgba(255,255,255,0.05)",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--warning)" }}>
                  <AlertTriangle size={20} />
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>
                  Ajukan Permintaan Perubahan
                </h2>
              </div>
              <p style={{ color: "rgba(226, 232, 240, 0.6)", fontSize: "14px", marginLeft: "52px" }}>
                Ajukan permintaan untuk memperbarui lingkup proyek, lini masa, atau anggaran. Klien perlu meninjau dan menyetujui perubahan ini.
              </p>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "16px",
                  padding: "40px 0"
                }}
              >
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                  <Send size={32} />
                </div>
                <h3 style={{ fontSize: "18px", color: "#fff", fontWeight: "700" }}>Permintaan Perubahan Terkirim!</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", textAlign: "center" }}>Klien telah diberitahu melalui pesan chat mengenai permintaan Anda.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Project Selector (only visible if propProjectId is not provided) */}
                {!propProjectId && (
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                      Pilih Proyek Aktif <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <CustomFilterDropdown
                      value={selectedProjectId}
                      onChange={(val) => setSelectedProjectId(val)}
                      placeholder="Pilih Proyek..."
                      options={activeProjects.map((p) => ({
                        id: p.id,
                        label: `${p.title}${p.client?.full_name ? ` — ${p.client.full_name}` : ""}`
                      }))}
                      triggerStyle={{
                        background: "rgba(0,0,0,0.2)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        fontSize: "14px",
                      }}
                    />
                    {activeProjects.length === 0 && !isLoadingProjects && (
                      <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                        Anda tidak memiliki proyek aktif saat ini.
                      </p>
                    )}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                      Jumlah Anggaran Baru (Opsional)
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "16px", top: "12px", color: "rgba(255,255,255,0.4)", fontSize: "14px", fontWeight: "600" }}>Rp</span>
                      <input 
                        type="text" 
                        placeholder="misal 15.000.000"
                        value={budgetDisplay}
                        onChange={handleBudgetChange}
                        style={{
                          width: "100%",
                          padding: "12px 16px 12px 40px",
                          background: "rgba(0,0,0,0.2)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "10px",
                          color: "#fff",
                          outline: "none",
                          fontSize: "14px"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--primary-light)"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                      Tenggat Waktu Baru (Opsional)
                    </label>
                    <input 
                      type="date" 
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(0,0,0,0.2)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#fff",
                        outline: "none",
                        fontSize: "14px",
                        colorScheme: "dark"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--primary-light)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                    Alasan Perubahan <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <textarea 
                    required
                    placeholder="Jelaskan scope creep atau alasan permintaan perubahan secara mendetail..."
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      outline: "none",
                      fontSize: "14px",
                      resize: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary-light)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: "12px 24px",
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = "#fff"}
                    onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!propProjectId && !selectedProjectId)}
                    className="btn-primary"
                    style={{
                      padding: "12px 32px",
                      opacity: (isSubmitting || (!propProjectId && !selectedProjectId)) ? 0.7 : 1,
                      cursor: (isSubmitting || (!propProjectId && !selectedProjectId)) ? "not-allowed" : "pointer"
                    }}
                  >
                    {isSubmitting ? "Mengirim..." : "Ajukan Permintaan"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
