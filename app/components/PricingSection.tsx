"use client";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Starter",
    emoji: "🆓",
    price: { freelancer: "Gratis", client: "Gratis" },
    period: "Selamanya",
    description: "Cocok untuk memulai karier freelance atau uji coba platform.",
    features: [
      { text: "Hingga 3 proyek aktif", included: true },
      { text: "Dashboard dasar", included: true },
      { text: "Milestone planning", included: true },
      { text: "Evidence submission", included: true },
      { text: "Rating & review", included: true },
      { text: "Commitment fee system", included: false },
      { text: "Priority support", included: false },
      { text: "Analytics lanjutan", included: false },
    ],
    cta: "Mulai Gratis",
    ctaStyle: "secondary",
    popular: false,
    color: "#6c63ff",
    commission: "8% per transaksi",
  },
  {
    id: "pro",
    name: "Professional",
    emoji: "🚀",
    price: { freelancer: "Rp 99k", client: "Rp 149k" },
    period: "per bulan",
    description: "Untuk freelancer serius dan client yang sering post proyek.",
    features: [
      { text: "Proyek aktif tanpa batas", included: true },
      { text: "Dashboard lengkap + analytics", included: true },
      { text: "Milestone planning lanjutan", included: true },
      { text: "Evidence submission + cloud storage", included: true },
      { text: "Rating & review terverifikasi", included: true },
      { text: "Commitment fee system", included: true },
      { text: "Change request tracking", included: true },
      { text: "Priority support 24/7", included: true },
    ],
    cta: "Mulai 14 Hari Gratis",
    ctaStyle: "primary",
    popular: true,
    color: "#00d4aa",
    commission: "4% per transaksi",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    emoji: "🏢",
    price: { freelancer: "Custom", client: "Custom" },
    period: "per bulan",
    description: "Untuk tim besar, agensi, atau perusahaan dengan kebutuhan khusus.",
    features: [
      { text: "Semua fitur Professional", included: true },
      { text: "Multi-user management", included: true },
      { text: "Custom milestone workflow", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA guarantee", included: true },
      { text: "White-label option", included: true },
      { text: "API integration", included: true },
      { text: "Custom contract templates", included: true },
    ],
    cta: "Hubungi Sales",
    ctaStyle: "secondary",
    popular: false,
    color: "#f59e0b",
    commission: "2% per transaksi",
  },
];

export default function PricingSection() {
  const [activeRole, setActiveRole] = useState<"freelancer" | "client">("freelancer");

  return (
    <section
      id="pricing"
      style={{
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, transparent, rgba(13,27,62,0.3) 50%, transparent)",
      }}
    >
      <div
        className="orb"
        style={{
          width: "450px",
          height: "450px",
          background: "#f59e0b",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.04,
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span className="section-badge">✦ Harga</span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: "800",
              lineHeight: "1.2",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Harga Transparan,{" "}
            <span className="gradient-text">Tanpa Kejutan</span>
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(226,232,240,0.55)",
              maxWidth: "480px",
              margin: "0 auto 32px",
            }}
          >
            Pilih paket yang sesuai kebutuhanmu. Upgrade atau downgrade kapan saja.
          </p>

          {/* Role Toggle */}
          <div style={{ display: "flex", justifyContent: "center" }}>
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
              {(["freelancer", "client"] as const).map((role) => (
                <button
                  key={role}
                  id={`pricing-tab-${role}`}
                  onClick={() => setActiveRole(role)}
                  style={{
                    padding: "10px 28px",
                    borderRadius: "50px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    background:
                      activeRole === role
                        ? "linear-gradient(135deg, #6c63ff, #00d4aa)"
                        : "transparent",
                    color: activeRole === role ? "white" : "rgba(226,232,240,0.5)",
                  }}
                >
                  {role === "freelancer" ? "👨‍💻 Freelancer" : "🏢 Client"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              id={`plan-${plan.id}`}
              style={{
                background: plan.popular
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.02)",
                border: plan.popular
                  ? "1px solid rgba(0,212,170,0.4)"
                  : "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "32px",
                position: "relative",
                overflow: "hidden",
                transform: plan.popular ? "scale(1.03)" : "scale(1)",
                boxShadow: plan.popular
                  ? "0 20px 60px rgba(0,212,170,0.12), 0 0 0 1px rgba(0,212,170,0.1)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  ✦ Terpopuler
                </div>
              )}

              {/* Top accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: plan.popular
                    ? "linear-gradient(90deg, #6c63ff, #00d4aa)"
                    : `linear-gradient(90deg, ${plan.color}, transparent)`,
                }}
              />

              {/* Plan Header */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{plan.emoji}</div>
                <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>{plan.name}</div>
                <p style={{ fontSize: "13px", color: "rgba(226,232,240,0.5)", lineHeight: "1.5" }}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "clamp(32px, 4vw, 42px)",
                      fontWeight: "900",
                      color: plan.popular ? "#00d4aa" : "#e2e8f0",
                    }}
                  >
                    {plan.price[activeRole]}
                  </span>
                  {plan.price[activeRole] !== "Gratis" && plan.price[activeRole] !== "Custom" && (
                    <span style={{ fontSize: "14px", color: "rgba(226,232,240,0.4)" }}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: plan.color,
                    fontWeight: "600",
                    marginTop: "4px",
                    opacity: 0.8,
                  }}
                >
                  + {plan.commission}
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="#"
                id={`cta-${plan.id}`}
                className={plan.ctaStyle === "primary" ? "btn-primary" : "btn-secondary"}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginBottom: "28px",
                  display: "flex",
                }}
              >
                {plan.cta}
              </a>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.05)",
                  marginBottom: "24px",
                }}
              />

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {plan.features.map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      opacity: feature.included ? 1 : 0.35,
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: feature.included
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(255,255,255,0.04)",
                        border: feature.included
                          ? "1px solid rgba(16,185,129,0.3)"
                          : "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        flexShrink: 0,
                      }}
                    >
                      {feature.included ? "✓" : "✕"}
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        color: feature.included
                          ? "rgba(226,232,240,0.8)"
                          : "rgba(226,232,240,0.35)",
                      }}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div
          style={{
            marginTop: "48px",
            textAlign: "center",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "32px",
          }}
        >
          {[
            { icon: "🔒", text: "Dana Escrow Terjamin" },
            { icon: "🔄", text: "Cancel Kapan Saja" },
            { icon: "💳", text: "Pembayaran Aman SSL" },
            { icon: "🛡️", text: "Garansi Uang Kembali 14 Hari" },
          ].map((g) => (
            <div
              key={g.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "rgba(226,232,240,0.45)",
              }}
            >
              <span style={{ fontSize: "18px" }}>{g.icon}</span>
              {g.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
