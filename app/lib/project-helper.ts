"use client";

export interface RichProjectDescription {
  is_rich: boolean;
  summary: string;
  description: string;
  goals: string;
  deliverables: string;
  budget_type: "fixed" | "hourly";
  duration: string;
  deadline: string;
  experienceLevel: "junior" | "mid" | "senior";
  communication_preference: string;
  screening_questions: string[];
  attachments: string[];
  posting_status: "draft" | "published" | "closed";
}

export function parseProjectDescription(descText: string): RichProjectDescription {
  try {
    if (descText && descText.trim().startsWith("{")) {
      const parsed = JSON.parse(descText.trim());
      if (parsed && parsed.is_rich) {
        return {
          is_rich: true,
          summary: parsed.summary || "",
          description: parsed.description || "",
          goals: parsed.goals || "",
          deliverables: parsed.deliverables || "",
          budget_type: parsed.budget_type || "fixed",
          duration: parsed.duration || "",
          deadline: parsed.deadline || "",
          experienceLevel: parsed.experienceLevel || "mid",
          communication_preference: parsed.communication_preference || "",
          screening_questions: Array.isArray(parsed.screening_questions) ? parsed.screening_questions : [],
          attachments: Array.isArray(parsed.attachments) ? parsed.attachments : [],
          posting_status: parsed.posting_status || "published"
        };
      }
    }
  } catch (err) {
    console.error("parseProjectDescription parse error:", err);
  }

  // Fallback for legacy raw text database projects
  const fallbackText = descText || "";
  return {
    is_rich: false,
    summary: fallbackText.substring(0, 120) + (fallbackText.length > 120 ? "..." : ""),
    description: fallbackText,
    goals: "",
    deliverables: "",
    budget_type: "fixed",
    duration: "",
    deadline: "",
    experienceLevel: "mid",
    communication_preference: "",
    screening_questions: [],
    attachments: [],
    posting_status: "published"
  };
}
