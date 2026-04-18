"use client";

const features = [
  {
    id: "project-initiation",
    icon: "🚀",
    title: "Project Initiation",
    description:
      "Mulai proyek dengan mudah — definisikan scope, timeline, dan anggaran. Sistem kami membantu menyusun brief proyek yang jelas antara freelancer dan client.",
    color: "#6c63ff",
    gradient: "108,99,255",
    tag: "Untuk Client & Freelancer",
  },
  {
    id: "commitment-fee",
    icon: "💳",
    title: "Commitment Fee",
    description:
      "Lindungi kedua belah pihak dengan sistem commitment fee. Freelancer serius, client terjamin. Dana disimpan aman di escrow hingga proyek selesai.",
    color: "#f59e0b",
    gradient: "245,158,11",
    tag: "Keamanan Finansial",
  },
  {
    id: "milestone-planning",
    icon: "🎯",
    title: "Milestone Planning",
    description:
      "Pecah proyek besar menjadi milestone yang terukur. Setiap milestone memiliki deadline, deliverable, dan pembayaran parsial yang jelas.",
    color: "#00d4aa",
    gradient: "0,212,170",
    tag: "Manajemen Proyek",
  },
  {
    id: "evidence-submission",
    icon: "📎",
    title: "Evidence Submission",
    description:
      "Freelancer kirim bukti pekerjaan langsung di platform — foto, video, file, atau link. Semua tersimpan rapi dan mudah diakses kapan saja.",
    color: "#8b5cf6",
    gradient: "139,92,246",
    tag: "Pengiriman Hasil",
  },
  {
    id: "review-approval",
    icon: "✅",
    title: "Review & Approval",
    description:
      "Client review hasil pekerjaan dan beri approval langsung di dashboard. Ada sistem notifikasi real-time agar tidak ada yang terlewat.",
    color: "#10b981",
    gradient: "16,185,129",
    tag: "Quality Control",
  },
  {
    id: "change-request",
    icon: "🔄",
    title: "Change Request",
    description:
      "Revisi? Tidak masalah. Sistem change request kami mencatat semua perubahan secara transparan, termasuk dampak terhadap timeline dan biaya.",
    color: "#ef4444",
    gradient: "239,68,68",
    tag: "Fleksibilitas",
  },
  {
    id: "dashboard-progress",
    icon: "📊",
    title: "Dashboard Progress Tracker",
    description:
      "Pantau semua proyek dalam satu tampilan. Grafik progres, status milestone, dan riwayat aktivitas tersedia real-time di dashboard intuitif.",
    color: "#3b82f6",
    gradient: "59,130,246",
    tag: "Monitoring Real-time",
  },
  {
    id: "rating-review",
    icon: "⭐",
    title: "Rating & Review",
    description:
      "Bangun reputasi yang kuat. Setelah proyek selesai, client dan freelancer saling memberikan rating dan ulasan yang jujur dan terverifikasi.",
    color: "#ec4899",
    gradient: "236,72,153",
    tag: "Reputasi Terverifikasi",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Orb */}
      <div
        className="orb"
        style={{
          width: "500px",
          height: "500px",
          background: "#6c63ff",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.04,
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span className="section-badge">✦ Fitur Unggulan</span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: "800",
              lineHeight: "1.2",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Semua yang Kamu Butuhkan{" "}
            <span className="gradient-text">dalam Satu Platform</span>
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(226,232,240,0.55)",
              maxWidth: "540px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            Dari awal proyek hingga pembayaran akhir, freetrack menjaga setiap
            langkah kolaborasimu tetap aman dan terstruktur.
          </p>
        </div>

        {/* Features Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((feature, i) => (
            <div
              key={feature.id}
              id={feature.id}
              className="glass-card"
              style={{
                padding: "28px",
                position: "relative",
                overflow: "hidden",
                animationDelay: `${i * 0.08}s`,
              }}
            >
              {/* Corner Accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "80px",
                  height: "80px",
                  background: `radial-gradient(circle at top right, rgba(${feature.gradient}, 0.15), transparent)`,
                  borderRadius: "0 16px 0 0",
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  background: `rgba(${feature.gradient}, 0.12)`,
                  border: `1px solid rgba(${feature.gradient}, 0.25)`,
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "16px",
                }}
              >
                {feature.icon}
              </div>

              {/* Tag */}
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: feature.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: 0.8,
                }}
              >
                {feature.tag}
              </span>

              {/* Title */}
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginTop: "6px",
                  marginBottom: "10px",
                  color: "#e2e8f0",
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(226,232,240,0.55)",
                  lineHeight: "1.7",
                }}
              >
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, rgba(${feature.gradient}, 0.5), transparent)`,
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
                className="card-accent-line"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .glass-card:hover .card-accent-line {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
}
