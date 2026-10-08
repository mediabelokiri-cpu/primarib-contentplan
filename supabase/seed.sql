-- ============================================================================
-- PRIMA RIB CONTENT PLAN v1.0
-- FILE 3: SEED DATA (ROLES, PROGRAMS, PILLARS, FORMATS, PLATFORMS, CAMPAIGNS)
-- ============================================================================

-- 1. ROLES (6 Roles)
insert into public.roles (name, description) values
  ('Admin', 'Mengelola seluruh sistem dan manajemen user'),
  ('Content Planner', 'Merencanakan dan mengelola konten, ide, kalender, dan assignment'),
  ('Copywriter', 'Membuat copy, hook, caption, CTA, dan script'),
  ('Designer', 'Membuat dan mengupload asset visual / desain'),
  ('Video Editor', 'Membuat dan mengupload asset video / reels / tiktok'),
  ('Reviewer', 'Memeriksa, meminta revisi, dan menyetujui (approve) konten')
on conflict (name) do nothing;

-- 2. PROGRAMS (4 Core Programs)
insert into public.programs (name, code, description) values
  ('CPNS', 'CPNS', 'Fokus Minggu 1: SKD (TWK, TIU, TKP), Formasi & Persiapan CPNS'),
  ('Sekolah Kedinasan', 'SEKDIN', 'Fokus Minggu 2: PKN STAN, IPDN, Polstat STIS, Poltekim/Poltekip & SKD Kedinasan'),
  ('Polri', 'POLRI', 'Fokus Minggu 3: Akpol, Bintara, Tamtama, Psikotes Kecermatan, Akademik & Kesamaptaan'),
  ('General', 'GENERAL', 'Fokus Minggu 4: General, Strategi Mental, Manajemen Waktu & Konversi Kelas Prima RIB')
on conflict (code) do nothing;

-- 3. CONTENT PILLARS (Sesuai Master Content Plan & Schedule Post Prima RIB)
insert into public.content_pillars (name, description) values
  ('Informatif', 'Senin (Feed/Karusel): Info & News, Update Formasi, Syarat & Dokumen, Alur Pendaftaran, FAQ'),
  ('Edukatif', 'Selasa (Reels) & Rabu (Karusel): Deep-Dive Materi, Trik Jawab Soal, Psikotes & Kesamaptaan'),
  ('Interaktif', 'Kamis (Reels): Kuis Kilat, Poling, Tanya Jawab (Q&A) Mitos vs Fakta, This or That, & Konten Relatable'),
  ('Branding', 'Jumat (Feed): Profil Pengajar/Tentor Ahli, Fasilitas Lab CAT, Suasana Kelas, & Testimoni Alumni'),
  ('Promosi', 'Jumat Minggu 4 (Feed): Info Pembukaan Kelas Baru, Diskon Pendaftaran & Konversi Batch Baru'),
  ('Strategi & Tips', 'Strategi belajar 30-60-90 hari, manajemen waktu ujian, dan rutinitas belajar efektif'),
  ('Motivasi & Mentality', 'Quotes pejuang, cerita gagal-bangkit-lolos, dan penguatan mental menghadapi ujian')
on conflict (name) do nothing;

-- 4. CONTENT FORMATS (Sesuai Master Content Plan Prima RIB)
insert into public.content_formats (name, description) values
  ('Feed Foto', 'Single Image / Karusel 3–5 Slide untuk jadwal hari Senin & Jumat'),
  ('Karusel Foto', 'Slide Carousel Edukatif / Deep-Dive (3–6 Slide) untuk jadwal hari Rabu, Senin & Jumat'),
  ('Reels Video', 'Short Vertical Video (20–40 Detik) Edukatif & Interaktif untuk jadwal hari Selasa & Kamis (IG/FB/TT)')
on conflict (name) do nothing;

-- 5. PLATFORMS (Output IG/FB/TT)
insert into public.platforms (name, code) values
  ('Instagram', 'IG'),
  ('Facebook', 'FB'),
  ('TikTok', 'TT')
on conflict (code) do nothing;

-- 6. CAMPAIGNS (Rotasi 4 Minggu)
insert into public.campaigns (name, description, start_date, end_date, is_active) values
  ('Minggu 1 — Fokus CPNS / Fleksibel', 'Rotasi Minggu 1: Update Dokumen CPNS, Trik TIU Deret, Perbandingan TIU/TKP, Kuis TWK Pancasila, & Profil Tentor', '2026-10-05', '2026-10-09', true),
  ('Minggu 2 — Fokus Sekolah Kedinasan / Fleksibel', 'Rotasi Minggu 2: Perbandingan 4 Sekdin, Tips SKD Pemula, 3 Kesalahan TKP, Poling SKD, & Fasilitas Lab CAT', '2026-10-12', '2026-10-16', true),
  ('Minggu 3 — Fokus Polri / Fleksibel', 'Rotasi Minggu 3: Syarat Fisik & Berkas Polri, Tips Psikotes & Kesamaptaan, Kecermatan Angka, Q&A Mitos/Fakta, & Testimoni', '2026-10-19', '2026-10-23', true),
  ('Minggu 4 — Fokus General & Konversi', 'Rotasi Minggu 4: FAQ Prima RIB, Strategi Mental Hari H, 4 Aturan Manajemen Waktu, This or That, & Promo Kelas Baru', '2026-10-26', '2026-10-30', true);

