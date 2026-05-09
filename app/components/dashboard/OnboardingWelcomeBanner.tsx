"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  Rocket, 
  CheckCircle2 
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface OnboardingWelcomeBannerProps {
  role: "client" | "freelancer";
}

export default function OnboardingWelcomeBanner({ role }: OnboardingWelcomeBannerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner if onboarding=complete is in URL
    if (searchParams.get("onboarding") === "complete") {
      setIsVisible(true);
    }
  }, [searchParams]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remove query param from URL without refreshing
    const params = new URLSearchParams(searchParams.toString());
    params.delete("onboarding");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          style={{ overflow: "hidden" }}
        >
          <div style={{
            background: role === "client" 
              ? "linear-gradient(135deg, #4D63FF, #06B6D4)" 
              : "linear-gradient(135deg, #10B981, #06B6D4)",
            borderRadius: "20px",
            padding: "24px 32px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            boxShadow: role === "client" 
              ? "0 20px 40px rgba(77, 99, 255, 0.2)" 
              : "0 20px 40px rgba(16, 185, 129, 0.2)",
          }}>
            {/* Icon */}
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
            }}>
              {role === "client" ? <Rocket size={28} /> : <Sparkles size={28} />}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>
                Hore! Profil Anda Telah Siap 🎉
              </h3>
              <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.5" }}>
                {role === "client" 
                  ? "Dashboard Anda telah dipersonalisasi berdasarkan preferensi rekrutmen Anda. Temukan freelancer terbaik untuk proyek Anda sekarang!"
                  : "Profil Anda telah dikonfigurasi. Kami telah menyiapkan daftar project yang paling cocok dengan keahlian dan preferensi Anda."}
              </p>
            </div>

            {/* Action */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {role === "client" ? (
                <button
                  onClick={() => {
                    handleDismiss();
                    router.push("/dashboard/market");
                  }}
                  style={{
                    background: "#fff",
                    color: "#4D63FF",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  Jelajahi Marketplace
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleDismiss();
                    router.push("/dashboard/market");
                  }}
                  style={{
                    background: "#fff",
                    color: "#10B981",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  Lihat Project Cocok
                  <ArrowRight size={14} />
                </button>
              )}

              <button
                onClick={handleDismiss}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Decorative Dots */}
            <div style={{ position: "absolute", top: "10px", right: "40%", opacity: 0.2 }}>
              <CheckCircle2 size={120} color="#fff" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
