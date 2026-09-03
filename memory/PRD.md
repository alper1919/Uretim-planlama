# ParçaTakip PRO — Ürün Gereksinim Dokümanı (PRD)

## Orijinal Problem
Ortak ağda çalışacak parça takip programı. Durum akışı: hammadde sipariş edildi → hammadde geldi → işleme alındı → üretim bitti → tesviyede → kalite kontrol → sevk alanında → sevk edildi. Parça teknik resmi yüklenebilmeli; adet, hammadde cinsi, hammadde ölçüleri alanları olmalı.

## Kullanıcı Tercihleri
- Giriş: Google ile (Emergent-managed Google Auth)
- Rol yok, herkes aynı yetkide
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
- Testing agent: backend 100%, frontend 100%

## Backlog
- P1: Sürükle-bırak Kanban geçişleri
- P1: Parçaya birden fazla operatör atama / bildirimler
- P2: Excel/PDF rapor dışa aktarımı
- P2: Tarih bazlı filtre, teslim tarihi/termin takibi
- P2: DWG/CAD için gerçek görsel önizleme (viewer)

## Sonraki Görevler
Kullanıcı geri bildirimine göre iterasyon.
