"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  LogIn, 
  UserPlus 
} from "lucide-react";
import Link from "next/link";

interface ClientStep3Props {
  data: any;
}

export default function ClientStep3AuthGate({ data }: ClientStep3Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", alignItems: "center", padding: "20px 0" }}>
      <div style={{ textAlign: "center" }}>
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={iconContainer}
        >
          <Rocket size={32} color="#4D63FF" />
        </motion.div>
        <h3 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", marginBottom: "12px", letterSpacing: "-0.5px" }}>
          Siap Bertemu Freelancer!
        </h3>
        <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "16px", maxWidth: "450px", lineHeight: "1.6" }}>
          Kami telah menyesuaikan marketplace berdasarkan kriteria Anda. Masuk atau daftar sekarang untuk mulai mencari freelancer terbaik.
        </p>
      </div>

      {/* Feature Highlights instead of summary */}
      <div style={featureGrid}>
        <FeatureItem 
          icon={<CheckCircle2 size={18} color="#10B981" />} 
          text="Akses ke 1000+ Freelancer Terverifikasi" 
        />
        <FeatureItem 
          icon={<CheckCircle2 size={18} color="#10B981" />} 
          text="Dashboard yang dipersonalisasi" 
        />
        <FeatureItem 
          icon={<CheckCircle2 size={18} color="#10B981" />} 
          text="Posting project tanpa biaya admin" 
        />
      </div>

      {/* Auth Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "360px", marginTop: "12px" }}>
        <Link 
          href="/register?role=client&from=onboarding"
          style={primaryBtn}
        >
          <UserPlus size={18} />
          Mulai Sekarang (Gratis)
          <ArrowRight size={18} style={{ marginLeft: "auto" }} />
        </Link>
        
        <Link 
          href="/login?role=client&from=onboarding"
          style={secondaryBtn}
        >
          <LogIn size={18} />
          Sudah punya akun? Masuk
        </Link>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
      {icon}
      <span style={{ fontSize: "14px", fontWeight: "600", color: "rgba(226,232,240,0.8)" }}>{text}</span>
    </div>
  );
}

const featureGrid: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "100%",
  maxWidth: "400px",
};

const iconContainer: React.CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "20px",
  background: "rgba(77, 99, 255, 0.1)",
  border: "1px solid rgba(77, 99, 255, 0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
};

const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 24px",
  background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
  color: "#fff",
  borderRadius: "14px",
  fontSize: "15px",
  fontWeight: "700",
  textDecoration: "none",
  boxShadow: "0 10px 25px rgba(77, 99, 255, 0.3)",
  transition: "all 0.3s ease",
};

const secondaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  padding: "14px 24px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "rgba(226, 232, 240, 0.8)",
  borderRadius: "14px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  transition: "all 0.3s ease",
};
