export function terminInfo(part) {
  if (!part?.due_date) return null;
  const due = new Date(part.due_date + "T23:59:59");
  const now = new Date();
  const days = Math.ceil((due - now) / 86400000);
  if (part.status === "sevk_edildi") {
    return { level: "done", days, label: "Teslim edildi",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" };
  }
  if (days < 0) {
    return { level: "overdue", days, label: `${Math.abs(days)} gün gecikti`,
      badge: "bg-red-500/15 text-red-400 border-red-500/40", dot: "bg-red-500" };
  }
  if (days <= 3) {
    return { level: "soon", days, label: days === 0 ? "Bugün son gün" : `${days} gün kaldı`,
      badge: "bg-orange-500/15 text-orange-400 border-orange-500/40", dot: "bg-orange-400" };
  }
  return { level: "ok", days, label: `${days} gün kaldı`,
    badge: "bg-slate-600/20 text-slate-300 border-slate-600/40", dot: "bg-slate-400" };
}

export const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
};
