"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  Clock, 
  User, 
  Bookmark, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  Loader2, 
  Paperclip, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserPlus,
  Sparkles,
  DollarSign
} from "lucide-react";
import { useUser } from "../../layout";
import { useContacts } from "@/lib/hooks/useContacts";
import { parseProjectDescription } from "@/app/lib/project-helper";
import { getLabelById, ONBOARDING_CATEGORIES } from "@/app/constants/onboarding-categories";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

function findSkillAndCategory(searchStr: string) {
  try {
    if (!searchStr) return { categoryId: null, skillId: null };
    const normalized = String(searchStr).toLowerCase().trim();
    if (typeof ONBOARDING_CATEGORIES === "undefined" || !ONBOARDING_CATEGORIES) {
      return { categoryId: null, skillId: null };
    }
    for (const cat of ONBOARDING_CATEGORIES) {
      if (!cat) continue;
      const catId = cat.id ? String(cat.id).toLowerCase() : "";
      const catLabel = cat.label ? String(cat.label).toLowerCase() : "";
      if (catId === normalized || catLabel === normalized) {
        return { categoryId: cat.id, skillId: null };
      }
      if (cat.skills && Array.isArray(cat.skills)) {
        for (const skill of cat.skills) {
          if (!skill) continue;
          const skillId = skill.id ? String(skill.id).toLowerCase() : "";
          const skillLabel = skill.label ? String(skill.label).toLowerCase() : "";
          if (skillId === normalized || skillLabel === normalized) {
            return { categoryId: cat.id, skillId: skill.id };
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in findSkillAndCategory:", err);
  }
  return { categoryId: null, skillId: null };
}

export default function ProjectDetailPage() {
  const { user, role } = useUser();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<any>(null);
  const [clientOb, setClientOb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Contacts states
  const { contacts, invitations, loading: contactsLoading, ensureContact, refetch: refetchContacts } = useContacts();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "pending_sent" | "pending_received" | "unconnected">("unconnected");
  const [activeInvitationId, setActiveInvitationId] = useState<string | null>(null);

  // Proposal modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [expectedTimeline, setExpectedTimeline] = useState("");
  const [expectedBudget, setExpectedBudget] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [matchPercent, setMatchPercent] = useState(60);

  useEffect(() => {
    if (!projectId) return;

    // Load saved projects from LocalStorage
    const saved = localStorage.getItem("freetrack_saved_projects");
    if (saved) {
      try {
        const savedIds = JSON.parse(saved);
        setIsSaved(savedIds.includes(projectId));
      } catch (e) {}
    }

    async function fetchProjectDetails() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            client:profiles!projects_client_id_fkey(id, full_name, email, avatar_url, role)
          `)
          .eq("id", projectId)
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Proyek tidak ditemukan.");
        }

        setProject(data);

        // Fetch client onboarding stats
        let clientObData = null;
        if (data.client_id) {
          const { data: obData } = await supabase
            .from("onboarding_client")
            .select("*")
            .eq("user_id", data.client_id)
            .maybeSingle();
          setClientOb(obData);
          clientObData = obData;
        }

        // Fetch freelancer onboarding and calculate match score
        let freelancerPref = null;
        if (user?.id && role === "freelancer") {
          const { data: frePrefs } = await supabase
            .from("onboarding_freelancer")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          freelancerPref = frePrefs || null;
        }

        if (freelancerPref && data) {
          const clientObInfo = clientObData || {};
          const cleanSkills = data.required_skills?.filter((s: string) => s && !s.startsWith("EXP:") && !s.startsWith("WORK:")) || [];
          
          const embeddedExp = data.required_skills?.find((s: string) => s && s.startsWith("EXP:"))?.replace("EXP:", "");
          const embeddedWork = data.required_skills?.find((s: string) => s && s.startsWith("WORK:"))?.replace("WORK:", "");
          
          const effectiveExp = embeddedExp || clientObInfo.experience_preference;
          const effectiveWork = embeddedWork || clientObInfo.work_type;

          const freelancerSkillIds: string[] = Array.isArray(freelancerPref.skill_categories)
            ? freelancerPref.skill_categories.filter(Boolean).map((s: string) => String(s).toLowerCase())
            : [];

          const freelancerCategoryIds: string[] = Array.from(new Set(
            freelancerSkillIds.map(sid => {
              const match = findSkillAndCategory(sid);
              return match?.categoryId ?? null;
            }).filter(Boolean) as string[]
          ));

          let categoryMatchScore = 0;
          const categoryMatch = freelancerCategoryIds.includes(String(data.category_id || "").toLowerCase());
          if (categoryMatch) {
            categoryMatchScore = 50;
          }

          let skillsScore = 0;
          for (const skillLabel of cleanSkills) {
            const resolved = findSkillAndCategory(String(skillLabel));
            const skillMatchesFreelancer =
              (resolved.skillId && freelancerSkillIds.includes(resolved.skillId.toLowerCase())) ||
              (resolved.categoryId && freelancerCategoryIds.includes(resolved.categoryId.toLowerCase())) ||
              freelancerSkillIds.includes(String(skillLabel).toLowerCase()) ||
              freelancerCategoryIds.includes(String(skillLabel).toLowerCase());

            if (skillMatchesFreelancer) {
              skillsScore += 15;
            }
          }

          let score = 10 + categoryMatchScore + skillsScore;
          if (Array.isArray(freelancerPref.preferred_client_scales) && freelancerPref.preferred_client_scales.includes(clientObInfo.business_scale)) score += 20;
          if (Array.isArray(freelancerPref.work_type_preference) && freelancerPref.work_type_preference.includes(effectiveWork)) score += 20;
          if (freelancerPref.experience_level === effectiveExp) score += 30;

          let percent = 60;
          if (score >= 100) percent = 95;
          else if (score >= 70) percent = 88;
          else if (score >= 40) percent = 75;
          setMatchPercent(percent);
        }

        // Check if freelancer already applied to this project
        if (user?.id && role === "freelancer") {
          const { data: appliedProj } = await supabase
            .from("projects")
            .select("id")
            .eq("freelancer_id", user.id)
            .like("description", `%[source_id:${projectId}]%`)
            .maybeSingle();

          if (appliedProj) {
            setHasApplied(true);
          }
        }
      } catch (err: any) {
        console.error("Failed to load project details:", err);
        Swal.fire({
          title: "Error",
          text: err.message || "Gagal memuat detail proyek.",
          icon: "error",
          background: "#0F1B2E",
          color: "#fff"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProjectDetails();
  }, [projectId, user?.id, role]);

  // Determine connection status
  useEffect(() => {
    if (!project?.client_id || !user?.id) return;

    // Check if accepted contact exists
    const acceptedContact = contacts.find((c: any) => 
      (c.freelancer_id === user.id && c.client_id === project.client_id) ||
      (c.freelancer_id === project.client_id && c.client_id === user.id)
    );

    if (acceptedContact) {
      setConnectionStatus("connected");
      return;
    }

    // Check if pending invitation exists
    const pendingInvitation = invitations.find((i: any) => 
      (i.freelancer_id === user.id && i.client_id === project.client_id) ||
      (i.freelancer_id === project.client_id && i.client_id === user.id)
    );

    if (pendingInvitation) {
      setActiveInvitationId(pendingInvitation.id);
      if (pendingInvitation.invited_by === user.id) {
        setConnectionStatus("pending_sent");
      } else {
        setConnectionStatus("pending_received");
      }
    } else {
      setConnectionStatus("unconnected");
      setActiveInvitationId(null);
    }
  }, [contacts, invitations, project?.client_id, user?.id]);

  const toggleSave = () => {
    if (!projectId) return;
    const saved = localStorage.getItem("freetrack_saved_projects");
    let savedIds = [];
    if (saved) {
      try { savedIds = JSON.parse(saved); } catch (e) {}
    }

    let nextSaved = [...savedIds];
    if (savedIds.includes(projectId)) {
      nextSaved = nextSaved.filter(id => id !== projectId);
      setIsSaved(false);
      Swal.fire({ 
        title: "Dihapus!", 
        text: "Proyek dihapus dari daftar simpanan.", 
        icon: "info", 
        timer: 1200, 
        showConfirmButton: false, 
        background: "#0F1B2E", 
        color: "#fff" 
      });
    } else {
      nextSaved.push(projectId);
      setIsSaved(true);
      Swal.fire({ 
        title: "Disimpan!", 
        text: "Proyek berhasil disimpan ke bookmark Anda.", 
        icon: "success", 
        timer: 1200, 
        showConfirmButton: false, 
        background: "#0F1B2E", 
        color: "#fff" 
      });
    }
    localStorage.setItem("freetrack_saved_projects", JSON.stringify(nextSaved));
  };

  const handleSendConnectionRequest = async () => {
    if (!project?.client_id) return;
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: project.client_id, status: "pending" })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      
      Swal.fire({
        title: "Terkirim!",
        text: "Permintaan koneksi berhasil dikirim ke klien.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#0F1B2E",
        color: "#fff"
      });
      refetchContacts();
    } catch (err: any) {
      Swal.fire({
        title: "Gagal",
        text: err.message || "Gagal mengirim permintaan koneksi.",
        icon: "error",
        background: "#0F1B2E",
        color: "#fff"
      });
    }
  };

  const handleAcceptConnection = async () => {
    if (!activeInvitationId) return;
    try {
      const res = await fetch("/api/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeInvitationId, status: "accepted" })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      Swal.fire({
        title: "Terhubung!",
        text: "Anda kini terhubung dengan klien ini.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#0F1B2E",
        color: "#fff"
      });
      refetchContacts();
    } catch (err: any) {
      Swal.fire({
        title: "Gagal",
        text: err.message || "Gagal menerima permintaan koneksi.",
        icon: "error",
        background: "#0F1B2E",
        color: "#fff"
      });
    }
  };

  const handleApplyProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      Swal.fire({ title: "Peringatan", text: "Surat lamaran wajib diisi.", icon: "warning", background: "#0F1B2E", color: "#fff" });
      return;
    }
    if (!expectedBudget.trim()) {
      Swal.fire({ title: "Peringatan", text: "Anggaran yang diharapkan wajib diisi.", icon: "warning", background: "#0F1B2E", color: "#fff" });
      return;
    }
    if (!expectedTimeline.trim()) {
      Swal.fire({ title: "Peringatan", text: "Estimasi waktu pengerjaan wajib diisi.", icon: "warning", background: "#0F1B2E", color: "#fff" });
      return;
    }

    const parsed = parseProjectDescription(project.description);
    
    // Validate screening questions
    if (parsed.screening_questions && parsed.screening_questions.length > 0) {
      for (let i = 0; i < parsed.screening_questions.length; i++) {
        if (!answers[i] || !answers[i].trim()) {
          Swal.fire({
            title: "Peringatan",
            text: `Harap jawab semua pertanyaan screening terlebih dahulu.`,
            icon: "warning",
            background: "#0F1B2E",
            color: "#fff"
          });
          return;
        }
      }
    }

    try {
      setSubmittingProposal(true);
      Swal.fire({
        title: "Mengirim Proposal...",
        text: "Menduplikasi proyek penawaran dan inisiasi kontak.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => { Swal.showLoading(); },
        background: "#0F1B2E",
        color: "#fff"
      });

      // Structure proposal fields
      let formattedProposalReason = `--- SURAT LAMARAN ---
${coverLetter.trim()}

--- ANGGARAN & LINIMASA DIHARAPKAN ---
Anggaran: ${expectedBudget.trim()}
Estimasi Waktu: ${expectedTimeline.trim()}`;

      if (parsed.screening_questions && parsed.screening_questions.length > 0) {
        formattedProposalReason += `\n\n--- PERTANYAAN SCREENING ---`;
        parsed.screening_questions.forEach((q, idx) => {
          formattedProposalReason += `\n\nPertanyaan ${idx + 1}: ${q}\nJawaban: ${answers[idx]?.trim() || "-"}`;
        });
      }

      // Call PATCH endpoint to trigger the cloned proposal creation
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectId,
          proposal_reason: formattedProposalReason,
          status: "pending_client"
        })
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      // Create contact chat instantly
      await ensureContact(project.client_id);

      setShowApplyModal(false);
      setHasApplied(true);
      Swal.close();

      await Swal.fire({
        title: "Proposal Terkirim! 🎉",
        text: "Lamaran berhasil dibuat. Anda diarahkan ke obrolan diskusi bersama klien.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "#0F1B2E",
        color: "#fff"
      });

      router.push(`/dashboard/messages?chat=${project.client_id}&project=${project.id}`);
    } catch (err: any) {
      Swal.fire({
        title: "Gagal",
        text: err.message || "Gagal mengirimkan lamaran.",
        icon: "error",
        background: "#0F1B2E",
        color: "#fff"
      });
    } finally {
      setSubmittingProposal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={40} className="animate-spin" style={{ color: "var(--cyan)", marginBottom: "16px" }} />
        <p style={{ fontSize: "16px", fontWeight: "700" }}>Memuat detail proyek...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "rgba(226,232,240,0.4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <AlertCircle size={48} style={{ color: "#EF4444" }} />
        <h3 style={{ color: "#fff", fontWeight: "800", fontSize: "20px" }}>Proyek Tidak Ditemukan</h3>
        <p>Maaf, proyek yang Anda cari tidak tersedia atau telah dihapus.</p>
        <button onClick={() => router.push("/dashboard/marketplace")} className="btn-primary" style={{ padding: "10px 20px", borderRadius: "12px" }}>
          Kembali ke Marketplace
        </button>
      </div>
    );
  }

  const parsed = parseProjectDescription(project.description);
  const formattedDate = new Date(project.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header & Navigation */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button 
          onClick={() => router.push("/dashboard/marketplace")}
          style={{
            display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 16px",
            color: "rgba(226, 232, 240, 0.7)", cursor: "pointer", fontSize: "13px", fontWeight: "700",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(226, 232, 240, 0.7)"; }}
        >
          <ArrowLeft size={16} /> Kembali ke Marketplace
        </button>
      </header>

      {/* Main Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "28px", alignItems: "flex-start" }}>
        
        {/* Left Column: Comprehensive details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-card" style={{
            padding: "40px", background: "rgba(10, 20, 45, 0.3)", borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.05)", position: "relative", overflow: "hidden"
          }}>
            {/* Ambient glows */}
            <div style={{
              position: "absolute", top: "-100px", right: "-100px", width: "300px", height: "300px",
              background: "radial-gradient(circle, rgba(77, 99, 255, 0.05) 0%, transparent 70%)", pointerEvents: "none"
            }} />

            {/* Project Header Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                <span style={{ padding: "6px 12px", background: "rgba(77, 99, 255, 0.1)", borderRadius: "8px", color: "#4D63FF", fontSize: "11px", fontWeight: "900", textTransform: "uppercase" }}>
                  {getLabelById(project.category_id) || "Design"}
                </span>
                {role === "freelancer" && (
                  <span style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "900",
                    background: matchPercent >= 85 ? "rgba(16,185,129,0.1)" : "rgba(6,182,212,0.1)",
                    color: matchPercent >= 85 ? "#10B981" : "#06B6D4",
                    border: `1px solid ${matchPercent >= 85 ? "rgba(16,185,129,0.15)" : "rgba(6,182,212,0.15)"}`
                  }}>
                    {matchPercent}% Match
                  </span>
                )}
                <span style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.35)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={13} /> Dibuat pada {formattedDate}
                </span>
              </div>

              <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#fff", lineHeight: "1.25", margin: 0 }}>
                {project.title}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "rgba(226,232,240,0.5)" }}>
                <span>Klien: <strong style={{ color: "#fff" }}>{project.client?.full_name || "Klien FreeTrack"}</strong></span>
              </div>
            </div>

            {/* Ringkasan Singkat (Summary) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <Sparkles size={16} style={{ color: "var(--cyan)" }} /> Ringkasan Singkat
              </h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(226,232,240,0.7)", background: "rgba(255,255,255,0.02)", padding: "16px 20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
                {parsed.summary || "Tidak ada ringkasan singkat."}
              </p>
            </div>

            {/* Deskripsi Lengkap */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>Deskripsi Proyek</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(226,232,240,0.65)", whiteSpace: "pre-line" }}>
                {parsed.description || "Tidak ada deskripsi lengkap."}
              </p>
            </div>

            {/* Goals */}
            {parsed.goals && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>Tujuan Proyek (Goals)</h3>
                <p style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(226,232,240,0.65)", whiteSpace: "pre-line" }}>
                  {parsed.goals}
                </p>
              </div>
            )}

            {/* Deliverables */}
            {parsed.deliverables && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>Hasil Akhir (Deliverables)</h3>
                <p style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(226,232,240,0.65)", whiteSpace: "pre-line" }}>
                  {parsed.deliverables}
                </p>
              </div>
            )}

            {/* Screening Questions Preview */}
            {parsed.screening_questions && parsed.screening_questions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} style={{ color: "#F59E0B" }} /> Pertanyaan Penyaringan (Screening Questions)
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {parsed.screening_questions.map((q, idx) => (
                    <div key={idx} style={{ padding: "12px 16px", background: "rgba(245, 158, 11, 0.03)", borderLeft: "3px solid #F59E0B", borderRadius: "0 10px 10px 0", fontSize: "14px", color: "rgba(226,232,240,0.8)" }}>
                      <strong>Pertanyaan {idx + 1}:</strong> {q}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments / References */}
            {parsed.attachments && parsed.attachments.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Paperclip size={16} style={{ color: "var(--cyan)" }} /> Lampiran & Referensi
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {parsed.attachments.map((link, idx) => {
                    const isUrl = link.startsWith("http://") || link.startsWith("https://");
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                        {isUrl ? (
                          <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan-light)", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
                            <ExternalLink size={14} /> {link}
                          </a>
                        ) : (
                          <span style={{ color: "rgba(226,232,240,0.6)" }}>{link}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Project Meta Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Budget & Meta Card */}
          <div className="glass-card" style={{
            padding: "28px", background: "rgba(13, 25, 48, 0.4)", borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "20px"
          }}>
            <div>
              <div style={{ fontSize: "13px", color: "rgba(226,232,240,0.4)", marginBottom: "4px" }}>
                {parsed.budget_type === "hourly" ? "Tarif Per Jam (Hourly)" : "Estimasi Anggaran"}
              </div>
              <div style={{ fontSize: "28px", fontWeight: "950", color: "#00FFA3", display: "flex", alignItems: "center", gap: "6px" }}>
                <DollarSign size={24} style={{ color: "#00FFA3" }} /> {project.budget}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
              
              {/* Duration */}
              {parsed.duration && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.08)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "#06B6D4" }}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>Estimasi Durasi</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{parsed.duration}</div>
                  </div>
                </div>
              )}

              {/* Deadline */}
              {(parsed.deadline || project.deadline) && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(225, 29, 72, 0.08)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "#E11D48" }}>
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>Batas Waktu</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{parsed.deadline || project.deadline}</div>
                  </div>
                </div>
              )}

              {/* Freelancer Level */}
              {parsed.experienceLevel && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.08)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "#F59E0B" }}>
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>Level Freelancer</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", textTransform: "capitalize" }}>
                      {parsed.experienceLevel === "junior" ? "Junior" : parsed.experienceLevel === "mid" ? "Intermediate (Menengah)" : "Expert (Ahli)"}
                    </div>
                  </div>
                </div>
              )}

              {/* Communication Pref */}
              {parsed.communication_preference && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.08)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "#10B981" }}>
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>Preferensi Komunikasi</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{parsed.communication_preference}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Required Skills */}
            {project.required_skills && project.required_skills.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
                <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>Keahlian yang Dibutuhkan</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {project.required_skills.filter((s: string) => s && !s.startsWith("EXP:") && !s.startsWith("WORK:")).map((skill: string) => (
                    <span key={skill} style={{ fontSize: "11px", fontWeight: "700", color: "#10B981", background: "rgba(16, 185, 129, 0.05)", padding: "5px 10px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                      #{skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* About Client Card */}
          <div className="glass-card" style={{
            padding: "24px", background: "rgba(10, 20, 45, 0.2)", borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", gap: "16px"
          }}>
            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", margin: 0 }}>Tentang Klien</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800" }}>
                {project.client?.full_name?.charAt(0) ?? "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {project.client?.full_name || "Klien FreeTrack"}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {project.client?.email}
                </div>
              </div>
            </div>

            {/* Client Preferences stats */}
            {clientOb && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "rgba(226,232,240,0.5)", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px" }}>
                <div>Skala Bisnis: <strong style={{ color: "#fff" }}>{clientOb.business_scale || "Individu"}</strong></div>
                {clientOb.work_type && <div>Kerjasama Pilihan: <strong style={{ color: "#fff" }}>{clientOb.work_type === "ongoing" ? "Berkelanjutan" : "Satu Kali"}</strong></div>}
              </div>
            )}

            {/* Contact Connection Widget */}
            {role === "freelancer" && user?.id && project.client_id !== user.id && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>Status Kontak:</div>
                
                {contactsLoading ? (
                  <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.3)" }}>Memeriksa hubungan...</div>
                ) : (
                  <>
                    {connectionStatus === "connected" && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.08)",
                        padding: "8px 12px", borderRadius: "10px", color: "#10B981", fontSize: "12px", fontWeight: "700"
                      }}>
                        <UserCheck size={14} /> Terhubung (Kontak Anda)
                      </div>
                    )}

                    {connectionStatus === "pending_sent" && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "8px", background: "rgba(245, 158, 11, 0.08)",
                        padding: "8px 12px", borderRadius: "10px", color: "#F59E0B", fontSize: "12px", fontWeight: "700"
                      }}>
                        <Clock size={14} /> Permintaan Terkirim
                      </div>
                    )}

                    {connectionStatus === "pending_received" && (
                      <button
                        onClick={handleAcceptConnection}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                          background: "#F59E0B", color: "#000", border: "none", borderRadius: "10px",
                          padding: "8px 12px", fontSize: "12px", fontWeight: "800", cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <UserCheck size={14} /> Terima Koneksi
                      </button>
                    )}

                    {connectionStatus === "unconnected" && (
                      <button
                        onClick={handleSendConnectionRequest}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "10px", padding: "8px 12px", color: "#fff", fontSize: "12px",
                          fontWeight: "800", cursor: "pointer", transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      >
                        <UserPlus size={14} /> Tambahkan ke Kontak
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          {role === "freelancer" && project.client_id !== user?.id && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* Primary Action: Apply / Sudah Dilamar */}
              {hasApplied ? (
                <button
                  disabled
                  style={{
                    width: "100%", padding: "16px", borderRadius: "14px", background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)", color: "rgba(16, 185, 129, 0.7)",
                    fontSize: "15px", fontWeight: "800", cursor: "not-allowed", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: "8px"
                  }}
                >
                  <CheckCircle size={18} /> Sudah Dilamar
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCoverLetter("");
                    setExpectedBudget(project.budget || "");
                    setExpectedTimeline("");
                    setAnswers({});
                    setShowApplyModal(true);
                  }}
                  style={{
                    width: "100%", padding: "16px", borderRadius: "14px",
                    background: "linear-gradient(135deg, #4D63FF, #06B6D4)", color: "#fff",
                    border: "none", fontSize: "15px", fontWeight: "800", cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(77, 99, 255, 0.15)", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: "8px"
                  }}
                >
                  <Send size={16} /> Ajukan Lamaran
                </motion.button>
              )}

              {/* Secondary Action: Ask Client */}
              <motion.button
                whileHover={{ scale: 1.02, background: "rgba(255, 255, 255, 0.06)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/dashboard/messages?chat=${project.client_id}&project=${project.id}`)}
                style={{
                  width: "100%", padding: "14px", borderRadius: "14px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#fff", fontSize: "14px", fontWeight: "800", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s"
                }}
              >
                <MessageSquare size={16} style={{ color: "var(--cyan)" }} /> Tanya Client
              </motion.button>

              {/* Bookmark Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.02, background: isSaved ? "rgba(255, 191, 0, 0.15)" : "rgba(255, 255, 255, 0.04)" }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleSave}
                style={{
                  width: "100%", padding: "14px", borderRadius: "14px",
                  background: isSaved ? "rgba(255, 191, 0, 0.08)" : "transparent",
                  border: `1px solid ${isSaved ? "rgba(255, 191, 0, 0.25)" : "rgba(255, 255, 255, 0.08)"}`,
                  color: isSaved ? "#FFBF00" : "rgba(226, 232, 240, 0.6)",
                  fontSize: "14px", fontWeight: "800", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "all 0.2s"
                }}
              >
                <Bookmark size={15} fill={isSaved ? "#FFBF00" : "none"} /> {isSaved ? "Proyek Tersimpan" : "Simpan Proyek"}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Apply Proposal Form Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(3, 7, 18, 0.8)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
            padding: "20px"
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card"
              style={{
                width: "100%", maxWidth: "680px", background: "#0D1B2E", borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.08)", padding: "32px", display: "flex",
                flexDirection: "column", gap: "24px", maxHeight: "90vh", overflowY: "auto"
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: "850", color: "#fff", margin: 0 }}>Ajukan Lamaran</h2>
                  <p style={{ fontSize: "13px", color: "rgba(226,232,240,0.45)", margin: "4px 0 0 0" }}>Kirim proposal terbaik Anda untuk proyek "{project.title}"</p>
                </div>
                <button 
                  onClick={() => setShowApplyModal(false)}
                  style={{
                    background: "transparent", border: "none", color: "rgba(226,232,240,0.4)",
                    fontSize: "24px", cursor: "pointer", lineHeight: "1"
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Proposal Form */}
              <form onSubmit={handleApplyProposal} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Cover Letter */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>Surat Lamaran (Cover Letter) <span style={{ color: "#EF4444" }}>*</span></label>
                  <textarea
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tulis alasan mengapa Anda adalah orang yang tepat untuk proyek ini, keahlian relevan, serta portofolio pengerjaan serupa..."
                    style={{
                      width: "100%", minHeight: "130px", background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px 16px",
                      color: "#fff", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit",
                      lineHeight: "1.5"
                    }}
                  />
                </div>

                {/* Expected Budget & Timeline Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="grid grid-cols-1 sm:grid-cols-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>Anggaran yang Diharapkan <span style={{ color: "#EF4444" }}>*</span></label>
                    <input
                      required
                      type="text"
                      value={expectedBudget}
                      onChange={(e) => setExpectedBudget(e.target.value)}
                      placeholder="Contoh: Rp 5.000.000 atau Rp 200.000/Jam"
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px",
                        color: "#fff", fontSize: "14px", outline: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>Estimasi Waktu Pengerjaan <span style={{ color: "#EF4444" }}>*</span></label>
                    <input
                      required
                      type="text"
                      value={expectedTimeline}
                      onChange={(e) => setExpectedTimeline(e.target.value)}
                      placeholder="Contoh: 3 Minggu, 1 Bulan"
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px",
                        color: "#fff", fontSize: "14px", outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* Screening Questions Inputs */}
                {parsed.screening_questions && parsed.screening_questions.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#F59E0B", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertCircle size={14} /> Jawab Pertanyaan Klien
                    </h4>
                    {parsed.screening_questions.map((q, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "700", color: "rgba(226,232,240,0.85)" }}>
                          {idx + 1}. {q} <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={answers[idx] || ""}
                          onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                          placeholder="Ketik jawaban Anda di sini..."
                          style={{
                            width: "100%", background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 14px",
                            color: "#fff", fontSize: "13px", outline: "none"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Form Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px", marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    style={{
                      padding: "10px 20px", borderRadius: "12px", background: "transparent",
                      border: "1px solid rgba(255,255,255,0.08)", color: "rgba(226,232,240,0.6)",
                      fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProposal}
                    style={{
                      padding: "10px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
                      border: "none", color: "#fff", fontSize: "13px", fontWeight: "800", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    {submittingProposal ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Mengirim...
                      </>
                    ) : (
                      <>
                        Kirim Lamaran <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
