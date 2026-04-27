"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertTriangle } from "lucide-react";

interface ChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangeRequestModal({ isOpen, onClose }: ChangeRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulasi pemanggilan API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
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
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Klien telah diberitahu tentang permintaan Anda.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
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
                    placeholder="Jelaskan scope creep atau alasan permintaan perubahan..."
                    rows={4}
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
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{
                      padding: "12px 32px",
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? "not-allowed" : "pointer"
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
