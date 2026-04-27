"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FreelancerStatsCards from "../../components/dashboard/freelancer/FreelancerStatsCards";
import MilestoneManager from "../../components/dashboard/freelancer/MilestoneManager";
import ChangeRequestModal from "../../components/dashboard/freelancer/ChangeRequestModal";
import PaymentTracker from "../../components/dashboard/PaymentTracker";
import MessagesPreview from "../../components/dashboard/MessagesPreview";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";

export default function FreelancerDashboardPage() {
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Bagian Header */}
      <header>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ 
            fontSize: "28px", 
            fontWeight: "900", 
            color: "#fff", 
            letterSpacing: "-0.5px",
            marginBottom: "8px"
          }}>
            Selamat datang kembali, <span className="gradient-text-emerald">Sarah Jenkins</span>
          </h1>
          <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "15px" }}>
            Berikut adalah apa yang terjadi di ruang kerja pribadi Anda hari ini.
          </p>
        </motion.div>
      </header>

      {/* Statistik Ringkasan */}
      <FreelancerStatsCards />

      {/* Layout Grid Utama */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)", 
        gap: "32px",
        alignItems: "stretch", 
        width: "100%"
      }}>
        {/* Kolom Kiri */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>
          <MilestoneManager />
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "32px" 
          }}>
            <MessagesPreview />
            <ActivityTimeline />
          </div>
        </div>

        {/* Kolom Kanan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>
          <PaymentTracker />
          
          {/* Aksi Cepat / Kontrol Scope Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{
              padding: "24px",
              background: "var(--gradient-emerald)",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              border: "none",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            {/* Overlay Bentuk Abstrak */}
            <div style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "150px",
              height: "150px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              filter: "blur(40px)"
            }} />

            <div style={{ zIndex: 1 }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>Scope Creep Terdeteksi?</h3>
              <p style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5", marginBottom: "16px" }}>
                Jika klien meminta fitur tambahan di luar kontrak asli, Anda dapat mengajukan Permintaan Perubahan untuk memperbarui anggaran atau lini masa.
              </p>
              <button 
                onClick={() => setIsChangeRequestOpen(true)}
                style={{ 
                  background: "#fff", 
                  color: "var(--accent)", 
                  border: "none", 
                  padding: "10px 20px", 
                  borderRadius: "10px", 
                  fontWeight: "700", 
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                Ajukan Permintaan Perubahan
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <ChangeRequestModal 
        isOpen={isChangeRequestOpen} 
        onClose={() => setIsChangeRequestOpen(false)} 
      />

      {/* Gaya kustom untuk penyesuaian grid pada layar kecil */}
      <style jsx>{`
        @media (max-width: 1200px) {
          div[style*="gridTemplateColumns: minmax(0, 7fr) minmax(0, 5fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
