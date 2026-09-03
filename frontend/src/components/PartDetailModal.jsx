import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { STATUSES, STATUS_MAP, PRIORITY_MAP } from "@/lib/statuses";
import { terminInfo, fmtDate } from "@/lib/termin";
import { api, fileUrl } from "@/lib/api";
import { toast } from "sonner";
import CadViewer from "@/components/CadViewer";
import {
  Upload, FileText, Trash2, Download, Loader2, Pencil, Boxes, Ruler, Layers,
  User, Building2, Cog, ChevronRight, ArrowRight, X, Eye, CalendarClock,
} from "lucide-react";

const fmt = (iso) => {
  try {
    return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};

const isImage = (ct) => ct?.startsWith("image/");
const isPdf = (ct) => ct === "application/pdf";
const CAD_EXT = ["stl", "obj", "ply", "gltf", "glb", "3ds", "fbx", "step", "stp", "off", "brep", "3mf", "dae", "wrl", "3dm", "dxf", "dwg"];
const getExt = (name) => (name.split(".").pop() || "").toLowerCase();
const isCad = (name) => CAD_EXT.includes(getExt(name));
const canPreview = (d) => isImage(d.content_type) || isPdf(d.content_type) || isCad(d.original_filename);

export default function PartDetailModal({ part, open, onOpenChange, onUpdated, onEdit, onDelete }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  if (!part) return null;
  const st = STATUS_MAP[part.status];
  const pr = PRIORITY_MAP[part.priority] || PRIORITY_MAP.normal;
  const termin = terminInfo(part);
  const curIdx = STATUSES.findIndex((s) => s.key === part.status);

  const changeStatus = async (status) => {
    setBusy(true);
    try {
      const res = await api.patch(`/parts/${part.id}/status`, { status, note: note.trim() || null });
      toast.success(`Durum: ${STATUS_MAP[status].label}`);
      setNote("");
      onUpdated(res.data);
    } catch { toast.error("Durum güncellenemedi"); }
    finally { setBusy(false); }
  };

  const doUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post(`/parts/${part.id}/drawings`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Teknik resim yüklendi");
      onUpdated(res.data);
    } catch { toast.error("Yükleme başarısız"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const removeDrawing = async (id) => {
    try {
      const res = await api.delete(`/parts/${part.id}/drawings/${id}`);
      toast.success("Dosya kaldırıldı");
      onUpdated(res.data);
    } catch { toast.error("Silinemedi"); }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl bg-[#131926] border-[#2A364F] text-white max-h-[92vh] overflow-y-auto p-0" data-testid="part-detail-modal">
          <div className="p-6 border-b border-[#2A364F] sticky top-0 bg-[#131926]/95 backdrop-blur-md z-10">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs text-amber-400 font-semibold">{part.part_code}</span>
                  <DialogTitle className="font-heading text-2xl mt-1">{part.part_name}</DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge className={`${st.badge} font-mono text-xs`}>{st.label}</Badge>
                    <Badge className={`${pr.badge} font-mono text-[10px] uppercase`}>{pr.label}</Badge>
                    {termin && termin.level !== "done" && (
                      <Badge className={`${termin.badge} font-mono text-[10px] flex items-center gap-1`} data-testid="detail-termin-badge">
                        <CalendarClock className="w-3 h-3" /> {termin.label}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button data-testid="edit-part-button" size="sm" variant="ghost" onClick={() => onEdit(part)}
                    className="text-slate-300 hover:text-white hover:bg-[#232D42]"><Pencil className="w-4 h-4" /></Button>
                  <Button data-testid="delete-part-button" size="sm" variant="ghost" onClick={() => onDelete(part)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/40"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Specs */}
              <div className="grid grid-cols-2 gap-3">
                <Spec icon={Boxes} label="Adet" value={`${part.quantity} adet`} />
                <Spec icon={Layers} label="Hammadde" value={part.material_type || "—"} />
                <Spec icon={Ruler} label="Ölçüler" value={part.material_dimensions || "—"} mono />
                <Spec icon={Cog} label="Tezgah" value={part.workstation || "—"} />
                <Spec icon={Building2} label="Müşteri" value={part.customer || "—"} />
                <Spec icon={User} label="Oluşturan" value={part.created_by || "—"} />
                <Spec icon={CalendarClock} label="Teslim Tarihi" value={fmtDate(part.due_date)} mono />
              </div>
              {part.notes && (
                <div className="bg-[#0B0F17] border border-[#2A364F] rounded-lg p-3">
                  <p className="text-xs text-slate-500 uppercase font-mono mb-1">Notlar</p>
                  <p className="text-sm text-slate-300">{part.notes}</p>
                </div>
              )}

              {/* Drawings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400 uppercase font-mono tracking-wide">Teknik Resimler ({part.drawings?.length || 0})</p>
                  <input ref={fileRef} type="file" hidden onChange={doUpload}
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.dwg,.dxf,.step,.stp,.igs,.iges" data-testid="drawing-file-input" />
                  <Button data-testid="upload-drawing-button" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white h-8 text-xs">
                    {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                    Yükle
                  </Button>
                </div>
                <div className="space-y-2">
                  {part.drawings?.length === 0 && (
                    <div className="border border-dashed border-[#2A364F] rounded-lg p-6 text-center text-slate-500 text-sm">
                      PDF, resim veya CAD (DWG/DXF/STEP) dosyası yükleyin
                    </div>
                  )}
                  {part.drawings?.map((d) => (
                    <div key={d.id} data-testid={`drawing-${d.id}`} className="flex items-center gap-3 bg-[#0B0F17] border border-[#2A364F] rounded-lg p-2.5">
                      <div className="w-10 h-10 rounded bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{d.original_filename}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{(d.size / 1024).toFixed(0)} KB</p>
                      </div>
                      {canPreview(d) && (
                        <Button size="sm" variant="ghost" onClick={() => setPreview(d)}
                          className="text-slate-400 hover:text-cyan-400 h-8 w-8 p-0" data-testid={`preview-${d.id}`}><Eye className="w-4 h-4" /></Button>
                      )}
                      <a href={fileUrl(d.storage_path)} target="_blank" rel="noreferrer"
                        className="text-slate-400 hover:text-white h-8 w-8 flex items-center justify-center rounded hover:bg-[#232D42]"><Download className="w-4 h-4" /></a>
                      <Button size="sm" variant="ghost" onClick={() => removeDrawing(d.id)}
                        className="text-red-400 hover:text-red-300 h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Pipeline */}
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono tracking-wide mb-3">Üretim Aşaması</p>
                <div className="space-y-1.5">
                  {STATUSES.map((s, i) => {
                    const done = i < curIdx, active = i === curIdx;
                    return (
                      <button key={s.key} data-testid={`status-step-${s.key}`} disabled={busy || active}
                        onClick={() => changeStatus(s.key)}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors border
                          ${active ? "bg-[#232D42] border-amber-500/50" : done ? "bg-[#0B0F17] border-[#2A364F] opacity-70" : "bg-[#0B0F17] border-[#2A364F] hover:border-amber-500/40 hover:bg-[#1A2234]"}`}>
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${done || active ? s.dot : "bg-slate-700"} ${active ? "animate-pulse-dot" : ""}`} />
                        <span className={`text-sm flex-1 ${active ? "text-white font-semibold" : done ? "text-slate-400" : "text-slate-300"}`}>{s.label}</span>
                        {active && <span className="text-[10px] font-mono text-amber-400 uppercase">Şu an</span>}
                        {!active && !done && <ArrowRight className="w-3.5 h-3.5 text-slate-600" />}
                      </button>
                    );
                  })}
                </div>
                <Textarea data-testid="status-note-input" value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Durum değişikliği notu (opsiyonel)…" rows={2}
                  className="mt-3 bg-[#0B0F17] border-[#2A364F] resize-none text-sm" />
              </div>

              {/* History */}
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono tracking-wide mb-3">Durum Geçmişi</p>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1" data-testid="status-history">
                  {[...(part.history || [])].reverse().map((h) => {
                    const to = STATUS_MAP[h.to_status];
                    const from = h.from_status ? STATUS_MAP[h.from_status] : null;
                    return (
                      <div key={h.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className={`w-2.5 h-2.5 rounded-full ${to?.dot || "bg-slate-500"} mt-1`} />
                          <span className="flex-1 w-px bg-[#2A364F] mt-1" />
                        </div>
                        <div className="pb-1 flex-1">
                          <div className="flex items-center gap-1.5 text-sm flex-wrap">
                            {from && <span className="text-slate-500">{from.short}</span>}
                            {from && <ChevronRight className="w-3 h-3 text-slate-600" />}
                            <span className="text-white font-medium">{to?.label || h.to_status}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {h.user_name} · {fmt(h.timestamp)}
                          </p>
                          {h.note && <p className="text-xs text-slate-400 mt-1 italic">"{h.note}"</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen preview */}
      {preview && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" data-testid="drawing-preview-overlay" onClick={() => setPreview(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2" onClick={() => setPreview(null)}><X className="w-7 h-7" /></button>
          <div className="max-w-5xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {isCad(preview.original_filename) ? (
              <CadViewer drawing={preview} />
            ) : isImage(preview.content_type) ? (
              <img src={fileUrl(preview.storage_path)} alt={preview.original_filename} className="w-full h-full object-contain max-h-[85vh] rounded" />
            ) : isPdf(preview.content_type) ? (
              <iframe title={preview.original_filename} src={fileUrl(preview.storage_path)} className="w-full h-[85vh] rounded bg-white" />
            ) : (
              <CadViewer drawing={preview} />
            )}
            <p className="text-center text-slate-300 font-mono text-sm mt-2">{preview.original_filename}</p>
          </div>
        </div>
      )}
    </>
  );
}

function Spec({ icon: Icon, label, value, mono }) {
  return (
    <div className="bg-[#0B0F17] border border-[#2A364F] rounded-lg p-3">
      <p className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1 mb-1"><Icon className="w-3 h-3" /> {label}</p>
      <p className={`text-sm text-white ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
