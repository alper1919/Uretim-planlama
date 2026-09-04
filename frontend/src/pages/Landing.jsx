import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Cog, ArrowRight, Wifi, LayoutGrid, FileStack, CalendarClock, History,
  Filter, FileSpreadsheet, ShieldCheck, MousePointerClick, CheckCircle2,
  Boxes, Ruler, Layers, LogIn,
} from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1666634157070-6fd830fb5672?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwyfHxDTkMlMjBtYWNoaW5pbmclMjBtZXRhbCUyMGluZHVzdHJpYWwlMjBmYWN0b3J5fGVufDB8fHx8MTc4ODUwMjE5N3ww&ixlib=rb-4.1.0&q=85";
const IMG_SPARKS = "https://images.unsplash.com/photo-1593106410288-caf65eca7c9d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwzfHxDTkMlMjBtYWNoaW5pbmclMjBtZXRhbCUyMGluZHVzdHJpYWwlMjBmYWN0b3J5fGVufDB8fHx8MTc4ODUwMjE5N3ww&ixlib=rb-4.1.0&q=85";

const STAGES = ["Hammadde Sipariş", "Hammadde Geldi", "İşleme Alındı", "Üretim Bitti", "Tesviyede", "Kalite Kontrol", "Sevk Alanında", "Sevk Edildi"];
const STAGE_COLORS = ["#F59E0B", "#3B82F6", "#EA580C", "#6366F1", "#A855F7", "#06B6D4", "#14B8A6", "#10B981"];

const FEATURES = [
  { icon: LayoutGrid, color: "#F59E0B", title: "8 Aşamalı Üretim Panosu", desc: "Hammadde siparişinden sevkiyata kadar her parçayı Kanban panosunda canlı izleyin. Pano ve liste görünümü." },
  { icon: MousePointerClick, color: "#3B82F6", title: "Sürükle-Bırak Durum", desc: "Kartları kolonlar arasında sürükleyerek parçanın üretim aşamasını tek hamlede güncelleyin." },
  { icon: FileStack, color: "#06B6D4", title: "Teknik Resim Arşivi", desc: "Her parçaya PDF, resim ve CAD (DXF/STEP) yükleyin. PDF'ler tarayıcıda, 3B modeller görüntüleyicide açılır." },
  { icon: CalendarClock, color: "#EF4444", title: "Termin Takibi & Uyarı", desc: "Teslim tarihi girin; geciken ve yaklaşan işler panoda kırmızı/turuncu uyarı ve özet bandıyla öne çıkar." },
  { icon: History, color: "#A855F7", title: "Durum Geçmişi", desc: "Her aşama değişikliğinin kim tarafından ne zaman yapıldığı zaman çizelgesinde kayıt altına alınır." },
  { icon: Filter, color: "#14B8A6", title: "Hızlı Filtre & Arama", desc: "Müşteri, tezgah, aciliyet ve sipariş no ile anında süzün; canlı sonuç sayacıyla görün." },
  { icon: FileSpreadsheet, color: "#10B981", title: "Excel Rapor", desc: "Parça listesini ve tüm durum geçmişini tek tıkla Excel/CSV olarak dışa aktarın." },
  { icon: ShieldCheck, color: "#F97316", title: "Kullanıcı Yönetimi", desc: "Kullanıcı adı & şifre ile güvenli giriş, 'oturumu açık tut' ve admin'e özel kullanıcı/rol yönetimi." },
];

const SPECS = [
  { icon: Boxes, label: "Adet" }, { icon: Layers, label: "Hammadde Cinsi" },
  { icon: Ruler, label: "Hammadde Ölçüleri" }, { icon: FileStack, label: "Teknik Resim" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const enter = () => navigate(user ? "/app" : "/login");

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white overflow-x-hidden" data-testid="landing-page">
      {/* Header */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${scrolled ? "bg-[#0B0F17]/90 backdrop-blur-xl border-b border-[#2A364F]" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center"><Cog className="w-6 h-6 text-[#0B0F17]" /></div>
            <span className="font-heading font-extrabold text-lg tracking-tight">ParçaTakip<span className="text-amber-400"> PRO</span></span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#ozellikler" className="hidden sm:inline text-sm text-slate-300 hover:text-white px-3 py-2">Özellikler</a>
            <a href="#akis" className="hidden sm:inline text-sm text-slate-300 hover:text-white px-3 py-2">Nasıl Çalışır</a>
            <Button data-testid="header-login-btn" onClick={enter} className="bg-amber-500 text-[#0B0F17] hover:bg-amber-400 font-semibold rounded-xl">
              <LogIn className="w-4 h-4 mr-1.5" /> {user ? "Uygulamaya Gir" : "Giriş Yap"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 z-0">
          <img src={HERO} alt="CNC üretim" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17]/80 via-[#0B0F17]/85 to-[#0B0F17]" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 mb-6 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300">Ortak Ağ · Üretim Takip Sistemi</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight animate-fade-up" style={{ animationDelay: "60ms" }}>
              Atölyeden sevkiyata<br /><span className="text-amber-400">her parçayı</span> canlı izle.
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl animate-fade-up" style={{ animationDelay: "120ms" }}>
              Hammadde siparişinden sevke kadar 8 aşamalı üretim hattı, teknik resim arşivi, termin takibi ve
              tam durum geçmişi — tek ekranda, ortak ağda çalışan modern bir sistem.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "180ms" }}>
              <Button data-testid="hero-cta" onClick={enter} className="h-12 px-6 bg-amber-500 text-[#0B0F17] hover:bg-amber-400 font-semibold text-base rounded-xl">
                {user ? "Uygulamaya Gir" : "Hemen Başla"} <ArrowRight className="w-5 h-5 ml-1.5" />
              </Button>
              <a href="#ozellikler"><Button variant="outline" className="h-12 px-6 bg-transparent border-[#2A364F] text-slate-200 hover:bg-[#1A2234] hover:text-white rounded-xl text-base">Özellikleri Keşfet</Button></a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400 animate-fade-up" style={{ animationDelay: "240ms" }}>
              {["Kurulum gerektirmez", "Tarayıcıdan çalışır", "Ortak ağ senkron"].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-[#2A364F] bg-[#131926]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[["8", "Üretim Aşaması"], ["4", "Parça Özelliği"], ["100%", "Tarayıcı Tabanlı"], ["7/24", "Canlı Takip"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <div className="font-heading text-3xl sm:text-4xl font-extrabold text-amber-400">{v}</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-mono uppercase tracking-wide">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="max-w-2xl mb-14">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400/90 mb-3">Tüm Fonksiyonlar</p>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Üretimi baştan sona yöneten<br />tek bir kontrol merkezi.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} data-testid={`feature-${i}`}
              className="group bg-[#131926] border border-[#2A364F] rounded-2xl p-6 hover:border-amber-500/40 hover:bg-[#1A2234] transition-colors">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${f.color}1a`, border: `1px solid ${f.color}55` }}>
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow pipeline */}
      <section id="akis" className="bg-[#131926] border-y border-[#2A364F]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400/90 mb-3">Üretim Akışı</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">Her parça 8 net aşamadan geçer.</h2>
              <div className="space-y-2.5">
                {STAGES.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 bg-[#0B0F17] border border-[#2A364F] rounded-xl px-4 py-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold flex-shrink-0"
                      style={{ background: `${STAGE_COLORS[i]}1a`, color: STAGE_COLORS[i], border: `1px solid ${STAGE_COLORS[i]}55` }}>{i + 1}</span>
                    <span className="text-sm font-medium">{s}</span>
                    {i < STAGES.length - 1 && <div className="ml-auto text-slate-600"><ArrowRight className="w-4 h-4" /></div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-[#2A364F]">
                <img src={IMG_SPARKS} alt="İşleme" className="w-full h-72 object-cover" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {SPECS.map((s) => (
                  <div key={s.label} className="bg-[#0B0F17] border border-[#2A364F] rounded-xl p-4">
                    <s.icon className="w-5 h-5 text-amber-400 mb-2" />
                    <div className="text-sm text-slate-200">{s.label}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">parça kaydında</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#1A2234] to-[#131926] p-10 sm:p-16 text-center">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-6"><Cog className="w-8 h-8 text-[#0B0F17]" /></div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Üretim takibine bugün başlayın.</h2>
            <p className="text-slate-300 text-lg mb-8">Tarayıcınızdan giriş yapın, parçalarınızı ekleyin ve tüm atölyeyi tek ekrandan yönetin.</p>
            <Button data-testid="cta-enter" onClick={enter} className="h-13 px-8 py-3 bg-amber-500 text-[#0B0F17] hover:bg-amber-400 font-semibold text-base rounded-xl">
              {user ? "Uygulamaya Gir" : "Giriş Yap ve Başla"} <ArrowRight className="w-5 h-5 ml-1.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A364F]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center"><Cog className="w-5 h-5 text-[#0B0F17]" /></div>
            <span className="font-heading font-bold">ParçaTakip<span className="text-amber-400"> PRO</span></span>
          </div>
          <p className="text-xs text-slate-500 font-mono flex items-center gap-2"><Wifi className="w-3.5 h-3.5 text-emerald-400" /> Ortak Ağ · Üretim & İmalat Takip Sistemi</p>
        </div>
      </footer>
    </div>
  );
}
