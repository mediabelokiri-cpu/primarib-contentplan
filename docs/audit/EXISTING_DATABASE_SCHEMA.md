# EXISTING DATABASE SCHEMA AUDIT
## PRIMA RIB CONTENT PLAN — AI-POWERED PLATFORM EXTENSION
**Document:** Database Schema, Tables, Constraints & Triggers Audit  
**Phase:** Phase 0 — Existing System Audit  
**Date:** 2026-11-06  
**Source Files:** `supabase/schema.sql`, `supabase/rls.sql`, `types/database.ts`, `app/api/cloud-state/route.ts`  

---

## 1. Overview Database Existing

Sistem database Prima RIB dirancang di atas PostgreSQL (Supabase) dengan 16 tabel relasional inti plus 1 tabel sinkronisasi cloud state (`primarib_cloud_state`).

Seluruh relasi foreign key telah dilengkapi constraint integritas (`on delete cascade` / `on delete set null`), auto-generated timestamps, trigger pembaruan `updated_at`, serta penomoran otomatis kode konten unik (`PR-YYYY-XXXX`).

---

## 2. Table-by-Table Inventory

### 2.1 User & Access Management Domain

#### 1. `profiles`
Menyimpan data identitas pengguna / anggota tim Prima RIB yang berelasi dengan `auth.users`.
- `id` (UUID, PK, references `auth.users(id)` on delete cascade)
- `full_name` (TEXT, NOT NULL)
- `email` (TEXT)
- `avatar_url` (TEXT)
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 2. `roles`
Menyimpan daftar peran di dalam sistem.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (TEXT, NOT NULL, UNIQUE) — Nilai: `'Admin'`, `'Content Planner'`, `'Copywriter'`, `'Designer'`, `'Video Editor'`, `'Reviewer'`
- `description` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 3. `user_roles`
Tabel relasi many-to-many antara user dan peran.
- `user_id` (UUID, PK/FK references `profiles(id)` on delete cascade)
- `role_id` (UUID, PK/FK references `roles(id)` on delete cascade)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

---

### 2.2 Master Data Domain

#### 4. `programs` (Wilayah Konten)
Menyimpan klaster program bimbingan belajar (CPNS, Kedinasan, Polri, General).
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (TEXT, NOT NULL)
- `code` (TEXT, NOT NULL, UNIQUE) — e.g. `'CPNS'`, `'SEKDIN'`, `'POLRI'`, `'GENERAL'`
- `description` (TEXT)
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 5. `content_pillars` (Pilar Konten)
Menyimpan klasifikasi tema konten Prima RIB.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (TEXT, NOT NULL, UNIQUE) — e.g. `'Informatif'`, `'Edukatif'`, `'Interaktif'`, `'Branding'`, `'Promosi'`, `'Strategi & Tips'`, `'Motivasi & Mentality'`
- `description` (TEXT)
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 6. `content_formats` (Format Konten)
Menyimpan tipe format postingan.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (TEXT, NOT NULL, UNIQUE) — e.g. `'Feed Foto'`, `'Karusel Foto'`, `'Reels Video'`
- `description` (TEXT)
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 7. `platforms`
Menyimpan channel distribusi media sosial.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (TEXT, NOT NULL) — e.g. `'Instagram'`, `'Facebook'`, `'TikTok'`
- `code` (TEXT, NOT NULL, UNIQUE) — e.g. `'IG'`, `'FB'`, `'TT'`
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 8. `campaigns`
Menyimpan payung kampanye bulanan atau tema mingguan.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (TEXT, NOT NULL)
- `description` (TEXT)
- `start_date` (DATE)
- `end_date` (DATE)
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

---

### 2.3 Core Content Production Domain

#### 9. `ideas` (Idea Bank)
Menyimpan bank ide sebelum dipromosikan ke tahap perencanaan konten terstruktur.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `program_id` (UUID, FK references `programs(id)` on delete set null)
- `pillar_id` (UUID, FK references `content_pillars(id)` on delete set null)
- `source` (TEXT)
- `priority` (TEXT, NOT NULL, DEFAULT 'MEDIUM', CHECK `priority in ('LOW', 'MEDIUM', 'HIGH')`)
- `status` (TEXT, NOT NULL, DEFAULT 'NEW', CHECK `status in ('NEW', 'SELECTED', 'PLANNED', 'ARCHIVED')`)
- `created_by` (UUID, FK references `profiles(id)` on delete set null)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 10. `contents` (Central Content Entity)
Entitas sentral seluruh konten yang diproduksi dan dijadwalkan.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `content_code` (TEXT, NOT NULL, UNIQUE, DEFAULT `public.generate_content_code()`)
- `title` (TEXT, NOT NULL)
- `short_title` (TEXT)
- `program_id` (UUID, FK references `programs(id)` on delete set null)
- `pillar_id` (UUID, FK references `content_pillars(id)` on delete set null)
- `format_id` (UUID, FK references `content_formats(id)` on delete set null)
- `campaign_id` (UUID, FK references `campaigns(id)` on delete set null)
- `objective` (TEXT)
- `target_audience` (TEXT)
- `angle` (TEXT)
- `priority` (TEXT, NOT NULL, DEFAULT 'MEDIUM', CHECK `priority in ('LOW', 'MEDIUM', 'HIGH')`)
- `status` (TEXT, NOT NULL, DEFAULT 'PLANNED', CHECK `status in ('PLANNED','BRIEF','PRODUCTION','REVIEW','REVISION','APPROVED','SCHEDULED','PUBLISHED','ARCHIVED')`)
- `hook` (TEXT)
- `main_content` (TEXT)
- `cta` (TEXT)
- `caption` (TEXT)
- `hashtags` (TEXT)
- `script` (TEXT)
- `creative_brief` (TEXT)
- `scheduled_at` (TIMESTAMPTZ)
- `source_idea_id` (UUID, FK references `ideas(id)` on delete set null)
- `created_by` (UUID, FK references `profiles(id)` on delete set null)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 11. `content_platforms`
Menyimpan relasi konten ke platform target beserta status publikasi per platform.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `content_id` (UUID, NOT NULL, FK references `contents(id)` on delete cascade)
- `platform_id` (UUID, NOT NULL, FK references `platforms(id)` on delete cascade)
- `scheduled_at` (TIMESTAMPTZ)
- `published_at` (TIMESTAMPTZ)
- `post_url` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `UNIQUE (content_id, platform_id)`

#### 12. `content_assignments`
Menyimpan penugasan PIC (Person-in-Charge) per peranan (Planner, Copywriter, Designer, Video Editor, Reviewer).
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `content_id` (UUID, NOT NULL, FK references `contents(id)` on delete cascade)
- `user_id` (UUID, NOT NULL, FK references `profiles(id)` on delete cascade)
- `assignment_type` (TEXT, NOT NULL, CHECK `assignment_type in ('PLANNER','COPYWRITER','DESIGNER','VIDEO_EDITOR','REVIEWER')`)
- `task_notes` (TEXT)
- `deadline` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `UNIQUE (content_id, assignment_type)`

#### 13. `content_assets`
Menyimpan referensi file aset di Supabase Storage (Desain, Video, Thumbnail, Dokumen).
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `content_id` (UUID, NOT NULL, FK references `contents(id)` on delete cascade)
- `asset_type` (TEXT, NOT NULL, CHECK `asset_type in ('DESIGN','VIDEO','THUMBNAIL','DOCUMENT','OTHER')`)
- `file_name` (TEXT, NOT NULL)
- `file_path` (TEXT, NOT NULL)
- `file_url` (TEXT)
- `uploaded_by` (UUID, FK references `profiles(id)` on delete set null)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 14. `content_reviews`
Menyimpan riwayat review dan revisi.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `content_id` (UUID, NOT NULL, FK references `contents(id)` on delete cascade)
- `reviewer_id` (UUID, FK references `profiles(id)` on delete set null)
- `decision` (TEXT, NOT NULL, CHECK `decision in ('APPROVED','REVISION')`)
- `comment` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 15. `content_analytics`
Menyimpan data metrik performa setelah konten dipublikasikan.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `content_platform_id` (UUID, NOT NULL, FK references `content_platforms(id)` on delete cascade)
- `views` (BIGINT, NOT NULL, DEFAULT 0)
- `reach` (BIGINT, NOT NULL, DEFAULT 0)
- `likes` (BIGINT, NOT NULL, DEFAULT 0)
- `comments` (BIGINT, NOT NULL, DEFAULT 0)
- `shares` (BIGINT, NOT NULL, DEFAULT 0)
- `saves` (BIGINT, NOT NULL, DEFAULT 0)
- `followers` (BIGINT, NOT NULL, DEFAULT 0)
- `engagement_rate` (NUMERIC(8,2))
- `recorded_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

#### 16. `content_activity`
Menyimpan audit trail aktivitas konten (pembuatan, perubahan status, komentar).
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `content_id` (UUID, NOT NULL, FK references `contents(id)` on delete cascade)
- `user_id` (UUID, FK references `profiles(id)` on delete set null)
- `action` (TEXT, NOT NULL)
- `description` (TEXT)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

---

### 2.4 Cloud Sync Extension Table

#### 17. `primarib_cloud_state`
Tabel single-row untuk sinkronisasi state aplikasi lintas peramban dan perangkat.
- `id` (TEXT, PK) — Default value: `'primarib_main_v1'`
- `state_json` (JSONB, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

---

## 3. Indexes & Constraints

Daftar index performa yang sudah dibuat:
- `idx_contents_status` ON `contents(status)`
- `idx_contents_program` ON `contents(program_id)`
- `idx_contents_pillar` ON `contents(pillar_id)`
- `idx_contents_scheduled_at` ON `contents(scheduled_at)`
- `idx_contents_created_by` ON `contents(created_by)`
- `idx_content_platforms_platform` ON `content_platforms(platform_id)`
- `idx_content_assignments_user` ON `content_assignments(user_id)`
- `idx_content_activity_content` ON `content_activity(content_id)`
- `idx_ideas_status` ON `ideas(status)`
- `idx_ideas_program` ON `ideas(program_id)`

---

## 4. Functions & Triggers

1. `handle_updated_at()`: Otomatis memperbarui kolom `updated_at` setiap kali ada operasi UPDATE pada seluruh tabel yang relevan.
2. `generate_content_code()`: Otomatis membuat kode referensi unik konten dengan format `PR-YYYY-XXXX` menggunakan PostgreSQL sequence `content_code_seq`.
3. `handle_new_auth_user()`: Trigger `after insert on auth.users` untuk membuat record baru secara otomatis di `public.profiles`.

---

## 5. Row-Level Security (RLS) Status

Sesuai `supabase/rls.sql`:
- RLS diaktifkan (`alter table ... enable row level security`) pada ke-16 tabel.
- Kebijakan SELECT terbuka untuk pengguna yang terotentikasi (`auth.role() = 'authenticated'`).
- Kebijakan INSERT/UPDATE/DELETE dibatasi berdasarkan peran (Admin dan PIC terkait).
