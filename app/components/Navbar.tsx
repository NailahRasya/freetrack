"use client";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Fitur", href: "#features" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Harga", href: "#pricing" },
  { label: "Testimoni", href: "#testimonials" },
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
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.3s ease",
        background: scrolled
          ? "rgba(5, 8, 22, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "none",
      }}
    >
      <nav
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "800",
              color: "white",
            }}
          >
            F
          </div>
          <span
            style={{
              fontSize: "22px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            freetrack
          </span>
        </a>

        {/* Desktop Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
          }}
          className="hidden-mobile"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                color: "rgba(226,232,240,0.7)",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: "500",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "#e2e8f0")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color =
                  "rgba(226,232,240,0.7)")
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a
            href="#"
            id="nav-login"
            className="btn-secondary hidden-mobile"
            style={{ padding: "10px 24px", fontSize: "14px" }}
          >
            Masuk
          </a>
          <a
            href="#"
            id="nav-register"
            className="btn-primary"
            style={{ padding: "10px 24px", fontSize: "14px" }}
          >
            Daftar Gratis
          </a>
          {/* Hamburger */}
          <button
            id="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#e2e8f0",
              fontSize: "24px",
              padding: "4px",
            }}
            className="show-mobile"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            background: "rgba(5, 8, 22, 0.97)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: "rgba(226,232,240,0.8)",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "500",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {link.label}
            </a>
          ))}
          <a href="#" className="btn-primary" style={{ textAlign: "center", marginTop: "8px" }}>
            Daftar Gratis
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
