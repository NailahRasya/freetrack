"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Bagaimana sistem commitment fee bekerja?",
    a: "Commitment fee adalah deposit kecil (biasanya 10-20% dari nilai proyek) yang dibayarkan client saat memilih freelancer. Dana ini disimpan aman di escrow freetrack dan berfungsi sebagai jaminan bahwa kedua pihak serius menjalankan proyek. Jika proyek dibatalkan tanpa alasan yang valid, pihak yang bertanggung jawab akan dikenai penalti.",
  },
  {
    q: "Apa itu milestone planning dan bagaimana cara kerjanya?",
    a: "Milestone adalah tahapan-tahapan dalam proyek yang memiliki deadline, deliverable, dan nominal pembayaran tersendiri. Misalnya: Milestone 1 - Desain (Rp 1jt, 7 hari), Milestone 2 - Development (Rp 3jt, 14 hari). Pembayaran hanya dicairkan setelah client menyetujui hasil kerja setiap milestone.",
  },
  {
    q: "Bagaimana proses review dan approval berlangsung?",
    a: "Freelancer mengirim hasil kerja (evidence submission) berupa file, screenshot, atau link. Client mendapat notifikasi dan memiliki waktu tertentu untuk review. Client bisa langsung approve atau membuat change request dengan catatan detail. Jika tidak ada respon dalam waktu yang disepakati, sistem akan auto-approve.",
  },
  {
    q: "Berapa lama proses pencairan pembayaran?",
    a: "Setelah milestone disetujui client, pembayaran langsung diproses dalam 1-3 hari kerja ke rekening bank atau e-wallet yang terdaftar. Untuk paket Pro dan Enterprise, tersedia opsi instant payout dengan biaya tambahan.",
  },
  {
    q: "Bagaimana jika ada perselisihan antara freelancer dan client?",
    a: "Freetrack memiliki tim mediasi yang berpengalaman. Semua komunikasi, perubahan scope, dan evidence submission tersimpan dalam sistem sebagai dokumentasi. Tim mediasi akan meninjau semua bukti dan memberikan keputusan yang adil dalam 5-7 hari kerja.",
  },
  {
    q: "Apakah data dan transaksi saya aman di freetrack?",
    a: "Ya. Semua transaksi dienkripsi dengan SSL 256-bit. Dana disimpan di escrow terpisah yang diawasi. Kami mematuhi regulasi OJK dan bekerja sama dengan bank berlisensi. Data pribadi dilindungi sesuai UU Perlindungan Data Pribadi Indonesia.",
  },
];

export default function FAQSection() {
  return (
    <section
      id="faq"
      style={{
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="orb"
        style={{
          width: "400px",
          height: "400px",
          background: "#6c63ff",
          top: "0",
          left: "-100px",
          opacity: 0.06,
        }}
      />

      <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span className="section-badge">✦ FAQ</span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: "800",
              lineHeight: "1.2",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Pertanyaan yang{" "}
            <span className="gradient-text">Sering Ditanyakan</span>
          </h2>
        </div>

        {/* FAQ Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((item, i) => (
            <FAQItem key={i} question={item.q} answer={item.a} index={i} />
          ))}
        </div>

        {/* Contact */}
        <div
          style={{
            marginTop: "56px",
            textAlign: "center",
            padding: "40px",
            background: "rgba(108,99,255,0.06)",
            border: "1px solid rgba(108,99,255,0.15)",
            borderRadius: "20px",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>🤔</div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
            Masih ada pertanyaan?
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(226,232,240,0.55)", marginBottom: "20px" }}>
            Tim support kami siap membantu 24/7. Rata-rata waktu respons: 5 menit.
          </p>
          <a href="#" id="contact-support" className="btn-primary">
            💬 Hubungi Support
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
      style={{
        padding: "0",
        overflow: "hidden",
        cursor: "pointer",
        border: open ? "1px solid rgba(108,99,255,0.3)" : undefined,
      }}
      onClick={() => setOpen(!open)}
    >
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#6c63ff",
              opacity: 0.5,
              minWidth: "24px",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: "15px", fontWeight: "600" }}>{question}</span>
        </div>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: open ? "rgba(108,99,255,0.15)" : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            flexShrink: 0,
            transition: "all 0.3s ease",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </div>
      </div>
      {open && (
        <div
          style={{
            padding: "0 24px 20px 60px",
            fontSize: "14px",
            color: "rgba(226,232,240,0.6)",
            lineHeight: "1.75",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}
