"use client"; // Menandakan bahwa komponen ini adalah Client Component

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Mengimpor klien Supabase yang sudah dikonfigurasi
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Briefcase,
  User2,
  ArrowRight,
  ChevronLeft,
} from "lucide-react"; // Mengimpor ikon dari lucide-react
import PolicyModal from "../components/PolicyModal";

// Fungsi pembantu untuk memuat SweetAlert2 secara dinamis (hanya di sisi klien)
async function swal(opts: object) {
  const Swal = (await import("sweetalert2")).default;
  return Swal.fire(opts as Parameters<typeof Swal.fire>[0]);
}

export default function LoginPage() {
  const searchParams = useSearchParams(); // Mengambil parameter pencarian dari URL
  const router = useRouter(); // Hook untuk navigasi antar halaman
  // Mengambil role dari URL (default: client), digunakan untuk menyesuaikan tema UI
  const role = (searchParams.get("role") ?? "client") as "client" | "freelancer";

  // State untuk menyimpan input form dan status UI
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false); // Mengatur visibilitas password
  const [loading, setLoading] = useState(false); // Menandakan status loading saat proses login
  const [mounted, setMounted] = useState(false); // Memastikan komponen sudah terpasang di browser
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyType, setPolicyType] = useState<"terms" | "privacy">("terms");

  // Mengatur mounted menjadi true setelah komponen dirender pertama kali
  useEffect(() => setMounted(true), []);

  // Konfigurasi UI berdasarkan role (Client atau Freelancer)
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

  // Handler untuk proses pengiriman form login
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault(); // Mencegah reload halaman secara default

      // Validasi input email dan password
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        await swal({ icon: "warning", title: "Email tidak valid", text: "Masukkan alamat email yang benar.", confirmButtonColor: roleConfig.color });
        return;
      }
      if (password.length < 8) {
        await swal({ icon: "warning", title: "Password terlalu pendek", text: "Password harus minimal 8 karakter.", confirmButtonColor: roleConfig.color });
        return;
      }

      setLoading(true); // Memulai status loading
      try {
        // Panggil API Route untuk login + validasi role di sisi server
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Terjadi kesalahan saat login.");
        }

        // Set session di browser menggunakan token yang dikembalikan API
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });

        if (sessionError) throw sessionError;

        // Menampilkan notifikasi sukses menggunakan SweetAlert2
        await swal({
          icon: "success",
          title: "Selamat datang! 👋",
          html: `<p style="color:#94a3b8">Login berhasil sebagai <b>${roleConfig.label}</b>. Mengarahkan...</p>`,
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Mengarahkan user ke dashboard yang sesuai
        router.push(roleConfig.dashboard);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
        await swal({ 
          icon: "error", 
          title: "Login Gagal", 
          text: msg, 
          confirmButtonColor: roleConfig.color 
        });
      } finally {
        setLoading(false); // Menghentikan status loading
      }
    },
    [email, password, role, roleConfig.color, roleConfig.dashboard, router]
  );

  // Menghindari rendering di sisi server untuk mencegah hidrasi yang tidak cocok
  if (!mounted) return null;

  return (
    <>
      {/* Wrapper utama halaman dengan styling background gelap */}
      <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>

        {/* Ornamen dekoratif (lingkaran gradasi) di latar belakang */}
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(77,99,255,0.15), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)", pointerEvents: "none" }} />

        {/* Kartu Login utama */}
        <div style={{ background: "linear-gradient(145deg,rgba(13,21,56,0.98) 0%,rgba(10,15,40,0.98) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px 44px", maxWidth: "440px", width: "100%", position: "relative", boxShadow: "0 40px 120px rgba(0,0,0,0.7)", animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>

          {/* Navigasi kembali ke halaman beranda */}
          <Link href="/" style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "6px", fontSize: "13px", color: "rgba(226,232,240,0.4)", textDecoration: "none", marginBottom: "28px", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e8f0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(226,232,240,0.4)")}
          >
            <ChevronLeft size={14} /> Kembali ke beranda
          </Link>

          {/* Badge penunjuk role yang sedang aktif saat ini */}
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

          {/* Form Login */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Input untuk Alamat Email */}
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

            {/* Input untuk Password dengan toggle visibilitas */}
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
                {/* Tombol untuk menampilkan/menyembunyikan password */}
                <button type="button" onClick={() => setShowPw(!showPw)} style={eyeBtn} aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Tautan ke Syarat & Ketentuan */}
            <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.25)", textAlign: "center", margin: "0" }}>
              Dengan masuk, kamu menyetujui{" "}
              <button 
                type="button"
                onClick={() => { setPolicyType("terms"); setIsPolicyOpen(true); }}
                style={{ background: "none", border: "none", padding: 0, color: "rgba(226,232,240,0.4)", textDecoration: "underline", fontSize: "12px", cursor: "pointer" }}
              >
                Syarat & Ketentuan
              </button>{" "}kami.
            </p>

            {/* Tombol Submit untuk login */}
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
                  {/* Animasi spinner saat loading */}
                  <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Masuk...
                </>
              ) : (
                <>Masuk ke Akun <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Tautan untuk kembali mendaftar atau berganti role login */}
          <div style={{ marginTop: "24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "10px" }}>
             <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.45)", margin: 0 }}>
              Butuh akun baru? {" "}
              <Link href={`/register?role=${role}`} style={{ color: roleConfig.color, fontWeight: "600", textDecoration: "none" }}>
                Daftar di sini
              </Link>
            </p>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", width: "60px", margin: "8px auto" }} />
            <p style={{ fontSize: "12px", color: "rgba(226,232,240,0.25)", margin: 0 }}>
              Bukan {roleConfig.label}? {" "}
              <Link 
                href={`/login?role=${role === "client" ? "freelancer" : "client"}`} 
                style={{ color: "rgba(226,232,240,0.45)", textDecoration: "underline" }}
              >
                Masuk sebagai {role === "client" ? "Freelancer" : "Client"}
              </Link>
            </p>
          </div>
        </div>
        
        {/* Modal untuk menampilkan kebijakan formalitas */}
        <PolicyModal 
          isOpen={isPolicyOpen} 
          onClose={() => setIsPolicyOpen(false)} 
          type={policyType} 
        />
      </div>

      {/* Definisi animasi CSS */}
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

// ─── Token style yang dibagikan antar elemen ─────────────────────────────────
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
