"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import ClientProjectHeader from "../../components/dashboard/milestones/ClientProjectHeader";
import ClientMilestoneCard from "../../components/dashboard/milestones/ClientMilestoneCard";
import { useUser } from "../layout";
import { Flag, ShieldAlert, Loader2 } from "lucide-react";
import { useAccessDeniedToast } from "@/lib/hooks/useAccessDeniedToast";

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PROJECT = {
  name: "E-Commerce Platform Redesign",
  totalBudget: "Rp 12.5M",
  completionPercentage: 45,
};

const MOCK_MILESTONES_INIT: any[] = [
  {
    id: "1",
    title: "Phase 1: Wireframing & UX Design",
    description:
      "Complete all low-fidelity wireframes for the main user flows (Home, Category, Product Page, Checkout).\nIncludes 2 rounds of revisions based on client feedback.",
    deadline: "Oct 15, 2023",
    status: "Completed",
    paymentStatus: "Released",
  },
  {
    id: "2",
    title: "Phase 2: High-Fidelity UI Mockups",
    description:
      "Apply branding guidelines to wireframes. Deliver Figma prototypes for desktop and mobile views.\nColor tokens, typography, and component library must be documented.",
    deadline: "Oct 28, 2023",
    status: "Waiting for Approval",
    paymentStatus: "Escrowed",
  },
  {
    id: "3",
    title: "Phase 3: Frontend Development Handoff",
    description:
      "Export all assets, prepare design system documentation, and conduct a handoff meeting with the engineering team.",
    deadline: "Nov 10, 2023",
    status: "In Progress",
    paymentStatus: "Escrowed",
  },
];

// ── Inner component (needs Suspense for useSearchParams) ─────────────────────
function MilestonesContent() {
  const { role, loading } = useUser();
  const [milestones, setMilestones] = useState(MOCK_MILESTONES_INIT);
  const [actionError, setActionError] = useState<string | null>(null);

  // Reads ?error= from middleware RBAC redirect → shows toast
  useAccessDeniedToast();

  const completedCount = milestones.filter((m) => m.status === "Completed").length;

  /**
   * Approve a milestone by calling the secure API route (PUT /api/milestones).
   * Clients can only set status to 'Approved' — the API enforces this.
   */
  const handleApprove = async (id: string) => {
    setActionError(null);
    try {
      const res = await fetch("/api/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Approved" }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setActionError(error ?? "Failed to approve milestone.");
        return;
      }

      // Optimistic UI update after successful API call
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: "Completed", paymentStatus: "Released" } : m
        )
      );
    } catch {
      setActionError("Network error — please try again.");
    }
  };

  const handleReview = (id: string) => {
    // TODO: open review modal / drawer
    console.log("Review deliverables for milestone:", id);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "15px", fontWeight: "600" }}>Loading milestones…</span>
      </div>
    );
  }

  // ── Freelancer placeholder ──
  if (role === "freelancer") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
        <ShieldAlert size={52} style={{ color: "rgba(226,232,240,0.2)" }} />
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#E2E8F0" }}>Freelancer Workspace</h2>
        <p style={{ color: "rgba(226,232,240,0.4)", fontSize: "14px" }}>
          The Freelancer milestone view is under construction.
        </p>
      </div>
    );
  }

  // ── Client View ──
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Action error banner (API-level rejection) */}
      {actionError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: "20px",
            padding: "12px 18px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#FCA5A5",
            fontSize: "13px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <ShieldAlert size={16} />
          {actionError}
          <button
            onClick={() => setActionError(null)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#FCA5A5", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "28px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "rgba(26,54,240,0.12)",
            border: "1px solid rgba(26,54,240,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Flag size={18} style={{ color: "var(--cyan)" }} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px" }}>
            Milestone Tracking
          </h2>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(226,232,240,0.4)", paddingLeft: "46px" }}>
          Monitor project progress, review submissions, and manage approvals.
        </p>
      </motion.div>

      {/* Project header */}
      <ClientProjectHeader
        projectName={MOCK_PROJECT.name}
        totalBudget={MOCK_PROJECT.totalBudget}
        completionPercentage={MOCK_PROJECT.completionPercentage}
        completedCount={completedCount}
        totalCount={milestones.length}
      />

      {/* Section label */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "20px",
      }}>
        <h3 style={{ fontSize: "15px", fontWeight: "800", color: "rgba(226,232,240,0.7)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Project Milestones
          <span style={{
            marginLeft: "10px",
            fontSize: "11px", fontWeight: "700",
            color: "var(--cyan)",
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.2)",
            padding: "2px 8px", borderRadius: "6px",
          }}>
            {milestones.length} total
          </span>
        </h3>
      </div>

      {/* Milestone cards grid */}
      {milestones.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{
            padding: "60px 32px",
            textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
          }}
        >
          <Flag size={44} style={{ color: "rgba(226,232,240,0.12)" }} />
          <p style={{ fontSize: "16px", fontWeight: "700", color: "rgba(226,232,240,0.3)" }}>
            No milestones yet
          </p>
          <p style={{ fontSize: "13px", color: "rgba(226,232,240,0.2)" }}>
            Your freelancer hasn't created any milestones for this project.
          </p>
        </motion.div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "20px",
        }}>
          {milestones.map((milestone, idx) => (
            <ClientMilestoneCard
              key={milestone.id}
              milestone={milestone}
              index={idx}
              onApprove={handleApprove}
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page export (Suspense wrapper for useSearchParams) ────────────────────────
export default function MilestonesPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "rgba(226,232,240,0.4)" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "15px", fontWeight: "600" }}>Loading…</span>
      </div>
    }>
      <MilestonesContent />
    </Suspense>
  );
}
