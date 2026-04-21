"use client"; // Komponen dijalankan di sisi klien
import { Rocket, CheckSquare, UploadCloud, Wallet, ArrowDown } from "lucide-react"; // Mengimpor ikon untuk flow kerja

// Definisi langkah-langkah (steps) dalam alur kerja FreeTrack
const steps = [
  {
    icon: <Rocket size={24} />,
    title: "Inisiasi Proyek",
    description: "Client dan freelancer sepakat. Scope dikunci di kontrak digital, milestone ditentukan, dan DP masuk ke escrow.",
    color: "#1A36F0",
    colorBg: "rgba(26,54,240,0.1)",
    detail: "Kontrak · Milestone · Escrow DP",
  },
  {
    icon: <CheckSquare size={24} />,
    title: "Milestone Approval",
    description: "Freelancer menyelesaikan tahap, client mereview. Tidak ada respons? Auto-approve aktif. Tidak ada yang digantung.",
    color: "#10B981",
    colorBg: "rgba(16,185,129,0.1)",
    detail: "Review · Auto-Approve · Change Request",
  },
  {
    icon: <UploadCloud size={24} />,
    title: "Upload Bukti Kerja",
    description: "File, link, screenshot — upload langsung ke platform sebagai bukti penyelesaian. Dokumentasi rapi, tak terbantahkan.",
    color: "#06B6D4",
    colorBg: "rgba(6,182,212,0.1)",
    detail: "File Upload · Link · Screenshot",
  },
  {
    icon: <Wallet size={24} />,
    title: "Penarikan Dana",
    description: "Milestone disetujui, invoice terbit otomatis, dan dana langsung masuk ke saldo FreeTrack-mu. Tarik kapan saja.",
    color: "#10B981",
    colorBg: "rgba(16,185,129,0.1)",
    detail: "Invoice Otomatis · Instant Withdraw",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="workflow" style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      {/* Ornamen latar belakang (orb cahaya) */}
      <div className="orb" style={{ width: "400px", height: "400px", background: "#10B981", top: "50%", left: "-150px", opacity: 0.06 }} />
      <div className="orb" style={{ width: "350px", height: "350px", background: "#1A36F0", bottom: "0", right: "-100px", opacity: 0.07 }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
        {/* Header Section Alur Kerja */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <span className="section-badge">✦ The Workflow</span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "900", letterSpacing: "-1px", lineHeight: "1.15", marginBottom: "16px" }}>
            Dari Ide ke{" "}
            <span className="gradient-text-emerald">Dana Cair</span>
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(226,232,240,0.5)", maxWidth: "480px", margin: "0 auto" }}>
            Empat tahap sederhana yang menjamin proyek berjalan lancar dan bayaranmu aman.
          </p>
        </div>

        {/* Timeline Vertikal untuk menjelaskan langkah-langkah */}
        <div style={{ position: "relative" }}>
          {/* Garis vertikal penghubung antar langkah */}
          <div style={{
            position: "absolute", left: "32px", top: "0", bottom: "0", width: "2px",
            background: "linear-gradient(to bottom, rgba(26,54,240,0.3), rgba(16,185,129,0.3), rgba(6,182,212,0.3), rgba(16,185,129,0.3))",
          }} className="timeline-line" />

          {/* Mapping data steps menjadi elemen UI */}
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "28px", marginBottom: i < steps.length - 1 ? "48px" : "0", position: "relative" }}>
              {/* Lingkaran Ikon Langkah */}
              <div style={{
                width: "64px", height: "64px", borderRadius: "16px",
                background: step.colorBg,
                border: `1px solid ${step.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: step.color, flexShrink: 0, zIndex: 1,
                boxShadow: `0 0 24px ${step.color}15`,
              }}>
                {step.icon}
              </div>

              {/* Kartu Konten Langkah (Glassmorphism style) */}
              <div className="glass-card" style={{ flex: 1, padding: "24px 28px", position: "relative" }}>
                {/* Garis aksen di bagian atas kartu */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${step.color}, transparent)` }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#E2E8F0" }}>{step.title}</h3>
                  <span style={{
                    fontSize: "11px", fontWeight: "600", color: step.color,
                    background: step.colorBg, padding: "3px 10px", borderRadius: "6px",
                    letterSpacing: "0.3px", whiteSpace: "nowrap",
                  }}>
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.5)", lineHeight: "1.7", marginBottom: "14px" }}>
                  {step.description}
                </p>

                {/* Detail teknis singkat di bawah deskripsi */}
                <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.3)", fontWeight: "500" }}>
                  {step.detail}
                </div>
              </div>

              {/* Ikon panah bawah sebagai konektor antar langkah */}
              {i < steps.length - 1 && (
                <div style={{
                  position: "absolute", bottom: "-30px", left: "28px",
                  color: "rgba(226,232,240,0.1)", zIndex: 0,
                }}>
                  <ArrowDown size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kontrol CSS khusus untuk tampilan mobile agar garis timeline tetap rapi */}
      <style>{`
        @media (max-width: 600px) {
          .timeline-line { left: 24px !important; }
        }
      `}</style>
    </section>
  );
}
