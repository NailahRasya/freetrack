"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Award, Star, Loader2, Sparkles, AlertCircle, DollarSign, Calendar, Zap } from "lucide-react";
import Swal from "sweetalert2";
import RatingReviewModal from "../RatingReviewModal";
import { formatRupiah } from "@/utils/format";

interface ProjectCompletionBannerProps {
  project: {
    id: string;
    title: string;
    status: string;
    budget?: string;
    deadline?: string;
    freelancer?: {
      id: string;
      full_name: string;
      email: string;
    };
    client?: {
      id: string;
      full_name: string;
      email: string;
    };
  };
  role: string;
  allMilestonesApproved: boolean;
  allInvoicesPaid: boolean;
  onProjectCompleted: () => void;
}

export default function ProjectCompletionBanner({
  project,
  role,
  allMilestonesApproved,
  allInvoicesPaid,
  onProjectCompleted,
}: ProjectCompletionBannerProps) {
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(false);

  const isClient = role === "client";
  const isCompleted = project.status === "completed";

  // Check if project has already been reviewed by client
  useEffect(() => {
    if (!isCompleted || !project.id || !isClient) return;

    const checkReview = async () => {
      setCheckingReview(true);
      try {
        const res = await fetch(`/api/reviews?projectId=${project.id}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setAlreadyReviewed(true);
        }
      } catch (err) {
        console.error("Failed to check existing review:", err);
      } finally {
        setCheckingReview(false);
      }
    };
    checkReview();
  }, [project.id, isCompleted, isClient]);

  const handleCompleteProject = async () => {
    const result = await Swal.fire({
      title: "Selesaikan Proyek?",
      text: "Apakah Anda yakin ingin menyatakan proyek ini selesai secara resmi? Tindakan ini akan mengunci seluruh milestone pengerjaan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00FFA3",
      cancelButtonColor: "rgba(255,255,255,0.1)",
      confirmButtonText: "Ya, Selesaikan! 🚀",
      cancelButtonText: "Batal",
      background: "#0A0F1E",
      color: "#fff",
      customClass: {
        popup: "glass-card",
      },
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menyelesaikan proyek.");
      }

      await Swal.fire({
        title: "Proyek Selesai! 🎉",
        text: "Proyek telah berhasil diselesaikan secara resmi. Anda sekarang dapat memberikan ulasan untuk freelancer Anda.",
        icon: "success",
        background: "#0A0F1E",
        color: "#fff",
        confirmButtonColor: "#4D63FF",
        timer: 3000,
        showConfirmButton: false,
      });

      onProjectCompleted();
    } catch (err: any) {
      Swal.fire({
        title: "Gagal",
        text: err.message,
        icon: "error",
        background: "#0A0F1E",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  // Only show banner if project is completed OR eligible for completion
  const isEligible = allMilestonesApproved && allInvoicesPaid;
  if (!isCompleted && !isEligible) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        style={{
          width: "100%",
          marginBottom: "32px",
          borderRadius: "24px",
          background: isCompleted
            ? "linear-gradient(135deg, rgba(0, 255, 163, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)"
            : "linear-gradient(135deg, rgba(77, 99, 255, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)",
          border: isCompleted
            ? "1px solid rgba(0, 255, 163, 0.2)"
            : "1px solid rgba(77, 99, 255, 0.25)",
          boxShadow: isCompleted
            ? "0 20px 40px rgba(0, 255, 163, 0.03), inset 0 0 30px rgba(0, 255, 163, 0.05)"
            : "0 20px 40px rgba(77, 99, 255, 0.03), inset 0 0 30px rgba(77, 99, 255, 0.05)",
          backdropFilter: "blur(20px)",
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* Visual background sparkles */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "250px",
            height: "250px",
            background: isCompleted ? "rgba(0, 255, 163, 0.15)" : "rgba(77, 99, 255, 0.15)",
            filter: "blur(70px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        {/* Info Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: "1 1 500px", minWidth: 0 }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: isCompleted
                ? "rgba(0, 255, 163, 0.1)"
                : "rgba(77, 99, 255, 0.12)",
              border: isCompleted
                ? "1px solid rgba(0, 255, 163, 0.25)"
                : "1px solid rgba(77, 99, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isCompleted ? "#00FFA3" : "#4D63FF",
              flexShrink: 0,
            }}
          >
            {isCompleted ? (
              <Award size={28} style={{ filter: "drop-shadow(0 0 6px rgba(0, 255, 163, 0.4))" }} />
            ) : (
              <Sparkles size={28} style={{ filter: "drop-shadow(0 0 6px rgba(77, 99, 255, 0.4))" }} />
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "900",
                  color: isCompleted ? "#00FFA3" : "#4D63FF",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  background: isCompleted ? "rgba(0, 255, 163, 0.08)" : "rgba(77, 99, 255, 0.08)",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  border: isCompleted ? "1px solid rgba(0, 255, 163, 0.15)" : "1px solid rgba(77, 99, 255, 0.15)",
                }}
              >
                {isCompleted ? "Proyek Selesai" : "Tahapan Selesai & Lunas"}
              </span>

              {/* Quick stats tags */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(226, 232, 240, 0.4)" }}>
                •
                <DollarSign size={12} style={{ color: "var(--cyan)" }} />
                <span style={{ fontWeight: "700", color: "#fff" }}>
                  {project.budget ? formatRupiah(project.budget) : "N/A"}
                </span>
              </div>
            </div>

            <h3
              style={{
                fontSize: "19px",
                fontWeight: "900",
                color: "#fff",
                marginBottom: "8px",
                letterSpacing: "-0.5px",
              }}
            >
              {isCompleted
                ? `Proyek "${project.title}" Resmi Diselesaikan! 🎉`
                : `Seluruh target pencapaian proyek "${project.title}" telah diselesaikan!`}
            </h3>

            <p style={{ fontSize: "13.5px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.6" }}>
              {isCompleted ? (
                isClient ? (
                  "Kinerja yang luar biasa dari freelancer Anda! Silakan berikan ulasan bintang & testimoni untuk memperkuat portofolio mereka."
                ) : (
                  `Selamat! Klien Anda (${project.client?.full_name ?? "Client"}) telah menyelesaikan proyek ini secara resmi. Terima kasih atas dedikasi Anda!`
                )
              ) : isClient ? (
                "Semua target pencapaian (milestone) telah disetujui dan dilunasi sepenuhnya. Klik tombol di kanan untuk menandai proyek selesai secara resmi."
              ) : (
                `Seluruh pekerjaan Anda telah disetujui and dilunasi oleh klien (${project.client?.full_name ?? "Client"}). Menunggu klien menandai proyek selesai secara resmi.`
              )}
            </p>
          </div>
        </div>

        {/* Action CTA Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {isCompleted ? (
            isClient && (
              checkingReview ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(226, 232, 240, 0.4)", fontSize: "13px" }}>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Memeriksa ulasan...</span>
                </div>
              ) : alreadyReviewed ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(0, 255, 163, 0.08)",
                    border: "1px solid rgba(0, 255, 163, 0.2)",
                    borderRadius: "14px",
                    padding: "10px 20px",
                    color: "#00FFA3",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  <CheckCircle2 size={16} />
                  Sudah Diulas
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(255, 215, 0, 0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowReviewModal(true)}
                  style={{
                    background: "linear-gradient(135deg, #FFBF00 0%, #FF8C42 100%)",
                    border: "none",
                    borderRadius: "14px",
                    padding: "12px 24px",
                    color: "#0B1220",
                    fontSize: "14px",
                    fontWeight: "850",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  <Star size={16} fill="#0B1220" />
                  Beri Ulasan Freelancer
                </motion.button>
              )
            )
          ) : (
            isClient && (
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(0, 255, 163, 0.2)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCompleteProject}
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #00FFA3 0%, #06B6D4 100%)",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px 28px",
                  color: "#0B1220",
                  fontSize: "14.5px",
                  fontWeight: "900",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 20px rgba(0, 255, 163, 0.15)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Zap size={16} fill="#0B1220" />
                    Tandai Proyek Selesai
                  </>
                )}
              </motion.button>
            )
          )}
        </div>
      </motion.div>

      {/* Review Modal Integration */}
      <AnimatePresence>
        {showReviewModal && (
          <RatingReviewModal
            projectId={project.id}
            projectTitle={project.title}
            freelancerName={project.freelancer?.full_name || "Freelancer"}
            onClose={() => setShowReviewModal(false)}
            onSuccess={() => {
              setAlreadyReviewed(true);
              setShowReviewModal(false);
            }}
          />
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
