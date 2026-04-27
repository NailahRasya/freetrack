"use client";

import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";

const chats = [
  {
    id: 1,
    name: "Sarah Jenkins",
    message: "I've uploaded the latest design files to the dashboard...",
    time: "12mnt yang lalu",
    unread: true,
    avatar: "SJ",
    color: "#00E5FF",
  },
  {
    id: 2,
    name: "Aris Munandar",
    message: "Could we jump on a quick call to discuss the API?",
    time: "45mnt yang lalu",
    unread: false,
    avatar: "AM",
    color: "#00FFA3",
  },
  {
    id: 3,
    name: "David Chen",
    message: "The smart contract audit is 90% complete. I found...",
    time: "2j yang lalu",
    unread: false,
    avatar: "DC",
    color: "#4D63FF",
  },
];

export default function MessagesPreview() {
  return (
    <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Pesan Terbaru</h3>
        <MessageSquare size={18} style={{ color: "rgba(226, 232, 240, 0.4)", cursor: "pointer" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {chats.map((chat, idx) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              display: "flex",
              gap: "12px",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "10px",
              transition: "all 0.2s ease",
              position: "relative"
            }}
            whileHover={{ 
              x: 4,
              background: "rgba(255, 255, 255, 0.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
            whileTap={{ scale: 0.96 }}
          >
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${chat.color}, #0B1220)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "700",
              fontSize: "14px",
              flexShrink: 0
            }}>
              {chat.avatar}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#E2E8F0" }}>{chat.name}</span>
                <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)" }}>{chat.time}</span>
              </div>
              <p style={{ 
                fontSize: "12px", 
                color: chat.unread ? "#fff" : "rgba(226, 232, 240, 0.4)", 
                whiteSpace: "nowrap", 
                overflow: "hidden", 
                textOverflow: "ellipsis",
                fontWeight: chat.unread ? "600" : "400"
              }}>
                {chat.message}
              </p>
            </div>

            {chat.unread && (
              <div style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "8px",
                height: "8px",
                background: "var(--cyan)",
                borderRadius: "50%",
                boxShadow: "0 0 10px var(--cyan)"
              }} />
            )}
          </motion.div>
        ))}
      </div>

      <div style={{ 
        marginTop: "24px", 
        display: "flex", 
        gap: "8px", 
        padding: "8px", 
        background: "rgba(255, 255, 255, 0.03)", 
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <input 
          placeholder="Balas cepat..." 
          style={{ 
            background: "transparent", 
            border: "none", 
            outline: "none", 
            color: "#fff", 
            fontSize: "12px", 
            flex: 1,
            padding: "4px 8px"
          }} 
        />
        <button style={{ 
          width: "28px", 
          height: "28px", 
          borderRadius: "8px", 
          background: "var(--gradient-primary)", 
          border: "none", 
          color: "#fff", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          cursor: "pointer"
        }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
