"use client";

import React, { useState } from "react";
import ProjectMarketFeed from "../../components/dashboard/ProjectMarketFeed";
import CreateProjectModal from "../../components/dashboard/CreateProjectModal";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import { useUser } from "../layout";
import { useProjects } from "@/lib/hooks/useProjects";
import { useContacts } from "@/lib/hooks/useContacts";
import Swal from "sweetalert2";

export default function MarketPage() {
  const { role } = useUser();
  const { createProject, updateProject, deleteProject } = useProjects();
  const { contacts } = useContacts();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Proyek?",
      text: "Data yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: "#0F1B2E",
      color: "#fff",
      confirmButtonColor: "#EF4444"
    });

    if (result.isConfirmed) {
      try {
        await deleteProject(id);
        Swal.fire({ title: "Terhapus!", icon: "success", background: "#0F1B2E", color: "#fff", timer: 1500, showConfirmButton: false });
        // Window reload to refresh feed
        window.location.reload();
      } catch (e: any) {
        Swal.fire({ title: "Gagal!", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
      }
    }
  };

  const handleEdit = (p: any) => {
    setSelectedProject(p);
    setShowCreate(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <header>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", flexWrap: "wrap" }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
               <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
                  <Sparkles size={20} />
               </div>
               <h1 style={{ 
                  fontSize: "28px", 
                  fontWeight: "900", 
                  color: "#fff", 
                  letterSpacing: "-0.5px",
                  margin: 0
                }}>
                  Project <span className="gradient-text">Marketplace</span>
               </h1>
            </div>
            <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "15px" }}>
              Temukan peluang proyek baru atau pantau postingan yang sedang aktif di marketplace.
            </p>
          </motion.div>

          {mounted && role === "client" && (
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="btn-primary" 
              onClick={() => setShowCreate(true)}
              style={{ 
                padding: "12px 24px", 
                borderRadius: "14px", 
                fontSize: "14px", 
                fontWeight: "700", 
                display: "flex", 
                alignItems: "center", 
                gap: "8px" 
              }}
            >
              <Plus size={18} /> Buat Postingan Proyek
            </motion.button>
          )}
        </div>
      </header>

      {mounted && <ProjectMarketFeed onEdit={handleEdit} onDelete={handleDelete} />}

      {/* Modal Buat Proyek */}
      <AnimatePresence>
        {mounted && showCreate && (
          <CreateProjectModal
            contacts={contacts}
            onClose={() => {
              setShowCreate(false);
              setSelectedProject(null);
            }}
            initialData={selectedProject}
            onSaveDraft={async d => {
              try {
                if (selectedProject) {
                  await updateProject(selectedProject.id, d);
                } else {
                  await createProject({ ...d, send_to_client: false });
                }
                Swal.fire({ 
                  title: d.status === "published" ? "Dipublikasikan!" : "Tersimpan!", 
                  text: d.status === "published" ? "Proyek Anda kini live di marketplace." : "Draf proyek berhasil disimpan.", 
                  icon: "success", 
                  background: "#0F1B2E", 
                  color: "#fff", 
                  timer: 2000, 
                  showConfirmButton: false 
                });
                window.location.reload();
              } catch (e: any) {
                Swal.fire({ title: "Gagal!", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
                throw e;
              }
            }}
            onSendToClient={async d => {
              try {
                if (selectedProject) {
                  await updateProject(selectedProject.id, { ...d, send_to_client: true });
                } else {
                  await createProject({ ...d, send_to_client: true });
                }
                Swal.fire({ title: "Terkirim!", text: "Proyek telah dikirim ke partner.", icon: "success", background: "#0F1B2E", color: "#fff", timer: 2000, showConfirmButton: false });
                window.location.reload();
              } catch (e: any) {
                Swal.fire({ title: "Gagal!", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
                throw e;
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
