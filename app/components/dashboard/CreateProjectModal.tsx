"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ChevronDown, FileEdit } from "lucide-react";
import { useUser } from "../../dashboard/layout";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
  padding: "12px 16px", color: "#fff", fontSize: "14px",
  outline: "none", boxSizing: "border-box", colorScheme: "dark" as any,
};

interface Props {
  contacts: any[];
  onClose: () => void;
  onSaveDraft: (data: any) => Promise<void>;
  onSendToClient: (data: any) => Promise<void>;
  initialData?: any;
}

export default function CreateProjectModal({ contacts, onClose, onSaveDraft, onSendToClient, initialData }: Props) {
  const { role } = useUser();
  
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
    deadline: initialData?.deadline || "",
    description: initialData?.description || ""
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState((role === "client" ? initialData?.freelancer?.full_name : initialData?.client?.full_name) || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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
    deadline: form.deadline, 
    description: form.description,
  });

  const validate = () => {
    if (!form.name.trim()) { setErr("Nama proyek wajib diisi"); return false; }
    if (!form.clientId) { setErr(`Pilih ${role === "client" ? "freelancer" : "klien"} terlebih dahulu`); return false; }
    if (!form.budget.trim()) { setErr("Anggaran wajib diisi"); return false; }
    if (!form.deadline) { setErr("Batas waktu wajib diisi"); return false; }
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
    if (!validate()) return;
    setLoading(true);
    try { await onSendToClient(payload()); onClose(); }
    catch (e: any) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"}}>
      <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,y:20}}
        onClick={e=>e.stopPropagation()} className="glass-card"
        style={{width:"100%",maxWidth:"520px",padding:"32px",borderRadius:"24px",background:"rgba(15,27,46,0.97)",border:"1px solid rgba(255,255,255,0.08)",maxHeight:"90vh",overflowY:"auto"}}>
        
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

        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <div>
            <label style={{display:"block",fontSize:"12px",fontWeight:"700",color:"rgba(226,232,240,0.5)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Nama Proyek *</label>
            <input type="text" placeholder="cth. E-Commerce Mobile App" value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inputStyle}/>
          </div>

          <div style={{position:"relative"}}>
            <label style={{display:"block",fontSize:"12px",fontWeight:"700",color:"rgba(226,232,240,0.5)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>
              Pilih {role === "client" ? "Freelancer" : "Klien"} * <span style={{color:"#4D63FF",textTransform:"none",letterSpacing:0}}>(dari kontak)</span>
            </label>
            <div style={{position:"relative"}}>
              <input type="text" placeholder={`Cari nama atau email ${role === "client" ? "freelancer" : "klien"}...`} value={clientSearch}
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
                      <p style={{color:"rgba(226,232,240,0.3)",fontSize:"13px",marginBottom:"8px"}}>Belum ada kontak {role === "client" ? "freelancer" : "klien"}</p>
                      <a href="/dashboard/contacts" style={{color:"#4D63FF",fontSize:"13px",fontWeight:"600"}}>Undang {role === "client" ? "freelancer" : "klien"} →</a>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div style={{padding:"16px",textAlign:"center",color:"rgba(226,232,240,0.3)",fontSize:"13px"}}>Tidak ada kontak ditemukan</div>
                  ) : filtered.map((c:any) => {
                    const target = role === "client" ? c.freelancer : c.client;
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

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
            <div>
              <label style={{display:"block",fontSize:"12px",fontWeight:"700",color:"rgba(226,232,240,0.5)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Anggaran *</label>
              <input type="text" placeholder="cth. Rp 12.500.000" value={form.budget}
                onChange={e=>setForm(f=>({...f,budget:formatRupiah(e.target.value)}))} style={inputStyle}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:"12px",fontWeight:"700",color:"rgba(226,232,240,0.5)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Batas Waktu *</label>
              <input type="date" value={form.deadline}
                onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} style={inputStyle}/>
            </div>
          </div>

          <div>
            <label style={{display:"block",fontSize:"12px",fontWeight:"700",color:"rgba(226,232,240,0.5)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Deskripsi *</label>
            <textarea placeholder="Jelaskan ruang lingkup proyek..." value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3}
              style={{...inputStyle,resize:"vertical" as any,lineHeight:"1.6"}}/>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 16px",background:"rgba(77,99,255,0.06)",border:"1px solid rgba(77,99,255,0.15)",borderRadius:"10px"}}>
            <span style={{fontSize:"11px",color:"#4D63FF",fontFamily:"monospace",fontWeight:"700"}}>PRJ-XXXXXX</span>
            <p style={{fontSize:"12px",color:"rgba(226,232,240,0.4)",margin:0}}>ID unik dibuat otomatis saat proyek disimpan</p>
          </div>

          {err && <p style={{color:"#FF4D6A",fontSize:"13px",margin:0}}>{err}</p>}
        </div>

        <div style={{display:"flex",gap:"10px",marginTop:"28px"}}>
          <button onClick={onClose} className="btn-secondary"
            style={{padding:"12px 16px",borderRadius:"12px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}>Batal</button>
          
          {/* Tampilkan tombol Simpan/Nego hanya jika masih draf atau dalam fase nego */}
          {(!initialData || initialData.status === "draft" || isNego) && (
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} 
              onClick={isNego ? handleSend : handleDraft} disabled={loading}
              style={{
                flex:1,padding:"12px",borderRadius:"12px",fontSize:"14px",fontWeight:"700",cursor:"pointer",
                background: isNego ? "rgba(255, 191, 0, 0.15)" : "rgba(124,58,237,0.15)",
                border: isNego ? "1px solid rgba(255, 191, 0, 0.3)" : "1px solid rgba(124,58,237,0.3)",
                color: isNego ? "#FFBF00" : "#7C3AED",
                display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"
              }}>
              <FileEdit size={15}/> {isNego ? "Ajukan Nego" : initialData ? "Simpan Perubahan" : "Simpan Draf"}
            </motion.button>
          )}

          {/* Tombol Kirim: Muncul untuk proyek baru ATAU draf lama */}
          {(!initialData || initialData.status === "draft") && (
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleSend} disabled={loading}
              className="btn-primary"
              style={{flex:1,padding:"12px",borderRadius:"12px",fontSize:"14px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
              <Plus size={15}/> {role === "client" ? "Kirim ke Freelancer" : "Kirim ke Klien"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
