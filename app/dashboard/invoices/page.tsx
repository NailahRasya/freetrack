"use client";

import { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  Receipt,
  TrendingUp,
  CircleDollarSign,
  Loader2,
  Calendar,
  User,
  Briefcase,
  Flag,
  Activity,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useUser } from "../layout";
import { useInvoices, Invoice } from "@/lib/hooks/useInvoices";
import { formatRupiah } from "@/utils/format";

// ── Format date helper ────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Status config ─────────────────────────────────────────────────────────────

const statusConfig = {
  pending: {
    label: "Menunggu Pembayaran",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
    icon: Clock,
  },
  paid: {
    label: "Lunas",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.3)",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Jatuh Tempo",
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
    icon: AlertTriangle,
  },
};

// ── Invoice Detail Modal ──────────────────────────────────────────────────────

function InvoiceDetailModal({
  invoice,
  onClose,
  onDownload,
  onMarkPaid,
  role,
}: {
  invoice: Invoice;
  onClose: () => void;
  onDownload: () => void;
  onMarkPaid: (id: string) => void;
  role: string;
}) {
  const config = statusConfig[invoice.status];
  const StatusIcon = config.icon;

  const paymentMethod = useMemo(() => {
    if (invoice.activity_log && Array.isArray(invoice.activity_log)) {
      const paymentEntry = invoice.activity_log.find((entry: any) => entry.action === "payment_completed");
      if (paymentEntry && (paymentEntry as any).payment_method) {
        return (paymentEntry as any).payment_method;
      }
    }
    return invoice.status === "paid" ? "Bank Transfer" : null;
  }, [invoice]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "rgba(13, 27, 62, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          padding: "0",
          position: "relative",
          backdropFilter: "blur(30px)",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Header with glow */}
        <div
          style={{
            padding: "28px 32px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow effects */}
          <div
            style={{
              position: "absolute",
              top: "-30px",
              right: "-30px",
              width: "160px",
              height: "160px",
              background:
                "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "30px",
              width: "100px",
              height: "100px",
              background:
                "radial-gradient(circle, rgba(26,54,240,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(6,182,212,0.12)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={20} style={{ color: "var(--cyan)" }} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "900",
                      color: "#fff",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {invoice.invoice_number}
                  </h2>
                </div>
              </div>

              {/* Status badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 14px",
                  borderRadius: "20px",
                  background: config.bg,
                  border: `1px solid ${config.border}`,
                  fontSize: "11px",
                  fontWeight: "700",
                  color: config.color,
                  textTransform: "uppercase",
                }}
              >
                <StatusIcon size={12} />
                {config.label}
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(226,232,240,0.5)",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                e.currentTarget.style.color = "#EF4444";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(226,232,240,0.5)";
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Amount highlight */}
          <div
            style={{
              padding: "20px 24px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(26,54,240,0.08) 100%)",
              border: "1px solid rgba(6,182,212,0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "rgba(226,232,240,0.4)",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Total Tagihan
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "900",
                  color: "#fff",
                  letterSpacing: "-1px",
                }}
              >
                {formatRupiah(invoice.amount)}
              </div>
            </div>
            <CircleDollarSign
              size={40}
              style={{ color: "rgba(6,182,212,0.3)" }}
            />
          </div>

          {/* Info grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {/* Dates */}
            <InfoBlock
              icon={Calendar}
              label="Tanggal Terbit"
              value={formatDate(invoice.issued_at)}
            />
            <InfoBlock
              icon={Clock}
              label="Jatuh Tempo"
              value={formatDate(invoice.due_date)}
              highlight={invoice.status === "overdue"}
            />

            {invoice.paid_at && (
              <InfoBlock
                icon={Calendar}
                label="Tanggal Bayar"
                value={formatDate(invoice.paid_at)}
              />
            )}
            {paymentMethod && (
              <InfoBlock
                icon={paymentMethod.includes("QRIS") || paymentMethod.includes("Wallet") ? Wallet : CreditCard}
                label="Metode Pembayaran"
                value={paymentMethod}
              />
            )}

            {/* Parties */}
            <InfoBlock
              icon={User}
              label="Klien"
              value={invoice.client_name}
              sub={invoice.client_email || undefined}
            />
            <InfoBlock
              icon={Briefcase}
              label="Freelancer"
              value={invoice.freelancer_name}
              sub={invoice.freelancer_email || undefined}
            />

            {/* Project & Milestone */}
            <InfoBlock
              icon={TrendingUp}
              label="Proyek"
              value={invoice.project_title}
            />
            <InfoBlock
              icon={Flag}
              label="Milestone"
              value={invoice.milestone_title}
            />
          </div>

          {/* Description */}
          {invoice.milestone_description && (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "rgba(226,232,240,0.4)",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Deskripsi Milestone
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(226,232,240,0.6)",
                  lineHeight: "1.7",
                }}
              >
                {invoice.milestone_description}
              </p>
            </div>
          )}

          {/* Activity timeline */}
          {invoice.activity_log && invoice.activity_log.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                <Activity
                  size={14}
                  style={{ color: "var(--cyan)" }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "rgba(226,232,240,0.4)",
                    textTransform: "uppercase",
                  }}
                >
                  Riwayat Aktivitas
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0",
                  paddingLeft: "8px",
                }}
              >
                {invoice.activity_log.map((entry, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "14px",
                      paddingBottom:
                        idx < invoice.activity_log!.length - 1
                          ? "16px"
                          : "0",
                      position: "relative",
                    }}
                  >
                    {/* Timeline dot & line */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background:
                            entry.action === "payment_completed"
                              ? "#10B981"
                              : "var(--cyan)",
                          boxShadow:
                            entry.action === "payment_completed"
                              ? "0 0 8px rgba(16,185,129,0.4)"
                              : "0 0 8px rgba(6,182,212,0.4)",
                          marginTop: "2px",
                        }}
                      />
                      {idx < invoice.activity_log!.length - 1 && (
                        <div
                          style={{
                            width: "1px",
                            flex: 1,
                            minHeight: "20px",
                            background:
                              "linear-gradient(to bottom, rgba(6,182,212,0.3), transparent)",
                          }}
                        />
                      )}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#fff",
                        }}
                      >
                        {entry.label}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgba(226,232,240,0.4)",
                          marginTop: "2px",
                        }}
                      >
                        {formatDateLong(entry.timestamp)} · {entry.actor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escrow info */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(6,182,212,0.05)",
              border: "1px solid rgba(6,182,212,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <ShieldCheck
              size={18}
              style={{ color: "var(--cyan)", flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "rgba(226,232,240,0.5)",
                lineHeight: "1.5",
              }}
            >
              Dana dilindungi oleh sistem escrow FreeTrack. Pembayaran dilepas
              setelah milestone disetujui.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "20px 32px 28px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          {role === "client" && invoice.status === "pending" && (
            <button
              onClick={() => onMarkPaid(invoice.id)}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10B981, #059669)",
                border: "none",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(16,185,129,0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <CheckCircle2 size={16} />
              Tandai Lunas
            </button>
          )}
          <button
            onClick={onDownload}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              background: "var(--gradient-primary)",
              border: "none",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(26,54,240,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Info block mini component ─────────────────────────────────────────────────

function InfoBlock({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.02)",
        border: highlight
          ? "1px solid rgba(239,68,68,0.2)"
          : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "6px",
        }}
      >
        <Icon
          size={12}
          style={{ color: highlight ? "#EF4444" : "var(--cyan)" }}
        />
        <span
          style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "rgba(226,232,240,0.4)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: highlight ? "#FCA5A5" : "#fff",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "11px",
            color: "rgba(226,232,240,0.4)",
            marginTop: "2px",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Summary Stat Card ─────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card"
      style={{
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "100px",
          height: "100px",
          background: color,
          filter: "blur(50px)",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "900",
            color: "#fff",
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "rgba(226,232,240,0.4)",
          }}
        >
          {label}
        </div>
      </div>
    </motion.div>
  );
}

// ── Invoice Card ──────────────────────────────────────────────────────────────

function InvoiceCard({
  invoice,
  index,
  onView,
}: {
  invoice: Invoice;
  index: number;
  onView: (inv: Invoice) => void;
}) {
  const config = statusConfig[invoice.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card"
      style={{
        padding: "24px",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={() => onView(invoice)}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "rgba(6,182,212,0.25)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "-25px",
          right: "-25px",
          width: "120px",
          height: "120px",
          background: config.color,
          filter: "blur(60px)",
          opacity: 0.06,
          pointerEvents: "none",
        }}
      />

      {/* Top: Invoice number + Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "rgba(226,232,240,0.3)",
              marginBottom: "4px",
            }}
          >
            Invoice
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            {invoice.invoice_number}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "8px",
            background: config.bg,
            border: `1px solid ${config.border}`,
            fontSize: "10px",
            fontWeight: "700",
            color: config.color,
            textTransform: "uppercase",
          }}
        >
          <StatusIcon size={10} />
          {config.label}
        </div>
      </div>

      {/* Project & milestone */}
      <div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "rgba(226,232,240,0.8)",
            marginBottom: "2px",
          }}
        >
          {invoice.project_title}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "rgba(226,232,240,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Flag size={10} />
          {invoice.milestone_title}
        </div>
      </div>

      {/* Amount & Dates */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingTop: "12px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              color: "rgba(226,232,240,0.3)",
              marginBottom: "2px",
            }}
          >
            Total
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "900",
              color: "var(--cyan)",
              letterSpacing: "-0.5px",
            }}
          >
            {formatRupiah(invoice.amount)}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "11px",
              color: "rgba(226,232,240,0.3)",
              marginBottom: "2px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              justifyContent: "flex-end",
            }}
          >
            <Calendar size={10} />
            Jatuh tempo
          </div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color:
                invoice.status === "overdue"
                  ? "#EF4444"
                  : "rgba(226,232,240,0.6)",
            }}
          >
            {formatDate(invoice.due_date)}
          </div>
        </div>
      </div>

      {/* View button hint */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "10px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)",
          fontSize: "12px",
          fontWeight: "600",
          color: "rgba(226,232,240,0.4)",
          transition: "all 0.2s",
        }}
      >
        <Eye size={14} />
        Lihat Detail
        <ChevronRight size={14} />
      </div>
    </motion.div>
  );
}

// ── Main Content ──────────────────────────────────────────────────────────────

function InvoicesContent() {
  const { role, loading: userLoading } = useUser();
  const { invoices, loading: invoicesLoading, refresh } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loading = userLoading || invoicesLoading;

  // ── Stats ──
  const stats = useMemo(() => {
    const total = invoices.length;
    const pending = invoices.filter((i) => i.status === "pending").length;
    const paid = invoices.filter((i) => i.status === "paid").length;
    const overdue = invoices.filter((i) => i.status === "overdue").length;
    const totalAmount = invoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    return { total, pending, paid, overdue, totalAmount };
  }, [invoices]);

  // ── Filtered invoices ──
  const filteredInvoices = useMemo(() => {
    if (filterStatus === "all") return invoices;
    return invoices.filter((i) => i.status === filterStatus);
  }, [invoices, filterStatus]);

  // ── Handlers ──
  const handleDownloadPDF = async () => {
    if (!selectedInvoice) return;
    const { generateInvoicePDF } = await import("@/lib/generateInvoicePDF");
    generateInvoicePDF(selectedInvoice);
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "paid" }),
      });

      if (res.ok) {
        refresh();
        setSelectedInvoice(null);
      }
    } catch (err) {
      console.error("Failed to mark as paid:", err);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          gap: "12px",
          color: "rgba(226,232,240,0.4)",
        }}
      >
        <Loader2
          size={24}
          style={{ animation: "spin 1s linear infinite" }}
        />
        <span style={{ fontSize: "15px", fontWeight: "600" }}>
          Memuat invoice...
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Receipt size={18} style={{ color: "var(--cyan)" }} />
          </div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "900",
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            Invoice & Pembayaran
          </h2>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(226,232,240,0.4)",
            paddingLeft: "46px",
          }}
        >
          Kelola invoice otomatis dari milestone yang telah disetujui. Download
          PDF untuk bukti pembayaran resmi.
        </p>
      </motion.div>

      {/* ── Summary Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          icon={Receipt}
          label="Total Invoice"
          value={stats.total}
          color="#06B6D4"
          delay={0}
        />
        <StatCard
          icon={Clock}
          label="Menunggu Pembayaran"
          value={stats.pending}
          color="#F59E0B"
          delay={0.08}
        />
        <StatCard
          icon={CheckCircle2}
          label="Lunas"
          value={stats.paid}
          color="#10B981"
          delay={0.16}
        />
        <StatCard
          icon={AlertTriangle}
          label="Jatuh Tempo"
          value={stats.overdue}
          color="#EF4444"
          delay={0.24}
        />
      </div>

      {/* ── Filter Tabs ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "all", label: "Semua", count: stats.total },
          { key: "paid", label: "Lunas", count: stats.paid },
          { key: "overdue", label: "Jatuh Tempo", count: stats.overdue },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border:
                filterStatus === tab.key
                  ? "1px solid rgba(6,182,212,0.3)"
                  : "1px solid rgba(255,255,255,0.06)",
              background:
                filterStatus === tab.key
                  ? "rgba(6,182,212,0.1)"
                  : "rgba(255,255,255,0.02)",
              color:
                filterStatus === tab.key
                  ? "var(--cyan)"
                  : "rgba(226,232,240,0.5)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "1px 6px",
                borderRadius: "6px",
                background:
                  filterStatus === tab.key
                    ? "rgba(6,182,212,0.2)"
                    : "rgba(255,255,255,0.05)",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Invoice Grid ── */}
      {filteredInvoices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{
            padding: "80px 40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "rgba(6,182,212,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(6,182,212,0.3)",
            }}
          >
            <FileText size={36} />
          </div>
          <div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              {filterStatus === "all"
                ? "Belum Ada Invoice"
                : `Tidak Ada Invoice ${
                    filterStatus === "pending"
                      ? "Pending"
                      : filterStatus === "paid"
                      ? "Lunas"
                      : "Jatuh Tempo"
                  }`}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(226,232,240,0.4)",
                maxWidth: "400px",
              }}
            >
              {filterStatus === "all"
                ? "Invoice akan otomatis dibuat saat milestone disetujui oleh klien."
                : "Coba ubah filter untuk melihat invoice lainnya."}
            </p>
          </div>
        </motion.div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredInvoices.map((invoice, idx) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              index={idx}
              onView={setSelectedInvoice}
            />
          ))}
        </div>
      )}

      {/* ── Info Banner ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
        style={{
          padding: "20px 24px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "16px",
        }}
      >
        <h4
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "rgba(226,232,240,0.6)",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          ℹ️ Informasi Invoice
        </h4>
        <ul
          style={{
            fontSize: "13px",
            color: "rgba(226,232,240,0.5)",
            lineHeight: "1.8",
            paddingLeft: "20px",
          }}
        >
          <li>
            Invoice dibuat otomatis saat klien menyetujui milestone di halaman
            Target Pencapaian.
          </li>
          <li>
            Setiap invoice memiliki nomor unik (INV-YYYY-NNNN) untuk
            dokumentasi resmi.
          </li>
          <li>
            Download invoice sebagai PDF untuk bukti pembayaran atau keperluan
            administrasi.
          </li>
          <li>
            Dana dilindungi oleh sistem escrow — dilepas setelah kedua belah
            pihak menyetujui.
          </li>
        </ul>
      </motion.div>

      {/* ── Invoice Detail Modal ── */}
      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceDetailModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onDownload={handleDownloadPDF}
            onMarkPaid={handleMarkPaid}
            role={role}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            gap: "12px",
            color: "rgba(226,232,240,0.4)",
          }}
        >
          <Loader2
            size={24}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <span style={{ fontSize: "15px", fontWeight: "600" }}>
            Loading…
          </span>
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
