"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Eye,
  EyeOff,
  Briefcase,
  User2,
  Mail,
  Lock,
  UserCircle2,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

// ─── SweetAlert2 dynamic import (client only) ───────────────────────────────
async function swal(opts: object) {
  const Swal = (await import("sweetalert2")).default;
  return Swal.fire(opts as Parameters<typeof Swal.fire>[0]);
}

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Sangat Lemah", color: "#EF4444" };
  if (score === 2) return { score, label: "Lemah", color: "#F59E0B" };
  if (score === 3) return { score, label: "Sedang", color: "#EAB308" };
  if (score === 4) return { score, label: "Kuat", color: "#10B981" };
  return { score, label: "Sangat Kuat", color: "#34D399" };
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (searchParams.get("role") ?? "client") as "client" | "freelancer";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const strength = getStrength(password);

  const roleConfig = {
    client: {
      label: "Client",
      icon: <Briefcase size={18} />,
      color: "#4D63FF",
      colorSoft: "rgba(77,99,255,0.12)",
      colorBorder: "rgba(77,99,255,0.3)",
      gradient: "linear-gradient(135deg,#4D63FF,#06B6D4)",
    },
    freelancer: {
      label: "Freelancer",
      icon: <User2 size={18} />,
      color: "#10B981",
      colorSoft: "rgba(16,185,129,0.12)",
      colorBorder: "rgba(16,185,129,0.3)",
      gradient: "linear-gradient(135deg,#10B981,#06B6D4)",
    },
  }[role];

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // ── Client-side validations ──────────────────────────────────────────
      if (!fullName.trim()) {
        await swal({ icon: "warning", title: "Nama diperlukan", text: "Masukkan nama lengkap kamu.", confirmButtonColor: roleConfig.color });
        return;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        await swal({ icon: "warning", title: "Email tidak valid", text: "Masukkan alamat email yang benar.", confirmButtonColor: roleConfig.color });
        return;
      }
      if (password.length < 8) {
        await swal({ icon: "warning", title: "Password terlalu pendek", text: "Password harus minimal 8 karakter.", confirmButtonColor: roleConfig.color });
        return;
      }
      if (password !== confirmPassword) {
        await swal({ icon: "warning", title: "Password tidak cocok", text: "Pastikan password dan konfirmasi password sama.", confirmButtonColor: roleConfig.color });
        return;
      }
      if (!agreed) {
        await swal({ icon: "warning", title: "Setujui Kebijakan", text: "Kamu harus menyetujui Syarat & Ketentuan sebelum mendaftar.", confirmButtonColor: roleConfig.color });
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
          },
        });

        if (error) throw error;

        await swal({
          icon: "success",
          title: "Pendaftaran Berhasil! 🎉",
          html: `<p style="color:#94a3b8">Akun kamu berhasil dibuat.<br/>Silakan login untuk melanjutkan.</p>`,
          confirmButtonText: "Login Sekarang",
          confirmButtonColor: roleConfig.color,
        });
        router.push(`/login?role=${role}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.";
        await swal({ icon: "error", title: "Gagal Mendaftar", text: msg, confirmButtonColor: roleConfig.color });
      } finally {
        setLoading(false);
      }
    },
    [fullName, email, password, confirmPassword, agreed, role, roleConfig.color, router]
  );

  if (!mounted) return null;

  return (
    <>
      {/* ── Page wrapper ── */}
      <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>

        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(77,99,255,0.15), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)", pointerEvents: "none" }} />

        {/* ── Card ── */}
        <div style={{ background: "linear-gradient(145deg,rgba(13,21,56,0.98) 0%,rgba(10,15,40,0.98) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px 44px", maxWidth: "480px", width: "100%", position: "relative", boxShadow: "0 40px 120px rgba(0,0,0,0.7)", animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>

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
              Daftar sebagai {roleConfig.label}
            </span>
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#E2E8F0", marginBottom: "6px", letterSpacing: "-0.6px" }}>
            Buat Akun Baru
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.45)", marginBottom: "32px" }}>
            Sudah punya akun?{" "}
            <Link href={`/login?role=${role}`} style={{ color: roleConfig.color, fontWeight: "600", textDecoration: "none" }}>
              Masuk di sini
            </Link>
          </p>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-fullname" style={labelStyle}>Nama Lengkap</label>
              <div style={inputWrap}>
                <UserCircle2 size={16} style={inputIcon} />
                <input
                  id="reg-fullname"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" style={labelStyle}>Alamat Email</label>
              <div style={inputWrap}>
                <Mail size={16} style={inputIcon} />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" style={labelStyle}>Password</label>
              <div style={inputWrap}>
                <Lock size={16} style={inputIcon} />
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={eyeBtn} aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} style={{ flex: 1, height: "3px", borderRadius: "4px", background: i <= strength.score ? strength.color : "rgba(255,255,255,0.08)", transition: "background 0.3s ease" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "11px", color: strength.color, fontWeight: "600" }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" style={labelStyle}>Konfirmasi Password</label>
              <div style={inputWrap}>
                <Lock size={16} style={inputIcon} />
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "44px", borderColor: confirmPassword && confirmPassword !== password ? "rgba(239,68,68,0.5)" : undefined }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={eyeBtn} aria-label="Toggle confirm password visibility">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "5px" }}>Password tidak cocok</p>
              )}
            </div>

            {/* Terms checkbox */}
            <label htmlFor="reg-terms" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", userSelect: "none" }}>
              <div style={{ position: "relative", flexShrink: 0, marginTop: "2px" }}>
                <input
                  id="reg-terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }}
                />
                <div style={{ width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${agreed ? roleConfig.color : "rgba(255,255,255,0.2)"}`, background: agreed ? roleConfig.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                  {agreed && <ShieldCheck size={11} color="white" />}
                </div>
              </div>
              <span style={{ fontSize: "13px", color: "rgba(226,232,240,0.55)", lineHeight: "1.6" }}>
                Saya menyetujui{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: roleConfig.color, fontWeight: "600", textDecoration: "none" }}>Syarat & Ketentuan</a>
                {" "}serta{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: roleConfig.color, fontWeight: "600", textDecoration: "none" }}>Kebijakan Privasi</a>
                {" "}Freetrack.
              </span>
            </label>

            {/* Submit */}
            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              style={{ background: loading ? "rgba(255,255,255,0.06)" : roleConfig.gradient, color: "white", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s", marginTop: "4px", opacity: loading ? 0.7 : 1 }}
              onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 40px ${roleConfig.color}55`; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              {loading ? (
                <>
                  <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Mendaftarkan...
                </>
              ) : (
                <>Buat Akun <ArrowRight size={16} /></>
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
