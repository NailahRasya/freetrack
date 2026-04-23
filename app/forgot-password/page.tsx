"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ChevronLeft, Send } from "lucide-react";

async function swal(opts: object) {
  const Swal = (await import("sweetalert2")).default;
  return Swal.fire(opts as Parameters<typeof Swal.fire>[0]);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await swal({
        icon: "warning",
        title: "Email tidak valid",
        text: "Masukkan alamat email yang benar.",
        confirmButtonColor: "#4D63FF",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan.");
      }

      await swal({
        icon: "success",
        title: "Email Terkirim! 📧",
        text: "Silakan cek kotak masuk email kamu untuk instruksi reset password.",
        confirmButtonColor: "#4D63FF",
      });
    } catch (err: any) {
      await swal({
        icon: "error",
        title: "Gagal Mengirim Email",
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
          
          <Link href="/login" style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "6px", fontSize: "13px", color: "rgba(226,232,240,0.4)", textDecoration: "none", marginBottom: "28px", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e8f0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(226,232,240,0.4)")}
          >
            <ChevronLeft size={14} /> Kembali ke Login
          </Link>

          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#E2E8F0", marginBottom: "6px", letterSpacing: "-0.6px" }}>
            Lupa Password?
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.45)", marginBottom: "32px" }}>
            Jangan khawatir! Masukkan email kamu di bawah ini dan kami akan mengirimkan link untuk reset password.
          </p>

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label htmlFor="email" style={labelStyle}>Alamat Email</label>
              <div style={inputWrap}>
                <Mail size={16} style={inputIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
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
                  Mengirim...
                </>
              ) : (
                <>Kirim Link Reset <Send size={16} /></>
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
