"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, User, Loader2, MessageSquare, MoreVertical, Trash2, UserMinus } from "lucide-react";
import { useUser } from "../layout";
import { useContacts } from "@/lib/hooks/useContacts";
import { useMessages } from "@/lib/hooks/useMessages";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

export default function Messages() {
  const { user, role } = useUser();
  const { contacts, loading: contactsLoading } = useContacts();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading: messagesLoading, sendMessage, refetch: refetchMessages } = useMessages(selectedUserId || undefined);
  const { refetch: refetchContacts } = useContacts();
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialUserId && !selectedUserId) {
      setSelectedUserId(initialUserId);
    }
  }, [initialUserId, selectedUserId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredContacts = contacts.filter((c: any) => {
    const target = role === "client" ? c.freelancer : c.client;
    return target?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           target?.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedContact = contacts.find((c: any) => {
    const target = role === "client" ? c.freelancer : c.client;
    return target?.id === selectedUserId;
  });

  const selectedTarget = selectedContact ? (role === "client" ? selectedContact.freelancer : selectedContact.client) : null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText(""); // optimistically clear input
    try {
      await sendMessage(text);
    } catch (e) {
      setInputText(text); // revert if failed
      Swal.fire({ title: "Gagal", text: "Gagal mengirim pesan.", icon: "error", background: "#0F1B2E", color: "#fff" });
    }
  };

  const handleDeleteChat = async () => {
    setShowOptions(false);
    if (!selectedUserId) return;

    const result = await Swal.fire({
      title: "Hapus Riwayat Chat?",
      text: "Semua pesan dalam percakapan ini akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF4D6A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#0F1B2E",
      color: "#fff"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/messages?userId=${selectedUserId}`, { method: "DELETE" });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        
        await refetchMessages();
        Swal.fire({ title: "Terhapus!", text: "Riwayat chat telah dihapus.", icon: "success", timer: 1500, showConfirmButton: false, background: "#0F1B2E", color: "#fff" });
      } catch (e: any) {
        Swal.fire({ title: "Gagal", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
      }
    }
  };

  const handleDeleteContact = async () => {
    setShowOptions(false);
    if (!selectedContact) return;

    const result = await Swal.fire({
      title: "Hapus Kontak?",
      text: "Kontak ini akan dihapus dari daftar Anda. Anda harus mengundangnya kembali untuk memulai chat baru.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF4D6A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#0F1B2E",
      color: "#fff"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/contacts?id=${selectedContact.id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        
        setSelectedUserId(null);
        await refetchContacts();
        Swal.fire({ title: "Terhapus!", text: "Kontak telah dihapus.", icon: "success", timer: 1500, showConfirmButton: false, background: "#0F1B2E", color: "#fff" });
      } catch (e: any) {
        Swal.fire({ title: "Gagal", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 140px)", background: "rgba(15, 27, 46, 0.4)", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.05)", overflow: "hidden" }}>
      
      {/* Sidebar - Contacts */}
      <div style={{ width: "320px", borderRight: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", background: "rgba(10, 20, 45, 0.3)" }}>
        <div style={{ padding: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "16px" }}>
            Pesan <span className="gradient-text">Aktif</span>
          </h2>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(226, 232, 240, 0.3)" }} />
            <input type="text" placeholder="Cari kontak..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "10px 16px 10px 42px", color: "#fff", fontSize: "14px", outline: "none" }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 20px" }}>
          {contactsLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "rgba(226,232,240,0.4)" }}>Memuat kontak...</div>
          ) : filteredContacts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {filteredContacts.map((c: any) => {
                const target = role === "client" ? c.freelancer : c.client;
                const isSelected = selectedUserId === target.id;
                return (
                  <motion.button key={c.id}
                    whileHover={{ background: isSelected ? "rgba(77, 99, 255, 0.2)" : "rgba(255, 255, 255, 0.03)" }}
                    onClick={() => setSelectedUserId(target.id)}
                    style={{
                      width: "100%", textAlign: "left", padding: "12px", borderRadius: "14px", border: "none",
                      background: isSelected ? "rgba(77, 99, 255, 0.15)" : "transparent", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s"
                    }}
                  >
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "15px", flexShrink: 0 }}>
                      {target?.full_name?.charAt(0) ?? "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{target?.full_name}</div>
                      <div style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "rgba(226, 232, 240, 0.4)", fontSize: "12px", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{target?.email}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
             <div style={{ padding: "20px", textAlign: "center", color: "rgba(226,232,240,0.4)", fontSize: "13px" }}>Tidak ada kontak</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(15, 27, 46, 0.2)" }}>
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "18px" }}>
                  {selectedTarget?.full_name?.charAt(0) ?? "?"}
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", margin: 0 }}>{selectedTarget?.full_name || "Pengguna"}</h3>
                  <span style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.5)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00FFA3" }} />
                    Sedang aktif
                  </span>
                </div>
              </div>

              {/* Options Menu */}
              <div style={{ position: "relative" }} ref={optionsRef}>
                <motion.button
                  whileHover={{ background: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowOptions(!showOptions)}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", background: "transparent", border: "none", color: "rgba(226,232,240,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <MoreVertical size={20} />
                </motion.button>

                <AnimatePresence>
                  {showOptions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      style={{
                        position: "absolute", top: "100%", right: 0, marginTop: "8px", width: "200px",
                        background: "#161B22", border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 100, padding: "8px",
                        overflow: "hidden"
                      }}
                    >
                      <button onClick={handleDeleteChat} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "transparent", border: "none", color: "#fff", fontSize: "13px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <Trash2 size={16} style={{ color: "#FF4D6A" }} /> Hapus Riwayat Chat
                      </button>
                      <button onClick={handleDeleteContact} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "transparent", border: "none", color: "#fff", fontSize: "13px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,106,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <UserMinus size={16} style={{ color: "#FF4D6A" }} /> Hapus Kontak
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {messagesLoading && messages.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
                  <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Memuat pesan...</span>
                </div>
              ) : messages.length > 0 ? (
                messages.map((m: any, i: number) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <motion.div key={m.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", width: "100%" }}>
                      <div style={{
                        maxWidth: "70%",
                        padding: "14px 18px",
                        borderRadius: "20px",
                        borderBottomRightRadius: isMe ? "4px" : "20px",
                        borderBottomLeftRadius: !isMe ? "4px" : "20px",
                        background: isMe ? "linear-gradient(135deg, #4D63FF, #3b50e3)" : "rgba(255, 255, 255, 0.05)",
                        color: "#fff",
                        fontSize: "14.5px",
                        lineHeight: "1.5",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        border: isMe ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                      }}>
                        {m.content}
                      </div>
                      <span style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)", marginTop: "6px", marginRight: isMe ? "8px" : "0px", marginLeft: !isMe ? "8px" : "0px" }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5 }}>
                  <MessageSquare size={48} style={{ color: "rgba(226,232,240,0.2)", marginBottom: "16px" }} />
                  <p style={{ color: "rgba(226,232,240,0.6)", fontSize: "14px" }}>Belum ada pesan. Mulai percakapan sekarang!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{ padding: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", background: "rgba(255,255,255,0.01)" }}>
              <form onSubmit={handleSend} style={{ display: "flex", gap: "12px" }}>
                <input type="text" placeholder="Ketik pesan Anda..." value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  style={{
                    flex: 1, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px", padding: "14px 20px", color: "#fff", fontSize: "15px", outline: "none",
                  }} />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit"
                  disabled={!inputText.trim()}
                  style={{
                    width: "50px", height: "50px", borderRadius: "16px", background: "var(--primary)",
                    border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: inputText.trim() ? "pointer" : "not-allowed", opacity: inputText.trim() ? 1 : 0.5,
                  }}>
                  <Send size={20} style={{ marginLeft: "2px" }} />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.8 }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <MessageSquare size={32} style={{ color: "rgba(226,232,240,0.2)" }} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>Mulai Diskusi</h2>
            <p style={{ color: "rgba(226,232,240,0.5)", fontSize: "14px", maxWidth: "300px", textAlign: "center", lineHeight: "1.6" }}>
              Pilih kontak dari daftar di sebelah kiri untuk memulai percakapan atau negosiasi proyek.
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
