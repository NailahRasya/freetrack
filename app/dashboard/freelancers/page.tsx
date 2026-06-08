"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Star, 
  Bookmark, 
  MessageSquare, 
  UserCheck, 
  Clock, 
  Briefcase, 
  MapPin, 
  CheckCircle,
  HelpCircle,
  X,
  RefreshCw,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "../layout";
import { useContacts } from "@/lib/hooks/useContacts";
import { useRouter } from "next/navigation";
import { ONBOARDING_CATEGORIES, getLabelById } from "@/app/constants/onboarding-categories";
import Swal from "sweetalert2";
import CustomFilterDropdown from "@/app/components/dashboard/CustomFilterDropdown";

const categoryOptions = [
  { id: "", label: "Semua Kategori" },
  ...ONBOARDING_CATEGORIES.map(cat => ({ id: cat.id, label: cat.label }))
];

const expOptions = [
  { id: "", label: "Semua Level" },
  { id: "junior", label: "Junior" },
  { id: "mid", label: "Intermediate (Mid)" },
  { id: "senior", label: "Expert (Senior)" }
];

const workTypeOptions = [
  { id: "", label: "Semua Tipe" },
  { id: "one-time", label: "Satu Kali" },
  { id: "ongoing", label: "Berkelanjutan" }
];

const ratingOptions = [
  { id: "", label: "Semua Rating" },
  { id: "4.5", label: "⭐ 4.5 ke atas" },
  { id: "4.0", label: "⭐ 4.0 ke atas" }
];

const availabilityOptions = [
  { id: "", label: "Semua Status" },
  { id: "sekarang", label: "Tersedia Sekarang" },
  { id: "part-time", label: "Tersedia Part-Time" },
  { id: "sibuk", label: "Sibuk" }
];

// Helper to seed consistent properties based on freelancer ID hash
export function seedFreelancerProps(id: string, experienceLevel = "mid", years = 1) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const availabilities = ["Tersedia Sekarang", "Tersedia Sekarang", "Tersedia Part-Time", "Sibuk"];
  const availability = availabilities[hash % availabilities.length];
  
  const responseTimes = ["< 1 Jam", "1-2 Jam", "Dalam 24 Jam"];
  const responseTime = responseTimes[hash % responseTimes.length];

  // Base rate based on level
  let baseRate = 120000;
  if (experienceLevel === "junior") {
    baseRate = 50000 + (hash % 6) * 10000; // 50k - 100k
  } else if (experienceLevel === "mid") {
    baseRate = 120000 + (hash % 10) * 15000; // 120k - 255k
  } else if (experienceLevel === "senior") {
    baseRate = 280000 + (hash % 12) * 20000; // 280k - 500k
  }
  const hourlyRate = `Rp ${baseRate.toLocaleString("id-ID")}`;

  const locations = ["Jakarta, Indonesia", "Bandung, Indonesia", "Surabaya, Indonesia", "Yogyakarta, Indonesia", "Medan, Indonesia", "Bali, Indonesia"];
  const location = locations[hash % locations.length];

  return {
    availability,
    responseTime,
    hourlyRate,
    baseRate,
    location,
    hash
  };
}

export default function FindFreelancerPage() {
  const { user, role, loading: userLoading } = useUser();
  const router = useRouter();
  const { ensureContact } = useContacts();

  // State Freelancers
  const [allFreelancers, setAllFreelancers] = useState<any[]>([]);
  const [displayedFreelancers, setDisplayedFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<"recommended" | "all" | "saved" | "available">("recommended");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterExp, setFilterExp] = useState("");
  const [filterWorkType, setFilterWorkType] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const [savedFreelancerIds, setSavedFreelancerIds] = useState<string[]>([]);

  // Mobile Bottom Sheet Filter State
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    const saved = localStorage.getItem("freetrack_saved_freelancers");
    if (saved) {
      try {
        setSavedFreelancerIds(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleSaveFreelancer = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let updated = [...savedFreelancerIds];
    if (updated.includes(id)) {
      updated = updated.filter(x => x !== id);
      Swal.fire({
        title: "Dihapus!",
        text: "Freelancer dihapus dari daftar simpanan.",
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
        text: "Freelancer berhasil disimpan.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
        background: "#0F1B2E",
        color: "#fff"
      });
    }
    setSavedFreelancerIds(updated);
    localStorage.setItem("freetrack_saved_freelancers", JSON.stringify(updated));
  };

  // Fetch Freelancers data and map scores
  const fetchFreelancerDirectory = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      // 1. Get Client Preference
      const { data: clientPrefList } = await supabase
        .from("onboarding_client")
        .select("*")
        .eq("user_id", user.id);
      const clientPref = clientPrefList && clientPrefList.length > 0 ? clientPrefList[0] : null;

      // 2. Fetch all freelancers profiles
      const { data: freelancers, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url, bio, skills, average_rating, total_reviews")
        .eq("role", "freelancer");

      if (profilesError) throw profilesError;

      // 3. Fetch onboarding_freelancer
      const { data: onboardingData, error: onboardingError } = await supabase
        .from("onboarding_freelancer")
        .select("*");

      if (onboardingError) throw onboardingError;

      // 4. Fetch all reviews
      const { data: allReviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("freelancer_id, rating");

      if (reviewsError) throw reviewsError;

      // 5. Fetch completed projects to get total completed projects
      const { data: allCompletedProjects } = await supabase
        .from("projects")
        .select("freelancer_id")
        .eq("status", "completed");

      // Group reviews and count completed projects
      const ratingMap: Record<string, { totalRating: number; count: number }> = {};
      allReviews?.forEach((r: any) => {
        if (!r.freelancer_id) return;
        if (!ratingMap[r.freelancer_id]) {
          ratingMap[r.freelancer_id] = { totalRating: 0, count: 0 };
        }
        ratingMap[r.freelancer_id].totalRating += r.rating;
        ratingMap[r.freelancer_id].count += 1;
      });

      const completedProjectMap: Record<string, number> = {};
      allCompletedProjects?.forEach((p: any) => {
        if (!p.freelancer_id) return;
        completedProjectMap[p.freelancer_id] = (completedProjectMap[p.freelancer_id] || 0) + 1;
      });

      // 6. Map and Score
      const mapped = (freelancers || []).map((f: any) => {
        const ob = onboardingData?.find(o => o.user_id === f.id) || {};
        const seeded = seedFreelancerProps(f.id, ob.experience_level || "mid", ob.years_of_experience || 1);

        // Score Matching Algorithm
        let score = 10;
        if (clientPref) {
          if (ob.experience_level && ob.experience_level === clientPref.experience_preference) score += 40;
          
          const workTypeMatch = Array.isArray(ob.work_type_preference) && ob.work_type_preference.includes(clientPref.work_type);
          if (workTypeMatch) score += 30;

          const scaleMatch = Array.isArray(ob.preferred_client_scales) && ob.preferred_client_scales.includes(clientPref.business_scale);
          if (scaleMatch) score += 20;

          const clientSkills = clientPref.required_skills || [];
          const freelancerTools = ob.tools || [];
          const freelancerSkills = f.skills || [];
          const skillOverlap = clientSkills.filter((s: string) => 
            freelancerTools.includes(s) || freelancerSkills.includes(s)
          ).length;

          score += (skillOverlap * 15);
        }

        const ratingInfo = ratingMap[f.id] || { totalRating: 0, count: 0 };
        const averageRating = ratingInfo.count > 0 ? ratingInfo.totalRating / ratingInfo.count : (f.average_rating || 0);
        const totalReviews = ratingInfo.count || (f.total_reviews || 0);
        const totalCompleted = completedProjectMap[f.id] || 0;

        // Map Headline based on skills/tools
        let headline = "Professional Freelancer";
        const fSkills: string[] = (ob.tools || f.skills || []).map((s: string) => s.toLowerCase());
        if (fSkills.some((s: string) => s.includes("design") || s.includes("figma") || s.includes("ui") || s.includes("ux"))) {
          headline = "Senior UI/UX & Product Designer";
        } else if (fSkills.some((s: string) => s.includes("react") || s.includes("next") || s.includes("frontend") || s.includes("web"))) {
          headline = "Frontend Developer & React Specialist";
        } else if (fSkills.some((s: string) => s.includes("node") || s.includes("python") || s.includes("backend") || s.includes("database"))) {
          headline = "Backend Engineer & API Specialist";
        } else if (fSkills.some((s: string) => s.includes("write") || s.includes("copy") || s.includes("content"))) {
          headline = "Content Writer & Copywriter Expert";
        } else if (fSkills.length > 0) {
          headline = `Expert in ${ob.tools?.[0] || f.skills?.[0]}`;
        }

        // Percentage Conversion
        let matchPercent = 60;
        if (score >= 100) matchPercent = 95;
        else if (score >= 70) matchPercent = 88;
        else if (score >= 40) matchPercent = 75;

        return {
          ...f,
          ob,
          seeded,
          headline,
          score,
          matchPercent,
          average_rating: averageRating,
          total_reviews: totalReviews,
          completedProjectsCount: totalCompleted
        };
      });

      // Sort by Match Score by default
      mapped.sort((a, b) => b.score - a.score);
      setAllFreelancers(mapped);
    } catch (err: any) {
      console.error("Error fetching freelancer directory:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchFreelancerDirectory();
    }
  }, [user?.id, fetchFreelancerDirectory]);

  // Handle Filtering & Tab changes
  useEffect(() => {
    let filtered = [...allFreelancers];

    // Search filter (name / bio / headline / skills)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter(f => 
        (f.full_name || "").toLowerCase().includes(q) ||
        (f.bio || "").toLowerCase().includes(q) ||
        (f.headline || "").toLowerCase().includes(q) ||
        (f.skills || []).some((s: string) => s.toLowerCase().includes(q)) ||
        (f.ob?.tools || []).some((s: string) => s.toLowerCase().includes(q))
      );
    }

    // Skills category filter
    if (filterSkill) {
      const selectedCatObj = ONBOARDING_CATEGORIES.find(c => c.id === filterSkill);
      const allowedSkills = selectedCatObj ? selectedCatObj.skills.map(s => s.id) : [];
      filtered = filtered.filter(f => 
        (f.ob?.skill_categories || []).some((catId: string) => catId === filterSkill || allowedSkills.includes(catId))
      );
    }

    // Experience Level filter
    if (filterExp) {
      filtered = filtered.filter(f => f.ob?.experience_level === filterExp);
    }

    // Work Type filter
    if (filterWorkType) {
      filtered = filtered.filter(f => (f.ob?.work_type_preference || []).includes(filterWorkType));
    }

    // Rating filter
    if (filterRating) {
      const minRating = parseFloat(filterRating);
      filtered = filtered.filter(f => f.average_rating >= minRating);
    }

    // Availability filter
    if (filterAvailability) {
      filtered = filtered.filter(f => f.seeded?.availability?.toLowerCase()?.includes(filterAvailability.toLowerCase()));
    }

    // Tab filters
    if (activeTab === "recommended") {
      filtered = filtered.filter(f => f.score >= 40).sort((a, b) => b.score - a.score);
    } else if (activeTab === "saved") {
      filtered = filtered.filter(f => savedFreelancerIds.includes(f.id));
    } else if (activeTab === "available") {
      filtered = filtered.filter(f => f.seeded?.availability !== "Sibuk");
    }

    setDisplayedFreelancers(filtered);
  }, [allFreelancers, debouncedSearch, filterSkill, filterExp, filterWorkType, filterRating, filterAvailability, activeTab, savedFreelancerIds]);

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

  // Slice list based on scroll page
  const visibleFreelancers = displayedFreelancers.slice(0, page * itemsPerPage);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterSkill("");
    setFilterExp("");
    setFilterWorkType("");
    setFilterRating("");
    setFilterAvailability("");
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

  const handleStartDiscussion = async (freelancerId: string) => {
    try {
      Swal.fire({
        title: "Menghubungkan...",
        text: "Membuat kontak dan mengalihkan ke obrolan.",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => { Swal.showLoading(); },
        background: "#0F1B2E",
        color: "#fff"
      });
      
      await ensureContact(freelancerId);
      router.push(`/dashboard/messages?chat=${freelancerId}`);
      Swal.close();
    } catch (err: any) {
      Swal.fire({
        title: "Gagal Menghubungkan",
        text: err.message || "Terjadi kesalahan saat memulai diskusi.",
        icon: "error",
        background: "#0F1B2E",
        color: "#fff"
      });
    }
  };

  if (role !== "client") {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2 style={{ color: "#fff" }}>Akses Ditolak</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Halaman ini hanya dapat diakses oleh Klien.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#fff", marginBottom: "8px", letterSpacing: "-1px" }}>
            Cari <span className="gradient-text">Freelancer</span>
          </h1>
          <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "16px" }}>
            Temukan profesional terbaik untuk berkolaborasi dalam proyek Anda
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "4px", gap: "24px" }}>
        {[
          { id: "recommended", label: "Recommended" },
          { id: "all", label: "All Freelancers" },
          { id: "saved", label: "Saved Freelancers" },
          { id: "available", label: "Available Now" }
        ].map(t => (
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
                layoutId="activeTabUnderline" 
                style={{ position: "absolute", bottom: -5, left: 0, right: 0, height: "3px", background: "var(--cyan)", borderRadius: "2px", boxShadow: "0 0 10px var(--cyan)" }} 
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Grid Layout: Filters Left (Desktop) & Cards Right */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "32px", alignItems: "start" }}>
        
        {/* Desktop Sticky Sidebar Filters */}
        <aside className="glass-card hidden md:flex" style={{ padding: "24px", flexDirection: "column", gap: "20px", position: "sticky", top: "100px", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={16} /> Filter Pencarian
            </h3>
            <button onClick={handleResetFilters} style={{ background: "none", border: "none", color: "#FF4D6A", fontSize: "11px", fontWeight: "800", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reset</button>
          </div>

          {/* Search Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Kata Kunci</label>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.2)" }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari keahlian, nama..."
                style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 12px 10px 34px", color: "#fff", fontSize: "13px", outline: "none" }}
              />
            </div>
          </div>

          {/* Skill Category Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Kategori Keahlian</label>
            <CustomFilterDropdown
              value={filterSkill}
              options={categoryOptions}
              onChange={val => { setFilterSkill(val); setPage(1); }}
              placeholder="Semua Kategori"
            />
          </div>

          {/* Experience level filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Level Pengalaman</label>
            <CustomFilterDropdown
              value={filterExp}
              options={expOptions}
              onChange={val => { setFilterExp(val); setPage(1); }}
              placeholder="Semua Level"
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

          {/* Rating filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Penilaian Minimun</label>
            <CustomFilterDropdown
              value={filterRating}
              options={ratingOptions}
              onChange={val => { setFilterRating(val); setPage(1); }}
              placeholder="Semua Rating"
            />
          </div>

          {/* Availability filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "rgba(226, 232, 240, 0.35)", textTransform: "uppercase" }}>Ketersediaan</label>
            <CustomFilterDropdown
              value={filterAvailability}
              options={availabilityOptions}
              onChange={val => { setFilterAvailability(val); setPage(1); }}
              placeholder="Semua Status"
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
              [searchQuery, filterSkill, filterExp, filterWorkType, filterRating, filterAvailability].filter(Boolean).length
            })
          </button>
          <button onClick={handleResetFilters} style={{ background: "none", border: "none", color: "#FF4D6A", fontSize: "13px", fontWeight: "700" }}>Reset All</button>
        </div>

        {/* Cards Side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {loading && visibleFreelancers.length === 0 ? (
            // Skeleton Loader Items
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card skeleton-card" style={{ height: "240px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div className="skeleton-thumb" style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(255,255,255,0.03)" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="skeleton-bar" style={{ width: "150px", height: "18px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                      <div className="skeleton-bar" style={{ width: "220px", height: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                    </div>
                  </div>
                  <div className="skeleton-bar" style={{ width: "100%", height: "40px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
                </div>
              ))}
            </div>
          ) : visibleFreelancers.length > 0 ? (
            // Cards Listing
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <AnimatePresence mode="popLayout">
                {visibleFreelancers.map((freelancer, idx) => {
                  const isSaved = savedFreelancerIds.includes(freelancer.id);
                  const isAvailable = freelancer.seeded?.availability !== "Sibuk";

                  return (
                    <motion.div
                      key={freelancer.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: (idx % itemsPerPage) * 0.05 }}
                      whileHover={{ y: -4, borderColor: "rgba(77, 99, 255, 0.25)", boxShadow: "0 15px 35px rgba(0,0,0,0.3)" }}
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
                      onClick={() => router.push(`/dashboard/freelancers/${freelancer.id}`)}
                    >
                      {/* Top Header Card */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", gap: "20px" }}>
                          
                          {/* Avatar */}
                          <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0 }}>
                            <div style={{ 
                              width: "64px", 
                              height: "64px", 
                              borderRadius: "18px", 
                              background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "24px",
                              fontWeight: "900",
                              color: "#fff",
                              boxShadow: "0 8px 16px rgba(77, 99, 255, 0.2)"
                            }}>
                              {freelancer.full_name?.[0].toUpperCase()}
                            </div>
                            {/* Online / Status Dot */}
                            <span style={{ 
                              position: "absolute", 
                              bottom: "-2px", 
                              right: "-2px", 
                              width: "14px", 
                              height: "14px", 
                              borderRadius: "50%", 
                              background: isAvailable ? "#00FFA3" : "#EF4444", 
                              border: "2.5px solid #0B1220",
                              boxShadow: isAvailable ? "0 0 10px #00FFA3" : "none"
                            }} />
                          </div>

                          {/* Profile Intro */}
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <h3 style={{ fontSize: "18px", fontWeight: "850", color: "#fff", margin: 0 }}>{freelancer.full_name}</h3>
                              {/* Experience Badge */}
                              <span style={{ 
                                fontSize: "10px", 
                                fontWeight: "800", 
                                textTransform: "uppercase", 
                                padding: "4px 8px", 
                                borderRadius: "6px", 
                                background: (freelancer.ob?.experience_level === "expert" || freelancer.ob?.experience_level === "senior") ? "rgba(245,158,11,0.08)" : "rgba(6,182,212,0.08)",
                                color: (freelancer.ob?.experience_level === "expert" || freelancer.ob?.experience_level === "senior") ? "#F59E0B" : "#06B6D4",
                                border: `1px solid ${(freelancer.ob?.experience_level === "expert" || freelancer.ob?.experience_level === "senior") ? "rgba(245,158,11,0.15)" : "rgba(6,182,212,0.15)"}`
                              }}>
                                {freelancer.ob?.experience_level === "expert" || freelancer.ob?.experience_level === "senior" ? "Expert" : (freelancer.ob?.experience_level === "mid" ? "Intermediate" : "Junior")}
                              </span>
                            </div>

                            {/* Headline */}
                            <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.65)", margin: "4px 0 6px 0", fontWeight: "600" }}>
                              {freelancer.headline}
                            </p>

                            {/* Meta Metrics */}
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "rgba(226, 232, 240, 0.4)" }}>
                              {freelancer.total_reviews > 0 ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Star size={13} fill="#FFD700" color="#FFD700" />
                                  <strong style={{ color: "#FFD700" }}>{freelancer.average_rating.toFixed(1)}</strong>
                                  <span>({freelancer.total_reviews} ulasan)</span>
                                </div>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(226, 232, 240, 0.3)" }}>
                                  <Star size={13} color="rgba(255,255,255,0.15)" />
                                  <span>Belum ada ulasan</span>
                                </div>
                              )}
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <CheckCircle size={13} style={{ color: "#00FFA3" }} />
                                <strong style={{ color: "#fff" }}>{freelancer.completedProjectsCount}</strong> Proyek Selesai
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Briefcase size={13} style={{ color: "var(--cyan)" }} />
                                <strong style={{ color: "#fff" }}>{freelancer.ob?.years_of_experience || freelancer.years_of_experience || 0} Tahun</strong> Pengalaman
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <MapPin size={13} />
                                {freelancer.seeded?.location}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Match & Save Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {/* Match badge */}
                          <span style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "800",
                            background: freelancer.matchPercent >= 90 ? "rgba(16,185,129,0.1)" : (freelancer.matchPercent >= 80 ? "rgba(6,182,212,0.1)" : "rgba(245,158,11,0.1)"),
                            color: freelancer.matchPercent >= 90 ? "#10B981" : (freelancer.matchPercent >= 80 ? "#06B6D4" : "#F59E0B"),
                            border: `1px solid ${freelancer.matchPercent >= 90 ? "rgba(16,185,129,0.2)" : (freelancer.matchPercent >= 80 ? "rgba(6,182,212,0.2)" : "rgba(245,158,11,0.2)")}`
                          }}>
                            {freelancer.matchPercent}% Match
                          </span>

                          {/* Save Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => toggleSaveFreelancer(e, freelancer.id)}
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
                        </div>
                      </div>

                      {/* Bio Summary */}
                      <p style={{ fontSize: "14px", color: "rgba(226, 232, 240, 0.5)", lineHeight: "1.6", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {freelancer.bio || `Halo! Saya adalah ${freelancer.headline} dengan keahlian khusus di bidang teknologi digital. Saya memiliki rekam jejak penyelesaian proyek yang andal dengan fokus pada ketepatan waktu.`}
                      </p>

                      {/* Footer: Skills & Actions */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        {/* Skills list */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "60%" }}>
                          {(freelancer.ob?.tools || (freelancer.skills || []).map(getLabelById)).slice(0, 4).map((skill: string) => (
                            <span key={skill} style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#4D63FF",
                              background: "rgba(77, 99, 255, 0.05)",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: "1px solid rgba(77, 99, 255, 0.1)"
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* CTAs */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ marginRight: "12px", textAlign: "right" }}>
                            <div style={{ fontSize: "16px", fontWeight: "900", color: "#00FFA3" }}>{freelancer.seeded?.hourlyRate}</div>
                            <div style={{ fontSize: "10px", color: "rgba(226,232,240,0.3)" }}>Tarif / Jam</div>
                          </div>
                          
                          <button
                            onClick={() => router.push(`/dashboard/freelancers/${freelancer.id}`)}
                            className="btn-secondary"
                            style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "700" }}
                          >
                            View Profile
                          </button>
                          
                          <button
                            onClick={() => handleStartDiscussion(freelancer.id)}
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
                            <MessageSquare size={13} /> Mulai Diskusi
                          </button>
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
              <Users size={48} style={{ margin: "0 auto 16px", opacity: 0.2, color: "#fff" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>Tidak Ada Freelancer Ditemukan</h3>
              <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
                Cobalah mengubah kata kunci pencarian Anda, bersihkan filter, atau ganti tab ke yang lain.
              </p>
              <button onClick={handleResetFilters} className="btn-secondary" style={{ marginTop: "20px", padding: "8px 20px" }}>Dapatkan Semua Freelancer</button>
            </div>
          )}

          {/* Loader Element for Infinite Scroll */}
          {displayedFreelancers.length > visibleFreelancers.length && (
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
                <h3 style={{ fontSize: "18px", fontWeight: "850", color: "#fff", margin: 0 }}>Filter Pencarian</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Skill category */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Kategori Keahlian</label>
                <CustomFilterDropdown
                  value={filterSkill}
                  options={categoryOptions}
                  onChange={val => { setFilterSkill(val); setPage(1); }}
                  placeholder="Semua Kategori"
                  triggerStyle={{ background: "#060D19", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
                />
              </div>

              {/* Exp level */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Level Pengalaman</label>
                <CustomFilterDropdown
                  value={filterExp}
                  options={expOptions}
                  onChange={val => { setFilterExp(val); setPage(1); }}
                  placeholder="Semua Level"
                  triggerStyle={{ background: "#060D19", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
                />
              </div>

              {/* Work Type */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Tipe Kerjasama</label>
                <CustomFilterDropdown
                  value={filterWorkType}
                  options={workTypeOptions}
                  onChange={val => { setFilterWorkType(val); setPage(1); }}
                  placeholder="Semua Tipe"
                  triggerStyle={{ background: "#060D19", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
                />
              </div>

              {/* Rating */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Penilaian Minimun</label>
                <CustomFilterDropdown
                  value={filterRating}
                  options={ratingOptions}
                  onChange={val => { setFilterRating(val); setPage(1); }}
                  placeholder="Semua Rating"
                  triggerStyle={{ background: "#060D19", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
                />
              </div>

              {/* Availability */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: "rgba(226,232,240,0.35)", textTransform: "uppercase" }}>Ketersediaan</label>
                <CustomFilterDropdown
                  value={filterAvailability}
                  options={availabilityOptions}
                  onChange={val => { setFilterAvailability(val); setPage(1); }}
                  placeholder="Semua Status"
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
