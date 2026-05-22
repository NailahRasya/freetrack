"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Loader2, Award } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  project?: {
    id: string;
    title: string;
    project_code: string;
  };
  client?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface FreelancerReviewsCardProps {
  freelancerId: string;
}

export default function FreelancerReviewsCard({ freelancerId }: FreelancerReviewsCardProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (!freelancerId) return;

    async function fetchReviews() {
      try {
        setLoading(true);
        const res = await fetch(`/api/reviews?freelancerId=${freelancerId}`);
        const json = await res.json();
        
        if (json.data) {
          const list: Review[] = json.data;
          setReviews(list);
          setTotalReviews(list.length);
          if (list.length > 0) {
            const sum = list.reduce((acc, r) => acc + r.rating, 0);
            setAverageRating(Math.round((sum / list.length) * 10) / 10);
          }
        }
      } catch (err) {
        console.error("Failed to fetch freelancer reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [freelancerId]);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#FFD700", marginBottom: "12px" }} />
        <span style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "14px", fontWeight: "600" }}>Memuat ulasan klien...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (totalReviews === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{
          padding: "32px",
          background: "rgba(15, 27, 46, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "20px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px"
        }}
      >
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "rgba(255, 215, 0, 0.04)",
          border: "1px solid rgba(255, 215, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFD700"
        }}>
          <Star size={24} color="rgba(255, 215, 0, 0.4)" />
        </div>
        <div>
          <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "6px" }}>Belum Ada Ulasan Klien</h4>
          <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", lineHeight: "1.6", maxWidth: "260px", margin: "0 auto" }}>
            Ayo berikan performa terbaik pada proyek aktif Anda untuk mulai mengumpulkan ulasan bintang pertama!
          </p>
        </div>
      </motion.div>
    );
  }

  // Calculate stars breakdown percentage
  const starCounts = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card"
      style={{
        padding: "24px",
        background: "rgba(15, 27, 46, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative Glow */}
      <div style={{
        position: "absolute",
        top: "-20%",
        right: "-20%",
        width: "100px",
        height: "100px",
        background: "#FFD700",
        filter: "blur(60px)",
        opacity: 0.05,
        borderRadius: "50%",
        pointerEvents: "none"
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
          <Award size={18} color="#FFD700" />
          Reputasi & Ulasan Klien
        </h3>
        <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.35)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {totalReviews} Total
        </span>
      </div>

      {/* Summary Score Breakdown */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "16px",
        background: "linear-gradient(135deg, rgba(255, 215, 0, 0.04), rgba(6, 182, 212, 0.02))",
        borderRadius: "16px",
        border: "1px solid rgba(255, 215, 0, 0.08)"
      }}>
        <div style={{ textAlign: "center", flexShrink: 0, width: "70px" }}>
          <div style={{ fontSize: "36px", fontWeight: "900", color: "#FFD700", lineHeight: 1, marginBottom: "2px" }}>
            {averageRating.toFixed(1)}
          </div>
          <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginBottom: "4px" }}>
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={10} fill={s <= Math.round(averageRating) ? "#FFD700" : "transparent"} color={s <= Math.round(averageRating) ? "#FFD700" : "rgba(255,255,255,0.15)"} />
            ))}
          </div>
          <div style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.4)", fontWeight: "600" }}>
            Dari 5 Bintang
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {starCounts.map(({ star, count, pct }) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
              <span style={{ color: "rgba(226, 232, 240, 0.4)", width: "8px", fontWeight: "700" }}>{star}</span>
              <Star size={9} fill="#FFD700" color="#FFD700" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.03)", borderRadius: "2px", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #FFD700, #FF8C42)", borderRadius: "2px" }}
                />
              </div>
              <span style={{ color: "rgba(226, 232, 240, 0.3)", width: "16px", textAlign: "right" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Comments Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }} className="scrollable-content">
        <AnimatePresence>
          {reviews.slice(0, 5).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                padding: "14px",
                background: "rgba(255, 255, 255, 0.01)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                borderRadius: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#fff",
                    flexShrink: 0
                  }}>
                    {review.client?.full_name?.[0] ?? "?"}
                  </div>
                  <div>
                    <h5 style={{ fontSize: "12px", fontWeight: "700", color: "#fff" }}>
                      {review.client?.full_name || "Klien"}
                    </h5>
                    {review.project?.title && (
                      <p style={{ fontSize: "9px", color: "rgba(226, 232, 240, 0.3)", marginTop: "1px" }}>
                        Proyek: {review.project.title}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: "1px" }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={9} fill={s <= review.rating ? "#FFD700" : "transparent"} color={s <= review.rating ? "#FFD700" : "rgba(255,255,255,0.15)"} />
                    ))}
                  </div>
                  <span style={{ fontSize: "9px", color: "rgba(226, 232, 240, 0.25)" }}>
                    {new Date(review.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "2-digit" })}
                  </span>
                </div>
              </div>

              {review.comment ? (
                <p style={{
                  color: "rgba(226, 232, 240, 0.6)",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  fontStyle: "italic",
                  margin: 0
                }}>
                  "{review.comment}"
                </p>
              ) : (
                <p style={{ color: "rgba(226, 232, 240, 0.2)", fontSize: "11px", fontStyle: "italic", margin: 0 }}>
                  Klien memberikan nilai bintang {review.rating} tanpa menyertakan komentar ulasan.
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .scrollable-content::-webkit-scrollbar {
          width: 4px;
        }
        .scrollable-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollable-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </motion.div>
  );
}
