"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Receipt, 
  Archive, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  PlusCircle, 
  User, 
  Briefcase, 
  Wallet,
  Play
} from "lucide-react";
import { useUser } from "../layout";

type GuideRole = "client" | "freelancer";

export default function GuidePage() {
  const { role, t } = useUser();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const triggerRelaunch = () => {
    // Dispatch custom event to open the tour modal
    window.dispatchEvent(new Event("freetrack-relaunch-tour"));
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  const clientSteps = [
    {
      title: "1. Menulis & Publikasi Proyek",
      icon: PlusCircle,
      color: "var(--cyan)",
      desc: "Langkah awal untuk menemukan talenta terbaik adalah dengan mempublikasikan proyek Anda ke Marketplace.",
      details: [
        "Akses menu <strong>Marketplace</strong> atau klik <strong>Buat Proyek Baru</strong> pada dasbor Anda.",
        "Tulis meta-data proyek secara mendalam: Ringkasan singkat, tujuan proyek (goals), hasil akhir (deliverables), serta pertanyaan penyaringan (screening questions).",
        "Pilih cara penyimpanan secara fleksibel: simpan aman sebagai <strong>Draf</strong> atau langsung tekan <strong>Publikasikan Proyek</strong> agar live seketika."
      ]
    },
    {
      title: "2. Menjangkau & Evaluasi Freelancer",
      icon: Layers,
      color: "#4D63FF",
      desc: "Tinjau lamaran pelamar atau jangkau langsung talenta terbaik secara efisien.",
      details: [
        "Proposal pelamar akan terduplikasi secara profesional lengkap dengan isi surat lamaran dan jawaban atas screening questions Anda.",
        "Anda juga dapat menjangkau langsung talenta pilihan melalui panel <strong>Rekomendasi Freelancer</strong> di dasbor utama dengan mengklik <strong>Mulai Diskusi</strong>.",
        "Diskusikan parameter proyek secara kontekstual berbasis proyek dengan freelancer tanpa otomatis dipaksa menjadi kontak tetap agar daftar chat rapi.",
        "Jika ingin terhubung secara formal dan menyimpannya di daftar kontak, gunakan fitur interaktif <strong>Tambahkan ke Kontak</strong>."
      ]
    },
    {
      title: "3. Pengisian Escrow & Pembayaran DP",
      icon: ShieldCheck,
      color: "#10B981",
      desc: "FreeTrack menggunakan sistem rekening bersama (Escrow) untuk melindungi dana klien dan freelancer.",
      details: [
        "Bayar milestone pertama atau <strong>Uang Muka (DP)</strong> menggunakan pilihan metode pembayaran yang fleksibel: <strong>Bank Transfer</strong>, <strong>E-Wallet (QRIS)</strong>, atau <strong>Kartu Kredit</strong>.",
        "Dana ini akan didepositkan secara aman di sistem Escrow FreeTrack. Freelancer akan segera menerima notifikasi untuk mulai bekerja setelah status berubah menjadi <strong>Terbayar ke Escrow</strong>.",
        "Metode pembayaran pilihan Anda akan terekam secara otomatis dan tercantum secara resmi pada berkas PDF Invoice Anda."
      ]
    },
    {
      title: "4. Review Bukti Pekerjaan (Proof of Work)",
      icon: CheckCircle2,
      color: "#F59E0B",
      desc: "Setiap kali freelancer menyelesaikan milestone, mereka akan mengirimkan bukti hasil pekerjaan.",
      details: [
        "Anda akan menerima notifikasi setiap kali ada pengajuan bukti kerja (<strong>Proof of Work</strong>).",
        "Tinjau hasil kerja freelancer secara teliti. Jika hasil kerja memuaskan, Anda dapat menekan tombol <strong>Setujui / Selesaikan</strong>.",
        "Jika ada bagian yang perlu disempurnakan, tekan tombol <strong>Request Revision</strong> untuk mengirimkan instruksi revisi secara tertulis."
      ]
    },
    {
      title: "5. Auto-Invoicing & Pelepasan Dana",
      icon: Receipt,
      color: "#EC4899",
      desc: "Sistem auto-invoicing FreeTrack bekerja secara instan tanpa perlu konfirmasi manual yang ribet.",
      details: [
        "Begitu Anda menekan tombol Setuju pada Proof of Work, <strong>dana Escrow secara otomatis cair</strong> ke saldo freelancer.",
        "Di saat yang bersamaan, sistem FreeTrack langsung menerbitkan invoice resmi berstatus <strong>Lunas (Paid)</strong> dengan rincian metode pembayaran yang telah Anda gunakan.",
        "Anda dapat melihat, melacak, dan mengunduh invoice berformat <strong>PDF resmi</strong> secara instan kapan saja di tab menu <strong>Invoice</strong>."
      ]
    },
    {
      title: "6. Mengarsipkan Proyek Selesai",
      icon: Archive,
      color: "#8B5CF6",
      desc: "Jaga agar dasbor Anda tetap rapi dan fokus pada pekerjaan yang sedang aktif berjalan.",
      details: [
        "Setelah seluruh kontrak milestone selesai dan proyek tuntas, Anda dapat menekan tombol <strong>Arsipkan Proyek</strong> di card proyek.",
        "Card proyek tersebut akan dipindahkan ke tab <strong>Diarsipkan</strong> agar dasbor bersih.",
        "Anda dapat memulihkan (restore) proyek tersebut kembali ke dasbor utama kapan saja."
      ]
    }
  ];

  const freelancerSteps = [
    {
      title: "1. Temukan & Lamar Proyek Menarik",
      icon: Briefcase,
      color: "var(--cyan)",
      desc: "Cari peluang kerja terbaik yang sesuai dengan keahlian khusus Anda di platform FreeTrack.",
      details: [
        "Jelajahi proyek-proyek aktif di tab menu <strong>Marketplace</strong>. Anda dapat menggunakan fitur <strong>Bookmark</strong> (Simpan Proyek) dan memantaunya secara khusus di tab filter <strong>Tersimpan</strong>.",
        "Tekan tombol <strong>Lihat Proyek</strong> untuk masuk ke Halaman Detail Proyek murni. Anda wajib memahami deskripsi lengkap, tujuan (goals), serta hasil akhir (deliverables) proyek sebelum melamar.",
        "Kirim lamaran terstruktur dengan menekan **Ajukan Lamaran**, lalu tulis surat lamaran (cover letter) serta jawab seluruh **Pertanyaan Screening** yang diajukan klien."
      ]
    },
    {
      title: "2. Diskusi Kontekstual & Hubungan Kontak",
      icon: Layers,
      color: "#4D63FF",
      desc: "Lakukan diskusi lingkup kerja secara terstruktur tanpa membebani daftar kontak Anda.",
      details: [
        "Tekan tombol <strong>Tanya Client</strong> di halaman detail proyek untuk melakukan chat kontekstual langsung terkait proyek spesifik tersebut.",
        "Anda juga dapat menerima pesan obrolan langsung dari klien yang menjangkau Anda melalui rekomendasi profil (reachout). Chat obrolan ini berjalan mandiri tanpa memaksa Anda menjadi kontak mereka secara otomatis agar daftar hubungan kontak tetap rapi.",
        "Jika ingin terhubung secara resmi dan menyimpan klien ke dalam daftar kontak tetap Anda, gunakan tombol <strong>Tambahkan ke Kontak</strong> di halaman proyek atau obrolan chat."
      ]
    },
    {
      title: "3. Mulai Kerja Setelah Dana Aman di Escrow",
      icon: ShieldCheck,
      color: "#10B981",
      desc: "FreeTrack menjamin hak pembayaran Anda terlindungi 100% dengan sistem penahanan dana Escrow.",
      details: [
        "<strong>PENTING:</strong> Hanya mulai kerjakan tugas milestone jika status milestone tersebut tertulis <strong>Terbayar ke Escrow</strong>.",
        "Status ini mengonfirmasi bahwa klien telah menyetorkan uang jaminan secara resmi ke FreeTrack.",
        "Anda dapat bekerja dengan tenang tanpa perlu khawatir proyek dibatalkan sepihak tanpa bayaran."
      ]
    },
    {
      title: "4. Kirim Bukti Pekerjaan (Proof of Work)",
      icon: CheckCircle2,
      color: "#F59E0B",
      desc: "Kirimkan hasil kerja terbaik Anda untuk ditinjau oleh klien melalui platform.",
      details: [
        "Setelah milestone selesai, klik tombol <strong>Kirim Bukti Kerja</strong> pada detail proyek.",
        "Tulis deskripsi penjelasan pengerjaan dan lampirkan file pendukung (dokumen, link repository, atau screenshot hasil kerja).",
        "Klien akan meninjau pengajuan Anda. Jika ada revisi, Anda akan menerima feedback detail untuk segera diperbaiki."
      ]
    },
    {
      title: "5. Terima Pembayaran Saldo & Auto-Invoice",
      icon: Wallet,
      color: "#EC4899",
      desc: "Tidak ada proses penagihan manual. Dana cair instan begitu pekerjaan disetujui.",
      details: [
        "Ketika klien menyetujui Proof of Work Anda, <strong>dana escrow otomatis cair</strong> ke Saldo Aktif Anda disertai notifikasi selebrasi instan.",
        "Lakukan penarikan dana aman melalui menu <strong>Pembayaran</strong>. Input nominal penarikan kini dilengkapi fitur <strong>Format Rupiah Otomatis</strong> (dengan pemisah titik, misal `1.500.000`) agar terhindar dari salah input.",
        "Untuk keamanan terbaik, penarikan dana didukung <strong>3-Step Fintech Security</strong>: pilih rekening bank/e-wallet, tinjau ringkasan gratis transfer, dan masukkan 6 digit PIN Keamanan (PIN default: <code>123456</code>)."
      ]
    },
    {
      title: "6. Kelola Histori di Tab Arsip",
      icon: Archive,
      color: "#8B5CF6",
      desc: "Organisir pekerjaan Anda secara rapi agar fokus pada proyek yang menghasilkan pendapatan baru.",
      details: [
        "Arsipkan card proyek yang sudah selesai sepenuhnya agar tidak memadati ruang kerja utama dasbor Anda.",
        "Semua riwayat proyek aman tersimpan di tab <strong>Diarsipkan</strong>.",
        "Anda dapat membuka arsip tersebut kapan saja untuk melihat dokumen, bukti kerja, atau memulihkannya jika diperlukan."
      ]
    }
  ];

  const faqs = [
    {
      q: "Apa itu sistem Escrow FreeTrack?",
      a: "Escrow adalah sistem rekening bersama di mana klien menyetorkan dana pembayaran proyek ke FreeTrack terlebih dahulu. Dana tersebut ditahan secara aman oleh FreeTrack selama freelancer bekerja, dan baru akan dilepaskan ke saldo freelancer setelah klien menyetujui bukti pekerjaan (Proof of Work) yang diserahkan."
    },
    {
      q: "Metode pembayaran apa saja yang didukung oleh FreeTrack untuk pengisian Escrow?",
      a: "FreeTrack mendukung berbagai opsi pembayaran yang fleksibel seperti Transfer Bank virtual account, pembayaran instan E-Wallet (QRIS), serta Kartu Kredit terverifikasi. Rincian metode pembayaran yang dipilih akan langsung dicantumkan pada file PDF Invoice resmi."
    },
    {
      q: "Bagaimana cara kerja Auto-Invoicing?",
      a: "Setiap kali ada transaksi pembayaran uang muka (DP) atau pelepasan milestone yang telah disetujui, FreeTrack akan secara otomatis membuatkan dokumen invoice berstatus Lunas (Paid). Klien tidak perlu mengubah status secara manual, dan file invoice berformat PDF dapat diunduh langsung dari menu Invoice."
    },
    {
      q: "Mengapa freelancer harus melihat detail proyek sebelum melamar?",
      a: "Untuk mewujudkan ekosistem marketplace yang profesional, freelancer wajib mempelajari deskripsi proyek secara komprehensif (ringkasan, goals, deliverables) sebelum mengajukan lamaran. Tombol 'Hubungi' langsung di halaman depan kini telah diganti menjadi 'Lihat Proyek' yang mengarahkan Anda ke Halaman Detail Proyek kaya data."
    },
    {
      q: "Bagaimana cara melihat proyek yang saya simpan (bookmark)?",
      a: "Freelancer dapat menyimpan proyek menarik menggunakan tombol Simpan (Bookmark) di kartu feed proyek atau halaman detail. Untuk melihat seluruh proyek tersimpan, silakan pilih tab filter 'Tersimpan' di bagian pojok kanan atas halaman feed Marketplace."
    },
    {
      q: "Mengapa bertanya kepada klien tidak langsung menjadikan mereka teman/kontak?",
      a: "FreeTrack menerapkan pemisahan hubungan kerja yang bersih. Chat kontekstual melalui 'Tanya Client' digunakan khusus untuk mendiskusikan detail proyek yang diminati. Jika Anda ingin menyimpannya ke daftar kontak permanen, Anda dapat mengajukan permintaan koneksi formal melalui tombol 'Tambahkan ke Kontak' di widget Tentang Klien."
    },
    {
      q: "Bagaimana cara Klien menjangkau (reachout) freelancer secara langsung?",
      a: "Klien dapat melihat daftar 'Rekomendasi Freelancer' yang dipersonalisasi di dasbor utama berdasarkan kriteria proyek. Klien dapat langsung menekan tombol 'Mulai Diskusi' untuk membuka obrolan tanpa membebani daftar kontak. Hubungan kontak baru akan terjalin secara formal apabila klien menekan tombol 'Tambah ke Kontak' di dalam chat room."
    },
    {
      q: "Mengapa freelancer harus menunggu dana Escrow masuk sebelum bekerja?",
      a: "Ini adalah praktik terbaik (best practice) keamanan kerja lepas di FreeTrack. Dengan memastikan status milestone telah 'Terbayar ke Escrow', freelancer mendapatkan jaminan 100% bahwa klien memiliki dana yang sah dan siap dicairkan begitu pekerjaan diselesaikan sesuai target."
    },
    {
      q: "Bagaimana cara kerja penarikan saldo (withdrawal) untuk Freelancer?",
      a: "Buka menu Pembayaran, tekan tombol Tarik Dana, tentukan rekening bank/e-wallet Anda (BCA, Mandiri, GoPay, OVO), dan isi nominal jumlah penarikan (yang otomatis diformat menjadi Rupiah). Tinjau detail transaksi, lalu otorisasi menggunakan 6 digit PIN keamanan (PIN default Anda adalah 123456)."
    },
    {
      q: "Apakah proyek yang telah diarsipkan bisa dipulihkan kembali?",
      a: "Bisa! Proyek yang selesai atau diarsipkan dipindahkan ke tab khusus 'Diarsipkan'. Di tab tersebut, baik klien maupun freelancer memiliki tombol 'Pulihkan Proyek' untuk mengembalikannya ke dasbor utama agar dapat diakses kembali kapan saja."
    }
  ];

  const steps = role === "freelancer" ? freelancerSteps : clientSteps;

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "10px 0" }}>
      {/* Premium Gradient Header Card */}
      <div className="glass-card" style={{
        padding: "40px",
        background: "linear-gradient(135deg, rgba(16, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        marginBottom: "32px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(77, 99, 255, 0.05)"
      }}>
        {/* Glow ambient background */}
        <div style={{
          position: "absolute",
          top: "-150px",
          right: "-100px",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-150px",
          left: "-100px",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(77, 99, 255, 0.1) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{
                background: "rgba(6, 182, 212, 0.15)",
                color: "var(--cyan-light)",
                fontSize: "12px",
                fontWeight: "700",
                padding: "6px 12px",
                borderRadius: "100px",
                border: "1px solid rgba(6, 182, 212, 0.25)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <Sparkles size={13} /> Pusat Edukasi Pengguna
              </span>
            </div>
            <h1 style={{
              fontSize: "36px",
              fontWeight: "900",
              letterSpacing: "-1px",
              background: "linear-gradient(135deg, #FFFFFF 30%, rgba(255, 255, 255, 0.7) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "12px"
            }}>
              Panduan Resmi FreeTrack
            </h1>
            <p style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "rgba(226, 232, 240, 0.6)",
              margin: 0
            }}>
              Pelajari seluruh alur kerja kolaborasi di platform FreeTrack dari hulu ke hilir. Didesain khusus untuk menciptakan lingkungan kerja lepas yang aman, transparan, dan produktif.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={triggerRelaunch}
            style={{
              background: "linear-gradient(135deg, #06B6D4 0%, #4D63FF 100%)",
              color: "#0F172A",
              border: "none",
              padding: "16px 28px",
              borderRadius: "16px",
              fontWeight: "800",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.3)"
            }}
          >
            <Play size={16} fill="#0F172A" /> Mulai Pop-up Panduan
          </motion.button>
        </div>
      </div>


      {/* Main Guide Steps */}
      <h2 style={{
        fontSize: "22px",
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <HelpCircle size={22} style={{ color: "var(--cyan)" }} /> Alur Kerja Penggunaan Aplikasi
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px",
        marginBottom: "48px"
      }}>
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card"
            style={{
              padding: "24px",
              background: "rgba(15, 22, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "20px",
              alignItems: "flex-start",
              transition: "transform 0.2s, border-color 0.2s"
            }}
          >
            {/* Step Icon Badge */}
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: `rgba(${step.color === "var(--cyan)" ? "6, 182, 212" : step.color === "#4D63FF" ? "77, 99, 255" : step.color === "#10B981" ? "16, 185, 129" : step.color === "#F59E0B" ? "245, 158, 11" : step.color === "#EC4899" ? "236, 72, 153" : "139, 92, 246"}, 0.08)`,
              border: `1px solid ${step.color}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: step.color,
              boxShadow: `0 8px 20px -8px ${step.color}`
            }}>
              <step.icon size={26} />
            </div>

            {/* Step Contents */}
            <div>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#FFFFFF",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "rgba(226, 232, 240, 0.7)",
                marginBottom: "16px",
                margin: 0
              }}>
                {step.desc}
              </p>

              {/* Inner detail points */}
              <div style={{
                background: "rgba(255, 255, 255, 0.01)",
                borderLeft: `3px solid ${step.color}`,
                borderRadius: "0 12px 12px 0",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                {step.details.map((detail, dIdx) => (
                  <div key={dIdx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <ChevronRight size={16} style={{ color: step.color, marginTop: "2px", flexShrink: 0 }} />
                    <span 
                      style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.85)", lineHeight: "1.5" }}
                      dangerouslySetInnerHTML={{ __html: detail }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQs Section */}
      <div style={{
        background: "rgba(15, 22, 42, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        borderRadius: "24px",
        padding: "36px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
      }}>
        <h2 style={{
          fontSize: "22px",
          fontWeight: "800",
          color: "#FFFFFF",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <HelpCircle size={22} style={{ color: "var(--cyan)" }} /> Pertanyaan Umum (FAQ)
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  paddingBottom: "16px"
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    padding: "8px 0",
                    color: isOpen ? "var(--cyan-light)" : "#FFFFFF",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "color 0.2s"
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronDown size={18} style={{ color: "var(--cyan)" }} /> : <ChevronRight size={18} style={{ opacity: 0.5 }} />}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      <p style={{
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: "rgba(226, 232, 240, 0.65)",
                        margin: "12px 0 4px 0"
                      }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
