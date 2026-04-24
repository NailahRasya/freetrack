"use client";
import { Target, Users, GraduationCap, TrendingUp, Heart, Globe } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Nadia Putri",
    role: "Mahasiswi Desain · Universitas Indonesia",
    text: "Dulu klien minta tambah 3 halaman tanpa bayar extra. Sekarang lewat FreeTrack, setiap tambahan otomatis masuk Change Request. Saya nggak rugi lagi.",
    avatar: "NP",
    color: "#10B981",
  },
  {
    name: "Raka Mahardika",
    role: "Junior Web Developer · ITS Surabaya",
    text: "Fitur escrow benar-benar bikin tenang. DP sudah masuk sebelum saya mulai ngoding. Kalau klien ghosting, uang tetap aman di FreeTrack.",
    avatar: "RM",
    color: "#1A36F0",
  },
  {
    name: "Sari Dewi",
    role: "Copywriter Freelance · UGM",
    text: "Invoice otomatis setiap milestone selesai — nggak perlu lagi bikin sendiri di Canva. Profesional banget, klien juga lebih percaya.",
    avatar: "SD",
    color: "#06B6D4",
  },
  {
    name: "Bima Arya",
    role: "Videografer Freelance · ISI Yogyakarta",
    text: "Pernah kerja capek-capek tapi revisi video nggak habis-habis. Fitur limit revisi dan milestone di sini bikin kerjaan jelas kapan selesainya.",
    avatar: "BA",
    color: "#F59E0B",
  },
  {
    name: "Citra Larasati",
    role: "Social Media Manager · Univ. Brawijaya",
    text: "Klien sering lupa bayar kalau nggak ditagih. Auto-invoicing dari FreeTrack jadi penyelamat, dan penarikan dananya juga cepat banget masuk ke rekening.",
    avatar: "CL",
    color: "#10B981",
  },
  {
    name: "Kevin Pratama",
    role: "UI/UX Designer · Telkom University",
    text: "Baru pertama kali ngerasa freelance se-profesional ini. Sistem kontrak digitalnya bikin kesepakatan kuat secara hukum, nggak ada lagi project menggantung.",
    avatar: "KP",
    color: "#1A36F0",
  },
  {
    name: "Anisa Maharani",
    role: "Illustrator · ITB",
    text: "Sangat terbantu buat mahasiswa yang baru mulai freelance dan nggak ngerti cara bikin kontrak. Semua template dan workflow sudah disediakan otomatis.",
    avatar: "AM",
    color: "#06B6D4",
  }
];

export default function TestimonialsSection() {
  return (
    <section id="mission" style={{ padding: "120px 0", position: "relative", overflow: "hidden" }}>
      <div className="orb" style={{ width: "500px", height: "500px", background: "#10B981", top: "-100px", left: "50%", transform: "translateX(-50%)", opacity: 0.06 }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <span className="section-badge">✦ Misi Kami</span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "900", letterSpacing: "-1px", lineHeight: "1.15", marginBottom: "16px" }}>
            Membantu{" "}
            <span className="gradient-text-emerald">5.000 Freelancer Mahasiswa</span>
            <br />
            di Indonesia
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(226,232,240,0.5)", maxWidth: "560px", margin: "0 auto" }}>
            Kami percaya setiap mahasiswa dan profesional muda berhak mendapatkan bayaran yang adil atas kerja kerasnya — tanpa takut ditipu.
          </p>
        </div>

        {/* Mission Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "80px" }}>
          {[
            { icon: <GraduationCap size={22} />, value: "3.200+", label: "Freelancer Mahasiswa Terdaftar", color: "#10B981" },
            { icon: <TrendingUp size={22} />, value: "Rp 2.8M+", label: "Total Dana Diamankan", color: "#06B6D4" },
            { icon: <Target size={22} />, value: "97%", label: "Proyek Selesai Tepat Waktu", color: "#1A36F0" },
            { icon: <Heart size={22} />, value: "4.9/5", label: "Rating Kepuasan Pengguna", color: "#F59E0B" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card" style={{ padding: "28px", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `${stat.color}15`, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#E2E8F0", marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.4)", lineHeight: "1.4" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ marginBottom: "64px", position: "relative", width: "100%" }}>
        <h3 style={{ fontSize: "22px", fontWeight: "800", textAlign: "center", marginBottom: "36px", color: "#E2E8F0" }}>
          Cerita dari Mereka yang Sudah Merasakan
        </h3>
        
        {/* Full-width marquee container */}
        <div style={{ position: "relative", overflow: "hidden", padding: "10px 0" }}>
          <div className="marquee-container" style={{
            display: "flex",
            width: "max-content",
            animation: "scrollX 40s linear infinite",
            gap: "20px",
            paddingLeft: "20px" // give some initial padding
          }}>
            {/* Render array twice to loop seamlessly */}
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={`${t.name}-${i}`} className="glass-card" style={{ width: "350px", padding: "28px", flexShrink: 0, whiteSpace: "normal" }}>
                <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.65)", lineHeight: "1.75", fontStyle: "italic", marginBottom: "20px" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: `${t.color}20`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: "800", color: t.color, flexShrink: 0
                  }}>
                    {t.avatar}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#E2E8F0", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{t.name}</div>
                    <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left/Right Edge Shadows for Smooth Scrolling Effect */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "100px", background: "linear-gradient(to right, #0A0F1E 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "100px", background: "linear-gradient(to left, #0A0F1E 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", padding: "0 24px" }}>

        {/* Vision statement */}
        <div style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))",
          border: "1px solid rgba(16,185,129,0.15)", borderRadius: "20px",
          padding: "48px 40px", textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div className="orb" style={{ width: "300px", height: "300px", background: "#10B981", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.06 }} />
          <div style={{ position: "relative" }}>
            <Globe size={32} style={{ color: "#10B981", margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: "800", marginBottom: "12px", lineHeight: "1.3" }}>
              &ldquo;Setiap freelancer muda di Indonesia berhak bekerja dengan aman.&rdquo;
            </h3>
            <p style={{ fontSize: "15px", color: "rgba(226,232,240,0.45)", maxWidth: "520px", margin: "0 auto 28px", lineHeight: "1.7" }}>
              Kami sedang membangun ekosistem di mana mahasiswa bisa membangun karier freelance tanpa takut. Target kami: 5.000 freelancer terlindungi di akhir 2026.
            </p>
            <a href="#" className="btn-emerald" style={{ padding: "14px 36px" }}>
              <Users size={16} />
              Bergabung dengan Misi Kami
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollX {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 10px)); } /* 10px is half the gap */
        }
        .marquee-container:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
}
