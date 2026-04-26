/**
 * lib/hooks/useAccessDeniedToast.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Client-side hook that reads the `?error=` query parameter injected by the
 * middleware RBAC redirect and surfaces it as a temporary toast notification.
 *
 * Usage:
 *   // In any Client Component (e.g. the Milestones page)
 *   import { useAccessDeniedToast } from "@/lib/hooks/useAccessDeniedToast";
 *   useAccessDeniedToast();
 */

"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// ── Toast renderer (vanilla — no extra dependency required) ───────────────────

function showToast(message: string, durationMs = 4500) {
  // Reuse an existing toast element if it's still visible (debounce).
  const existingToast = document.getElementById("rbac-access-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "rbac-access-toast";

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "28px",
    left: "50%",
    transform: "translateX(-50%) translateY(30px)",
    opacity: "0",
    background:
      "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)",
    border: "1px solid rgba(239,68,68,0.35)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    color: "#FCA5A5",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "14px",
    fontWeight: "600",
    padding: "14px 24px",
    borderRadius: "14px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(239,68,68,0.15)",
    zIndex: "99999",
    maxWidth: "480px",
    textAlign: "center",
    transition: "opacity 0.35s ease, transform 0.35s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    whiteSpace: "nowrap",
  });

  // Shield icon prefix
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });
  });

  // Animate out + remove
  const timer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(30px)";
    setTimeout(() => toast.remove(), 400);
  }, durationMs);

  return () => clearTimeout(timer);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAccessDeniedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shownRef = useRef(false);

  useEffect(() => {
    const errorMessage = searchParams.get("error");
    if (!errorMessage || shownRef.current) return;

    shownRef.current = true;
    showToast(errorMessage);

    // Clean the ?error= query param from the URL without a full navigation
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    const cleanUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(cleanUrl, { scroll: false });
  }, [searchParams, router, pathname]);
}
