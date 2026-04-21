"use client"; // Menandakan komponen berjalan di sisi klien
import { useState } from "react";
import {
  BarChart3, Wallet, Clock, Star, TrendingUp,
  CheckCircle2, UploadCloud, Shield
} from "lucide-react"; // Mengimpor ikon-ikon untuk elemen dashboard

export default function DashboardSection() {
  // State untuk melacak tab aktif antara tampilan 'freelancer' atau 'client'
  const [activeTab, setActiveTab] = useState<"freelancer" | "client">("freelancer");

  return (
    <section id="dashboard" style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      {/* Ornamen latar belakang (orb cahaya biru) */}
      <div className="orb" style={{ width: "500px", height: "500px", background: "#1A36F0", bottom: "-100px", left: "-150px", opacity: 0.06 }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
        {/* Header Section Preview Dashboard */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="section-badge">✦ Dashboard Preview</span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "900", letterSpacing: "-1px", lineHeight: "1.15", marginBottom: "16px" }}>
            Satu Layar,{" "}
            <span className="gradient-text">Semua Kontrol</span>
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(226,232,240,0.5)", maxWidth: "480px", margin: "0 auto" }}>
            Pantau proyek, earnings, dan reputasimu dari satu tempat.
          </p>
        </div>

        {/* Toggle Tab untuk memilih peran (Freelancer/Client) */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "5px", display: "flex", gap: "4px" }}>
            {(["freelancer", "client"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "9px 24px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: "600", transition: "all 0.3s ease",
                  background: activeTab === tab ? "var(--gradient-emerald)" : "transparent",
                  color: activeTab === tab ? "white" : "rgba(226,232,240,0.4)",
                }}
              >
                {tab === "freelancer" ? "Freelancer" : "Client"}
              </button>
            ))}
          </div>
        </div>

        {/* Kartu Visualisasi Dashboard (Mockup Aplikasi) */}
        <div className="feature-visual" style={{ padding: "0", overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}>
          {/* Bar atas jendela browser mockup */}
          <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981" }} />
            </div>
            <span style={{ fontSize: "11px", color: "rgba(226,232,240,0.25)" }}>freetrack.id/dashboard</span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#10B981" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10B981", animation: "pulse-dot 2s infinite" }} /> Live
            </div>
          </div>

          <div style={{ padding: "28px" }}>
            {/* Baris Statistik (Stats Row) - Berubah sesuai tab aktif */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "28px" }}>
              {(activeTab === "freelancer"
                ? [
                    { icon: <Wallet size={18} />, label: "Pendapatan", value: "Rp 8.4jt", sub: "+24% bulan ini", color: "#10B981" },
                    { icon: <BarChart3 size={18} />, label: "Proyek Aktif", value: "4", sub: "2 mendekati deadline", color: "#06B6D4" },
                    { icon: <Star size={18} />, label: "Rating", value: "4.9", sub: "dari 32 review", color: "#F59E0B" },
                  ]
                : [
                    { icon: <Shield size={18} />, label: "Dana Escrow", value: "Rp 12jt", sub: "3 proyek aktif", color: "#10B981" },
                    { icon: <CheckCircle2 size={18} />, label: "Milestone Done", value: "18", sub: "dari 24 total", color: "#06B6D4" },
                    { icon: <TrendingUp size={18} />, label: "Success Rate", value: "100%", sub: "12 proyek selesai", color: "#10B981" },
                  ]
              ).map((item) => (
                <div
                  key={item.label}
                  className="glass-card"
                  style={{
                    background: `${item.color}08`,
                    border: `1px solid ${item.color}15`,
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
                >
                  <div style={{ color: item.color, marginBottom: "10px" }}>{item.icon}</div>
                  <div style={{ fontSize: "24px", fontWeight: "900", color: "#E2E8F0" }}>{item.value}</div>
                  <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                  <div style={{ fontSize: "11px", color: item.color, fontWeight: "700", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <TrendingUp size={10} /> {item.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* List Milestone/Proyek yang sedang berjalan */}
            <div style={{ fontSize: "13px", fontWeight: "700", color: "rgba(226,232,240,0.5)", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {activeTab === "freelancer" ? "Milestone Aktif" : "Proyek Berjalan"}
            </div>
            {[
              { name: "Redesign E-Commerce App", milestone: "UI Design Hi-Fi", pct: 65, deadline: "14 Jan" },
              { name: "Landing Page Startup", milestone: "Frontend Dev", pct: 40, deadline: "20 Jan" },
            ].map((project) => (
              <div key={project.name} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "10px", padding: "16px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#E2E8F0" }}>{project.name}</div>
                    <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>{project.milestone}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>
                    <Clock size={11} /> {project.deadline}
                  </div>
                </div>
                {/* Bar progres milestone aktif */}
                <div style={{ height: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "2px" }}>
                  <div style={{ width: `${project.pct}%`, height: "100%", borderRadius: "2px", background: "linear-gradient(90deg, #1A36F0, #06B6D4)", transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
