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
  useEffect(() => { setMounted(true); }, []);
  
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
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

    // Subscribe to new notifications
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const fullName = user?.profile?.full_name || "User";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleLogout = async () => {
    try {
      setShowProfile(false);
      
      const result = await Swal.fire({
        title: "Konfirmasi Logout",
        text: "Apakah anda yakin ingin keluar dari sistem?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Logout",
        cancelButtonText: "Batal",
        background: "#0F1B2E",
        color: "#fff",
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "rgba(255,255,255,0.1)",
        customClass: {
          popup: "glass-card",
        }
      });

      if (!result.isConfirmed) return;

      setIsLoggingOut(true);
      
      Swal.fire({
        title: "Sedang keluar...",
        text: "Mohon tunggu sementara kami mengamankan sesi Anda.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
        background: "#0F1B2E",
        color: "#fff",
        customClass: {
          popup: "glass-card",
        }
      });

      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = "/";
      Swal.close();
    } catch (error: any) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      Swal.fire({
        icon: "error",
        title: "Gagal Keluar",
        text: error.message || "Terjadi kesalahan yang tidak terduga.",
        background: "#0F1B2E",
        color: "#fff",
      });
    }
  };

  return (
    <header
      style={{
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(16px, 3vw, 32px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(10, 15, 30, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        width: "100%"
      }}
    >
      {/* Search Bar */}
      <div style={{ position: "relative", width: "100%", maxWidth: "400px", marginRight: "20px" }}>
        <Search 
          size={18} 
          style={{ 
            position: "absolute", 
            left: "16px", 
            top: "50%", 
            transform: "translateY(-50%)",
            color: "rgba(226, 232, 240, 0.3)"
          }} 
        />
        <input 
          type="text" 
          placeholder="Cari..."
          suppressHydrationWarning
          style={{
            width: "100%",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "10px 16px 10px 44px",
            color: "#fff",
            fontSize: "14px",
            outline: "none",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 20px)", flexShrink: 0 }}>
        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            whileHover={{ 
              background: "rgba(6, 182, 212, 0.12)",
              scale: 1.06
            }}
            whileTap={{ scale: 0.94 }}
            suppressHydrationWarning
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: unreadCount > 0 ? "var(--accent)" : "rgba(226, 232, 240, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative"
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "8px",
                height: "8px",
                background: "#00FFA3", // Green dot
                borderRadius: "50%",
                border: "2px solid #0B1220"
              }} />
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  right: 0,
                  width: "320px",
                  background: "rgba(15, 27, 46, 0.98)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "16px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                  zIndex: 100
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>Notifikasi</h4>
                  <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.4)" }}>{unreadCount} Belum dibaca</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "rgba(226, 232, 240, 0.3)" }}>Belum ada notifikasi.</p>
                  ) : notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link) router.push(n.link);
                        setShowNotifications(false);
                      }}
                      style={{ 
                        padding: "12px", 
                        borderRadius: "10px", 
                        background: n.is_read ? "transparent" : "rgba(255,255,255,0.03)",
                        border: "1px solid",
                        borderColor: n.is_read ? "transparent" : "rgba(255,255,255,0.05)",
                        cursor: "pointer",
                        position: "relative"
                      }}
                    >
                      {!n.is_read && (
                        <div style={{ position: "absolute", top: "14px", right: "12px", width: "6px", height: "6px", background: "#00FFA3", borderRadius: "50%" }} />
                      )}
                      <h5 style={{ fontSize: "13px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>{n.title}</h5>
                      <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.6)", lineHeight: "1.4" }}>{n.content}</p>
                      <div style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)", marginTop: "6px" }}>
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowNotifications(false)}
                  style={{ width: "100%", marginTop: "12px", padding: "8px", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "8px", color: "rgba(226, 232, 240, 0.6)", fontSize: "12px", cursor: "pointer" }}
                >
                  Tutup
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div style={{ position: "relative" }}>
          <motion.button
            onClick={() => setShowProfile(!showProfile)}
            whileHover={{ 
              background: "rgba(255, 255, 255, 0.07)",
              borderColor: "rgba(6, 182, 212, 0.3)"
            }}
            whileTap={{ scale: 0.97 }}
            suppressHydrationWarning
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "4px 4px 4px 12px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              cursor: "pointer"
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0" }}>{mounted ? fullName : "..."}</span>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              color: "#fff",
              fontSize: "12px"
            }}>
              {mounted ? initials : "?"}
            </div>
            <ChevronDown size={14} style={{ color: "rgba(226, 232, 240, 0.4)" }} />
          </motion.button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  right: 0,
                  width: "180px",
                  background: "rgba(15, 27, 46, 0.95)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  padding: "6px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  zIndex: 100
                }}
              >
                {[
                  { icon: User, label: "Profil", action: () => { router.push("/dashboard/profile"); setShowProfile(false); } },
                  { icon: SettingsIcon, label: "Pengaturan", action: () => { router.push("/dashboard/settings"); setShowProfile(false); } },
                  { icon: LogOut, label: isLoggingOut ? "Sedang keluar..." : "Keluar", color: "#EF4444", action: handleLogout }
                ].map((item, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ 
                      background: item.color 
                        ? "rgba(239, 68, 68, 0.08)" 
                        : "rgba(255, 255, 255, 0.06)",
                      x: 3
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={item.action}
                    disabled={isLoggingOut}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      background: "transparent",
                      border: "none",
                      color: item.color || "rgba(226, 232, 240, 0.8)",
                      fontSize: "13px",
                      fontWeight: "500",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
