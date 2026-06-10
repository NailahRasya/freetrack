"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Calendar, 
  Clock, 
  DollarSign, 
  Bookmark, 
  ChevronRight, 
  X, 
  Briefcase, 
  AlertCircle, 
  CheckCircle, 
  Send,
  Loader2,
  Plus
} from "lucide-react";
import { useUser } from "../layout";
import { useProjects } from "@/lib/hooks/useProjects";
import { useContacts } from "@/lib/hooks/useContacts";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ONBOARDING_CATEGORIES, getLabelById } from "@/app/constants/onboarding-categories";
import { parseProjectDescription } from "@/app/lib/project-helper";
import Swal from "sweetalert2";
import CustomFilterDropdown from "@/app/components/dashboard/CustomFilterDropdown";
import CreateProjectModal from "@/app/components/dashboard/CreateProjectModal";

const categoryOptions = [
  { id: "", label: "Semua Kategori" },
  ...ONBOARDING_CATEGORIES.map(cat => ({ id: cat.id, label: cat.label }))
];

const expOptions = [
  { id: "", label: "Semua Tingkat" },
  { id: "junior", label: "Junior" },
  { id: "mid", label: "Intermediate (Mid)" },
  { id: "senior", label: "Expert (Senior)" }
];

const workTypeOptions = [
  { id: "", label: "Semua Tipe" },
  { id: "one-time", label: "Satu Kali" },
  { id: "ongoing", label: "Berkelanjutan" }
];

const deadlineOptions = [
  { id: "", label: "Semua Batas Waktu" },
  { id: "1week", label: "Kurang dari 1 Minggu" },
  { id: "1month", label: "Kurang dari 1 Bulan" }
];

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

function parseNumericBudget(budgetStr: string): number {
  if (!budgetStr) return 0;
  const cleaned = budgetStr.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function formatRupiah(value: string) {
  const numberString = value.replace(/[^,\d]/g, "").toString();
  const split = numberString.split(",");
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
  return rupiah;
}

export default function MarketplacePage() {
  const { user, role, loading: userLoading } = useUser();
  const router = useRouter();
  const { contacts, ensureContact } = useContacts();
  const { createProject, updateProject, deleteProject } = useProjects();

  // Projects list state
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [displayedProjects, setDisplayedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<"recommended" | "all" | "saved" | "my_posts">("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);

  const [nowTime, setNowTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (role === "client") {
      setActiveTab("my_posts");
    } else {
      setActiveTab("recommended");
    }
  }, [role]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMinBudget, setFilterMinBudget] = useState("");
  const [filterExp, setFilterExp] = useState("");
  const [filterWorkType, setFilterWorkType] = useState("");
  const [filterDeadline, setFilterDeadline] = useState("");
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);

  // Mobile Bottom Sheet Filter State
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Proposal modal state
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [expectedTimeline, setExpectedTimeline] = useState("");
  const [expectedBudget, setExpectedBudget] = useState("");
  const [screeningAnswers, setScreeningAnswers] = useState<Record<number, string>>({});

  // Infinite Scroll State
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const loaderRef = useRef<HTMLDivElement>(null);

  // Debounce Search Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load Saved list from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("freetrack_saved_projects");
    if (saved) {
      try {
        setSavedProjectIds(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleSaveProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let updated = [...savedProjectIds];
    if (updated.includes(id)) {
      updated = updated.filter(x => x !== id);
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
      updated.push(id);
      Swal.fire({
        title: "Disimpan!",
        text: "Proyek berhasil disimpan.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
        background: "#0F1B2E",
        color: "#fff"
      });
    }
    setSavedProjectIds(updated);
    localStorage.setItem("freetrack_saved_projects", JSON.stringify(updated));
  };

  // Fetch Marketplace Projects and map scores
  const fetchMarketplace = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      // 1. Fetch market projects
      const res = await fetch("/api/projects/market");
      const json = await res.json();
      if (!json.data) return;

      const marketProjects = json.data;

      // 2. Fetch current freelancer onboarding preferences
      const { data: prefs } = await supabase
        .from("onboarding_freelancer")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      const freelancerPref = prefs || null;

      // 3. Fetch already applied projects source IDs
      const appliedProjectSourceIds = new Set<string>();
      if (role === "freelancer") {
        const { data: appliedProjs } = await supabase
          .from("projects")
          .select("description")
          .eq("freelancer_id", user.id);

        if (appliedProjs) {
          appliedProjs.forEach((ap: any) => {
            const match = ap.description?.match(/\[source_id:([a-f0-9-]+)\]/);
            if (match && match[1]) {
              appliedProjectSourceIds.add(match[1]);
            }
          });
        }
      } else if (role === "client") {
        const { data: clientProposals } = await supabase
          .from("projects")
          .select("description")
          .eq("client_id", user.id)
          .not("freelancer_id", "is", null);

        if (clientProposals) {
          clientProposals.forEach((ap: any) => {
            const match = ap.description?.match(/\[source_id:([a-f0-9-]+)\]/);
            if (match && match[1]) {
              appliedProjectSourceIds.add(match[1]);
            }
          });
        }
      }

      // 4. Fetch all client onboarding infos
      const { data: clientOnboardings } = await supabase.from("onboarding_client").select("*");

      // 5. Scored and Parsed Projects mapping
      const mapped = marketProjects.map((p: any) => {
        const clientOb = clientOnboardings?.find(ob => ob.user_id === p.client_id) || {};
        const cleanSkills = p.required_skills?.filter((s: string) => s && !s.startsWith("EXP:") && !s.startsWith("WORK:")) || [];
        
        const embeddedExp = p.required_skills?.find((s: string) => s && s.startsWith("EXP:"))?.replace("EXP:", "");
        const embeddedWork = p.required_skills?.find((s: string) => s && s.startsWith("WORK:"))?.replace("WORK:", "");
        
        const effectiveExp = embeddedExp || clientOb.experience_preference;
        const effectiveWork = embeddedWork || clientOb.work_type;

        let matchScore = 0;
        if (freelancerPref) {
          const freelancerSkillIds: string[] = Array.isArray(freelancerPref.skill_categories)
            ? freelancerPref.skill_categories.filter(Boolean).map((s: string) => String(s).toLowerCase())
            : [];

          const freelancerCategoryIds: string[] = Array.from(new Set(
            freelancerSkillIds.map(sid => {
              const match = findSkillAndCategory(sid);
              return match?.categoryId ?? null;
            }).filter(Boolean) as string[]
          ));

          const categoryMatch = freelancerCategoryIds.includes(String(p.category_id || "").toLowerCase());
          if (categoryMatch) {
            matchScore += 50;
          }

          for (const skillLabel of cleanSkills) {
            const resolved = findSkillAndCategory(String(skillLabel));
            const skillMatchesFreelancer =
              (resolved.skillId && freelancerSkillIds.includes(resolved.skillId.toLowerCase())) ||
              (resolved.categoryId && freelancerCategoryIds.includes(resolved.categoryId.toLowerCase())) ||
              freelancerSkillIds.includes(String(skillLabel).toLowerCase()) ||
              freelancerCategoryIds.includes(String(skillLabel).toLowerCase());

            if (skillMatchesFreelancer) {
              matchScore += 15;
            }
          }

          if (Array.isArray(freelancerPref.preferred_client_scales) && freelancerPref.preferred_client_scales.includes(clientOb.business_scale)) matchScore += 20;
          if (Array.isArray(freelancerPref.work_type_preference) && freelancerPref.work_type_preference.includes(effectiveWork)) matchScore += 20;
          if (freelancerPref.experience_level === effectiveExp) matchScore += 30;
        }

        // Percentage conversion
        let matchPercent = 60;
        if (matchScore >= 100) matchPercent = 95;
        else if (matchScore >= 70) matchPercent = 88;
        else if (matchScore >= 40) matchPercent = 75;

        return {
          ...p,
          matchScore,
          matchPercent,
          clientOb,
          cleanSkills,
          hasApplied: appliedProjectSourceIds.has(p.id),
          parsed: parseProjectDescription(p.description),
          effectiveExp,
          effectiveWork
        };
      });

      // Sort by Match Score by default
      mapped.sort((a: any, b: any) => b.matchScore - a.matchScore);
      setAllProjects(mapped);
    } catch (err) {
      console.error("Error loading marketplace projects:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, role]);

  useEffect(() => {
    if (user?.id) {
      fetchMarketplace();
    }
  }, [user?.id, fetchMarketplace]);

  // Handle Filtering & Tab changes
  useEffect(() => {
    let filtered = [...allProjects];

    // Search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter(p => 
        (p.title || "").toLowerCase().includes(q) ||
        (p.parsed?.summary || "").toLowerCase().includes(q) ||
        (p.parsed?.description || "").toLowerCase().includes(q) ||
        (p.cleanSkills || []).some((s: string) => s.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(p => String(p.category_id) === filterCategory);
    }

    // Budget Min filter
    if (filterMinBudget) {
      const minVal = parseInt(filterMinBudget.replace(/[^\d]/g, ""), 10) || 0;
      filtered = filtered.filter(p => parseNumericBudget(p.budget) >= minVal);
    }

    // Experience Level filter
    if (filterExp) {
      filtered = filtered.filter(p => p.effectiveExp === filterExp);
    }

    // Work Type filter
    if (filterWorkType) {
      filtered = filtered.filter(p => p.effectiveWork === filterWorkType);
    }

    // Deadline filter
    if (filterDeadline) {
      const now = new Date();
      filtered = filtered.filter(p => {
        const pDeadline = p.parsed?.deadline || p.deadline;
        if (!pDeadline) return false;
        const deadlineDate = new Date(pDeadline);
        if (isNaN(deadlineDate.getTime())) return true; // match fallback
        
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterDeadline === "1week") return diffDays <= 7 && diffDays >= 0;
        if (filterDeadline === "1month") return diffDays <= 30 && diffDays >= 0;
        return true;
      });
    }

    // Tab filters
    if (activeTab === "recommended") {
      filtered = filtered.filter(p => p.matchScore >= 40).sort((a, b) => b.matchScore - a.matchScore);
    } else if (activeTab === "saved") {
      filtered = filtered.filter(p => savedProjectIds.includes(p.id));
    } else if (activeTab === "my_posts") {
      filtered = filtered.filter(p => p.client_id === user?.id);
    }

    setDisplayedProjects(filtered);
  }, [allProjects, debouncedSearch, filterCategory, filterMinBudget, filterExp, filterWorkType, filterDeadline, activeTab, savedProjectIds, user?.id]);

  // Infinite Scroll Trigger
  const handleScroll = useCallback(() => {
    if (!loaderRef.current) return;
    const rect = loaderRef.current.getBoundingClientRect();
    if (rect.top <= window.innerHeight + 100) {
      setPage(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Slice list and filter out expired agreed projects (> 60s)
  const visibleProjects = displayedProjects
    .filter(project => {
      if (project.parsed?.agreed_at) {
        const agreedAt = new Date(project.parsed.agreed_at);
        const elapsedMs = nowTime - agreedAt.getTime();
        return elapsedMs < 60000;
      }
      return true;
    })
    .slice(0, page * itemsPerPage);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setFilterMinBudget("");
    setFilterExp("");
    setFilterWorkType("");
    setFilterDeadline("");
    setPage(1);
    Swal.fire({
      title: "Filter Direset",
      text: "Seluruh pencarian dan filter telah dibersihkan.",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
      background: "#0F1B2E",
      color: "#fff"
    });
  };

  const handleOpenApplyModal = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setSelectedProject(project);
    setCoverLetter("");
    setExpectedBudget(project.budget || "");
    setExpectedTimeline("");
    setScreeningAnswers({});
    setShowApplyModal(true);
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

    const parsed = selectedProject.parsed;
    
    // Validate screening questions
    if (parsed.screening_questions && parsed.screening_questions.length > 0) {
      for (let i = 0; i < parsed.screening_questions.length; i++) {
        if (!screeningAnswers[i] || !screeningAnswers[i].trim()) {
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

      // Format proposal reason
      let formattedProposalReason = `--- SURAT LAMARAN ---
${coverLetter.trim()}

--- ANGGARAN & LINIMASA DIHARAPKAN ---
Anggaran: ${expectedBudget.trim()}
Estimasi Waktu: ${expectedTimeline.trim()}`;

      if (parsed.screening_questions && parsed.screening_questions.length > 0) {
        formattedProposalReason += `\n\n--- PERTANYAAN SCREENING ---`;
        parsed.screening_questions.forEach((q: string, idx: number) => {
          formattedProposalReason += `\n\nPertanyaan ${idx + 1}: ${q}\nJawaban: ${screeningAnswers[idx]?.trim() || "-"}`;
        });
      }

      // Call API PATCH to submit proposal
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProject.id,
          proposal_reason: formattedProposalReason,
          status: "pending_client"
        })
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      // Create contact chat instantly
      await ensureContact(selectedProject.client_id);

      setShowApplyModal(false);
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

      router.push(`/dashboard/messages?chat=${selectedProject.client_id}&project=${selectedProject.id}`);
    } catch (err: any) {
      Swal.fire({
        title: "Gagal Mengirim",
        text: err.message || "Terjadi kesalahan saat melamar proyek.",
        icon: "error",
        background: "#0F1B2E",
        color: "#fff"
      });
    } finally {
      setSubmittingProposal(false);
    }
  };

  if (userLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        <span>Memuat halaman...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#fff", marginBottom: "8px", letterSpacing: "-1px" }}>
            Project <span className="gradient-text">Marketplace</span>
          </h1>
          <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "16px" }}>
            {role === "client" 
              ? "Kelola postingan proyek Anda dan pantau penawaran di pasar terbuka"
              : "Temukan dan lamar proyek dari klien di seluruh penjuru ekosistem digital"}
          </p>
        </motion.div>
        
        {role === "client" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              setProjectToEdit(null);
              setShowCreateModal(true);
            }}
            style={{
              padding: "12px 24px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
              color: "#fff",
              border: "none",
              fontSize: "14px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(77, 99, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Plus size={16} /> Posting Proyek Baru
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "4px", gap: "24px" }}>
        {(role === "client" ? [
          { id: "my_posts", label: "Postingan Saya" },
          { id: "all", label: "Semua Postingan" }
        ] : [
          { id: "recommended", label: "Recommended Projects" },
          { id: "all", label: "All Projects" },
          { id: "saved", label: `Saved Projects (${savedProjectIds.length})` }
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id as any); setPage(1); }}
            style={{
              padding: "12px 4px",
              background: "none",
              border: "none",
              color: activeTab === t.id ? "var(--cyan-light)" : "rgba(226, 232, 240, 0.4)",
              fontWeight: "800",
              fontSize: "15px",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.3s ease"
            }}
          >
            {t.label}
            {activeTab === t.id && (
              <motion.div 
                layoutId="activeMarketTabUnderline" 
                style={{ position: "absolute", bottom: -5, left: 0, right: 0, height: "3px", background: "var(--cyan)", borderRadius: "2px", boxShadow: "0 0 10px var(--cyan)" }} 
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Grid: Filters Column + Cards Column */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "32px", alignItems: "start" }} className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
        
        {/* Sticky Filters (Desktop) */}
        <aside className="glass-card hidden md:flex" style={{ padding: "24px", flexDirection: "column", gap: "20px", position: "sticky", top: "100px", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={16} /> Filter Pencarian
            </h3>
            <button onClick={handleResetFilters} style={{ background: "none", border: "none", color: "#FF4D6A", fontSize: "11px", fontWeight: "800", cursor: "pointer", textTransform: "uppercase" }}>Reset</button>
          </div>

          {/* Search keyword */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Kata Kunci</label>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari judul, deskripsi..."
                style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 12px 10px 34px", color: "#fff", fontSize: "13px", outline: "none" }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Kategori</label>
            <CustomFilterDropdown
              value={filterCategory}
              options={categoryOptions}
              onChange={val => { setFilterCategory(val); setPage(1); }}
              placeholder="Semua Kategori"
            />
          </div>

          {/* Budget Min Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Anggaran Minimum (Rp)</label>
            <input 
              type="text"
              value={filterMinBudget}
              onChange={e => { setFilterMinBudget(formatRupiah(e.target.value)); setPage(1); }}
              placeholder="Contoh: 1.000.000"
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px", color: "#fff", fontSize: "13px", outline: "none" }}
            />
          </div>

          {/* Experience Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Tingkat Pengalaman</label>
            <CustomFilterDropdown
              value={filterExp}
              options={expOptions}
              onChange={val => { setFilterExp(val); setPage(1); }}
              placeholder="Semua Tingkat"
            />
          </div>

          {/* Work Type Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Tipe Kerjasama</label>
            <CustomFilterDropdown
              value={filterWorkType}
              options={workTypeOptions}
              onChange={val => { setFilterWorkType(val); setPage(1); }}
              placeholder="Semua Tipe"
            />
          </div>

          {/* Deadline Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Batas Batas Waktu</label>
            <CustomFilterDropdown
              value={filterDeadline}
              options={deadlineOptions}
              onChange={val => { setFilterDeadline(val); setPage(1); }}
              placeholder="Semua Batas Waktu"
            />
          </div>
        </aside>

        {/* Mobile Filters Header & Trigger */}
        <div className="md:hidden col-span-2 flex justify-between items-center mb-2">
          <button 
            onClick={() => setShowMobileFilters(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "8px 16px", color: "#fff", fontSize: "14px", fontWeight: "700" }}
          >
            <SlidersHorizontal size={14} /> Filter ({
              [searchQuery, filterCategory, filterMinBudget, filterExp, filterWorkType, filterDeadline].filter(Boolean).length
            })
          </button>
          <button onClick={handleResetFilters} style={{ background: "none", border: "none", color: "#FF4D6A", fontSize: "13px", fontWeight: "700" }}>Reset All</button>
        </div>

        {/* Cards list column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {loading && visibleProjects.length === 0 ? (
            // Skeleton pulsing loader
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card skeleton-card" style={{ height: "230px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ width: "80px", height: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                    <div style={{ width: "120px", height: "24px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                  </div>
                  <div style={{ width: "60%", height: "22px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                  <div style={{ width: "100%", height: "45px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
                </div>
              ))}
            </div>
          ) : visibleProjects.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <AnimatePresence mode="popLayout">
                {visibleProjects.map((project, idx) => {
                  const isSaved = savedProjectIds.includes(project.id);
                  const isHighMatch = project.matchPercent >= 85;
                  const formattedDate = new Date(project.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  });

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: (idx % itemsPerPage) * 0.05 }}
                      whileHover={{ y: -4, borderColor: "rgba(16, 185, 129, 0.25)", boxShadow: "0 15px 35px rgba(0,0,0,0.3)" }}
                      className="glass-card"
                      style={{ 
                        padding: "28px", 
                        background: "rgba(13, 22, 45, 0.4)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "20px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        position: "relative",
                        transition: "all 0.3s ease"
                      }}
                      onClick={() => router.push(`/dashboard/marketplace/${project.id}`)}
                    >
                      {/* Top Header Card */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ 
                            padding: "6px 12px", 
                            background: "rgba(77, 99, 255, 0.08)", 
                            borderRadius: "8px", 
                            color: "#4D63FF", 
                            fontSize: "10px", 
                            fontWeight: "900", 
                            textTransform: "uppercase" 
                          }}>
                            {getLabelById(project.category_id) || "Lainnya"}
                          </span>
                          
                          {project.parsed?.experienceLevel && (
                            <span style={{ 
                              fontSize: "10px", 
                              fontWeight: "800", 
                              textTransform: "uppercase", 
                              padding: "4px 8px", 
                              borderRadius: "6px", 
                              background: "rgba(245,158,11,0.08)",
                              color: "#F59E0B",
                              border: "1px solid rgba(245,158,11,0.15)"
                            }}>
                              {project.parsed.experienceLevel === "senior" ? "Expert" : (project.parsed.experienceLevel === "mid" ? "Intermediate" : "Junior")}
                            </span>
                          )}
                        </div>

                        {/* Match Percent & Save Button */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {project.parsed?.agreed_at ? (
                            <span style={{
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "800",
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#EF4444",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              boxShadow: "0 0 10px rgba(239, 68, 68, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}>
                              <Clock size={12} className="animate-pulse" />
                              {`Sudah Dilamar (${Math.max(0, 60 - Math.floor((nowTime - new Date(project.parsed.agreed_at).getTime()) / 1000))}s)`}
                            </span>
                          ) : role === "freelancer" ? (
                            <>
                              <span style={{
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "800",
                                background: isHighMatch ? "rgba(16,185,129,0.1)" : "rgba(6,182,212,0.1)",
                                color: isHighMatch ? "#10B981" : "#06B6D4",
                                border: `1px solid ${isHighMatch ? "rgba(16,185,129,0.2)" : "rgba(6,182,212,0.2)"}`
                              }}>
                                {project.matchPercent}% Match
                              </span>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => toggleSaveProject(e, project.id)}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "10px",
                                  background: isSaved ? "rgba(255, 191, 0, 0.1)" : "rgba(255,255,255,0.03)",
                                  border: `1px solid ${isSaved ? "rgba(255, 191, 0, 0.25)" : "rgba(255,255,255,0.06)"}`,
                                  color: isSaved ? "#FFBF00" : "rgba(226,232,240,0.5)",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.2s"
                                }}
                              >
                                <Bookmark size={15} fill={isSaved ? "#FFBF00" : "none"} />
                              </motion.button>
                            </>
                          ) : (
                            project.client_id === user?.id && (
                              <span style={{
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "800",
                                background: project.status === "draft" ? "rgba(124,58,237,0.12)" : "rgba(77,99,255,0.12)",
                                color: project.status === "draft" ? "#a78bfa" : "#818cf8",
                                border: `1px solid ${project.status === "draft" ? "rgba(124,58,237,0.25)" : "rgba(77,99,255,0.25)"}`
                              }}>
                                {project.status === "draft" ? "Draf Anda" : "Postingan Anda"}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Title & Client details */}
                      <div>
                        <h3 style={{ fontSize: "20px", fontWeight: "850", color: "#fff", margin: "0 0 6px 0" }}>{project.title}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "12px", color: "rgba(226, 232, 240, 0.35)" }}>
                          <span>oleh <strong style={{ color: "#fff" }}>{project.client?.full_name || "Klien"}</strong></span>
                          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={12} /> {formattedDate}</span>
                        </div>
                      </div>

                      {/* Description / Summary */}
                      <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.45)", lineHeight: "1.6", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                        {project.parsed?.summary || project.parsed?.description || project.description || "Tidak ada deskripsi singkat."}
                      </p>

                      {/* Required skills */}
                      {project.cleanSkills && project.cleanSkills.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {project.cleanSkills.slice(0, 3).map((skill: string) => (
                            <span key={skill} style={{
                              fontSize: "10px",
                              fontWeight: "750",
                              color: "#10B981",
                              background: "rgba(16, 185, 129, 0.05)",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: "1px solid rgba(16, 185, 129, 0.1)"
                            }}>
                              #{skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Budget, Status & Actions */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <div style={{ fontSize: "18px", fontWeight: "900", color: "#00FFA3" }}>{project.budget}</div>
                          <div style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)" }}>
                            {project.parsed?.budget_type === "hourly" ? "Tarif Per Jam" : "Estimasi Anggaran"}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => router.push(`/dashboard/marketplace/${project.id}`)}
                            className="btn-secondary"
                            style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700" }}
                          >
                            View Detail
                          </button>
                          {project.parsed?.agreed_at ? (
                            <button
                              disabled
                              style={{ 
                                padding: "8px 16px", 
                                borderRadius: "10px", 
                                background: "rgba(239, 68, 68, 0.06)", 
                                color: "rgba(239, 68, 68, 0.7)", 
                                border: "1px solid rgba(239, 68, 68, 0.15)",
                                fontSize: "13px", 
                                fontWeight: "800",
                                cursor: "not-allowed"
                              }}
                            >
                              Sudah Dilamar
                            </button>
                          ) : role === "client" ? (
                            project.client_id === user?.id && (
                              project.hasApplied ? (
                                <button
                                  disabled
                                  style={{ 
                                    padding: "8px 16px", 
                                    borderRadius: "10px", 
                                    background: "rgba(16, 185, 129, 0.06)", 
                                    color: "rgba(16, 185, 129, 0.7)", 
                                    border: "1px solid rgba(16, 185, 129, 0.15)",
                                    fontSize: "13px", 
                                    fontWeight: "800",
                                    cursor: "not-allowed"
                                  }}
                                >
                                  Sudah Dilamar
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectToEdit(project);
                                    setShowCreateModal(true);
                                  }}
                                  className="btn-secondary"
                                  style={{ 
                                    padding: "8px 16px", 
                                    borderRadius: "10px", 
                                    background: "rgba(255, 255, 255, 0.05)", 
                                    color: "#fff", 
                                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                                    fontSize: "13px", 
                                    fontWeight: "800", 
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                  }}
                                >
                                  Edit Postingan
                                </button>
                              )
                            )
                          ) : project.hasApplied ? (
                            <button
                              disabled
                              style={{ 
                                padding: "8px 16px", 
                                borderRadius: "10px", 
                                background: "rgba(16, 185, 129, 0.06)", 
                                color: "rgba(16, 185, 129, 0.7)", 
                                border: "1px solid rgba(16, 185, 129, 0.15)",
                                fontSize: "13px", 
                                fontWeight: "800",
                                cursor: "not-allowed"
                              }}
                            >
                              Sudah Dilamar
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleOpenApplyModal(e, project)}
                              style={{ 
                                padding: "8px 16px", 
                                borderRadius: "10px", 
                                background: "linear-gradient(135deg, #4D63FF, #06B6D4)", 
                                color: "#fff", 
                                border: "none", 
                                fontSize: "13px", 
                                fontWeight: "800", 
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              <Send size={13} /> Ajukan Lamaran
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            // Empty State
            <div style={{ textAlign: "center", padding: "100px 20px", background: "rgba(255,255,255,0.01)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.06)" }}>
              <Briefcase size={48} style={{ margin: "0 auto 16px", opacity: 0.2, color: "#fff" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>Tidak Ada Proyek Ditemukan</h3>
              <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
                Cobalah mengubah kata kunci pencarian Anda, bersihkan filter, atau ganti tab ke yang lain.
              </p>
              <button onClick={handleResetFilters} className="btn-secondary" style={{ marginTop: "20px", padding: "8px 20px" }}>Tampilkan Semua Proyek</button>
            </div>
          )}

          {/* Loader Element for Infinite Scroll */}
          {displayedProjects.length > visibleProjects.length && (
            <div ref={loaderRef} style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
              <Loader2 size={24} style={{ color: "var(--cyan)", animation: "spin 1s linear infinite" }} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      <AnimatePresence>
        {showMobileFilters && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                position: "relative",
                background: "#0D1B2E",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px 24px 0 0",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                maxHeight: "85vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "850", color: "#fff", margin: 0 }}>Filter Proyek</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Category */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Kategori</label>
                <CustomFilterDropdown
                  value={filterCategory}
                  options={categoryOptions}
                  onChange={val => { setFilterCategory(val); setPage(1); }}
                  placeholder="Semua Kategori"
                  triggerStyle={{ background: "#060D19", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
                />
              </div>

              {/* Mobile Min Budget */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Anggaran Minimum (Rp)</label>
                <input 
                  type="text" 
                  value={filterMinBudget} 
                  onChange={e => { setFilterMinBudget(formatRupiah(e.target.value)); setPage(1); }}
                  placeholder="Contoh: 1.000.000"
                  style={{ width: "100%", background: "#060D19", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px", color: "#fff", fontSize: "14px" }}
                />
              </div>

              {/* Mobile Exp level */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Pengalaman</label>
                <CustomFilterDropdown
                  value={filterExp}
                  options={expOptions}
                  onChange={val => { setFilterExp(val); setPage(1); }}
                  placeholder="Semua Tingkat"
                  triggerStyle={{ background: "#060D19", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
                />
              </div>

              {/* Mobile Work Type */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Kerjasama</label>
                <CustomFilterDropdown
                  value={filterWorkType}
                  options={workTypeOptions}
                  onChange={val => { setFilterWorkType(val); setPage(1); }}
                  placeholder="Semua Tipe"
                  triggerStyle={{ background: "#060D19", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
                />
              </div>

              {/* Mobile Deadline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Batas Batas Waktu</label>
                <CustomFilterDropdown
                  value={filterDeadline}
                  options={deadlineOptions}
                  onChange={val => { setFilterDeadline(val); setPage(1); }}
                  placeholder="Semua Batas Waktu"
                  triggerStyle={{ background: "#060D19", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
                <button onClick={handleResetFilters} className="btn-secondary" style={{ padding: "14px" }}>Reset All</button>
                <button onClick={() => setShowMobileFilters(false)} className="btn-primary" style={{ padding: "14px" }}>Apply Filters</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Apply Proposal Modal */}
      <AnimatePresence>
        {showApplyModal && selectedProject && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(3, 7, 18, 0.85)", backdropFilter: "blur(8px)",
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
                  <h2 style={{ fontSize: "22px", fontWeight: "850", color: "#fff", margin: 0 }}>Ajukan Lamaran Proyek</h2>
                  <p style={{ fontSize: "13px", color: "rgba(226,232,240,0.45)", margin: "4px 0 0 0" }}>Kirim proposal penawaran Anda untuk "{selectedProject.title}"</p>
                </div>
                <button 
                  onClick={() => setShowApplyModal(false)}
                  style={{ background: "transparent", border: "none", color: "rgba(226,232,240,0.4)", fontSize: "24px", cursor: "pointer", lineHeight: "1" }}
                >
                  &times;
                </button>
              </div>

              {/* Form content */}
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

                {/* Screening Questions */}
                {selectedProject.parsed?.screening_questions && selectedProject.parsed.screening_questions.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#F59E0B", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertCircle size={14} /> Jawab Pertanyaan Klien
                    </h4>
                    {selectedProject.parsed.screening_questions.map((q: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "700", color: "rgba(226,232,240,0.85)" }}>
                          {idx + 1}. {q} <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={screeningAnswers[idx] || ""}
                          onChange={(e) => setScreeningAnswers({ ...screeningAnswers, [idx]: e.target.value })}
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
                      fontSize: "13px", fontWeight: "700", cursor: "pointer"
                    }}
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
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Mengirim...
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

      {/* Create/Edit Project Modal for Clients */}
      <AnimatePresence>
        {(showCreateModal || projectToEdit) && (
          <CreateProjectModal
            contacts={contacts}
            initialData={projectToEdit}
            onClose={() => { setShowCreateModal(false); setProjectToEdit(null); }}
            onDelete={async (id) => {
              await deleteProject(id);
              fetchMarketplace();
            }}
            onSaveDraft={async d => {
              try {
                if (projectToEdit) {
                  await updateProject(projectToEdit.id, d);
                } else {
                  await createProject({ ...d, send_to_client: false });
                }
                Swal.fire({ title: "Tersimpan!", text: "Draf proyek berhasil disimpan.", icon: "success", background: "#0F1B2E", color: "#fff", timer: 2000, showConfirmButton: false });
                fetchMarketplace();
              } catch (e: any) {
                Swal.fire({ title: "Gagal!", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
                throw e;
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
                fetchMarketplace();
              } catch (e: any) {
                Swal.fire({ title: "Gagal!", text: e.message, icon: "error", background: "#0F1B2E", color: "#fff" });
                throw e;
              }
            }}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .skeleton-card {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
