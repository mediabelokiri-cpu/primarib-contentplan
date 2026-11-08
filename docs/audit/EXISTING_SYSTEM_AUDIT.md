# EXISTING SYSTEM AUDIT
## PRIMA RIB CONTENT PLAN — AI-POWERED PLATFORM EXTENSION
**Document:** System Architecture, Codebase & Component Audit  
**Phase:** Phase 0 — Existing System Audit  
**Date:** 2026-11-06  
**Status:** Completed & Verified  

---

## 1. Executive Summary

Aplikasi **Prima RIB Content Plan** saat ini merupakan aplikasi berbasis web yang berfungsi penuh untuk perencanaan, penyusunan jadwal, kanban produksi, review, pelaporan, dan ekspor kalender konten digital untuk bimbingan belajar Prima RIB (fokus CPNS, Sekolah Kedinasan, dan Polri).

Audit ini dilakukan sebelum mengimplementasikan **PRD & Target ERD v1.0** untuk memastikan tidak ada fitur, data, skema, atau alur kerja aktif yang rusak, terhapus, atau terdegradasi.

---

## 2. Technology Stack & Environment

| Layer | Komponen / Versi | Catatan |
|---|---|---|
| **Framework** | Next.js 15.3.2 (App Router) | Menggunakan Server Components dan Client Components (`"use client"`). |
| **Language** | TypeScript 5.8.3 | Konfigurasi ketat (`tsconfig.json`), target ES2017. |
| **UI Library** | React 19.1.0 & React DOM 19.1.0 | Menggunakan hooks modern (`useState`, `useEffect`, `useCallback`). |
| **Styling** | Tailwind CSS v4.1.7 (`@tailwindcss/postcss`) | CSS Variables dan utility classes di `app/globals.css`. |
| **Icons** | Lucide React v0.511.0 | Set icon konsisten di seluruh navigasi dan indikator. |
| **Database & Auth** | Supabase JS (`@supabase/supabase-js` v2.49.4) & `@supabase/ssr` (v0.6.1) | Supabase Cloud (`daspzztaezihzknwncxt.supabase.co`). |
| **State Sync** | Hybrid Store (Local Storage + Supabase Cloud REST Proxy) | Proxy route `/api/cloud-state` untuk menghindari issue CORS browser. |
| **Deployment** | Vercel & GitHub | Sinkronisasi repositori otomatis pada branch `main`. |

---

## 3. Application Directory & Routing Structure

Struktur direktori dan seluruh rute halaman aktif (`app/`):

```
app/
├── (auth)
│   └── login/page.tsx               # Login & Role Switcher
├── (main)
│   ├── layout.tsx                   # Root layout, AppShell, font styling, metadata
│   ├── page.tsx                     # Entrypoint redirect ke /dashboard
│   ├── dashboard/page.tsx           # Dashboard statistik, progress mingguan, card filters
│   ├── content/page.tsx             # Input Konten (Form Script, Poin/Slide, Master Ide)
│   ├── ideas/page.tsx               # Idea Bank (Kurasi ide konten baru, status ide)
│   ├── production/page.tsx          # Production Board (Kanban drag-and-drop & tanggal)
│   ├── calendar/page.tsx            # Schedule Post (Kalender grid, cetak PDF 1-halaman A4)
│   ├── review/page.tsx              # Quality Gate & Approval (Reviewer, revisi, feedback)
│   ├── published/page.tsx           # Arsip Konten Tayang & tautan live post
│   ├── reports/page.tsx             # Laporan performa bulanan & rekapitulasi tim
│   ├── analytics/page.tsx           # Metrik keterlibatan (Reach, Views, Engagement)
│   ├── settings/page.tsx            # Master Data (Wilayah/Program, Pilar, Format, Platform)
│   └── talent/page.tsx              # Mobile-First View-Only Schedule untuk Talent
└── api/
    └── cloud-state/route.ts         # Route Handler Server-side Sync ke Supabase
```

### Component Structure:
- `components/layout/AppShell.tsx`: Wrapper utama yang mengelola sidebar responsive, status user aktif, dan modal global.
- `components/layout/Header.tsx`: Header atas dengan pencarian cepat, notifikasi, indikator peran user, dan sinkronisasi cloud.
- `components/layout/Sidebar.tsx`: Navigasi menu utama, shortcut cepat ("Buat Konten Baru"), link `/talent`, dan ringkasan jadwal mingguan.
- `components/content/AiAssistantModal.tsx`: Asisten modal awal (Idea generator, Hook generator, Reel generator berbasis rule).
- `components/ui/Modal.tsx`: Komponen modal dialog accessible dan reusable.

---

## 4. State Management & Cloud Sync Architecture

1. **State Store (`lib/store.ts`):**
   - Mendefinisikan struktur `AppDatabaseState` yang mencakup:
     - `users`, `programs`, `pillars`, `formats`, `platforms`, `campaigns`
     - `ideas`, `contents`, `contentPlatforms`, `contentAssignments`
     - `contentAssets`, `contentReviews`, `contentAnalytics`, `contentActivities`
   - Menyediakan fungsi-fungsi mutasi terisolasi: `createContentAction`, `updateContentAction`, `scheduleContentAction`, `submitReviewDecisionAction`, dll.
2. **Persistence Layer:**
   - **Local Cache:** Disimpan di browser `localStorage` dengan key `primarib_content_plan_store_v3_simplified`.
   - **Cloud Sync:** Disinkronkan ke tabel Supabase `primarib_cloud_state` menggunakan endpoint server-side `/api/cloud-state`.
   - **Auto-Sync:** Event listener `storage`, `focus`, dan polling interval 6 detik untuk memastikan perangkat talent di `/talent` selalu sinkron tanpa refresh manual.

---

## 5. User Roles and Access Control (RBAC)

Dikelola melalui `lib/auth.ts` dan tabel `roles` & `user_roles`:

1. **Admin (`idam@primarib.com`):** Akses penuh ke seluruh menu, konfigurasi master, penghapusan permanen, dan review.
2. **Content Planner (`planner@primarib.com`):** Perencanaan ide, penyusunan kalender, pembagian tugas (assignment), dan settings.
3. **Copywriter (`copywriter@primarib.com`):** Penyusunan hook, caption, script, dan hashtag.
4. **Designer (`designer@primarib.com`):** Akses brief desain dan upload aset grafis/karusel.
5. **Video Editor (`editor@primarib.com`):** Akses script video, scene, and upload aset reels/video.
6. **Reviewer (`reviewer@primarib.com`):** Melakukan review, memberikan catatan revisi, dan menyetujui (approve) konten.

---

## 6. Visual Theme & Format Classification

Aplikasi menerapkan 5 tema kartu konten yang telah distandarisasi di seluruh halaman (`/dashboard`, `/content`, `/production`, `/calendar`, `/talent`):
1. **Reel • Talent Model:** Purple (`#7E60FF` / `#ECE7FF`)
2. **Reel • Mentor / Pengajar:** Blue (`#2B7FFF` / `#E5F3FF`)
3. **Reel • Siswa:** Orange (`#F97316` / `#FFF0E5`)
4. **Feed • Carousel:** Emerald (`border-emerald-400` / `bg-emerald-50`)
5. **Feed • Single Post:** Pink/Rose (`border-pink-400` / `bg-pink-50`)

Brand Assets:
- Logo resmi: `public/logo.png` (sumber `Untitled-1.png`).
- Warna primer brand: Navy `#284078`, Secondary Yellow `#DDB02E`, Purple Accent `#6D4AFF`.

---

## 7. Audit Kesimpulan & Kesiapan Upgrade

Sistem existing berada dalam status **STABLE, DEPLOYED, and IN-USE**.
- Seluruh routing App Router berjalan normal.
- Tidak ditemukan circular dependency pada store maupun hooks.
- Sistem siap diperluas ke **Phase 1 (Brand Studio)** dan **Phase 2 (Hybrid AI Infrastructure)** dengan pendekatan *additive* (menambah modul baru tanpa merombak kode existing).
