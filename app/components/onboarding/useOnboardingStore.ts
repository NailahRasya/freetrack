"use client";

/**
 * useOnboardingStore.ts
 * Custom hook + sessionStorage persistence untuk data onboarding.
 * Data otomatis tersimpan antar step dan hilang setelah tab ditutup.
 */

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientOnboardingData {
  role: "client";
  projectCategories: string[];
  // Preferensi Baru
  businessScale: "personal" | "startup" | "umkm" | "enterprise" | "";
  workType: "one-time" | "ongoing" | "";
  experiencePreference: "junior" | "mid" | "senior" | "";
  // Project fields (optional now)
  projectTitle: string;
  projectDescription: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  requiredSkills: string[];
  projectType: "remote" | "hybrid" | "onsite";
}

export interface FreelancerOnboardingData {
  role: "freelancer";
  skillCategories: string[];
  tools: string[];
  // Preferensi Kerja
  preferredClientScales: string[]; // "personal", "startup", "umkm", "enterprise"
  workTypePreference: string[]; // "one-time", "ongoing"
  experienceLevel: "junior" | "mid" | "senior" | "expert" | "";
  yearsOfExperience: number;
  portfolioUrl: string;
}

export type OnboardingData = ClientOnboardingData | FreelancerOnboardingData;

const STORAGE_KEY = "freetrack_onboarding";

// ─── Default Values ────────────────────────────────────────────────────────────

export const defaultClientData: ClientOnboardingData = {
  role: "client",
  projectCategories: [],
  businessScale: "",
  workType: "",
  experiencePreference: "",
  projectTitle: "",
  projectDescription: "",
  budgetMin: 500000,
  budgetMax: 5000000,
  deadline: "",
  requiredSkills: [],
  projectType: "remote",
};

export const defaultFreelancerData: FreelancerOnboardingData = {
  role: "freelancer",
  skillCategories: [],
  tools: [],
  preferredClientScales: [],
  workTypePreference: [],
  experienceLevel: "",
  yearsOfExperience: 1,
  portfolioUrl: "",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOnboardingStore(role: "client" | "freelancer") {
  const [data, setData] = useState<OnboardingData>(
    role === "client" ? defaultClientData : defaultFreelancerData
  );

  // Baca dari localStorage saat mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OnboardingData;
        // Hanya load kalau role sama
        if (parsed.role === role) {
          setData(parsed);
        }
      }
    } catch {}
  }, [role]);

  // Update fungsi: merge partial data dan simpan ke localStorage
  const updateData = useCallback(
    (partial: Partial<ClientOnboardingData> | Partial<FreelancerOnboardingData>) => {
      setData((prev) => {
        const next = { ...prev, ...partial } as OnboardingData;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  // Hapus data onboarding dari localStorage
  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setData(role === "client" ? defaultClientData : defaultFreelancerData);
  }, [role]);

  // Baca data raw dari localStorage (untuk post-auth commit)
  const getRawData = useCallback((): OnboardingData | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  return {
    data: data as ClientOnboardingData & FreelancerOnboardingData,
    updateData,
    clearData,
    getRawData,
  };
}

// ─── Standalone helpers (untuk dipakai di login/register page) ────────────────

export function getStoredOnboardingData(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredOnboardingData() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
