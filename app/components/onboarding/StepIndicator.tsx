"use client";

import React from "react";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  role: "client" | "freelancer";
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  role,
}: StepIndicatorProps) {
  const accentColor = role === "client" ? "#4D63FF" : "#10B981";

  return (
    <div style={{ marginBottom: "40px" }}>
      {/* Progress Bar Container */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          padding: "0 10px",
        }}
      >
        {/* Background Line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: "2px",
            background: "rgba(255, 255, 255, 0.05)",
            transform: "translateY(-50%)",
            zIndex: 0,
          }}
        />

        {/* Active Line Progress */}
        <motion.div
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}dd)`,
            boxShadow: `0 0 10px ${accentColor}88`,
            transform: "translateY(-50%)",
            zIndex: 1,
          }}
        />

        {/* Step Dots */}
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum <= currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={i}
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <motion.div
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  background: isActive ? accentColor : "#162550",
                  borderColor: isActive ? accentColor : "rgba(255,255,255,0.1)",
                  boxShadow: isCurrent
                    ? `0 0 20px ${accentColor}aa`
                    : "0 0 0px transparent",
                }}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  border: "2px solid",
                  transition: "all 0.3s ease",
                }}
              />
              <motion.span
                animate={{
                  opacity: isCurrent ? 1 : 0.4,
                  color: isCurrent ? "#fff" : "rgba(226,232,240,0.4)",
                  y: isCurrent ? 8 : 12,
                }}
                style={{
                  position: "absolute",
                  top: "100%",
                  fontSize: "10px",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  marginTop: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Step {stepNum}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
