"use client";

import Link from "next/link";
import { AlertCircle, ChevronLeft, RefreshCcw } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Background Ornaments */}
      <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(239,68,68,0.1), transparent 70%)", pointerEvents: "none" }} />
      
      <div style={{ background: "linear-gradient(145deg,rgba(13,21,56,0.98) 0%,rgba(10,15,40,0.98) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px 44px", maxWidth: "480px", width: "100%", position: "relative", textAlign: "center", boxShadow: "0 40px 120px rgba(0,0,0,0.7)" }}>
        
        <div style={{ width: "64px", height: "64px", background: "rgba(239,68,68,0.1)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#EF4444" }}>
          <AlertCircle size={32} />
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#E2E8F0", marginBottom: "12px", letterSpacing: "-0.5px" }}>
          Autentikasi Gagal
        </h1>
        
        <p style={{ fontSize: "15px", color: "rgba(226,232,240,0.5)", marginBottom: "32px", lineHeight: "1.6" }}>
          Maaf, terjadi kesalahan saat memverifikasi akun kamu. Link mungkin sudah kadaluarsa atau sudah pernah digunakan.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/login" style={{ background: "linear-gradient(135deg, #4D63FF, #06B6D4)", color: "white", textDecoration: "none", padding: "14px", borderRadius: "12px", fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s" }}>
            <RefreshCcw size={18} /> Coba Masuk Lagi
          </Link>
          
          <Link href="/" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0", textDecoration: "none", padding: "14px", borderRadius: "12px", fontWeight: "600", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s" }}>
            <ChevronLeft size={18} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
