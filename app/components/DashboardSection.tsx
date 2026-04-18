"use client";
import { useState } from "react";

const milestones = [
  { name: "Project Brief & Planning", progress: 100, status: "done", payout: "Rp 500k" },
  { name: "UI/UX Design Wireframe", progress: 100, status: "done", payout: "Rp 1.2jt" },
  { name: "Frontend Development", progress: 65, status: "active", payout: "Rp 2.5jt" },
  { name: "Backend Integration", progress: 0, status: "pending", payout: "Rp 2jt" },
  { name: "Testing & QA", progress: 0, status: "pending", payout: "Rp 800k" },
];

const activities = [
  { icon: "📎", text: "Ahmad mengirim bukti kerja fase 3", time: "2 mnt lalu", type: "submit" },
  { icon: "✅", text: "Milestone 2 disetujui oleh client", time: "1 jam lalu", type: "approve" },
  { icon: "💬", text: "Change request baru: tambah fitur search", time: "3 jam lalu", type: "change" },
  { icon: "💳", text: "Pembayaran Rp 1.2jt dikirim ke Ahmad R.", time: "5 jam lalu", type: "payment" },
  { icon: "⭐", text: "Rating 5.0 diterima dari PT Maju Jaya", time: "1 hari lalu", type: "rating" },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  done: { bg: "rgba(16,185,129,0.1)", text: "#10b981", label: "Selesai" },
  active: { bg: "rgba(108,99,255,0.1)", text: "#8b85ff", label: "Berjalan" },
  pending: { bg: "rgba(255,255,255,0.04)", text: "rgba(226,232,240,0.4)", label: "Menunggu" },
};

export default function DashboardSection() {
  const [activeTab, setActiveTab] = useState<"freelancer" | "client">("freelancer");

  return (
    <section
      id="dashboard"
      style={{
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, transparent, rgba(13,27,62,0.4) 50%, transparent)",
      }}
    >
      <div
        className="orb"
        style={{
          width: "500px",
          height: "500px",
          background: "#6c63ff",
          bottom: "-100px",
          left: "-150px",
          opacity: 0.07,
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span className="section-badge">✦ Dashboard Preview</span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: "800",
              lineHeight: "1.2",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Dashboard{" "}
            <span className="gradient-text">Progress Tracker</span>
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(226,232,240,0.55)",
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Pantau setiap proyek secara real-time. Satu tampilan, semua informasi yang kamu butuhkan.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "50px",
              padding: "6px",
              display: "flex",
              gap: "4px",
            }}
          >
            {(["freelancer", "client"] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 28px",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  background:
                    activeTab === tab
                      ? "linear-gradient(135deg, #6c63ff, #00d4aa)"
                      : "transparent",
                  color: activeTab === tab ? "white" : "rgba(226,232,240,0.5)",
                }}
              >
                {tab === "freelancer" ? "👨‍💻 Freelancer View" : "🏢 Client View"}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Mock UI */}
        <div
          className="glass-card"
          style={{
            padding: "0",
            overflow: "hidden",
            border: "1px solid rgba(108,99,255,0.15)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {/* Top Bar */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444", opacity: 0.7 }} />
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f59e0b", opacity: 0.7 }} />
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", opacity: 0.7 }} />
              </div>
              <span style={{ fontSize: "13px", color: "rgba(226,232,240,0.3)" }}>
                freetrack.id/dashboard/{activeTab}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  background: "rgba(16,185,129,0.1)",
                  color: "#10b981",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                Live
              </div>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00d4aa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                {activeTab === "freelancer" ? "👨" : "🏢"}
              </div>
            </div>
          </div>

          {/* Dashboard Body */}
          <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}
            className="dashboard-grid"
          >
            {/* Left: Main Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Stats Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {(activeTab === "freelancer"
                  ? [
                      { icon: "💰", label: "Pendapatan Bulan Ini", value: "Rp 4.2jt", sub: "+18% dari bulan lalu", color: "#00d4aa" },
                      { icon: "📋", label: "Proyek Aktif", value: "3", sub: "2 mendekati deadline", color: "#6c63ff" },
                      { icon: "⭐", label: "Rating Rata-rata", value: "4.9", sub: "dari 47 ulasan", color: "#f59e0b" },
                    ]
                  : [
                      { icon: "🔖", label: "Proyek Diposting", value: "5", sub: "3 aktif berjalan", color: "#00d4aa" },
                      { icon: "💸", label: "Total Diinvestasikan", value: "Rp 18jt", sub: "Rp 12jt sudah dibayar", color: "#6c63ff" },
                      { icon: "✅", label: "Proyek Selesai", value: "12", sub: "Tingkat sukses 100%", color: "#10b981" },
                    ]
                ).map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: `rgba(${item.color === "#00d4aa" ? "0,212,170" : item.color === "#6c63ff" ? "108,99,255" : item.color === "#f59e0b" ? "245,158,11" : "16,185,129"}, 0.08)`,
                      border: `1px solid rgba(${item.color === "#00d4aa" ? "0,212,170" : item.color === "#6c63ff" ? "108,99,255" : item.color === "#f59e0b" ? "245,158,11" : "16,185,129"}, 0.2)`,
                      borderRadius: "10px",
                      padding: "16px",
                    }}
                  >
                    <div style={{ fontSize: "20px", marginBottom: "6px" }}>{item.icon}</div>
                    <div style={{ fontSize: "clamp(18px, 2vw, 24px)", fontWeight: "700", color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.5)", marginTop: "2px" }}>{item.label}</div>
                    <div style={{ fontSize: "10px", color: "rgba(226,232,240,0.35)", marginTop: "1px" }}>{item.sub}</div>
                  </div>
                ))}
              </div>

              {/* Milestone Table */}
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    🎯 Milestone — Website E-commerce
                  </span>
                  <span style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>
                    Progress: 65%
                  </span>
                </div>
                {milestones.map((ms, i) => {
                  const sc = statusColors[ms.status];
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "14px 20px",
                        borderBottom: i < milestones.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div style={{ flex: "1 1 200px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                          {ms.name}
                        </div>
                        <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                          <div
                            style={{
                              width: `${ms.progress}%`,
                              height: "100%",
                              background: ms.status === "done"
                                ? "#10b981"
                                : ms.status === "active"
                                ? "linear-gradient(90deg, #6c63ff, #00d4aa)"
                                : "rgba(255,255,255,0.1)",
                              borderRadius: "3px",
                              transition: "width 1s ease",
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                        <span
                          style={{
                            background: sc.bg,
                            color: sc.text,
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "3px 10px",
                            borderRadius: "20px",
                          }}
                        >
                          {sc.label}
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "rgba(226,232,240,0.7)" }}>
                          {ms.payout}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Evidence Submission Preview */}
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>
                  📎 Evidence Submission — Milestone 3
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {["frontend_v1.zip", "screenshot_home.png", "demo_video.mp4", "api_docs.pdf"].map((file) => (
                    <div
                      key={file}
                      style={{
                        background: "rgba(108,99,255,0.08)",
                        border: "1px solid rgba(108,99,255,0.2)",
                        borderRadius: "8px",
                        padding: "8px 14px",
                        fontSize: "12px",
                        color: "#8b85ff",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      📄 {file}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                  <button
                    style={{
                      background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    🔄 Change Request
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Activity Feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Rating Preview */}
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "12px" }}>
                  ⭐ Rating & Review Terakhir
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f59e0b, #ec4899)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700" }}>PT Maju Jaya Digital</div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} style={{ color: "#f59e0b", fontSize: "13px" }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)", fontStyle: "italic", lineHeight: "1.6" }}>
                  &ldquo;Freelancer sangat profesional dan komunikatif. Hasil kerja melebihi ekspektasi kami!&rdquo;
                </p>
              </div>

              {/* Activity Feed */}
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  padding: "16px",
                  flex: 1,
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "12px" }}>
                  🔔 Aktivitas Terbaru
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {activities.map((act, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          flexShrink: 0,
                        }}
                      >
                        {act.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.75)", lineHeight: "1.5" }}>
                          {act.text}
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)", marginTop: "2px" }}>
                          {act.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .dashboard-grid > div:first-child > div:first-child {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 600px) {
          .dashboard-grid > div:first-child > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
