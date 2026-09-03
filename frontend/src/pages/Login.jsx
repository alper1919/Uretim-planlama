import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Cog, ShieldCheck, Wifi, FileStack } from "lucide-react";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0F17]" data-testid="login-page">
      {/* Left visual panel */}
      <div className="relative lg:w-1/2 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2A364F]">
        <img
          src="https://images.unsplash.com/photo-1735494033576-9c882e80504c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwyfHxjbmMlMjBtYWNoaW5pbmclMjBtZXRhbCUyMHBhcnRzJTIwaW5kdXN0cmlhbHxlbnwwfHx8fDE3ODg0NDExNTh8MA&ixlib=rb-4.1.0&q=85"
          alt="CNC işleme"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[#0B0F17]/70" />
        <div className="relative z-10 p-8 sm:p-12 lg:p-16 h-full flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-amber-500 flex items-center justify-center">
              <Cog className="w-6 h-6 text-[#0B0F17]" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-white">
              ParçaTakip<span className="text-amber-400"> PRO</span>
            </span>
          </div>
          <div className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400/90">
              Ortak Ağ · Üretim Takip Sistemi
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.05]">
              Atölyeden sevkiyata<br />her parçayı canlı izle.
            </h1>
            <p className="text-slate-300 text-base max-w-md">
              Hammadde siparişinden sevkiyata kadar 8 aşamalı üretim hattı, teknik resim arşivi ve tam
              durum geçmişi — tek ekranda.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-slate-400 text-sm">
              <span className="flex items-center gap-2"><Wifi className="w-4 h-4 text-emerald-400" /> Ortak Ağ Senkron</span>
              <span className="flex items-center gap-2"><FileStack className="w-4 h-4 text-cyan-400" /> Teknik Resim</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400" /> Durum Geçmişi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">Giriş Yap</h2>
            <p className="text-slate-400 text-sm">Devam etmek için Google hesabınla giriş yap.</p>
          </div>
          <Button
            data-testid="google-login-button"
            onClick={handleLogin}
            className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-base rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z"/>
            </svg>
            Google ile Giriş Yap
          </Button>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bu sistem yerel ortak ağda çalışır. Giriş yaparak durum değişikliklerinizin kaydınızla
            (isim & zaman) tutulacağını kabul edersiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
