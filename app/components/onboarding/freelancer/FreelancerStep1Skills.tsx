"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Code2, 
  Palette, 
  Video, 
  Briefcase, 
  ChevronDown,
  Check
} from "lucide-react";

import { ONBOARDING_CATEGORIES } from "@/app/constants/onboarding-categories";


interface FreelancerStep1Props {
  selectedSkills: string[];
  onToggle: (id: string) => void;
}

export default function FreelancerStep1Skills({
  selectedSkills,
  onToggle,
}: FreelancerStep1Props) {
  const [search, setSearch] = React.useState("");
  const [expandedCats, setExpandedCats] = React.useState<string[]>(["development", "design"]);

  const toggleCat = (id: string) => {
    setExpandedCats(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const filteredCategories = ONBOARDING_CATEGORIES.map(cat => ({
    ...cat,
    skills: cat.skills.filter(s => 
      s.label.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.skills.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
          Apa Bidang Keahlian Anda?
        </h3>
        <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "14px" }}>
          Pilih kategori skill yang paling relevan dengan layanan Anda.
        </p>
      </div>

      {/* Search Bar */}
      <div style={searchWrap}>
        <Search size={18} style={searchIcon} />
        <input
          type="text"
          placeholder="Cari skill (contoh: Backend, UI/UX...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput}
        />
      </div>

      {/* Categories List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "4px" }}>
        {filteredCategories.map((cat) => {
          const isExpanded = expandedCats.includes(cat.id);
          const isCatSelected = cat.skills.some(s => (selectedSkills || []).includes(s.id));
          return (
            <div key={cat.id} style={{ 
              ...catCard, 
              background: isCatSelected ? `${cat.color}08` : "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${isCatSelected ? `${cat.color}40` : "rgba(255, 255, 255, 0.05)"}`,
              transition: "all 0.3s ease"
            }}>
              <button 
                onClick={() => toggleCat(cat.id)}
                style={{ ...catHeader, borderBottom: isExpanded ? "1px solid rgba(255,255,255,0.05)" : "none", color: isCatSelected ? cat.color : "rgba(226, 232, 240, 0.4)" }}
              >
                <div style={{ ...catIconWrap, background: isCatSelected ? `${cat.color}20` : "rgba(255,255,255,0.05)", color: isCatSelected ? cat.color : "rgba(255,255,255,0.2)" }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: "15px", fontWeight: "700", color: isCatSelected ? "#fff" : "rgba(255,255,255,0.7)" }}>{cat.label}</span>
                
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
                  {isCatSelected && (
                    <span style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "6px", background: cat.color, color: "#fff", fontWeight: "800", textTransform: "uppercase" }}>
                      Terpilih
                    </span>
                  )}
                  <ChevronDown 
                    size={18} 
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", opacity: 0.5 }} 
                  />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {cat.skills.map((skill) => {
                        const isSelected = (selectedSkills || []).includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            onClick={() => onToggle(skill.id)}
                            style={{
                              ...skillBtn,
                              background: isSelected ? `${cat.color}20` : "rgba(255,255,255,0.03)",
                              borderColor: isSelected ? cat.color : "rgba(255,255,255,0.08)",
                              color: isSelected ? "#fff" : "rgba(226, 232, 240, 0.5)",
                            }}
                          >
                            {isSelected && <Check size={14} style={{ color: cat.color }} />}
                            {skill.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const searchWrap: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const searchIcon: React.CSSProperties = {
  position: "absolute",
  left: "16px",
  color: "rgba(226, 232, 240, 0.3)",
};

const searchInput: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px 14px 48px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "14px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
};

const catCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.02)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "16px",
  overflow: "hidden",
};

const catHeader: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "rgba(226, 232, 240, 0.4)",
};

const catIconWrap: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const skillBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 12px",
  border: "1px solid",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "600",
  textAlign: "left",
  cursor: "pointer",
  transition: "all 0.2s ease",
};
