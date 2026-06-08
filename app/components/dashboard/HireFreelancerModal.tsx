"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Briefcase, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import CustomFilterDropdown from "./CustomFilterDropdown";

interface HireFreelancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerId: string;
  freelancerName: string;
  onSuccess?: (projectId: string) => void;
}

export default function HireFreelancerModal({
  isOpen,
  onClose,
  freelancerId,
  freelancerName,
  onSuccess
}: HireFreelancerModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEligibleProjects();
    }
  }, [isOpen]);

  const fetchEligibleProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch projects created by this client that are in draft or published (without freelancer assigned)
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, budget, status")
        .eq("client_id", user.id)
        .or("status.eq.draft,status.eq.published")
        .is("freelancer_id", null);

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to fetch client projects for direct hire:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProjectId,
          freelancer_id: freelancerId,
          status: "pending_freelancer"
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menawarkan proyek.");
      }

      await Swal.fire({
        icon: "success",
        title: "Tawaran Terkirim!",
        text: `Proyek berhasil ditawarkan kepada ${freelancerName}.`,
        background: "#0D1B2E",
        color: "#fff",
        confirmButtonColor: "#4D63FF",
        timer: 2000,
        showConfirmButton: false
      });

      onSuccess?.(selectedProjectId);
      onClose();
    } catch (err: any) {
      console.error("Failed to offer project:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message || "Terjadi kesalahan.",
        background: "#0D1B2E",
        color: "#fff",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={overlayStyle}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={backdropStyle}
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card"
          style={modalContainerStyle}
        >
          {/* Close button */}
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={18} />
          </button>

          {/* Title */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={iconBoxStyle}>
                <Briefcase size={20} color="var(--cyan)" />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#fff" }}>Tawarkan Proyek</h2>
            </div>
            <p style={{ color: "rgba(226, 232, 240, 0.5)", fontSize: "13.5px", marginLeft: "52px" }}>
              Pekerjakan <strong style={{ color: "#fff" }}>{freelancerName}</strong> dengan memilih salah satu draf atau postingan proyek Anda.
            </p>
          </div>

          {loadingProjects ? (
            <div style={{ padding: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "rgba(226,232,240,0.5)" }}>
              <Loader2 size={20} className="animate-spin" />
              <span>Memuat proyek Anda...</span>
            </div>
          ) : projects.length === 0 ? (
            <div style={{ padding: "30px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <AlertCircle size={36} style={{ color: "var(--warning)" }} />
              <p style={{ color: "rgba(226, 232, 240, 0.6)", fontSize: "14px", lineHeight: "1.6" }}>
                Anda belum memiliki proyek berstatus Draf atau Postingan Publik yang kosong. Buat proyek baru terlebih dahulu di menu Marketplace atau Proyek.
              </p>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Tutup
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "rgba(226,232,240,0.6)", marginBottom: "8px", textTransform: "uppercase" }}>
                  Pilih Proyek Anda
                </label>
                <CustomFilterDropdown
                  value={selectedProjectId}
                  onChange={(val) => setSelectedProjectId(val)}
                  placeholder="Pilih salah satu proyek..."
                  options={projects.map((p) => ({
                    id: p.id,
                    label: `${p.title} (${p.budget || "Budget Negosiasi"})`
                  }))}
                  triggerStyle={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "14.5px"
                  }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: "10px 18px"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)")}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedProjectId}
                  className="btn-primary"
                  style={{
                    padding: "12px 28px",
                    opacity: (loading || !selectedProjectId) ? 0.7 : 1,
                    cursor: (loading || !selectedProjectId) ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Tawaran <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Styling components
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px"
};

const backdropStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(6, 13, 32, 0.85)",
  backdropFilter: "blur(8px)"
};

const modalContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: "520px",
  background: "rgba(13, 27, 46, 0.98)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "24px",
  padding: "32px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
  zIndex: 1
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "24px",
  right: "24px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "none",
  color: "rgba(255, 255, 255, 0.6)",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s"
};

const iconBoxStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  background: "rgba(6, 182, 212, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
