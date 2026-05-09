import React from "react";
import {
  Globe,
  Smartphone,
  Layout,
  Palette,
  Video,
  Cpu,
  TrendingUp,
  FileText,
  BarChart3,
  Layers,
  Code2,
  Briefcase,
  Search,
  Check,
  ChevronDown,
  Monitor,
  PenTool,
  MessageSquare,
  Zap,
  PieChart,
} from "lucide-react";

export interface Skill {
  id: string;
  label: string;
}

export interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  skills: Skill[];
}

export const ONBOARDING_CATEGORIES: Category[] = [
  {
    id: "development",
    label: "Development",
    icon: <Code2 size={24} />,
    color: "#4D63FF",
    skills: [
      { id: "web-dev", label: "Website Development" },
      { id: "mobile-app", label: "Mobile App Development" },
      { id: "frontend", label: "Frontend Development" },
      { id: "backend", label: "Backend Development" },
      { id: "fullstack", label: "Fullstack Development" },
    ],
  },
  {
    id: "design",
    label: "Design",
    icon: <Palette size={24} />,
    color: "#10B981",
    skills: [
      { id: "uiux", label: "UI/UX Design" },
      { id: "graphic-design", label: "Graphic Design" },
      { id: "motion-design", label: "Motion Graphics" },
      { id: "illustration", label: "Illustration" },
    ],
  },
  {
    id: "content-media",
    label: "Content & Media",
    icon: <Video size={24} />,
    color: "#F59E0B",
    skills: [
      { id: "video-editing", label: "Video Editing" },
      { id: "copywriting", label: "Copywriting" },
      { id: "content-writing", label: "Content Writing" },
      { id: "animation", label: "Animation" },
      { id: "photography", label: "Photography" },
    ],
  },
  {
    id: "ai-data",
    label: "AI & Data",
    icon: <Cpu size={24} />,
    color: "#8B5CF6",
    skills: [
      { id: "ai-automation", label: "AI / Automation" },
      { id: "data-analysis", label: "Data Analysis" },
      { id: "machine-learning", label: "Machine Learning" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: <TrendingUp size={24} />,
    color: "#EC4899",
    skills: [
      { id: "digital-marketing", label: "Digital Marketing" },
      { id: "social-media", label: "Social Media Management" },
      { id: "seo-sem", label: "SEO / SEM" },
    ],
  },
  {
    id: "business",
    label: "Business",
    icon: <Briefcase size={24} />,
    color: "#06B6D4",
    skills: [
      { id: "project-management", label: "Project Management" },
      { id: "virtual-assistant", label: "Virtual Assistant" },
      { id: "business-analysis", label: "Business Analysis" },
    ],
  },
  {
    id: "other",
    label: "Lainnya",
    icon: <Layers size={24} />,
    color: "#94A3B8",
    skills: [
      { id: "other-skill", label: "Keahlian Lainnya" },
    ],
  },
];

export const TOOLS_BY_CATEGORY: Record<string, string[]> = {
  development: ["React", "Next.js", "Vue.js", "TypeScript", "TailwindCSS", "Node.js", "Python", "Django", "Laravel", "PHP", "Go", "Flutter", "Swift", "Kotlin", "Docker", "AWS", "MySQL", "PostgreSQL", "Git", "GitHub"],
  design: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Canva", "Blender", "Sketch", "InVision"],
  "content-media": ["Adobe Premiere Pro", "Adobe After Effects", "CapCut", "Davinci Resolve", "Final Cut Pro", "OBS Studio"],
  "ai-data": ["n8n", "Make.com", "Zapier", "OpenClaw", "LangChain", "OpenAI", "Pinecone", "Claude AI", "TensorFlow", "Pandas"],
  marketing: ["Google Ads", "Facebook Ads", "Mailchimp", "SEMrush", "Ahrefs", "HubSpot", "Hootsuite", "Buffer"],
  business: ["Trello", "Asana", "Jira", "Slack", "Notion", "Microsoft Excel", "Google Sheets", "Salesforce"],
};

export const COMMON_TOOLS = Array.from(new Set(Object.values(TOOLS_BY_CATEGORY).flat()));

export function getLabelById(id: string): string {
  for (const cat of ONBOARDING_CATEGORIES) {
    if (cat.id === id) return cat.label;
    const skill = cat.skills.find((s) => s.id === id);
    if (skill) return skill.label;
  }
  return id;
}

export function getCategoryIdBySkillId(skillId: string): string | null {
  for (const cat of ONBOARDING_CATEGORIES) {
    if (cat.id === skillId) return cat.id; // It's already a category ID
    if (cat.skills.some(s => s.id === skillId)) return cat.id;
  }
  return null;
}
