"use client"; // Menandakan bahwa file ini adalah Client Component karena menggunakan hook
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // Mengimpor ikon untuk menu mobile
import RoleModal from "./RoleModal"; // Mengimpor modal pemilihan role

// Daftar link navigasi yang akan ditampilkan di Navbar
const navLinks = [
  { label: "Fitur", href: "#features" },
  { label: "Cara Kerja", href: "#workflow" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Misi Kami", href: "#mission" },
];

export default function Navbar() {
  // State untuk melacak apakah halaman sedang di-scroll, untuk efek transparan/gelap
  const [scrolled, setScrolled] = useState(false);
  // State untuk membuka/tutup menu navigasi pada tampilan mobile
  const [menuOpen, setMenuOpen] = useState(false);
  // State untuk membuka/tutup modal pemilihan role login/register
  const [modalOpen, setModalOpen] = useState(false);

  // Efek samping untuk mendeteksi scroll window dan mengubah state 'scrolled'
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          transition: "all 0.3s ease",
          // Background berubah menjadi semi-transparan saat di-scroll
          background: scrolled ? "rgba(10, 15, 30, 0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}
      >
        <nav
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            height: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo FreeTrack */}
          <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo_icon.png" alt="FreeTrack" style={{ height: "36px", display: "block" }} />
            <span style={{
              fontSize: "19px", fontWeight: "800", letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              FreeTrack
            </span>
          </a>

          {/* Bagian Navigasi Desktop (Disembunyikan di mobile) */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }} className="hidden-mobile">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  color: "rgba(226,232,240,0.6)", textDecoration: "none",
                  fontSize: "14px", fontWeight: "500", transition: "color 0.2s ease",
                  letterSpacing: "0.2px",
                }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#e2e8f0")}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "rgba(226,232,240,0.6)")}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Bagian Call to Action (CTA) / Tombol Masuk & Daftar */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button
              id="nav-login"
              className="btn-secondary hidden-mobile"
              onClick={() => setModalOpen(true)}
              style={{ padding: "10px 26px", fontSize: "13px", borderRadius: "10px", border: "none", cursor: "pointer" }}
            >
              Masuk
            </button>
            <button
              id="nav-register"
              className="btn-emerald hidden-mobile"
              onClick={() => setModalOpen(true)}
              style={{ padding: "10px 26px", fontSize: "13px", borderRadius: "10px", border: "none", cursor: "pointer" }}
            >
              Mulai Gratis
            </button>
            {/* Tombol Hamburger untuk mobile */}
            <button
              id="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{ display: "none", background: "transparent", border: "none", cursor: "pointer", color: "#e2e8f0", padding: "4px" }}
              className="show-mobile"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Overlay Menu Tampilan Mobile */}
        {menuOpen && (
          <div style={{
            background: "rgba(10, 15, 30, 0.98)", borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px",
          }}>
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} style={{
                color: "rgba(226,232,240,0.75)", textDecoration: "none",
                fontSize: "15px", fontWeight: "500", padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                {link.label}
              </a>
            ))}
            <button
              className="btn-emerald"
              onClick={() => { setMenuOpen(false); setModalOpen(true); }}
              style={{ textAlign: "center", justifyContent: "center", marginTop: "8px", border: "none", cursor: "pointer" }}
            >
              Mulai Gratis
            </button>
          </div>
        )}

        {/* Styling CSS tambahan untuk responsivitas mobile */}
        <style>{`
          @media (max-width: 768px) {
            .hidden-mobile { display: none !important; }
            .show-mobile { display: flex !important; }
          }
          @media (min-width: 769px) {
            .show-mobile { display: none !important; }
          }
        `}</style>
      </header>

      {/* Modal Pilihan Role yang dipanggil dari Navbar */}
      <RoleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
