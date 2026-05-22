"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Globe, 
  ChevronRight, 
  LogOut, 
  Trash2, 
  Check, 
  Camera,
  Mail,
  Lock
} from "lucide-react";
import { useUser } from "../layout";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

type SettingsTab = "profile" | "appearance" | "notifications" | "security";

export default function Settings() {
  const { user, role, language, setLanguage, systemNotifications, setSystemNotifications, t } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tempLanguage, setTempLanguage] = useState<any>(language);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [tempSystemNotif, setTempSystemNotif] = useState(systemNotifications);
  
  // Security State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleLogout = async () => {
    try {
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
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    setTempLanguage(language);
  }, [language]);

  useEffect(() => {
    setTempSystemNotif(systemNotifications);
  }, [systemNotifications]);

  // Profile State
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Profile & Initialize
  useEffect(() => {
    if (user?.id) {
      setFullName(user.user_metadata?.full_name || "");
      fetch(`/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setFullName(data.data.full_name || user.user_metadata?.full_name || "");
            setBio(data.data.bio || "");
          }
        })
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [user?.id, user?.user_metadata?.full_name]);

  const handleSaveProfile = async () => {
    if (!user?.id || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          bio: bio
        })
      });

      if (res.ok) {
        Swal.fire({
          title: t("profile_updated"),
          text: t("profile_updated_desc"),
          icon: "success",
          background: "rgba(15, 27, 46, 0.95)",
          color: "#fff",
          confirmButtonColor: "var(--primary)",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-2xl shadow-glow-primary border border-white/10"
          }
        }).then(() => {
          // Refresh halaman agar perubahan Nama muncul di Navbar & Sidebar
          window.location.reload();
        });
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan profil");
      }
    } catch (err: any) {
      Swal.fire({
        title: "Gagal",
        text: err.message,
        icon: "error",
        background: "rgba(15, 27, 46, 0.95)",
        color: "#fff",
        confirmButtonColor: "var(--primary)",
        customClass: {
          popup: "rounded-2xl border border-white/10"
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      return Swal.fire({
        title: "Gagal",
        text: "Kata sandi baru minimal 6 karakter.",
        icon: "error",
        background: "rgba(15, 27, 46, 0.95)",
        color: "#fff",
        confirmButtonColor: "var(--primary)",
        customClass: {
          popup: "rounded-2xl border border-white/10"
        }
      });
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      Swal.fire({
        title: "Berhasil",
        text: "Kata sandi Anda telah diperbarui.",
        icon: "success",
        background: "rgba(15, 27, 46, 0.95)",
        color: "#fff",
        confirmButtonColor: "var(--primary)",
        customClass: {
          popup: "rounded-2xl shadow-glow-primary border border-white/10"
        }
      });
      setNewPassword("");
      setOldPassword("");
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: err.message,
        icon: "error",
        background: "rgba(15, 27, 46, 0.95)",
        color: "#fff",
        confirmButtonColor: "var(--primary)",
        customClass: {
          popup: "rounded-2xl border border-white/10"
        }
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const { value: confirmText } = await Swal.fire({
      title: "Hapus Akun Selamanya?",
      text: 'Ketik "HAPUS AKUN" untuk mengonfirmasi tindakan ini.',
      input: "text",
      inputPlaceholder: "HAPUS AKUN",
      showCancelButton: true,
      confirmButtonText: "Hapus Sekarang",
      cancelButtonText: "Batal",
      background: "rgba(15, 27, 46, 0.98)",
      color: "#fff",
      confirmButtonColor: "#EF4444",
      customClass: {
        popup: "rounded-3xl border border-white/10 shadow-2xl",
        confirmButton: "btn-primary",
        cancelButton: "btn-secondary",
        input: "swal-custom-input"
      },
      inputAttributes: {
        autocapitalize: "off"
      },
      preConfirm: (text) => {
        if (text !== "HAPUS AKUN") {
          Swal.showValidationMessage('Teks konfirmasi salah. Ketik "HAPUS AKUN"');
        }
        return text;
      }
    });

    if (confirmText === "HAPUS AKUN") {
      Swal.fire({
        title: "Menghapus...",
        text: "Mohon tunggu sementara kami menghapus data Anda.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => { Swal.showLoading(); }
      });

      try {
        const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus akun");

        await supabase.auth.signOut();
        localStorage.clear();
        window.location.href = "/";
      } catch (err: any) {
        Swal.fire({
          title: "Error",
          text: err.message,
          icon: "error",
          background: "rgba(15, 27, 46, 0.95)",
          color: "#fff"
        });
      }
    }
  };

  const handleSave = () => {
    if (activeTab === "profile") {
      handleSaveProfile();
    } else {
      if (activeTab === "appearance") {
        setLanguage(tempLanguage);
      }
      if (activeTab === "notifications") {
        setSystemNotifications(tempSystemNotif);
      }
      Swal.fire({
        title: t("profile_updated"),
        text: t("profile_updated_desc"),
        icon: "success",
        background: "rgba(15, 27, 46, 0.95)",
        color: "#fff",
        confirmButtonColor: "var(--primary)",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-2xl shadow-glow-primary border border-white/10"
        }
      });
    }
  };

  const tabs = [
    { id: "profile", label: t("my_profile"), icon: User },
    { id: "appearance", label: t("appearance"), icon: Moon },
    { id: "notifications", label: t("notifications"), icon: Bell },
    { id: "security", label: t("security"), icon: Shield },
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      {/* ... header ... */}
      
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "32px" }}>
        {/* Sidebar Nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "none",
                background: activeTab === tab.id ? "var(--glass-hover)" : "transparent",
                color: "var(--foreground)",
                opacity: activeTab === tab.id ? 1 : 0.5,
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: activeTab === tab.id ? "700" : "500"
              }}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="active-indicator" style={{ marginLeft: "auto", width: "4px", height: "16px", background: "var(--cyan)", borderRadius: "4px" }} />
              )}
            </button>
          ))}
          
          <div style={{ margin: "20px 0", height: "1px", background: "var(--glass-border)" }} />
          
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "none",
              background: "transparent",
              color: "#FF4D6A",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            <LogOut size={18} />
            {t("logout")}
          </button>
        </div>

        {/* Content Area */}
        <div className="glass-card" style={{ padding: "32px", background: "var(--glass-bg)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && (
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--foreground)", marginBottom: "24px" }}>{t("profile_info")}</h3>
                  
                  {/* ... avatar ... */}
                  <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
                    <div style={{ 
                      width: "80px", 
                      height: "80px", 
                      borderRadius: "24px", 
                      background: "linear-gradient(135deg, var(--primary), var(--cyan))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      fontWeight: "900",
                      color: "#fff",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.3)"
                    }}>
                      {(fullName || user?.user_metadata?.full_name || "User")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)}
                    </div>
                    <div>
                      <h4 style={{ color: "var(--foreground)", fontWeight: "700", marginBottom: "4px" }}>{fullName || "User"}</h4>
                      <p style={{ color: "var(--foreground)", opacity: 0.4, fontSize: "12px" }}>ID: {user?.id?.substring(0, 8)}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", color: "var(--foreground)", opacity: 0.6, fontSize: "12px", marginBottom: "8px", fontWeight: "600" }}>{t("full_name")}</label>
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", background: "rgba(128, 128, 128, 0.05)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "12px 16px", color: "var(--foreground)", fontSize: "14px", outline: "none" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", color: "var(--foreground)", opacity: 0.6, fontSize: "12px", marginBottom: "8px", fontWeight: "600" }}>{t("email")}</label>
                        <input readOnly defaultValue={user?.email || ""} style={{ width: "100%", background: "rgba(128, 128, 128, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "12px 16px", color: "var(--foreground)", opacity: 0.4, fontSize: "14px", outline: "none", cursor: "not-allowed" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", color: "var(--foreground)", opacity: 0.6, fontSize: "12px", marginBottom: "8px", fontWeight: "600" }}>{t("role")}</label>
                        <input readOnly value={role === 'client' ? 'Client' : 'Freelancer'} style={{ width: "100%", background: "rgba(128, 128, 128, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "12px 16px", color: role === 'client' ? 'var(--primary-light)' : 'var(--accent-light)', fontWeight: "700", fontSize: "14px", outline: "none", cursor: "not-allowed", textTransform: "capitalize" }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", color: "var(--foreground)", opacity: 0.6, fontSize: "12px", marginBottom: "8px", fontWeight: "600" }}>{t("bio")}</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("bio_placeholder")} style={{ width: "100%", background: "rgba(128, 128, 128, 0.05)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "12px 16px", color: "var(--foreground)", fontSize: "14px", outline: "none", minHeight: "100px", resize: "none" }} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--foreground)", marginBottom: "24px" }}>Tampilan Aplikasi</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                          <h4 style={{ color: "var(--foreground)", fontWeight: "700" }}>Mode Gelap (Dark Mode)</h4>
                          <span style={{ fontSize: "10px", padding: "2px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "6px", color: "var(--foreground)", opacity: 0.5 }}>Segera Hadir</span>
                        </div>
                        <p style={{ color: "var(--foreground)", opacity: 0.4, fontSize: "12px" }}>Gunakan tema gelap yang nyaman di mata untuk bekerja.</p>
                      </div>
                      <div 
                        style={{ 
                          width: "52px", 
                          height: "28px", 
                          borderRadius: "20px", 
                          background: "rgba(128, 128, 128, 0.1)", 
                          position: "relative",
                          cursor: "not-allowed",
                          transition: "0.3s"
                        }}
                      >
                        <motion.div 
                          animate={{ x: 26 }}
                          style={{ 
                            width: "20px", 
                            height: "20px", 
                            borderRadius: "50%", 
                            background: "rgba(255,255,255,0.2)", 
                            position: "absolute", 
                            top: "4px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                          }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "40px", maxWidth: "600px" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: "var(--foreground)", fontWeight: "700", marginBottom: "4px" }}>{t("language")}</h4>
                        <p style={{ color: "var(--foreground)", opacity: 0.4, fontSize: "12px" }}>{t("language_desc")}</p>
                      </div>
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={() => setShowLangDropdown(!showLangDropdown)}
                          style={{
                            minWidth: "220px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            padding: "12px 16px",
                            borderRadius: "14px",
                            background: "var(--glass-bg)",
                            border: "1px solid var(--glass-border)",
                            color: "var(--foreground)",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
                            <Globe size={16} className="text-primary" />
                            {tempLanguage === "id" ? "Bahasa Indonesia" : "English"}
                          </div>
                          <ChevronRight size={16} style={{ transform: showLangDropdown ? "rotate(90deg)" : "none", transition: "0.3s", opacity: 0.5, marginLeft: "8px" }} />
                        </button>

                        <AnimatePresence>
                          {showLangDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              style={{
                                position: "absolute",
                                top: "calc(100% + 8px)",
                                right: 0,
                                minWidth: "220px",
                                background: "rgba(15, 27, 46, 0.98)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "14px",
                                padding: "6px",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                                zIndex: 100
                              }}
                            >
                              {[
                                { id: "id", label: "Bahasa Indonesia" },
                                { id: "en", label: "English" }
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => {
                                    setTempLanguage(opt.id);
                                    setShowLangDropdown(false);
                                  }}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    background: tempLanguage === opt.id ? "rgba(77, 99, 255, 0.1)" : "transparent",
                                    border: "none",
                                    color: tempLanguage === opt.id ? "var(--primary-light)" : "var(--foreground)",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "0.2s",
                                    whiteSpace: "nowrap",
                                    gap: "12px"
                                  }}
                                >
                                  {opt.label}
                                  {tempLanguage === opt.id && <Check size={14} />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--foreground)", marginBottom: "24px" }}>{t("notifications")}</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {[
                      { id: "system", title: t("system_notifications"), desc: t("system_notifications_desc"), state: tempSystemNotif, setter: setTempSystemNotif }
                    ].map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ color: "var(--foreground)", fontWeight: "700", marginBottom: "4px" }}>{item.title}</h4>
                          <p style={{ color: "var(--foreground)", opacity: 0.4, fontSize: "12px" }}>{item.desc}</p>
                        </div>
                        <div 
                          onClick={() => item.setter(!item.state)}
                          style={{ 
                            width: "52px", 
                            height: "28px", 
                            borderRadius: "20px", 
                            background: item.state ? "var(--primary-light)" : "rgba(128, 128, 128, 0.2)", 
                            position: "relative",
                            cursor: "pointer",
                            transition: "0.3s"
                          }}
                        >
                          <motion.div 
                            animate={{ x: item.state ? 26 : 4 }}
                            style={{ 
                              width: "20px", 
                              height: "20px", 
                              borderRadius: "50%", 
                              background: "#fff", 
                              position: "absolute", 
                              top: "4px"
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--foreground)", marginBottom: "24px" }}>Keamanan Akun</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ padding: "20px", background: "rgba(128, 128, 128, 0.05)", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <Lock size={18} style={{ color: "var(--warning)" }} />
                        <h4 style={{ color: "var(--foreground)", fontWeight: "700" }}>Ganti Kata Sandi</h4>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <input 
                          type="password" 
                          placeholder="Kata sandi lama" 
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          autoComplete="new-password"
                          style={{ width: "100%", background: "rgba(128, 128, 128, 0.05)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "10px 16px", color: "var(--foreground)", fontSize: "14px", outline: "none" }} 
                        />
                        <input 
                          type="password" 
                          placeholder="Kata sandi baru" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="new-password"
                          style={{ width: "100%", background: "rgba(128, 128, 128, 0.05)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "10px 16px", color: "var(--foreground)", fontSize: "14px", outline: "none" }} 
                        />
                        <button 
                          onClick={handleUpdatePassword}
                          disabled={isUpdatingPassword}
                          className="btn-secondary" 
                          style={{ marginTop: "8px", padding: "10px 24px", fontSize: "13px", opacity: isUpdatingPassword ? 0.7 : 1 }}
                        >
                          {isUpdatingPassword ? "Memperbarui..." : "Update Kata Sandi"}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <h4 style={{ color: "#FF4D6A", fontWeight: "700", marginBottom: "8px" }}>Zona Berbahaya</h4>
                      <p style={{ color: "var(--foreground)", opacity: 0.4, fontSize: "12px", marginBottom: "16px" }}>Hapus akun Anda secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
                      <button 
                        onClick={handleDeleteAccount}
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "8px", 
                          background: "rgba(239, 68, 68, 0.1)", 
                          color: "#EF4444", 
                          border: "1px solid rgba(239, 68, 68, 0.2)", 
                          padding: "10px 20px", 
                          borderRadius: "10px", 
                          fontSize: "13px", 
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        <Trash2 size={16} /> Hapus Akun Selamanya
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: "40px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button className="btn-secondary" style={{ padding: "12px 24px" }}>{t("cancel")}</button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="btn-primary" 
                  style={{ 
                    padding: "12px 32px",
                    opacity: isSaving ? 0.7 : 1,
                    cursor: isSaving ? "not-allowed" : "pointer"
                  }}
                >
                  {isSaving ? t("saving") : t("save_changes")}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
