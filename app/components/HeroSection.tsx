"use client";
import { useEffect, useRef } from "react";

const stats = [
  { value: "12K+", label: "Freelancer Aktif" },
  { value: "8K+", label: "Client Terpercaya" },
  { value: "98%", label: "Tingkat Kepuasan" },
  { value: "Rp 4.2M", label: "Total Payout" },
];

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-up");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll(".animate-on-enter");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="grid-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "72px",
      }}
    >
      {/* Background Orbs */}
      <div
        className="orb animate-blob"
        style={{
          width: "600px",
          height: "600px",
          background: "#6c63ff",
          top: "-200px",
          left: "-200px",
          opacity: 0.12,
        }}
      />
      <div
        className="orb animate-blob"
        style={{
          width: "400px",
          height: "400px",
          background: "#00d4aa",
          bottom: "-100px",
          right: "-100px",
          opacity: 0.1,
          animationDelay: "3s",
        }}
      />
      <div
        className="orb"
        style={{
          width: "300px",
          height: "300px",
          background: "#f59e0b",
          top: "50%",
          left: "70%",
          opacity: 0.06,
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "80px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div
          className="animate-on-enter"
          style={{ opacity: 0, animationDelay: "0.1s" }}
        >
          <span className="section-badge">
            <span>✦</span> Platform Freelance #1 Indonesia
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-on-enter"
          style={{
            fontSize: "clamp(42px, 6vw, 80px)",
            fontWeight: "900",
            lineHeight: "1.1",
            letterSpacing: "-2px",
            maxWidth: "900px",
            opacity: 0,
            animationDelay: "0.2s",
          }}
        >
          Kolaborasi Freelance{" "}
          <span className="gradient-text">Lebih Aman</span>
          <br />& Lebih Transparan
        </h1>

        {/* Subheading */}
        <p
          className="animate-on-enter"
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "rgba(226,232,240,0.65)",
            maxWidth: "620px",
            lineHeight: "1.8",
            opacity: 0,
            animationDelay: "0.35s",
          }}
        >
          Freetrack menghubungkan <strong style={{ color: "#8b85ff" }}>freelancer</strong> dan{" "}
          <strong style={{ color: "#34e4c0" }}>client</strong> dengan sistem manajemen proyek
          transparan — dari commitment fee hingga milestone, semua terpantau real-time.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-on-enter"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
            opacity: 0,
            animationDelay: "0.5s",
          }}
        >
          <a href="#" id="hero-freelancer-cta" className="btn-primary" style={{ fontSize: "16px", padding: "16px 36px" }}>
            🚀 Mulai Sebagai Freelancer
          </a>
          <a href="#" id="hero-client-cta" className="btn-secondary" style={{ fontSize: "16px", padding: "16px 36px" }}>
            💼 Cari Freelancer
          </a>
        </div>

        {/* Trust Badge */}
        <div
          className="animate-on-enter"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "rgba(226,232,240,0.45)",
            fontSize: "13px",
            opacity: 0,
            animationDelay: "0.65s",
          }}
        >
          <span>🔒</span>
          <span>Pembayaran dijamin aman · Dana escrow terlindungi · 0% biaya di awal</span>
        </div>

        {/* Stats */}
        <div
          className="animate-on-enter"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "700px",
            marginTop: "24px",
            opacity: 0,
            animationDelay: "0.8s",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card"
              style={{
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(24px, 3vw, 32px)",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: "1.2",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.55)", marginTop: "4px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Cards */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "900px",
            marginTop: "40px",
          }}
        >
          <div
            className="glass-card animate-float"
            style={{
              padding: "16px 20px",
              position: "absolute",
              top: "-60px",
              left: "5%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: "220px",
              animationDuration: "4s",
            }}
          >
            <div style={{ fontSize: "28px" }}>✅</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#10b981" }}>Milestone Disetujui</div>
              <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)" }}>Desain UI — Fase 2</div>
            </div>
          </div>

          <div
            className="glass-card animate-float"
            style={{
              padding: "16px 20px",
              position: "absolute",
              top: "-30px",
              right: "5%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: "220px",
              animationDelay: "2s",
              animationDuration: "5s",
            }}
          >
            <div style={{ fontSize: "28px" }}>💳</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#f59e0b" }}>Commitment Fee Diterima</div>
              <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)" }}>Rp 500.000 · Aman di Escrow</div>
            </div>
          </div>

          <div
            className="glass-card animate-float"
            style={{
              padding: "16px 20px",
              position: "absolute",
              bottom: "-40px",
              left: "30%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: "220px",
              animationDelay: "1s",
              animationDuration: "4.5s",
            }}
          >
            <div style={{ fontSize: "28px" }}>⭐</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#8b85ff" }}>Rating Baru: 5.0</div>
              <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)" }}>Ahmad R. → Client Puas</div>
            </div>
          </div>

          {/* Mock Dashboard Preview */}
          <div
            className="glass-card"
            style={{
              padding: "0",
              overflow: "hidden",
              marginTop: "80px",
              border: "1px solid rgba(108,99,255,0.2)",
              boxShadow: "0 40px 120px rgba(108,99,255,0.2), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Browser bar mockup */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444", opacity: 0.7 }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f59e0b", opacity: 0.7 }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", opacity: 0.7 }} />
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  color: "rgba(226,232,240,0.3)",
                  marginLeft: "8px",
                }}
              >
                freetrack.id/dashboard
              </div>
            </div>
            {/* Dashboard content */}
            <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {[
                { icon: "📋", label: "Proyek Aktif", value: "3", color: "#6c63ff" },
                { icon: "💰", label: "Pendapatan Bulan Ini", value: "Rp 4.2jt", color: "#00d4aa" },
                { icon: "⏳", label: "Menunggu Review", value: "2", color: "#f59e0b" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: `rgba(${item.color === "#6c63ff" ? "108,99,255" : item.color === "#00d4aa" ? "0,212,170" : "245,158,11"},0.08)`,
                    border: `1px solid rgba(${item.color === "#6c63ff" ? "108,99,255" : item.color === "#00d4aa" ? "0,212,170" : "245,158,11"},0.2)`,
                    borderRadius: "10px",
                    padding: "16px",
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>{item.icon}</div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.5)", marginTop: "2px" }}>{item.label}</div>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div style={{ padding: "0 24px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)" }}>Progress Proyek: Website E-commerce</span>
                <span style={{ fontSize: "12px", color: "#6c63ff", fontWeight: "600" }}>65%</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                <div
                  style={{
                    width: "65%",
                    height: "100%",
                    background: "linear-gradient(90deg, #6c63ff, #00d4aa)",
                    borderRadius: "3px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
