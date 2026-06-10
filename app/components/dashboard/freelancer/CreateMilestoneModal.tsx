"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, DollarSign, Calendar, AlignLeft, Send, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

import { formatRupiah, parseRupiah } from "@/utils/format";

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (milestone: { title: string; price: string; deadline: string; description: string; project_id?: string }) => void;
  isSubmitting?: boolean;
  projects?: any[];
  defaultProjectId?: string;
  projectBudget?: number;
  existingMilestonesSum?: number;
}

export default function CreateMilestoneModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting, 
  defaultProjectId,
  projectBudget,
  existingMilestonesSum
}: CreateMilestoneModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    deadline: "",
    description: "",
    project_id: defaultProjectId || ""
  });

  // Effect to sync project selection when modal opens or defaultProjectId changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        price: "",
        deadline: "",
        description: "",
        project_id: defaultProjectId || ""
      });
    }
  }, [isOpen, defaultProjectId]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseRupiah(e.target.value);
    const formattedValue = formatRupiah(rawValue);
    setFormData({ ...formData, price: formattedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id) {
      Swal.fire({
        title: "Peringatan",
        text: "Proyek tidak valid atau belum dipilih.",
        icon: "warning",
        background: "#0F1B2E",
        color: "#fff",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "rounded-2xl border border-white/10 shadow-2xl"
        }
      });
      return;
    }

    // Client-side Budget Validation
    const newPrice = parseInt(parseRupiah(formData.price)) || 0;
    if (projectBudget && projectBudget > 0 && existingMilestonesSum !== undefined) {
      if (existingMilestonesSum + newPrice > projectBudget) {
        Swal.fire({
          title: "Peringatan",
          text: `Total nilai milestone (Rp ${new Intl.NumberFormat("id-ID").format(existingMilestonesSum + newPrice)}) tidak boleh melebihi anggaran proyek (Rp ${new Intl.NumberFormat("id-ID").format(projectBudget)}).`,
          icon: "warning",
          background: "#0F1B2E",
          color: "#fff",
          confirmButtonColor: "#3b82f6",
          customClass: {
            popup: "rounded-2xl border border-white/10 shadow-2xl"
          }
        });
        return;
      }
    }

    onSubmit(formData);
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
          padding: "20px",
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)"
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "540px",
              background: "#0F172A",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "32px",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Decoration */}
            <div style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "150px",
              height: "150px",
              background: "rgba(77, 99, 255, 0.1)",
              borderRadius: "50%",
              filter: "blur(40px)"
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", position: "relative" }}>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>Buat Milestone Baru</h2>
                <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.4)", margin: "4px 0 0 0" }}>Definisikan target pengerjaan proyek Anda.</p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "none",
                  color: "#fff",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelStyle}><Target size={14} /> Judul Milestone</label>
                <input
                  required
                  placeholder="Misal: UI Design Phase 1"
                  style={inputStyle}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={labelStyle}><span style={{ fontSize: "11px", fontWeight: "900", color: "rgba(226, 232, 240, 0.4)" }}>Rp</span> Nilai (IDR)</label>
                  <input
                    required
                    placeholder="Rp 0"
                    style={inputStyle}
                    value={formData.price}
                    onChange={handlePriceChange}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={labelStyle}><Calendar size={14} /> Tenggat Waktu</label>
                  <input
                    required
                    type="date"
                    style={inputStyle}
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelStyle}><AlignLeft size={14} /> Deskripsi Pengerjaan</label>
                <textarea
                  placeholder="Jelaskan apa saja yang akan dikerjakan pada milestone ini..."
                  style={{ ...inputStyle, minHeight: "100px", resize: "none" }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: "12px",
                    background: isSubmitting ? "rgba(77, 99, 255, 0.4)" : "var(--gradient-primary)",
                    border: "none",
                    color: "#fff",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 10px 20px rgba(77, 99, 255, 0.2)"
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Kirim ke Klien</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const labelStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "rgba(226, 232, 240, 0.6)",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "12px",
  color: "#fff",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box" as const,
  transition: "all 0.2s"
};
