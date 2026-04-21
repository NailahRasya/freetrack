"use client"; // Menandakan komponen dijalankan di sisi klien
import { useEffect } from "react";
import { X, Briefcase, User2, ArrowRight } from "lucide-react"; // Mengimpor ikon untuk peran dan interaksi

// Definisi tipe data untuk props yang diterima oleh RoleModal
interface RoleModalProps {
  isOpen: boolean; // Status apakah modal terbuka atau tidak
  onClose: () => void; // Fungsi untuk menutup modal
}

export default function RoleModal({ isOpen, onClose }: RoleModalProps) {
  // Efek samping untuk menutup modal ketika tombol ESC pada keyboard ditekan
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Efek samping untuk mencegah scroll pada body website ketika modal sedang terbuka
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Jika status modal tidak terbuka, jangan render apapun
  if (!isOpen) return null;

  // Konfigurasi pilihan peran (Role) yang tersedia
  const roles = [
    {
      id: "client",
      icon: <Briefcase size={32} />,
      title: "Saya seorang Client",
      desc: "Saya ingin memposting proyek, menemukan freelancer terbaik, dan memastikan pembayaran aman.",
      color: "#4D63FF",
      colorSoft: "rgba(77,99,255,0.12)",
      colorBorder: "rgba(77,99,255,0.3)",
      href: "/register?role=client",
    },
    {
      id: "freelancer",
      icon: <User2 size={32} />,
      title: "Saya seorang Freelancer",
      desc: "Saya ingin menemukan proyek, mengelola pekerjaan, dan menerima pembayaran dengan transparansi penuh.",
      color: "#10B981",
      colorSoft: "rgba(16,185,129,0.12)",
      colorBorder: "rgba(16,185,129,0.3)",
      href: "/register?role=freelancer",
    },
  ];

  return (
    <>
      {/* Backdrop: Latar belakang gelap transparan di belakang modal */}
      <div
        id="role-modal-backdrop"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          background: "rgba(5, 8, 20, 0.82)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          animation: "fadeInBackdrop 0.25s ease",
        }}
      >
        {/* Card Modal: Wadah utama konten modal */}
        <div
          id="role-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-modal-title"
          onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat konten di dalamnya diklik
          style={{
            background: "linear-gradient(145deg, rgba(13,21,56,0.98) 0%, rgba(10,15,40,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "48px 40px",
            maxWidth: "640px",
            width: "100%",
            position: "relative",
            boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
            animation: "slideUpModal 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Tombol Close (X) di pojok kanan atas modal */}
          <button
            id="role-modal-close"
            onClick={onClose}
            aria-label="Tutup modal"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
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
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(226,232,240,0.5)";
            }}
          >
            <X size={16} />
          </button>

          {/* Bagian Header Modal */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              padding: "6px 16px",
              borderRadius: "50px",
              marginBottom: "20px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#34D399", letterSpacing: "0.3px" }}>
                Daftar Sekarang
              </span>
            </div>
            <h2
              id="role-modal-title"
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#E2E8F0",
                letterSpacing: "-0.8px",
                marginBottom: "10px",
                lineHeight: 1.2,
              }}
            >
              Anda bergabung sebagai{" "}
              <span style={{
                background: "linear-gradient(135deg, #4D63FF, #10B981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                siapa?
              </span>
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.45)", lineHeight: 1.6 }}>
              Pilih peran Anda agar kami dapat menyesuaikan pengalaman terbaik untuk Anda.
            </p>
          </div>

          {/* Daftar Pilihan Peran (Client vs Freelancer) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="role-grid">
            {roles.map((role) => (
              <a
                key={role.id}
                id={`role-option-${role.id}`}
                href={role.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  padding: "28px 24px",
                  background: role.colorSoft,
                  border: `1px solid ${role.colorBorder}`,
                  borderRadius: "18px",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  position: "relative",
                  overflow: "hidden",
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = "translateY(-4px)";
                  el.style.boxShadow = `0 20px 60px ${role.color}22`;
                  el.style.borderColor = role.color;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                  el.style.borderColor = role.colorBorder;
                }}
              >
                {/* Ikon Peran */}
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  background: `${role.color}20`,
                  border: `1px solid ${role.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: role.color,
                }}>
                  {role.icon}
                </div>

                {/* Teks Deskripsi Peran */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#E2E8F0",
                    marginBottom: "8px",
                    letterSpacing: "-0.3px",
                  }}>
                    {role.title}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "rgba(226,232,240,0.5)",
                    lineHeight: "1.6",
                  }}>
                    {role.desc}
                  </div>
                </div>

                {/* Indikator klik (Arrow) */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: role.color,
                  marginTop: "4px",
                }}>
                  Pilih <ArrowRight size={14} />
                </div>
              </a>
            ))}
          </div>

          {/* Bagian Bawah Modal (Link Login jika sudah punya akun) */}
          <p style={{
            textAlign: "center",
            fontSize: "12px",
            color: "rgba(226,232,240,0.3)",
            marginTop: "24px",
          }}>
            Sudah punya akun?{" "}
            <a href="/login" style={{ color: "#4D63FF", textDecoration: "none", fontWeight: "600" }}>
              Masuk di sini
            </a>
          </p>
        </div>
      </div>

      {/* Definisi animasi CSS untuk modal */}
      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 520px) {
          .role-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
