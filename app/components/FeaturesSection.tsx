"use client"; // Menandakan komponen berjalan di sisi klien
import {
  GitBranch, Calendar, DollarSign, AlertTriangle,
  PlusCircle, FileText, CheckCircle2, ArrowRight,
  Clock, Receipt
} from "lucide-react"; // Mengimpor kumpulan ikon dari lucide-react
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function FeaturesSection() {
  return (
    <section id="features" style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      {/* Ornamen latar belakang (orb cahaya hijau) */}
      <div className="orb" style={{ width: "500px", height: "500px", background: "#10B981", top: "-100px", right: "-200px", opacity: 0.06 }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        {/* Bagian Header Section Fitur */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={itemVariants}
          style={{ textAlign: "center", marginBottom: "80px" }}
        >
          <span className="section-badge">✦ Feature Showcase</span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "900", letterSpacing: "-1px", lineHeight: "1.15", marginBottom: "16px" }}>
            Tiga Pilar{" "}
            <span className="gradient-text-emerald">Perlindunganmu</span>
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(226,232,240,0.5)", maxWidth: "520px", margin: "0 auto" }}>
            Setiap fitur dirancang spesifik untuk mengatasi masalah yang paling sering dialami freelancer.
          </p>
        </motion.div>

        {/* === FITUR 1: Milestone Planning === */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", marginBottom: "120px" }} 
          className="feature-row"
        >
          {/* Sisi Kiri: Penjelasan Teks */}
          <motion.div variants={itemVariants}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
                <GitBranch size={20} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#10B981", letterSpacing: "1px", textTransform: "uppercase" }}>Milestone Planning</span>
            </div>
            <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "16px", lineHeight: "1.2" }}>
              Pecah proyek jadi tahapan jelas,{" "}
              <span className="gradient-text-emerald">bayar per milestone.</span>
            </h3>
            <p style={{ fontSize: "16px", color: "rgba(226,232,240,0.5)", lineHeight: "1.8", marginBottom: "24px" }}>
              Setiap tahap punya deadline, deliverable, dan harga yang disepakati. Freelancer tahu persis apa yang dikerjakan. Klien tahu persis apa yang dibayar.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Deadline per milestone — tidak ada kerjaan open-ended",
                "Harga per tahap — transparan sejak awal",
                "Progress visual — klien bisa pantau real-time",
              ].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "rgba(226,232,240,0.55)" }}>
                  <CheckCircle2 size={16} style={{ color: "#10B981", flexShrink: 0, marginTop: "2px" }} />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sisi Kanan: Visualisasi Milestone Timeline */}
          <motion.div 
            variants={itemVariants}
            className="feature-visual" 
            style={{ padding: "28px" }}
            whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.3)" }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px", fontWeight: "600" }}>
              ↳ Preview Milestone
            </div>
            {[
              { name: "Research & Wireframe", deadline: "7 Jan", price: "Rp 500k", status: "done", pct: 100 },
              { name: "Desain UI High-Fidelity", deadline: "14 Jan", price: "Rp 1.2jt", status: "active", pct: 60 },
              { name: "Frontend Development", deadline: "28 Jan", price: "Rp 2jt", status: "pending", pct: 0 },
              { name: "Testing & Handover", deadline: "5 Feb", price: "Rp 800k", status: "pending", pct: 0 },
            ].map((ms, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", marginBottom: i < 3 ? "20px" : "0" }}>
                {/* Titik dan garis timeline */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "20px" }}>
                  <div style={{
                    width: "12px", height: "12px", borderRadius: "50%",
                    background: ms.status === "done" ? "#10B981" : ms.status === "active" ? "#1A36F0" : "rgba(255,255,255,0.1)",
                    border: ms.status === "active" ? "2px solid rgba(26,54,240,0.4)" : "none",
                    flexShrink: 0,
                  }} />
                  {i < 3 && <div style={{ width: "2px", flex: 1, background: ms.status === "done" ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.05)", marginTop: "4px" }} />}
                </div>
                {/* Konten detail milestone */}
                <div style={{ flex: 1, paddingBottom: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: ms.status === "pending" ? "rgba(226,232,240,0.3)" : "#E2E8F0" }}>{ms.name}</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: ms.status === "done" ? "#10B981" : ms.status === "active" ? "#06B6D4" : "rgba(226,232,240,0.2)" }}>{ms.price}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Progress bar per milestone */}
                    <div style={{ height: "4px", flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: "2px" }}>
                      <div style={{ width: `${ms.pct}%`, height: "100%", borderRadius: "2px", background: ms.status === "done" ? "#10B981" : "linear-gradient(90deg, #1A36F0, #06B6D4)" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>
                      <Calendar size={10} />
                      {ms.deadline}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* === FITUR 2: Smart Change Request === */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", marginBottom: "120px" }} 
          className="feature-row-reverse"
        >
          {/* Sisi Kiri: Visualisasi Log Change Request */}
          <motion.div 
            variants={itemVariants}
            className="feature-visual" 
            style={{ padding: "28px", order: 0 }}
            whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.3)" }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px", fontWeight: "600" }}>
              ↳ Change Request Log
            </div>

            {/* Ilustrasi scope awal proyek yang sudah dikunci */}
            <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", color: "#10B981", fontWeight: "700", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                <CheckCircle2 size={12} /> Scope Awal (Terkunci)
              </div>
              <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.6)", lineHeight: "1.6" }}>
                ✓ 5 halaman UI · ✓ Responsive design · ✓ 2x revisi
              </div>
            </div>

            {/* Ilustrasi daftar permintaan perubahan (change requests) */}
            {[
              { title: "Tambah halaman admin dashboard", cost: "+Rp 600k", status: "approved", icon: <CheckCircle2 size={14} /> },
              { title: "Tambah animasi micro-interaction", cost: "+Rp 300k", status: "pending", icon: <Clock size={14} /> },
            ].map((cr, i) => (
              <div key={i} style={{
                background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
                borderRadius: "10px", padding: "14px", marginBottom: i === 0 ? "10px" : "0",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ color: cr.status === "approved" ? "#10B981" : "#F59E0B" }}>{cr.icon}</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0" }}>{cr.title}</div>
                    <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)" }}>
                      {cr.status === "approved" ? "Disetujui klien" : "Menunggu approval"}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "700", color: cr.status === "approved" ? "#10B981" : "#F59E0B" }}>{cr.cost}</span>
              </div>
            ))}

            {/* Garis pemisah dan total nilai proyek */}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>Total nilai proyek sekarang</span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#34D399" }}>Rp 5.4jt</span>
            </div>
          </motion.div>

          {/* Sisi Kanan: Penjelasan Teks */}
          <motion.div variants={itemVariants} style={{ order: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}>
                <AlertTriangle size={20} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#F59E0B", letterSpacing: "1px", textTransform: "uppercase" }}>Smart Change Request</span>
            </div>
            <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "16px", lineHeight: "1.2" }}>
              Klien minta tambah fitur?{" "}
              <span style={{ color: "#F59E0B" }}>Bukan masalah.</span>
            </h3>
            <p style={{ fontSize: "16px", color: "rgba(226,232,240,0.5)", lineHeight: "1.8", marginBottom: "24px" }}>
              Setiap permintaan di luar kontrak awal dicatat sebagai Change Request — lengkap dengan estimasi biaya tambahan. Klien harus approve dan bayar sebelum kamu mulai.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Scope awal terkunci — tidak bisa diubah diam-diam",
                "Biaya tambahan otomatis dihitung sistem",
                "Klien wajib approve sebelum kamu kerja extra",
              ].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "rgba(226,232,240,0.55)" }}>
                  <CheckCircle2 size={16} style={{ color: "#F59E0B", flexShrink: 0, marginTop: "2px" }} />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* === FITUR 3: Auto-Invoicing === */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }} 
          className="feature-row"
        >
          {/* Sisi Kiri: Penjelasan Teks */}
          <motion.div variants={itemVariants}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#06B6D4" }}>
                <Receipt size={20} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#06B6D4", letterSpacing: "1px", textTransform: "uppercase" }}>Auto-Invoicing</span>
            </div>
            <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "16px", lineHeight: "1.2" }}>
              Invoice terbit otomatis,{" "}
              <span className="gradient-text">tanpa ribet.</span>
            </h3>
            <p style={{ fontSize: "16px", color: "rgba(226,232,240,0.5)", lineHeight: "1.8", marginBottom: "24px" }}>
              Setiap milestone yang disetujui langsung men-generate invoice PDF profesional. Tidak perlu buat sendiri, tidak perlu kirim manual lewat WA.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "PDF profesional dengan branding FreeTrack",
                "Terbit otomatis saat milestone approved",
                "Riwayat invoice tersimpan rapi di dashboard",
              ].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "rgba(226,232,240,0.55)" }}>
                  <CheckCircle2 size={16} style={{ color: "#06B6D4", flexShrink: 0, marginTop: "2px" }} />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sisi Kanan: Visualisasi Preview Invoice */}
          <motion.div 
            variants={itemVariants}
            className="feature-visual" 
            style={{ padding: "0", overflow: "hidden" }}
            whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(6,182,212,0.3)" }}
            transition={{ duration: 0.2 }}
          >
            {/* Header Invoice Mockup */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileText size={16} style={{ color: "#06B6D4" }} />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#E2E8F0" }}>Invoice #FT-2026-0021</span>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "3px 10px", borderRadius: "6px" }}>LUNAS</span>
              </div>
            </div>

            {/* Isu Invoice Mockup */}
            <div style={{ padding: "24px 28px" }}>
              {/* Informasi Dari / Untuk */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "rgba(226,232,240,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Dari</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0" }}>Budi Santoso</div>
                  <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)" }}>UI/UX Designer</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "rgba(226,232,240,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Untuk</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0" }}>PT Kreasi Digital</div>
                  <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)" }}>kreasi@mail.com</div>
                </div>
              </div>

              {/* Tabel Item dalam Invoice */}
              <div style={{ borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "8px 12px", background: "rgba(255,255,255,0.03)", fontSize: "10px", color: "rgba(226,232,240,0.3)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>
                  <span>Deskripsi</span>
                  <span>Jumlah</span>
                </div>
                {[
                  { desc: "Milestone 2 — Desain UI High-Fidelity", amount: "Rp 1.200.000" },
                  { desc: "Change Request — Dashboard Admin", amount: "Rp 600.000" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.03)", fontSize: "12px" }}>
                    <span style={{ color: "rgba(226,232,240,0.6)" }}>{item.desc}</span>
                    <span style={{ color: "#E2E8F0", fontWeight: "600" }}>{item.amount}</span>
                  </div>
                ))}
              </div>

              {/* Total Tagihan */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "rgba(226,232,240,0.5)" }}>Total</span>
                <span style={{ fontSize: "20px", fontWeight: "900", color: "#34D399" }}>Rp 1.800.000</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Media query untuk mengubah tata letak grid menjadi satu kolom pada layar sempit/mobile */}
      <style>{`
        @media (max-width: 900px) {
          .feature-row, .feature-row-reverse { grid-template-columns: 1fr !important; }
          .feature-row-reverse > div { order: 0 !important; }
        }
      `}</style>
    </section>
  );
}
