"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, DollarSign, Calendar, AlignLeft, Send, Loader2, Briefcase, User } from "lucide-react";

import { formatRupiah, parseRupiah } from "@/utils/format";

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (milestone: { title: string; price: string; deadline: string; description: string; project_id?: string }) => void;
  isSubmitting?: boolean;
  projects?: any[];
  defaultProjectId?: string;
}

export default function CreateMilestoneModal({ isOpen, onClose, onSubmit, isSubmitting, projects, defaultProjectId }: CreateMilestoneModalProps) {
  // Derive clients from projects prop
  const clients = useMemo(() => {
    if (!projects) return [];
    const clientMap = new Map();
    projects.forEach(p => {
      if (p.client && !clientMap.has(p.client.id)) {
        clientMap.set(p.client.id, p.client);
      }
    });
    return Array.from(clientMap.values());
  }, [projects]);

  const [selectedClientId, setSelectedClientId] = useState(() => {
    if (defaultProjectId && projects) {
      const p = projects.find(proj => proj.id === defaultProjectId);
      return p?.client_id || "";
    }
    return "";
  });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!selectedClientId) return projects;
    return projects.filter(p => p.client_id === selectedClientId);
  }, [projects, selectedClientId]);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    deadline: "",
    description: "",
    project_id: defaultProjectId || ""
  });

  // Effect to sync project selection when client changes
  useEffect(() => {
    if (selectedClientId) {
      const projectsForClient = projects?.filter(p => p.client_id === selectedClientId) || [];
      if (projectsForClient.length === 1) {
        setFormData(prev => ({ ...prev, project_id: projectsForClient[0].id }));
      } else if (!projectsForClient.find(p => p.id === formData.project_id)) {
        setFormData(prev => ({ ...prev, project_id: "" }));
      }
    }
  }, [selectedClientId, projects]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseRupiah(e.target.value);
    const formattedValue = formatRupiah(rawValue);
    setFormData({ ...formData, price: formattedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projects && projects.length > 0 && !formData.project_id) {
      alert("Silakan pilih proyek/klien terlebih dahulu.");
      return;
    }
    onSubmit(formData);
    setFormData({ title: "", price: "", deadline: "", description: "", project_id: defaultProjectId || "" });
    onClose();
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
              {/* Client & Project Selection (Split for clarity) */}
              {projects && projects.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={labelStyle}><User size={14} /> Pilih Klien</label>
                    <select
                      required
                      style={inputStyle}
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                      <option value="" style={{ background: "#0F172A" }}>-- Pilih Klien --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id} style={{ background: "#0F172A" }}>
                          {c.full_name || "Tanpa Nama"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={labelStyle}><Briefcase size={14} /> Pilih Proyek</label>
                    <select
                      required
                      style={inputStyle}
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    >
                      <option value="" style={{ background: "#0F172A" }}>-- Pilih Proyek --</option>
                      {filteredProjects.map(p => (
                        <option key={p.id} value={p.id} style={{ background: "#0F172A" }}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

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
