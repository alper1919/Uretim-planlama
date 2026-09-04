import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Cog, ShieldCheck, Wifi, FileStack, Loader2, Lock, User as UserIcon } from "lucide-react";

function errText(detail) {
  if (detail == null) return "Bir hata oluştu, lütfen tekrar deneyin.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!loading && user) navigate("/app", { replace: true }); }, [user, loading, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username.trim(), password, remember);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(errText(err.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0F17]" data-testid="login-page">
      <div className="relative lg:w-1/2 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2A364F]">
        <img
          src="https://images.unsplash.com/photo-1735494033576-9c882e80504c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwyfHxjbmMlMjBtYWNoaW5pbmclMjBtZXRhbCUyMHBhcnRzJTIwaW5kdXN0cmlhbHxlbnwwfHx8fDE3ODg0NDExNTh8MA&ixlib=rb-4.1.0&q=85"
          alt="CNC işleme" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-[#0B0F17]/70" />
        <div className="relative z-10 p-8 sm:p-12 lg:p-16 h-full flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-amber-500 flex items-center justify-center"><Cog className="w-6 h-6 text-[#0B0F17]" /></div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-white">ParçaTakip<span className="text-amber-400"> PRO</span></span>
          </div>
          <div className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400/90">Ortak Ağ · Üretim Takip Sistemi</p>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.05]">Atölyeden sevkiyata<br />her parçayı canlı izle.</h1>
            <div className="flex flex-wrap gap-4 pt-2 text-slate-400 text-sm">
              <span className="flex items-center gap-2"><Wifi className="w-4 h-4 text-emerald-400" /> Ortak Ağ Senkron</span>
              <span className="flex items-center gap-2"><FileStack className="w-4 h-4 text-cyan-400" /> Teknik Resim</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400" /> Durum Geçmişi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">Giriş Yap</h2>
            <p className="text-slate-400 text-sm">Kullanıcı adı ve şifrenizle oturum açın.</p>
          </div>

          {error && <div data-testid="login-error" className="text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">{error}</div>}

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Kullanıcı Adı</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input data-testid="login-username" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="admin" autoFocus className="pl-9 bg-[#131926] border-[#2A364F] text-white h-11" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide font-mono">Şifre</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input data-testid="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="pl-9 bg-[#131926] border-[#2A364F] text-white h-11" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox data-testid="login-remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)}
              className="border-[#2A364F] data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" />
            <span className="text-sm text-slate-300">Oturumu açık tut</span>
          </label>

          <Button data-testid="login-submit" type="submit" disabled={busy}
            className="w-full h-11 bg-amber-500 text-[#0B0F17] hover:bg-amber-400 font-semibold text-base rounded-xl">
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Giriş Yap
          </Button>

          <p className="text-xs text-slate-500 leading-relaxed">
            Hesabınız yoksa yöneticinizden kullanıcı oluşturmasını isteyin. Kayıt (register) kapalıdır; kullanıcıları yalnızca admin ekler.
          </p>
        </form>
      </div>
    </div>
  );
}
