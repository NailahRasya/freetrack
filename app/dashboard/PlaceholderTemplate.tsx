"use client";

import { motion } from "framer-motion";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", marginBottom: "8px" }}>
          {title}
        </h1>
        <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "15px" }}>
          This page is currently under construction.
        </p>
      </motion.div>
      
      <div className="glass-card" style={{ padding: "40px", textAlign: "center", background: "rgba(15, 27, 46, 0.4)" }}>
        <p style={{ color: "rgba(226, 232, 240, 0.6)" }}>
          The {title} module will be integrated soon with live data from Supabase.
        </p>
      </div>
    </div>
  );
}
