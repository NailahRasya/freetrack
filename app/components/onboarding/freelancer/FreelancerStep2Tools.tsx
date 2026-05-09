"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Wrench,
  Check
} from "lucide-react";

interface Tool {
  id: string;
  label: string;
}

const allTools: Tool[] = [
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "flutter", label: "Flutter" },
  { id: "laravel", label: "Laravel" },
  { id: "nodejs", label: "Node.js" },
  { id: "figma", label: "Figma" },
  { id: "photoshop", label: "Photoshop" },
  { id: "blender", label: "Blender" },
  { id: "premiere", label: "Adobe Premiere" },
  { id: "typescript", label: "TypeScript" },
  { id: "tailwind", label: "TailwindCSS" },
  { id: "docker", label: "Docker" },
  { id: "after-effects", label: "After Effects" },
  { id: "illustrator", label: "Illustrator" },
  { id: "python", label: "Python" },
  { id: "tensorflow", label: "TensorFlow" },
];

interface FreelancerStep2Props {
  selectedTools: string[];
  onToggle: (id: string) => void;
}

export default function FreelancerStep2Tools({
  selectedTools,
  onToggle,
}: FreelancerStep2Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
          Tools & Tech Stack
        </h3>
        <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "14px" }}>
          Pilih tools yang Anda kuasai untuk membantu matchmaking project.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", padding: "4px" }}>
        {allTools.map((tool) => {
          const isSelected = (selectedTools || []).includes(tool.id);
          return (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggle(tool.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                background: isSelected ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${isSelected ? "#10B981" : "rgba(255, 255, 255, 0.08)"}`,
                borderRadius: "12px",
                color: isSelected ? "#fff" : "rgba(226, 232, 240, 0.5)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
            >
              <div style={{ 
                width: "18px", 
                height: "18px", 
                borderRadius: "4px", 
                border: "1px solid",
                borderColor: isSelected ? "#10B981" : "rgba(255, 255, 255, 0.2)",
                background: isSelected ? "#10B981" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {isSelected && <Check size={12} color="white" />}
              </div>
              {tool.label}
            </motion.button>
          );
        })}
      </div>

      <div style={infoBox}>
        <Wrench size={16} />
        <span>Matching project lebih akurat dengan data tools yang lengkap.</span>
      </div>
    </div>
  );
}

const infoBox: React.CSSProperties = {
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
