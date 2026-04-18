"use client";

const steps = [
  {
    number: "01",
    icon: "📋",
    title: "Buat Proyek",
    description: "Client posting proyek dengan detail scope, budget, dan deadline yang jelas.",
    role: "client",
    color: "#6c63ff",
  },
  {
    number: "02",
    icon: "🤝",
    title: "Pilih Freelancer",
    description: "Terima proposal dari freelancer terbaik, review portofolio dan rating mereka.",
    role: "client",
    color: "#00d4aa",
  },
  {
    number: "03",
    icon: "💳",
    title: "Commitment Fee",
    description: "Bayar commitment fee sebagai jaminan keseriusan. Dana aman di escrow freetrack.",
    role: "both",
    color: "#f59e0b",
  },
  {
    number: "04",
    icon: "🎯",
    title: "Milestone Planning",
    description: "Susun rencana milestone bersama — deadline, deliverable, dan nominal pembayaran setiap fase.",
    role: "both",
    color: "#8b5cf6",
  },
  {
    number: "05",
    icon: "⚡",
    title: "Kerjakan & Submit",
    description: "Freelancer mengerjakan dan mengirim bukti pekerjaan di setiap milestone.",
    role: "freelancer",
    color: "#10b981",
  },
  {
    number: "06",
    icon: "✅",
    title: "Review & Approval",
    description: "Client review, minta revisi jika perlu melalui change request, lalu beri approval.",
    role: "client",
    color: "#ef4444",
  },
  {
    number: "07",
    icon: "💰",
    title: "Pembayaran Otomatis",
    description: "Setelah disetujui, pembayaran milestone langsung cair ke freelancer secara otomatis.",
    role: "freelancer",
    color: "#3b82f6",
  },
  {
    number: "08",
    icon: "⭐",
    title: "Rating & Review",
    description: "Kedua pihak saling memberi ulasan untuk membangun ekosistem terpercaya.",
    role: "both",
    color: "#ec4899",
  },
];

const roleColors: Record<string, { bg: string; text: string; label: string }> = {
  client: { bg: "rgba(0,212,170,0.1)", text: "#00d4aa", label: "Client" },
  freelancer: { bg: "rgba(108,99,255,0.1)", text: "#8b85ff", label: "Freelancer" },
  both: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", label: "Keduanya" },
};

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
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
          background: "#00d4aa",
          top: "0",
          right: "-150px",
          opacity: 0.06,
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <span className="section-badge">✦ Cara Kerja</span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: "800",
              lineHeight: "1.2",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            8 Langkah Menuju{" "}
            <span className="gradient-text">Kolaborasi Sempurna</span>
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(226,232,240,0.55)",
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            Proses yang jelas dan terstruktur memastikan proyek berjalan lancar
            dari awal hingga selesai.
          </p>
        </div>

        {/* Steps Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {steps.map((step) => {
            const role = roleColors[step.role];
            return (
              <div
                key={step.number}
                className="glass-card"
                style={{ padding: "28px", position: "relative" }}
              >
                {/* Step Number */}
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    fontSize: "36px",
                    fontWeight: "900",
                    color: "rgba(255,255,255,0.04)",
                    lineHeight: "1",
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{step.icon}</div>

                {/* Role Badge */}
                <span
                  style={{
                    display: "inline-block",
                    background: role.bg,
                    color: role.text,
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {role.label}
                </span>

                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    marginBottom: "10px",
                    color: step.color,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(226,232,240,0.55)",
                    lineHeight: "1.65",
                  }}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div
          style={{
            marginTop: "60px",
            background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.1))",
            border: "1px solid rgba(108,99,255,0.2)",
            borderRadius: "24px",
            padding: "48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="orb"
            style={{
              width: "300px",
              height: "300px",
              background: "#6c63ff",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              opacity: 0.1,
            }}
          />
          <h3
            style={{
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: "800",
              marginBottom: "12px",
              position: "relative",
            }}
          >
            Siap Memulai Perjalananmu?
          </h3>
          <p
            style={{
              color: "rgba(226,232,240,0.6)",
              fontSize: "16px",
              marginBottom: "28px",
              position: "relative",
            }}
          >
            Bergabung dengan ribuan freelancer dan client yang sudah mempercayai freetrack.
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <a href="#" id="how-freelancer-cta" className="btn-primary">🚀 Daftar sebagai Freelancer</a>
            <a href="#" id="how-client-cta" className="btn-secondary">💼 Post Proyek Sekarang</a>
          </div>
        </div>
      </div>
    </section>
  );
}
