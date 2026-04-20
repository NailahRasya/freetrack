"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Fitur", href: "#features" },
  { label: "Cara Kerja", href: "#workflow" },
  { label: "Dashboard", href: "#dashboard" },

  { label: "Misi Kami", href: "#mission" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        transition: "all 0.3s ease",
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
        {/* Logo */}
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

        {/* Desktop Nav */}
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

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <a href="#" id="nav-login" className="btn-secondary hidden-mobile" style={{ padding: "10px 26px", fontSize: "13px", borderRadius: "10px" }}>
            Masuk
          </a>
          <a href="#" id="nav-register" className="btn-emerald hidden-mobile" style={{ padding: "10px 26px", fontSize: "13px", borderRadius: "10px" }}>
            Mulai Gratis
          </a>
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

      {/* Mobile Menu */}
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
          <a href="#" className="btn-emerald" style={{ textAlign: "center", justifyContent: "center", marginTop: "8px" }}>
            Mulai Gratis
          </a>
        </div>
      )}

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
  );
}
