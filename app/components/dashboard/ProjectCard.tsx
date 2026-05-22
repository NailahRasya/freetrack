"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Users, Calendar, DollarSign, Pencil, Trash2, Send, CheckCircle2, X, MessageSquare, RefreshCw, Star, Archive } from "lucide-react";
import Swal from "sweetalert2";
import { useUser } from "../../dashboard/layout";
import { formatRupiah } from "@/utils/format";

interface ProjectCardProps {
  project: {
    id: number;
    projectId: string;
    name: string;
    client: string;
    freelancer: string;
    freelancerId?: string;
    progress: number;
    budget: string;
    deadline: string;
    status: string;
    statusColor: string;
    description?: string;
    rejection_reason?: string;
    negotiation_count?: number;
    rawStatus?: string;
    hasReview?: boolean;
  };
  onEdit?: (project: any) => void;
  onDelete?: (id: number) => void;
  onSendToClient?: (id: number, status?: string, reason?: string) => void;
  onReview?: (projectId: string, freelancerId: string, projectTitle: string, freelancerName: string) => void;
  onArchive?: (id: number) => void;
  isArchivedView?: boolean;
  onRestore?: (id: number) => void;
}

export default function ProjectCard({ project, onEdit, onDelete, onSendToClient, onReview, onArchive, isArchivedView, onRestore }: ProjectCardProps) {
  const { role } = useUser();
  const isClient = role === "client";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, borderColor: `${project.statusColor}40` }}
      className="glass-card"
      style={{
        padding: "24px",
        background: "rgba(15, 27, 46, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "20px",
        cursor: "pointer",
        position: "relative",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.3s ease"
      }}
    >
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-10%",
        width: "120px",
        height: "120px",
        background: project.statusColor,
        filter: "blur(60px)",
        opacity: 0.05,
        pointerEvents: "none",
        borderRadius: "50%",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(77, 99, 255, 0.1)",
            border: "1px solid rgba(77, 99, 255, 0.2)",
            borderRadius: "6px",
            padding: "2px 8px",
            fontSize: "10px",
            fontWeight: "700",
            color: "#4D63FF",
            letterSpacing: "0.5px",
            marginBottom: "8px",
            fontFamily: "monospace"
          }}>
            {project.projectId}
          </div>
          <h4 style={{
            fontSize: "17px",
            fontWeight: "800",
            color: "#fff",
            marginBottom: "6px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {project.name}
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(226, 232, 240, 0.4)", fontSize: "13px" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={12} />
            </div>
            <span>{isClient ? project.freelancer : project.client}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          {project.negotiation_count && project.negotiation_count > 0 ? (
            <div style={{
              padding: "5px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              background: "rgba(255, 191, 0, 0.15)",
              color: "#FFBF00",
              border: "1px solid rgba(255, 191, 0, 0.3)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <RefreshCw size={12} /> Nego {project.negotiation_count}x
            </div>
          ) : null}
          <div style={{
            padding: "5px 12px",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            background: `${project.statusColor}15`,
            color: project.statusColor,
            border: `1px solid ${project.statusColor}30`,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            {project.status}
          </div>
        </div>
      </div>

      {project.rejection_reason && (
        <div style={{ 
          marginBottom: "16px", 
          padding: "12px", 
          background: "rgba(255, 77, 106, 0.05)", 
          border: "1px solid rgba(255, 77, 106, 0.15)", 
          borderRadius: "12px",
          fontSize: "12px",
          color: "#FF4D6A"
        }}>
          <div style={{ fontWeight: "700", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <MessageSquare size={12} /> Catatan Negosiasi:
          </div>
          {project.rejection_reason}
        </div>
      )}

      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", fontWeight: "700" }}>
          <span style={{ color: "rgba(226, 232, 240, 0.4)" }}>Progres</span>
          <span style={{ color: project.statusColor }}>{project.progress}%</span>
        </div>
        <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "4px", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${project.statusColor}, #06B6D4)`,
              boxShadow: `0 0 10px ${project.statusColor}30`
            }}
          />
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        paddingTop: "20px",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        gap: "12px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Budget</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fff", fontWeight: "700", fontSize: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: "900", color: "var(--cyan)", opacity: 0.8 }}>Rp</span>
            {formatRupiah(project.budget).replace("Rp", "").trim()}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
          <span style={{ fontSize: "10px", color: "rgba(226, 232, 240, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Deadline</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(226, 232, 240, 0.7)", fontWeight: "600", fontSize: "14px" }}>
            <Calendar size={14} style={{ color: "rgba(226, 232, 240, 0.3)" }} />
            {project.deadline}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {isArchivedView ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                Swal.fire({
                  title: "Pulihkan Proyek?",
                  text: "Proyek ini akan dikembalikan ke daftar proyek aktif Anda.",
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonColor: "#00FFA3",
                  cancelButtonColor: "rgba(255,255,255,0.1)",
                  confirmButtonText: "Ya, Pulihkan!",
                  cancelButtonText: "Batal",
                  background: "#0F1B2E",
                  color: "#fff",
                  customClass: {
                    popup: "glass-card",
                  }
                }).then((result) => {
                  if (result.isConfirmed) {
                    onRestore?.(project.id);
                  }
                });
              }}
              style={{
                width: "100%",
                justifyContent: "center",
                background: "rgba(0, 255, 163, 0.1)",
                border: "1px solid rgba(0, 255, 163, 0.2)",
                color: "#00FFA3",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <RefreshCw size={15} /> Pulihkan Proyek
            </motion.button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", width: "100%" }}>
            {/* Tombol Diskusi via Chat - Muncul selama proyek belum selesai / bukan draf */}
            {project.rawStatus !== "draft" && project.rawStatus !== "completed" ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); window.location.href = "/dashboard/messages"; }}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "rgba(226, 232, 240, 0.8)",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <MessageSquare size={14} /> Diskusi
              </motion.button>
            ) : null}

            {/* Tombol Review - Khusus Client untuk proyek Selesai */}
            {isClient && project.rawStatus === "completed" && (
              project.hasReview ? (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: "rgba(0, 255, 163, 0.06)",
                  border: "1px solid rgba(0, 255, 163, 0.2)",
                  color: "#00FFA3",
                  fontSize: "13px",
                  fontWeight: "700",
                }}>
                  <CheckCircle2 size={14} /> Sudah Diulas
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(255, 215, 0, 0.2)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReview?.(
                      String(project.id),
                      project.freelancerId || "",
                      project.name,
                      project.freelancer
                    );
                  }}
                  style={{
                    background: "rgba(255, 215, 0, 0.08)",
                    border: "1px solid rgba(255, 215, 0, 0.25)",
                    color: "#FFD700",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                >
                  <Star size={14} fill="#FFD700" /> Beri Ulasan
                </motion.button>
              )
            )}

            {isClient ? (
              project.rawStatus === "draft" ? (
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); onEdit?.(project); }}
                    style={{
                      flex: 1,
                      background: "rgba(124, 58, 237, 0.1)",
                      border: "1px solid rgba(124, 58, 237, 0.2)",
                      color: "#7C3AED",
                      padding: "12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Pencil size={15} /> Edit Draf
                  </motion.button>
                  {project.freelancer !== "-" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        Swal.fire({
                          title: "Kirim Proyek?",
                          text: "Proyek ini akan dikirim ke freelancer untuk ditinjau.",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonColor: "#4D63FF",
                          cancelButtonColor: "rgba(255,255,255,0.1)",
                          confirmButtonText: "Ya, Kirim!",
                          cancelButtonText: "Batal",
                          background: "#0F1B2E",
                          color: "#fff",
                          customClass: {
                            popup: "glass-card",
                          }
                        }).then((result) => {
                          if (result.isConfirmed) {
                            onSendToClient?.(project.id, "pending_freelancer");
                          }
                        });
                      }}
                      style={{
                        flex: 1,
                        background: "rgba(77, 99, 255, 0.1)",
                        border: "1px solid rgba(77, 99, 255, 0.2)",
                        color: "#4D63FF",
                        padding: "12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <Send size={15} /> Kirim
                    </motion.button>
                  )}
                </div>
              ) : project.rawStatus === "pending_client" ? (
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); onSendToClient?.(project.id, "active"); }}
                    style={{
                      flex: 1,
                      background: "rgba(0, 255, 163, 0.1)",
                      border: "1px solid rgba(0, 255, 163, 0.2)",
                      color: "#00FFA3",
                      padding: "12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <CheckCircle2 size={15} /> Setujui
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); onEdit?.(project); }}
                    style={{
                      flex: 1,
                      background: "rgba(255, 191, 0, 0.1)",
                      border: "1px solid rgba(255, 191, 0, 0.2)",
                      color: "#FFBF00",
                      padding: "12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Pencil size={15} /> Ajukan Nego
                  </motion.button>
                </div>
              ) : project.rawStatus === "pending_freelancer" ? (
                <div style={{ display: "flex", width: "100%" }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      Swal.fire({
                        title: "Tarik ke Draf?",
                        text: "Proyek akan kembali menjadi draf dan tidak lagi terlihat oleh freelancer.",
                        icon: "info",
                        showCancelButton: true,
                        confirmButtonColor: "#7C3AED",
                        cancelButtonColor: "rgba(255,255,255,0.1)",
                        confirmButtonText: "Ya, Tarik!",
                        cancelButtonText: "Batal",
                        background: "#0F1B2E",
                        color: "#fff"
                      }).then((result) => {
                        if (result.isConfirmed) {
                          onSendToClient?.(project.id, "draft");
                        }
                      });
                    }}
                    style={{
                      width: "100%",
                      background: "rgba(124, 58, 237, 0.1)",
                      border: "1px solid rgba(124, 58, 237, 0.2)",
                      color: "#7C3AED",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <RefreshCw size={15} /> Tarik ke Draf
                  </motion.button>
                </div>
              ) : (
                <div />
              )
            ) : (
              <div style={{ width: "100%" }}>
                {project.rawStatus === "pending_freelancer" && (
                  <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { e.stopPropagation(); onSendToClient?.(project.id, "active"); }}
                      style={{
                        flex: 1,
                        background: "rgba(0, 255, 163, 0.1)",
                        border: "1px solid rgba(0, 255, 163, 0.2)",
                        color: "#00FFA3",
                        padding: "12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <CheckCircle2 size={15} /> Setujui
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { e.stopPropagation(); onEdit?.(project); }}
                      style={{
                        flex: 1,
                        background: "rgba(255, 191, 0, 0.1)",
                        border: "1px solid rgba(255, 191, 0, 0.2)",
                        color: "#FFBF00",
                        padding: "12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <Pencil size={15} /> Ajukan Nego
                    </motion.button>
                  </div>
                )}
              </div>
            )}
            </div>

            {project.rawStatus === "completed" ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  Swal.fire({
                    title: "Arsipkan Proyek?",
                    text: "Proyek ini akan disembunyikan dari dashboard Anda, tetapi riwayat transaksi tetap aman.",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#4D63FF",
                    cancelButtonColor: "rgba(255,255,255,0.1)",
                    confirmButtonText: "Ya, Arsipkan!",
                    cancelButtonText: "Batal",
                    background: "#0F1B2E",
                    color: "#fff",
                    customClass: {
                      popup: "glass-card",
                    }
                  }).then((result) => {
                    if (result.isConfirmed) {
                      onArchive?.(project.id);
                    }
                  });
                }}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  background: "rgba(77, 99, 255, 0.1)",
                  border: "1px solid rgba(77, 99, 255, 0.2)",
                  color: "#4D63FF",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Archive size={15} /> Arsipkan Proyek
              </motion.button>
            ) : (project.rawStatus === "draft" || (!isClient && project.rawStatus !== "completed")) && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  Swal.fire({
                    title: project.rawStatus === "draft" ? "Hapus Draf?" : "Nonaktifkan Proyek?",
                    text: "Tindakan ini tidak dapat dibatalkan.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#FF4D6A",
                    cancelButtonColor: "rgba(255,255,255,0.1)",
                    confirmButtonText: "Ya, Hapus!",
                    cancelButtonText: "Batal",
                    background: "#0F1B2E",
                    color: "#fff",
                    customClass: {
                      popup: "glass-card",
                    }
                  }).then((result) => {
                    if (result.isConfirmed) {
                      onDelete?.(project.id);
                    }
                  });
                }}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  background: "rgba(255, 77, 106, 0.1)",
                  border: "1px solid rgba(255, 77, 106, 0.2)",
                  color: "#FF4D6A",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Trash2 size={15} /> {project.rawStatus === "draft" ? "Hapus Draf" : "Nonaktifkan Proyek"}
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
