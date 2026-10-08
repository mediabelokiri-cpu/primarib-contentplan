import { ContentStatus, IdeaStatus, PriorityLevel } from "@/types/database";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateEngagementRate(metrics: {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  views: number;
}): number {
  const interactions =
    (metrics.likes || 0) +
    (metrics.comments || 0) +
    (metrics.shares || 0) +
    (metrics.saves || 0);
  const denominator = metrics.reach > 0 ? metrics.reach : metrics.views;
  if (!denominator || denominator <= 0) return 0;
  return Number(((interactions / denominator) * 100).toFixed(2));
}

export function getStatusBadgeStyle(status: ContentStatus | IdeaStatus): string {
  switch (status) {
    case "NEW":
    case "PLANNED":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "SELECTED":
    case "BRIEF":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PRODUCTION":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "REVIEW":
      return "bg-amber-50 text-amber-800 border-amber-300";
    case "REVISION":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "SCHEDULED":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "PUBLISHED":
      return "bg-[#284078] text-white border-[#284078]";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-500 border-gray-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function getPriorityBadgeStyle(priority: PriorityLevel): string {
  switch (priority) {
    case "HIGH":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "LOW":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export function getProgramBadgeStyle(programCode?: string | null): string {
  switch (programCode?.toUpperCase()) {
    case "CPNS":
      return "bg-[#284078]/10 text-[#284078] border-[#284078]/20";
    case "SEKDIN":
      return "bg-[#DDB02E]/20 text-amber-900 border-[#DDB02E]/40";
    case "POLRI":
      return "bg-stone-100 text-stone-800 border-stone-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
