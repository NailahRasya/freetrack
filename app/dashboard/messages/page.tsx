"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContractInitiationModal from "../../components/dashboard/ContractInitiationModal";
import ContractReviewModal from "../../components/dashboard/ContractReviewModal";
import NegotiationSidebar from "../../components/dashboard/NegotiationSidebar";
import { Search, Send, User, Loader2, MessageSquare, MoreVertical, Trash2, UserMinus, ShieldCheck, Briefcase } from "lucide-react";
import { useUser } from "../layout";
import { useContacts } from "@/lib/hooks/useContacts";
import { useMessages } from "@/lib/hooks/useMessages";
import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import HireFreelancerModal from "../../components/dashboard/HireFreelancerModal";

function MessagesContent() {
  const { user, role } = useUser();
  const { contacts, loading: contactsLoading, ensureContact, refetch: refetchContacts } = useContacts();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUserId = searchParams.get("chat") || searchParams.get("userId");
  const projectId = searchParams.get("project");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledForUserRef = useRef<Record<string, boolean>>({});
  const lastMessagesCountRef = useRef<number>(0);

  const { messages, loading: messagesLoading, sendMessage, markAsRead, refetch: refetchMessages } = useMessages(selectedUserId || undefined);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [newChatUser, setNewChatUser] = useState<any>(null);
  const [loadingNewUser, setLoadingNewUser] = useState(false);
  const [projectContext, setProjectContext] = useState<any>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (initialUserId && selectedUserId !== initialUserId) {
      setSelectedUserId(initialUserId);
    }
  }, [initialUserId]);

  // 1. Mark messages as read and clear unread counts immediately when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      setUnreadCounts(prev => ({ ...prev, [selectedUserId]: 0 }));
      markAsRead();
    }
  }, [selectedUserId, markAsRead]);

  // 2. Mark messages as read and clear unread counts whenever new unread messages load or arrive
  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      const hasUnread = messages.some((m: any) => m.sender_id === selectedUserId && m.receiver_id === user?.id && !m.is_read);
      if (hasUnread) {
        markAsRead();
        setUnreadCounts(prev => ({ ...prev, [selectedUserId]: 0 }));
      }
    }
  }, [selectedUserId, messages, user?.id, markAsRead]);

  // 3. Listen to the custom messages-read event to update unread counts instantly in local state
  useEffect(() => {
    const handleMessagesRead = (e: Event) => {
      const customEvent = e as CustomEvent;
      const senderId = customEvent.detail?.senderId;
      if (senderId) {
        setUnreadCounts(prev => ({ ...prev, [senderId]: 0 }));
      }
    };
    window.addEventListener("messages-read", handleMessagesRead);
    return () => {
      window.removeEventListener("messages-read", handleMessagesRead);
    };
  }, []);

  // Periodic polling for unread message counts with selectedUserId exclusion
  useEffect(() => {
    if (!user?.id) return;

    async function fetchUnreadCounts() {
      try {
        const { data: unreadMsgs } = await supabase
          .from("messages")
          .select("sender_id")
          .eq("receiver_id", user.id)
          .eq("is_read", false);

        if (unreadMsgs) {
          const counts: Record<string, number> = {};
          unreadMsgs.forEach((msg: any) => {
            const sender = msg.sender_id;
            if (sender !== selectedUserId) {
              counts[sender] = (counts[sender] || 0) + 1;
            }
          });
          // Explicitly ensure currently selected contact has 0 unread
          if (selectedUserId) {
            counts[selectedUserId] = 0;
          }
          setUnreadCounts(counts);
        }
      } catch (err) {
        console.error("Failed to fetch unread message counts:", err);
      }
    }

    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 3000);
    return () => clearInterval(interval);
  }, [user?.id, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) {
      lastMessagesCountRef.current = 0;
      return;
    }

    const hasScrolled = hasScrolledForUserRef.current[selectedUserId] || false;
    const isMessageCountChanged = lastMessagesCountRef.current !== messages.length;
    lastMessagesCountRef.current = messages.length;

    const container = chatContainerRef.current;
    if (container) {
      if (!hasScrolled && messages.length > 0) {
        // Initial load of messages: scroll instantly to bottom
        container.scrollTop = container.scrollHeight;
        hasScrolledForUserRef.current[selectedUserId] = true;
      } else if (isMessageCountChanged && messages.length > 0) {
        // Message count changed: either sent by me, or user was already near the bottom
        const lastMsg = messages[messages.length - 1];
        const sentByMe = lastMsg?.sender_id === user?.id;
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 250;

        if (sentByMe || isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages, selectedUserId, user?.id]);

  useEffect(() => {
    async function fetchUserInfo() {
      if (!selectedUserId) return;
      
      const isInContacts = contacts.some((c: any) => {
        const target = c.freelancer_id === user?.id ? c.client : c.freelancer;
        return target?.id === selectedUserId;
      });

      if (!isInContacts && !contactsLoading) {
        setLoadingNewUser(true);
        try {
          const res = await fetch(`/api/users/${selectedUserId}`);
          if (res.ok) {
            const data = await res.json();
            setNewChatUser(data.data);
          }
        } catch (err) {
          console.error("Failed to fetch new chat user info:", err);
        } finally {
          setLoadingNewUser(false);
        }
      } else {
        setNewChatUser(null);
      }
    }
    fetchUserInfo();
  }, [selectedUserId, contacts, contactsLoading, user?.id]);

  useEffect(() => {
    async function fetchProject() {
      // If we have an explicit projectId from URL, use it
      if (projectId) {
        setLoadingProject(true);
        try {
          // If the user is a freelancer, check if they already applied to this project
          if (role === "freelancer" && user?.id) {
            const { data: appliedProj } = await supabase
              .from("projects")
              .select("*, client:client_id(full_name, avatar_url)")
              .eq("freelancer_id", user.id)
              .like("description", `%[source_id:${projectId}]%`)
              .maybeSingle();

            if (appliedProj) {
              setProjectContext(appliedProj);
              setLoadingProject(false);
              return;
            }
          }

          const { data: proj } = await supabase
            .from("projects")
            .select("*, client:client_id(full_name, avatar_url)")
            .eq("id", projectId)
            .single();
          if (proj) {
            setProjectContext(proj);
            setLoadingProject(false);
            return;
          }
        } catch (err) {
          console.error("Failed to fetch project context:", err);
        }
      }

      // Otherwise, try to find the latest active/pending project between these two users
      if (selectedUserId) {
        setLoadingProject(true);
        try {
          const { data: proj } = await supabase
            .from("projects")
            .select("*, client:client_id(full_name, avatar_url)")
            .or(`and(freelancer_id.eq.${user?.id},client_id.eq.${selectedUserId}),and(freelancer_id.eq.${selectedUserId},client_id.eq.${user?.id})`)
            .neq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          setProjectContext(proj || null);
        } catch (err) {
          console.error("Failed to find related project:", err);
          setProjectContext(null);
        } finally {
          setLoadingProject(false);
        }
      } else {
        setProjectContext(null);
      }
    }
    fetchProject();
  }, [projectId, selectedUserId, user?.id, role]);

  const refetchProject = async () => {
    const idToFetch = projectContext?.id || projectId;
    if (!idToFetch) return;
    try {
      if (role === "freelancer" && user?.id && idToFetch === projectId) {
        const { data: appliedProj } = await supabase
          .from("projects")
          .select("*, client:client_id(full_name, avatar_url)")
          .eq("freelancer_id", user.id)
          .like("description", `%[source_id:${projectId}]%`)
          .maybeSingle();

        if (appliedProj) {
          setProjectContext(appliedProj);
          return;
        }
      }

      const { data: proj } = await supabase
        .from("projects")
        .select("*, client:client_id(full_name, avatar_url)")
        .eq("id", idToFetch)
        .single();
      if (proj) setProjectContext(proj);
    } catch (err) {
      console.error("Failed to refetch project context:", err);
    }
  };

  const filteredContacts = contacts.filter((c: any) => {
    const target = c.freelancer_id === user?.id ? c.client : c.freelancer;
    return target?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           target?.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedContact = contacts.find((c: any) => {
    const target = c.freelancer_id === user?.id ? c.client : c.freelancer;
    return target?.id === selectedUserId;
  });

  const selectedTarget = selectedContact 
    ? (selectedContact.freelancer_id === user?.id ? selectedContact.client : selectedContact.freelancer) 
    : newChatUser;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    try {
      // Disabled auto ensure contact on first message to allow messaging without auto-contact relationship
      await sendMessage(text);
    } catch (e) {
      setInputText(text);
      Swal.fire({ title: "Gagal", text: "Gagal mengirim pesan.", icon: "error", background: "#0F1B2E", color: "#fff" });
    }
  };

  const handleDeleteChat = async () => {
    setShowOptions(false);
    if (!selectedUserId) return;
    const result = await Swal.fire({ title: "Hapus Riwayat Chat?", text: "Semua pesan dalam percakapan ini akan dihapus permanen.", icon: "warning", showCancelButton: true, confirmButtonColor: "#FF4D6A", background: "#0F1B2E", color: "#fff" });
    if (result.isConfirmed) {
      try {
        await fetch(`/api/messages?userId=${selectedUserId}`, { method: "DELETE" });
        await refetchMessages();
        Swal.fire({ title: "Terhapus!", icon: "success", timer: 1500, showConfirmButton: false, background: "#0F1B2E", color: "#fff" });
      } catch (e: any) {
        Swal.fire({ title: "Gagal", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
      }
    }
  };

  const handleDeleteContact = async () => {
    setShowOptions(false);
    if (!selectedContact) return;
    const result = await Swal.fire({ title: "Hapus Kontak?", text: "Kontak dan seluruh riwayat pesan akan dihapus secara permanen.", icon: "warning", showCancelButton: true, confirmButtonColor: "#FF4D6A", background: "#0F1B2E", color: "#fff" });
    if (result.isConfirmed) {
      try {
        await fetch(`/api/contacts?id=${selectedContact.id}`, { method: "DELETE" });
        setSelectedUserId(null);
        await refetchContacts();
        Swal.fire({ title: "Terhapus!", icon: "success", timer: 1500, showConfirmButton: false, background: "#0F1B2E", color: "#fff" });
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

  if (!isMounted) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 140px)", background: "rgba(15, 27, 46, 0.4)", borderRadius: "24px", color: "rgba(226,232,240,0.4)" }}><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 140px)", background: "rgba(15, 27, 46, 0.4)", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.05)", overflow: "hidden" }}>
      
      {/* Sidebar */}
      <div style={{ width: "320px", borderRight: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", background: "rgba(10, 20, 45, 0.3)" }}>
        <div style={{ padding: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "16px" }}>Pesan <span className="gradient-text">Aktif</span></h2>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(226, 232, 240, 0.3)" }} />
            <input type="text" placeholder="Cari kontak..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} suppressHydrationWarning style={{ width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "10px 16px 10px 42px", color: "#fff", fontSize: "14px", outline: "none" }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 20px" }}>
          {contactsLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "rgba(226,232,240,0.4)" }}>Memuat...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {selectedUserId && !contacts.some(c => (c.freelancer_id === user?.id ? c.client : c.freelancer)?.id === selectedUserId) && newChatUser && (
                <button onClick={() => setSelectedUserId(selectedUserId)} style={{ width: "100%", padding: "12px", borderRadius: "16px", background: "rgba(77, 99, 255, 0.15)", border: "1px solid rgba(77, 99, 255, 0.3)", display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                   <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800" }}>{newChatUser.full_name?.[0]}</div>
                   <div style={{ textAlign: "left" }}>
                      <div style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>{newChatUser.full_name || "Diskusi Baru"}</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>Belum ada di kontak</div>
                   </div>
                </button>
              )}
              {filteredContacts.map((c: any) => {
                const target = c.freelancer_id === user?.id ? c.client : c.freelancer;
                const isSelected = selectedUserId === target?.id;
                const count = unreadCounts[target?.id] || 0;
                return (
                  <motion.button 
                    key={c.id} 
                    whileHover={{ background: "rgba(255,255,255,0.05)" }} 
                    onClick={() => {
                      setSelectedUserId(target?.id);
                      if (target?.id) {
                        setUnreadCounts(prev => ({ ...prev, [target.id]: 0 }));
                      }
                    }} 
                    style={{ width: "100%", padding: "12px", borderRadius: "16px", background: isSelected ? "rgba(255,255,255,0.08)" : "transparent", border: "none", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: isSelected ? "linear-gradient(135deg, #4D63FF, #06B6D4)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "16px" }}>{target?.full_name?.charAt(0) ?? "?"}</div>
                    <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>{target?.full_name || target?.email?.split('@')[0]}</span>
                        {count > 0 && (
                          <span style={{
                            background: "linear-gradient(135deg, #FF4D6A, #FF003C)",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: "900",
                            minWidth: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 5px",
                            boxShadow: "0 0 10px rgba(255, 77, 106, 0.4)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            marginLeft: "8px"
                          }}>
                            {count}
                          </span>
                        )}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{target?.email}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", background: "rgba(15, 27, 46, 0.2)" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: projectContext ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
        {selectedUserId ? (
          <>
            <div style={{ padding: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "18px" }}>{selectedTarget?.full_name?.charAt(0) ?? "?"}</div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", margin: 0 }}>{selectedTarget?.full_name || "Pengguna"}</h3>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {role === "client" && selectedTarget && (
                  <button
                    onClick={() => setShowHireModal(true)}
                    style={{
                      background: "linear-gradient(135deg, #00F2FE, #4FACFE)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 16px",
                      color: "#0f172a",
                      fontSize: "12.5px",
                      fontWeight: "750",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 4px 15px rgba(0, 242, 254, 0.3)"
                    }}
                  >
                    <Briefcase size={14} /> Tawarkan Proyek
                  </button>
                )}
                <div style={{ position: "relative" }} ref={optionsRef}>
                  <motion.button onClick={() => setShowOptions(!showOptions)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "transparent", border: "none", color: "rgba(226,232,240,0.4)", cursor: "pointer" }}><MoreVertical size={20} /></motion.button>
                  <AnimatePresence>{showOptions && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ position: "absolute", top: "100%", right: 0, width: "200px", background: "#161B22", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", zIndex: 100, padding: "8px" }}>
                      <button onClick={handleDeleteChat} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", color: "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}><Trash2 size={16} color="#FF4D6A" /> Hapus Riwayat</button>
                      {selectedContact && <button onClick={handleDeleteContact} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", color: "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}><UserMinus size={16} color="#FF4D6A" /> Hapus Kontak</button>}
                    </motion.div>
                  )}</AnimatePresence>
                </div>
              </div>
            </div>

            <div ref={chatContainerRef} style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {messages.map((m: any, i: number) => (
                <div key={m.id || i} style={{ display: "flex", flexDirection: "column", alignItems: m.sender_id === user?.id ? "flex-end" : "flex-start" }}>
                  <div style={{ 
                    maxWidth: "70%", 
                    padding: "12px 18px", 
                    borderRadius: m.sender_id === user?.id ? "20px 20px 4px 20px" : "20px 20px 20px 4px", 
                    background: m.sender_id === user?.id ? "linear-gradient(135deg, #4D63FF, #3B82F6)" : "rgba(255, 255, 255, 0.05)", 
                    color: "#fff", 
                    fontSize: "14px", 
                    lineHeight: "1.5" 
                  }}>
                    {m.content}
                  </div>
                  <span style={{ 
                    fontSize: "10px", 
                    color: "rgba(226, 232, 240, 0.3)", 
                    marginTop: "4px",
                    marginRight: m.sender_id === user?.id ? "4px" : "0",
                    marginLeft: m.sender_id === user?.id ? "0" : "4px"
                  }}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: "24px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <input value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Tulis pesan..." style={{ flex: 1, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "12px 20px", color: "#fff", outline: "none" }} />
                <button type="submit" style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--cyan)", border: "none", color: "#000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Send size={20} /></button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(226,232,240,0.2)" }}>
            <MessageSquare size={64} style={{ marginBottom: "20px", opacity: 0.2 }} />
            <p style={{ fontSize: "18px", fontWeight: "600" }}>Pilih percakapan untuk memulai</p>
          </div>
        )}
        </div>

        {projectContext && (
          <NegotiationSidebar 
            project={projectContext} 
            role={role as "client" | "freelancer"} 
            userId={user?.id || ""}
            onUpdate={refetchProject} 
          />
        )}
      </div>

      {selectedUserId && selectedTarget && (
        <HireFreelancerModal
          isOpen={showHireModal}
          onClose={() => setShowHireModal(false)}
          freelancerId={selectedUserId}
          freelancerName={selectedTarget.full_name || "Freelancer"}
          onSuccess={(newProjectId) => {
            const params = new URLSearchParams(window.location.search);
            params.set("project", newProjectId);
            router.replace(`${window.location.pathname}?${params.toString()}`);
            refetchProject();
          }}
        />
      )}
    </div>
  );
}

export default function Messages() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 140px)", background: "rgba(15, 27, 46, 0.4)", borderRadius: "24px", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 className="animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
