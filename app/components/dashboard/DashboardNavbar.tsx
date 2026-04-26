"use client";

import { Search, Bell, ChevronDown, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

export default function DashboardNavbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setShowProfile(false);
      
      // Validasi Konfirmasi Logout menggunakan SweetAlert2
      const result = await Swal.fire({
        title: "Konfirmasi Logout",
        text: "Apakah anda yakin ingin keluar dari sistem?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Logout",
        cancelButtonText: "Batal",
        background: "#0F1B2E",
        color: "#fff",
        confirmButtonColor: "#EF4444", // Warna merah untuk aksi destruktif
        cancelButtonColor: "rgba(255,255,255,0.1)",
        customClass: {
          popup: "glass-card",
        }
      });

      // Jika user membatalkan, hentikan proses
      if (!result.isConfirmed) return;

      setIsLoggingOut(true);
      
      // Tampilkan loading state menggunakan SweetAlert2 untuk pengalaman premium
      Swal.fire({
        title: "Logging out...",
        text: "Please wait while we secure your session.",
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
      
      // Bersihkan local storage untuk memastikan tidak ada data tersisa
      localStorage.clear();

      // Gunakan window.location agar halaman refresh total dan state auth benar-benar bersih
      window.location.href = "/login";
      
      Swal.close();
    } catch (error: any) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: error.message || "An unexpected error occurred.",
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
      {/* Search Bar - Responsive width */}
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
          placeholder="Search..."
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
          onFocus={(e) => {
            e.target.style.borderColor = "var(--cyan)";
            e.target.style.background = "rgba(255, 255, 255, 0.05)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
            e.target.style.background = "rgba(255, 255, 255, 0.03)";
          }}
        />
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 20px)", flexShrink: 0 }}>
        {/* Notifications */}
        <motion.button
          whileHover={{ 
            background: "rgba(6, 182, 212, 0.12)",
            borderColor: "rgba(6, 182, 212, 0.4)",
            color: "#22D3EE",
            scale: 1.06
          }}
          whileTap={{ scale: 0.94 }}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "rgba(226, 232, 240, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s ease, border-color 0.2s ease"
          }}
        >
          <Bell size={20} />
          <span style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "8px",
            height: "8px",
            background: "var(--accent)",
            borderRadius: "50%",
            border: "2px solid #0B1220",
            boxShadow: "0 0 10px var(--accent)"
          }} />
        </motion.button>

        {/* User Profile */}
        <div style={{ position: "relative" }}>
          <motion.button
            onClick={() => setShowProfile(!showProfile)}
            whileHover={{ 
              background: "rgba(255, 255, 255, 0.07)",
              borderColor: "rgba(6, 182, 212, 0.3)"
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "4px 4px 4px 12px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              cursor: "pointer",
              transition: "background 0.2s ease, border-color 0.2s ease"
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0", display: "none" }} className="desktop-only">Alex Rivera</span>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              color: "#fff",
              fontSize: "12px"
            }}>
              AR
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
                  { icon: User, label: "Profile", action: () => {} },
                  { icon: SettingsIcon, label: "Settings", action: () => {} },
                  { icon: LogOut, label: isLoggingOut ? "Logging out..." : "Logout", color: "#EF4444", action: handleLogout }
                ].map((item, idx) => (
                  <motion.button
                    onClick={() => {
                      if (item.label === "Logout") {
                        handleLogout();
                      }
                    }}
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
                      cursor: isLoggingOut && item.label.includes("Log") ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      opacity: isLoggingOut && item.label.includes("Log") ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => { if (!isLoggingOut) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)" }}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
      <style jsx>{`
        @media (min-width: 1024px) {
          .desktop-only { display: block !important; }
        }
      `}</style>
    </header>
  );
}
