# ParçaTakip PRO — Ürün Gereksinim Dokümanı (PRD)

## Orijinal Problem
Ortak ağda çalışacak parça takip programı. Durum akışı: hammadde sipariş edildi → hammadde geldi → işleme alındı → üretim bitti → tesviyede → kalite kontrol → sevk alanında → sevk edildi. Parça teknik resmi yüklenebilmeli; adet, hammadde cinsi, hammadde ölçüleri alanları olmalı.

## Kullanıcı Tercihleri
- Giriş: Kullanıcı adı & şifre (JWT, httpOnly cookie) + "Oturumu açık tut"
- Kayıt kapalı; kullanıcıları yalnızca admin ekler. Roller: admin / user (RBAC)
- Teknik resim: PDF + resim + CAD (DWG/DXF/STEP)
- Durum geçmişi tutulacak (kim + ne zaman)
- Tasarım: endüstriyel koyu tema (agent seçti)

## Mimari
- Frontend: React (craco), Tailwind, shadcn/ui, lucide-react, sonner
- Backend: FastAPI + MongoDB (motor)
- Auth: Emergent Google Auth, session cookie (session_token)
- Dosya depolama: Emergent Object Storage (EMERGENT_LLM_KEY)

## Personalar
Atölye şefi, CNC operatörü, kalite kontrol uzmanı, sevkiyat sorumlusu, imalat müdürü.

## Uygulanan (2026-09-03)
- Google giriş + oturum yönetimi (/api/auth/session, /auth/me, /auth/logout)
- Parça CRUD (kod, ad, adet, hammadde cinsi, ölçüler, aciliyet, tezgah, müşteri, not)
- 8 aşamalı durum akışı + PATCH status ile geçmiş kaydı (kim/ne zaman/not)
- Teknik resim yükleme/indirme/silme (PDF, resim, DWG/DXF/STEP)
- Dashboard: istatistikler, Kanban pano (8 kolon), liste görünümü, arama
- Parça detay modalı: teknik resim önizleme (görsel/PDF), üretim hattı, durum geçmişi zaman çizelgesi
- Endüstriyel koyu tema, ortak ağ canlı senkron göstergesi
- 6 örnek parça seed edildi
- Termin takibi: parça teslim tarihi + panoda geciken/yaklaşan renkli uyarılar + "Geciken Termin" istatistiği
- Excel rapor dışa aktarımı (Parçalar + Durum Geçmişi sayfaları, openpyxl)
- CAD önizleme: STEP/DXF/STL/OBJ vb. tarayıcıda 3B/teknik görüntüleme; DWG için indirme fallback
- Sürükle-bırak Kanban: kartları kolonlar arası taşıyarak durum değiştirme
- Gecikme bildirimi: giriş anında toast + kırmızı uyarı bandı, "Sadece Gecikenler" filtresi
- Hızlı filtre çubuğu: müşteri / tezgah / aciliyet süzme + sonuç sayacı + temizle
- Kimlik doğrulama: kullanıcı adı/şifre JWT (httpOnly cookie), "oturumu açık tut", admin-only kullanıcı yönetimi (ekle/listele/sil), RBAC admin/user
- Testing agent: iterasyon 1 & 2 backend/frontend %100

## Backlog
- P1: Parçaya birden fazla operatör atama / bildirimler
- P2: Tarih bazlı filtre, gelişmiş raporlama (PDF)
- P2: DWG için sunucu tarafı dönüştürme (gerçek DWG önizleme)

## Sonraki Görevler
Kullanıcı geri bildirimine göre iterasyon.
