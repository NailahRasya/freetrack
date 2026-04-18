"use client";

const footerLinks = {
  Platform: [
    { label: "Cara Kerja", href: "#how-it-works" },
    { label: "Fitur", href: "#features" },
    { label: "Harga", href: "#pricing" },
    { label: "Dashboard Demo", href: "#dashboard" },
    { label: "Keamanan", href: "#" },
  ],
  Freelancer: [
    { label: "Mulai Freelance", href: "#" },
    { label: "Kembangkan Skill", href: "#" },
    { label: "Top Freelancer", href: "#" },
    { label: "Komunitas", href: "#" },
    { label: "Blog & Tips", href: "#" },
  ],
  Client: [
    { label: "Post Proyek", href: "#" },
    { label: "Cari Freelancer", href: "#" },
    { label: "Panduan Client", href: "#" },
    { label: "Enterprise", href: "#" },
    { label: "Partnership", href: "#" },
  ],
  Perusahaan: [
    { label: "Tentang Kami", href: "#" },
    { label: "Karier", href: "#" },
    { label: "Press Kit", href: "#" },
    { label: "Kebijakan Privasi", href: "#" },
    { label: "Syarat & Ketentuan", href: "#" },
  ],
};

const socialLinks = [
  { icon: "𝕏", label: "Twitter", href: "#" },
  { icon: "in", label: "LinkedIn", href: "#" },
  { icon: "f", label: "Facebook", href: "#" },
  { icon: "▶", label: "YouTube", href: "#" },
  { icon: "📸", label: "Instagram", href: "#" },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "80px 24px 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top CTA Banner */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto 80px",
          background: "linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,212,170,0.1) 100%)",
          border: "1px solid rgba(108,99,255,0.2)",
          borderRadius: "24px",
          padding: "64px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="orb"
          style={{
            width: "400px",
            height: "400px",
            background: "#6c63ff",
            top: "50%",
            left: "30%",
            transform: "translate(-50%,-50%)",
            opacity: 0.08,
          }}
        />
        <div
          className="orb"
          style={{
            width: "300px",
            height: "300px",
            background: "#00d4aa",
            top: "50%",
            right: "20%",
            transform: "translateY(-50%)",
            opacity: 0.06,
          }}
        />
        <div style={{ position: "relative" }}>
          <span className="section-badge">✦ Bergabung Sekarang</span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: "900",
              letterSpacing: "-1px",
              marginBottom: "16px",
              lineHeight: "1.2",
            }}
          >
            Mulai Proyek Pertamamu{" "}
            <span className="gradient-text">Hari Ini</span>
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(226,232,240,0.6)",
              marginBottom: "36px",
              maxWidth: "480px",
              margin: "0 auto 36px",
            }}
          >
            Gratis selamanya untuk paket Starter. Tidak perlu kartu kredit.
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a href="#" id="footer-freelancer-cta" className="btn-primary" style={{ fontSize: "16px", padding: "16px 40px" }}>
              🚀 Daftar sebagai Freelancer
            </a>
            <a href="#" id="footer-client-cta" className="btn-secondary" style={{ fontSize: "16px", padding: "16px 40px" }}>
              🏢 Post Proyek Pertama
            </a>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px repeat(4, 1fr)",
            gap: "48px",
            marginBottom: "56px",
          }}
          className="footer-grid"
        >
          {/* Brand Column */}
          <div>
            <a
              href="#"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
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
                  fontSize: "20px",
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
            <p
              style={{
                fontSize: "14px",
                color: "rgba(226,232,240,0.45)",
                lineHeight: "1.75",
                marginBottom: "24px",
              }}
            >
              Platform pihak ketiga yang menghubungkan freelancer dan client Indonesia secara aman, transparan, dan profesional.
            </p>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    color: "rgba(226,232,240,0.5)",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    fontWeight: "700",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(108,99,255,0.15)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#8b85ff";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(108,99,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(226,232,240,0.5)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.07)";
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* App Badges */}
            <div style={{ marginTop: "24px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {["App Store", "Google Play"].map((store) => (
                <a
                  key={store}
                  href="#"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "10px",
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "rgba(226,232,240,0.6)",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {store === "App Store" ? "🍎" : "🤖"} {store}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "rgba(226,232,240,0.5)",
                  marginBottom: "20px",
                }}
              >
                {category}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{
                      fontSize: "14px",
                      color: "rgba(226,232,240,0.55)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLAnchorElement).style.color = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLAnchorElement).style.color =
                        "rgba(226,232,240,0.55)")
                    }
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "32px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "rgba(226,232,240,0.3)" }}>
              © 2026 Freetrack Technologies. Hak cipta dilindungi.
            </span>
            <div style={{ display: "flex", gap: "3px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} style={{ color: "#f59e0b", fontSize: "12px" }}>★</span>
              ))}
              <span style={{ fontSize: "12px", color: "rgba(226,232,240,0.3)", marginLeft: "4px" }}>
                4.9/5 dari App Store
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(226,232,240,0.3)" }}>
            <span>🇮🇩 Dibuat dengan ❤️ di Indonesia</span>
            <span style={{ marginLeft: "16px" }}>
              🔒 Terdaftar OJK · 🏦 Escrow Berlisensi
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
