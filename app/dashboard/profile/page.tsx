"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Camera, Save, Loader2 } from "lucide-react";
import { useUser } from "../layout";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const { user, role, loading: userLoading } = useUser();
  const [fullName, setFullName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.full_name || "");
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!fullName.trim()) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", user.id);

      if (error) throw error;

      await Swal.fire({
        icon: "success",
        title: "Profil Diperbarui",
        text: "Nama Anda telah berhasil diperbarui.",
        background: "#0F1B2E",
        color: "#fff",
        confirmButtonColor: "#4D63FF"
      });
      window.location.reload();
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: e.message,
        background: "#0F1B2E",
        color: "#fff",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (userLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", color: "rgba(226,232,240,0.4)" }}>
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", marginBottom: "8px" }}>
          Profil <span className="gradient-text">Saya</span>
        </h1>
        <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "15px", marginBottom: "32px" }}>
          Kelola informasi profil dan identitas Anda
        </p>

        <div className="glass-card" style={{ padding: "40px", background: "rgba(15,27,46,0.4)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Avatar Section */}
            <div style={{ textAlign: "center" }}>
              <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 16px" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "32px", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", fontWeight: "800", color: "#fff" }}>
                  {fullName?.charAt(0).toUpperCase() || "?"}
                </div>
                <button style={{ position: "absolute", bottom: "-8px", right: "-8px", width: "36px", height: "36px", borderRadius: "12px", background: "#4D63FF", border: "4px solid #0B1220", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Camera size={16} />
                </button>
              </div>
              <div style={{ padding: "4px 12px", background: "rgba(77, 99, 255, 0.1)", borderRadius: "20px", border: "1px solid rgba(77, 99, 255, 0.2)", fontSize: "12px", fontWeight: "700", color: "#4D63FF", textTransform: "uppercase" }}>
                {role}
              </div>
            </div>

            {/* Form Section */}
            <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Nama Lengkap</label>
                <div style={{ position: "relative" }}>
                  <User size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(226,232,240,0.2)" }} />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "12px 16px 12px 48px", color: "#fff", fontSize: "15px", outline: "none" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Alamat Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(226,232,240,0.2)" }} />
                  <input type="text" value={user?.email || ""} disabled
                    style={{ width: "100%", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "12px 16px 12px 48px", color: "rgba(226,232,240,0.4)", fontSize: "15px", cursor: "not-allowed" }} />
                </div>
                <p style={{ fontSize: "11px", color: "rgba(226,232,240,0.2)", marginTop: "6px" }}>Email tidak dapat diubah untuk keamanan akun</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Role Akun</label>
                <div style={{ position: "relative" }}>
                  <Shield size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(226,232,240,0.2)" }} />
                  <input type="text" value={role === "freelancer" ? "Freelancer Professional" : "Client / Business Owner"} disabled
                    style={{ width: "100%", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "12px 16px 12px 48px", color: "rgba(226,232,240,0.4)", fontSize: "15px", cursor: "not-allowed" }} />
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleUpdate} disabled={updating}
                className="btn-primary" style={{ marginTop: "12px", padding: "14px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: "700" }}>
                {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Simpan Perubahan
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
