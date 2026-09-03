export const STATUSES = [
  { key: "hammadde_siparis_edildi", label: "Hammadde Sipariş Edildi", short: "Sipariş",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30", accent: "#F59E0B",
    dot: "bg-amber-400", col: "border-t-amber-500" },
  { key: "hammadde_geldi", label: "Hammadde Geldi", short: "Geldi",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30", accent: "#3B82F6",
    dot: "bg-blue-400", col: "border-t-blue-500" },
  { key: "isleme_alindi", label: "İşleme Alındı", short: "İşleme",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/40", accent: "#EA580C",
    dot: "bg-orange-400", col: "border-t-orange-500" },
  { key: "uretim_bitti", label: "Üretim Bitti", short: "Üretim",
    badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30", accent: "#6366F1",
    dot: "bg-indigo-400", col: "border-t-indigo-500" },
  { key: "tesviyede", label: "Tesviyede", short: "Tesviye",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30", accent: "#A855F7",
    dot: "bg-purple-400", col: "border-t-purple-500" },
  { key: "kalite_kontrol", label: "Kalite Kontrol", short: "Kalite",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", accent: "#06B6D4",
    dot: "bg-cyan-400", col: "border-t-cyan-500" },
  { key: "sevk_alaninda", label: "Sevk Alanında", short: "Sevk Alanı",
    badge: "bg-teal-500/10 text-teal-400 border-teal-500/30", accent: "#14B8A6",
    dot: "bg-teal-400", col: "border-t-teal-500" },
  { key: "sevk_edildi", label: "Sevk Edildi", short: "Sevk Edildi",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", accent: "#10B981",
    dot: "bg-emerald-400", col: "border-t-emerald-500" },
];

export const STATUS_MAP = STATUSES.reduce((a, s) => { a[s.key] = s; return a; }, {});

export const PRIORITIES = [
  { key: "dusuk", label: "Düşük", badge: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
  { key: "normal", label: "Normal", badge: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { key: "yuksek", label: "Yüksek", badge: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  { key: "acil", label: "Acil", badge: "bg-red-500/10 text-red-400 border-red-500/30" },
];

export const PRIORITY_MAP = PRIORITIES.reduce((a, p) => { a[p.key] = p; return a; }, {});
