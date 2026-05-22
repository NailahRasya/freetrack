"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

interface RatingReviewModalProps {
  projectId: string;
  projectTitle: string;
  freelancerName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RatingReviewModal({
  projectId,
  projectTitle,
  freelancerName,
  onClose,
  onSuccess,
}: RatingReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Cek apakah proyek ini sudah diulas
    const checkExisting = async () => {
      try {
        const res = await fetch(`/api/reviews?projectId=${projectId}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setAlreadyReviewed(true);
          const existingReview = json.data[0];
          setRating(existingReview.rating);
          setComment(existingReview.comment || "");
        }
      } catch (err) {
        console.error("Failed to check existing review:", err);
      } finally {
        setChecking(false);
      }
    };
    checkExisting();
  }, [projectId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire({
        title: "Pilih Bintang!",
        text: "Anda harus memilih rating bintang sebelum mengirim ulasan.",
        icon: "warning",
        background: "#0F1B2E",
        color: "#fff",
        confirmButtonColor: "#4D63FF",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mengirim ulasan");
      }

      await Swal.fire({
        title: "Ulasan Terkirim! 🎉",
        text: `Terima kasih telah memberikan ulasan untuk ${freelancerName}.`,
        icon: "success",
        background: "#0F1B2E",
        color: "#fff",
        confirmButtonColor: "#4D63FF",
        timer: 2500,
        showConfirmButton: false,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err.message?.includes("already submitted")) {
        setAlreadyReviewed(true);
      } else {
        Swal.fire({
          title: "Gagal",
          text: err.message,
          icon: "error",
          background: "#0F1B2E",
          color: "#fff",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: "Sangat Buruk",
    2: "Buruk",
    3: "Cukup",
    4: "Bagus",
    5: "Luar Biasa!",
  };

  const starColors: Record<number, string> = {
    1: "#FF4D6A",
    2: "#FF8C42",
    3: "#FFBF00",
    4: "#4D63FF",
    5: "#00FFA3",
  };

  const activeRating = hovered || rating;
  const activeColor = activeRating ? starColors[activeRating] : "#FFD700";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "520px",
            background: "rgba(10, 15, 30, 0.98)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "28px",
            padding: "40px",
            boxShadow: "0 40px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(77, 99, 255, 0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background Glow */}
          <div style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "200px",
            height: "200px",
            background: activeColor,
            filter: "blur(80px)",
            opacity: 0.06,
            borderRadius: "50%",
            transition: "background 0.3s ease",
            pointerEvents: "none",
          }} />

          {/* Close Button */}
          <motion.button
            whileHover={{ background: "rgba(255,255,255,0.08)", rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(226,232,240,0.5)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <X size={16} />
          </motion.button>

          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              background: "rgba(255, 215, 0, 0.08)",
              border: "1px solid rgba(255, 215, 0, 0.15)",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "800",
              color: "#FFD700",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "16px",
            }}>
              <Star size={12} fill="#FFD700" />
              Rating & Ulasan
            </div>
            <h2 style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#fff",
              marginBottom: "8px",
              letterSpacing: "-0.5px",
            }}>
              Bagaimana kinerja{" "}
              <span style={{
                background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {freelancerName}
              </span>
              ?
            </h2>
            <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "14px" }}>
              Proyek: <span style={{ color: "rgba(226,232,240,0.7)", fontWeight: "600" }}>{projectTitle}</span>
            </p>
          </div>

          {checking ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <span>Memeriksa status ulasan...</span>
            </div>
          ) : alreadyReviewed ? (
            /* Already Reviewed State */
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              padding: "20px",
              background: "rgba(0, 255, 163, 0.04)",
              border: "1px solid rgba(0, 255, 163, 0.15)",
              borderRadius: "20px",
            }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
              >
                <CheckCircle2 size={56} color="#00FFA3" strokeWidth={1.5} />
              </motion.div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
                  Ulasan Sudah Dikirim
                </div>
                <div style={{ color: "rgba(226,232,240,0.5)", fontSize: "14px" }}>
                  Anda sudah memberikan ulasan untuk proyek ini. Ulasan tidak dapat diubah.
                </div>
              </div>
              {/* Show submitted rating */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s}
                    size={28}
                    fill={s <= rating ? "#FFD700" : "transparent"}
                    color={s <= rating ? "#FFD700" : "rgba(255,255,255,0.15)"}
                  />
                ))}
              </div>
              {comment && (
                <div style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "14px",
                  color: "rgba(226,232,240,0.7)",
                  fontSize: "14px",
                  fontStyle: "italic",
                  lineHeight: "1.6",
                }}>
                  "{comment}"
                </div>
              )}
            </div>
          ) : (
            /* Rating Form */
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Star Rating */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "rgba(226,232,240,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "16px",
                }}>
                  Penilaian Bintang *
                </label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "8px",
                        transition: "all 0.15s",
                      }}
                    >
                      <Star
                        size={40}
                        fill={star <= (hovered || rating) ? "#FFD700" : "transparent"}
                        color={star <= (hovered || rating) ? "#FFD700" : "rgba(255,255,255,0.15)"}
                        style={{ transition: "all 0.15s", filter: star <= (hovered || rating) ? "drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))" : "none" }}
                      />
                    </motion.button>
                  ))}
                  <AnimatePresence mode="wait">
                    {activeRating > 0 && (
                      <motion.span
                        key={activeRating}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        style={{
                          fontSize: "14px",
                          fontWeight: "800",
                          color: starColors[activeRating],
                          marginLeft: "4px",
                        }}
                      >
                        {ratingLabels[activeRating]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "rgba(226,232,240,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "12px",
                }}>
                  Komentar Ulasan{" "}
                  <span style={{ fontWeight: "400", textTransform: "none", letterSpacing: "0" }}>(opsional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Ceritakan pengalaman Anda bekerja sama dengan ${freelancerName}. Kualitas kerja, komunikasi, ketepatan waktu, dll...`}
                  rows={4}
                  maxLength={500}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "16px",
                    color: "#fff",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(77, 99, 255, 0.3)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
                <div style={{ textAlign: "right", marginTop: "6px", fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>
                  {comment.length}/500
                </div>
              </div>

              {/* Notice */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "12px 16px",
                background: "rgba(255, 191, 0, 0.05)",
                border: "1px solid rgba(255, 191, 0, 0.15)",
                borderRadius: "12px",
              }}>
                <AlertCircle size={16} color="#FFBF00" style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ color: "rgba(226,232,240,0.5)", fontSize: "13px", lineHeight: "1.5" }}>
                  Ulasan yang sudah dikirim <strong style={{ color: "rgba(226,232,240,0.7)" }}>tidak dapat diubah</strong>. Pastikan penilaian Anda sudah tepat sebelum mengirim.
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: rating > 0 ? 1.02 : 1, boxShadow: rating > 0 ? "0 10px 30px rgba(77, 99, 255, 0.3)" : "none" }}
                whileTap={{ scale: rating > 0 ? 0.98 : 1 }}
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "none",
                  background: rating > 0
                    ? "linear-gradient(135deg, #4D63FF, #06B6D4)"
                    : "rgba(255,255,255,0.05)",
                  color: rating > 0 ? "#fff" : "rgba(226,232,240,0.3)",
                  fontSize: "16px",
                  fontWeight: "800",
                  cursor: rating > 0 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                {submitting ? (
                  <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Mengirim...</>
                ) : (
                  <><Send size={20} /> Kirim Ulasan</>
                )}
              </motion.button>
            </div>
          )}

          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
