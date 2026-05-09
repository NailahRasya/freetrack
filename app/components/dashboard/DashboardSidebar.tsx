"use client";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  Flag, 
  MessageSquare, 
  Settings, 
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar, useUser } from "../../dashboard/layout";
import { useProjects } from "@/lib/hooks/useProjects";
import { supabase } from "@/lib/supabase";

/**
 * Item menu navigasi untuk sidebar dashboard.
 */
const menuItems = [
  { icon: LayoutDashboard, label: "Dasbor", href: "/dashboard" },
  { icon: Sparkles, label: "Marketplace", href: "/dashboard/market" },
  { icon: Briefcase, label: "Proyek Saya", href: "/dashboard/projects" },
  { icon: Users, label: "Kontak", href: "/dashboard/contacts" },
  { icon: Wallet, label: "Pembayaran", href: "/dashboard/payments" },
  { icon: Flag, label: "Target Pencapaian", href: "/dashboard/milestones" },
  { icon: MessageSquare, label: "Pesan", href: "/dashboard/messages" },
  { icon: User, label: "Profil Saya", href: "/dashboard/profile" },
  { icon: Settings, label: "Pengaturan", href: "/dashboard/settings" },
];

/**
 * Komponen Sidebar untuk dashboard utama, mendukung mode ciut (collapsed).
 */
export default function DashboardSidebar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const { collapsed, setCollapsed } = useSidebar();
  const { user, role } = useUser();
  const { projects } = useProjects();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Hitung awal
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };
    fetchUnread();

    // Subscribe ke pesan baru
    const channel = supabase
      .channel("unread-messages")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const hasActionableProjects = projects.some(p => 
    (role === "client" && p.status === "pending_client") ||
    (role === "freelancer" && p.status === "pending_freelancer")
  );

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-card"
      style={{
        width: collapsed ? "80px" : "260px",
        height: "calc(100vh - 32px)",
        margin: "16px",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        padding: "24px 12px",
        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        border: "1px solid var(--glass-border)",
        background: "rgba(13, 27, 62, 0.8)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Bagian Logo */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px", 
        padding: "0 12px",
        marginBottom: "40px",
        height: "32px",
        overflow: "hidden"
      }}>
        <img src="/logo_icon.png" alt="FreeTrack" style={{ height: "24px", width: "auto", flexShrink: 0 }} />
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: "18px", 
              fontWeight: "800", 
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              whiteSpace: "nowrap"
            }}
          >
            FreeTrack
          </motion.span>
        )}
      </div>

      {/* Menu Navigasi */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? (pathname === "/dashboard" || pathname === "/dashboard/client" || pathname === "/dashboard/freelancer")
            : pathname.startsWith(item.href);
          return (
            <Link 
              key={item.label} 
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                whileHover={{ x: 4, background: isActive ? "rgba(26, 54, 240, 0.15)" : "rgba(255, 255, 255, 0.05)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  position: "relative",
                  background: isActive ? "rgba(26, 54, 240, 0.1)" : "transparent",
                  color: isActive ? "var(--cyan-light)" : "rgba(226, 232, 240, 0.5)",
                  transition: "all 0.2s ease",
                }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    style={{
                      position: "absolute",
                      left: 0,
                      width: "3px",
                      height: "20px",
                      background: "var(--cyan)",
                      borderRadius: "0 4px 4px 0",
                      boxShadow: "0 0 10px var(--cyan)",
                    }}
                  />
                )}
                <item.icon size={20} style={{ flexShrink: 0 }} />
                {mounted && item.label === "Proyek Saya" && hasActionableProjects && (
                  <span style={{
                    position: "absolute",
                    top: collapsed ? "8px" : "12px",
                    left: collapsed ? "45px" : "28px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#FF4D6A",
                    boxShadow: "0 0 10px #FF4D6A",
                    zIndex: 10
                  }} />
                )}
                {mounted && item.label === "Pesan" && unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: collapsed ? "8px" : "12px",
                    left: collapsed ? "45px" : "28px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#FF4D6A",
                    boxShadow: "0 0 10px #FF4D6A",
                    zIndex: 10
                  }} />
                )}
                {!collapsed && (
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>{item.label}</span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Aksi Bawah */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ background: "rgba(255, 255, 255, 0.08)", color: "#fff" }}
          whileTap={{ scale: 0.9 }}
          suppressHydrationWarning
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "rgba(226, 232, 240, 0.4)",
            width: "100%",
            padding: "8px",
            borderRadius: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </motion.button>
      </div>
    </motion.aside>
  );
}

