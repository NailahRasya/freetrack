"use client";

import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  Flag, 
  MessageSquare, 
  Settings, 
  PlusCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../dashboard/layout";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Briefcase, label: "My Projects", href: "/dashboard/projects" },
  { icon: Wallet, label: "Payments", href: "/dashboard/payments" },
  { icon: Flag, label: "Milestones", href: "/dashboard/milestones" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();

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
      {/* Logo Section */}
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

      {/* Navigation Menu */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" || pathname === "/dashboard/client" || pathname === "/dashboard/freelancer"
            : pathname.startsWith(item.href);
          return (
            <Link 
              key={item.label} 
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
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
                {!collapsed && (
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>{item.label}</span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        {!collapsed ? (
          <button 
            className="btn-primary"
            style={{ 
              width: "100%", 
              justifyContent: "center", 
              padding: "12px", 
              fontSize: "14px",
              boxShadow: "0 0 20px rgba(26, 54, 240, 0.3)"
            }}
          >
            <PlusCircle size={18} />
            <span>Create Project</span>
          </button>
        ) : (
          <button 
            className="btn-primary"
            style={{ 
              width: "48px", 
              height: "48px",
              padding: "0",
              justifyContent: "center",
              margin: "0 auto"
            }}
          >
            <PlusCircle size={24} />
          </button>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
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
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(226, 232, 240, 0.4)")}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
