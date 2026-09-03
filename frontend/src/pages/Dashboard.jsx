import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { STATUSES, STATUS_MAP, PRIORITIES } from "@/lib/statuses";
import { terminInfo } from "@/lib/termin";
import PartCard from "@/components/PartCard";
import PartFormModal from "@/components/PartFormModal";
import PartDetailModal from "@/components/PartDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Cog, Plus, Search, LayoutGrid, Table2, Wifi, LogOut, Loader2, Package, FileText,
  FileSpreadsheet, AlertTriangle, Filter, X, BellRing,
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [fCustomer, setFCustomer] = useState("all");
  const [fWorkstation, setFWorkstation] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const notifiedRef = useRef(false);

  const load = async () => {
    try {
      const res = await api.get("/parts");
      setParts(res.data);
    } catch { toast.error("Parçalar yüklenemedi"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return parts.filter((p) => {
      if (q && ![p.part_code, p.part_name, p.material_type, p.customer, p.workstation, p.order_no]
        .filter(Boolean).some((v) => v.toLowerCase().includes(q))) return false;
      if (fCustomer !== "all" && p.customer !== fCustomer) return false;
      if (fWorkstation !== "all" && p.workstation !== fWorkstation) return false;
      if (fPriority !== "all" && p.priority !== fPriority) return false;
      if (overdueOnly) { const t = terminInfo(p); if (!t || t.level !== "overdue") return false; }
      return true;
    });
  }, [parts, search, fCustomer, fWorkstation, fPriority, overdueOnly]);

  const customers = useMemo(() => [...new Set(parts.map((p) => p.customer).filter(Boolean))].sort(), [parts]);
  const workstations = useMemo(() => [...new Set(parts.map((p) => p.workstation).filter(Boolean))].sort(), [parts]);
  const filtersActive = fCustomer !== "all" || fWorkstation !== "all" || fPriority !== "all" || overdueOnly || !!search;
  const clearFilters = () => { setFCustomer("all"); setFWorkstation("all"); setFPriority("all"); setOverdueOnly(false); setSearch(""); };

  const applyUpdate = (updated) => {
    setParts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setDetail((d) => (d && d.id === updated.id ? updated : d));
  };
  const applyCreate = (created) => {
    setParts((prev) => {
      const idx = prev.findIndex((p) => p.id === created.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = created; return n; }
      return [created, ...prev];
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/parts/${deleteTarget.id}`);
      setParts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Parça silindi");
      setDetail(null);
    } catch { toast.error("Silinemedi"); }
    finally { setDeleteTarget(null); }
  };

  const counts = useMemo(() => {
    const c = {};
    STATUSES.forEach((s) => (c[s.key] = 0));
    parts.forEach((p) => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [parts]);

  const overdueList = useMemo(
    () => parts.filter((p) => { const t = terminInfo(p); return t && t.level === "overdue"; }),
    [parts]
  );
  const overdue = overdueList.length;
  const soonCount = useMemo(
    () => parts.filter((p) => { const t = terminInfo(p); return t && t.level === "soon"; }).length,
    [parts]
  );

  useEffect(() => {
    if (loading || notifiedRef.current) return;
    notifiedRef.current = true;
    if (overdue > 0) {
      toast.error(`${overdue} parçanın termini geçti!`, {
        description: soonCount > 0 ? `${soonCount} parçanın termini de yaklaşıyor.` : "Panoda kırmızı ile işaretlendi.",
        duration: 7000,
      });
    }
  }, [loading, overdue, soonCount]);

  const [exporting, setExporting] = useState(false);
  const exportExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get("/export/parts.xlsx", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parcatakip_rapor_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Excel raporu indirildi");
    } catch { toast.error("Rapor oluşturulamadı"); }
    finally { setExporting(false); }
  };

  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const moveStatus = async (partId, status) => {
    const p = parts.find((x) => x.id === partId);
    if (!p || p.status === status) return;
    try {
      const res = await api.patch(`/parts/${partId}/status`, { status, note: null });
      applyUpdate(res.data);
      toast.success(`${p.part_code} → ${STATUS_MAP[status].label}`);
    } catch { toast.error("Durum güncellenemedi"); }
  };

  const openNew = () => { setEditPart(null); setFormOpen(true); };
  const openEdit = (p) => { setDetail(null); setEditPart(p); setFormOpen(true); };

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0B0F17]/85 backdrop-blur-xl border-b border-[#2A364F]">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
              <Cog className="w-6 h-6 text-[#0B0F17]" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-lg text-white leading-none">
                ParçaTakip<span className="text-amber-400"> PRO</span>
              </h1>
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono mt-1">
                <Wifi className="w-3 h-3" /> <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" /> Ortak Ağ Bağlı · Canlı
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 pr-3 border-r border-[#2A364F]">
              {user?.picture && <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-[#2A364F]" />}
              <span className="text-sm text-slate-300">{user?.name}</span>
            </div>
            <Button data-testid="logout-button" variant="ghost" size="sm" onClick={logout}
              className="text-slate-400 hover:text-white hover:bg-[#232D42]"><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatBig label="Toplam Parça" value={parts.length} icon={Package} accent="text-amber-400" />
          <StatBig label="Üretimde" value={counts.isleme_alindi + counts.tesviyede} icon={Cog} accent="text-orange-400" />
          <StatBig label="Geciken Termin" value={overdue} icon={AlertTriangle} accent={overdue > 0 ? "text-red-400" : "text-slate-400"} />
          <StatBig label="Sevk Edildi" value={counts.sevk_edildi} icon={Package} accent="text-emerald-400" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input data-testid="search-input" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Parça kodu, ad, hammadde, müşteri…"
              className="pl-9 bg-[#131926] border-[#2A364F] text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#131926] border border-[#2A364F] rounded-lg p-1">
              <button data-testid="view-kanban" onClick={() => setView("kanban")}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${view === "kanban" ? "bg-amber-500 text-[#0B0F17] font-semibold" : "text-slate-400 hover:text-white"}`}>
                <LayoutGrid className="w-4 h-4" /> Pano
              </button>
              <button data-testid="view-table" onClick={() => setView("table")}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${view === "table" ? "bg-amber-500 text-[#0B0F17] font-semibold" : "text-slate-400 hover:text-white"}`}>
                <Table2 className="w-4 h-4" /> Liste
              </button>
            </div>
            <Button data-testid="export-excel-button" onClick={exportExcel} disabled={exporting || parts.length === 0}
              variant="outline" className="bg-[#131926] border-[#2A364F] text-slate-200 hover:bg-[#232D42] hover:text-white">
              {exporting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-400" />}
              Rapor
            </Button>
            <Button data-testid="add-part-button" onClick={openNew}
              className="bg-amber-500 text-[#0B0F17] hover:bg-amber-400 font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Yeni Parça
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5" data-testid="filter-bar">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5" /> Filtre
          </span>
          <FilterSelect testid="filter-customer" value={fCustomer} onChange={setFCustomer} placeholder="Müşteri" options={customers} />
          <FilterSelect testid="filter-workstation" value={fWorkstation} onChange={setFWorkstation} placeholder="Tezgah" options={workstations} />
          <Select value={fPriority} onValueChange={setFPriority}>
            <SelectTrigger data-testid="filter-priority" className="w-40 h-9 bg-[#131926] border-[#2A364F] text-sm text-slate-200">
              <SelectValue placeholder="Aciliyet" />
            </SelectTrigger>
            <SelectContent className="bg-[#131926] border-[#2A364F] text-white">
              <SelectItem value="all">Tüm Aciliyetler</SelectItem>
              {PRIORITIES.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button data-testid="clear-filters" size="sm" variant="ghost" onClick={clearFilters}
              className="text-slate-400 hover:text-white hover:bg-[#232D42] h-9">
              <X className="w-3.5 h-3.5 mr-1" /> Temizle
            </Button>
          )}
          <span className="text-xs text-slate-500 ml-auto font-mono" data-testid="filter-result-count">
            {filtered.length} / {parts.length} parça
          </span>
        </div>

        {/* Overdue alert band */}
        {overdue > 0 && (
          <div data-testid="overdue-banner"
            className="mb-5 rounded-xl border border-red-500/40 bg-red-950/30 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/15 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                <BellRing className="w-5 h-5 text-red-400 animate-pulse-dot" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  <span className="text-red-400 font-mono">{overdue}</span> parçanın teslim termini geçti
                  {soonCount > 0 && <> · <span className="text-orange-400 font-mono">{soonCount}</span> parça yaklaşıyor</>}
                </p>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">
                  {overdueList.slice(0, 6).map((p) => p.part_code).join("  ·  ")}{overdueList.length > 6 ? "  …" : ""}
                </p>
              </div>
            </div>
            <Button data-testid="overdue-filter-toggle" size="sm" onClick={() => setOverdueOnly((v) => !v)}
              className={overdueOnly
                ? "bg-red-500 text-white hover:bg-red-400 font-semibold"
                : "bg-red-500/15 text-red-300 border border-red-500/40 hover:bg-red-500/25 font-semibold"}>
              {overdueOnly ? "Tümünü Göster" : "Sadece Gecikenler"}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
        ) : parts.length === 0 ? (
          <EmptyState onAdd={openNew} />
        ) : view === "kanban" ? (
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x" data-testid="kanban-board">
            {STATUSES.map((s) => {
              const items = filtered.filter((p) => p.status === s.key);
              return (
                <div key={s.key} data-testid={`kanban-col-${s.key}`}
                  onDragOver={(e) => { e.preventDefault(); if (dragOver !== s.key) setDragOver(s.key); }}
                  onDragLeave={() => setDragOver((prev) => (prev === s.key ? null : prev))}
                  onDrop={(e) => { e.preventDefault(); if (dragId) moveStatus(dragId, s.key); setDragId(null); setDragOver(null); }}
                  className={`w-80 flex-shrink-0 bg-[#131926] border rounded-xl flex flex-col snap-start border-t-2 ${s.col} transition-colors ${dragOver === s.key ? "border-amber-500/60 ring-2 ring-amber-500/40 bg-[#1A2234]" : "border-[#2A364F]"}`}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A364F]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="text-sm font-semibold text-white">{s.label}</span>
                    </div>
                    <Badge className={`${s.badge} font-mono text-xs`}>{items.length}</Badge>
                  </div>
                  <div className="p-3 space-y-3 flex-1 min-h-[120px]">
                    {items.map((p) => (
                      <div key={p.id} draggable
                        onDragStart={(e) => { setDragId(p.id); e.dataTransfer.effectAllowed = "move"; }}
                        onDragEnd={() => { setDragId(null); setDragOver(null); }}
                        className={`transition-opacity ${dragId === p.id ? "opacity-40" : ""}`}>
                        <PartCard part={p} onClick={setDetail} />
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="text-center text-slate-600 text-xs py-6">
                        {dragOver === s.key ? "Buraya bırak" : "Boş"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#131926] border border-[#2A364F] rounded-xl overflow-hidden overflow-x-auto" data-testid="parts-table">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A364F] text-slate-400 text-xs uppercase font-mono">
                  <th className="text-left px-4 py-3">Parça Kodu</th>
                  <th className="text-left px-4 py-3">Ad</th>
                  <th className="text-left px-4 py-3">Adet</th>
                  <th className="text-left px-4 py-3">Hammadde</th>
                  <th className="text-left px-4 py-3">Ölçüler</th>
                  <th className="text-left px-4 py-3">Durum</th>
                  <th className="text-left px-4 py-3">Resim</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = STATUS_MAP[p.status];
                  return (
                    <tr key={p.id} data-testid={`table-row-${p.part_code}`} onClick={() => setDetail(p)}
                      className="border-b border-[#2A364F]/60 hover:bg-[#1A2234] cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-amber-400">{p.part_code}</td>
                      <td className="px-4 py-3 text-white">{p.part_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{p.quantity}</td>
                      <td className="px-4 py-3 text-slate-300">{p.material_type || "—"}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{p.material_dimensions || "—"}</td>
                      <td className="px-4 py-3"><Badge className={`${st.badge} font-mono text-xs`}>{st.label}</Badge></td>
                      <td className="px-4 py-3">{p.drawings?.length > 0 ? <span className="text-cyan-400 font-mono text-xs flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{p.drawings.length}</span> : <span className="text-slate-600">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-500 py-10 text-sm">Sonuç bulunamadı</p>}
          </div>
        )}
      </main>

      <PartFormModal open={formOpen} onOpenChange={setFormOpen} editPart={editPart} onSaved={applyCreate} />
      <PartDetailModal part={detail} open={!!detail} onOpenChange={(o) => !o && setDetail(null)}
        onUpdated={applyUpdate} onEdit={openEdit} onDelete={setDeleteTarget} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#131926] border-[#2A364F] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Parçayı sil?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              <span className="text-white font-mono">{deleteTarget?.part_code}</span> — {deleteTarget?.part_name} kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2A364F] text-slate-300 hover:bg-[#232D42] hover:text-white">Vazgeç</AlertDialogCancel>
            <AlertDialogAction data-testid="confirm-delete-button" onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 text-white">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatBig({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-[#131926] border border-[#2A364F] rounded-xl p-4 flex items-center justify-between" data-testid={`stat-${label}`}>
      <div>
        <p className="text-xs text-slate-500 uppercase font-mono tracking-wide">{label}</p>
        <p className={`font-heading text-3xl font-extrabold mt-1 ${accent}`}>{value}</p>
      </div>
      <Icon className={`w-8 h-8 ${accent} opacity-40`} />
    </div>
  );
}

function FilterSelect({ testid, value, onChange, placeholder, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-testid={testid} className="w-40 h-9 bg-[#131926] border-[#2A364F] text-sm text-slate-200">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-[#131926] border-[#2A364F] text-white max-h-64">
        <SelectItem value="all">Tüm {placeholder}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center" data-testid="empty-state">
      <div className="w-16 h-16 rounded-2xl bg-[#131926] border border-[#2A364F] flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="font-heading text-xl font-bold text-white">Henüz parça yok</h3>
      <p className="text-slate-400 text-sm mt-1 max-w-sm">İlk parçanı ekleyerek üretim takibine başla.</p>
      <Button onClick={onAdd} className="mt-5 bg-amber-500 text-[#0B0F17] hover:bg-amber-400 font-semibold">
        <Plus className="w-4 h-4 mr-1" /> Yeni Parça Ekle
      </Button>
    </div>
  );
}
