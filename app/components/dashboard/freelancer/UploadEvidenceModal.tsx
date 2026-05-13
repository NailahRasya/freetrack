"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, Link as LinkIcon, FileText, CheckCircle, Trash2, ExternalLink } from "lucide-react";
import Swal from "sweetalert2";

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string | null;
  milestoneTitle: string;
  onSuccess?: () => void;
}

interface LinkItem {
  url: string;
  title: string;
}

export default function UploadEvidenceModal({ isOpen, onClose, milestoneId, milestoneTitle, onSuccess }: UploadEvidenceModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "link">("file");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Link state
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [currentLink, setCurrentLink] = useState("");
  const [currentLinkTitle, setCurrentLinkTitle] = useState("");
  
  // Description
  const [description, setDescription] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file count
    if (selectedFiles.length + files.length > 5) {
      Swal.fire({
        icon: "error",
        title: "Terlalu Banyak File",
        text: "Maksimal 5 file per submission",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
      return;
    }
    
    // Validate file size and type
    const validFiles: File[] = [];
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf", "application/zip"];
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Terlalu Besar",
          text: `File "${file.name}" melebihi batas 10MB`,
          background: "rgba(13, 27, 62, 0.95)",
          color: "#fff",
        });
        continue;
      }
      
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Tipe File Tidak Valid",
          text: `File "${file.name}" bukan PNG, JPG, PDF, atau ZIP`,
          background: "rgba(13, 27, 62, 0.95)",
          color: "#fff",
        });
        continue;
      }
      
      validFiles.push(file);
    }
    
    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (!currentLink.trim()) return;
    
    // Validate URL
    try {
      new URL(currentLink);
    } catch {
      Swal.fire({
        icon: "error",
        title: "URL Tidak Valid",
        text: "Pastikan URL dimulai dengan http:// atau https://",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
      return;
    }
    
    setLinks([...links, { url: currentLink, title: currentLinkTitle || currentLink }]);
    setCurrentLink("");
    setCurrentLinkTitle("");
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneId) return;
    
    // Validate: at least one evidence
    if (selectedFiles.length === 0 && links.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Bukti Diperlukan",
        text: "Silakan upload file atau tambahkan link sebagai bukti",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(10);
    
    try {
      // Prepare form data
      const formData = new FormData();
      
      // Add files
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });
      
      // Add links
      if (links.length > 0) {
        formData.append("links", JSON.stringify(links.map(l => l.url)));
        formData.append("linkTitles", JSON.stringify(links.map(l => l.title)));
      }
      
      // Add description
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      
      setUploadProgress(30);
      
      // Upload evidence
      const res = await fetch(`/api/milestones/${milestoneId}/evidence`, {
        method: "POST",
        body: formData,
      });
      
      setUploadProgress(80);
      
      const data = await res.json();
      
      if (!res.ok) {
        // Log details if available
        if (data.details) {
          console.error("Upload failure details:", data.details);
        }
        throw new Error(data.error || "Failed to upload evidence");
      }
      
      setUploadProgress(100);
      setIsSuccess(true);
      onSuccess?.();
      
      setTimeout(() => {
        setIsSuccess(false);
        setUploadProgress(0);
        setSelectedFiles([]);
        setLinks([]);
        setDescription("");
        onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error("Failed to upload evidence:", err);
      Swal.fire({
        icon: "error",
        title: "Upload Gagal",
        text: err.message || "Terjadi kesalahan saat mengupload bukti",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          {/* Latar Belakang Gelap (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(6, 13, 32, 0.8)",
              backdropFilter: "blur(8px)"
            }}
          />

          {/* Kotak Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "500px",
              background: "rgba(13, 27, 62, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
              zIndex: 1
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "rgba(255,255,255,0.05)",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
                Kirim Kemajuan
              </h2>
              <p style={{ color: "rgba(226, 232, 240, 0.6)", fontSize: "14px" }}>
                Unggah bukti atau berikan tautan untuk <strong style={{ color: "#fff" }}>{milestoneTitle}</strong>.
              </p>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "16px",
                  padding: "40px 0"
                }}
              >
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ fontSize: "18px", color: "#fff", fontWeight: "700" }}>Berhasil Dikirim!</h3>
                <p style={{ color: "rgba(226, 232, 240, 0.6)", fontSize: "14px", textAlign: "center" }}>
                  Bukti telah dikirim ke klien untuk direview
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Tab Pilihan (File/Link) */}
                <div style={{ 
                  display: "flex", 
                  background: "rgba(0,0,0,0.2)", 
                  padding: "4px", 
                  borderRadius: "12px", 
                  marginBottom: "24px" 
                }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("file")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: activeTab === "file" ? "rgba(255,255,255,0.1)" : "transparent",
                      border: "none",
                      borderRadius: "8px",
                      color: activeTab === "file" ? "#fff" : "rgba(255,255,255,0.5)",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    <FileText size={16} /> Unggah Berkas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("link")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: activeTab === "link" ? "rgba(255,255,255,0.1)" : "transparent",
                      border: "none",
                      borderRadius: "8px",
                      color: activeTab === "link" ? "#fff" : "rgba(255,255,255,0.5)",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    <LinkIcon size={16} /> URL / Tautan
                  </button>
                </div>

                {activeTab === "file" ? (
                  <div style={{ marginBottom: "24px" }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.pdf,.zip"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: "2px dashed rgba(255,255,255,0.1)",
                        borderRadius: "16px",
                        padding: "40px 20px",
                        textAlign: "center",
                        marginBottom: "16px",
                        background: "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary-light)"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                    >
                      <UploadCloud size={40} style={{ color: "var(--primary-light)", margin: "0 auto 16px" }} />
                      <p style={{ color: "#fff", fontWeight: "600", marginBottom: "8px" }}>Klik untuk mengunggah atau seret dan lepas</p>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>PNG, JPG, PDF atau ZIP (maks. 10MB per file, maks 5 file)</p>
                    </div>
                    
                    {/* Selected Files List */}
                    {selectedFiles.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {selectedFiles.map((file, index) => (
                          <div 
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px",
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: "8px",
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                              <FileText size={20} style={{ color: "var(--primary-light)" }} />
                              <div style={{ flex: 1 }}>
                                <p style={{ color: "#fff", fontSize: "14px", fontWeight: "500", marginBottom: "2px" }}>
                                  {file.name}
                                </p>
                                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "none",
                                color: "#ef4444",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                              onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                          URL
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://figma.com/..."
                          value={currentLink}
                          onChange={(e) => setCurrentLink(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "rgba(0,0,0,0.2)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "10px",
                            color: "#fff",
                            outline: "none",
                            fontSize: "14px"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "var(--primary-light)"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                        Judul Link (Opsional)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Desain Figma, Demo Live, Repository GitHub"
                        value={currentLinkTitle}
                        onChange={(e) => setCurrentLinkTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "rgba(0,0,0,0.2)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "10px",
                          color: "#fff",
                          outline: "none",
                          fontSize: "14px"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--primary-light)"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAddLink}
                      disabled={!currentLink.trim()}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: currentLink.trim() ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: currentLink.trim() ? "#fff" : "rgba(255,255,255,0.3)",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: currentLink.trim() ? "pointer" : "not-allowed",
                        marginBottom: "16px",
                        transition: "all 0.2s"
                      }}
                    >
                      + Tambah Link
                    </button>
                    
                    {/* Links List */}
                    {links.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {links.map((link, index) => (
                          <div 
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px",
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: "8px",
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                              <ExternalLink size={20} style={{ color: "var(--primary-light)" }} />
                              <div style={{ flex: 1 }}>
                                <p style={{ color: "#fff", fontSize: "14px", fontWeight: "500", marginBottom: "2px" }}>
                                  {link.title}
                                </p>
                                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", wordBreak: "break-all" }}>
                                  {link.url}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(index)}
                              style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "none",
                                color: "#ef4444",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                              onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                    Catatan untuk Klien (Opsional)
                  </label>
                  <textarea 
                    placeholder="Jelaskan apa yang telah diselesaikan..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      outline: "none",
                      fontSize: "14px",
                      resize: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary-light)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "4px", textAlign: "right" }}>
                    {description.length}/1000
                  </p>
                </div>

                {/* Upload Progress */}
                {isSubmitting && uploadProgress > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>Mengupload...</span>
                      <span style={{ color: "var(--primary-light)", fontSize: "13px", fontWeight: "600" }}>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.2)", borderRadius: "3px", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        style={{ height: "100%", background: "linear-gradient(90deg, var(--primary), var(--primary-light))", borderRadius: "3px" }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff",
                      fontWeight: "600",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      opacity: isSubmitting ? 0.5 : 1
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (selectedFiles.length === 0 && links.length === 0)}
                    className="btn-primary"
                    style={{
                      flex: 2,
                      padding: "12px",
                      justifyContent: "center",
                      opacity: (isSubmitting || (selectedFiles.length === 0 && links.length === 0)) ? 0.5 : 1,
                      cursor: (isSubmitting || (selectedFiles.length === 0 && links.length === 0)) ? "not-allowed" : "pointer"
                    }}
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Kemajuan"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
