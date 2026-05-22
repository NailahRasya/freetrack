"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import ClientProjectHeader from "../../components/dashboard/milestones/ClientProjectHeader";
import ClientMilestoneCard from "../../components/dashboard/milestones/ClientMilestoneCard";
import EvidenceReviewModal from "../../components/dashboard/milestones/EvidenceReviewModal";
import ProgressTrackerCard from "../../components/dashboard/ProgressTrackerCard";
import MilestoneManager from "../../components/dashboard/freelancer/MilestoneManager";
import { useUser } from "../layout";
import { useContacts } from "@/lib/hooks/useContacts";
import { useProjects } from "@/lib/hooks/useProjects";
import { Flag, ShieldAlert, Loader2, Users, FolderPlus, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAccessDeniedToast } from "@/lib/hooks/useAccessDeniedToast";
import ProjectCompletionBanner from "../../components/dashboard/milestones/ProjectCompletionBanner";
import { useSearchParams } from "next/navigation";

// ── Inner component (needs Suspense for useSearchParams) ─────────────────────
function MilestonesContent() {
  const { role, loading: userLoading } = useUser();
  const { contacts, loading: contactsLoading } = useContacts();
  const { projects, loading: projectsLoading, refetch: refetchProjects } = useProjects();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get("project_id") || searchParams.get("projectId");
  
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isFetchingInvoices, setIsFetchingInvoices] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isFetchingMilestones, setIsFetchingMilestones] = useState(false);
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    milestoneId: string | null;
    milestoneTitle: string;
    milestone: any | null;
  }>({
    isOpen: false,
    milestoneId: null,
    milestoneTitle: "",
    milestone: null,
  });

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  // Filter projects for the selected contact/client (Freelancer)
  const filteredProjects = useMemo(() => {
    if (!selectedContact) return [];
    return projects.filter(p => 
      p.client_id === (selectedContact.client?.id || selectedContact.client_id) &&
      ["agreed", "active", "ongoing", "completed"].includes(p.status)
    );
  }, [projects, selectedContact]);

  // Projects available for Client view
  const clientProjects = useMemo(() => {
    return projects.filter(p => ["agreed", "active", "ongoing", "completed"].includes(p.status));
  }, [projects]);

  // Auto-select project and client/contact if project_id is provided in URL
  useEffect(() => {
    if (urlProjectId && projects.length > 0) {
      const targetProject = projects.find(p => p.id === urlProjectId);
      if (targetProject) {
        if (role === "freelancer" && contacts.length > 0) {
          const targetContact = contacts.find(c => 
            (c.client?.id || c.client_id) === targetProject.client_id
          );
          if (targetContact) {
            setSelectedContactId(targetContact.id);
            setSelectedProjectId(urlProjectId);
          }
        } else if (role === "client") {
          setSelectedProjectId(urlProjectId);
        }
      }
    }
  }, [urlProjectId, projects, contacts, role]);

  // Auto-select first project for clients if only one exists and no specific project is requested in URL
  useEffect(() => {
    if (role === "client" && !urlProjectId && !selectedProjectId && clientProjects.length > 0) {
      setSelectedProjectId(clientProjects[0].id);
    }
  }, [role, urlProjectId, selectedProjectId, clientProjects]);

  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch milestones & invoices when project changes or refreshKey changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProjectId) {
        setMilestones([]);
        setInvoices([]);
        return;
      }
      setIsFetchingMilestones(true);
      setIsFetchingInvoices(true);
      try {
        const [milestonesRes, invoicesRes] = await Promise.all([
          fetch(`/api/milestones?project_id=${selectedProjectId}`),
          fetch(`/api/invoices?project_id=${selectedProjectId}`)
        ]);

        const milestonesJson = await milestonesRes.json();
        const invoicesJson = await invoicesRes.json();

        setMilestones(milestonesJson.data ?? []);
        setInvoices(invoicesJson.data ?? []);
      } catch (err) {
        console.error("Failed to fetch project details:", err);
      } finally {
        setIsFetchingMilestones(false);
        setIsFetchingInvoices(false);
      }
    };
    fetchData();
  }, [selectedProjectId, refreshKey]);

  // Reads ?error= from middleware RBAC redirect → shows toast
  useAccessDeniedToast();

  const completedCount = milestones.filter((m) => 
    ["Completed", "Disetujui", "Approved", "Waiting for Approval", "Menunggu Persetujuan"].includes(m.status)
  ).length;
  const progressPercentage = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const allMilestonesApproved = useMemo(() => {
    return milestones.length > 0 && milestones.every(m => 
      ["Approved", "Disetujui", "Completed"].includes(m.status)
    );
  }, [milestones]);

  const allInvoicesPaid = useMemo(() => {
    return milestones.length > 0 && milestones.every(m => {
      const inv = invoices.find(i => i.milestone_id === m.id);
      return inv && inv.status === "paid";
    });
  }, [milestones, invoices]);

  const handleProjectCompleted = () => {
    refetchProjects();
    setRefreshKey(prev => prev + 1);
  };

  const loading = userLoading || contactsLoading || projectsLoading;

  const handleApprove = async (id: string) => {
    setActionError(null);
    try {
      const res = await fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Approved" }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setActionError(error ?? "Failed to approve milestone.");
        return;
      }

      // Auto-create invoice for this milestone
      try {
        await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ milestone_id: id }),
        });
      } catch (invoiceErr) {
        console.error("Failed to auto-create invoice:", invoiceErr);
      }

      setMilestones((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: "Approved" } : m
        )
      );
    } catch {
      setActionError("Network error — please try again.");
    }
  };

  const handleReview = (id: string) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone) {
      setReviewModalState({
        isOpen: true,
        milestoneId: id,
        milestoneTitle: milestone.title,
        milestone: milestone,
      });
    }
  };

  const handleReviewModalClose = () => {
    setReviewModalState({
      isOpen: false,
      milestoneId: null,
      milestoneTitle: "",
      milestone: null,
    });
  };

  const handleEvidenceApprove = () => {
    // Refresh milestones after approval
    setRefreshKey(prev => prev + 1);
  };

  const handleEvidenceRevision = () => {
    // Refresh milestones after requesting revision
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "15px", fontWeight: "600" }}>Loading milestones…</span>
      </div>
    );
  }

  const PageHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: "28px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "rgba(26,54,240,0.12)",
          border: "1px solid rgba(26,54,240,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Flag size={18} style={{ color: "var(--cyan)" }} />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px" }}>
          Target Pencapaian (Milestone)
        </h2>
      </div>
      <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", paddingLeft: "46px" }}>
        Pantau kemajuan proyek dan kelola tahapan pengerjaan secara transparan.
      </p>
    </motion.div>
  );

  if (role === "freelancer") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <PageHeader />
        
        {selectedProject && (
          <ProjectCompletionBanner
            project={selectedProject}
            role={role}
            allMilestonesApproved={allMilestonesApproved}
            allInvoicesPaid={allInvoicesPaid}
            onProjectCompleted={handleProjectCompleted}
          />
        )}
        
        {/* Client & Project Selection */}
        <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", display: "flex", flexDirection: "column", gap: "20px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
               <label style={{ fontSize: "12px", fontWeight: "700", color: "rgba(226, 232, 240, 0.4)", textTransform: "uppercase" }}>Pilih Klien</label>
               <select 
                 value={selectedContactId || ""} 
                 onChange={(e) => {
                   setSelectedContactId(e.target.value);
                   setSelectedProjectId(null); // Reset project when client changes
                 }}
                 style={{
                   background: "rgba(255,255,255,0.05)",
                   border: "1px solid rgba(255,255,255,0.1)",
                   padding: "10px 16px",
                   borderRadius: "12px",
                   color: "#fff",
                   outline: "none",
                   fontSize: "14px",
                   minWidth: "240px"
                 }}
               >
                 <option value="" style={{ background: "#0B1220" }}>Pilih klien terhubung...</option>
                 {contacts.map(contact => {
                   const clientProfile = contact.client;
                   return (
                     <option key={contact.id} value={contact.id} style={{ background: "#0B1220" }}>
                       {clientProfile?.full_name || clientProfile?.email || "Klien Tanpa Nama"}
                     </option>
                   );
                 })}
               </select>
             </div>

             {selectedContact && (
               <motion.div 
                 initial={{ opacity: 0, x: 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 style={{ display: "flex", flexDirection: "column", gap: "4px" }}
               >
                 <label style={{ fontSize: "12px", fontWeight: "700", color: "rgba(226, 232, 240, 0.4)", textTransform: "uppercase" }}>Pilih Proyek</label>
                 <select 
                   value={selectedProjectId || ""} 
                   onChange={(e) => setSelectedProjectId(e.target.value)}
                   style={{
                     background: "rgba(255,255,255,0.05)",
                     border: "1px solid rgba(255,255,255,0.1)",
                     padding: "10px 16px",
                     borderRadius: "12px",
                     color: "#fff",
                     outline: "none",
                     fontSize: "14px",
                     minWidth: "240px"
                   }}
                 >
                   <option value="" style={{ background: "#0B1220" }}>Pilih proyek aktif...</option>
                   {filteredProjects.map(project => (
                     <option key={project.id} value={project.id} style={{ background: "#0B1220" }}>
                       {project.title}
                     </option>
                   ))}
                 </select>
               </motion.div>
             )}
           </div>

           {contacts.length === 0 && (
             <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--warning)" }}>
               <ShieldAlert size={14} />
               <span>Belum ada kontak yang terhubung.</span>
             </div>
           )}
           
           {selectedContact && filteredProjects.length === 0 && (
             <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
               <FolderPlus size={16} style={{ color: "var(--warning)" }} />
                <span style={{ fontSize: "13px", color: "var(--warning)" }}>
                  Belum ada proyek aktif dengan <strong>{selectedContact.client?.full_name || selectedContact.client?.email}</strong>.{" "}
                  Silakan selesaikan proses negosiasi atau ajukan lamaran di menu "Pesan".
                </span>
             </div>
           )}
        </div>

        {selectedProjectId ? (
          (selectedProject?.status === "agreed" || selectedProject?.status === "active" || selectedProject?.status === "ongoing" || selectedProject?.status === "completed") ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
               <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <ProgressTrackerCard 
                    percentage={progressPercentage} 
                    completedCount={completedCount} 
                    totalCount={milestones.length}
                    nextMilestone={milestones.find(m => m.status !== "Completed" && m.status !== "Disetujui" && m.status !== "Approved")?.title}
                  />
                  <div className="glass-card" style={{ padding: "24px", background: "rgba(26, 54, 240, 0.05)", border: "1px solid rgba(26, 54, 240, 0.1)" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", marginBottom: "12px" }}>Tips Milestone</h4>
                    <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.6" }}>
                      Mengelola proyek <strong>{selectedProject?.title}</strong>. 
                      Pastikan setiap milestone memiliki deskripsi yang jelas untuk mempermudah persetujuan klien.
                    </p>
                  </div>
               </div>
               
               <div style={{ minWidth: 0 }}>
                 <MilestoneManager 
                   clientName={selectedContact?.client?.full_name || selectedContact?.client?.email} 
                   projectId={selectedProjectId}
                   initialMilestones={milestones}
                   onMilestoneCreated={() => setRefreshKey(prev => prev + 1)}
                 />
               </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              style={{ padding: "80px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", background: "rgba(15, 27, 46, 0.6)" }}
            >
              <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}>
                <Clock size={40} />
              </div>
              <div style={{ maxWidth: "500px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#fff", marginBottom: "12px" }}>
                  {selectedProject?.status === "published" ? "Belum Mengajukan Lamaran" : "Dalam Tahap Negosiasi"}
                </h3>
                <p style={{ fontSize: "15px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.6" }}>
                  {selectedProject?.status === "published" 
                    ? "Anda harus mengajukan lamaran terlebih dahulu untuk proyek ini sebelum dapat menyusun milestone."
                    : "Proyek ini masih dalam tahap negosiasi antara Anda dan Klien. Milestone hanya dapat dikelola setelah kedua belah pihak mencapai kesepakatan."}
                </p>
              </div>
              <Link href={`/dashboard/messages?chat=${selectedProject?.client_id}&project=${selectedProjectId}`}>
                <button className="btn-primary" style={{ padding: "12px 28px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  {selectedProject?.status === "published" ? "Ajukan Lamaran di Chat" : "Selesaikan Negosiasi"} <ChevronRight size={18} />
                </button>
              </Link>
            </motion.div>
          )
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card"
            style={{ padding: "80px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
          >
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.1)" }}>
              {selectedContact ? <FolderPlus size={32} /> : <Users size={32} />}
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
                {selectedContact ? "Pilih Proyek Aktif" : "Pilih Klien Terlebih Dahulu"}
              </h3>
              <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.4)", maxWidth: "400px" }}>
                {selectedContact 
                  ? "Silakan pilih salah satu proyek aktif Anda dengan klien ini untuk mulai mengelola target pencapaian."
                  : "Silakan pilih klien terhubung untuk mulai mengelola target pencapaian (milestone)."}
              </p>
            </div>
          </motion.div>
        )}

        <style jsx>{`
          @media (max-width: 1024px) {
            div[style*="gridTemplateColumns: 1fr 2fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // ── Client View ──
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Action error banner (API-level rejection) */}
      {actionError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: "20px",
            padding: "12px 18px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#FCA5A5",
            fontSize: "13px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <ShieldAlert size={16} />
          {actionError}
          <button
            onClick={() => setActionError(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#FCA5A5", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}
          >
            ×
          </button>
        </motion.div>
      )}

      <PageHeader />

      {selectedProject && (
        <ProjectCompletionBanner
          project={selectedProject}
          role={role}
          allMilestonesApproved={allMilestonesApproved}
          allInvoicesPaid={allInvoicesPaid}
          onProjectCompleted={handleProjectCompleted}
        />
      )}

      {/* Project Selector for Client */}
      <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", marginBottom: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "rgba(226, 232, 240, 0.4)", textTransform: "uppercase" }}>Pilih Proyek Anda</label>
          <select 
            value={selectedProjectId || ""} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "12px 16px",
              borderRadius: "12px",
              color: "#fff",
              outline: "none",
              fontSize: "14px",
              maxWidth: "400px"
            }}
          >
            <option value="" style={{ background: "#0B1220" }}>Pilih proyek yang ingin dipantau...</option>
            {clientProjects.map(project => (
              <option key={project.id} value={project.id} style={{ background: "#0B1220" }}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProjectId ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px", marginBottom: "32px" }}>
            <ProgressTrackerCard 
              percentage={progressPercentage} 
              completedCount={completedCount} 
              totalCount={milestones.length}
              nextMilestone={milestones.find(m => m.status !== "Completed" && m.status !== "Disetujui")?.title}
            />
            <ClientProjectHeader
              projectName={selectedProject?.title || "Proyek Tidak Teridentifikasi"}
              totalBudget={selectedProject?.budget?.toString() || "0"}
              completionPercentage={progressPercentage}
              completedCount={completedCount}
              totalCount={milestones.length}
            />
          </div>

          {/* Section label */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "20px",
          }}>
            <h3 style={{ fontSize: "15px", fontWeight: "800", color: "rgba(226,232,240,0.7)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Daftar Milestone Proyek
              <span style={{
                marginLeft: "10px",
                fontSize: "11px", fontWeight: "700",
                color: "var(--cyan)",
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.2)",
                padding: "2px 8px", borderRadius: "6px",
              }}>
                {milestones.length} total
              </span>
            </h3>
          </div>

          {/* Milestone cards grid */}
          {milestones.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{
                padding: "60px 32px",
                textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
              }}
            >
              <Flag size={44} style={{ color: "rgba(226,232,240,0.12)" }} />
              <p style={{ fontSize: "16px", fontWeight: "700", color: "rgba(226,232,240,0.3)" }}>
                Belum ada milestone
              </p>
              <p style={{ fontSize: "13px", color: "rgba(226,232,240,0.2)" }}>
                Freelancer Anda belum membuat milestone untuk proyek ini.
              </p>
            </motion.div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "20px",
            }}>
              {milestones.map((milestone, idx) => (
                <ClientMilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  index={idx}
                  onApprove={handleApprove}
                  onReview={handleReview}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{ padding: "80px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
        >
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.1)" }}>
            <FolderPlus size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
              Silakan Pilih Proyek
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.4)", maxWidth: "400px" }}>
              Pilih salah satu proyek aktif Anda untuk melihat perkembangan milestone dan memberikan persetujuan.
            </p>
          </div>
        </motion.div>
      )}

      <style jsx>{`
          @media (max-width: 1200px) {
            div[style*="gridTemplateColumns: 1fr 2fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

      {/* Evidence Review Modal */}
      <EvidenceReviewModal
        isOpen={reviewModalState.isOpen}
        onClose={handleReviewModalClose}
        milestoneId={reviewModalState.milestoneId}
        milestoneTitle={reviewModalState.milestoneTitle}
        milestone={reviewModalState.milestone}
        projectName={selectedProject?.title || ""}
        freelancerName={selectedProject?.freelancer?.full_name || selectedProject?.freelancer?.email || "Freelancer"}
        userRole={role}
        onApprove={handleEvidenceApprove}
        onRequestRevision={handleEvidenceRevision}
      />
    </div>
  );
}

// ── Page export (Suspense wrapper for useSearchParams) ────────────────────────
export default function MilestonesPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "15px", fontWeight: "600" }}>Loading…</span>
      </div>
    }>
      <MilestonesContent />
    </Suspense>
  );
}
