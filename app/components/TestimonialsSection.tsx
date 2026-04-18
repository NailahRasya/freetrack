"use client";

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Full-stack Developer",
    avatar: "👨‍💻",
    avatarBg: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
    rating: 5,
    text: "Freetrack benar-benar mengubah cara saya bekerja. Sistem milestone dan commitment fee bikin saya tenang. Tidak ada lagi klien kabur setelah proyek selesai!",
    stats: "42 proyek · Rp 180jt earned",
    verified: true,
  },
  {
    name: "Siti Rahayu",
    role: "UI/UX Designer",
    avatar: "👩‍🎨",
    avatarBg: "linear-gradient(135deg, #ec4899, #f59e0b)",
    rating: 5,
    text: "Dashboard progress tracker-nya luar biasa. Klien saya bisa pantau progress real-time, jadi tidak ada miscommunication. Evidence submission juga memudahkan review hasil kerja.",
    stats: "28 proyek · Rating 5.0",
    verified: true,
  },
  {
    name: "PT Kreasi Digital",
    role: "Client · Tech Startup",
    avatar: "🏢",
    avatarBg: "linear-gradient(135deg, #00d4aa, #3b82f6)",
    rating: 5,
    text: "Kami sudah hire 15+ freelancer lewat freetrack. Change request system-nya sangat membantu — semua revisi tercatat rapi, tidak ada yang saling menyalahkan.",
    stats: "15+ proyek dikelola",
    verified: true,
  },
  {
    name: "Rizky Pratama",
    role: "Mobile Developer",
    avatar: "👨‍🔬",
    avatarBg: "linear-gradient(135deg, #10b981, #6c63ff)",
    rating: 5,
    text: "Fitur rating dan review terverifikasi sangat membantu reputasi saya. Setelah 3 bulan di freetrack, income saya naik 3x lipat karena portfolio yang terpercaya.",
    stats: "19 proyek · Top Freelancer",
    verified: true,
  },
  {
    name: "Dewi Kusuma",
    role: "Client · E-commerce Owner",
    avatar: "👩‍💼",
    avatarBg: "linear-gradient(135deg, #f59e0b, #ef4444)",
    rating: 5,
    text: "Milestone planning yang terstruktur membuat proyek website toko online saya selesai tepat waktu. Transparan dari awal, tidak ada biaya tersembunyi.",
    stats: "6 proyek diselesaikan",
    verified: true,
  },
  {
    name: "Andre Wijaya",
    role: "Copywriter & Content Creator",
    avatar: "✍️",
    avatarBg: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    rating: 5,
    text: "Sebagai freelancer konten, saya sering bingung soal revisi tanpa batas. Di freetrack, setiap change request jelas dan ada batasannya. Profesioanl banget!",
    stats: "31 proyek · Top Rated",
    verified: true,
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      style={{
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="orb"
        style={{
          width: "400px",
          height: "400px",
          background: "#ec4899",
          top: "20%",
          right: "-150px",
          opacity: 0.06,
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span className="section-badge">✦ Testimoni</span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: "800",
              lineHeight: "1.2",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Dipercaya Ribuan{" "}
            <span className="gradient-text">Pengguna Aktif</span>
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(226,232,240,0.55)",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            Dengarkan langsung dari freelancer dan client yang telah merasakan manfaatnya.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: "3px" }}>
                {Array.from({ length: t.rating }).map((_, s) => (
                  <span key={s} style={{ color: "#f59e0b", fontSize: "16px" }}>★</span>
                ))}
              </div>

              {/* Text */}
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(226,232,240,0.7)",
                  lineHeight: "1.75",
                  fontStyle: "italic",
                  flex: 1,
                }}
              >
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: t.avatarBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700" }}>{t.name}</span>
                    {t.verified && (
                      <span
                        style={{
                          background: "rgba(16,185,129,0.12)",
                          color: "#10b981",
                          fontSize: "10px",
                          fontWeight: "700",
                          padding: "2px 7px",
                          borderRadius: "10px",
                        }}
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.45)", marginTop: "2px" }}>
                    {t.role}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)", marginTop: "1px" }}>
                    {t.stats}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div
          style={{
            marginTop: "56px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "40px",
            padding: "40px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "20px",
          }}
        >
          {[
            { value: "4.9/5", label: "Rating rata-rata", icon: "⭐" },
            { value: "98%", label: "Client puas", icon: "😍" },
            { value: "12K+", label: "Ulasan terverifikasi", icon: "✅" },
            { value: "99%", label: "Proyek selesai tepat waktu", icon: "⏰" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>{item.icon}</div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {item.value}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.45)", marginTop: "4px" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
