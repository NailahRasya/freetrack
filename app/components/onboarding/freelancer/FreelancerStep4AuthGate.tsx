"use client";

import React from "react";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  LogIn, 
  UserPlus 
} from "lucide-react";
import Link from "next/link";

interface FreelancerStep4Props {
  data: any;
}

export default function FreelancerStep4AuthGate({ data }: FreelancerStep4Props) {
  const levelLabels: Record<string, string> = {
    junior: "Junior",
    mid: "Intermediate",
    senior: "Senior"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={iconContainer}>
          <Sparkles size={32} color="#10B981" />
        </div>
        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
          Siap Mencari Cuan?
        </h3>
        <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "14px", maxWidth: "400px" }}>
          Profil Anda sudah optimal. Daftar sekarang untuk mulai mendapatkan rekomendasi project yang sesuai dengan skill Anda.
        </p>
      </div>

      {/* Summary Card */}
      <div style={summaryCard}>
        <h4 style={summaryTitle}>Ringkasan Profil</h4>
        <div style={summaryGrid}>
          <SummaryItem label="Level" value={levelLabels[data.experienceLevel] || data.experienceLevel || "Belum diisi"} />
          <SummaryItem label="Skills" value={data.skillCategories.length + " dipilih"} />
          <SummaryItem label="Tools" value={data.tools.length + " dipilih"} />
          <SummaryItem label="Exp" value={`${data.yearsOfExperience} Tahun`} />
        </div>
        <div style={statusBadge}>
          <CheckCircle2 size={14} /> Profil Siap Dipublikasikan
        </div>
      </div>

      {/* Auth Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "340px" }}>
        <Link 
          href="/register?role=freelancer&from=onboarding"
          style={primaryBtn}
        >
          <UserPlus size={18} />
          Daftar Sebagai Freelancer
          <ArrowRight size={18} style={{ marginLeft: "auto" }} />
        </Link>
        
        <Link 
          href="/login?role=freelancer&from=onboarding"
          style={secondaryBtn}
        >
          <LogIn size={18} />
          Sudah punya akun? Masuk
        </Link>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{value}</div>
    </div>
  );
}

const iconContainer: React.CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "20px",
  background: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
};

const summaryCard: React.CSSProperties = {
  width: "100%",
  padding: "24px",
  background: "rgba(255, 255, 255, 0.02)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "20px",
  position: "relative",
};

const summaryTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "700",
  color: "rgba(226, 232, 240, 0.4)",
  marginBottom: "16px",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const summaryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "20px",
};

const statusBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 12px",
  background: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "50px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#10B981",
};

const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 24px",
  background: "linear-gradient(135deg, #10B981, #06B6D4)",
  color: "#fff",
  borderRadius: "14px",
  fontSize: "15px",
  fontWeight: "700",
  textDecoration: "none",
  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
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
