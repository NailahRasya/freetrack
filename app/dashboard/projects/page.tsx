"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, SlidersHorizontal, Briefcase, CheckCircle2, Clock, Loader2 } from "lucide-react";
import ProjectCard from "../../components/dashboard/ProjectCard";
import CreateProjectModal from "../../components/dashboard/CreateProjectModal";
import Swal from "sweetalert2";
import { useProjects } from "@/lib/hooks/useProjects";
import { useContacts } from "@/lib/hooks/useContacts";
import { useUser } from "../layout";

const STATUS_COLOR: Record<string, string> = {
  draft: "#7C3AED", 
  pending_client: "#F59E0B",
  pending_freelancer: "#4D63FF",
  active: "#00E5FF", 
  review: "#F59E0B",
  completed: "#00FFA3", 
  rejected: "#FF4D6A",
  published: "#4D63FF",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Draf", 
  pending_client: "Menunggu Klien",
  pending_freelancer: "Menunggu Freelancer",
  active: "Aktif", 
  review: "Tinjauan",
  completed: "Selesai", 
  rejected: "Ditolak / Revisi",
  published: "Dipublikasikan",
};

export default function ProjectsPage() {
  const { role } = useUser();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const { contacts } = useContacts();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);

  const tabs = role === "freelancer"
    ? ["all", "draft", "pending_freelancer", "pending_client", "active", "review", "completed"]
    : ["all", "draft", "published", "pending_freelancer", "pending_client", "active", "review", "completed"];

  const filtered = projects.filter(p => {
    // Proyek "published" (Marketplace) hanya muncul di sisi Klien (pembuatnya)
    if (role === "freelancer" && p.status === "published") return false;

    const matchTab = tab === "all" || p.status === tab;
    const partner = role === "client" ? (p.freelancer?.full_name ?? "") : (p.client?.full_name ?? "");
    const matchSearch = (p.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
                        partner.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const visibleProjects = projects.filter(p => {
    if (role === "freelancer" && p.status === "published") return false;
    return true;
  });

  const stats = [
    { label: "Total", value: visibleProjects.length, icon: Briefcase, color: "#4D63FF" },
    { label: "Aktif", value: visibleProjects.filter(p => p.status === "active").length, icon: Clock, color: "#00E5FF" },
    { label: "Tinjauan", value: visibleProjects.filter(p => p.status === "review").length, icon: SlidersHorizontal, color: "#F59E0B" },
    { label: "Selesai", value: visibleProjects.filter(p => p.status === "completed").length, icon: CheckCircle2, color: "#00FFA3" },
  ];

  const toCard = (p: any) => ({
    id: p.id,
    projectId: p.project_code,
    name: p.title,
    client: p.client?.full_name ?? "-",
    freelancer: p.freelancer?.full_name ?? "-",
    progress: p.progress ?? 0,
    budget: p.budget ?? "-",
    deadline: p.deadline ?? "-",
    status: STATUS_LABEL[p.status] ?? p.status,
    statusColor: STATUS_COLOR[p.status] ?? "#666",
    rawStatus: p.status,
    description: p.description,
    rejection_reason: p.rejection_reason,
    negotiation_count: p.negotiation_count || 0
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
      <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
      <span>Memuat proyek...</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", flexWrap: "wrap" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", marginBottom: "8px" }}>
            Proyek <span className="gradient-text">Saya</span>
          </h1>
          <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "15px" }}>Kelola dan pantau semua proyek Anda</p>
        </motion.div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "20px" }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card" style={{ padding: "20px", background: "rgba(15, 27, 46, 0.4)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${s.color}15`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${s.color}25` }}>
              <s.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(226, 232, 240, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.03)", padding: "4px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.05)", flexWrap: "wrap", gap: "2px" }}>
          {tabs.map(t => {
            const needsAction = (t === "pending_client" && role === "client") || 
                               (t === "pending_freelancer" && role === "freelancer");
            const hasItems = projects.some(p => p.status === t);
            const showDot = needsAction && hasItems;

            return (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "7px 14px", borderRadius: "10px", border: "none", fontSize: "12px",
                fontWeight: "700", cursor: "pointer", transition: "all 0.2s",
                background: tab === t ? "rgba(255, 255, 255, 0.06)" : "transparent",
                color: tab === t ? (STATUS_COLOR[t] || "var(--cyan)") : "rgba(226, 232, 240, 0.4)",
              }}>
                {({ all: "Semua", ...STATUS_LABEL } as any)[t]}
              </button>
            );
          })}
        </div>
        <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(226, 232, 240, 0.3)" }} />
          <input type="text" placeholder={`Cari proyek atau ${role === 'client' ? 'freelancer' : 'klien'}...`} value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "11px 16px 11px 42px", color: "#fff", fontSize: "14px", outline: "none" }} />
        </div>
      </div>

      {/* Grid Proyek */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {filtered.map(p => (
              <ProjectCard key={p.id} project={toCard(p)}
                onEdit={() => setProjectToEdit(p)}
                onDelete={async id => { 
                  const result = await Swal.fire({
                    title: "Hapus proyek ini?",
                    text: "Tindakan ini tidak dapat dibatalkan.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#FF4D6A",
                    cancelButtonColor: "rgba(255,255,255,0.1)",
                    confirmButtonText: "Ya, Hapus!",
                    cancelButtonText: "Batal",
                    background: "#0F1B2E",
                    color: "#fff"
                  });

                  if (result.isConfirmed) {
                    try { 
                      await deleteProject(String(id));
                      Swal.fire({ title: "Dihapus!", text: "Proyek telah berhasil dihapus.", icon: "success", background: "#0F1B2E", color: "#fff", timer: 1500, showConfirmButton: false });
                    } catch(e:any) { 
                      Swal.fire({ title: "Error", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
                    }
                  }
                }}
                onSendToClient={async (id, status, reason) => { 
                  try { 
                    const payload: any = { status };
                    if (reason) payload.rejection_reason = reason;
                    await updateProject(String(id), payload); 
                    Swal.fire({ title: "Berhasil!", text: "Status proyek diperbarui.", icon: "success", background: "#0F1B2E", color: "#fff", timer: 1500, showConfirmButton: false });
                  } catch(e:any) { 
                    Swal.fire({ title: "Error", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
                  } 
                }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "80px 20px", textAlign: "center", background: "rgba(15, 27, 46, 0.2)", borderRadius: "32px", border: "2px dashed rgba(255, 255, 255, 0.04)" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Briefcase size={28} style={{ color: "rgba(226, 232, 240, 0.1)" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
              {visibleProjects.length === 0 ? "Belum ada proyek" : "Tidak ada proyek ditemukan"}
            </h3>
            <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "14px", marginBottom: "20px" }}>
              {visibleProjects.length === 0
                ? "Mulai dengan menginisiasi proyek baru Anda"
                : "Coba ubah filter atau kata kunci pencarian"}
            </p>
            {tab !== "all" && (
              <button className="btn-secondary" onClick={() => { setTab("all"); setSearch(""); }}>Hapus Filter</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Buat/Edit Proyek */}
      <AnimatePresence>
        {(showCreate || projectToEdit) && (
          <CreateProjectModal
            contacts={contacts}
            initialData={projectToEdit}
            onClose={() => { setShowCreate(false); setProjectToEdit(null); }}
            onSaveDraft={async d => {
              try {
                if (projectToEdit) {
                  await updateProject(projectToEdit.id, d);
                } else {
                  await createProject({ ...d, send_to_client: false });
                }
                Swal.fire({ title: "Tersimpan!", text: "Draf proyek berhasil disimpan.", icon: "success", background: "#0F1B2E", color: "#fff", timer: 2000, showConfirmButton: false });
              } catch (e: any) {
                Swal.fire({ title: "Gagal!", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
                throw e; // Biarkan modal tetap terbuka
              }
            }}
            onSendToClient={async d => {
              try {
                if (projectToEdit) {
                   const nextStatus = role === "client" ? "pending_freelancer" : "pending_client";
                   await updateProject(projectToEdit.id, { ...d, status: nextStatus });
                } else {
                   await createProject({ ...d, send_to_client: true });
                }
                Swal.fire({ title: "Terkirim!", text: "Proyek telah dikirim ke partner.", icon: "success", background: "#0F1B2E", color: "#fff", timer: 2000, showConfirmButton: false });
              } catch (e: any) {
                Swal.fire({ title: "Gagal!", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
                throw e;
              }
            }}
          />
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
