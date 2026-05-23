"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ChevronDown, FileEdit, Check, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { useUser } from "../../dashboard/layout";
import { createClient } from "@/utils/supabase/client";
import { ONBOARDING_CATEGORIES } from "../../constants/onboarding-categories";
import { parseProjectDescription } from "../../lib/project-helper";
import Swal from "sweetalert2";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
  padding: "12px 16px", color: "#fff", fontSize: "14px",
  outline: "none", boxSizing: "border-box", colorScheme: "dark" as any,
  transition: "all 0.2s"
};

interface Props {
  contacts: any[];
  onClose: () => void;
  onSaveDraft: (data: any) => Promise<void>;
  onSendToClient: (data: any) => Promise<void>;
  initialData?: any;
}

interface DropdownProps {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
}

function CustomDropdown({ label, value, options, onChange, placeholder = "Pilih...", error }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.id === value)?.label || placeholder;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "900", color: "rgba(226,232,240,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
          background: isOpen ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
          borderColor: error ? "#FF4D6A" : (isOpen ? "rgba(77,99,255,0.4)" : "rgba(255,255,255,0.08)"),
        }}
      >
        <span style={{ color: value ? "#fff" : "rgba(226,232,240,0.4)" }}>{selectedLabel}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "rgba(226, 232, 240, 0.4)" }} />
      </button>

      {error && <p style={{ color: "#FF4D6A", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1100,
              marginTop: "8px",
              background: "rgba(15, 27, 46, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ maxHeight: "200px", overflowY: "auto", padding: "6px" }}>
              {options.map((opt) => (
                <motion.button
                  key={opt.id}
                  whileHover={{ background: "rgba(77, 99, 255, 0.1)", x: 4 }}
                  onClick={() => { onChange(opt.id); setIsOpen(false); }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: value === opt.id ? "rgba(77, 99, 255, 0.15)" : "transparent",
                    border: "none",
                    color: value === opt.id ? "#fff" : "rgba(226, 232, 240, 0.7)",
                    fontSize: "14px",
                    fontWeight: value === opt.id ? "700" : "500",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.2s"
                  }}
                >
                  {value === opt.id && <Check size={14} color="#4D63FF" />}
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CreateProjectModal({ contacts, onClose, onSaveDraft, onSendToClient, initialData }: Props) {
  const supabase = createClient();
  const { user, role, t } = useUser();

  const formatRupiah = (value: string) => {
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
    return rupiah ? "Rp " + rupiah : "";
  };

  const parsedDesc = parseProjectDescription(initialData?.description || "");

  const [form, setForm] = useState({
    name: initialData?.title || "",
    clientId: (role === "client" ? initialData?.freelancer_id : initialData?.client_id) || "",
    clientName: (role === "client" ? initialData?.freelancer?.full_name : initialData?.client?.full_name) || "",
    budget: initialData?.budget ? formatRupiah(initialData.budget) : "",
    negotiation_reason: initialData?.rejection_reason || "",
    categoryId: initialData?.category_id || "",
    skills: (initialData?.required_skills || []) as string[],
    
    // Rich marketplace fields
    summary: parsedDesc.is_rich ? parsedDesc.summary : "",
    description: parsedDesc.description,
    goals: parsedDesc.goals,
    deliverables: parsedDesc.deliverables,
    budget_type: parsedDesc.is_rich ? parsedDesc.budget_type : "fixed",
    duration: parsedDesc.duration,
    deadline: parsedDesc.deadline || initialData?.deadline || "",
    experienceLevel: parsedDesc.is_rich ? parsedDesc.experienceLevel : (initialData?.experience_level || "mid"),
    workType: initialData?.work_type || "one-time",
    communication_preference: parsedDesc.communication_preference,
    screening_questions: parsedDesc.screening_questions,
    attachments: parsedDesc.attachments,
    posting_status: parsedDesc.is_rich 
      ? parsedDesc.posting_status 
      : (initialData?.status === "cancelled" ? "closed" : (initialData?.status === "published" ? "published" : "draft"))
  });

  // State wizard
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [newQuestion, setNewQuestion] = useState("");
  const [newAttachment, setNewAttachment] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState((role === "client" ? initialData?.freelancer?.full_name : initialData?.client?.full_name) || "");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientPref, setClientPref] = useState<any>(null);

  // Load draft from localStorage on mount/open
  useEffect(() => {
    if (user?.id && !initialData) {
      const stored = localStorage.getItem(`freetrack_project_form_draft_${user.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name || parsed.description || parsed.summary) {
            setForm(f => ({ ...f, ...parsed }));
            if (parsed.clientName) {
              setClientSearch(parsed.clientName);
            }
          }
        } catch (e) {
          console.error("Failed to restore project form draft:", e);
        }
      }
    }
  }, [user?.id, initialData]);

  // Save draft to localStorage on form changes
  useEffect(() => {
    if (user?.id && !initialData) {
      localStorage.setItem(`freetrack_project_form_draft_${user.id}`, JSON.stringify(form));
    }
  }, [form, user?.id, initialData]);

  useEffect(() => {
    if (role === "client" && user?.id) {
      const fetchPref = async () => {
        const { data } = await supabase
          .from("onboarding_client")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) {
          setClientPref(data);
          if (!initialData) {
            setForm(f => ({
              ...f,
              categoryId: data.project_categories?.[0] || "",
              experienceLevel: data.experience_preference || "mid",
              workType: data.work_type || "one-time"
            }));
          }
        }
      };
      fetchPref();
    }
  }, [role, user?.id, initialData]);

  const availableCategories = (role === "client" && clientPref?.project_categories)
    ? ONBOARDING_CATEGORIES.filter(c => clientPref.project_categories.some((pc: string) => 
        pc === c.id || c.skills.some(s => s.id === pc)
      ))
    : ONBOARDING_CATEGORIES;

  const isNego = initialData && (
    (role === "freelancer" && initialData.status === "pending_freelancer") ||
    (role === "client" && initialData.status === "pending_client")
  );

  const filtered = contacts.filter(c => {
    const p = role === "client" ? c.freelancer : c.client;
    return p?.full_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
           p?.email?.toLowerCase().includes(clientSearch.toLowerCase());
  });

  const selectClient = (c: any) => {
    const target = role === "client" ? c.freelancer : c.client;
    setForm(f => ({ ...f, clientId: target.id, clientName: target.full_name }));
    setClientSearch(target.full_name);
    setShowDropdown(false);
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setForm(f => ({ ...f, screening_questions: [...f.screening_questions, newQuestion.trim()] }));
      setNewQuestion("");
    }
  };
  const removeQuestion = (idx: number) => {
    setForm(f => ({ ...f, screening_questions: f.screening_questions.filter((_, i) => i !== idx) }));
  };

  const addAttachment = () => {
    if (newAttachment.trim()) {
      setForm(f => ({ ...f, attachments: [...f.attachments, newAttachment.trim()] }));
      setNewAttachment("");
    }
  };
  const removeAttachment = (idx: number) => {
    setForm(f => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
  };

  const payload = (targetStatus?: string) => {
    const isPublicMarket = role === "client" && !form.clientId;
    let finalStatus = "draft";
    if (targetStatus) {
      finalStatus = targetStatus;
    } else if (initialData?.status) {
      finalStatus = initialData.status;
    } else {
      finalStatus = form.posting_status || "draft";
    }

    const serializedDescription = JSON.stringify({
      is_rich: true,
      summary: form.summary,
      description: form.description,
      goals: form.goals,
      deliverables: form.deliverables,
      budget_type: form.budget_type,
      duration: form.duration,
      deadline: form.deadline,
      experienceLevel: form.experienceLevel,
      communication_preference: form.communication_preference,
      screening_questions: form.screening_questions,
      attachments: form.attachments,
      posting_status: finalStatus === "cancelled" ? "closed" : finalStatus
    });

    return {
      title: form.name, 
      client_id: role === "client" ? null : (form.clientId || null),
      freelancer_id: role === "client" ? (form.clientId || null) : null,
      budget: form.budget, 
      deadline: form.deadline || null,
      description: serializedDescription,
      rejection_reason: form.negotiation_reason,
      category_id: form.categoryId,
      required_skills: [
        ...form.skills,
        `EXP:${form.experienceLevel}`,
        `WORK:${form.workType}`
      ],
      status: finalStatus === "closed" ? "cancelled" : finalStatus
    };
  };

  // Step-by-step Validation
  const validateStep = (currentStep: number): boolean => {
    setErr("");
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.name.trim()) newErrors.name = "Nama proyek wajib diisi";
      if (!form.summary.trim()) newErrors.summary = "Ringkasan singkat wajib diisi";
      if (!form.categoryId) newErrors.categoryId = "Kategori proyek wajib diisi";
      if (role === "freelancer" && !form.clientId) newErrors.clientId = "Pilih klien terlebih dahulu";
    } else if (currentStep === 2) {
      if (!form.budget.trim()) newErrors.budget = "Anggaran proyek wajib diisi";
    } else if (currentStep === 3) {
      if (!form.description.trim()) newErrors.description = "Deskripsi lengkap proyek wajib diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErr = Object.values(newErrors)[0];
      setErr(firstErr);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleDraft = async () => {
    if (!form.name.trim()) {
      setErr("Nama proyek wajib diisi untuk menyimpan draf");
      setErrors({ name: "Nama proyek wajib diisi" });
      return;
    }
    setLoading(true);
    try { 
      const finalPayload = payload(initialData ? initialData.status : "draft");
      await onSaveDraft(finalPayload); 
      if (user?.id) {
        localStorage.removeItem(`freetrack_project_form_draft_${user.id}`);
      }
      onClose(); 
    }
    catch (e: any) { setErr(e.message); }
    setLoading(false);
  };

  const handleSend = async () => {
    const isPublicMarket = role === "client" && !form.clientId;
    
    // Validate steps 1, 2, 3 fully before sending/publishing
    let allValid = true;
    for (let i = 1; i <= 3; i++) {
      if (!validateStep(i)) {
        setStep(i);
        allValid = false;
        break;
      }
    }
    if (!allValid) return;

    setLoading(true);
    try { 
      const activeStatus = isPublicMarket ? "published" : (initialData?.status || "draft");
      const finalPayload = payload(activeStatus);
      if (isPublicMarket) {
        await onSaveDraft(finalPayload); 
      } else {
        await onSendToClient(finalPayload); 
      }
      if (user?.id) {
        localStorage.removeItem(`freetrack_project_form_draft_${user.id}`);
      }
      onClose(); 
    }
    catch (e: any) { setErr(e.message); }
    setLoading(false);
  };

  const stepsConfig = [
    { step: 1, label: "Info Dasar" },
    { step: 2, label: "Budget & Waktu" },
    { step: 3, label: "Detail Proyek" },
    { step: 4, label: "Preferensi" },
    { step: 5, label: "Tinjau & Publikasi" },
  ];

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"}}>
      <motion.div initial={{scale:0.92,y:20}} animate={{scale:1,y:0}} exit={{scale:0.92,y:20}}
        onClick={e=>e.stopPropagation()} className="glass-card"
        style={{
          width:"100%",
          maxWidth:"640px",
          borderRadius:"24px",
          background:"rgba(15,27,46,0.98)",
          border:"1px solid rgba(255,255,255,0.08)",
          maxHeight:"92vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden"
        }}>
        
        {/* Header (Sticky) */}
        <div style={{padding:"28px 32px 14px", borderBottom:"1px solid rgba(255,255,255,0.04)", flexShrink: 0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
            <div>
              <h2 style={{fontSize:"20px",fontWeight:"900",color:"#fff",margin: 0, letterSpacing: "-0.5px"}}>
                {initialData ? "Edit" : "Buat"} <span className="gradient-text">{initialData ? "Detail Proyek" : "Proyek Baru"}</span>
              </h2>
              <p style={{fontSize:"13px",color:"rgba(226,232,240,0.4)", margin: "4px 0 0 0"}}>
                Wizard Langkah {step} dari 5: {stepsConfig[step-1].label}
              </p>
            </div>
            <button onClick={onClose} style={{width:"36px",height:"36px",borderRadius:"10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(226,232,240,0.6)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer", transition:"all 0.2s"}}>
              <X size={16}/>
            </button>
          </div>

          {/* Stepper Progress bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", padding: "10px 0" }}>
            {stepsConfig.map((s, idx) => {
              const isCompleted = step > s.step;
              const isActive = step === s.step;
              return (
                <div key={s.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2, flex: 1 }}>
                  <button 
                    type="button"
                    onClick={() => {
                      if (s.step < step) {
                        setStep(s.step);
                      } else if (s.step > step) {
                        let canGo = true;
                        for (let i = step; i < s.step; i++) {
                          if (!validateStep(i)) {
                            canGo = false;
                            break;
                          }
                        }
                        if (canGo) setStep(s.step);
                      }
                    }}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: isCompleted 
                        ? "#10B981" 
                        : (isActive ? "linear-gradient(135deg, #4D63FF, #06B6D4)" : "rgba(15, 27, 46, 0.98)"),
                      border: "2px solid",
                      borderColor: isCompleted 
                        ? "#10B981" 
                        : (isActive ? "#00FFA3" : "rgba(255,255,255,0.1)"),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "900",
                      color: isCompleted || isActive ? "#fff" : "rgba(226,232,240,0.4)",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 0 15px rgba(77,99,255,0.4)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    {isCompleted ? <Check size={12} /> : s.step}
                  </button>
                  <span 
                    className="step-label"
                    style={{
                      fontSize: "9px",
                      fontWeight: "800",
                      color: isActive ? "#fff" : "rgba(226,232,240,0.3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginTop: "6px",
                      textAlign: "center"
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
            {/* Background line */}
            <div style={{ position: "absolute", top: "24px", left: "20px", right: "20px", height: "2px", background: "rgba(255,255,255,0.05)", zIndex: 1 }}>
              <motion.div 
                animate={{ width: `${((step - 1) / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
                style={{ height: "100%", background: "linear-gradient(90deg, #4D63FF, #10B981)" }} 
              />
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div style={{padding:"28px 32px", overflowY:"auto", flex: 1, display: "flex", flexDirection: "column", gap: "20px"}}>
          {err && <p style={{color:"#FF4D6A",fontSize:"13px",margin:0,fontWeight:"600", background: "rgba(255,77,106,0.08)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,77,106,0.15)"}}>⚠️ {err}</p>}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{opacity:0, x: 20}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -20}} style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Informasi Dasar</label>
                  <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                    <div>
                      <label style={{display:"block",fontSize:"12px",color:"rgba(226,232,240,0.5)",marginBottom:"6px"}}>Nama Proyek *</label>
                      <input type="text" placeholder="cth. E-Commerce Mobile App" value={form.name}
                        onChange={e=>{setForm(f=>({...f,name:e.target.value})); setErrors(prev=>({...prev, name:""}));}} 
                        style={{...inputStyle, borderColor: errors.name ? "#FF4D6A" : "rgba(255,255,255,0.08)"}}/>
                      {errors.name && <p style={{ color: "#FF4D6A", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>{errors.name}</p>}
                    </div>

                    <div>
                      <label style={{display:"block",fontSize:"12px",color:"rgba(226,232,240,0.5)",marginBottom:"6px"}}>Ringkasan Singkat Proyek * (maks 150 karakter)</label>
                      <input type="text" placeholder="Tulis ringkasan singkat untuk kartu pratinjau marketplace..." value={form.summary}
                        onChange={e=>{setForm(f=>({...f,summary:e.target.value})); setErrors(prev=>({...prev, summary:""}));}} 
                        style={{...inputStyle, borderColor: errors.summary ? "#FF4D6A" : "rgba(255,255,255,0.08)"}} maxLength={150}/>
                      {errors.summary && <p style={{ color: "#FF4D6A", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>{errors.summary}</p>}
                    </div>
                    
                    {role === "freelancer" && (
                      <div>
                        <label style={{display:"block",fontSize:"12px",color:"rgba(226,232,240,0.5)",marginBottom:"6px"}}>Pilih Klien *</label>
                        <div style={{position:"relative"}}>
                          <input type="text" placeholder="Cari nama atau email klien..." value={clientSearch}
                            onFocus={()=>setShowDropdown(true)}
                            onChange={e=>{setClientSearch(e.target.value);setForm(f=>({...f,clientId:"",clientName:e.target.value}));setErrors(prev=>({...prev, clientId:""}));setShowDropdown(true);}}
                            style={{...inputStyle, paddingRight:"44px", borderColor: errors.clientId ? "#FF4D6A" : "rgba(255,255,255,0.08)"}}/>
                          <button type="button" onClick={()=>setShowDropdown(p=>!p)}
                            style={{position:"absolute",right:"10px",top:"50%",transform:showDropdown?"translateY(-50%) rotate(180deg)":"translateY(-50%)",transition:"transform 0.2s",background:"transparent",border:"none",cursor:"pointer",color:"rgba(226,232,240,0.4)",display:"flex",alignItems:"center",justifyContent:"center",padding:"4px"}}>
                            <ChevronDown size={16}/>
                          </button>
                          
                          <AnimatePresence>
                            {showDropdown && (
                              <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                                style={{position:"absolute",top:"100%",left:0,right:0,marginTop:"6px",background:"rgba(13,23,48,0.98)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"14px",overflow:"hidden",zIndex:100,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
                                {contacts.length === 0 ? (
                                  <div style={{padding:"20px",textAlign:"center"}}>
                                    <p style={{color:"rgba(226,232,240,0.3)",fontSize:"13px",marginBottom:"8px"}}>Belum ada kontak klien</p>
                                    <a href="/dashboard/contacts" style={{color:"#4D63FF",fontSize:"13px",fontWeight:"600"}}>Cari klien →</a>
                                  </div>
                                ) : filtered.length === 0 ? (
                                  <div style={{padding:"16px",textAlign:"center",color:"rgba(226,232,240,0.3)",fontSize:"13px"}}>Tidak ada kontak ditemukan</div>
                                ) : filtered.map((c:any) => {
                                  const target = c.client;
                                  return (
                                  <motion.div key={c.id} whileHover={{background:"rgba(77,99,255,0.1)"}}
                                    onClick={()=>selectClient(c)}
                                    style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                                    <div style={{width:"34px",height:"34px",borderRadius:"50%",background:"linear-gradient(135deg,#4D63FF,#06B6D4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"700",color:"#fff",flexShrink:0}}>
                                      {target?.full_name?.charAt(0) ?? "?"}
                                    </div>
                                    <div>
                                      <div style={{color:"#fff",fontWeight:"600",fontSize:"14px"}}>{target?.full_name}</div>
                                      <div style={{color:"rgba(226,232,240,0.4)",fontSize:"12px"}}>{target?.email}</div>
                                    </div>
                                  </motion.div>
                                )})}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {errors.clientId && <p style={{ color: "#FF4D6A", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>{errors.clientId}</p>}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"14px"}}>
                  <CustomDropdown 
                    label="Kategori Proyek *"
                    value={form.categoryId}
                    options={availableCategories}
                    onChange={(val) => { setForm(f => ({ ...f, categoryId: val, skills: [] })); setErrors(prev=>({...prev, categoryId:""})); }}
                    placeholder="Pilih Kategori..."
                    error={errors.categoryId}
                  />
                </div>

                {form.categoryId && (
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
                    <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"12px"}}>Pilih Keahlian Spesifik</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {availableCategories.find(c => c.id === form.categoryId)?.skills.map(s => {
                        const isSelected = form.skills.includes(s.label);
                        return (
                          <motion.button
                            key={s.id}
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              if (isSelected) {
                                setForm(f => ({ ...f, skills: f.skills.filter(sk => sk !== s.label) }));
                              } else {
                                setForm(f => ({ ...f, skills: [...f.skills, s.label] }));
                              }
                            }}
                            style={{
                              padding: "8px 14px",
                              borderRadius: "10px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              border: "1px solid",
                              borderColor: isSelected ? "#4D63FF" : "rgba(255,255,255,0.06)",
                              background: isSelected ? "rgba(77, 99, 255, 0.15)" : "rgba(255,255,255,0.02)",
                              color: isSelected ? "#fff" : "rgba(226, 232, 240, 0.4)",
                              transition: "all 0.2s"
                            }}
                          >
                            {isSelected && <Check size={12} style={{marginRight:"6px"}} />}
                            {s.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{opacity:0, x: 20}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -20}} style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
                  <CustomDropdown
                    label="Tipe Budget"
                    value={form.budget_type}
                    options={[
                      { id: "fixed", label: "Fixed Price" },
                      { id: "hourly", label: "Hourly Rate" }
                    ]}
                    onChange={(val) => setForm(f => ({ ...f, budget_type: val as "fixed" | "hourly" }))}
                  />
                  <div>
                    <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Anggaran *</label>
                    <input type="text" placeholder="cth. Rp 12.500.000" value={form.budget}
                      onChange={e=>{setForm(f=>({...f,budget:formatRupiah(e.target.value)})); setErrors(prev=>({...prev, budget:""}));}} 
                      style={{...inputStyle, borderColor: errors.budget ? "#FF4D6A" : "rgba(255,255,255,0.08)"}}/>
                    {errors.budget && <p style={{ color: "#FF4D6A", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>{errors.budget}</p>}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
                  <div>
                    <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Estimasi Durasi</label>
                    <input type="text" placeholder="cth. 1 Bulan, 2 Minggu" value={form.duration}
                      onChange={e=>setForm(f=>({...f,duration:e.target.value}))} style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Deadline Proyek</label>
                    <input type="date" value={form.deadline}
                      onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} style={inputStyle}/>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
                  <CustomDropdown
                    label="Level Freelancer *"
                    value={form.experienceLevel}
                    options={[
                      { id: "junior", label: "Pemula (Junior)" },
                      { id: "mid", label: "Menengah (Mid)" },
                      { id: "senior", label: "Ahli (Senior)" }
                    ]}
                    onChange={(val) => setForm(f => ({ ...f, experienceLevel: val }))}
                  />
                  <CustomDropdown
                    label="Tipe Kerjasama"
                    value={form.workType}
                    options={[
                      { id: "one-time", label: "Proyek Satu Kali" },
                      { id: "ongoing", label: "Berkelanjutan" }
                    ]}
                    onChange={(val) => setForm(f => ({ ...f, workType: val }))}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{opacity:0, x: 20}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -20}} style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Deskripsi Lengkap Proyek *</label>
                  <textarea placeholder="Jelaskan secara mendalam tentang lingkup proyek, tech stack, dan target utama..." value={form.description}
                    onChange={e=>{setForm(f=>({...f,description:e.target.value})); setErrors(prev=>({...prev, description:""}));}} rows={6}
                    style={{...inputStyle, resize:"vertical", lineHeight:"1.6", borderColor: errors.description ? "#FF4D6A" : "rgba(255,255,255,0.08)"}}/>
                  {errors.description && <p style={{ color: "#FF4D6A", fontSize: "11px", marginTop: "4px", fontWeight: "600" }}>{errors.description}</p>}
                </div>

                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Tujuan Proyek (Sasaran Utama)</label>
                  <textarea placeholder="Apa yang ingin dicapai melalui proyek ini secara jangka panjang..." value={form.goals}
                    onChange={e=>setForm(f=>({...f,goals:e.target.value}))} rows={3}
                    style={{...inputStyle, resize:"vertical", lineHeight:"1.6"}}/>
                </div>
                
                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Deliverables / Hasil Akhir</label>
                  <textarea placeholder="Hasil konkret yang wajib diserahkan. Contoh: Figma file, repository github, dll..." value={form.deliverables}
                    onChange={e=>setForm(f=>({...f,deliverables:e.target.value}))} rows={3}
                    style={{...inputStyle, resize:"vertical", lineHeight:"1.6"}}/>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{opacity:0, x: 20}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -20}} style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Preferensi Komunikasi</label>
                  <input type="text" placeholder="cth. Chat FreeTrack, Google Meet, Slack" value={form.communication_preference}
                    onChange={e=>setForm(f=>({...f,communication_preference:e.target.value}))} style={inputStyle}/>
                </div>

                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Pertanyaan Screening untuk Pelamar (Opsional)</label>
                  <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
                    <input type="text" placeholder="Tambah pertanyaan screening pelamar..." value={newQuestion}
                      onChange={e=>setNewQuestion(e.target.value)} style={inputStyle}/>
                    <button type="button" onClick={addQuestion} className="btn-secondary" style={{padding:"0 16px",borderRadius:"12px",cursor:"pointer",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center"}}><Plus size={16}/></button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                    {form.screening_questions.map((q, idx) => (
                      <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.02)",padding:"8px 12px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.05)"}}>
                        <span style={{fontSize:"13px",color:"rgba(255,255,255,0.8)"}}>{q}</span>
                        <button type="button" onClick={() => removeQuestion(idx)} style={{background:"transparent",border:"none",color:"#FF4D6A",cursor:"pointer"}}><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Lampiran / Referensi Proyek (Opsional)</label>
                  <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
                    <input type="text" placeholder="Tambah link referensi/lampiran..." value={newAttachment}
                      onChange={e=>setNewAttachment(e.target.value)} style={inputStyle}/>
                    <button type="button" onClick={addAttachment} className="btn-secondary" style={{padding:"0 16px",borderRadius:"12px",cursor:"pointer",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center"}}><Plus size={16}/></button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                    {form.attachments.map((a, idx) => (
                      <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.02)",padding:"8px 12px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.05)"}}>
                        <span style={{fontSize:"13px",color:"#00FFA3",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%"}}>{a}</span>
                        <button type="button" onClick={() => removeAttachment(idx)} style={{background:"transparent",border:"none",color:"#FF4D6A",cursor:"pointer"}}><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                {isNego && (
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
                    <label style={{display:"block",fontSize:"12px",fontWeight:"700",color:"#FFBF00",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Alasan Negosiasi / Catatan Perubahan *</label>
                    <textarea placeholder="Jelaskan mengapa Anda mengubah budget/deadline..." 
                      value={form.negotiation_reason}
                      onChange={e=>setForm(f=>({...f,negotiation_reason:e.target.value}))} rows={2}
                      style={{...inputStyle,borderColor:"rgba(255,191,0,0.3)",background:"rgba(255,191,0,0.02)",resize:"vertical" as any,lineHeight:"1.6"}}/>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{opacity:0, x: 20}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -20}} style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Pratinjau Kartu Marketplace (Live Card Preview)</label>
                  
                  {/* Live Marketplace Card Preview */}
                  <div style={{
                    marginTop: "8px",
                    padding: "20px",
                    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)",
                    border: "1px solid rgba(0, 255, 163, 0.15)",
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      position: "absolute", top: "-50px", right: "-50px",
                      width: "150px", height: "150px",
                      background: "#00FFA3",
                      filter: "blur(70px)",
                      opacity: 0.05,
                      pointerEvents: "none",
                    }} />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <span style={{
                        padding: "4px 8px",
                        background: "rgba(0, 255, 163, 0.08)",
                        border: "1px solid rgba(0, 255, 163, 0.2)",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: "800",
                        color: "#00FFA3",
                        textTransform: "uppercase"
                      }}>
                        {availableCategories.find(c => c.id === form.categoryId)?.label || "Kategori Proyek"}
                      </span>
                      <span style={{ fontSize: "16px", fontWeight: "900", color: "#00FFA3" }}>
                        {form.budget || "Rp 0"}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "6px" }}>
                      {form.name || "Judul Proyek Baru"}
                    </h4>
                    
                    <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.55)", lineHeight: "1.6", marginBottom: "14px", height: "40px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {form.summary || "Deskripsi ringkas proyek Anda akan muncul di bagian ini pada halaman marketplace utama FreeTrack..."}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                      {form.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} style={{ padding: "3px 8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", fontSize: "10px", color: "rgba(226,232,240,0.6)" }}>
                          {s}
                        </span>
                      ))}
                      {form.skills.length > 3 && (
                        <span style={{ padding: "3px 8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", fontSize: "10px", color: "rgba(226,232,240,0.6)" }}>
                          +{form.skills.length - 3} lagi
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "rgba(226, 232, 240, 0.35)", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <span>⏱️ {form.duration || "Durasi tidak diatur"}</span>
                      <span>⚡ Level: {form.experienceLevel === "junior" ? "Pemula" : form.experienceLevel === "senior" ? "Senior" : "Menengah"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Ringkasan Detail Proyek</label>
                  <div style={{
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "12px", 
                    padding: "16px 20px", 
                    background: "rgba(255,255,255,0.02)", 
                    border: "1px solid rgba(255,255,255,0.05)", 
                    borderRadius: "16px",
                    fontSize: "13px"
                  }}>
                    <div>
                      <span style={{color: "rgba(226,232,240,0.4)"}}>Klien Ditargetkan:</span>
                      <p style={{color: "#fff", fontWeight: "700", margin: "4px 0 0 0"}}>{form.clientName || "Proyek Publik (Semua Klien)"}</p>
                    </div>
                    <div>
                      <span style={{color: "rgba(226,232,240,0.4)"}}>Tipe Kerjasama:</span>
                      <p style={{color: "#fff", fontWeight: "700", margin: "4px 0 0 0"}}>{form.workType === "one-time" ? "Proyek Satu Kali" : "Berkelanjutan"}</p>
                    </div>
                    <div>
                      <span style={{color: "rgba(226,232,240,0.4)"}}>Deadline Proyek:</span>
                      <p style={{color: "#fff", fontWeight: "700", margin: "4px 0 0 0"}}>{form.deadline || "Tidak ditentukan"}</p>
                    </div>
                    <div>
                      <span style={{color: "rgba(226,232,240,0.4)"}}>Tipe Budget:</span>
                      <p style={{color: "#fff", fontWeight: "700", margin: "4px 0 0 0"}}>{form.budget_type === "fixed" ? "Fixed Price" : "Hourly Rate"}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky Footer Navigation (Sticky) */}
        <div style={{
          padding:"20px 32px 28px", 
          borderTop:"1px solid rgba(255,255,255,0.04)", 
          display:"flex",
          gap:"12px", 
          alignItems: "center",
          flexShrink: 0,
          background: "rgba(10, 20, 40, 0.4)"
        }}>
          {step > 1 ? (
            <motion.button 
              type="button"
              whileHover={{scale:1.02}} 
              whileTap={{scale:0.98}}
              onClick={handlePrevStep}
              style={{
                padding:"10px 18px",
                borderRadius:"12px",
                fontSize:"13px",
                fontWeight:"700",
                cursor:"pointer",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(226, 232, 240, 0.6)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <ArrowLeft size={14} /> Kembali
            </motion.button>
          ) : (
            <button onClick={onClose} className="btn-secondary"
              style={{padding:"10px 18px",borderRadius:"12px",fontSize:"13px",fontWeight:"700",cursor:"pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)"}}>Batal</button>
          )}

          <div style={{flex: 1}} />

          {/* Explicit Save Draft Button (Visible on all steps except negotiation) */}
          {(!initialData || initialData.status === "draft" || initialData.status === "published" || isNego) && (
            <motion.button 
              whileHover={{scale:1.02}} 
              whileTap={{scale:0.98}} 
              onClick={isNego ? handleSend : handleDraft} 
              disabled={loading}
              style={{
                padding:"10px 18px",
                borderRadius:"12px",
                fontSize:"13px",
                fontWeight:"700",
                cursor:"pointer",
                background: isNego ? "rgba(255, 191, 0, 0.1)" : "rgba(124,58,237,0.08)",
                border: isNego ? "1px solid rgba(255, 191, 0, 0.25)" : "1px solid rgba(124,58,237,0.2)",
                color: isNego ? "#FFBF00" : "#A78BFA",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                gap:"6px",
                transition: "all 0.2s"
              }}
            >
              <FileEdit size={14}/> {isNego ? "Nego" : "Draf"}
            </motion.button>
          )}

          {step < 5 ? (
            <motion.button 
              type="button"
              whileHover={{scale:1.02, y: -1}} 
              whileTap={{scale:0.98}} 
              onClick={handleNextStep}
              className="btn-primary"
              style={{
                padding:"10px 24px",
                borderRadius:"12px",
                fontSize:"13px",
                fontWeight:"800",
                cursor:"pointer",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                gap:"6px", 
                boxShadow: "0 8px 16px rgba(77, 99, 255, 0.15)"
              }}
            >
              Lanjut <ArrowRight size={14} />
            </motion.button>
          ) : (
            (!initialData || initialData.status === "draft") && (
              <motion.button 
                whileHover={{scale:1.02, y: -2}} 
                whileTap={{scale:0.98}} 
                onClick={handleSend} 
                disabled={loading}
                className="btn-primary"
                style={{
                  padding:"10px 28px",
                  borderRadius:"12px",
                  fontSize:"13px",
                  fontWeight:"800",
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:"8px", 
                  boxShadow: "0 10px 20px rgba(77, 99, 255, 0.2)"
                }}
              >
                <Plus size={15}/> {role === "client" 
                  ? (form.clientId ? "Kirim ke Freelancer" : "Publikasikan Proyek") 
                  : "Kirim ke Klien"}
              </motion.button>
            )
          )}
        </div>
      </motion.div>
      <style jsx>{`
        @media (max-width: 600px) {
          .step-label {
            display: none !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
