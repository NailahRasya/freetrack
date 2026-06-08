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
  agreed_at?: string;
  source_id?: string;
}

export function parseProjectDescription(descText: string): RichProjectDescription {
  const sourceIdMatch = descText?.match(/\[source_id:([a-f0-9-]+)\]/i);
  const agreedAtMatch = descText?.match(/\[agreed_at:([^\]]+)\]/i);
  const source_id = sourceIdMatch ? sourceIdMatch[1] : undefined;
  const agreed_at = agreedAtMatch ? agreedAtMatch[1] : undefined;

  try {
    let cleanText = descText || "";
    // Strip metadata markers before parsing JSON
    cleanText = cleanText.replace(/\[source_id:[a-f0-9-]+\]/gi, "").replace(/\[agreed_at:[^\]]+\]/gi, "").trim();

    if (cleanText && cleanText.startsWith("{")) {
      const parsed = JSON.parse(cleanText);
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
          posting_status: parsed.posting_status || "published",
          agreed_at,
          source_id
        };
      }
    }
  } catch (err) {
    console.error("parseProjectDescription parse error:", err);
  }

  // Fallback for legacy raw text database projects
  let fallbackText = descText || "";
  // Strip metadata markers for fallback text display
  fallbackText = fallbackText.replace(/\[source_id:[a-f0-9-]+\]/gi, "").replace(/\[agreed_at:[^\]]+\]/gi, "").trim();

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
    posting_status: "published",
    agreed_at,
    source_id
  };
}
