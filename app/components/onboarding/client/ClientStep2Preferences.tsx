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
  Star,
  Check
} from "lucide-react";

interface ClientStep2Props {
  data: any;
  updateData: (fields: any) => void;
}

export default function ClientStep2Preferences({ data, updateData }: ClientStep2Props) {
  const businessScales = [
    { id: "personal", label: "Individu", icon: <User size={20} />, desc: "Untuk kebutuhan personal" },
    { id: "startup", label: "Startup", icon: <Rocket size={20} />, desc: "Fase awal pertumbuhan" },
    { id: "umkm", label: "UMKM", icon: <Building2 size={20} />, desc: "Usaha kecil menengah" },
    { id: "enterprise", label: "Korporasi", icon: <Factory size={20} />, desc: "Skala perusahaan besar" },
  ];

  const workTypes = [
    { id: "one-time", label: "Satu Kali", icon: <Zap size={20} />, desc: "Project jangka pendek" },
    { id: "ongoing", label: "Berkelanjutan", icon: <Calendar size={20} />, desc: "Kerjasama jangka panjang" },
  ];

  const experienceLevels = [
    { id: "junior", label: "Junior", desc: "Hemat biaya & antusias" },
    { id: "mid", label: "Intermediate", desc: "Berpengalaman & stabil" },
    { id: "senior", label: "Senior", desc: "Expert & strategis" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
          Personalisasi Kebutuhan Anda
        </h3>
        <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "15px" }}>
          Bantu kami memahami kriteria yang Anda cari agar kami dapat mencocokkan Freelancer yang tepat.
        </p>
      </div>

      {/* Section: Skala Bisnis */}
      <div>
        <h4 style={sectionTitle}>Skala Bisnis / Profil Anda</h4>
        <div style={grid4}>
          {businessScales.map((item) => (
            <SelectionCard
              key={item.id}
              active={data.businessScale === item.id}
              onClick={() => updateData({ businessScale: item.id })}
              icon={item.icon}
              label={item.label}
              desc={item.desc}
              accent="#4D63FF"
            />
          ))}
        </div>
      </div>

      {/* Section: Tipe Kerjasama */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
        <div>
          <h4 style={sectionTitle}>Tipe Kerjasama</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {workTypes.map((item) => (
              <SelectionCard
                key={item.id}
                active={data.workType === item.id}
                onClick={() => updateData({ workType: item.id })}
                icon={item.icon}
                label={item.label}
                desc={item.desc}
                accent="#8B5CF6"
              />
            ))}
          </div>
        </div>

        <div>
          <h4 style={sectionTitle}>Ekspektasi Pengalaman</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {experienceLevels.map((item) => {
              const isActive = data.experiencePreference === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => updateData({ experiencePreference: item.id })}
                  style={{
                    ...rowBtn,
                    background: isActive ? "rgba(77, 99, 255, 0.1)" : "rgba(255, 255, 255, 0.02)",
                    borderColor: isActive ? "#4D63FF" : "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ 
                      width: "12px", 
                      height: "12px", 
                      borderRadius: "50%", 
                      border: "2px solid", 
                      borderColor: isActive ? "#4D63FF" : "rgba(255,255,255,0.2)",
                      background: isActive ? "#4D63FF" : "transparent"
                    }} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: isActive ? "#fff" : "rgba(226,232,240,0.7)" }}>{item.label}</div>
                      <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)" }}>{item.desc}</div>
                    </div>
                  </div>
                  {isActive && <Check size={16} color="#4D63FF" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectionCard({ active, onClick, icon, label, desc, accent }: any) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: active ? `rgba(${accent === '#4D63FF' ? '77, 99, 255' : '139, 92, 246'}, 0.08)` : "rgba(255, 255, 255, 0.02)",
        border: "1px solid",
        borderColor: active ? accent : "rgba(255, 255, 255, 0.05)",
        borderRadius: "20px",
        cursor: "pointer",
        textAlign: "center",
        gap: "12px",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {active && (
        <div style={{ 
          position: "absolute", 
          top: "12px", 
          right: "12px", 
          width: "20px", 
          height: "20px", 
          borderRadius: "50%", 
          background: accent, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Check size={12} color="white" strokeWidth={3} />
        </div>
      )}
      <div style={{ 
        width: "48px", 
        height: "48px", 
        borderRadius: "14px", 
        background: active ? accent : "rgba(255, 255, 255, 0.03)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: active ? "white" : "rgba(226, 232, 240, 0.3)",
        transition: "all 0.2s ease"
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: active ? "white" : "rgba(226, 232, 240, 0.8)" }}>{label}</div>
        <div style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)", marginTop: "4px" }}>{desc}</div>
      </div>
    </motion.button>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  color: "rgba(226, 232, 240, 0.3)",
  marginBottom: "16px",
  marginLeft: "4px"
};

const grid4: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "16px",
};

const rowBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  border: "1px solid",
  borderRadius: "16px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textAlign: "left"
};
