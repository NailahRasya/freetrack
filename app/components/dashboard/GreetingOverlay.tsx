"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function GreetingOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if we should show the greeting
    const shouldShow = sessionStorage.getItem("show_greeting");
    if (shouldShow === "true") {
      setShow(true);
      // Auto hide after 4 seconds
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.removeItem("show_greeting");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(5, 8, 20, 0.95)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "30px",
              background: "linear-gradient(135deg, #4D63FF, #10B981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              margin: "0 auto 32px",
              boxShadow: "0 20px 40px rgba(77, 99, 255, 0.3)",
            }}>
              <Sparkles size={48} />
            </div>

            <h1 style={{
              fontSize: "48px",
              fontWeight: "900",
              color: "#fff",
              letterSpacing: "-2px",
              marginBottom: "16px",
            }}>
              Selamat Datang di <span style={{
                background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>FreeTrack</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "rgba(226, 232, 240, 0.8)",
                letterSpacing: "4px",
                textTransform: "uppercase",
              }}
            >
              Boss <span style={{ color: "#4D63FF" }}>!</span>
            </motion.p>
          </motion.div>

          {/* Decorative elements */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: -1,
          }}>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 - 50 + "%", 
                  y: Math.random() * 100 - 50 + "%",
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: "-=100px"
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: i % 2 === 0 ? "#4D63FF" : "#10B981",
                  filter: "blur(2px)",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
