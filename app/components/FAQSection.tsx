"use client";
import { useState } from "react";
import { Plus, Minus, MessageCircle } from "lucide-react";

const faqs = [
  {
    q: "Apa jaminan pembayaran saya aman?",
    a: "FreeTrack menggunakan sistem Escrow. Klien wajib menyetor dana sebelum freelancer mulai bekerja. Dana tersimpan aman dan hanya dicairkan setelah milestone disetujui.",
  },
  {
    q: "Bagaimana FreeTrack mencegah scope creep?",
    a: "Scope pekerjaan dikunci di kontrak digital. Setiap permintaan tambahan di luar kontrak masuk ke sistem Change Request yang otomatis menghitung biaya tambahan.",
  },
  {
    q: "Apa yang terjadi jika klien tidak merespons?",
    a: "Sistem Auto-Approve aktif. Jika klien tidak memberikan respons dalam batas waktu yang ditentukan, milestone dianggap disetujui dan dana otomatis cair.",
  },
  {
    q: "Berapa lama proses penarikan dana?",
    a: "Dana dari milestone yang disetujui langsung masuk ke Saldo FreeTrack. Penarikan ke rekening bank atau e-wallet diproses dalam 1x24 jam kerja.",
  },
  {
    q: "Apakah cocok untuk mahasiswa yang baru mulai freelance?",
    a: "Sangat cocok! FreeTrack gratis selamanya. Platform ini dirancang agar kamu bisa fokus bangun portofolio tanpa takut dimanfaatkan.",
  },
  {
    q: "Bagaimana jika ada perselisihan?",
    a: "FreeTrack menyediakan tim mediasi. Semua bukti kerja, komunikasi, dan kontrak tercatat di platform, sehingga penyelesaian bisa dilakukan secara objektif.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      <div className="orb" style={{ width: "400px", height: "400px", background: "#1A36F0", top: "0", left: "-100px", opacity: 0.05 }} />

      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span className="section-badge">✦ FAQ</span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "900", letterSpacing: "-1px", lineHeight: "1.15", marginBottom: "16px" }}>
            Pertanyaan yang{" "}
            <span className="gradient-text-emerald">Sering Ditanyakan</span>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {faqs.map((item, i) => (
            <FAQItem key={i} question={item.q} answer={item.a} index={i} />
          ))}
        </div>

        {/* Contact */}
        <div style={{
          marginTop: "56px", textAlign: "center", padding: "40px",
          background: "rgba(26,54,240,0.05)", border: "1px solid rgba(26,54,240,0.12)",
          borderRadius: "20px",
        }}>
          <MessageCircle size={28} style={{ color: "#4D63FF", margin: "0 auto 12px", display: "block" }} />
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Masih ada pertanyaan?</h3>
          <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.45)", marginBottom: "20px" }}>
            Tim support kami siap membantu. Rata-rata respons: 5 menit.
          </p>
          <a href="#" className="btn-primary" style={{ borderRadius: "10px" }}>
            <MessageCircle size={16} />
            Hubungi Support
          </a>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="glass-card"
      style={{ padding: "0", overflow: "hidden", cursor: "pointer", border: open ? "1px solid rgba(16,185,129,0.2)" : undefined }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#10B981", opacity: 0.5, minWidth: "22px" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: "15px", fontWeight: "600" }}>{question}</span>
        </div>
        <div style={{
          width: "26px", height: "26px", borderRadius: "8px",
          background: open ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.3s ease", color: open ? "#10B981" : "rgba(226,232,240,0.3)",
        }}>
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </div>
      </div>
      {open && (
        <div style={{ padding: "0 22px 18px 56px", fontSize: "14px", color: "rgba(226,232,240,0.55)", lineHeight: "1.75", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
          {answer}
        </div>
      )}
    </div>
  );
}
