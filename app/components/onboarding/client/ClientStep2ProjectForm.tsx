"use client";

import React from "react";
import {
  FileText, 
  AlignLeft, 
  Calendar, 
  Hash, 
  Globe2,
  Wifi,
  Briefcase
} from "lucide-react";

import { formatRupiah, parseRupiah } from "@/utils/format";

interface ClientStep2Props {
  data: {
    projectTitle: string;
    projectDescription: string;
    budgetMin: number;
    budgetMax: number;
    deadline: string;
    requiredSkills: string[];
    projectType: "remote" | "hybrid" | "onsite";
  };
  onChange: (fields: Partial<any>) => void;
}

export default function ClientStep2ProjectForm({
  data,
  onChange,
}: ClientStep2Props) {
  const POPULAR_SKILLS = [
    "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "PHP", "Laravel", 
    "Tailwind CSS", "Bootstrap", "Figma", "Adobe XD", "UI/UX", "Graphic Design", 
    "Video Editing", "Copywriting", "SEO", "Digital Marketing", "Flutter", "React Native",
    "Supabase", "Firebase", "MySQL", "PostgreSQL", "Docker", "AWS", "Git", "Go", "Ruby", "Rust",
    "Java", "Spring Boot", "C++", "C#", "Unity", "Unreal Engine", "Solidity", "Blockchain",
    "AWS", "Google Cloud", "Azure", "Kubernetes", "Redis", "MongoDB", "Elasticsearch",
    "Vue.js", "Angular", "Svelte", "Redux", "GraphQL", "REST API"
  ];

  const [skillInput, setSkillInput] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const handleInputChange = (val: string) => {
    setSkillInput(val);
    if (val.trim()) {
      const filtered = POPULAR_SKILLS.filter(s => 
        s.toLowerCase().includes(val.toLowerCase()) && !data.requiredSkills.includes(s)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addSkill = (skillName?: string) => {
    const finalSkill = (skillName || skillInput).trim();
    
    // Cari kecocokan di daftar popular skills (case-insensitive)
    const matchedSkill = POPULAR_SKILLS.find(s => s.toLowerCase() === finalSkill.toLowerCase());
    
    if (matchedSkill) {
      if (!data.requiredSkills.includes(matchedSkill)) {
        onChange({ requiredSkills: [...data.requiredSkills, matchedSkill] });
        setSkillInput("");
        setSuggestions([]);
      } else {
        // Sudah ada di list
        setSkillInput("");
        setSuggestions([]);
      }
    } else {
      // Jika tidak ada di daftar popular, berikan feedback atau abaikan
      // Untuk memenuhi keinginan user agar tidak bisa "ngasal", kita abaikan atau tampilkan pesan.
      // Kita hapus input saja agar user tahu itu tidak valid.
      setSkillInput("");
      setSuggestions([]);
    }
  };

  const removeSkill = (skill: string) => {
    onChange({ requiredSkills: data.requiredSkills.filter((s: string) => s !== skill) });
  };

  // Helper untuk mendapatkan nilai input tanpa "Rp"
  const getDisplayBudget = (val: number) => {
    if (!val) return "";
    return formatRupiah(val).replace("Rp", "").trim();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
          Detail Kebutuhan Project
        </h3>
        <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "14px" }}>
          Lengkapi detail project Anda untuk mendapatkan penawaran terbaik.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxHeight: "450px", overflowY: "auto", padding: "4px" }}>
        {/* Project Title */}
        <div>
          <label style={labelStyle}>Project Title</label>
          <div style={inputWrap}>
            <FileText size={16} style={inputIcon} />
            <input
              type="text"
              placeholder="Contoh: Website E-commerce Furniture"
              value={data.projectTitle}
              onChange={(e) => {
                // Hanya boleh huruf abjad dan spasi
                const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                onChange({ projectTitle: val });
              }}
              style={inputStyle}
            />
          </div>
          <p style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)", marginTop: "4px" }}>
            * Hanya boleh menggunakan huruf abjad (A-Z)
          </p>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Short Description</label>
          <div style={inputWrap}>
            <AlignLeft size={16} style={{ ...inputIcon, top: "14px" }} />
            <textarea
              placeholder="Jelaskan secara singkat tujuan project Anda..."
              value={data.projectDescription}
              onChange={(e) => onChange({ projectDescription: e.target.value })}
              style={{ 
                ...inputStyle, 
                minHeight: "120px", 
                paddingLeft: "40px", 
                paddingTop: "12px", 
                resize: "none",
                borderColor: data.projectDescription.length > 1000 ? "#ff4d4d" : "rgba(255, 255, 255, 0.08)"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <p style={{ 
              fontSize: "11px", 
              color: data.projectDescription.length > 1000 ? "#ff4d4d" : "#10B981" 
            }}>
              {data.projectDescription.length > 1000 
                ? `Melebihi batas 1000 karakter!` 
                : "Gunakan bahasa yang jelas untuk deskripsi project Anda."}
            </p>
            <p style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)" }}>
              {data.projectDescription.length} / 1000 karakter
            </p>
          </div>
        </div>

        {/* Budget & Deadline Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Estimasi Budget (Min)</label>
            <div style={inputWrap}>
              <span style={{ ...inputIcon, fontSize: "13px", fontWeight: "700", color: "rgba(226, 232, 240, 0.4)" }}>Rp</span>
              <input
                type="text"
                placeholder="500.000"
                value={getDisplayBudget(data.budgetMin)}
                onChange={(e) => {
                  const val = parseRupiah(e.target.value);
                  onChange({ budgetMin: val ? parseInt(val, 10) : 0 });
                }}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Deadline</label>
            <div style={inputWrap}>
              <Calendar size={16} style={inputIcon} />
              <input
                type="date"
                value={data.deadline}
                onChange={(e) => onChange({ deadline: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Skills/Tags */}
        <div>
          <label style={labelStyle}>Required Skills</label>
          <div style={{ ...inputWrap, marginBottom: "10px" }}>
            <Hash size={16} style={inputIcon} />
            <input
              type="text"
              placeholder="Ketik skill lalu tekan Enter (contoh: React, Figma)"
              value={skillInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              style={inputStyle}
            />
            <button 
              onClick={() => addSkill()}
              style={{ position: "absolute", right: "8px", background: "#4D63FF", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
            >
              Tambah
            </button>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#161B33",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                marginTop: "4px",
                zIndex: 10,
                overflow: "hidden",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
              }}>
                {suggestions.map(s => (
                  <div 
                    key={s} 
                    onClick={() => addSkill(s)}
                    style={{
                      padding: "10px 16px",
                      fontSize: "13px",
                      color: "#fff",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(77, 99, 255, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {data.requiredSkills.map((skill: string) => (
              <span key={skill} style={tagStyle}>
                {skill}
                <button onClick={() => removeSkill(skill)} style={removeTagBtn}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Project Type */}
        <div>
          <label style={labelStyle}>Project Type</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {(["remote", "hybrid"] as const).map((type) => (
              <button
                key={type}
                onClick={() => onChange({ projectType: type })}
                style={{
                  ...typeBtnStyle,
                  background: data.projectType === type ? "rgba(77, 99, 255, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  borderColor: data.projectType === type ? "#4D63FF" : "rgba(255, 255, 255, 0.08)",
                  color: data.projectType === type ? "#fff" : "rgba(226, 232, 240, 0.5)",
                }}
              >
                {type === "remote" ? <Wifi size={14} /> : <Briefcase size={14} />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
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
  transition: "border-color 0.2s ease",
};

const tagStyle: React.CSSProperties = {
  background: "rgba(77, 99, 255, 0.1)",
  border: "1px solid rgba(77, 99, 255, 0.3)",
  borderRadius: "50px",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#4D63FF",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const removeTagBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#4D63FF",
  cursor: "pointer",
  fontSize: "16px",
  padding: "0",
  lineHeight: "1",
};

const typeBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "12px",
  border: "1px solid",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
};
