"use client";

import { Search, Bell, ChevronDown, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { useUser } from "../../dashboard/layout";

export default function DashboardNavbar() {
  const [mounted, setMounted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { user, role, t } = useUser();
  
  const [currentDate, setCurrentDate] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ projects: any[], users: any[] }>({ projects: [], users: [] });
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString('id-ID', options));
  }, []);

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ projects: [], users: [] });
      setShowResults(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setShowResults(true);
      try {
        const [projRes, userRes] = await Promise.all([
          supabase.from("projects").select("id, title").ilike("title", `%${searchQuery}%`).limit(5),
          supabase.from("profiles").select("id, full_name, role").ilike("full_name", `%${searchQuery}%`).limit(5)
        ]);

        setSearchResults({
          projects: projRes.data || [],
          users: userRes.data || []
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Notifications logic
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("notifications_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleLogout = async () => {
    try {
      setShowProfile(false);
      const result = await Swal.fire({
        title: t("confirm_logout"),
        text: t("confirm_logout_text"),
        icon: "question",
        showCancelButton: true,
        confirmButtonText: t("logout"),
        cancelButtonText: t("cancel"),
        background: "#0F1B2E",
        color: "#fff",
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "rgba(255,255,255,0.1)",
        customClass: { popup: "rounded-2xl shadow-2xl border border-white/10" }
      });

      if (!result.isConfirmed) return;
      setIsLoggingOut(true);
      
      Swal.fire({
        title: t("logging_out"),
        text: t("logging_out"),
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => { Swal.showLoading(); },
        background: "#0F1B2E",
        color: "#fff",
        customClass: { popup: "rounded-2xl border border-white/10" }
      });

      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = "/";
      Swal.close();
    } catch (error: any) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const fullName = user?.profile?.full_name || "User";
  const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <header
      style={{
        height: "88px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10, 15, 30, 0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        width: "100%"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>
          Dashboard {role === "freelancer" ? "Freelancer" : "Klien"}
        </h2>
        <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", margin: "2px 0 0 0" }}>
          {mounted ? currentDate : ""}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: searchQuery ? "var(--accent)" : "rgba(226, 232, 240, 0.3)", zIndex: 1 }} />
          <input 
            type="text" 
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowResults(true)}
            autoComplete="off"
            name="search-query"
            id="search-query"
            style={{ width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "10px 12px 10px 42px", color: "#fff", fontSize: "13px", outline: "none", transition: "all 0.3s ease" }}
          />
          <AnimatePresence>
            {showResults && (
              <>
                <div onClick={() => setShowResults(false)} style={{ position: "fixed", inset: 0, zIndex: -1 }} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "320px", background: "rgba(15, 27, 46, 0.98)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", padding: "12px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)", zIndex: 1000 }}
                >
                  {isSearching ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "rgba(226,232,240,0.4)", fontSize: "13px" }}>Searching...</div>
                  ) : (searchResults.projects.length === 0 && searchResults.users.length === 0) ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "rgba(226,232,240,0.4)", fontSize: "13px" }}>No results found for "{searchQuery}"</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {searchResults.projects.length > 0 && (
                        <div>
                          <h6 style={{ fontSize: "11px", fontWeight: "900", color: "var(--accent)", textTransform: "uppercase", marginBottom: "8px", paddingLeft: "8px" }}>Projects</h6>
                          {searchResults.projects.map(p => (
                            <button key={p.id} onClick={() => { router.push(`/dashboard/marketplace?id=${p.id}`); setShowResults(false); setSearchQuery(""); }} style={{ width: "100%", textAlign: "left", padding: "8px", borderRadius: "8px", background: "transparent", border: "none", color: "#fff", cursor: "pointer" }} className="search-result-item">
                              <span style={{ fontSize: "13px", fontWeight: "600" }}>{p.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.users.length > 0 && (
                        <div>
                          <h6 style={{ fontSize: "11px", fontWeight: "900", color: "#10B981", textTransform: "uppercase", marginBottom: "8px", paddingLeft: "8px" }}>Users</h6>
                          {searchResults.users.map(u => (
                            <button key={u.id} onClick={() => { router.push(`/dashboard/profile?id=${u.id}`); setShowResults(false); setSearchQuery(""); }} style={{ width: "100%", textAlign: "left", padding: "8px", borderRadius: "8px", background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }} className="search-result-item">
                              <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#10B981", fontWeight: "700" }}>{u.full_name[0]}</div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "13px", fontWeight: "600" }}>{u.full_name}</span>
                                <span style={{ fontSize: "10px", color: "rgba(226,232,240,0.4)" }}>{u.role}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {useUser().systemNotifications && (
          <div style={{ position: "relative" }}>
            <motion.button onClick={() => setShowNotifications(!showNotifications)} whileHover={{ background: "rgba(6, 182, 212, 0.12)", scale: 1.06 }} whileTap={{ scale: 0.94 }} style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", color: unreadCount > 0 ? "var(--accent)" : "rgba(226, 232, 240, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <Bell size={20} />
              {unreadCount > 0 && <span style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", background: "#00FFA3", borderRadius: "50%", border: "2px solid #0B1220" }} />}
            </motion.button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "320px", background: "rgba(15, 27, 46, 0.98)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", zIndex: 100 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>{t("notifications")}</h4>
                    <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.4)" }}>{unreadCount} {t("unread")}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                    {notifications.length === 0 ? <p style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "rgba(226, 232, 240, 0.3)" }}>{t("no_notifications")}</p> : notifications.map((n) => (
                      <div key={n.id} onClick={() => { markAsRead(n.id); if (n.link) router.push(n.link); setShowNotifications(false); }} style={{ padding: "12px", borderRadius: "10px", background: n.is_read ? "transparent" : "rgba(255,255,255,0.03)", border: "1px solid", borderColor: n.is_read ? "transparent" : "rgba(255,255,255,0.05)", cursor: "pointer", position: "relative" }}>
                        {!n.is_read && <div style={{ position: "absolute", top: "14px", right: "12px", width: "6px", height: "6px", background: "#00FFA3", borderRadius: "50%" }} />}
                        <h5 style={{ fontSize: "13px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>{n.title}</h5>
                        <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.6)", lineHeight: "1.4" }}>{n.content}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowNotifications(false)} style={{ width: "100%", marginTop: "12px", padding: "8px", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "8px", color: "rgba(226, 232, 240, 0.6)", fontSize: "12px", cursor: "pointer" }}>{t("cancel")}</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div style={{ position: "relative" }}>
          <motion.button onClick={() => setShowProfile(!showProfile)} whileHover={{ background: "rgba(255, 255, 255, 0.07)", borderColor: "rgba(6, 182, 212, 0.3)" }} whileTap={{ scale: 0.97 }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 4px 4px 12px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", cursor: "pointer" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0" }}>{mounted ? fullName : "..."}</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff", fontSize: "12px" }}>{mounted ? initials : "?"}</div>
            <ChevronDown size={14} style={{ color: "rgba(226, 232, 240, 0.4)" }} />
          </motion.button>
          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "180px", background: "rgba(15, 27, 46, 0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "6px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", zIndex: 100 }}>
                {[
                  { icon: User, label: t("profile"), action: () => { router.push("/dashboard/profile"); setShowProfile(false); } },
                  { icon: SettingsIcon, label: t("settings"), action: () => { router.push("/dashboard/settings"); setShowProfile(false); } },
                  { icon: LogOut, label: isLoggingOut ? t("logging_out") : t("logout"), color: "#EF4444", action: handleLogout }
                ].map((item, idx) => (
                  <motion.button key={idx} whileHover={{ background: item.color ? "rgba(239, 68, 68, 0.08)" : "rgba(255, 255, 255, 0.06)", x: 3 }} whileTap={{ scale: 0.97 }} onClick={item.action} disabled={isLoggingOut} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: "transparent", border: "none", color: item.color || "rgba(226, 232, 240, 0.8)", fontSize: "13px", fontWeight: "500", cursor: "pointer", textAlign: "left" }}>
                    <item.icon size={16} />{item.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`.search-result-item:hover { background: rgba(255,255,255,0.05) !important; transform: translateX(4px); transition: all 0.2s ease; }`}</style>
    </header>
  );
}
