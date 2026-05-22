"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Receipt, 
  Archive, 
  CheckCircle2, 
  PartyPopper,
  Info,
  DollarSign,
  MousePointerClick
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../dashboard/layout";
import { usePathname } from "next/navigation";

export default function OnboardingTour() {
  const { user, role, loading } = useUser();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if we should auto-trigger the onboarding
  useEffect(() => {
    if (loading || !user?.id) return;

    // Check if this is the first time landing on dashboard pages
    const isDashboardRoot = 
      pathname === "/dashboard" || 
      pathname === "/dashboard/client" || 
      pathname === "/dashboard/freelancer";

    if (isDashboardRoot) {
      const storageKey = `freetrack_onboarding_shown_${user.id}`;
      const hasShown = localStorage.getItem(storageKey);
      if (!hasShown) {
        setIsOpen(true);
      }
    }
  }, [loading, user?.id, pathname]);

  // Listen to custom relaunch event
  useEffect(() => {
    const handleRelaunch = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener("freetrack-relaunch-tour", handleRelaunch);
    return () => {
      window.removeEventListener("freetrack-relaunch-tour", handleRelaunch);
    };
  }, []);

  if (!isOpen || loading || !user) return null;

  const handleClose = () => {
    if (user?.id) {
      const storageKey = `freetrack_onboarding_shown_${user.id}`;
      localStorage.setItem(storageKey, "true");
    }
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Content dynamically adapts to user role
  const isClient = role === "client";

  const slides = [
    // Slide 1: Welcome & Value Proposition
    {
      icon: PartyPopper,
      color: "var(--cyan)",
      title: isClient 
        ? "Selamat Datang di FreeTrack! 🚀" 
        : "Selamat Datang Freelancer Hebat! 🚀",
      description: isClient
        ? "Platform manajemen kerja lepas modern dengan sistem Escrow terintegrasi. Dapatkan kendali penuh atas proyek Anda, kolaborasi transparan, dan pembayaran aman."
        : "Platform andalan Anda untuk berkolaborasi dengan klien secara transparan. Tunjukkan keahlian terbaik Anda dengan jaminan pembayaran yang aman via sistem Escrow.",
      content: (
        <div style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "16px",
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <ShieldCheck size={36} style={{ color: "var(--cyan)", flexShrink: 0 }} />
          <div style={{ fontSize: "13px", lineHeight: "1.6", color: "rgba(226, 232, 240, 0.8)" }}>
            <strong>Keamanan Escrow Terjamin:</strong> Dana pembayaran milestone diamankan di rekening bersama sebelum pekerjaan dimulai. Bebas cemas untuk kedua belah pihak!
          </div>
        </div>
      )
    },
    // Slide 2: Workflow Steps
    {
      icon: Layers,
      color: "#4D63FF",
      title: "Alur Kerja Proyek & Milestones",
      description: isClient
        ? "Kelola alur kerja proyek Anda dengan langkah-langkah milestones terstruktur agar hasil pekerjaan sesuai dengan ekspektasi Anda."
        : "Kerjakan proyek secara terarah dan profesional menggunakan sistem target pencapaian (milestone) yang transparan.",
      content: (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "16px"
        }}>
          {isClient ? (
            <>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ background: "rgba(77, 99, 255, 0.2)", color: "#a5b4fc", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>1</span>
                <span style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.9)" }}>Buat proyek di <strong>Marketplace</strong> atau kontrak freelancer langsung dari menu Rekomendasi.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ background: "rgba(77, 99, 255, 0.2)", color: "#a5b4fc", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>2</span>
                <span style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.9)" }}>Definisikan target milestone dan <strong>setor pembayaran DP/Milestone</strong> ke sistem Escrow.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ background: "rgba(77, 99, 255, 0.2)", color: "#a5b4fc", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>3</span>
                <span style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.9)" }}>Freelancer mulai bekerja. Setelah mereka mengirim <strong>Proof of Work</strong>, Anda meninjau dan menyetujuinya.</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ background: "rgba(77, 99, 255, 0.2)", color: "#a5b4fc", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>1</span>
                <span style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.9)" }}>Lamar proyek menarik di <strong>Marketplace</strong> atau terima penawaran kolaborasi langsung dari klien.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ background: "rgba(77, 99, 255, 0.2)", color: "#a5b4fc", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>2</span>
                <span style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.9)" }}><strong>Hanya mulai bekerja</strong> jika milestone tersebut telah didepositkan ke Escrow oleh Klien (Status: <em>Terbayar ke Escrow</em>).</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ background: "rgba(77, 99, 255, 0.2)", color: "#a5b4fc", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>3</span>
                <span style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.9)" }}>Kirim bukti kerja (<strong>Proof of Work</strong>) setelah selesai. Dana cair instan ke saldo Anda begitu disetujui klien.</span>
              </div>
            </>
          )}
        </div>
      )
    },
    // Slide 3: Invoicing
    {
      icon: Receipt,
      color: "#10B981",
      title: "Sistem Auto-Invoicing Instan",
      description: isClient
        ? "Nikmati kemudahan laporan keuangan. Begitu Anda melakukan pembayaran DP atau melepaskan milestone, invoice resmi langsung diterbitkan."
        : "Transaksi profesional secara otomatis. Invoice terstruktur rapi dibuat secara instan saat milestone disetujui.",
      content: (
        <div style={{
          background: "rgba(16, 185, 129, 0.05)",
          border: "1px solid rgba(16, 185, 129, 0.15)",
          borderRadius: "16px",
          padding: "16px",
          marginTop: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={18} style={{ color: "#10B981" }} />
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#10B981" }}>Langsung Berstatus Lunas (Paid)</span>
          </div>
          <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.8)", margin: 0, lineHeight: "1.6" }}>
            Tidak ada lagi status pending atau tombol tandai manual setelah pembayaran diverifikasi. Invoice langsung berstatus <strong>Lunas</strong>, lengkap dengan tombol <strong>Unduh PDF</strong> instan di menu tab Invoice Anda!
          </p>
        </div>
      )
    },
    // Slide 4: Archiving and Dashboard Cleanup
    {
      icon: Archive,
      color: "#F59E0B",
      title: "Dasbor Bersih dengan Fitur Arsip",
      description: "Kami percaya produktivitas tinggi dimulai dari ruang kerja digital yang rapi dan terorganisir.",
      content: (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "16px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <MousePointerClick size={20} style={{ color: "#F59E0B", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.9)" }}>
              Setelah proyek berstatus <strong>Selesai</strong>, Anda dapat mengarsipkannya dengan menekan tombol Arsipkan di card proyek.
            </span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <Sparkles size={20} style={{ color: "var(--cyan)", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.9)" }}>
              Semua proyek terarsipkan dipindahkan ke tab khusus <strong>Diarsipkan</strong>, di mana Anda bisa <strong>memulihkan proyek</strong> atau <strong>menghapusnya secara permanen</strong>.
            </span>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentStep];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(3, 7, 18, 0.85)",
      backdropFilter: "blur(8px)",
      padding: "20px"
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(11, 18, 32, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(77, 99, 255, 0.1)`,
          padding: "32px",
          position: "relative",
          overflow: "hidden",
          color: "#fff"
        }}
      >
        {/* Ambient Top Glow */}
        <div style={{
          position: "absolute",
          top: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "250px",
          height: "100px",
          background: `radial-gradient(ellipse, ${slide.color}25 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0
        }} />

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(226, 232, 240, 0.6)",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          className="hover-bright"
        >
          <X size={18} />
        </button>

        {/* Step Indicator Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          position: "relative",
          zIndex: 1
        }}>
          <span style={{
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: slide.color,
            background: `rgba(${slide.color === "var(--cyan)" ? "6, 182, 212" : slide.color === "#4D63FF" ? "77, 99, 255" : slide.color === "#10B981" ? "16, 185, 129" : "245, 158, 11"}, 0.1)`,
            padding: "4px 10px",
            borderRadius: "8px",
            border: `1px solid ${slide.color}30`
          }}>
            Langkah {currentStep + 1} dari {slides.length}
          </span>
        </div>

        {/* Dynamic Icon */}
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "20px",
          background: `linear-gradient(135deg, ${slide.color}20, ${slide.color}10)`,
          border: `1px solid ${slide.color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: slide.color,
          marginBottom: "20px",
          boxShadow: `0 8px 24px -6px ${slide.color}40`,
          position: "relative",
          zIndex: 1
        }}>
          <slide.icon size={32} />
        </div>

        {/* Slide Content */}
        <div style={{ position: "relative", zIndex: 1, minHeight: "220px", display: "flex", flexDirection: "column" }}>
          <h3 style={{
            fontSize: "22px",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            marginBottom: "12px",
            color: "#FFFFFF"
          }}>
            {slide.title}
          </h3>
          <p style={{
            fontSize: "14px",
            lineHeight: "1.6",
            color: "rgba(226, 232, 240, 0.7)",
            marginBottom: "16px",
            margin: 0
          }}>
            {slide.description}
          </p>

          <div style={{ flex: 1 }}>
            {slide.content}
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "32px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          paddingTop: "24px",
          position: "relative",
          zIndex: 1
        }}>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: "6px" }}>
            {slides.map((_, index) => (
              <div
                key={index}
                style={{
                  width: index === currentStep ? "24px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: index === currentStep ? slide.color : "rgba(255, 255, 255, 0.15)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            {currentStep > 0 ? (
              <button
                onClick={prevStep}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "rgba(226, 232, 240, 0.8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s"
                }}
              >
                <ArrowLeft size={16} /> Kembali
              </button>
            ) : (
              <button
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "rgba(226, 232, 240, 0.4)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Lewati
              </button>
            )}

            <button
              onClick={nextStep}
              style={{
                background: currentStep === slides.length - 1 ? "#10B981" : slide.color,
                border: "none",
                borderRadius: "12px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0F172A",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: currentStep === slides.length - 1 
                  ? "0 4px 14px rgba(16, 185, 129, 0.3)" 
                  : `0 4px 14px ${slide.color}40`,
                transition: "all 0.2s"
              }}
            >
              {currentStep === slides.length - 1 ? "Selesai 🏁" : (
                <>
                  Lanjut <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
