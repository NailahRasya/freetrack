"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  id: string;
  label: string;
}

interface CustomFilterDropdownProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder: string;
  triggerStyle?: React.CSSProperties;
}

export default function CustomFilterDropdown({
  value,
  options,
  onChange,
  placeholder,
  triggerStyle
}: CustomFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === value);
  const selectedLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          background: "#0D1B2E",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px",
          padding: "10px 14px",
          color: "#fff",
          fontSize: "13px",
          outline: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.2s",
          ...triggerStyle
        }}
      >
        <span style={{ color: value !== "" ? "#fff" : "rgba(226, 232, 240, 0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedLabel}
        </span>
        <ChevronDown 
          size={14} 
          style={{ 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
            transition: "transform 0.2s", 
            color: "rgba(226, 232, 240, 0.4)",
            flexShrink: 0,
            marginLeft: "8px"
          }} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1100,
              marginTop: "6px",
              background: "rgba(13, 27, 46, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ maxHeight: "240px", overflowY: "auto", padding: "4px" }}>
              {options.map((opt) => {
                const isSelected = value === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileHover={{ background: "rgba(77, 99, 255, 0.1)", x: 2 }}
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: isSelected ? "rgba(77, 99, 255, 0.15)" : "transparent",
                      border: "none",
                      color: isSelected ? "#fff" : "rgba(226, 232, 240, 0.7)",
                      fontSize: "13px",
                      fontWeight: isSelected ? "700" : "500",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    {isSelected && <Check size={14} color="#4D63FF" />}
                    <span style={{ flexGrow: 1 }}>{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
