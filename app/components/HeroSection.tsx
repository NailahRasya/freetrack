"use client";
import { useState, useEffect } from "react";
import {
  ArrowRight, Shield, CheckCircle2, Laptop, Coffee,
  ListChecks, BarChart3, Users, Target, Wallet
} from "lucide-react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [step, setStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 3);
    }, 3500);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, []);

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

          {/* Right: Interactive Dynamic UI */}
          <div style={{ position: "relative", height: "560px", perspective: "1000px" }} className="hero-visual">
            
            {/* Main Escrow Card */}
            <div
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: "100%", maxWidth: "340px",
                background: "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(9,9,11,0.95))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: "24px",
                boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
                transform: `translate(calc(-50% + ${mousePos.x * 1.5}px), calc(-50% + ${mousePos.y * 1.5}px)) rotateX(${mousePos.y * -0.5}deg) rotateY(${mousePos.x * 0.5}deg)`,
                transition: "transform 0.1s ease-out",
                zIndex: 2,
              }}
            >
               {/* Card Header */}
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                   <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(77,99,255,0.3)" }}>
                     <Shield size={22} color="white" />
                   </div>
                   <div>
                     <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.5)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>Smart Contract</div>
                     <div style={{ fontSize: "17px", fontWeight: "800", color: "white", letterSpacing: "-0.5px" }}>Freetrack Escrow</div>
                   </div>
                 </div>
               </div>

               {/* Parties */}
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "16px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
                 <div style={{ textAlign: "center" }}>
                   <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(77,99,255,0.15)", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#4D63FF" }}><Users size={18} /></div>
                   <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.6)", fontWeight: "500" }}>Klien</div>
                 </div>
                 
                 <div style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                   <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.1)", position: "relative", borderRadius: "2px", overflow: "hidden" }}>
                     <div style={{ 
                        position: "absolute", top: 0, left: 0, height: "100%", background: "linear-gradient(90deg, #4D63FF, #10B981)", 
                        width: step >= 1 ? "100%" : "0%", transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" 
                     }} />
                   </div>
                   <div style={{ fontSize: "10px", color: step >= 1 ? "#10B981" : "rgba(226,232,240,0.4)", marginTop: "10px", fontWeight: "700", transition: "color 0.3s", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                     {step === 0 ? "Menunggu Dana" : "Dana Terkunci"}
                   </div>
                 </div>

                 <div style={{ textAlign: "center" }}>
                   <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}><Laptop size={18} /></div>
                   <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.6)", fontWeight: "500" }}>Freelancer</div>
                 </div>
               </div>

               {/* Amount */}
               <div style={{ textAlign: "center", marginBottom: "28px", background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px" }}>
                 <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)", marginBottom: "6px", fontWeight: "500" }}>Total Nilai Proyek</div>
                 <div style={{ fontSize: "32px", fontWeight: "900", color: "#10B981", letterSpacing: "-1px" }}>Rp 12.500.000</div>
               </div>

               {/* Button */}
               <button style={{
                 width: "100%", padding: "16px", borderRadius: "14px", border: "none",
                 background: step === 0 ? "rgba(255,255,255,0.05)" : step === 1 ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #4D63FF, #2563EB)",
                 color: step === 0 ? "rgba(255,255,255,0.4)" : "white",
                 fontWeight: "800", fontSize: "15px", cursor: "pointer",
                 transition: "all 0.4s ease",
                 display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                 boxShadow: step >= 1 ? `0 10px 25px ${step === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(77,99,255,0.3)'}` : "none",
               }}>
                 {step === 0 ? <><Wallet size={18} /> Deposit Dana</> : step === 1 ? <><Shield size={18} /> Escrow Aktif</> : <><CheckCircle2 size={18} /> Proyek Selesai</>}
               </button>
            </div>

            {/* Floating Notification 1 (Top Right) */}
            <div style={{
              position: "absolute", top: "10%", right: "-5%",
              background: "rgba(16,185,129,0.15)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(16,185,129,0.3)",
              padding: "14px 18px", borderRadius: "16px",
              display: "flex", alignItems: "center", gap: "14px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              transform: `translate(${mousePos.x * 2.5}px, ${mousePos.y * 2.5}px) scale(${step >= 1 ? 1 : 0.9})`,
              transition: "transform 0.1s ease-out, opacity 0.5s ease",
              opacity: step >= 1 ? 1 : 0,
              zIndex: 3,
            }}>
              <div style={{ background: "#10B981", borderRadius: "50%", padding: "8px", boxShadow: "0 0 15px rgba(16,185,129,0.5)" }}><CheckCircle2 size={18} color="white" /></div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#34D399", marginBottom: "2px" }}>Milestone Disetujui</div>
                <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.7)" }}>Dana dicairkan dengan aman</div>
              </div>
            </div>

            {/* Floating Notification 2 (Bottom Left) */}
            <div style={{
              position: "absolute", bottom: "15%", left: "-5%",
              background: "rgba(77,99,255,0.15)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(77,99,255,0.3)",
              padding: "14px 18px", borderRadius: "16px",
              display: "flex", alignItems: "center", gap: "14px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px) scale(${step === 2 ? 1 : 0.9})`,
              transition: "transform 0.1s ease-out, opacity 0.5s ease",
              opacity: step === 2 ? 1 : 0,
              zIndex: 3,
            }}>
              <div style={{ background: "#4D63FF", borderRadius: "50%", padding: "8px", boxShadow: "0 0 15px rgba(77,99,255,0.5)" }}><ListChecks size={18} color="white" /></div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#A5B4FC", marginBottom: "2px" }}>Revisi Selesai</div>
                <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.7)" }}>Klien menyetujui hasil akhir</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-badge {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-visual { height: auto !important; margin-top: 20px; display: flex; justify-content: center; }
          .hero-visual > div { position: relative !important; transform: none !important; top: 0 !important; left: 0 !important; margin: 0 auto; width: 100% !important; max-width: 400px !important; }
        }
      `}</style>
    </section>
  );
}
