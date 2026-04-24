"use client";
import { useEffect, useState } from "react";
import { X, Shield, ScrollText, ChevronRight } from "lucide-react";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy";
}

export default function PolicyModal({ isOpen, onClose, type }: PolicyModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = {
    terms: {
      title: "Syarat & Ketentuan",
      subtitle: "Terakhir diperbarui: 24 April 2026",
      icon: <ScrollText size={20} className="text-emerald-500" />,
      sections: [
        {
          title: "1. Penerimaan Ketentuan",
          text: "Dengan mendaftar dan menggunakan platform FreeTrack, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju, harap jangan gunakan layanan kami.",
        },
        {
          title: "2. Akun Pengguna",
          text: "Anda bertanggung jawab untuk menjaga kerahasiaan akun dan password Anda. FreeTrack tidak bertanggung jawab atas kerugian yang disebabkan oleh penggunaan akun Anda oleh pihak ketiga.",
        },
        {
          title: "3. Layanan Escrow",
          text: "FreeTrack menyediakan sistem pembayaran aman (Escrow). Dana akan ditahan oleh platform hingga tonggak pekerjaan (milestone) disetujui oleh kedua belah pihak.",
        },
        {
          title: "4. Biaya Layanan",
          text: "FreeTrack mengenakan biaya layanan persentase dari setiap transaksi yang berhasil. Detail biaya dapat dilihat pada halaman tarif layanan.",
        },
        {
          title: "5. Penyelesaian Perselisihan",
          text: "Jika terjadi perselisihan antara Freelancer dan Client, FreeTrack menyediakan mediator untuk membantu mencapai solusi yang adil bagi kedua belah pihak.",
        },
      ],
    },
    privacy: {
      title: "Kebijakan Privasi",
      subtitle: "Terakhir diperbarui: 24 April 2026",
      icon: <Shield size={20} className="text-blue-500" />,
      sections: [
        {
          title: "1. Pengumpulan Data",
          text: "Kami mengumpulkan informasi yang Anda berikan saat mendaftar, seperti nama, email, dan rincian profil profesional Anda.",
        },
        {
          title: "2. Penggunaan Informasi",
          text: "Informasi Anda digunakan untuk memproses transaksi, mengelola akun, dan meningkatkan pengalaman pengguna di platform kami.",
        },
        {
          title: "3. Keamanan Data",
          text: "Kami menggunakan enkripsi tingkat industri untuk melindungi data pribadi dan informasi keuangan Anda dari akses yang tidak sah.",
        },
        {
          title: "4. Berbagi Informasi",
          text: "Kami tidak menjual informasi pribadi Anda kepada pihak ketiga. Kami hanya berbagi data dengan penyedia layanan yang membantu operasional platform (seperti sistem pembayaran).",
        },
        {
          title: "5. Hak Pengguna",
          text: "Anda memiliki hak untuk mengakses, memperbaiki, atau menghapus data pribadi Anda kapan saja melalui pengaturan profil.",
        },
      ],
    },
  }[type];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(2, 6, 23, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(145deg, #0f172a 0%, #020617 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.5)",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "32px 32px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255, 255, 255, 0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")}
          >
            <X size={18} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
             <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                {content.icon}
             </div>
             <div>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc", margin: 0, letterSpacing: "-0.5px" }}>
                    {content.title}
                </h2>
                <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.35)", fontWeight: "500" }}>{content.subtitle}</span>
             </div>
          </div>
        </div>

        {/* Content Body */}
        <div 
            style={{ 
                padding: "20px 32px 40px", 
                overflowY: "auto", 
                flex: 1,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.1) transparent"
            }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {content.sections.map((section, idx) => (
              <div key={idx}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ChevronRight size={14} style={{ color: type === "terms" ? "#10B981" : "#4D63FF" }} />
                  {section.title}
                </h3>
                <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.7", margin: 0, paddingLeft: "22px" }}>
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: "40px", 
            padding: "24px", 
            background: "rgba(255, 255, 255, 0.02)", 
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.04)"
          }}>
             <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", margin: 0, textAlign: "center", fontStyle: "italic" }}>
                "Membangun masa depan kerja yang aman dan transparan bersama FreeTrack."
             </p>
          </div>
        </div>

        {/* Footer Action */}
        <div style={{ padding: "24px 32px", borderTop: "1px solid rgba(255, 255, 255, 0.04)", textAlign: "right" }}>
            <button 
                onClick={onClose}
                style={{ 
                    padding: "10px 24px", 
                    borderRadius: "10px", 
                    background: type === "terms" ? "rgba(16, 185, 129, 0.1)" : "rgba(77, 99, 255, 0.1)",
                    border: `1px solid ${type === "terms" ? "rgba(16, 185, 129, 0.2)" : "rgba(77, 99, 255, 0.2)"}`,
                    color: type === "terms" ? "#10B981" : "#4D63FF",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = type === "terms" ? "rgba(16, 185, 129, 0.2)" : "rgba(77, 99, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = type === "terms" ? "rgba(16, 185, 129, 0.1)" : "rgba(77, 99, 255, 0.1)";
                }}
            >
                Mengerti
            </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
