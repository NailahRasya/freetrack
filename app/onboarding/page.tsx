"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ArrowRight, Sparkles, X, Layout, Briefcase, User2 } from "lucide-react";
import { useOnboardingStore } from "../components/onboarding/useOnboardingStore";
import StepIndicator from "../components/onboarding/StepIndicator";

// Client Steps
import ClientStep1Categories from "../components/onboarding/client/ClientStep1Categories";
import ClientStep2Preferences from "../components/onboarding/client/ClientStep2Preferences";
import ClientStep3AuthGate from "../components/onboarding/client/ClientStep3AuthGate";

// Freelancer Steps
import FreelancerStep1Skills from "../components/onboarding/freelancer/FreelancerStep1Skills";
import FreelancerStep2WorkPreferences from "../components/onboarding/freelancer/FreelancerStep2WorkPreferences";
import FreelancerStep3ProfileForm from "../components/onboarding/freelancer/FreelancerStep3ProfileForm";
import FreelancerStep4AuthGate from "../components/onboarding/freelancer/FreelancerStep4AuthGate";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get("role") as "client" | "freelancer";
  const role = roleParam || "client";

  const [isGreeting, setIsGreeting] = useState(true);
  const [step, setStep] = useState(1);
  const totalSteps = role === "client" ? 3 : 4;
  const { data, updateData } = useOnboardingStore(role);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGreeting(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const nextStep = async () => {
    // Validasi untuk Client Step 1 (Categories)
    if (role === "client" && step === 1) {
      if (!data.projectCategories || data.projectCategories.length === 0) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ 
          title: "Pilih Kategori", 
          text: "Mohon pilih minimal satu bidang bisnis atau kategori kebutuhan Anda.", 
          icon: "warning", 
          background: "#0F1B2E", 
          color: "#fff",
          confirmButtonColor: "#4D63FF"
        });
        return;
      }
    }

    if (role === "client" && step === 2) {
      if (!data.businessScale || !data.workType || !data.experiencePreference) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ 
          title: "Lengkapi Preferensi", 
          text: "Mohon lengkapi semua preferensi rekrutmen Anda sebelum melanjutkan.", 
          icon: "warning", 
          background: "#0F1B2E", 
          color: "#fff",
          confirmButtonColor: "#4D63FF"
        });
        return;
      }
    }

    if (role === "freelancer" && step === 2) {
      if (!data.preferredClientScales?.length || !data.workTypePreference?.length) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ 
          title: "Lengkapi Preferensi", 
          text: "Mohon pilih minimal satu skala klien dan tipe kerjasama yang Anda minati.", 
          icon: "warning", 
          background: "#0F1B2E", 
          color: "#fff",
          confirmButtonColor: "#10B981"
        });
        return;
      }
    }

    if (role === "freelancer" && step === 3) {
      const { experienceLevel, yearsOfExperience } = data;
      let isValid = true;
      let msg = "";

      if (!experienceLevel) {
        isValid = false;
        msg = "Mohon pilih level pengalaman Anda.";
      } else if (experienceLevel === "junior" && yearsOfExperience > 2) {
        isValid = false;
        msg = "Level Junior maksimal hanya 2 tahun pengalaman.";
      } else if (experienceLevel === "mid" && (yearsOfExperience < 2 || yearsOfExperience > 5)) {
        isValid = false;
        msg = "Level Intermediate harus berada di rentang 2-5 tahun pengalaman.";
      } else if (experienceLevel === "senior" && yearsOfExperience < 5) {
        isValid = false;
        msg = "Level Senior minimal harus memiliki 5 tahun pengalaman.";
      }

      if (!isValid) {
        const Swal = (await import("sweetalert2")).default;
        Swal.fire({ 
          title: "Validasi Gagal", 
          text: msg, 
          icon: "error", 
          background: "#0F1B2E", 
          color: "#fff",
          confirmButtonColor: "#10B981"
        });
        return;
      }
    }

    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => step > 1 && setStep(step - 1);

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
            <ClientStep2Preferences 
              data={data} 
              updateData={(fields) => updateData(fields)} 
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
            <FreelancerStep2WorkPreferences
              data={data}
              updateData={(fields) => updateData(fields)}
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
    <div style={{ 
      minHeight: "100vh", 
      background: "#050814", 
      color: "#fff", 
      display: "flex", 
      flexDirection: "column",
      fontFamily: "var(--font-sans)"
    }}>
      <AnimatePresence mode="wait">
        {isGreeting ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ textAlign: "center" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ 
                  scale: { type: "spring", stiffness: 260, damping: 20 },
                  rotate: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                style={{ 
                  width: "100px", 
                  height: "100px", 
                  borderRadius: "30px", 
                  background: `rgba(${role === 'client' ? '77, 99, 255' : '16, 185, 129'}, 0.1)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 32px",
                  color: accentColor,
                  border: `1px solid rgba(${role === 'client' ? '77, 99, 255' : '16, 185, 129'}, 0.2)`
                }}
              >
                <Sparkles size={48} />
              </motion.div>
              <h1 style={{ fontSize: "56px", fontWeight: "900", letterSpacing: "-2px", marginBottom: "16px" }}>
                Welcome, <span style={{ 
                  background: `linear-gradient(135deg, ${accentColor}, ${role === 'client' ? '#8B5CF6' : '#34D399'})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>{role === 'client' ? 'Client' : 'Freelancer'}</span>
              </h1>
              <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "20px", fontWeight: "500" }}>
                Let's build your professional presence together.
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              width: "100%"
            }}
          >
            {/* Full-width Header */}
            <header style={{ 
              padding: "24px 48px", 
              borderBottom: "1px solid rgba(255,255,255,0.05)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              background: "rgba(13,21,56,0.2)",
              backdropFilter: "blur(10px)",
              position: "sticky",
              top: 0,
              zIndex: 50
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "10px", 
                  background: accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {role === 'client' ? <Briefcase size={20} color="white" /> : <User2 size={20} color="white" />}
                </div>
                <span style={{ fontWeight: "800", fontSize: "18px", letterSpacing: "-0.5px" }}>
                  FreeTrack <span style={{ color: "rgba(226,232,240,0.4)", fontWeight: "500", fontSize: "14px", marginLeft: "8px" }}>
                    {role === 'client' ? 'Client' : 'Freelancer'}
                  </span>
                </span>
              </div>

              <button
                onClick={() => router.push("/")}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(226,232,240,0.4)",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(226,232,240,0.4)"}
              >
                <X size={20} />
              </button>
            </header>

            {/* Content Container */}
            <div style={{ 
              flex: 1, 
              display: "flex", 
              flexDirection: "column",
              maxWidth: "1000px", 
              width: "100%", 
              margin: "0 auto",
              padding: "60px 40px"
            }}>
              <div style={{ marginBottom: "48px" }}>
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
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(226,232,240,0.4)"}
                  >
                    <ChevronLeft size={18} /> Kembali
                  </button>
                </div>
                <StepIndicator currentStep={step} totalSteps={totalSteps} role={role} />
              </div>

              <div style={{ flex: 1 }}>
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

              {/* Navigation Footer */}
              {!isLastStep && (
                <div style={{ 
                  marginTop: "80px", 
                  display: "flex", 
                  justifyContent: "flex-end",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  paddingTop: "32px"
                }}>
                  <button
                    onClick={nextStep}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: accentColor,
                      color: "#fff",
                      border: "none",
                      padding: "16px 40px",
                      borderRadius: "16px",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: "pointer",
                      boxShadow: `0 12px 28px ${accentColor}44`,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    Lanjutkan <ArrowRight size={22} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        body {
          background: #050814 !important;
          margin: 0;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
