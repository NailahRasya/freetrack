"use client"; // Menandakan bahwa komponen dijalankan di sisi klien
import { ArrowRight, Shield, Globe } from "lucide-react"; // Mengimpor ikon untuk visualisasi di footer
import { motion } from "framer-motion";

// Struktur data untuk link yang ditampilkan di footer, dikelompokkan berdasarkan kategori
const footerLinks = {
  Platform: [
    { label: "Fitur", href: "#features" },
    { label: "Cara Kerja", href: "#workflow" },
    { label: "Dashboard", href: "#dashboard" },
    { label: "Keamanan", href: "#" },
  ],
  Freelancer: [
    { label: "Mulai Freelance", href: "#" },
    { label: "Panduan Kontrak", href: "#" },
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
  Legal: [
    { label: "Tentang Kami", href: "#" },
    { label: "Karier", href: "#" },
    { label: "Kebijakan Privasi", href: "#" },
    { label: "Syarat & Ketentuan", href: "#" },
    { label: "Press Kit", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "80px 24px 40px", position: "relative", overflow: "hidden" }}>
      {/* CTA Banner: Ajakan terakhir di bawah halaman untuk mendaftar */}
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          maxWidth: "1200px", margin: "0 auto 80px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))",
          border: "1px solid rgba(16,185,129,0.15)", borderRadius: "24px",
          padding: "64px 48px", textAlign: "center", position: "relative", overflow: "hidden",
        }}
      >
        <div className="orb" style={{ width: "400px", height: "400px", background: "#10B981", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.06 }} />
        <div style={{ position: "relative" }}>
          <span className="section-badge">✦ Mulai Sekarang</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: "900", letterSpacing: "-1px", marginBottom: "14px", lineHeight: "1.2" }}>
            Kelola Proyek Pertamamu{" "}
            <span className="gradient-text-emerald">Hari Ini</span>
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(226,232,240,0.5)", marginBottom: "32px", maxWidth: "460px", margin: "0 auto 32px" }}>
            Gratis selamanya. Tidak perlu kartu kredit.
          </p>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <motion.a 
              whileHover={{ scale: 1.05, filter: "brightness(1.1)", boxShadow: "0 0 25px rgba(16,185,129,0.5)" }}
              transition={{ duration: 0.2 }}
              href="#" 
              className="btn-emerald" 
              style={{ fontSize: "16px", padding: "16px 40px", display: "inline-flex" }}
            >
              Daftar sebagai Freelancer
              <ArrowRight size={16} />
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              href="#" 
              className="btn-secondary" 
              style={{ fontSize: "16px", padding: "16px 40px", display: "inline-flex" }}
            >
              Post Proyek Pertama
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Konten Utama Footer (Grid Link dan Branding) */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "260px repeat(4, 1fr)", gap: "48px", marginBottom: "56px" }} className="footer-grid">
          {/* Bagian Brand dan Deskripsi Singkat */}
          <div>
            <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <img src="/logo_icon.png" alt="FreeTrack" style={{ height: "32px", display: "block" }} />
              <span style={{
                fontSize: "18px", fontWeight: "800", letterSpacing: "-0.5px",
                background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                FreeTrack
              </span>
            </a>
            <p style={{ fontSize: "13px", color: "rgba(226,232,240,0.4)", lineHeight: "1.7", marginBottom: "20px" }}>
              Platform project governance untuk freelancer mahasiswa dan profesional muda Indonesia.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(226,232,240,0.3)" }}>
              <Globe size={12} />
              Dibuat oleh Kelompok 4 RPL
            </div>
          </div>

          {/* Mapping kolom link footer berdasarkan kategori */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(226,232,240,0.4)", marginBottom: "18px" }}>
                {category}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {links.map((link) => (
                  <a key={link.label} href={link.href} style={{
                    fontSize: "13px", color: "rgba(226,232,240,0.45)", textDecoration: "none", transition: "color 0.2s ease",
                  }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#e2e8f0")}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "rgba(226,232,240,0.45)")}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bar bagian paling bawah footer (Copyright dan Trust Badge) */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "28px",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px",
        }}>
          <span style={{ fontSize: "12px", color: "rgba(226,232,240,0.25)" }}>
            © 2026 FreeTrack Technologies. Hak cipta dilindungi.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(226,232,240,0.25)" }}>
            <Shield size={12} />
            Escrow Terjamin · Transaksi Terenkripsi
          </div>
        </div>
      </div>

      {/* Styling CSS untuk responsivitas kolom footer pada layar tablet/mobile */}
      <style>{`
        @media (max-width: 1000px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
