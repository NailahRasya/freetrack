"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Star, 
  Bookmark, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Briefcase, 
  Award, 
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileText,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "../../layout";
import { useContacts } from "@/lib/hooks/useContacts";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { seedFreelancerProps } from "../page";

export default function FreelancerDetailPage() {
  const { user, role, loading: userLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const freelancerId = params?.id as string;
  const { ensureContact } = useContacts();

  // Profile data state
  const [freelancer, setFreelancer] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Load Saved list from localStorage
  useEffect(() => {
    if (!freelancerId) return;
    const saved = localStorage.getItem("freetrack_saved_freelancers");
    if (saved) {
      try {
        const savedIds = JSON.parse(saved);
        setIsSaved(savedIds.includes(freelancerId));
      } catch (e) {}
    }
  }, [freelancerId]);

  const toggleSave = () => {
    if (!freelancerId) return;
    const saved = localStorage.getItem("freetrack_saved_freelancers");
    let updated = [];
    if (saved) {
      try {
        updated = JSON.parse(saved);
      } catch (e) {}
    }

    if (updated.includes(freelancerId)) {
      updated = updated.filter((x: string) => x !== freelancerId);
      setIsSaved(false);
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
      updated.push(freelancerId);
      setIsSaved(true);
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
    localStorage.setItem("freetrack_saved_freelancers", JSON.stringify(updated));
  };

  const fetchProfileDetails = useCallback(async () => {
    if (!freelancerId) return;
    try {
      setLoading(true);

      // 1. Get profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", freelancerId)
        .eq("role", "freelancer")
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error(profileError?.message || "Freelancer tidak ditemukan.");
      }

      // 2. Get onboarding data
      const { data: obDataList } = await supabase
        .from("onboarding_freelancer")
        .select("*")
        .eq("user_id", freelancerId);
      const ob = obDataList && obDataList.length > 0 ? obDataList[0] : {};

      // Seed properties
      const seeded = seedFreelancerProps(freelancerId, ob.experience_level || "mid", ob.years_of_experience || 1);

      // 3. Get reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, created_at,
          client:profiles!reviews_client_id_fkey(id, full_name, avatar_url),
          project:projects!reviews_project_id_fkey(id, title)
        `)
        .eq("freelancer_id", freelancerId)
        .order("created_at", { ascending: false });

      // 4. Completed Projects count
      const { count: completedCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("freelancer_id", freelancerId)
        .eq("status", "completed");

      const ratingSum = (reviewsData || []).reduce((sum, r) => sum + r.rating, 0);
      const averageRating = (reviewsData || []).length > 0 
        ? ratingSum / (reviewsData || []).length 
        : (profile.average_rating || 0);
      const totalReviews = (reviewsData || []).length || (profile.total_reviews || 0);
      const totalCompleted = completedCount || 0;

      // Headline
      let headline = "Professional Freelancer";
      const fSkills: string[] = (ob.tools || profile.skills || []).map((s: string) => s.toLowerCase());
      if (fSkills.some((s: string) => s.includes("design") || s.includes("figma") || s.includes("ui") || s.includes("ux"))) {
        headline = "Senior UI/UX & Product Designer";
      } else if (fSkills.some((s: string) => s.includes("react") || s.includes("next") || s.includes("frontend") || s.includes("web"))) {
        headline = "Frontend Developer & React Specialist";
      } else if (fSkills.some((s: string) => s.includes("node") || s.includes("python") || s.includes("backend") || s.includes("database"))) {
        headline = "Backend Engineer & API Specialist";
      } else if (fSkills.some((s: string) => s.includes("write") || s.includes("copy") || s.includes("content"))) {
        headline = "Content Writer & Copywriter Expert";
      }

      setFreelancer({
        ...profile,
        ob,
        seeded,
        headline,
        average_rating: averageRating,
        total_reviews: totalReviews,
        completedProjectsCount: totalCompleted
      });

      setReviews(reviewsData || []);
    } catch (err: any) {
      console.error("Error loading freelancer profile details:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Gagal memuat profil.",
        icon: "error",
        background: "#0F1B2E",
        color: "#fff"
      });
    } finally {
      setLoading(false);
    }
  }, [freelancerId]);

  useEffect(() => {
    fetchProfileDetails();
  }, [fetchProfileDetails]);

  const handleStartDiscussion = async () => {
    if (!freelancerId) return;
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
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Halaman ini hanya dapat diakses oleh Klien.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={40} style={{ color: "var(--cyan)", animation: "spin 1s linear infinite", marginBottom: "16px" }} />
        <p style={{ fontSize: "16px", fontWeight: "700" }}>Memuat detail profil...</p>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "rgba(226,232,240,0.4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <h3 style={{ color: "#fff", fontWeight: "800", fontSize: "20px" }}>Profil Tidak Ditemukan</h3>
        <button onClick={() => router.push("/dashboard/freelancers")} className="btn-primary" style={{ padding: "10px 20px", borderRadius: "12px" }}>
          Kembali ke Direktori
        </button>
      </div>
    );
  }

  // Derived Certificates based on hash and skills
  const skillsArray = freelancer.ob?.tools || freelancer.skills || [];
  const primarySkill = skillsArray[0] || "Teknologi";
  const certificates = [
    { title: `Google Professional ${primarySkill} Certificate`, issuer: "Google Coursera", year: "2025" },
    { title: `Certified Specialist in ${primarySkill} Development`, issuer: "TechAcademy", year: "2024" }
  ];

  // Derived Portfolio Mockups
  const portfolios = [
    { title: "Redesign Platform E-Commerce Lokal", desc: "Meningkatkan tingkat konversi pembelian sebesar 24% melalui perbaikan alur pengguna dan visual modern.", url: freelancer.ob?.portfolio_url },
    { title: "Pengembangan Dashboard SaaS FinTech", desc: "Membangun antarmuka pengelolaan portofolio investasi yang kompleks dengan visualisasi data interaktif.", url: freelancer.ob?.portfolio_url }
  ];

  const isAvailable = freelancer.seeded?.availability !== "Sibuk";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Back Button */}
      <header>
        <button 
          onClick={() => router.push("/dashboard/freelancers")}
          style={{
            display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 16px",
            color: "rgba(226, 232, 240, 0.7)", cursor: "pointer", fontSize: "13px", fontWeight: "700",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(226, 232, 240, 0.7)"; }}
        >
          <ArrowLeft size={16} /> Kembali ke Direktori
        </button>
      </header>

      {/* Main Grid: Info Details (Left) & Sticky Sidebar (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "28px", alignItems: "flex-start" }}>
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Cover & Main Bio Card */}
          <div className="glass-card" style={{
            padding: "40px", background: "rgba(10, 20, 45, 0.3)", borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.05)", position: "relative", overflow: "hidden",
            display: "flex", flexDirection: "column", gap: "24px"
          }}>
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
              {/* Avatar Large */}
              <div style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}>
                <div style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "22px", 
                  background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "900",
                  color: "#fff",
                  boxShadow: "0 10px 25px rgba(77, 99, 255, 0.25)"
                }}>
                  {freelancer.full_name?.[0].toUpperCase()}
                </div>
                <span style={{ 
                  position: "absolute", 
                  bottom: "-2px", 
                  right: "-2px", 
                  width: "18px", 
                  height: "18px", 
                  borderRadius: "50%", 
                  background: isAvailable ? "#00FFA3" : "#EF4444", 
                  border: "3px solid #0B1220",
                  boxShadow: isAvailable ? "0 0 10px #00FFA3" : "none"
                }} />
              </div>

              {/* Name Details */}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", margin: 0 }}>{freelancer.full_name}</h1>
                  <ShieldCheck size={20} color="#00FFA3" />
                </div>
                
                <p style={{ fontSize: "16px", color: "var(--cyan-light)", fontWeight: "700", margin: 0 }}>
                  {freelancer.headline}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "rgba(226, 232, 240, 0.4)", marginTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Star size={14} fill="#FFD700" color="#FFD700" />
                    <strong style={{ color: "#FFD700" }}>{freelancer.average_rating.toFixed(1)}</strong>
                    <span>({freelancer.total_reviews} ulasan)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} />
                    {freelancer.seeded?.location}
                  </div>
                </div>
              </div>
            </div>

            {/* About / Bio */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>Deskripsi Profil (Bio)</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(226,232,240,0.65)", whiteSpace: "pre-line" }}>
                {freelancer.bio || `Halo! Saya adalah ${freelancer.headline} dengan keahlian khusus di bidang ${primarySkill}. Saya telah mendedikasikan waktu selama bertahun-tahun untuk mengasah kemampuan saya demi memberikan hasil pengerjaan terbaik bagi para klien.\n\nDalam bekerja, saya selalu mengutamakan komunikasi yang terbuka, profesionalisme, ketepatan waktu, dan kualitas deliverables yang di atas ekspektasi. Saya siap berkolaborasi untuk mensukseskan proyek Anda.`}
              </p>
            </div>
          </div>

          {/* Experience Details */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <Briefcase size={20} color="var(--cyan)" /> Pengalaman Kerja & Kriteria Profesional
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.35)", textTransform: "uppercase", fontWeight: "700" }}>Total Pengalaman</div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginTop: "4px" }}>{freelancer.ob?.years_of_experience || 1} Tahun</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.35)", textTransform: "uppercase", fontWeight: "700" }}>Level Kompetensi</div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginTop: "4px", textTransform: "capitalize" }}>
                  {freelancer.ob?.experience_level === "expert" || freelancer.ob?.experience_level === "senior" ? "Expert (Senior)" : (freelancer.ob?.experience_level === "mid" ? "Intermediate (Mid)" : "Junior")}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.35)", textTransform: "uppercase", fontWeight: "700" }}>Skala Bisnis Favorit</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {(freelancer.ob?.preferred_client_scales || ["Individu", "UMKM"]).join(", ")}
                </div>
              </div>
            </div>
          </div>

          {/* Top Skills List */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", margin: 0 }}>Spesialisasi Keahlian & Tools</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {skillsArray.map((skill: string) => (
                <span key={skill} style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#fff",
                  background: "rgba(77, 99, 255, 0.1)",
                  border: "1px solid rgba(77, 99, 255, 0.2)",
                  padding: "6px 14px",
                  borderRadius: "8px"
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolios List */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", margin: 0 }}>Portofolio Proyek</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", flexWrap: "wrap" }} className="grid-cols-1 sm:grid-cols-2">
              {portfolios.map((port, idx) => (
                <div key={idx} style={{ 
                  padding: "20px", 
                  background: "rgba(255,255,255,0.02)", 
                  border: "1px solid rgba(255,255,255,0.04)", 
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>{port.title}</h4>
                    <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.45)", lineHeight: "1.6", margin: 0 }}>{port.desc}</p>
                  </div>
                  {port.url && (
                    <a href={port.url} target="_blank" rel="noopener noreferrer" style={{
                      marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px",
                      color: "var(--cyan)", fontSize: "12px", fontWeight: "800", textDecoration: "none"
                    }}>
                      Lihat Tautan Proyek <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <Award size={20} color="#FFD700" /> Sertifikasi Kredensial
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {certificates.map((cert, idx) => (
                <div key={idx} style={{ display: "flex", justifyItems: "center", alignItems: "center", gap: "16px", padding: "16px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(255,215,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFD700" }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#fff", margin: 0 }}>{cert.title}</h4>
                    <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)", marginTop: "2px" }}>Penerbit: {cert.issuer} • {cert.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <Star size={20} fill="#FFD700" color="#FFD700" /> Ulasan Klien ({freelancer.total_reviews})
            </h3>
            
            {reviews.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800" }}>
                          {rev.client?.full_name?.[0] || "?"}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>{rev.client?.full_name || "Klien"}</div>
                          {rev.project?.title && <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>Proyek: {rev.project.title}</div>}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} fill={s <= rev.rating ? "#FFD700" : "none"} color={s <= rev.rating ? "#FFD700" : "rgba(255,255,255,0.15)"} />
                          ))}
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>
                          {new Date(rev.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <p style={{ color: "rgba(226, 232, 240, 0.65)", fontSize: "14px", margin: 0, fontStyle: "italic", lineHeight: "1.6" }}>
                      "{rev.comment || "Pekerjaan diselesaikan dengan sangat baik dan profesional."}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "30px 20px" }}>
                <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "14px", margin: 0 }}>Belum ada ulasan dari klien.</p>
                <p style={{ color: "rgba(226,232,240,0.25)", fontSize: "12px", marginTop: "4px" }}>Ulasan akan muncul setelah proyek diselesaikan dan klien memberikan penilaian.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "100px" }}>
          {/* Metrics Card */}
          <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px", background: "rgba(13,25,48,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
            
            {/* Hourly Rate */}
            <div>
              <div style={{ fontSize: "12px", color: "rgba(226,232,240,0.4)" }}>Tarif Per Jam</div>
              <div style={{ fontSize: "28px", fontWeight: "950", color: "#00FFA3", marginTop: "4px" }}>
                {freelancer.seeded?.hourlyRate}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
              {/* Availability */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: isAvailable ? "rgba(0,255,163,0.08)" : "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: isAvailable ? "#00FFA3" : "#EF4444" }}>
                  <Clock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>Ketersediaan Kerja</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{freelancer.seeded?.availability}</div>
                </div>
              </div>

              {/* Response Time */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#06B6D4" }}>
                  <Clock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>Waktu Respons Rata-rata</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{freelancer.seeded?.responseTime}</div>
                </div>
              </div>

              {/* Completed projects */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(77, 99, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4D63FF" }}>
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "rgba(226,232,240,0.3)" }}>Jumlah Proyek Selesai</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{freelancer.completedProjectsCount} Proyek</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Diskusi */}
            <button
              onClick={handleStartDiscussion}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px",
                background: "linear-gradient(135deg, #4D63FF, #06B6D4)", color: "#fff",
                border: "none", fontSize: "15px", fontWeight: "800", cursor: "pointer",
                boxShadow: "0 10px 20px rgba(77, 99, 255, 0.15)", display: "flex",
                alignItems: "center", justifyContent: "center", gap: "8px"
              }}
            >
              <MessageSquare size={16} /> Mulai Diskusi
            </button>

            {/* Save Bookmark */}
            <button
              onClick={toggleSave}
              style={{
                width: "100%", padding: "14px", borderRadius: "14px",
                background: isSaved ? "rgba(255, 191, 0, 0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isSaved ? "rgba(255, 191, 0, 0.25)" : "rgba(255, 255, 255, 0.08)"}`,
                color: isSaved ? "#FFBF00" : "rgba(226, 232, 240, 0.6)",
                fontSize: "14px", fontWeight: "800", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s"
              }}
            >
              <Bookmark size={15} fill={isSaved ? "#FFBF00" : "none"} /> 
              {isSaved ? "Freelancer Tersimpan" : "Simpan Freelancer"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
