# DATABASE MAPPING SPECIFICATION
## TARGET ERD v1.0 TO EXISTING SUPABASE PHYSICAL SCHEMA
**Document:** Logical-to-Physical Entity Mapping & Migration Plan  
**Phase:** Phase 0 — Existing System Audit  
**Date:** 2026-11-06  
**Status:** Approved for Incremental Migration  

---

## 1. Guiding Principles & Strategy

Sesuai instruksi PRD Bab 2 dan ERD Bab 1.1:
1. **Tidak Ada Duplicate Content Entities:** Tabel `contents` dan `ideas` existing tetap menjadi entitas sentral.
2. **Zero Breaking Changes:** Tidak ada tabel atau kolom existing yang dihapus atau diubah tipe datanya.
3. **Pemberian Kolom Baru Bersifat Nullable:** Seluruh kolom baru pada tabel existing diberi default value atau nullable agar data yang sudah berjalan tidak corrupt.
4. **Enkripsi Credentials Server-Side:** Kunci API provider AI disimpan di environment server atau `ai_providers.configuration` yang terisolasi dan diproteksi RLS tingkat tinggi.

---

## 2. Domain-by-Domain Mapping Table

| Domain Target ERD | Entitas Target ERD | Status dalam Sistem Existing | Keputusan Arsitektur & Tindakan |
|---|---|---|---|
| **1. Brand Management** | `brand_profiles` | Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk identitas Prima RIB. |
| | `brand_personalities` | Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk karakter brand. |
| | `brand_tone_guidelines` | Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk aturan tone of voice. |
| | `brand_audiences` | Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk target CPNS, Sekdin, Polri. |
| | `brand_products` | Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk detail paket bimbel. |
| | `content_pillars` | **SUDAH ADA** (`public.content_pillars`) | **REUSE & EXTEND** — Pertahankan tabel existing. Tambahkan kolom nullable `brand_id`, `objectives`, `recommended_topics`. |
| | `brand_writing_guidelines`| Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk pedoman penulisan. |
| | `brand_visual_guidelines` | Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk visual direction. |
| **2. Brand Knowledge** | `brand_documents` | Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk upload dokumen (PDF/DOCX). |
| | `brand_knowledge` | Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk data pengetahuan terstruktur. |
| | `brand_document_chunks` | Belum ada | **NEW TABLE** — Dibuat di Phase 1 untuk RAG chunking & search. |
| **3. AI Provider** | `ai_providers` | Belum ada | **NEW TABLE** — Dibuat di Phase 2 untuk OpenAI, Gemini, Claude. |
| | `ai_models` | Belum ada | **NEW TABLE** — Dibuat di Phase 2 untuk registrasi model dan tarif. |
| | `ai_task_routes` | Belum ada | **NEW TABLE** — Dibuat di Phase 2 untuk routing model per task. |
| **4. AI Prompt** | `ai_prompt_templates` | Belum ada | **NEW TABLE** — Dibuat di Phase 2 untuk template prompt. |
| | `ai_prompt_versions` | Belum ada | **NEW TABLE** — Dibuat di Phase 2 untuk audit & snapshot prompt. |
| **5. AI Monitoring** | `ai_generation_logs` | Belum ada | **NEW TABLE** — Dibuat di Phase 2 untuk token, cost & log request. |
| | `ai_usage_limits` | Belum ada | **NEW TABLE** — Dibuat di Phase 7 untuk limit kuota. |
| | `ai_feedback` | Belum ada | **NEW TABLE** — Dibuat di Phase 7 untuk rating user. |
| **6. Content Strategy** | `content_ideas` | **SUDAH ADA** (`public.ideas`) | **REUSE & EXTEND** — Jangan buat tabel duplikat. Cukup tambahkan kolom `hook`, `content_angle`, `target_audience_id`, `product_id`, `source_type`, `generation_log_id`. |
| | `content_campaigns` | **SUDAH ADA** (`public.campaigns`) | **REUSE & EXTEND** — Pertahankan tabel existing. Tambahkan kolom `audience_id`, `product_id`, `key_message`. |
| | `campaign_ideas` | Belum ada | **NEW TABLE** — Tabel pivot relasi campaign ke ideas. |
| **7. Script Production** | `content_scripts` | Belum ada terpisah | **NEW TABLE** — Dibuat di Phase 4 untuk script multi-format, berelasi ke `contents(id)`. |
| | `script_versions` | Belum ada | **NEW TABLE** — Dibuat di Phase 4 untuk riwayat revisi script AI. |
| | `script_sections` | Opsional (JSONB) | Gunakan JSONB di `content_scripts` terlebih dahulu sesuai ERD Bab 9.3. |
| **8. QC & Brief** | `creative_briefs` | Belum ada terpisah | **NEW TABLE** — Dibuat di Phase 5, berelasi ke `contents(id)`. |
| | `content_quality_checks` | Belum ada | **NEW TABLE** — Dibuat di Phase 5 untuk skor AI Quality Checker. |
| **9. Existing Workflow** | `contents` | **SUDAH ADA** (`public.contents`) | **REUSE & EXTEND** — Tambahkan kolom `source_type` ('MANUAL' / 'AI_ASSISTED'), `active_script_id`, `generation_log_id`. |
| | `content_platforms` | **SUDAH ADA** | **TIDAK ADA PERUBAHAN** — 100% kompatibel. |
| | `content_assignments` | **SUDAH ADA** | **TIDAK ADA PERUBAHAN** — 100% kompatibel. |
| | `content_assets` | **SUDAH ADA** | **TIDAK ADA PERUBAHAN** — 100% kompatibel. |
| | `content_reviews` | **SUDAH ADA** | **TIDAK ADA PERUBAHAN** — 100% kompatibel. |
| | `content_analytics` | **SUDAH ADA** | **TIDAK ADA PERUBAHAN** — 100% kompatibel. |
| | `content_activity` | **SUDAH ADA** | **TIDAK ADA PERUBAHAN** — 100% kompatibel. |
| | `primarib_cloud_state` | **SUDAH ADA** | **TIDAK ADA PERUBAHAN** — Sinkronisasi cloud tetap beroperasi normal. |

---

## 3. Schema Alterations on Existing Tables (Non-Destructive)

Berikut adalah query DDL penambahan kolom yang akan dijalankan pada fase integrasi (semua kolom opsional/nullable):

```sql
-- 1. Perluasan tabel content_pillars
ALTER TABLE public.content_pillars
  ADD COLUMN IF NOT EXISTS brand_id UUID,
  ADD COLUMN IF NOT EXISTS objectives JSONB,
  ADD COLUMN IF NOT EXISTS recommended_topics JSONB;

-- 2. Perluasan tabel ideas
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS hook TEXT,
  ADD COLUMN IF NOT EXISTS content_angle TEXT,
  ADD COLUMN IF NOT EXISTS audience_id UUID,
  ADD COLUMN IF NOT EXISTS product_id UUID,
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS generation_log_id UUID;

-- 3. Perluasan tabel campaigns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS audience_id UUID,
  ADD COLUMN IF NOT EXISTS product_id UUID,
  ADD COLUMN IF NOT EXISTS key_message TEXT;

-- 4. Perluasan tabel contents
ALTER TABLE public.contents
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS generation_log_id UUID,
  ADD COLUMN IF NOT EXISTS active_script_id UUID;
```

---

## 4. Keuntungan Strategi Mapping Ini:
1. **Kalender (`/calendar`) dan Halaman Talent (`/talent`) Tetap Berfungsi 100%:** Karena query kalender mengambil dari `contents`, penambahan field `source_type` dan `active_script_id` tidak mengubah struktur tampilan kalender yang sudah rapi.
2. **Production Board (`/production`) Tetap Lancar:** Alur Kanban `PLANNED` hingga `PUBLISHED` tidak terinterupsi.
3. **Data Lama Aman:** Seluruh konten yang sudah diinput oleh tim Prima RIB tidak akan hilang ataupun berubah statusnya.
