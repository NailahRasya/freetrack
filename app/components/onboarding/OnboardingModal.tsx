"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ArrowRight } from "lucide-react";
import StepIndicator from "./StepIndicator";
import { useOnboardingStore } from "./useOnboardingStore";

// Client Steps
import ClientStep1Categories from "./client/ClientStep1Categories";
import ClientStep2ProjectForm from "./client/ClientStep2ProjectForm";
import ClientStep3AuthGate from "./client/ClientStep3AuthGate";

// Freelancer Steps
import FreelancerStep1Skills from "./freelancer/FreelancerStep1Skills";
import FreelancerStep2Tools from "./freelancer/FreelancerStep2Tools";
import FreelancerStep3ProfileForm from "./freelancer/FreelancerStep3ProfileForm";
import FreelancerStep4AuthGate from "./freelancer/FreelancerStep4AuthGate";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: "client" | "freelancer";
}

export default function OnboardingModal({
  isOpen,
  onClose,
  role,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = role === "client" ? 3 : 4;
  const { data, updateData } = useOnboardingStore(role);

  const nextStep = async () => {
    // Validasi untuk Client Step 2
    if (role === "client" && step === 2) {
      if (!data.projectTitle || data.projectTitle.trim().length < 3) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ 
          title: "Title Terlalu Pendek", 
          text: "Mohon isi judul project dengan benar (minimal 3 huruf).", 
          icon: "warning", 
          background: "#0F1B2E", 
          color: "#fff",
          confirmButtonColor: "#4D63FF"
        });
        return;
      }
      if (data.projectDescription.length > 1000) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ 
          title: "Terlalu Panjang", 
          text: `Deskripsi project Anda mencapai ${data.projectDescription.length} karakter. Maksimal adalah 1000 karakter agar tetap ringkas dan padat.`, 
          icon: "warning", 
          background: "#0F1B2E", 
          color: "#fff",
          confirmButtonColor: "#4D63FF"
        });
        return;
      }
      if (!data.projectDescription.trim()) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ 
          title: "Deskripsi Kosong", 
          text: "Mohon isi deskripsi project Anda.", 
          icon: "warning", 
          background: "#0F1B2E", 
          color: "#fff",
          confirmButtonColor: "#4D63FF"
        });
        return;
      }
      if (!data.requiredSkills || data.requiredSkills.length === 0) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ 
          title: "Skill Dibutuhkan", 
          text: "Mohon tambahkan minimal satu skill yang dibutuhkan untuk project ini.", 
          icon: "warning", 
          background: "#0F1B2E", 
          color: "#fff",
          confirmButtonColor: "#4D63FF"
        });
        return;
      }
    }

    if (step < totalSteps) setStep(step + 1);
  };
  const prevStep = () => step > 1 && setStep(step - 1);

  if (!isOpen) return null;

  const renderStep = () => {
    if (role === "client") {
      switch (step) {
        case 1:
          return (
            <ClientStep1Categories
              selectedCategories={data.projectCategories}
              onToggle={(cat) => {
                const current = data.projectCategories || [];
                const next = current.includes(cat)
                  ? current.filter((c) => c !== cat)
                  : [...current, cat];
                updateData({ projectCategories: next });
              }}
            />
          );
        case 2:
          return (
            <ClientStep2ProjectForm
              data={data}
              onChange={(fields) => updateData(fields)}
            />
          );
        case 3:
          return <ClientStep3AuthGate data={data} />;
        default:
          return null;
      }
    } else {
      switch (step) {
        case 1:
          return (
            <FreelancerStep1Skills
              selectedSkills={data.skillCategories}
              onToggle={(skill) => {
                const current = data.skillCategories || [];
                const next = current.includes(skill)
                  ? current.filter((c) => c !== skill)
                  : [...current, skill];
                updateData({ skillCategories: next });
              }}
            />
          );
        case 2:
          return (
            <FreelancerStep2Tools
              selectedTools={data.tools}
              onToggle={(tool) => {
                const current = data.tools || [];
                const next = current.includes(tool)
                  ? current.filter((c) => c !== tool)
                  : [...current, tool];
                updateData({ tools: next });
              }}
            />
          );
        case 3:
          return (
            <FreelancerStep3ProfileForm
              data={data}
              onChange={(fields) => updateData(fields)}
            />
          );
        case 4:
          return <FreelancerStep4AuthGate data={data} />;
        default:
          return null;
      }
    }
  };

  const accentColor = role === "client" ? "#4D63FF" : "#10B981";
  const isLastStep = step === totalSteps;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(5, 8, 20, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(145deg, rgba(13,21,56,0.98) 0%, rgba(10,15,40,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "720px",
          position: "relative",
          boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "32px 40px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <button
              onClick={prevStep}
              style={{
                display: step > 1 ? "flex" : "none",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                color: "rgba(226,232,240,0.4)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                padding: "0",
              }}
            >
              <ChevronLeft size={18} /> Kembali
            </button>
            <div style={{ flex: 1 }} />
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(226,232,240,0.5)",
              }}
            >
              <X size={16} />
            </button>
          </div>

          <StepIndicator currentStep={step} totalSteps={totalSteps} role={role} />
        </div>

        {/* Content */}
        <div style={{ padding: "0 40px 40px", flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions (except last step) */}
        {!isLastStep && (
          <div
            style={{
              padding: "24px 40px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              justifyContent: "flex-end",
              background: "rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={nextStep}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: accentColor,
                color: "#fff",
                border: "none",
                padding: "12px 28px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
                boxShadow: `0 8px 20px ${accentColor}44`,
                transition: "all 0.2s ease",
              }}
            >
              Lanjutkan <ArrowRight size={18} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
