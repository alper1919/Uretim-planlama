import { STATUS_MAP, PRIORITY_MAP } from "@/lib/statuses";
import { Badge } from "@/components/ui/badge";
import { FileText, Boxes, Ruler, Layers, Clock } from "lucide-react";

const fmt = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};

export default function PartCard({ part, onClick }) {
  const st = STATUS_MAP[part.status];
  const pr = PRIORITY_MAP[part.priority] || PRIORITY_MAP.normal;
  return (
    <div
      data-testid={`part-card-${part.part_code}`}
      onClick={() => onClick(part)}
      className="bg-[#1A2234] hover:bg-[#232D42] border border-[#2A364F] hover:border-amber-500/50 rounded-lg p-4 transition-colors shadow-md group relative cursor-pointer hover:shadow-[0_0_20px_rgba(249,115,22,0.12)]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono text-xs text-amber-400 font-semibold tracking-wide">{part.part_code}</span>
        <Badge className={`${pr.badge} text-[10px] px-1.5 py-0 font-mono uppercase`}>{pr.label}</Badge>
      </div>
      <h4 className="font-heading font-semibold text-[15px] text-white leading-snug mb-3 line-clamp-2">{part.part_name}</h4>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="flex items-center gap-1 bg-slate-800 text-slate-200 border border-slate-700 text-[11px] px-2 py-0.5 rounded font-mono">
          <Boxes className="w-3 h-3" /> {part.quantity} ad
        </span>
        {part.material_type && (
          <span className="flex items-center gap-1 bg-slate-800 text-slate-200 border border-slate-700 text-[11px] px-2 py-0.5 rounded font-mono">
            <Layers className="w-3 h-3" /> {part.material_type}
          </span>
        )}
        {part.material_dimensions && (
          <span className="flex items-center gap-1 bg-amber-950/40 text-amber-300 border border-amber-800/50 text-[11px] px-2 py-0.5 rounded font-mono font-semibold">
            <Ruler className="w-3 h-3" /> {part.material_dimensions}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          {part.drawings?.length > 0 && (
            <span className="flex items-center gap-1 text-cyan-400"><FileText className="w-3 h-3" /> {part.drawings.length}</span>
          )}
        </span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmt(part.updated_at)}</span>
      </div>
    </div>
  );
}
