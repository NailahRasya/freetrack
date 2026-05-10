"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, Camera, Save, Loader2, ChevronDown, Check, Building2, Briefcase, Target, Sparkles, X, Plus } from "lucide-react";
import { useUser } from "../layout";
import { supabase } from "@/lib/supabase";
import { ONBOARDING_CATEGORIES, COMMON_TOOLS, TOOLS_BY_CATEGORY, getLabelById, getCategoryIdBySkillId } from "@/app/constants/onboarding-categories";
import Swal from "sweetalert2";

function SuggestionBox({ onSelect }: { onSelect: (val: string) => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    (window as any).setFilteredSuggestions = setSuggestions;
    (window as any).setToolValue = setValue;
    return () => {
      delete (window as any).setFilteredSuggestions;
      delete (window as any).setToolValue;
    };
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        zIndex: 110,
        background: "rgba(15, 27, 46, 0.98)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "14px",
        marginTop: "8px",
        maxHeight: "200px",
        overflowY: "auto",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        padding: "8px"
      }}
    >
      {suggestions.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => {
            onSelect(s);
            setSuggestions([]);
          }}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "transparent",
            border: "none",
            color: "rgba(226, 232, 240, 0.8)",
            fontSize: "14px",
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(77, 99, 255, 0.1)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(226, 232, 240, 0.8)";
          }}
        >
          <Sparkles size={14} style={{ color: "#4D63FF" }} />
          {s}
        </button>
      ))}
    </motion.div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px",
  padding: "12px 16px", color: "#fff", fontSize: "15px",
  outline: "none", boxSizing: "border-box"
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute", top: "100%", left: 0, right: 0, marginTop: "6px",
  background: "rgba(20,30,55,0.98)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "14px", overflow: "hidden", zIndex: 100, boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
};

const STORAGE_KEY = "freetrack_onboarding";

export default function ProfilePage() {
  const { user, role, loading: userLoading } = useUser();
  const [fullName, setFullName] = useState("");
  const [updating, setUpdating] = useState(false);

  // Client Specific States
  const [businessScale, setBusinessScale] = useState("");
  const [workType, setWorkType] = useState("");
  const [expPreference, setExpPreference] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>([]);
  
  const [openScale, setOpenScale] = useState(false);
  const [openWork, setOpenWork] = useState(false);
  const [openExp, setOpenExp] = useState(false);

  // Freelancer Specific States
  const [yearsOfExp, setYearsOfExp] = useState(1);
  const [expLevel, setExpLevel] = useState("mid");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [preferredScales, setPreferredScales] = useState<string[]>([]);
  const [workTypePrefs, setWorkTypePrefs] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [openExpLevel, setOpenExpLevel] = useState(false);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const syncAndFetchData = async () => {
      console.log("🔄 Profile Sync & Fetch started for role:", role);
      
      if (user.profile) {
        setFullName(user.profile.full_name || "");
      }

      const localRaw = localStorage.getItem(STORAGE_KEY);
      const obData = localRaw ? JSON.parse(localRaw) : null;

      // CASE A: Sinkronisasi Data Onboarding Lokal ke Database
      if (obData && obData.role === role) {
        Swal.fire({
          title: 'Data Onboarding!',
          text: 'Menyambungkan pilihan Anda...',
          icon: 'info',
          timer: 1500,
          showConfirmButton: false,
          background: '#0F1B2E',
          color: '#fff'
        });

        try {
          if (role === "freelancer") {
            const rawSkills = obData.skillCategories || [];
            const derivedCats = Array.from(new Set(rawSkills.map((id: string) => getCategoryIdBySkillId(id)).filter(Boolean))) as string[];
            
            const freelancerPayload = {
              user_id: user.id,
              skill_categories: rawSkills,
              years_of_experience: obData.yearsOfExperience,
              experience_level: obData.experienceLevel || "mid",
              portfolio_url: obData.portfolioUrl || "",
              tools: obData.tools || [],
              preferred_client_scales: obData.preferredClientScales || [],
              work_type_preference: obData.workTypePreference || []
            };

            // CEK EKSISTENSI (Manual Upsert)
            const { data: existing } = await supabase.from("onboarding_freelancer").select("user_id").eq("user_id", user.id).maybeSingle();
            
            let response;
            if (existing) {
              response = await supabase.from("onboarding_freelancer").update(freelancerPayload).eq("user_id", user.id);
            } else {
              response = await supabase.from("onboarding_freelancer").insert(freelancerPayload);
            }

            if (response.error) throw response.error;

            // UPDATE UI INSTAN (Agar langsung muncul di layar)
            setSelectedSubSkills(rawSkills);
            setSelectedCats(derivedCats);
            setExpandedCats(derivedCats);
            setYearsOfExp(obData.yearsOfExperience || 1);
            setExpLevel(obData.experienceLevel || "mid");
            setPortfolioUrl(obData.portfolioUrl || "");
            setTools(obData.tools || []);
            setPreferredScales(obData.preferredClientScales || []);
            setWorkTypePrefs(obData.workTypePreference || []);

            await supabase.from("profiles").update({
              skills: Array.from(new Set([...derivedCats, ...rawSkills])),
              experience_level: obData.experienceLevel || "mid",
              years_of_experience: obData.yearsOfExperience || 1,
              onboarding_completed: true
            }).eq("id", user.id);

          } else {
            const rawSkills = obData.projectCategories || [];
            const derivedCats = Array.from(new Set(rawSkills.map((id: string) => getCategoryIdBySkillId(id)).filter(Boolean))) as string[];
            
            const payload = {
              user_id: user.id,
              project_categories: rawSkills,
              business_scale: obData.businessScale || "",
              work_type: obData.workType || "",
              experience_preference: obData.experiencePreference || "mid"
            };

            // CEK EKSISTENSI (Manual Upsert)
            const { data: existing } = await supabase.from("onboarding_client").select("user_id").eq("user_id", user.id).maybeSingle();
            
            let response;
            if (existing) {
              response = await supabase.from("onboarding_client").update(payload).eq("user_id", user.id);
            } else {
              response = await supabase.from("onboarding_client").insert(payload);
            }

            if (response.error) throw response.error;

            // UPDATE UI INSTAN (Client)
            setBusinessScale(obData.businessScale || "UMKM");
            setWorkType(obData.workType || "one-time");
            setExpPreference(obData.experiencePreference || "mid");
            setSelectedCats(derivedCats);
            setSelectedSubSkills(rawSkills);

            await supabase.from("profiles").update({
              onboarding_completed: true
            }).eq("id", user.id);
          }

          localStorage.removeItem(STORAGE_KEY);
          Swal.fire({
            icon: 'success',
            title: 'Sinkronisasi Berhasil!',
            text: 'Data onboarding Anda telah tersimpan permanen.',
            timer: 1500,
            background: '#0F1B2E',
            color: '#fff'
          });
        } catch (err: any) {
          console.error("❌ CRITICAL SYNC ERROR:", err);
          const detailedError = err.message || JSON.stringify(err);
          
          Swal.fire({
            icon: 'error',
            title: 'Gagal Sinkron ke Database',
            text: detailedError,
            footer: `Object: ${JSON.stringify(err).substring(0, 100)}...`,
            background: '#0F1B2E',
            color: '#fff'
          });
        }
      }

      // CASE B: Load Data dari Database
      console.log(`📡 [CASE B] Loading ${role} data from DB for:`, user.id);
      
      if (role === "freelancer") {
        // Ambil salah satu data jika ada duplikat (tanpa order karena created_at tidak ada)
        const { data, error } = await supabase
          .from("onboarding_freelancer")
          .select("*")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error("❌ [CASE B] Error fetching freelancer data:", error);
        }

        if (data) {
          console.log("✅ [CASE B] Freelancer data found:", data);
          const rawSkills = data.skill_categories || [];
          const derivedCats = Array.from(new Set(rawSkills.map((id: string) => getCategoryIdBySkillId(id)).filter(Boolean))) as string[];
          
          setSelectedSubSkills(rawSkills);
          setSelectedCats(derivedCats);
          setExpandedCats(derivedCats);
          setYearsOfExp(data.years_of_experience || 1);
          setExpLevel(data.experience_level || "mid");
          setPortfolioUrl(data.portfolio_url || "");
          setTools(data.tools || []);
          setPreferredScales(data.preferred_client_scales || []);
          setWorkTypePrefs(data.work_type_preference || []);
        } else {
          console.warn("⚠️ [CASE B] No freelancer data found in DB for this user.");
        }
      } else {
        const { data, error } = await supabase
          .from("onboarding_client")
          .select("*")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error("❌ [CASE B] Error fetching client data:", error);
        }

        if (data) {
          console.log("✅ [CASE B] Client data found:", data);
          setBusinessScale(data.business_scale || "UMKM");
          setWorkType(data.work_type || "one-time");
          setExpPreference(data.experience_preference || "mid");
          const rawSkills = data.project_categories || [];
          const derivedCats = Array.from(new Set(rawSkills.map((id: string) => getCategoryIdBySkillId(id)).filter(Boolean))) as string[];
          setSelectedCats(derivedCats);
          setSelectedSubSkills(rawSkills);
        } else {
          console.warn("⚠️ [CASE B] No client data found in DB.");
        }
      }
    };

    syncAndFetchData();
  }, [user?.id, role]);

  const forceSync = async () => {
    const raw = localStorage.getItem("freetrack_onboarding");
    if (!raw) return;
    setIsSyncing(true);
    try {
      const obData = JSON.parse(raw);
      if (obData.role === "freelancer") {
        const rawSkills = obData.skillCategories || [];
        const derivedCats = Array.from(new Set(rawSkills.map((id: string) => getCategoryIdBySkillId(id)).filter(Boolean))) as string[];
        
        console.log("🚀 AUTO-SYNC: Syncing pending local data to database...");

        if (obData.role === "freelancer") {
          const rawSkills = obData.skillCategories || [];
          const derivedCats = Array.from(new Set(rawSkills.map((id: string) => getCategoryIdBySkillId(id)).filter(Boolean))) as string[];
          
          const payload = {
            user_id: user.id,
            skill_categories: rawSkills,
            years_of_experience: obData.yearsOfExperience,
            experience_level: obData.experienceLevel,
            portfolio_url: obData.portfolioUrl || "",
            tools: obData.tools || [],
            preferred_client_scales: obData.preferredClientScales || [],
            work_type_preference: obData.workTypePreference || []
          };

          // Manual Upsert
          const { data: existing } = await supabase.from("onboarding_freelancer").select("user_id").eq("user_id", user.id).maybeSingle();
          if (existing) {
            await supabase.from("onboarding_freelancer").update(payload).eq("user_id", user.id);
          } else {
            await supabase.from("onboarding_freelancer").insert(payload);
          }

          await supabase.from("profiles").update({
            skills: Array.from(new Set([...derivedCats, ...rawSkills])),
            onboarding_completed: true
          }).eq("id", user.id);

          // 2. Update Local State (LENGKAP)
          setSelectedCats(derivedCats);
          setSelectedSubSkills(rawSkills);
          setExpandedCats(derivedCats);
          setYearsOfExp(obData.yearsOfExperience || 1);
          setExpLevel(obData.experienceLevel || "mid");
          setPortfolioUrl(obData.portfolioUrl || "");
          setTools(obData.tools || []);
          setPreferredScales(obData.preferredClientScales || []);
          setWorkTypePrefs(obData.workTypePreference || []);
          
        } else {
          // Logic Client
          const rawSkills = obData.projectCategories || [];
          const derivedCats = Array.from(new Set(rawSkills.map((id: string) => getCategoryIdBySkillId(id)).filter(Boolean))) as string[];
          const payload = {
            user_id: user.id,
            project_categories: rawSkills,
            business_scale: obData.businessScale || "",
            work_type: obData.workType || "",
            experience_preference: obData.experiencePreference || "mid"
          };

          const { data: existing } = await supabase.from("onboarding_client").select("user_id").eq("user_id", user.id).maybeSingle();
          if (existing) {
            await supabase.from("onboarding_client").update(payload).eq("user_id", user.id);
          } else {
            await supabase.from("onboarding_client").insert(payload);
          }

          setBusinessScale(obData.businessScale || "UMKM");
          setWorkType(obData.workType || "one-time");
          setExpPreference(obData.experiencePreference || "mid");
          setSelectedCats(derivedCats);
          setSelectedSubSkills(rawSkills);
        }

        localStorage.removeItem(STORAGE_KEY);
        setHasLocalData(false);

        Swal.fire({
          icon: 'success',
          title: 'Sync Berhasil!',
          text: 'Data onboarding Anda telah berhasil dipulihkan.',
          background: '#0F1B2E',
          color: '#fff'
        });
      }
    } catch (err: any) {
      console.error("❌ Force Sync Error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Sinkronisasi',
        text: err.message,
        background: '#0F1B2E',
        color: '#fff'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdate = async () => {
    if (!fullName.trim()) return;
    setUpdating(true);
    try {
      // 1. Update Profile Dasar
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          full_name: fullName.trim(),
          skills: Array.from(new Set([...selectedCats, ...selectedSubSkills]))
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 2. Update Role Specific Data
      if (role === "client") {
        const { data: existing } = await supabase.from("onboarding_client").select("user_id").eq("user_id", user.id).maybeSingle();
        
        const payload = {
          user_id: user.id,
          business_scale: businessScale,
          work_type: workType,
          experience_preference: expPreference,
          project_categories: Array.from(new Set([...selectedCats, ...selectedSubSkills]))
        };

        const { error: clientError } = existing
          ? await supabase.from("onboarding_client").update(payload).eq("user_id", user.id)
          : await supabase.from("onboarding_client").insert(payload);
        
        if (clientError) throw clientError;
      } else if (role === "freelancer") {
        const { data: existing } = await supabase.from("onboarding_freelancer").select("user_id").eq("user_id", user.id).maybeSingle();

        const payload = {
          user_id: user.id,
          years_of_experience: yearsOfExp,
          experience_level: expLevel,
          portfolio_url: portfolioUrl,
          preferred_client_scales: preferredScales,
          work_type_preference: workTypePrefs,
          tools: tools,
          skill_categories: selectedSubSkills
        };

        const { error: freelancerError } = existing
          ? await supabase.from("onboarding_freelancer").update(payload).eq("user_id", user.id)
          : await supabase.from("onboarding_freelancer").insert(payload);
        
        if (freelancerError) throw freelancerError;
      }

      await Swal.fire({
        icon: "success",
        title: "Profil Diperbarui",
        text: "Informasi profil dan kriteria profesional Anda telah berhasil diperbarui.",
        background: "#0F1B2E",
        color: "#fff",
        confirmButtonColor: "#4D63FF"
      });
      window.location.reload();
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: e.message,
        background: "#0F1B2E",
        color: "#fff",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (userLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", color: "rgba(226,232,240,0.4)" }}>
      <Loader2 className="animate-spin" />
    </div>
  );

  const isClient = role === "client";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%", paddingBottom: "100px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#fff", marginBottom: "8px", letterSpacing: "-1px" }}>
              Profil <span className="gradient-text">Saya</span>
            </h1>
            <p style={{ color: "rgba(226, 232, 240, 0.45)", fontSize: "16px" }}>
              {isClient ? "Kelola identitas dan kriteria bisnis Anda" : "Kelola kriteria profesional dan portofolio keahlian Anda"}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "32px", alignItems: "start" }}>
          {/* Sidebar Profil */}
          <div className="glass-card" style={{ padding: "32px", textAlign: "center", position: "sticky", top: "100px" }}>
            <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 24px" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "40px", background: "linear-gradient(135deg, #4D63FF, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", fontWeight: "800", color: "#fff", boxShadow: "0 20px 40px rgba(77, 99, 255, 0.2)" }}>
                {fullName?.charAt(0).toUpperCase() || "?"}
              </div>
              <button style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "42px", height: "42px", borderRadius: "14px", background: "#4D63FF", border: "4px solid #0B1220", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                <Camera size={18} />
              </button>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>{fullName || "User"}</h3>
            <div style={{ display: "inline-flex", padding: "6px 16px", background: isClient ? "rgba(77, 99, 255, 0.1)" : "rgba(16, 185, 129, 0.1)", borderRadius: "20px", border: `1px solid ${isClient ? "rgba(77, 99, 255, 0.2)" : "rgba(16, 185, 129, 0.2)"}`, fontSize: "12px", fontWeight: "800", color: isClient ? "#4D63FF" : "#10B981", textTransform: "uppercase", letterSpacing: "1px" }}>
              {isClient ? "Business Owner" : "Professional Freelancer"}
            </div>
            
            <div style={{ marginTop: "32px", paddingTop: "32px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
               <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "rgba(226, 232, 240, 0.4)", fontSize: "14px" }}>
                  <Mail size={16} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</span>
               </div>
               <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "rgba(226, 232, 240, 0.4)", fontSize: "14px" }}>
                  <Shield size={16} />
                  <span>ID: {user?.id?.substring(0, 8)}...</span>
               </div>
            </div>
          </div>

          {/* Form Utama */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
             {/* Sync Alert */}
             {hasLocalData && (
               <div style={{ 
                 background: "rgba(16, 185, 129, 0.1)", 
                 border: "1px solid rgba(16, 185, 129, 0.3)", 
                 padding: "16px", 
                 borderRadius: "16px", 
                 display: "flex", 
                 alignItems: "center", 
                 justifyContent: "space-between",
                 gap: "16px"
               }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                   <Sparkles size={20} color="#10B981" />
                   <div>
                     <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>Data Onboarding Ditemukan!</div>
                     <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Pilihan skill Anda saat onboarding tersimpan di browser ini.</div>
                   </div>
                 </div>
                 <button 
                   onClick={forceSync}
                   disabled={isSyncing}
                   style={{ 
                     background: "#10B981", color: "#fff", border: "none", padding: "8px 16px", 
                     borderRadius: "10px", fontSize: "12px", fontWeight: "700", cursor: "pointer" 
                   }}
                 >
                   {isSyncing ? "Menyinkronkan..." : "Sync Sekarang"}
                 </button>
               </div>
             )}

             <div className="glass-card" style={{ padding: "32px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                <User size={18} className="text-primary" /> Informasi Dasar
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226, 232, 240, 0.4)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>Nama Lengkap</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "48px", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='rgba(226, 232, 240, 0.2)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "16px center" }} />
                </div>
              </div>
            </div>

            {isClient ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: "32px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Building2 size={18} className="text-primary" /> Preferensi Bisnis & Kebutuhan
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Skala Bisnis</label>
                      <div onClick={() => setOpenScale(!openScale)} style={{ ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{businessScale || "Pilih Skala"}</span>
                        <ChevronDown size={16} style={{ transform: openScale ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                      </div>
                      <AnimatePresence>
                        {openScale && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={dropdownStyle}>
                            {['Individu', 'Startup', 'UMKM', 'Korporasi'].map(opt => (
                              <div key={opt} onClick={() => { setBusinessScale(opt); setOpenScale(false); }} style={{ padding: "12px 16px", fontSize: "14px", color: businessScale === opt ? "#4D63FF" : "rgba(226,232,240,0.8)", cursor: "pointer", background: businessScale === opt ? "rgba(77,99,255,0.1)" : "transparent" }}>
                                {opt}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div style={{ position: "relative" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Tipe Kerjasama</label>
                      <div onClick={() => setOpenWork(!openWork)} style={{ ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{workType === 'ongoing' ? 'Berkelanjutan' : 'Satu Kali'}</span>
                        <ChevronDown size={16} style={{ transform: openWork ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                      </div>
                      <AnimatePresence>
                        {openWork && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={dropdownStyle}>
                            {[{ id: 'one-time', label: 'Satu Kali' }, { id: 'ongoing', label: 'Berkelanjutan' }].map(opt => (
                              <div key={opt.id} onClick={() => { setWorkType(opt.id); setOpenWork(false); }} style={{ padding: "12px 16px", fontSize: "14px", color: workType === opt.id ? "#10B981" : "rgba(226,232,240,0.8)", cursor: "pointer", background: workType === opt.id ? "rgba(16,185,129,0.1)" : "transparent" }}>
                                {opt.label}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div style={{ position: "relative" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Ekspektasi Pengalaman</label>
                    <div onClick={() => setOpenExp(!openExp)} style={{ ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{expPreference === 'mid' ? 'Intermediate' : (expPreference === 'senior' ? 'Senior' : 'Junior')}</span>
                      <ChevronDown size={16} style={{ transform: openExp ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                    </div>
                    <AnimatePresence>
                      {openExp && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={dropdownStyle}>
                          {[{ id: 'junior', label: 'Junior' }, { id: 'mid', label: 'Intermediate' }, { id: 'senior', label: 'Senior' }].map(opt => (
                            <div key={opt.id} onClick={() => { setExpPreference(opt.id); setOpenExp(false); }} style={{ padding: "12px 16px", fontSize: "14px", color: expPreference === opt.id ? "#06B6D4" : "rgba(226,232,240,0.8)", cursor: "pointer", background: expPreference === opt.id ? "rgba(6,182,212,0.1)" : "transparent" }}>
                              {opt.label}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>Kategori Kebutuhan & Spesialisasi</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {ONBOARDING_CATEGORIES.map(cat => {
                        const isSelected = selectedCats.includes(cat.id);
                        return (
                          <div key={cat.id} style={{ 
                            background: isSelected ? `${cat.color}08` : "rgba(255,255,255,0.02)", 
                            border: `1px solid ${isSelected ? `${cat.color}40` : "rgba(255,255,255,0.05)"}`, 
                            borderRadius: "16px",
                            overflow: "hidden",
                            transition: "all 0.3s ease"
                          }}>
                            <button 
                              onClick={() => setSelectedCats(prev => isSelected ? prev.filter(id => id !== cat.id) : [...prev, cat.id])} 
                              style={{ 
                                width: "100%",
                                padding: "16px", 
                                fontSize: "14px", 
                                fontWeight: "700", 
                                cursor: "pointer", 
                                textAlign: "left", 
                                background: "transparent", 
                                border: "none",
                                color: isSelected ? cat.color : "rgba(226, 232, 240, 0.4)", 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center", 
                                transition: "all 0.2s" 
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ 
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  background: isSelected ? `${cat.color}20` : "rgba(255,255,255,0.03)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: isSelected ? cat.color : "rgba(255,255,255,0.2)",
                                  transition: "all 0.3s"
                                }}>
                                  {cat.icon}
                                </div>
                                {cat.label}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {isSelected && (
                                  <span style={{ 
                                    fontSize: "10px", 
                                    padding: "4px 8px", 
                                    borderRadius: "6px", 
                                    background: cat.color, 
                                    color: "#fff",
                                    textTransform: "uppercase"
                                  }}>
                                    Terpilih
                                  </span>
                                )}
                                <ChevronDown size={16} style={{ transform: isSelected ? "rotate(180deg)" : "none", transition: "0.3s", opacity: 0.5 }} />
                              </div>
                            </button>

                            <AnimatePresence>
                              {isSelected && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }} 
                                  animate={{ height: "auto", opacity: 1 }} 
                                  exit={{ height: 0, opacity: 0 }}
                                  style={{ overflow: "hidden", background: "rgba(0,0,0,0.1)" }}
                                >
                                  <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                                    {cat.skills.map(skill => {
                                      const isSubSelected = selectedSubSkills.includes(skill.id);
                                      return (
                                        <button
                                          key={skill.id}
                                          onClick={() => setSelectedSubSkills(prev => isSubSelected ? prev.filter(id => id !== skill.id) : [...prev, skill.id])}
                                          style={{
                                            padding: "8px 12px",
                                            borderRadius: "10px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            background: isSubSelected ? "rgba(77,99,255,0.15)" : "rgba(255,255,255,0.03)",
                                            border: `1px solid ${isSubSelected ? "#4D63FF" : "rgba(255,255,255,0.08)"}`,
                                            color: isSubSelected ? "#fff" : "rgba(226, 232, 240, 0.5)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                          }}
                                        >
                                          {isSubSelected && <Check size={12} />}
                                          {skill.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: "32px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#fff", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Sparkles size={18} className="text-primary" /> Kriteria Profesional & Keahlian
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>Tahun Pengalaman</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={50} 
                        value={isNaN(yearsOfExp) ? 1 : yearsOfExp} 
                        onChange={e => setYearsOfExp(parseInt(e.target.value) || 1)} 
                        style={inputStyle} 
                      />
                    </div>
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Level Pengalaman</label>
                      <div onClick={() => setOpenExpLevel(!openExpLevel)} style={{ ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{expLevel === 'junior' ? 'Junior' : (expLevel === 'mid' ? 'Intermediate' : 'Senior')}</span>
                        <ChevronDown size={16} style={{ transform: openExpLevel ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                      </div>
                      <AnimatePresence>
                        {openExpLevel && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={dropdownStyle}>
                            {[{ id: 'junior', label: 'Junior' }, { id: 'mid', label: 'Intermediate' }, { id: 'senior', label: 'Senior' }].map(opt => (
                              <div key={opt.id} onClick={() => { setExpLevel(opt.id); setOpenExpLevel(false); }} style={{ padding: "12px 16px", fontSize: "14px", color: expLevel === opt.id ? "#10B981" : "rgba(226,232,240,0.8)", cursor: "pointer", background: expLevel === opt.id ? "rgba(16,185,129,0.1)" : "transparent" }}>
                                {opt.label}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>Bidang Keahlian & Spesialisasi</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {ONBOARDING_CATEGORIES.map(cat => {
                        const isCatSelected = selectedCats.includes(cat.id);
                        const isExpanded = expandedCats.includes(cat.id);
                        return (
                          <div key={cat.id} style={{ 
                            background: isCatSelected ? `${cat.color}08` : "rgba(255,255,255,0.02)", 
                            border: `1px solid ${isCatSelected ? `${cat.color}40` : "rgba(255,255,255,0.05)"}`, 
                            borderRadius: "16px",
                            overflow: "hidden",
                            transition: "all 0.3s ease"
                          }}>
                            <button 
                              onClick={() => {
                                setExpandedCats(prev => isExpanded ? prev.filter(id => id !== cat.id) : [...prev, cat.id]);
                                if (!isCatSelected) setSelectedCats(prev => [...prev, cat.id]);
                              }} 
                              style={{ 
                                width: "100%",
                                padding: "16px", 
                                fontSize: "14px", 
                                fontWeight: "700", 
                                cursor: "pointer", 
                                textAlign: "left", 
                                background: "transparent", 
                                border: "none",
                                color: isCatSelected ? cat.color : "rgba(226, 232, 240, 0.4)", 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center", 
                                transition: "all 0.2s" 
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ 
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  background: isCatSelected ? `${cat.color}20` : "rgba(255,255,255,0.03)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: isCatSelected ? cat.color : "rgba(255,255,255,0.2)",
                                  transition: "all 0.3s"
                                }}>
                                  {cat.icon}
                                </div>
                                {cat.label}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {isCatSelected && (
                                  <span style={{ 
                                    fontSize: "10px", 
                                    padding: "4px 8px", 
                                    borderRadius: "6px", 
                                    background: cat.color, 
                                    color: "#fff",
                                    textTransform: "uppercase"
                                  }}>
                                    Terpilih
                                  </span>
                                )}
                                <ChevronDown size={16} style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "0.3s", opacity: 0.5 }} />
                              </div>
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }} 
                                  animate={{ height: "auto", opacity: 1 }} 
                                  exit={{ height: 0, opacity: 0 }}
                                  style={{ overflow: "hidden", background: "rgba(0,0,0,0.1)" }}
                                >
                                  <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                                    {cat.skills.map(skill => {
                                      const isSubSelected = selectedSubSkills.includes(skill.id);
                                      return (
                                        <button
                                          key={skill.id}
                                          onClick={() => setSelectedSubSkills(prev => isSubSelected ? prev.filter(id => id !== skill.id) : [...prev, skill.id])}
                                          style={{
                                            padding: "8px 12px",
                                            borderRadius: "10px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            background: isSubSelected ? `${cat.color}20` : "rgba(255,255,255,0.03)",
                                            border: `1px solid ${isSubSelected ? cat.color : "rgba(255,255,255,0.08)"}`,
                                            color: isSubSelected ? "#fff" : "rgba(226, 232, 240, 0.5)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                          }}
                                        >
                                          {isSubSelected && <Check size={12} style={{ color: cat.color }} />}
                                          {skill.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                     <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>Tools & Software Spesialisasi</label>
                     <div style={{ position: "relative" }}>
                        <div 
                           onClick={() => document.getElementById('tool-input')?.focus()}
                           style={{ 
                             display: "flex", flexWrap: "wrap", gap: "8px", background: "rgba(255,255,255,0.02)", 
                             padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)",
                             cursor: "text", minHeight: "58px", transition: "all 0.3s ease",
                             alignItems: "center"
                           }}
                        >
                           {tools.map(t => (
                             <span key={t} style={{ padding: "6px 14px", background: "rgba(77, 99, 255, 0.1)", color: "#4D63FF", borderRadius: "8px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                               {t} <X size={12} style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setTools(tools.filter(x => x !== t)); }} />
                             </span>
                           ))}
                           
                           <div style={{ position: "relative", flex: 1, minWidth: "200px", display: "flex", alignItems: "center" }}>
                              {tools.length === 0 && !((window as any).toolInputValue) && (
                                <div style={{ position: "absolute", left: 0, display: "flex", alignItems: "center", gap: "8px", color: "rgba(226, 232, 240, 0.2)", fontSize: "13px", pointerEvents: "none" }}>
                                  <Plus size={16} />
                                  <span>Tambah tools (cth: Figma, React, Python...)</span>
                                </div>
                              )}
                              <input 
                                id="tool-input"
                                type="text" 
                                autoComplete="off"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  (window as any).toolInputValue = val;
                                  const relevantTools = selectedCats.length > 0
                                    ? Array.from(new Set(selectedCats.flatMap(catId => TOOLS_BY_CATEGORY[catId] || [])))
                                    : COMMON_TOOLS;
                                  const filtered = val ? relevantTools.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !tools.includes(s)) : [];
                                  (window as any).setFilteredSuggestions?.(filtered);
                                  setUpdating(u => u); 
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.currentTarget.value.trim();
                                    if (val && !tools.includes(val)) {
                                      setTools([...tools, val]);
                                      e.currentTarget.value = "";
                                      (window as any).toolInputValue = "";
                                      (window as any).setFilteredSuggestions?.([]);
                                    }
                                  }
                                }} 
                                style={{ background: "none", border: "none", color: "#fff", fontSize: "13px", outline: "none", width: "100%", paddingLeft: (tools.length === 0 && !((window as any).toolInputValue)) ? "0" : "0" }} 
                              />
                           </div>
                        </div>

                        {/* Suggestions Dropdown */}
                        <SuggestionBox onSelect={(val) => {
                          if (!tools.includes(val)) setTools([...tools, val]);
                          const input = document.getElementById('tool-input') as HTMLInputElement;
                          if (input) input.value = "";
                          (window as any).toolInputValue = "";
                        }} />
                     </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>Target Skala Klien</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {['Individu', 'Startup', 'UMKM', 'Korporasi'].map(s => (
                          <div key={s} onClick={() => setPreferredScales(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={{ padding: "10px 14px", borderRadius: "10px", background: preferredScales.includes(s) ? "rgba(6, 182, 212, 0.1)" : "rgba(255,255,255,0.01)", border: `1px solid ${preferredScales.includes(s) ? "rgba(6, 182, 212, 0.3)" : "rgba(255,255,255,0.05)"}`, color: preferredScales.includes(s) ? "#06B6D4" : "rgba(226,232,240,0.4)", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                            {s} {preferredScales.includes(s) && <Check size={14} />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>Tipe Kerjasama</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[{ id: 'one-time', label: 'Satu Kali' }, { id: 'ongoing', label: 'Berkelanjutan' }].map(t => (
                          <div key={t.id} onClick={() => setWorkTypePrefs(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])} style={{ padding: "10px 14px", borderRadius: "10px", background: workTypePrefs.includes(t.id) ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.01)", border: `1px solid ${workTypePrefs.includes(t.id) ? "rgba(16, 185, 129, 0.3)" : "rgba(255,255,255,0.05)"}`, color: workTypePrefs.includes(t.id) ? "#10B981" : "rgba(226,232,240,0.4)", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                            {t.label} {workTypePrefs.includes(t.id) && <Check size={14} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                     <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226,232,240,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>Portfolio URL</label>
                     <input 
                       type="text" 
                       value={portfolioUrl}
                       onChange={(e) => setPortfolioUrl(e.target.value)}
                       placeholder="https://behance.net/username atau https://github.com/..."
                       style={{ 
                         width: "100%", background: "rgba(255,255,255,0.02)", 
                         padding: "16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)",
                         color: "#fff", fontSize: "13px", outline: "none"
                       }} 
                     />
                  </div>
                </div>
              </motion.div>
            )}

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleUpdate} disabled={updating}
              className="btn-primary" style={{ padding: "16px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", fontWeight: "800", fontSize: "16px", boxShadow: "0 10px 30px rgba(77, 99, 255, 0.2)" }}>
              {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Simpan Semua Perubahan
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
