"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Check, X, Mail, Users, Clock, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { useContacts } from "@/lib/hooks/useContacts";
import { useUser } from "../layout";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ContactsPage() {
  const { role, user } = useUser();
  const router = useRouter();
  const { contacts, invitations, loading, inviteContact, respondInvitation, refetch } = useContacts();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const incoming = invitations.filter((c: any) => c.invited_by !== user?.id);

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

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: "Hapus Kontak?",
      text: "Kontak dan seluruh riwayat pesan akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF4D6A",
      background: "#0F1B2E",
      color: "#fff"
    });

    if (res.isConfirmed) {
      await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
      refetch();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", marginBottom: "8px" }}>
          Kontak <span className="gradient-text">Saya</span>
        </h1>
        <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "15px" }}>
          Kelola koneksi profesional Anda dan mulai kolaborasi baru.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,5fr) minmax(0,7fr)", gap: "28px", alignItems: "start" }}>

        {/* Kolom Kiri */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
              <UserPlus size={18} style={{ color: "var(--cyan)" }} />
              Undang {role === "freelancer" ? "Klien" : "Freelancer"}
            </h3>
            <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "13px", marginBottom: "20px" }}>
              Masukkan email rekan Anda yang sudah terdaftar.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Mail size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(226,232,240,0.3)" }} />
                <input type="email" placeholder="email@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "11px 14px 11px 40px", color: "#fff", fontSize: "14px", outline: "none" }} />
              </div>
              <button onClick={handleInvite} disabled={sending} className="btn-primary" style={{ padding: "11px 18px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Undang
              </button>
            </div>
            {err && <p style={{ color: "#FF4D6A", fontSize: "12px", marginTop: "10px" }}>{err}</p>}
            {ok && <p style={{ color: "#00FFA3", fontSize: "12px", marginTop: "10px" }}>{ok}</p>}
          </motion.div>

          {incoming.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} style={{ color: "#F59E0B" }} /> Undangan Masuk
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {incoming.map((c: any) => {
                  const other = c.freelancer_id === user?.id ? c.client : c.freelancer;
                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#EF4444)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff" }}>
                        {other?.full_name?.charAt(0) ?? "?"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>{other?.full_name || c.invited_email}</div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleRespond(c.id, "accepted")} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", background: "rgba(0,255,163,0.1)", border: "none", color: "#00FFA3", cursor: "pointer" }}><Check size={14} /></button>
                        <button onClick={() => handleRespond(c.id, "rejected")} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,77,106,0.1)", border: "none", color: "#FF4D6A", cursor: "pointer" }}><X size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Kolom Kanan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={18} style={{ color: "var(--cyan)" }} /> Kontak Terhubung
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(226,232,240,0.3)" }}><Loader2 size={24} className="animate-spin" /></div>
          ) : contacts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(226,232,240,0.2)" }}>Belum ada kontak terhubung.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {contacts.map((c: any) => {
                const other = c.freelancer_id === user?.id ? c.client : c.freelancer;
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg,#4D63FF,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff" }}>
                      {other?.full_name?.charAt(0) ?? "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#fff", fontWeight: "700", fontSize: "15px" }}>{other?.full_name || "-"}</div>
                      <div style={{ color: "rgba(226,232,240,0.4)", fontSize: "12px" }}>{other?.email}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => router.push(`/dashboard/messages?chat=${other.id}`)}
                        style={{ padding: "8px 12px", borderRadius: "10px", background: "rgba(77, 99, 255, 0.1)", border: "1px solid rgba(77, 99, 255, 0.2)", color: "#4D63FF", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <MessageSquare size={14} /> Chat
                      </button>
                      <button onClick={() => handleDelete(c.id)} style={{ padding: "8px", borderRadius: "10px", background: "transparent", border: "none", color: "rgba(255,77,106,0.4)", cursor: "pointer" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
