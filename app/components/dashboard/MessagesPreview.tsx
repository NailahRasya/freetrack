"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, UserPlus, ChevronDown, Check, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "../../dashboard/layout";

export default function MessagesPreview() {
  const [chats, setChats] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch recent messages
  const fetchMessages = async (targetId?: string) => {
    if (!user?.id) return;
    try {
      let query = supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          sender:profiles!sender_id (id, full_name, avatar_url),
          receiver:profiles!receiver_id (id, full_name, avatar_url)
        `);

      if (targetId) {
        query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${user.id})`);
      } else {
        query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      if (data) {
        const mapped = data.map(m => {
          const isMe = m.sender_id === user.id;
          const otherParty = isMe ? m.receiver : m.sender;
          const name = isMe ? "Anda" : (m.sender as any)?.full_name || "User";
          
          return {
            id: m.id,
            name: name,
            message: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: false,
            avatar: (otherParty as any)?.avatar_url || name.substring(0, 2).toUpperCase(),
            color: isMe ? "#4D63FF" : "#00FFA3",
            senderId: m.sender_id
          };
        });
        setChats(mapped);
      }
    } catch (err) {
      console.error("Error fetching messages preview:", err);
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch("/api/contacts?type=accepted");
      const { data } = await response.json();
      if (data) {
        const role = user.user_metadata?.role || "client";
        const mapped = data.map((c: any) => {
          const other = role === "freelancer" ? c.client : c.freelancer;
          return {
            id: other.id,
            name: other.full_name,
            avatar: other.avatar_url,
            email: other.email
          };
        });
        setContacts(mapped);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchContacts();
  }, [user?.id]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    } else {
      fetchMessages();
    }
  }, [selectedContact]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedContact || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: selectedContact.id,
          content: messageText
        })
      });

      if (res.ok) {
        setMessageText("");
        fetchMessages(selectedContact.id);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with Contact Selection */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", position: "relative" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>Pesan</h3>
          <p style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.4)" }}>
            {selectedContact ? `Chat dengan ${selectedContact.name}` : "Pilih kontak untuk mulai chat"}
          </p>
        </div>

        <div ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {selectedContact ? (
              <span style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedContact.name}
              </span>
            ) : (
              <UserPlus size={14} />
            )}
            <ChevronDown size={14} style={{ transform: isDropdownOpen ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  width: "200px",
                  background: "#0F1B2E",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  zIndex: 100,
                  overflow: "hidden"
                }}
              >
                <div style={{ padding: "8px", maxHeight: "240px", overflowY: "auto" }}>
                  <div 
                    onClick={() => { setSelectedContact(null); setIsDropdownOpen(false); }}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: !selectedContact ? "var(--cyan)" : "#E2E8F0",
                      background: !selectedContact ? "rgba(0, 255, 163, 0.05)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    Semua Pesan
                    {!selectedContact && <Check size={12} />}
                  </div>
                  <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.05)", margin: "4px 0" }} />
                  {contacts.length === 0 ? (
                    <p style={{ padding: "10px", fontSize: "11px", color: "rgba(226, 232, 240, 0.3)", textAlign: "center" }}>Tidak ada kontak.</p>
                  ) : contacts.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => { setSelectedContact(c); setIsDropdownOpen(false); }}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: selectedContact?.id === c.id ? "var(--cyan)" : "#E2E8F0",
                        background: selectedContact?.id === c.id ? "rgba(0, 255, 163, 0.05)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "0.2s"
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                      {selectedContact?.id === c.id && <Check size={12} />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages List */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", paddingRight: "4px" }}>
        {chats.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", opacity: 0.3 }}>
            <MessageSquare size={32} />
            <p style={{ fontSize: "12px" }}>Belum ada pesan.</p>
          </div>
        ) : chats.map((chat, idx) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              display: "flex",
              gap: "12px",
              padding: "4px",
              borderRadius: "10px",
              position: "relative"
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: chat.avatar.length > 2 
                ? `url(${chat.avatar}) center/cover` 
                : `linear-gradient(135deg, ${chat.color}, #0B1220)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "700",
              fontSize: "12px",
              flexShrink: 0,
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              {chat.avatar.length <= 2 && chat.avatar}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#E2E8F0" }}>{chat.name}</span>
                <span style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)" }}>{chat.time}</span>
              </div>
              <p style={{ 
                fontSize: "12px", 
                color: "rgba(226, 232, 240, 0.4)", 
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}>
                {chat.message}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Reply / Message Input */}
      <div style={{ 
        marginTop: "20px", 
        display: "flex", 
        gap: "8px", 
        padding: "6px 12px", 
        background: "rgba(255, 255, 255, 0.03)", 
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        alignItems: "center"
      }}>
        <input 
          placeholder={selectedContact ? `Pesan ke ${selectedContact.name}...` : "Pilih kontak untuk membalas..."}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={!selectedContact || isSending}
          style={{ 
            background: "transparent", 
            border: "none", 
            outline: "none", 
            color: "#fff", 
            fontSize: "12px", 
            flex: 1,
            padding: "8px 0",
            cursor: !selectedContact ? "not-allowed" : "text"
          }} 
        />
        <button 
          onClick={handleSendMessage}
          disabled={!selectedContact || !messageText.trim() || isSending}
          style={{ 
            width: "32px", 
            height: "32px", 
            borderRadius: "10px", 
            background: !selectedContact || !messageText.trim() || isSending ? "rgba(255, 255, 255, 0.05)" : "var(--gradient-primary)", 
            border: "none", 
            color: "#fff", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            cursor: !selectedContact || !messageText.trim() || isSending ? "not-allowed" : "pointer",
            transition: "0.3s"
          }}>
          {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}

