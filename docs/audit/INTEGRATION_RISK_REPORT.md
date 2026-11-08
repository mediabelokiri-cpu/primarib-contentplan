# INTEGRATION RISK REPORT & MITIGATION STRATEGY
## PRIMA RIB CONTENT PLAN — AI-POWERED PLATFORM EXTENSION
**Document:** System Integration Risks, Mitigation Controls & Quality Gates  
**Phase:** Phase 0 — Existing System Audit  
**Date:** 2026-11-06  
**Status:** Approved  

---

## 1. Identifikasi Risiko Utama

Berikut adalah hasil identifikasi risiko teknis dan operasional selama proses integrasi sistem AI ke dalam aplikasi Prima RIB Content Plan:

| ID | Risiko | Tingkat Keparahan | Dampak Potensial | Mitigasi Wajib |
|---|---|---|---|---|
| **RSK-01** | Kebocoran API Key Provider AI ke Browser Client | **CRITICAL** | Tagihan membengkak, penyalahgunaan kuota AI oleh publik. | **Enkripsi Server-Side:** Seluruh komunikasi LLM (Gemini, OpenAI, Claude) wajib melewati Server Actions / Route Handlers (`app/api/ai/...`). Dilarang keras memakai prefix `NEXT_PUBLIC_` untuk API key AI. |
| **RSK-02** | Kerusakan Data Sinkronisasi Cloud (`primarib_cloud_state`) | **HIGH** | Data jadwal tayang dan script talent di HP mendadak hilang atau reset. | **Additive State Extension:** Perluasan state baru dilakukan secara modular tanpa menghapus properti yang sedang dibaca oleh `lib/store.ts`. Skema DDL hanya menggunakan `ADD COLUMN IF NOT EXISTS`. |
| **RSK-03** | Halusinasi AI terkait Aturan Resmi Seleksi CPNS/Sekdin/Polri | **HIGH** | Informasi syarat tinggi badan, kuota formasi, atau tahapan CAT keliru dan merugikan calon siswa. | **Strict Grounding:** AI dilarang membuat asumsi regulasi pemerintah tanpa sumber terverifikasi di Brand Knowledge (PRD Section 3.2). Prompt wajib menyertakan instruksi fallback: *"Jika data resmi belum keluar, nyatakan ketidakpastian secara transparan"*. |
| **RSK-04** | Kerusakan Layout Cetak PDF 1-Halaman & Tampilan Talent | **MEDIUM** | Layout PDF A4 Landscape terpotong barisnya atau tampilan HP talent menjadi berat. | **Regression Testing UI:** Modul cetak PDF (`/calendar`) dan view mobile (`/talent`) diproteksi dari penambahan script AI berat. Talent tetap hanya menerima naskah final bersih. |
| **RSK-05** | Kegagalan Provider AI (Rate Limits / Downtime) | **MEDIUM** | User tidak bisa men-generate script saat deadline produksi konten. | **Multi-Provider Fallback Router:** Sistem mendukung fallback otomatis (misal: Gemini ➔ OpenAI ➔ Claude) dan tetap mempertahankan generator rule-based manual sebagai opsi cadangan. |
| **RSK-06** | Overwriting Konten Tanpa Sengaja | **MEDIUM** | Script yang sudah ditulis manual oleh copywriter tertimpa oleh hasil generate AI. | **Version History & Confirmation:** Setiap generate AI menghasilkan draf baru atau versi riwayat (`script_versions`), bukan menimpa langsung kolom utama tanpa konfirmasi user. |

---

## 2. Quality Gates & Definition of Done per Phase

Setiap fase pengembangan hanya dapat dinyatakan selesai (Done) jika memenuhi kriteria berikut:

1. **Gate 1 — Backward Compatibility Check:**
   - Halaman `/calendar` tetap dapat mengekspor PDF 1-halaman A4 Landscape.
   - Halaman `/talent` tetap dapat diakses mobile secara cepat dan real-time.
   - Kanban di `/production` tetap dapat memindahkan status konten tanpa error.
2. **Gate 2 — Security & Key Isolation Check:**
   - Tidak ada kredensial AI yang terlihat di `inspect element / network tab` browser client.
   - Environtment variables tersimpan di `.env.local` dan terdaftar di Vercel Dashboard secara aman.
3. **Gate 3 — Human-in-the-Loop Verification:**
   - Tidak ada konten AI yang otomatis berpindah status ke `APPROVED` atau `PUBLISHED` tanpa persetujuan tim manusia di `/review`.

---

## 3. Rencana Rollback (Contingency Plan)

Jika terjadi kendala saat penerapan database migration atau update modul:
1. **Database:** Seluruh penambahan kolom bersifat nullable sehingga rollback cukup dengan membiarkan kolom tersebut kosong tanpa perlu me-rollback struktur tabel fisik.
2. **State Store:** `lib/store.ts` mempertahankan fallback `getDefaultState()` dan local storage key fallback.
3. **Git Branching:** Setiap phase di-commit secara terpisah dan terverifikasi di local sebelum di-push ke branch `main`.
