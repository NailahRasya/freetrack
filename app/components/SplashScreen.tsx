"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  // Mengontrol visibilitas splash screen
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Kunci scroll halaman selama splash screen aktif
    if (isVisible) {
      document.body.style.overflow = "hidden";
    }

    // Hilangkan splash screen setelah total durasi animasi selesai (3 detik)
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Kembalikan scroll halaman
      document.body.style.overflow = "";
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999, // Harus paling atas
            background: "linear-gradient(135deg, #020617 0%, #0D1B3E 100%)", // Gradient sangat gelap untuk kontras tinggi
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Main Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "16px" }}
          >
            <img src="/logo_icon.png" alt="Logo" style={{ height: "56px" }} />
            <h1 style={{ 
              fontSize: "56px", 
              fontWeight: "900", 
              letterSpacing: "-1px",
              background: "linear-gradient(135deg, #E2E8F0 0%, #06B6D4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0
            }}>
              FreeTrack
            </h1>
          </motion.div>

          {/* Connection Animation (Freelancer & Klien) */}
          <div style={{ position: "relative", width: "160px", height: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
            
            {/* Titik Kiri (Freelancer - Biru) */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#1A36F0",
                boxShadow: "0 0 15px rgba(26,54,240,0.8)",
                zIndex: 2
              }}
            />

            {/* Garis Penghubung (Line Draw Animation) */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0, transformOrigin: "left" }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
              style={{
                position: "absolute",
                left: "12px",
                right: "12px",
                height: "2px",
                background: "linear-gradient(90deg, #1A36F0 0%, #10B981 100%)",
                boxShadow: "0 0 10px rgba(16,185,129,0.3)",
                zIndex: 1
              }}
            />

            {/* Titik Kanan (Klien - Hijau) */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.4, ease: "easeOut" }}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 15px rgba(16,185,129,0.8)",
                zIndex: 2
              }}
            />
          </div>

          {/* Subtitle & Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            style={{ textAlign: "center" }}
          >
            <p style={{ fontSize: "16px", color: "rgba(226,232,240,0.6)", letterSpacing: "0.5px", marginBottom: "20px" }}>
              Menghubungkan freelancer & klien...
            </p>
            
            {/* Progress Bar Container */}
            <div style={{ width: "160px", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", margin: "0 auto", overflow: "hidden" }}>
              {/* Animated Progress Bar */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2.0, 
                  ease: "easeInOut" 
                }}
                style={{
                  width: "50%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, #10B981, transparent)",
                  borderRadius: "2px",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
