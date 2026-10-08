# Prima RIB Content Plan v1.0

Aplikasi internal **Content Management & Production Workflow System** untuk tim Prima RIB (**CPNS, Sekdin, Polri, General**).

## Tech Stack
- **Frontend & App:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Database & Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Deployment Target:** GitHub $\rightarrow$ Vercel

## Struktur Folder
- `app/` — Route utama sesuai Sitemap (`/login`, `/dashboard`, `/content`, `/ideas`, `/calendar`, `/production`, `/review`, `/published`, `/analytics`, `/reports`, `/settings`)
- `components/` — Komponen Layout (`Sidebar`, `Header`, `AppShell`) dan UI (`Modal`)
- `lib/` — Konfigurasi Supabase (`client.ts`, `server.ts`), `auth.ts`, `constants.ts`, dan `utils.ts`
- `types/` — Definisi TypeScript untuk 16 tabel database (`database.ts`)
- `supabase/` — Script SQL untuk persiapan database (`schema.sql`, `rls.sql`, `seed.sql`)

## Menjalankan di Localhost
```bash
npm run dev
```
Buka `http://localhost:3000`. Selama pengembangan lokal, `NEXT_PUBLIC_LOCAL_DEMO_MODE=true` di `.env.local` memungkinkan simulasi seluruh fitur dan pergantian 6 Role User secara langsung tanpa harus membuat project Supabase terlebih dahulu.
