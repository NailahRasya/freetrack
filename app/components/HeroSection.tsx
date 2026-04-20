"use client";
import {
  ArrowRight, Shield, CheckCircle2, Laptop, Coffee,
  ListChecks, BarChart3, Users, Target, Wallet
} from "lucide-react";

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: "120px 24px 80px",
      }}
    >
      {/* Background layers */}
      <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
      <div style={{ position: "absolute", inset: 0, background: "var(--gradient-hero)" }} />

      {/* Orbs */}
      <div className="orb" style={{ width: "700px", height: "700px", background: "#1A36F0", top: "-200px", left: "-200px", opacity: 0.1 }} />
      <div className="orb" style={{ width: "500px", height: "500px", background: "#10B981", bottom: "-100px", right: "-100px", opacity: 0.08 }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="hero-grid">

          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              padding: "7px 18px", borderRadius: "50px", marginBottom: "32px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#34D399", letterSpacing: "0.3px" }}>
                Project Governance Platform
              </span>
            </div>

            <h1 style={{
              fontSize: "clamp(36px, 5vw, 58px)", fontWeight: "900",
              lineHeight: "1.08", letterSpacing: "-2px", marginBottom: "24px",
            }}>
              Bekerja dengan{" "}
              <span className="gradient-text-emerald" style={{ display: "inline-block" }}>
                Kepastian,
              </span>
              <br />
              Dibayar dengan{" "}
              <span className="gradient-text" style={{ display: "inline-block" }}>
                Transparansi.
              </span>
            </h1>

            <p style={{
              fontSize: "17px", color: "rgba(226,232,240,0.55)", lineHeight: "1.8",
              marginBottom: "40px", maxWidth: "460px",
            }}>
              FreeTrack adalah platform <em style={{ color: "rgba(226,232,240,0.8)", fontStyle: "normal", fontWeight: "600" }}>project governance</em> untuk freelancer mahasiswa & profesional muda Indonesia. Akhiri scope creep, amankan pembayaranmu.
            </p>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center", marginBottom: "56px" }}>
              <a href="#" id="hero-cta-main" className="btn-emerald" style={{ fontSize: "16px", padding: "18px 42px" }}>
                <Target size={18} />
                Mulai Kelola Proyek Anda
              </a>
              <a href="#workflow" id="hero-cta-learn" className="btn-secondary" style={{ fontSize: "16px", padding: "18px 42px" }}>
                Lihat Cara Kerja
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Trust indicators */}
            <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
              {[
                { icon: <Shield size={15} />, text: "Escrow Terjamin" },
                { icon: <CheckCircle2 size={15} />, text: "Kontrak Digital" },
                { icon: <Users size={15} />, text: "5.000+ Freelancer" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "rgba(226,232,240,0.4)" }}>
                  <span style={{ color: "#10B981" }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Freelancer Workspace Illustration */}
          <div style={{ position: "relative", height: "520px" }} className="hero-visual">

            {/* Main: Laptop workspace card */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "360px",
              background: "rgba(13,27,62,0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px", padding: "0", overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
              zIndex: 2,
            }}>
              {/* Toolbar */}
              <div style={{
                padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444" }} />
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B" }} />
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981" }} />
                </div>
                <span style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)", fontWeight: "500" }}>freetrack.id/proyek/web-app-021</span>
              </div>

              {/* Content */}
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "rgba(226,232,240,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Proyek Aktif</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#E2E8F0" }}>Mobile App Development</div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: "6px" }}>
                    On Track
                  </span>
                </div>

                {/* Milestones mini */}
                {[
                  { name: "Wireframe & Flow", pct: 100, status: "done", price: "Rp 800k" },
                  { name: "UI Design (Hi-Fi)", pct: 65, status: "active", price: "Rp 1.5jt" },
                  { name: "Frontend Dev", pct: 0, status: "pending", price: "Rp 2jt" },
                ].map((ms) => (
                  <div key={ms.name} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                      <span style={{ color: ms.status === "pending" ? "rgba(226,232,240,0.3)" : "rgba(226,232,240,0.7)", fontWeight: "600" }}>
                        {ms.status === "done" && <span style={{ color: "#10B981", marginRight: "4px" }}>✓</span>}
                        {ms.name}
                      </span>
                      <span style={{ color: ms.status === "done" ? "#10B981" : ms.status === "active" ? "#06B6D4" : "rgba(226,232,240,0.25)", fontWeight: "700" }}>
                        {ms.price}
                      </span>
                    </div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "2px" }}>
                      <div style={{
                        width: `${ms.pct}%`, height: "100%", borderRadius: "2px",
                        background: ms.status === "done" ? "#10B981" : ms.status === "active" ? "linear-gradient(90deg, #1A36F0, #06B6D4)" : "transparent",
                        transition: "width 1.5s ease",
                      }} />
                    </div>
                  </div>
                ))}

                {/* Escrow info */}
                <div style={{
                  marginTop: "16px", background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.15)", borderRadius: "10px",
                  padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.5)" }}>
                    <Shield size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                    Dana Escrow
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#34D399" }}>Rp 4.3jt</div>
                </div>
              </div>
            </div>

            {/* Floating cards removed as requested */}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
        }
      `}</style>
    </section>
  );
}
