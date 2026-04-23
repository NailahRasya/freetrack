"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, Save, CheckCircle2 } from "lucide-react";

async function swal(opts: object) {
  const Swal = (await import("sweetalert2")).default;
  return Swal.fire(opts as Parameters<typeof Swal.fire>[0]);
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      await swal({
        icon: "warning",
        title: "Password terlalu pendek",
        text: "Password harus minimal 8 karakter.",
        confirmButtonColor: "#4D63FF",
      });
      return;
    }

    if (password !== confirmPassword) {
      await swal({
        icon: "error",
        title: "Password tidak cocok",
        text: "Konfirmasi password harus sama dengan password baru.",
        confirmButtonColor: "#4D63FF",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      await swal({
        icon: "success",
        title: "Password Diperbarui! ✅",
        text: "Password kamu telah berhasil diperbarui. Silakan login kembali.",
        confirmButtonColor: "#4D63FF",
      });

      router.push("/login");
    } catch (err: any) {
      await swal({
        icon: "error",
        title: "Gagal Memperbarui Password",
        text: err.message,
        confirmButtonColor: "#4D63FF",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
        {/* Background Ornaments */}
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(77,99,255,0.15), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ background: "linear-gradient(145deg,rgba(13,21,56,0.98) 0%,rgba(10,15,40,0.98) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px 44px", maxWidth: "440px", width: "100%", position: "relative", boxShadow: "0 40px 120px rgba(0,0,0,0.7)", animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(77,99,255,0.12)", border: "1px solid rgba(77,99,255,0.3)", padding: "6px 16px", borderRadius: "50px", marginBottom: "20px" }}>
            <span style={{ color: "#4D63FF" }}><CheckCircle2 size={18} /></span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#4D63FF", letterSpacing: "0.4px" }}>
              Verifikasi Berhasil
            </span>
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#E2E8F0", marginBottom: "6px", letterSpacing: "-0.6px" }}>
            Atur Password Baru
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.45)", marginBottom: "32px" }}>
            Silakan masukkan password baru kamu di bawah ini untuk mengamankan akun kamu.
          </p>

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* New Password */}
            <div>
              <label htmlFor="password" style={labelStyle}>Password Baru</label>
              <div style={inputWrap}>
                <Lock size={16} style={inputIcon} />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={eyeBtn}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" style={labelStyle}>Konfirmasi Password</label>
              <div style={inputWrap}>
                <Lock size={16} style={inputIcon} />
                <input
                  id="confirm-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#4D63FF,#06B6D4)", color: "white", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s", opacity: loading ? 0.7 : 1 }}
              onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 40px rgba(77,99,255,0.35)`; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              {loading ? (
                <>
                  <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Menyimpan...
                </>
              ) : (
                <>Simpan Password Baru <Save size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "rgba(226,232,240,0.6)",
  marginBottom: "8px",
  letterSpacing: "0.4px",
  textTransform: "uppercase",
};

const inputWrap: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const inputIcon: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  color: "rgba(226,232,240,0.3)",
  pointerEvents: "none",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px 13px 40px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#E2E8F0",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
};

const eyeBtn: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "rgba(226,232,240,0.35)",
  display: "flex",
  alignItems: "center",
  padding: "4px",
};
