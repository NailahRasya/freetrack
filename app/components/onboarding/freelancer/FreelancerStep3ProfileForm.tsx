"use client";

import React from "react";
import { 
  Trophy, 
  Clock, 
  ExternalLink,
  Award
} from "lucide-react";

interface FreelancerStep3Props {
  data: {
    experienceLevel: "junior" | "mid" | "senior" | "";
    yearsOfExperience: number;
    portfolioUrl: string;
  };
  onChange: (fields: Partial<any>) => void;
}

const expLevels = [
  { id: "junior", label: "Junior", desc: "Baru memulai karir (0-2 tahun)" },
  { id: "mid", label: "Intermediate", desc: "Berpengalaman (2-5 tahun)" },
  { id: "senior", label: "Senior", desc: "Sangat mahir (5+ tahun)" },
];

export default function FreelancerStep3ProfileForm({
  data,
  onChange,
}: FreelancerStep3Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
          Lengkapi Profil Anda
        </h3>
        <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "14px" }}>
          Informasi ini membantu klien menilai kualifikasi Anda.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Experience Level */}
        <div>
          <label style={labelStyle}>Experience Level</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            {expLevels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => {
                  let defaultYears = data.yearsOfExperience;
                  // Auto-adjust years if they are outside the new level's standard range
                  if (lvl.id === "junior" && (data.yearsOfExperience < 0 || data.yearsOfExperience > 2)) defaultYears = 1;
                  if (lvl.id === "mid" && (data.yearsOfExperience < 2 || data.yearsOfExperience > 5)) defaultYears = 3;
                  if (lvl.id === "senior" && data.yearsOfExperience < 5) defaultYears = 6;
                  
                  onChange({ experienceLevel: lvl.id as any, yearsOfExperience: defaultYears });
                }}
                style={{
                  ...levelBtn,
                  background: data.experienceLevel === lvl.id ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  borderColor: data.experienceLevel === lvl.id ? "#10B981" : "rgba(255, 255, 255, 0.08)",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "700", color: data.experienceLevel === lvl.id ? "#fff" : "rgba(226, 232, 240, 0.6)" }}>
                  {lvl.label}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)", marginTop: "2px" }}>
                  {lvl.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Years of Experience */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={labelStyle}>Tahun Pengalaman</label>
            {data.experienceLevel && (
              <span style={{ fontSize: "10px", color: "#10B981", fontWeight: "700", textTransform: "uppercase" }}>
                Range: {data.experienceLevel === 'junior' ? '0-2' : data.experienceLevel === 'mid' ? '2-5' : '5+'} Tahun
              </span>
            )}
          </div>
          <div style={inputWrap}>
            <Clock size={16} style={inputIcon} />
            <input
              type="number"
              min={data.experienceLevel === 'mid' ? 2 : data.experienceLevel === 'senior' ? 5 : 0}
              max={data.experienceLevel === 'junior' ? 2 : data.experienceLevel === 'mid' ? 5 : undefined}
              placeholder="Contoh: 3"
              value={data.yearsOfExperience}
              onChange={(e) => {
                const val = Number(e.target.value);
                
                // Strict Blocking Logic
                if (data.experienceLevel === 'junior' && val > 2) return;
                if (data.experienceLevel === 'mid' && val > 5) return;
                if (data.experienceLevel === 'mid' && val < 0) return; // Prevent negative
                if (data.experienceLevel === 'senior' && val < 5 && e.target.value !== "") return; 

                onChange({ yearsOfExperience: val });
              }}
              style={inputStyle}
            />
            <span style={{ position: "absolute", right: "16px", fontSize: "13px", color: "rgba(226, 232, 240, 0.3)" }}>Tahun</span>
          </div>
        </div>

        {/* Portfolio URL */}
        <div>
          <label style={labelStyle}>Portfolio URL</label>
          <div style={inputWrap}>
            <ExternalLink size={16} style={inputIcon} />
            <input
              type="url"
              placeholder="https://behance.net/username atau https://github.com/..."
              value={data.portfolioUrl}
              onChange={(e) => onChange({ portfolioUrl: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={badgeInfo}>
          <Award size={16} />
          <span>Profil lengkap meningkatkan peluang mendapatkan project hingga 40%.</span>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "rgba(226, 232, 240, 0.45)",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const levelBtn: React.CSSProperties = {
  padding: "16px",
  border: "1px solid",
  borderRadius: "14px",
  textAlign: "left",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const inputWrap: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const inputIcon: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  color: "rgba(226, 232, 240, 0.3)",
  pointerEvents: "none",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px 12px 40px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
};

const badgeInfo: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 16px",
  background: "rgba(16, 185, 129, 0.05)",
  border: "1px solid rgba(16, 185, 129, 0.1)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#10B981",
  fontWeight: "500",
};
