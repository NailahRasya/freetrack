"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, Link as LinkIcon, FileText, CheckCircle } from "lucide-react";

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: number | null;
  milestoneTitle: string;
}

export default function UploadEvidenceModal({ isOpen, onClose, milestoneId, milestoneTitle }: UploadEvidenceModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "link">("file");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulasi penundaan upload
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1500);
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
              maxWidth: "500px",
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
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
                Kirim Kemajuan
              </h2>
              <p style={{ color: "rgba(226, 232, 240, 0.6)", fontSize: "14px" }}>
                Unggah bukti atau berikan tautan untuk <strong style={{ color: "#fff" }}>{milestoneTitle}</strong>.
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
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ fontSize: "18px", color: "#fff", fontWeight: "700" }}>Berhasil Dikirim!</h3>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Tab Pilihan (File/Link) */}
                <div style={{ 
                  display: "flex", 
                  background: "rgba(0,0,0,0.2)", 
                  padding: "4px", 
                  borderRadius: "12px", 
                  marginBottom: "24px" 
                }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("file")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: activeTab === "file" ? "rgba(255,255,255,0.1)" : "transparent",
                      border: "none",
                      borderRadius: "8px",
                      color: activeTab === "file" ? "#fff" : "rgba(255,255,255,0.5)",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    <FileText size={16} /> Unggah Berkas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("link")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: activeTab === "link" ? "rgba(255,255,255,0.1)" : "transparent",
                      border: "none",
                      borderRadius: "8px",
                      color: activeTab === "link" ? "#fff" : "rgba(255,255,255,0.5)",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    <LinkIcon size={16} /> URL / Tautan
                  </button>
                </div>

                {activeTab === "file" ? (
                  <div style={{
                    border: "2px dashed rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    padding: "40px 20px",
                    textAlign: "center",
                    marginBottom: "24px",
                    background: "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary-light)"}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                  >
                    <UploadCloud size={40} style={{ color: "var(--primary-light)", margin: "0 auto 16px" }} />
                    <p style={{ color: "#fff", fontWeight: "600", marginBottom: "8px" }}>Klik untuk mengunggah atau seret dan lepas</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>SVG, PNG, JPG, PDF atau ZIP (maks. 10MB)</p>
                  </div>
                ) : (
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                      Tautan Pekerjaan (mis. Figma, GitHub, Live Demo)
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://"
                      required
                      style={{
                        width: "100%",
                        padding: "12px 16px",
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
                )}

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                    Catatan untuk Klien (Opsional)
                  </label>
                  <textarea 
                    placeholder="Jelaskan apa yang telah diselesaikan..."
                    rows={3}
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

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{
                      flex: 2,
                      padding: "12px",
                      justifyContent: "center",
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? "not-allowed" : "pointer"
                    }}
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Kemajuan"}
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
