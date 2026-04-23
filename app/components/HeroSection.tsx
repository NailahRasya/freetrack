"use client";
import { useState, useEffect } from "react";
import {
  ArrowRight, Shield, CheckCircle2, Laptop, Coffee,
  ListChecks, BarChart3, Users, Target, Wallet
} from "lucide-react";
import "./HeroSection.css";

const TRUST_INDICATORS = [
  { icon: <Shield size={15} />, text: "Escrow Terjamin" },
  { icon: <CheckCircle2 size={15} />, text: "Kontrak Digital" },
  { icon: <Users size={15} />, text: "5.000+ Freelancer" },
];

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
    <section className="hero-section">
      {/* Background layers */}
      <div className="hero-bg-gradient" />
      <div className="hero-grid-bg grid-bg" />

      {/* Orbs */}
      <div className="hero-orb-1 orb" />
      <div className="hero-orb-2 orb" />

      <div className="hero-container">
        <div className="hero-grid">

          {/* Left: Copy */}
          <div className="hero-copy">
            {/* Badge */}
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span className="hero-badge-text">
                Project Governance Platform
              </span>
            </div>

            <h1 className="hero-title">
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

            <p className="hero-description">
              FreeTrack adalah platform <em>project governance</em> untuk freelancer mahasiswa & profesional muda Indonesia. Akhiri scope creep, amankan pembayaranmu.
            </p>

            <div className="hero-actions">
              <a href="#" id="hero-cta-main" className="btn-emerald">
                <Target size={18} />
                Mulai Kelola Proyek Anda
              </a>
              <a href="#workflow" id="hero-cta-learn" className="btn-secondary">
                Lihat Cara Kerja
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="hero-trust">
              {TRUST_INDICATORS.map((item) => (
                <div key={item.text} className="hero-trust-item">
                  <span className="hero-trust-icon">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Dynamic UI */}
          <div className="hero-visual">
            
            {/* Main Escrow Card */}
            <div
              className="escrow-card"
              style={{
                transform: `translate(calc(-50% + ${mousePos.x * 1.5}px), calc(-50% + ${mousePos.y * 1.5}px)) rotateX(${mousePos.y * -0.5}deg) rotateY(${mousePos.x * 0.5}deg)`,
              }}
            >
               {/* Card Header */}
               <div className="escrow-header">
                 <div className="escrow-header-left">
                   <div className="escrow-icon-container">
                     <Shield size={22} color="white" />
                   </div>
                   <div>
                     <div className="escrow-label">Smart Contract</div>
                     <div className="escrow-title">Freetrack Escrow</div>
                   </div>
                 </div>
               </div>

               {/* Parties */}
               <div className="escrow-parties">
                 <div className="party-item">
                   <div className="party-icon-client"><Users size={18} /></div>
                   <div className="party-label">Klien</div>
                 </div>
                 
                 <div className="progress-container">
                   <div className="progress-bar-bg">
                     <div className="progress-bar-fill" style={{ width: step >= 1 ? "100%" : "0%" }} />
                   </div>
                   <div className="progress-status" style={{ color: step >= 1 ? "#10B981" : "rgba(226,232,240,0.4)" }}>
                     {step === 0 ? "Menunggu Dana" : "Dana Terkunci"}
                   </div>
                 </div>

                 <div className="party-item">
                   <div className="party-icon-freelancer"><Laptop size={18} /></div>
                   <div className="party-label">Freelancer</div>
                 </div>
               </div>

               {/* Amount */}
               <div className="escrow-amount">
                 <div className="amount-label">Total Nilai Proyek</div>
                 <div className="amount-value">Rp 12.500.000</div>
               </div>

               {/* Button */}
               <button 
                 className="escrow-btn"
                 style={{
                   background: step === 0 ? "rgba(255,255,255,0.05)" : step === 1 ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #4D63FF, #2563EB)",
                   color: step === 0 ? "rgba(255,255,255,0.4)" : "white",
                   boxShadow: step >= 1 ? `0 10px 25px ${step === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(77,99,255,0.3)'}` : "none",
                 }}
               >
                 {step === 0 ? <><Wallet size={18} /> Deposit Dana</> : step === 1 ? <><Shield size={18} /> Escrow Aktif</> : <><CheckCircle2 size={18} /> Proyek Selesai</>}
               </button>
            </div>

            {/* Floating Notification 1 (Top Right) */}
            <div 
              className="floating-notification notification-top-right"
              style={{
                transform: `translate(${mousePos.x * 2.5}px, ${mousePos.y * 2.5}px) scale(${step >= 1 ? 1 : 0.9})`,
                opacity: step >= 1 ? 1 : 0,
              }}
            >
              <div className="notification-icon-emerald"><CheckCircle2 size={18} color="white" /></div>
              <div>
                <div className="notification-title emerald">Milestone Disetujui</div>
                <div className="notification-desc">Dana dicairkan dengan aman</div>
              </div>
            </div>

            {/* Floating Notification 2 (Bottom Left) */}
            <div 
              className="floating-notification notification-bottom-left"
              style={{
                transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px) scale(${step === 2 ? 1 : 0.9})`,
                opacity: step === 2 ? 1 : 0,
              }}
            >
              <div className="notification-icon-blue"><ListChecks size={18} color="white" /></div>
              <div>
                <div className="notification-title blue">Revisi Selesai</div>
                <div className="notification-desc">Klien menyetujui hasil akhir</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
