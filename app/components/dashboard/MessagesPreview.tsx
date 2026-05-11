"use client";

import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "../../dashboard/layout";

/**
 * Komponen MessagesPreview menampilkan ringkasan pesan terbaru dari klien atau freelancer.
 */
export default function MessagesPreview() {
  const [chats, setChats] = useState<any[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            sender_id,
            sender:profiles!sender_id (full_name)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        if (data) {
          const mapped = data.map(m => {
            const senderName = m.sender_id === user.id ? "Anda" : (m.sender as any)?.full_name || "User";
            return {
              id: m.id,
              name: senderName,
              message: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unread: false,
              avatar: senderName.substring(0, 2).toUpperCase(),
              color: m.sender_id === user.id ? "#4D63FF" : "#00FFA3"
            };
          });
          setChats(mapped);
        }
      } catch (err) {
        console.error("Error fetching messages preview:", err);
      }
    };

    fetchMessages();
  }, [user?.id]);
  return (
    <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>Pesan Terbaru</h3>
        <MessageSquare size={18} style={{ color: "rgba(226, 232, 240, 0.4)", cursor: "pointer" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {chats.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(226, 232, 240, 0.2)", fontSize: "12px", padding: "20px" }}>Belum ada pesan terbaru.</p>
        ) : chats.map((chat, idx) => (
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

      {/* Input Balas Cepat */}
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
          suppressHydrationWarning
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
        <button 
          suppressHydrationWarning
          style={{ 
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

