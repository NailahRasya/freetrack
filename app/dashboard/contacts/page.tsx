"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Check, X, Mail, Users, Clock, Loader2 } from "lucide-react";
import { useContacts } from "@/lib/hooks/useContacts";
import { useUser } from "../layout";

export default function ContactsPage() {
  const { role } = useUser();
  const { contacts, invitations, loading, inviteContact, respondInvitation } = useContacts();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Pisah: undangan masuk (bukan dari diri sendiri) vs keluar
  const incoming = invitations.filter((c: any) => c.invited_by !== undefined);

  const handleInvite = async () => {
    if (!email.trim()) { setErr("Email wajib diisi"); return; }
    setSending(true); setErr(""); setOk("");
    try {
      await inviteContact(email.trim());
      setOk(`Undangan terkirim ke ${email}`);
      setEmail("");
    } catch (e: any) { setErr(e.message); }
    setSending(false);
  };

  const handleRespond = async (id: string, status: "accepted" | "rejected") => {
    try { await respondInvitation(id, status); }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", marginBottom: "8px" }}>
          Kontak <span className="gradient-text">Saya</span>
        </h1>
        <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "15px" }}>
          {role === "freelancer" ? "Hubungkan diri Anda dengan klien" : "Lihat freelancer yang terhubung dengan Anda"}
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,5fr) minmax(0,7fr)", gap: "28px", alignItems: "start" }}>

        {/* Kolom Kiri: Undang + Undangan Masuk */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Form Undang */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
              <UserPlus size={18} style={{ color: "var(--cyan)" }} />
              {role === "freelancer" ? "Undang Klien" : "Hubungkan ke Freelancer"}
            </h3>
            <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "13px", marginBottom: "20px" }}>
              Masukkan email {role === "freelancer" ? "klien" : "freelancer"} yang terdaftar di FreeTrack
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Mail size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(226,232,240,0.3)" }} />
                <input type="email" placeholder={role === "freelancer" ? "client@freetrack.test" : "freelancer@freetrack.test"}
                  value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleInvite()}
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "11px 14px 11px 40px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleInvite} disabled={sending} className="btn-primary"
                style={{ padding: "11px 18px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                {sending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <UserPlus size={16} />}
                Undang
              </motion.button>
            </div>
            {err && <p style={{ color: "#FF4D6A", fontSize: "13px", marginTop: "10px", margin: "10px 0 0" }}>{err}</p>}
            {ok && <p style={{ color: "#00FFA3", fontSize: "13px", marginTop: "10px", margin: "10px 0 0" }}>{ok}</p>}
          </motion.div>

          {/* Undangan Masuk */}
          {incoming.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} style={{ color: "#F59E0B" }} /> Undangan Masuk
                <span style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", borderRadius: "20px", padding: "2px 10px", fontSize: "12px" }}>{incoming.length}</span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {incoming.map((c: any) => {
                  const other = role === "client" ? c.freelancer : c.client;
                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#EF4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
                        {other?.full_name?.charAt(0) ?? "?"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>{other?.full_name ?? c.invited_email}</div>
                        <div style={{ color: "rgba(226,232,240,0.4)", fontSize: "12px" }}>{other?.email ?? c.invited_email}</div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => handleRespond(c.id, "accepted")}
                          style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(0,255,163,0.12)", border: "1px solid rgba(0,255,163,0.25)", color: "#00FFA3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Check size={14} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => handleRespond(c.id, "rejected")}
                          style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,77,106,0.12)", border: "1px solid rgba(255,77,106,0.25)", color: "#FF4D6A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <X size={14} />
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Kolom Kanan: Daftar Kontak Aktif */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={18} style={{ color: "var(--cyan)" }} /> Kontak Terhubung
            <span style={{ background: "rgba(0,229,255,0.1)", color: "var(--cyan)", borderRadius: "20px", padding: "2px 10px", fontSize: "12px" }}>{contacts.length}</span>
          </h3>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", gap: "10px", color: "rgba(226,232,240,0.3)" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Memuat...
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Users size={24} style={{ color: "rgba(226,232,240,0.1)" }} />
              </div>
              <p style={{ color: "rgba(226,232,240,0.3)", fontSize: "14px" }}>Belum ada kontak terhubung</p>
              <p style={{ color: "rgba(226,232,240,0.2)", fontSize: "13px", marginTop: "6px" }}>Undang {role === "freelancer" ? "klien" : "freelancer"} menggunakan form di samping</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {contacts.map((c: any) => {
                const other = role === "freelancer" ? c.client : c.freelancer;
                const otherRole = role === "freelancer" ? "Client" : "Freelancer";
                return (
                  <motion.div key={c.id} whileHover={{ background: "rgba(255,255,255,0.04)" }}
                    style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg,#4D63FF,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
                      {other?.full_name?.charAt(0) ?? "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontWeight: "700", fontSize: "15px" }}>{other?.full_name ?? "-"}</div>
                      <div style={{ color: "rgba(226,232,240,0.4)", fontSize: "12px" }}>{other?.email ?? "-"}</div>
                    </div>
                    <div style={{ padding: "4px 10px", borderRadius: "20px", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)", color: "var(--cyan)", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
                      {otherRole}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
