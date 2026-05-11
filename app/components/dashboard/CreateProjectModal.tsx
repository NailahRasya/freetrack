"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ChevronDown, FileEdit, Check, Search, ShieldCheck, Target, Clock, Briefcase } from "lucide-react";
import { useUser } from "../../dashboard/layout";
import { createClient } from "@/utils/supabase/client";
import { ONBOARDING_CATEGORIES, getLabelById } from "../../constants/onboarding-categories";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
  padding: "12px 16px", color: "#fff", fontSize: "14px",
  outline: "none", boxSizing: "border-box", colorScheme: "dark" as any,
};

const prefBadgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "rgba(255, 255, 255, 0.02)",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  fontSize: "13px",
  color: "rgba(226, 232, 240, 0.7)",
  fontWeight: "600"
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
}

function CustomDropdown({ label, value, options, onChange, placeholder = "Pilih..." }: DropdownProps) {
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
          borderColor: isOpen ? "rgba(77,99,255,0.4)" : "rgba(255,255,255,0.08)",
        }}
      >
        <span style={{ color: value ? "#fff" : "rgba(226,232,240,0.4)" }}>{selectedLabel}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "rgba(226,232,240,0.4)" }} />
      </button>

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
            <div style={{ maxHeight: "240px", overflowY: "auto", padding: "6px" }}>
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
  const { user, role } = useUser();
  // ... rest of the component
  
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

  const [form, setForm] = useState({
    name: initialData?.title || "",
    clientId: initialData?.client_id || initialData?.freelancer_id || "",
    clientName: (role === "client" ? initialData?.freelancer?.full_name : initialData?.client?.full_name) || "",
    budget: initialData?.budget ? formatRupiah(initialData.budget) : "",
    description: initialData?.description || "",
    negotiation_reason: initialData?.rejection_reason || "",
    categoryId: initialData?.category_id || "",
    skills: (initialData?.required_skills || []) as string[],
    experienceLevel: initialData?.experience_level || "mid",
    workType: initialData?.work_type || "one-time"
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [openExp, setOpenExp] = useState(false);
  const [openWork, setOpenWork] = useState(false);
  const [clientSearch, setClientSearch] = useState((role === "client" ? initialData?.freelancer?.full_name : initialData?.client?.full_name) || "");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientPref, setClientPref] = useState<any>(null);
  const [showOverrides, setShowOverrides] = useState(false);

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
          // Set default values from profile if project is new
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

  const payload = () => ({
    title: form.name, 
    client_id: role === "client" ? null : (form.clientId || null),
    freelancer_id: role === "client" ? (form.clientId || null) : null,
    budget: form.budget, 
    description: form.description,
    rejection_reason: form.negotiation_reason,
    category_id: form.categoryId,
    required_skills: [
      ...form.skills,
      `EXP:${form.experienceLevel}`,
      `WORK:${form.workType}`
    ],
  });

  const validate = (isPublishMarket = false) => {
    if (!form.name.trim()) { setErr("Nama proyek wajib diisi"); return false; }
    
    // Kategori wajib untuk semua proyek agar terorganisir
    if (!form.categoryId) { setErr("Pilih kategori proyek agar mudah ditemukan"); return false; }

    if (role === "client") {
      // Client tidak wajib pilih freelancer jika post ke Market
    } else {
      if (!form.clientId) { setErr("Pilih klien terlebih dahulu"); return false; }
    }
    
    if (!form.description.trim()) { setErr("Deskripsi proyek wajib diisi"); return false; }
    setErr("");
    return true;
  };

  const handleDraft = async () => {
    if (!validate()) return;
    setLoading(true);
    try { await onSaveDraft(payload()); onClose(); }
    catch (e: any) { setErr(e.message); }
    setLoading(false);
  };

  const handleSend = async () => {
    const isPublishMarket = role === "client" && !form.clientId;
    if (!validate(isPublishMarket)) return;
    setLoading(true);
    try { 
      const finalPayload = payload();
      if (isPublishMarket) {
        await onSaveDraft({ ...finalPayload, status: "published" }); 
      } else {
        await onSendToClient(finalPayload); 
      }
      onClose(); 
    }
    catch (e: any) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"}}>
      <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,y:20}}
        onClick={e=>e.stopPropagation()} className="glass-card"
        style={{width:"100%",maxWidth:"560px",padding:"32px",borderRadius:"24px",background:"rgba(15,27,46,0.97)",border:"1px solid rgba(255,255,255,0.08)",maxHeight:"92vh",overflowY:"auto"}}>
        
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px"}}>
          <div>
            <h2 style={{fontSize:"20px",fontWeight:"800",color:"#fff",marginBottom:"4px"}}>
              {initialData ? "Edit" : "Buat"} <span className="gradient-text">{initialData ? "Detail Proyek" : "Proyek Baru"}</span>
            </h2>
            <p style={{fontSize:"13px",color:"rgba(226,232,240,0.4)"}}>
              {initialData ? "Perbarui informasi proyek Anda" : "Isi detail proyek di bawah ini"}
            </p>
          </div>
          <button onClick={onClose} style={{width:"36px",height:"36px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(226,232,240,0.6)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <X size={16}/>
          </button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
          {/* Section: Basic Info */}
          <div>
            <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Informasi Dasar</label>
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              <input type="text" placeholder="Nama Proyek (cth. E-Commerce Mobile App)" value={form.name}
                onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inputStyle}/>
              
              {role === "freelancer" && (
                <div style={{position:"relative"}}>
                  <div style={{position:"relative"}}>
                    <input type="text" placeholder="Cari nama atau email klien..." value={clientSearch}
                      onFocus={()=>setShowDropdown(true)}
                      onChange={e=>{setClientSearch(e.target.value);setForm(f=>({...f,clientId:"",clientName:e.target.value}));setShowDropdown(true);}}
                      style={{...inputStyle,paddingRight:"44px"}}/>
                    <button type="button" onClick={()=>setShowDropdown(p=>!p)}
                      style={{position:"absolute",right:"10px",top:"50%",transform:showDropdown?"translateY(-50%) rotate(180deg)":"translateY(-50%)",transition:"transform 0.2s",background:"transparent",border:"none",cursor:"pointer",color:"rgba(226,232,240,0.4)",display:"flex",alignItems:"center",justifyContent:"center",padding:"4px"}}>
                      <ChevronDown size={16}/>
                    </button>
                  </div>
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
              )}
            </div>
          </div>          {/* Section: Budget & Category */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:"14px"}}>
            <div>
              <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Anggaran *</label>
              <input type="text" placeholder="cth. Rp 12.500.000" value={form.budget}
                onChange={e=>setForm(f=>({...f,budget:formatRupiah(e.target.value)}))} style={inputStyle}/>
            </div>
            <CustomDropdown 
              label="Kategori Proyek *"
              value={form.categoryId}
              options={availableCategories}
              onChange={(val) => setForm(f => ({ ...f, categoryId: val, skills: [] }))}
              placeholder="Pilih Kategori..."
            />
          </div>

          {/* Section: Skills (Chips) */}
          {form.categoryId && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
              <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"12px"}}>Pilih Keahlian Spesifik</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {availableCategories.find(c => c.id === form.categoryId)?.skills.map(s => {
                  const isSelected = form.skills.includes(s.label);
                  return (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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

          {/* Section: Experience & Type */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
            <CustomDropdown
              label="Level Pengalaman"
              value={form.experienceLevel}
              options={[
                { id: "junior", label: "Junior" },
                { id: "mid", label: "Intermediate" },
                { id: "senior", label: "Senior" }
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

          <div>
            <label style={{display:"block",fontSize:"11px",fontWeight:"900",color:"rgba(226,232,240,0.3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Deskripsi Proyek *</label>
            <textarea placeholder="Jelaskan ruang lingkup, tujuan, dan hasil yang diharapkan..." value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4}
              style={{...inputStyle,resize:"vertical" as any,lineHeight:"1.6"}}/>
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


          {err && <p style={{color:"#FF4D6A",fontSize:"13px",margin:0,fontWeight:"600"}}>⚠️ {err}</p>}
        </div>

        <div style={{display:"flex",gap:"10px",marginTop:"32px"}}>
          <button onClick={onClose} className="btn-secondary"
            style={{padding:"10px 20px",borderRadius:"12px",fontSize:"13px",fontWeight:"700",cursor:"pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)"}}>Batal</button>
          <div style={{flex: 1}} />
          
          {(!initialData || initialData.status === "draft" || initialData.status === "published" || isNego) && (
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} 
              onClick={isNego ? handleSend : handleDraft} disabled={loading}
              style={{
                padding:"10px 24px",borderRadius:"12px",fontSize:"13px",fontWeight:"700",cursor:"pointer",
                background: isNego ? "rgba(255, 191, 0, 0.1)" : "rgba(124,58,237,0.1)",
                border: isNego ? "1px solid rgba(255, 191, 0, 0.25)" : "1px solid rgba(124,58,237,0.25)",
                color: isNego ? "#FFBF00" : "#A78BFA",
                display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                transition: "all 0.2s"
              }}>
              <FileEdit size={14}/> {isNego ? "Ajukan Nego" : initialData ? "Simpan Perubahan" : "Simpan Draf"}
            </motion.button>
          )}

          {(!initialData || initialData.status === "draft") && (
            <motion.button whileHover={{scale:1.02, y: -2}} whileTap={{scale:0.98}} onClick={handleSend} disabled={loading}
              className="btn-primary"
              style={{padding:"10px 28px",borderRadius:"12px",fontSize:"13px",fontWeight:"800",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px", boxShadow: "0 10px 20px rgba(77, 99, 255, 0.2)"}}>
              <Plus size={15}/> {role === "client" 
                ? (form.clientId ? "Kirim ke Freelancer" : "Publikasikan Proyek") 
                : "Kirim ke Klien"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
