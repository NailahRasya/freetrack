"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Briefcase,
  User2,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

// ─── SweetAlert2 dynamic import (client only) ───────────────────────────────
async function swal(opts: object) {
  const Swal = (await import("sweetalert2")).default;
  return Swal.fire(opts as Parameters<typeof Swal.fire>[0]);
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (searchParams.get("role") ?? "client") as "client" | "freelancer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const roleConfig = {
    client: {
      label: "Client",
      icon: <Briefcase size={18} />,
      color: "#4D63FF",
      colorSoft: "rgba(77,99,255,0.12)",
      colorBorder: "rgba(77,99,255,0.3)",
      gradient: "linear-gradient(135deg,#4D63FF,#06B6D4)",
      dashboard: "/dashboard/client",
    },
    freelancer: {
      label: "Freelancer",
      icon: <User2 size={18} />,
      color: "#10B981",
      colorSoft: "rgba(16,185,129,0.12)",
      colorBorder: "rgba(16,185,129,0.3)",
      gradient: "linear-gradient(135deg,#10B981,#06B6D4)",
      dashboard: "/dashboard/freelancer",
    },
  }[role];

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // ── Validations ────────────────────────────────────────────────────────
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        await swal({ icon: "warning", title: "Email tidak valid", text: "Masukkan alamat email yang benar.", confirmButtonColor: roleConfig.color });
        return;
      }
      if (password.length < 8) {
        await swal({ icon: "warning", title: "Password terlalu pendek", text: "Password harus minimal 8 karakter.", confirmButtonColor: roleConfig.color });
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;
        if (!data.user) throw new Error("Login gagal, coba lagi.");

        await swal({
          icon: "success",
          title: "Selamat datang! 👋",
          html: `<p style="color:#94a3b8">Login berhasil. Mengarahkan ke dashboard...</p>`,
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Redirect based on role stored in user metadata
        const userRole = data.user.user_metadata?.role ?? role;
        router.push(`/dashboard/${userRole}`);
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : "Terjadi kesalahan.";
        // Friendlier error messages for common Supabase Auth errors
        const msg =
          raw.toLowerCase().includes("invalid login credentials")
            ? "Email atau password salah. Periksa kembali."
            : raw.toLowerCase().includes("email not confirmed")
            ? "Email belum dikonfirmasi. Cek kotak masuk kamu."
            : raw;

        await swal({ icon: "error", title: "Login Gagal", text: msg, confirmButtonColor: roleConfig.color });
      } finally {
        setLoading(false);
      }
    },
    [email, password, role, roleConfig.color, router]
  );

  if (!mounted) return null;

  return (
    <>
      {/* ── Page wrapper ── */}
      <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>

        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(77,99,255,0.15), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)", pointerEvents: "none" }} />

        {/* ── Card ── */}
        <div style={{ background: "linear-gradient(145deg,rgba(13,21,56,0.98) 0%,rgba(10,15,40,0.98) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px 44px", maxWidth: "440px", width: "100%", position: "relative", boxShadow: "0 40px 120px rgba(0,0,0,0.7)", animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>

          {/* Back */}
          <Link href="/" style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "6px", fontSize: "13px", color: "rgba(226,232,240,0.4)", textDecoration: "none", marginBottom: "28px", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e8f0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(226,232,240,0.4)")}
          >
            <ChevronLeft size={14} /> Kembali ke beranda
          </Link>

          {/* Role badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: roleConfig.colorSoft, border: `1px solid ${roleConfig.colorBorder}`, padding: "6px 16px", borderRadius: "50px", marginBottom: "20px" }}>
            <span style={{ color: roleConfig.color }}>{roleConfig.icon}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: roleConfig.color, letterSpacing: "0.4px" }}>
              Masuk sebagai {roleConfig.label}
            </span>
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#E2E8F0", marginBottom: "6px", letterSpacing: "-0.6px" }}>
            Selamat Datang Kembali
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.45)", marginBottom: "32px" }}>
            Belum punya akun?{" "}
            <Link href={`/register?role=${role}`} style={{ color: roleConfig.color, fontWeight: "600", textDecoration: "none" }}>
              Daftar sekarang
            </Link>
          </p>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Email */}
            <div>
              <label htmlFor="login-email" style={labelStyle}>Alamat Email</label>
              <div style={inputWrap}>
                <Mail size={16} style={inputIcon} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <a href="/forgot-password" style={{ fontSize: "12px", color: roleConfig.color, textDecoration: "none", fontWeight: "600" }}>
                  Lupa password?
                </a>
              </div>
              <div style={inputWrap}>
                <Lock size={16} style={inputIcon} />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={eyeBtn} aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Divider hint */}
            <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.25)", textAlign: "center", margin: "0" }}>
              Dengan masuk, kamu menyetujui{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(226,232,240,0.4)", textDecoration: "underline" }}>Syarat & Ketentuan</a>{" "}kami.
            </p>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{ background: loading ? "rgba(255,255,255,0.06)" : roleConfig.gradient, color: "white", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s", opacity: loading ? 0.7 : 1 }}
              onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 40px ${roleConfig.color}55`; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              {loading ? (
                <>
                  <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Masuk...
                </>
              ) : (
                <>Masuk ke Akun <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Switch role */}
          <div style={{ marginTop: "24px", padding: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.3)", marginBottom: "8px" }}>
              Masuk sebagai role berbeda?
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <Link
                href="/login?role=client"
                style={{ fontSize: "12px", fontWeight: "600", color: role === "client" ? "#4D63FF" : "rgba(226,232,240,0.35)", padding: "5px 14px", borderRadius: "8px", background: role === "client" ? "rgba(77,99,255,0.12)" : "transparent", border: `1px solid ${role === "client" ? "rgba(77,99,255,0.3)" : "transparent"}`, textDecoration: "none", transition: "all 0.2s" }}
              >
                Client
              </Link>
              <Link
                href="/login?role=freelancer"
                style={{ fontSize: "12px", fontWeight: "600", color: role === "freelancer" ? "#10B981" : "rgba(226,232,240,0.35)", padding: "5px 14px", borderRadius: "8px", background: role === "freelancer" ? "rgba(16,185,129,0.12)" : "transparent", border: `1px solid ${role === "freelancer" ? "rgba(16,185,129,0.3)" : "transparent"}`, textDecoration: "none", transition: "all 0.2s" }}
              >
                Freelancer
              </Link>
            </div>
          </div>
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
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(13,21,56,0.98) inset;
          -webkit-text-fill-color: #e2e8f0;
          caret-color: #e2e8f0;
        }
      `}</style>
    </>
  );
}

// ─── Shared style tokens ────────────────────────────────────────────────────
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
  transition: "color 0.2s",
};
