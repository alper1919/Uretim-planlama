import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, UserPlus, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";

function errText(detail) {
  if (detail == null) return "Bir hata oluştu";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function UserManagement({ open, onOpenChange, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", name: "", password: "", role: "user" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const res = await api.get("/users"); setUsers(res.data); }
    catch (e) { toast.error(errText(e.response?.data?.detail)); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (open) { load(); setForm({ username: "", name: "", password: "", role: "user" }); } }, [open]);

  const create = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) { toast.error("Kullanıcı adı ve şifre zorunludur"); return; }
    setSaving(true);
    try {
      await api.post("/users", form);
      toast.success("Kullanıcı oluşturuldu");
      setForm({ username: "", name: "", password: "", role: "user" });
      load();
    } catch (e) { toast.error(errText(e.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  const remove = async (u) => {
    if (!window.confirm(`${u.username} kullanıcısı silinsin mi?`)) return;
    try { await api.delete(`/users/${u.user_id}`); toast.success("Kullanıcı silindi"); load(); }
    catch (e) { toast.error(errText(e.response?.data?.detail)); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#131926] border-[#2A364F] text-white" data-testid="user-mgmt-modal">
        <DialogHeader><DialogTitle className="font-heading text-xl flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-400" /> Kullanıcı Yönetimi</DialogTitle></DialogHeader>

        <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end bg-[#0B0F17] border border-[#2A364F] rounded-lg p-4">
          <div className="space-y-1.5 sm:col-span-1">
            <Label className="text-slate-400 text-[11px] uppercase font-mono">Kullanıcı Adı</Label>
            <Input data-testid="new-user-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="operator1" className="bg-[#131926] border-[#2A364F]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-[11px] uppercase font-mono">Ad Soyad</Label>
            <Input data-testid="new-user-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ahmet Usta" className="bg-[#131926] border-[#2A364F]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-[11px] uppercase font-mono">Şifre</Label>
            <Input data-testid="new-user-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••" className="bg-[#131926] border-[#2A364F]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-[11px] uppercase font-mono">Rol</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger data-testid="new-user-role" className="bg-[#131926] border-[#2A364F]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#131926] border-[#2A364F] text-white">
                <SelectItem value="user">Kullanıcı</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button data-testid="create-user-button" type="submit" disabled={saving} className="bg-amber-500 text-[#0B0F17] hover:bg-amber-400 font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1" />} Ekle
          </Button>
        </form>

        <div className="mt-2 max-h-72 overflow-y-auto" data-testid="user-list">
          {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-amber-500 animate-spin" /></div> :
            users.map((u) => (
              <div key={u.user_id} data-testid={`user-row-${u.username}`} className="flex items-center gap-3 py-2.5 border-b border-[#2A364F]/60">
                <div className="w-9 h-9 rounded-full bg-[#232D42] flex items-center justify-center text-amber-400 font-bold">{(u.name || u.username).charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.name} <span className="text-slate-500 font-mono text-xs">@{u.username}</span></p>
                </div>
                <Badge className={u.role === "admin" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-600/20 text-slate-300 border-slate-600/40"}>{u.role === "admin" ? "Admin" : "Kullanıcı"}</Badge>
                {u.user_id !== currentUser?.user_id && (
                  <Button size="sm" variant="ghost" onClick={() => remove(u)} className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 w-8 p-0" data-testid={`delete-user-${u.username}`}><Trash2 className="w-4 h-4" /></Button>
                )}
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
