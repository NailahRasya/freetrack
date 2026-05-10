"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  User, 
  Rocket, 
  Factory, 
  Zap, 
  Calendar, 
  Check,
  Search,
  Wrench
} from "lucide-react";

interface FreelancerStep2Props {
  data: any;
  updateData: (fields: any) => void;
}

import { TOOLS_BY_CATEGORY, getCategoryIdBySkillId } from "@/app/constants/onboarding-categories";

export default function FreelancerStep2WorkPreferences({ data, updateData }: FreelancerStep2Props) {
  // Ambil kategori unik dari skill yang dipilih di Step 1
  const selectedSkillIds = data.skillCategories || [];
  const selectedParentCategories = Array.from(new Set(
    selectedSkillIds.map((id: string) => getCategoryIdBySkillId(id)).filter(Boolean)
  )) as string[];

  // Jika tidak ada kategori yang dipilih, tampilkan semua tools sebagai fallback (atau list default)
  const filteredTools = selectedParentCategories.length > 0
    ? Array.from(new Set(selectedParentCategories.flatMap(catId => TOOLS_BY_CATEGORY[catId] || [])))
    : ["Figma", "React", "Next.js", "Trello", "Notion"]; // Default fallback
  const clientScales = [
    { id: "personal", label: "Individu", icon: <User size={18} /> },
    { id: "startup", label: "Startup", icon: <Rocket size={18} /> },
    { id: "umkm", label: "UMKM", icon: <Building2 size={18} /> },
    { id: "enterprise", label: "Korporasi", icon: <Factory size={18} /> },
  ];

  const workTypes = [
    { id: "one-time", label: "Satu Kali", icon: <Zap size={18} />, desc: "Project pendek" },
    { id: "ongoing", label: "Berkelanjutan", icon: <Calendar size={18} />, desc: "Long-term" },
  ];

  const toggleList = (field: string, id: string) => {
    const current = data[field] || [];
    const next = current.includes(id) ? current.filter((i: string) => i !== id) : [...current, id];
    updateData({ [field]: next });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
          Tentukan Gaya Kerja Anda
        </h3>
        <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "15px" }}>
          Pilih kriteria klien dan project yang paling cocok dengan keahlian Anda.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        {/* Minat Skala Klien */}
        <div>
          <h4 style={sectionTitle}>Minat Skala Klien</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {clientScales.map((item) => (
              <SelectionChip
                key={item.id}
                active={data.preferredClientScales?.includes(item.id)}
                onClick={() => toggleList("preferredClientScales", item.id)}
                icon={item.icon}
                label={item.label}
                accent="#10B981"
              />
            ))}
          </div>
        </div>

        {/* Tipe Kerjasama */}
        <div>
          <h4 style={sectionTitle}>Tipe Kerjasama</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {workTypes.map((item) => (
              <SelectionChip
                key={item.id}
                active={data.workTypePreference?.includes(item.id)}
                onClick={() => updateData({ workTypePreference: [item.id] })}
                icon={item.icon}
                label={item.label}
                accent="#34D399"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h4 style={{ ...sectionTitle, marginBottom: 0 }}>Tools & Tech Stack</h4>
          <div style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.3)" }}>Pilih yang paling Anda kuasai</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {filteredTools.map((tool) => {
            const isActive = data.tools?.includes(tool);
            return (
              <button
                key={tool}
                onClick={() => toggleList("tools", tool)}
                style={{
                  ...toolTag,
                  background: isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.03)",
                  borderColor: isActive ? "#10B981" : "rgba(255, 255, 255, 0.08)",
                  color: isActive ? "#fff" : "rgba(226, 232, 240, 0.5)",
                }}
              >
                {isActive && <Check size={14} style={{ marginRight: "6px" }} />}
                {tool}
              </button>
            );
          })}
        </div>
      </div>

      <div style={matchBadge}>
        <Wrench size={16} />
        <span>Data ini akan membantu kami mencocokkan Anda dengan klien yang memiliki preferensi serupa.</span>
      </div>
    </div>
  );
}

function SelectionChip({ active, onClick, icon, label, accent }: any) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 16px",
        background: active ? `${accent}15` : "rgba(255, 255, 255, 0.02)",
        border: "1px solid",
        borderColor: active ? accent : "rgba(255, 255, 255, 0.05)",
        borderRadius: "14px",
        cursor: "pointer",
        color: active ? "#fff" : "rgba(226, 232, 240, 0.6)",
        fontSize: "14px",
        fontWeight: "700",
        transition: "all 0.2s ease",
        textAlign: "left",
      }}
    >
      <div style={{ color: active ? accent : "rgba(226, 232, 240, 0.3)" }}>
        {icon}
      </div>
      {label}
      {active && <Check size={14} style={{ marginLeft: "auto", color: accent }} />}
    </motion.button>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "1.2px",
  color: "rgba(226, 232, 240, 0.3)",
  marginBottom: "16px",
};

const toolTag: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "1px solid",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  transition: "all 0.2s ease",
};

const matchBadge: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px 20px",
  background: "rgba(16, 185, 129, 0.05)",
  border: "1px solid rgba(16, 185, 129, 0.1)",
  borderRadius: "16px",
  fontSize: "13px",
  color: "#10B981",
  fontWeight: "500",
  marginTop: "8px"
};
