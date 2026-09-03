import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PRIORITIES } from "@/lib/statuses";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const empty = {
  part_code: "", part_name: "", quantity: 1, material_type: "", material_dimensions: "",
  priority: "normal", workstation: "", customer: "", notes: "", due_date: "",
};

const MATERIALS = ["Çelik 4140 (İslahlı)", "Çelik St37", "Paslanmaz 304", "Paslanmaz 316L",
  "Alüminyum 7075", "Alüminyum 6061", "Kestamid", "Bronz", "Döküm GG25", "Pirinç"];

export default function PartFormModal({ open, onOpenChange, editPart, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editPart ? {
        part_code: editPart.part_code, part_name: editPart.part_name, quantity: editPart.quantity,
        material_type: editPart.material_type, material_dimensions: editPart.material_dimensions,
        priority: editPart.priority, workstation: editPart.workstation,
        customer: editPart.customer || "", notes: editPart.notes, due_date: editPart.due_date || "",
      } : empty);
    }
  }, [open, editPart]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.part_code.trim() || !form.part_name.trim()) {
      toast.error("Parça kodu ve adı zorunludur");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, quantity: parseInt(form.quantity) || 1, due_date: form.due_date || null };
      let res;
      if (editPart) res = await api.put(`/parts/${editPart.id}`, payload);
      else res = await api.post("/parts", payload);
      toast.success(editPart ? "Parça güncellendi" : "Parça oluşturuldu");
      onSaved(res.data);
      onOpenChange(false);
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#131926] border-[#2A364F] text-white max-h-[90vh] overflow-y-auto" data-testid="part-form-modal">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {editPart ? "Parçayı Düzenle" : "Yeni Parça Ekle"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Parça Kodu *</Label>
            <Input data-testid="input-part-code" value={form.part_code} onChange={(e) => set("part_code", e.target.value)}
              placeholder="PRÇ-2026-042" className="bg-[#0B0F17] border-[#2A364F] font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Parça Adı *</Label>
            <Input data-testid="input-part-name" value={form.part_name} onChange={(e) => set("part_name", e.target.value)}
              placeholder="Redüktör Mil Flanşı" className="bg-[#0B0F17] border-[#2A364F]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Adet</Label>
            <Input data-testid="input-quantity" type="number" min="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)}
              className="bg-[#0B0F17] border-[#2A364F] font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Aciliyet</Label>
            <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger data-testid="select-priority" className="bg-[#0B0F17] border-[#2A364F]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#131926] border-[#2A364F] text-white">
                {PRIORITIES.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Hammadde Cinsi</Label>
            <Input data-testid="input-material-type" list="materials" value={form.material_type} onChange={(e) => set("material_type", e.target.value)}
              placeholder="Çelik 4140" className="bg-[#0B0F17] border-[#2A364F]" />
            <datalist id="materials">{MATERIALS.map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Hammadde Ölçüleri</Label>
            <Input data-testid="input-dimensions" value={form.material_dimensions} onChange={(e) => set("material_dimensions", e.target.value)}
              placeholder="Ø120x350 mm" className="bg-[#0B0F17] border-[#2A364F] font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Tezgah / İş İstasyonu</Label>
            <Input data-testid="input-workstation" value={form.workstation} onChange={(e) => set("workstation", e.target.value)}
              placeholder="CNC Torna 1" className="bg-[#0B0F17] border-[#2A364F]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Müşteri</Label>
            <Input data-testid="input-customer" value={form.customer} onChange={(e) => set("customer", e.target.value)}
              placeholder="Firma adı" className="bg-[#0B0F17] border-[#2A364F]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Teslim Tarihi (Termin)</Label>
            <Input data-testid="input-due-date" type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)}
              className="bg-[#0B0F17] border-[#2A364F] font-mono [color-scheme:dark]" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Notlar</Label>
            <Textarea data-testid="input-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="Ek açıklama…" className="bg-[#0B0F17] border-[#2A364F] resize-none" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white hover:bg-[#232D42]">İptal</Button>
          <Button data-testid="save-part-button" onClick={submit} disabled={saving}
            className="bg-amber-500 text-[#0B0F17] hover:bg-amber-400 font-semibold">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editPart ? "Kaydet" : "Oluştur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
