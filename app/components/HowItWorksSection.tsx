"use client";
import { Rocket, CheckSquare, UploadCloud, Wallet, ArrowDown } from "lucide-react";

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
      <div className="orb" style={{ width: "400px", height: "400px", background: "#10B981", top: "50%", left: "-150px", opacity: 0.06 }} />
      <div className="orb" style={{ width: "350px", height: "350px", background: "#1A36F0", bottom: "0", right: "-100px", opacity: 0.07 }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
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

        {/* Vertical Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute", left: "31px", top: "0", bottom: "0", width: "2px",
            background: "linear-gradient(to bottom, rgba(26,54,240,0.3), rgba(16,185,129,0.3), rgba(6,182,212,0.3), rgba(16,185,129,0.3))",
          }} className="timeline-line" />

          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "28px", marginBottom: i < steps.length - 1 ? "48px" : "0", position: "relative" }}>
              {/* Icon circle */}
              <div style={{
                width: "64px", height: "64px", borderRadius: "16px",
                background: `linear-gradient(0deg, ${step.colorBg}, ${step.colorBg}), #0A0F1E`,
                border: `1px solid ${step.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: step.color, flexShrink: 0, zIndex: 1,
                boxShadow: `0 0 24px ${step.color}15`,
                position: "relative",
              }}>
                {step.icon}
              </div>

              {/* Content */}
              <div className="glass-card" style={{ flex: 1, padding: "24px 28px", position: "relative", overflow: "hidden" }}>
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

                <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.3)", fontWeight: "500" }}>
                  {step.detail}
                </div>
              </div>

              {/* Arrow connector */}
              {i < steps.length - 1 && (
                <div style={{
                  position: "absolute", bottom: "-36px", left: "20px",
                  width: "24px", height: "24px", borderRadius: "6px",
                  background: "#0A0F1E", // Matches page background to mask the line
                  border: `1px solid ${step.color}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: step.color, zIndex: 2,
                  boxShadow: `0 0 15px ${step.color}30`,
                  transform: "rotate(45deg)"
                }} className="timeline-arrow">
                  <div style={{ transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", marginLeft: "2px" }}>
                    <ArrowDown size={14} strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Remove timeline-line override to keep it perfectly aligned on all screens */
      `}</style>
    </section>
  );
}
