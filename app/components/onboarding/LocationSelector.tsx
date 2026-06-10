"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationSelectorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  icon?: React.ReactNode;
}

export default function LocationSelector({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <label style={labelStyle}>{label}</label>
      
      {/* Trigger Input-Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...inputWrap,
          borderColor: isOpen ? "#4D63FF" : "rgba(255, 255, 255, 0.08)",
          boxShadow: isOpen ? "0 0 15px rgba(77, 99, 255, 0.15)" : "none"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          {icon && <div style={{ color: "rgba(226, 232, 240, 0.3)", display: "flex", alignItems: "center" }}>{icon}</div>}
          <span style={{ 
            color: value ? "#fff" : "rgba(226, 232, 240, 0.3)", 
            fontSize: "14px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            color: "rgba(226, 232, 240, 0.4)", 
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "all 0.2s ease",
            marginLeft: "8px",
            flexShrink: 0
          }} 
        />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={dropdownStyle}
          >
            {/* Search Input Bar */}
            <div style={searchWrap}>
              <Search size={14} style={searchIcon} />
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInput}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setSearch(""); }}
                  style={clearBtn}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Options List */}
            <div style={listStyle}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = value === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                      }}
                      style={{
                        ...optionStyle,
                        background: isSelected ? "rgba(77, 99, 255, 0.15)" : "transparent",
                        color: isSelected ? "#4D63FF" : "rgba(226, 232, 240, 0.8)"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                          e.currentTarget.style.color = "#fff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "rgba(226, 232, 240, 0.8)";
                        }
                      }}
                    >
                      {opt}
                    </button>
                  );
                })
              ) : (
                <div style={noResultStyle}>Tidak ditemukan</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "12px 14px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "12px",
  cursor: "pointer",
  outline: "none",
  transition: "all 0.2s ease",
  boxSizing: "border-box"
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  marginTop: "8px",
  background: "rgba(13, 21, 46, 0.98)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "14px",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
  zIndex: 999,
  overflow: "hidden",
  padding: "8px"
};

const searchWrap: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  width: "100%",
  marginBottom: "8px",
};

const searchIcon: React.CSSProperties = {
  position: "absolute",
  left: "12px",
  color: "rgba(226, 232, 240, 0.3)",
};

const searchInput: React.CSSProperties = {
  width: "100%",
  padding: "8px 32px 8px 34px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box"
};

const clearBtn: React.CSSProperties = {
  position: "absolute",
  right: "10px",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "rgba(226, 232, 240, 0.4)",
  padding: "4px",
  display: "flex",
  alignItems: "center"
};

const listStyle: React.CSSProperties = {
  maxHeight: "180px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "2px"
};

const optionStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "none",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "650",
  cursor: "pointer",
  transition: "all 0.15s ease",
  display: "block",
  boxSizing: "border-box"
};

const noResultStyle: React.CSSProperties = {
  padding: "16px",
  textAlign: "center",
  color: "rgba(226, 232, 240, 0.3)",
  fontSize: "13px"
};
