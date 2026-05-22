"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, ExternalLink, Download, Image as ImageIcon, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

interface Evidence {
  id: string;
  evidence_type: "file" | "link";
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  external_link?: string;
  link_title?: string;
  description?: string;
  uploaded_at: string;
  uploader_name: string;
  signed_url?: string;
}

interface EvidenceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string | null;
  milestoneTitle: string;
  milestone?: any;
  projectName?: string;
  freelancerName?: string;
  userRole?: string;
  onApprove?: () => void;
  onRequestRevision?: () => void;
}

function parseMilestoneDescription(description: string | null) {
  if (!description) return { cleanDesc: "", notes: "", checklist: null };
  const parts = description.split("--- REVIEW FEEDBACK ---");
  const cleanDesc = parts[0].trim();
  let notes = "";
  let checklist: any = null;

  if (parts.length > 1) {
    const feedbackPart = parts[1];
    const notesMatch = feedbackPart.match(/Notes:\s*([\s\S]*?)(?=\nChecklist:|$)/);
    if (notesMatch) {
      notes = notesMatch[1].trim();
    }
    const checklistMatch = feedbackPart.match(/Checklist:\s*({.*})/);
    if (checklistMatch) {
      try {
        checklist = JSON.parse(checklistMatch[1]);
      } catch (e) {
        console.error("Failed to parse checklist JSON:", e);
      }
    }
  }

  return { cleanDesc, notes, checklist };
}

export default function EvidenceReviewModal({
  isOpen,
  onClose,
  milestoneId,
  milestoneTitle,
  milestone,
  projectName,
  freelancerName,
  userRole,
  onApprove,
  onRequestRevision,
}: EvidenceReviewModalProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checklist, setChecklist] = useState({
    uploaded: false,
    deliverable: false,
    quality: false,
    completeFiles: false,
    validProgress: false,
  });

  useEffect(() => {
    if (isOpen && milestoneId) {
      fetchEvidence();
      
      // Parse previous checklist if available in milestone description
      if (milestone?.description) {
        const parsed = parseMilestoneDescription(milestone.description);
        if (parsed.checklist) {
          setChecklist({
            uploaded: !!parsed.checklist.uploaded,
            deliverable: !!parsed.checklist.deliverable,
            quality: !!parsed.checklist.quality,
            completeFiles: !!parsed.checklist.completeFiles,
            validProgress: !!parsed.checklist.validProgress,
          });
          return;
        }
      }

      setChecklist({
        uploaded: false,
        deliverable: false,
        quality: false,
        completeFiles: false,
        validProgress: false,
      });
    }
  }, [isOpen, milestoneId, milestone]);

  const fetchEvidence = async () => {
    if (!milestoneId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/evidence`);
      const data = await res.json();

      if (res.ok && data.success) {
        setEvidence(data.data.evidence || []);
      } else {
        throw new Error(data.error || "Failed to fetch evidence");
      }
    } catch (err: any) {
      console.error("Error fetching evidence:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Bukti",
        text: err.message || "Terjadi kesalahan saat memuat bukti",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isImageFile = (fileType?: string): boolean => {
    return fileType?.startsWith("image/") || false;
  };

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: "Setujui Milestone?",
      text: "Anda akan menyetujui milestone ini dan pembayaran akan dilepas ke freelancer.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Setujui",
      cancelButtonText: "Batal",
      background: "rgba(13, 27, 62, 0.95)",
      color: "#fff",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: milestoneId,
          status: "Approved",
          payment_status: "Released",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to approve milestone");
      }

      // Auto-create invoice for this milestone
      try {
        await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ milestone_id: milestoneId }),
        });
      } catch (invoiceErr) {
        console.error("Failed to auto-create invoice:", invoiceErr);
      }

      await Swal.fire({
        icon: "success",
        title: "Milestone Disetujui!",
        text: "Pembayaran telah dilepas ke freelancer",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false,
      });

      onApprove?.();
      onClose();
    } catch (err: any) {
      console.error("Error approving milestone:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyetujui",
        text: err.message || "Terjadi kesalahan",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    const result = await Swal.fire({
      title: "Minta Revisi?",
      text: "Milestone akan dikembalikan ke status 'In Progress' dan freelancer akan diminta untuk melakukan perbaikan.",
      input: "textarea",
      inputLabel: "Catatan Revisi untuk Freelancer",
      inputPlaceholder: "Jelaskan secara detail apa yang perlu diperbaiki...",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Minta Revisi",
      cancelButtonText: "Batal",
      background: "rgba(13, 27, 62, 0.95)",
      color: "#fff",
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Silakan masukkan catatan revisi untuk freelancer!";
        }
      }
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: milestoneId,
          status: "In Progress",
          review_notes: result.value,
          checklist: checklist,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request revision");
      }

      await Swal.fire({
        icon: "success",
        title: "Revisi Diminta",
        text: "Freelancer akan menerima notifikasi untuk melakukan perbaikan",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false,
      });

      onRequestRevision?.();
      onClose();
    } catch (err: any) {
      console.error("Error requesting revision:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Meminta Revisi",
        text: err.message || "Terjadi kesalahan",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const result = await Swal.fire({
      title: "Tolak Submission?",
      text: "Milestone akan ditandai sebagai 'Rejected'.",
      input: "textarea",
      inputLabel: "Alasan Penolakan untuk Freelancer",
      inputPlaceholder: "Jelaskan secara detail mengapa ditolak...",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Batal",
      background: "rgba(13, 27, 62, 0.95)",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Silakan masukkan alasan penolakan untuk freelancer!";
        }
      }
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: milestoneId,
          status: "Rejected",
          review_notes: result.value,
          checklist: checklist,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reject milestone");
      }

      await Swal.fire({
        icon: "success",
        title: "Submission Ditolak",
        text: "Status milestone telah diubah",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false,
      });

      onRequestRevision?.();
      onClose();
    } catch (err: any) {
      console.error("Error rejecting milestone:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menolak",
        text: err.message || "Terjadi kesalahan",
        background: "rgba(13, 27, 62, 0.95)",
        color: "#fff",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (userRole && userRole !== "client") {
    return (
      <AnimatePresence>
        {isOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(6, 13, 32, 0.8)", backdropFilter: "blur(8px)" }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card" style={{ position: "relative", width: "100%", maxWidth: "400px", background: "rgba(13, 27, 62, 0.95)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "24px", padding: "32px", textAlign: "center", zIndex: 1 }}>
               <AlertCircle size={48} style={{ color: "#ef4444", margin: "0 auto 16px" }} />
               <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>Akses Tidak Diizinkan</h2>
               <p style={{ color: "rgba(226, 232, 240, 0.6)", fontSize: "14px", marginBottom: "24px" }}>Hanya Client yang dapat membuka fitur Review Submission.</p>
               <button onClick={onClose} className="btn-primary" style={{ padding: "10px 24px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer" }}>Tutup</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(6, 13, 32, 0.8)",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              background: "rgba(13, 27, 62, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
              zIndex: 1,
              overflow: "auto",
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
                transition: "all 0.2s",
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
                Review Bukti Kerja
              </h2>
              <p style={{ color: "rgba(226, 232, 240, 0.6)", fontSize: "14px" }}>
                Milestone: <strong style={{ color: "#fff" }}>{milestoneTitle}</strong>
              </p>
            </div>

            {/* Metadata Section */}
            <div style={{ marginBottom: "24px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.5px" }}>Nama Project</p>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{projectName || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.5px" }}>Nama Freelancer</p>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{freelancerName || "-"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.5px" }}>Tanggal Submission</p>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                    {evidence.length > 0 ? formatDate(evidence[0].uploaded_at) : "-"}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.5px" }}>Status Submission</p>
                  <div style={{ display: "inline-flex", padding: "4px 8px", background: "rgba(6, 182, 212, 0.1)", color: "var(--cyan)", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                    {milestone?.status || "Menunggu Persetujuan"}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.5px" }}>Deskripsi Pekerjaan</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {milestone?.description ? parseMilestoneDescription(milestone.description).cleanDesc : "-"}
                  </p>
              </div>
            </div>

            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  padding: "40px 0",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid rgba(255,255,255,0.1)",
                    borderTop: "4px solid var(--primary-light)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                  Memuat bukti...
                </p>
              </div>
            ) : evidence.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  padding: "40px 0",
                }}
              >
                <AlertCircle size={48} style={{ color: "rgba(255,255,255,0.3)" }} />
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                  Belum ada bukti yang diupload
                </p>
              </div>
            ) : (
              <>
                {/* Evidence List */}
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.8)",
                      marginBottom: "16px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Bukti yang Disubmit ({evidence.length})
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {evidence.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: "16px",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "12px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {item.evidence_type === "file" ? (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "8px",
                              }}
                            >
                              {isImageFile(item.file_type) ? (
                                <ImageIcon size={24} style={{ color: "var(--primary-light)" }} />
                              ) : (
                                <FileText size={24} style={{ color: "var(--primary-light)" }} />
                              )}
                              <div style={{ flex: 1 }}>
                                <p
                                  style={{
                                    color: "#fff",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    marginBottom: "2px",
                                  }}
                                >
                                  {item.file_name}
                                </p>
                                <p
                                  style={{
                                    color: "rgba(255,255,255,0.4)",
                                    fontSize: "12px",
                                  }}
                                >
                                  {item.file_size && formatFileSize(item.file_size)} •{" "}
                                  {formatDate(item.uploaded_at)}
                                </p>
                              </div>
                              {item.signed_url && (
                                <a
                                  href={item.signed_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={item.file_name}
                                  style={{
                                    padding: "8px 12px",
                                    background: "rgba(255,255,255,0.1)",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "var(--primary-light)",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    textDecoration: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseOver={(e) =>
                                    (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                                  }
                                  onMouseOut={(e) =>
                                    (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                                  }
                                >
                                  <Download size={14} /> Download
                                </a>
                              )}
                            </div>

                            {/* Image Preview */}
                            {isImageFile(item.file_type) && item.signed_url && (
                              <div
                                onClick={() => setSelectedImage(item.signed_url!)}
                                style={{
                                  marginTop: "12px",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  cursor: "pointer",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                <img
                                  src={item.signed_url}
                                  alt={item.file_name}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    maxHeight: "300px",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <ExternalLink size={24} style={{ color: "var(--primary-light)" }} />
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  color: "#fff",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  marginBottom: "2px",
                                }}
                              >
                                {item.link_title || "External Link"}
                              </p>
                              <a
                                href={item.external_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "var(--primary-light)",
                                  fontSize: "12px",
                                  textDecoration: "none",
                                  wordBreak: "break-all",
                                }}
                              >
                                {item.external_link}
                              </a>
                              <p
                                style={{
                                  color: "rgba(255,255,255,0.4)",
                                  fontSize: "12px",
                                  marginTop: "4px",
                                }}
                              >
                                {formatDate(item.uploaded_at)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {item.description && (
                          <div
                            style={{
                              marginTop: "12px",
                              padding: "12px",
                              background: "rgba(0,0,0,0.2)",
                              borderRadius: "8px",
                              borderLeft: "3px solid var(--primary-light)",
                            }}
                          >
                            <p
                              style={{
                                color: "rgba(255,255,255,0.5)",
                                fontSize: "11px",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                marginBottom: "6px",
                              }}
                            >
                              Catatan dari {item.uploader_name}
                            </p>
                            <p
                              style={{
                                color: "rgba(255,255,255,0.8)",
                                fontSize: "13px",
                                lineHeight: "1.6",
                              }}
                            >
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist Section */}
                <div style={{ marginBottom: "24px" }}>
                   <h3 style={{ fontSize: "14px", fontWeight: "700", color: "rgba(255,255,255,0.8)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                     Validation & Quality Review
                   </h3>
                   <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                     {[
                       { id: 'uploaded', label: 'Bukti berhasil diupload' },
                       { id: 'deliverable', label: 'Deliverable sesuai milestone' },
                       { id: 'quality', label: 'Kualitas pekerjaan sesuai' },
                       { id: 'completeFiles', label: 'Tidak ada file yang kurang' },
                       { id: 'validProgress', label: 'Progress valid' },
                     ].map(item => (
                       <label key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                         <input 
                           type="checkbox" 
                           checked={checklist[item.id as keyof typeof checklist]}
                           onChange={(e) => setChecklist(prev => ({ ...prev, [item.id]: e.target.checked }))}
                           style={{ width: "16px", height: "16px", accentColor: "var(--cyan)", cursor: "pointer" }}
                         />
                         <span style={{ fontSize: "14px", color: checklist[item.id as keyof typeof checklist] ? "#fff" : "rgba(255,255,255,0.6)", transition: "color 0.2s" }}>
                           {item.label}
                         </span>
                       </label>
                     ))}
                   </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleRequestRevision}
                    disabled={isProcessing}
                    style={{
                      flex: 1, minWidth: "140px", padding: "14px",
                      background: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: "10px", color: "#f59e0b",
                      fontSize: "13px", fontWeight: "700",
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      transition: "all 0.2s", opacity: isProcessing ? 0.5 : 1,
                    }}
                    onMouseOver={(e) => !isProcessing && (e.currentTarget.style.background = "rgba(245, 158, 11, 0.2)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "rgba(245, 158, 11, 0.1)")}
                  >
                    <AlertCircle size={16} /> Request Revision
                  </button>
                  
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    style={{
                      flex: 1, minWidth: "140px", padding: "14px",
                      background: "linear-gradient(135deg, var(--cyan), var(--blue))",
                      border: "none",
                      borderRadius: "10px", color: "#fff",
                      fontSize: "13px", fontWeight: "700",
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      transition: "all 0.2s", opacity: isProcessing ? 0.5 : 1,
                      boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)",
                    }}
                    onMouseOver={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(6, 182, 212, 0.5)";
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(6, 182, 212, 0.3)";
                    }}
                  >
                    <CheckCircle size={16} /> Approve Submission
                  </button>
                </div>
              </>
            )}
          </motion.div>

          {/* Image Lightbox */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 200,
                background: "rgba(0, 0, 0, 0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                cursor: "pointer",
              }}
            >
              <img
                src={selectedImage}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#fff",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              >
                <X size={24} />
              </button>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
