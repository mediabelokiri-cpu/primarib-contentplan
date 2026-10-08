"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ActivityAction,
  AssetType,
  AssignmentType,
  Campaign,
  Content,
  ContentActivity,
  ContentAnalytics,
  ContentAsset,
  ContentAssignment,
  ContentFormat,
  ContentPillar,
  ContentPlatform,
  ContentReview,
  ContentStatus,
  ContentWithRelations,
  Idea,
  IdeaStatus,
  IdeaWithRelations,
  Platform,
  PriorityLevel,
  Profile,
  Program,
  ReviewDecision,
  RoleName,
} from "@/types/database";
import {
  SEED_CAMPAIGNS,
  SEED_FORMATS,
  SEED_PILLARS,
  SEED_PLATFORMS,
  SEED_PROGRAMS,
  SEED_USERS,
} from "@/lib/constants";
import { getLocalCurrentUser } from "@/lib/auth";
import { calculateEngagementRate } from "@/lib/utils";

const LEGACY_STORAGE_KEYS = [
  "primarib_content_plan_store_v1",
  "primarib_content_plan_v1",
  "primarib_content_plan_store_v2_master",
];
const STORAGE_KEY = "primarib_content_plan_store_v3_simplified";
const STORE_EVENT = "primarib-store-updated";

export interface AppDatabaseState {
  users: Profile[];
  programs: Program[];
  pillars: ContentPillar[];
  formats: ContentFormat[];
  platforms: Platform[];
  campaigns: Campaign[];
  ideas: Idea[];
  contents: Content[];
  contentPlatforms: ContentPlatform[];
  contentAssignments: ContentAssignment[];
  contentAssets: ContentAsset[];
  contentReviews: ContentReview[];
  contentAnalytics: ContentAnalytics[];
  contentActivities: ContentActivity[];
  nextSequence: number;
}

// ============================================================================
// MASTER IDEA BANK — DARI DOKUMEN MASTER CONTENT PLAN & IDE KONTEN FLEKSIBEL
// ============================================================================
const RAW_MASTER_IDEAS: {
  title: string;
  description: string;
  program_id: string;
  pillar_id: string;
  source: string;
  priority: PriorityLevel;
}[] = [
  // --- A. OPSI ROTASI NICHE REELS (PDF 1 HAL. 3 - 6) ---
  {
    title: "Cara Hitung Cepat SKD STAN Tanpa Rumus Ribet",
    description:
      "Format: Reels Video (35s) | Pilar: Edukatif | In-Frame: Mentor/Pengajar menjelaskan cepat di papan tulis atau tablet. (Opsi Rotasi Minggu 1 Hari Selasa - Fokus Kedinasan)",
    program_id: "prog-sekdin",
    pillar_id: "pil-edukatif",
    source: "Schedule Post Khusus Reels (Minggu 1 Rotasi 1)",
    priority: "HIGH",
  },
  {
    title: "Bedah Pola Angka Psikotes Kecermatan Polri",
    description:
      "Format: Reels Video (35s) | Pilar: Edukatif | In-Frame: Mentor/Pengajar menjelaskan cepat di papan tulis atau tablet. (Opsi Rotasi Minggu 1 Hari Selasa - Fokus Polri)",
    program_id: "prog-polri",
    pillar_id: "pil-edukatif",
    source: "Schedule Post Khusus Reels (Minggu 1 Rotasi 1)",
    priority: "HIGH",
  },
  {
    title: "Tes Ketelitian Gambar & Sinonim Kedinasan",
    description:
      "Format: Reels Video (25s) | Pilar: Interaktif | In-Frame: Mentor/Pengajar berperan sebagai Quiz Master interaktif. (Opsi Rotasi Minggu 1 Hari Kamis - Fokus Kedinasan)",
    program_id: "prog-sekdin",
    pillar_id: "pil-interaktif",
    source: "Schedule Post Khusus Reels (Minggu 1 Rotasi 1)",
    priority: "HIGH",
  },
  {
    title: "Tebak Istilah Bahasa Indonesia & Psikotes Polri",
    description:
      "Format: Reels Video (25s) | Pilar: Interaktif | In-Frame: Mentor/Pengajar berperan sebagai Quiz Master interaktif. (Opsi Rotasi Minggu 1 Hari Kamis - Fokus Polri)",
    program_id: "prog-polri",
    pillar_id: "pil-interaktif",
    source: "Schedule Post Khusus Reels (Minggu 1 Rotasi 1)",
    priority: "MEDIUM",
  },
  {
    title: "3 Kesalahan Fatal Saat Isi Riwayat Pendaftaran CPNS",
    description:
      "Format: Reels Video (40s) | Pilar: Edukatif | In-Frame: Talent gaya talking head tegas & informatif. (Opsi Rotasi Minggu 2 Hari Selasa - Fokus CPNS)",
    program_id: "prog-cpns",
    pillar_id: "pil-edukatif",
    source: "Schedule Post Khusus Reels (Minggu 2 Rotasi 2)",
    priority: "HIGH",
  },
  {
    title: "Tips Pemula Lolos Seleksi Administrasi & SKD STAN/IPDN",
    description:
      "Format: Reels Video (40s) | Pilar: Edukatif | In-Frame: Talent gaya talking head tegas & informatif. (Opsi Rotasi Minggu 2 Hari Selasa - Fokus Kedinasan)",
    program_id: "prog-sekdin",
    pillar_id: "pil-edukatif",
    source: "Schedule Post Khusus Reels (Minggu 2 Rotasi 2)",
    priority: "HIGH",
  },
  {
    title: "Pilih Mana: Kuliah Kedinasan atau Universitas Umum?",
    description:
      "Format: Reels Video (20s) | Pilar: Interaktif | In-Frame: Siswa / Talent menunjukkan ekspresi interaktif atau skenario pilihan. (Opsi Rotasi Minggu 2 Hari Kamis - Fokus Kedinasan)",
    program_id: "prog-sekdin",
    pillar_id: "pil-interaktif",
    source: "Schedule Post Khusus Reels (Minggu 2 Rotasi 2)",
    priority: "MEDIUM",
  },
  {
    title: "Suka Duka Latihan Fisik Kesamaptaan Polri",
    description:
      "Format: Reels Video (20s) | Pilar: Interaktif | In-Frame: Siswa / Talent menunjukkan ekspresi interaktif atau skenario pilihan. (Opsi Rotasi Minggu 2 Hari Kamis - Fokus Polri)",
    program_id: "prog-polri",
    pillar_id: "pil-interaktif",
    source: "Schedule Post Khusus Reels (Minggu 2 Rotasi 2)",
    priority: "MEDIUM",
  },
  {
    title: "Cara Bedah Soal Studi Kasus TKP Anti Jebak",
    description:
      "Format: Reels Video (35s) | Pilar: Edukatif | In-Frame: Mentor/Pengajar gaya memotivasi & memperagakan tips. (Opsi Rotasi Minggu 3 Hari Selasa - Fokus CPNS)",
    program_id: "prog-cpns",
    pillar_id: "pil-edukatif",
    source: "Schedule Post Khusus Reels (Minggu 3 Rotasi 3)",
    priority: "HIGH",
  },
  {
    title: "Rahasia Skor Aman Tembus Passing Grade STIS/IPDN",
    description:
      "Format: Reels Video (35s) | Pilar: Edukatif | In-Frame: Mentor/Pengajar gaya memotivasi & memperagakan tips. (Opsi Rotasi Minggu 3 Hari Selasa - Fokus Kedinasan)",
    program_id: "prog-sekdin",
    pillar_id: "pil-edukatif",
    source: "Schedule Post Khusus Reels (Minggu 3 Rotasi 3)",
    priority: "HIGH",
  },
  {
    title: "Tips Latihan Fisik Lari & Pull Up Biar Nilai Maksimal",
    description:
      "Format: Reels Video (35s) | Pilar: Edukatif | In-Frame: Mentor/Pengajar memperagakan gerakan latihan fisik jasmani Polri. (Opsi Rotasi Minggu 3 Hari Selasa - Fokus Polri)",
    program_id: "prog-polri",
    pillar_id: "pil-edukatif",
    source: "Schedule Post Khusus Reels (Minggu 3 Rotasi 3)",
    priority: "HIGH",
  },
  {
    title: "Q&A: Batas Usia & Formasi Favorit CPNS",
    description:
      "Format: Reels Video (30s) | Pilar: Interaktif | In-Frame: Mentor atau Siswa format tanya-jawab cepat/stempel mitos-fakta. (Opsi Rotasi Minggu 3 Hari Kamis - Fokus CPNS)",
    program_id: "prog-cpns",
    pillar_id: "pil-interaktif",
    source: "Schedule Post Khusus Reels (Minggu 3 Rotasi 3)",
    priority: "MEDIUM",
  },
  {
    title: "Mitos vs Fakta Sekolah Kedinasan Ikatan Dinas",
    description:
      "Format: Reels Video (30s) | Pilar: Interaktif | In-Frame: Mentor atau Siswa format tanya-jawab cepat/stempel mitos-fakta. (Opsi Rotasi Minggu 3 Hari Kamis - Fokus Kedinasan)",
    program_id: "prog-sekdin",
    pillar_id: "pil-interaktif",
    source: "Schedule Post Khusus Reels (Minggu 3 Rotasi 3)",
    priority: "MEDIUM",
  },
  {
    title: "Cara Atur Waktu Ujian SKD Kedinasan Biar Nggak Habis",
    description:
      "Format: Reels Video (35s) | Pilar: Edukatif | In-Frame: Mentor/Pengajar pesan heart-to-heart menenangkan audiens. (Opsi Rotasi Minggu 4 Hari Selasa - Fokus Kedinasan)",
    program_id: "prog-sekdin",
    pillar_id: "pil-edukatif",
    source: "Schedule Post Khusus Reels (Minggu 4 Rotasi 4)",
    priority: "HIGH",
  },
  {
    title: "Menjaga Fokus & Mental Baja Seluruh Tahapan Seleksi Polri",
    description:
      "Format: Reels Video (35s) | Pilar: Edukatif | In-Frame: Mentor/Pengajar pesan heart-to-heart menenangkan audiens. (Opsi Rotasi Minggu 4 Hari Selasa - Fokus Polri)",
    program_id: "prog-polri",
    pillar_id: "pil-edukatif",
    source: "Schedule Post Khusus Reels (Minggu 4 Rotasi 4)",
    priority: "HIGH",
  },
  {
    title: "This or That: Fokus STAN atau IPDN?",
    description:
      "Format: Reels Video (25s) | Pilar: Interaktif | In-Frame: Siswa / Talent bebas menampilkan perbandingan skenario pilihan. (Opsi Rotasi Minggu 4 Hari Kamis - Fokus Kedinasan)",
    program_id: "prog-sekdin",
    pillar_id: "pil-interaktif",
    source: "Schedule Post Khusus Reels (Minggu 4 Rotasi 4)",
    priority: "MEDIUM",
  },
  {
    title: "This or That: Latihan Fisik Sendiri vs Bareng Bimbel Polri",
    description:
      "Format: Reels Video (25s) | Pilar: Interaktif | In-Frame: Siswa / Talent bebas menampilkan perbandingan skenario pilihan. (Opsi Rotasi Minggu 4 Hari Kamis - Fokus Polri)",
    program_id: "prog-polri",
    pillar_id: "pil-interaktif",
    source: "Schedule Post Khusus Reels (Minggu 4 Rotasi 4)",
    priority: "MEDIUM",
  },

  // --- B. KONTEN EDUKATIF WAJIB ADA (PDF 2 HAL. 1) ---
  {
    title: "Perbedaan CPNS vs PPPK vs Sekdin (Slide Carousel)",
    description:
      "Format: Karusel Foto (Feed) | Output: IG/FB/TT | Bahas perbedaan status kepegawaian, jalur masuk, usia, dan tahapan tes antara CPNS, PPPK, dan Sekolah Kedinasan.",
    program_id: "prog-general",
    pillar_id: "pil-edukatif",
    source: "Bank Ide Konten Fleksibel — Konten Edukatif",
    priority: "HIGH",
  },
  {
    title: "Kisi-Kisi Materi TWK, TIU, TKP Terbaru",
    description:
      "Format: Karusel Foto (Feed) | Output: IG/FB/TT | Rangkuman indikator kisi-kisi resmi SKD: TWK (Nasionalisme, Integritas, Bela Negara, Pilar Negara, Bahasa Negara), TIU, dan TKP.",
    program_id: "prog-cpns",
    pillar_id: "pil-edukatif",
    source: "Bank Ide Konten Fleksibel — Konten Edukatif",
    priority: "HIGH",
  },
  {
    title: "Tahapan Seleksi TNI / Polri dari Awal Sampai Akhir",
    description:
      "Format: Karusel Foto (Feed) | Output: IG/FB/TT | Alur lengkap mulai dari Rikmin Awal, Rikkes I, Psikologi, Uji Akademik, Jasmani/Kesamaptaan, Rikkes II, PMK, hingga Sidang Akhir.",
    program_id: "prog-polri",
    pillar_id: "pil-edukatif",
    source: "Bank Ide Konten Fleksibel — Konten Edukatif",
    priority: "HIGH",
  },
  {
    title: "Kesalahan Fatal yang Sering Bikin Gagal Tes",
    description:
      "Format: Karusel Foto (Feed) | Output: IG/FB/TT | Evaluasi kesalahan umum peserta dari tahap berkas administrasi hingga manajemen waktu ujian CAT.",
    program_id: "prog-general",
    pillar_id: "pil-edukatif",
    source: "Bank Ide Konten Fleksibel — Konten Edukatif",
    priority: "HIGH",
  },
  {
    title: "Update Nilai Ambang Batas (Passing Grade) SKD",
    description:
      "Format: Feed Foto / Karusel | Output: IG/FB/TT | Informasi target skor minimal TWK, TIU, TKP dan skor aman lolos perankingan 3 kali formasi.",
    program_id: "prog-cpns",
    pillar_id: "pil-informatif",
    source: "Bank Ide Konten Fleksibel — Konten Edukatif",
    priority: "HIGH",
  },
  {
    title: "1 Menit Paham TWK",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Penjelasan singkat 60 detik memahami konsep penalaran TWK tanpa menghafal pasal demi pasal.",
    program_id: "prog-cpns",
    pillar_id: "pil-edukatif",
    source: "Bank Ide Konten Fleksibel — Konten Edukatif",
    priority: "HIGH",
  },
  {
    title: "Simulasi Soal + Pembahasan Singkat",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Tampilkan 1 soal HOTS di layar dan bedah cara cepat menjawabnya bersama tentor Prima RIB.",
    program_id: "prog-general",
    pillar_id: "pil-edukatif",
    source: "Bank Ide Konten Fleksibel — Konten Edukatif",
    priority: "MEDIUM",
  },
  {
    title: "Stop Lakukan Ini Kalau Mau Lolos CPNS",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Hook peringatan keras mengenai kebiasaan belajar yang salah saat persiapan seleksi CPNS.",
    program_id: "prog-cpns",
    pillar_id: "pil-edukatif",
    source: "Bank Ide Konten Fleksibel — Konten Edukatif",
    priority: "HIGH",
  },

  // --- C. KONTEN MOTIVASI & MENTALITY (PDF 2 HAL. 1 - 2) ---
  {
    title: "Quotes Pejuang CPNS / TNI / Polri",
    description:
      "Format: Feed Foto | Output: IG/FB/TT | Kutipan motivasi penguat semangat belajar bagi pejuang NIP dan seragam.",
    program_id: "prog-general",
    pillar_id: "pil-motivasi",
    source: "Bank Ide Konten Fleksibel — Motivasi & Mentality",
    priority: "MEDIUM",
  },
  {
    title: "Cerita Gagal → Bangkit → Lolos Seleksi",
    description:
      "Format: Karusel Foto (Feed) | Output: IG/FB/TT | Storytelling perjuangan siswa yang sempat gagal tahun sebelumnya lalu bangkit belajar terarah di Prima RIB hingga lolos.",
    program_id: "prog-general",
    pillar_id: "pil-motivasi",
    source: "Bank Ide Konten Fleksibel — Motivasi & Mentality",
    priority: "HIGH",
  },
  {
    title: "Fakta: 'Gagal Sekali Itu Wajar'",
    description:
      "Format: Feed Foto / Karusel | Output: IG/FB/TT | Perspektif mentalitas positif bahwa kegagalan pertama adalah modal evaluasi untuk menang di seleksi berikutnya.",
    program_id: "prog-general",
    pillar_id: "pil-motivasi",
    source: "Bank Ide Konten Fleksibel — Motivasi & Mentality",
    priority: "MEDIUM",
  },
  {
    title: "Before–After Siswa (Belajar → Lolos)",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Transisi video saat siswa masih latihan intensif di kelas Prima RIB hingga akhirnya mengenakan seragam / menerima SK.",
    program_id: "prog-general",
    pillar_id: "pil-motivasi",
    source: "Bank Ide Konten Fleksibel — Motivasi & Mentality",
    priority: "HIGH",
  },
  {
    title: "Kalau Kamu Capek, Tonton Ini",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Video pengingat hangat untuk pejuang seleksi yang sedang mengalami kejenuhan (burnout) belajar.",
    program_id: "prog-general",
    pillar_id: "pil-motivasi",
    source: "Bank Ide Konten Fleksibel — Motivasi & Mentality",
    priority: "MEDIUM",
  },
  {
    title: "POV: Pejuang CPNS di Usia 25+",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Konten relatable perjuangan peserta usia 25+ yang membagi fokus antara tanggung jawab hidup dan mengejar impian PNS.",
    program_id: "prog-cpns",
    pillar_id: "pil-motivasi",
    source: "Bank Ide Konten Fleksibel — Motivasi & Mentality",
    priority: "HIGH",
  },

  // --- D. KONTEN TESTIMONI & BUKTI SOSIAL (PDF 2 HAL. 2) ---
  {
    title: "Testimoni Alumni + Foto SK / Seragam",
    description:
      "Format: Feed Foto | Output: IG/FB/TT | Bukti sosial kelulusan alumni Prima RIB lengkap dengan foto berseragam dan kesan pesan selama bimbingan.",
    program_id: "prog-general",
    pillar_id: "pil-branding",
    source: "Bank Ide Konten Fleksibel — Testimoni & Bukti Sosial",
    priority: "HIGH",
  },
  {
    title: "Data Kelulusan Prima RIB & Highlight Alumni di Instansi Impian",
    description:
      "Format: Karusel Foto (Feed) | Output: IG/FB/TT | Infografis persentase kelulusan siswa Prima RIB dan sebaran alumni di berbagai kementerian, sekolah kedinasan, dan Polda.",
    program_id: "prog-general",
    pillar_id: "pil-branding",
    source: "Bank Ide Konten Fleksibel — Testimoni & Bukti Sosial",
    priority: "HIGH",
  },
  {
    title: "Reaksi Siswa Saat Lolos Seleksi & Interview Singkat Alumni",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Kompilasi momen haru kelulusan siswa dan wawancara singkat tips belajar mereka di Prima RIB.",
    program_id: "prog-general",
    pillar_id: "pil-branding",
    source: "Bank Ide Konten Fleksibel — Testimoni & Bukti Sosial",
    priority: "HIGH",
  },
  {
    title: "Aku Dulu Hampir Nyerah… (Kisah Alumni Prima RIB)",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Monolog cerita emosional alumni yang hampir menyerah sebelum dibimbing intensif oleh mentor Prima RIB.",
    program_id: "prog-general",
    pillar_id: "pil-branding",
    source: "Bank Ide Konten Fleksibel — Testimoni & Bukti Sosial",
    priority: "MEDIUM",
  },

  // --- E. KONTEN STRATEGI & TIPS KHUSUS (PDF 2 HAL. 2) ---
  {
    title: "Strategi Belajar 30–60–90 Hari Sebelum Tes",
    description:
      "Format: Karusel Foto (Feed) | Output: IG/FB/TT | Roadmap pembagian porsi belajar konsep dasar (H-90), latihan topik & kecepatan (H-60), dan full simulasi CAT (H-30).",
    program_id: "prog-general",
    pillar_id: "pil-strategi",
    source: "Bank Ide Konten Fleksibel — Strategi & Tips Khusus",
    priority: "HIGH",
  },
  {
    title: "Cara Bagi Waktu Kerja & Belajar",
    description:
      "Format: Karusel Foto (Feed) | Output: IG/FB/TT | Jadwal manajemen waktu praktis bagi pejuang seleksi yang sambil bekerja atau kuliah.",
    program_id: "prog-cpns",
    pillar_id: "pil-strategi",
    source: "Bank Ide Konten Fleksibel — Strategi & Tips Khusus",
    priority: "HIGH",
  },
  {
    title: "Alur Pendaftaran CPNS / TNI / Polri",
    description:
      "Format: Karusel Foto (Feed) | Output: IG/FB/TT | Panduan alur registrasi akun portal resmi hingga cetak kartu ujian.",
    program_id: "prog-general",
    pillar_id: "pil-informatif",
    source: "Bank Ide Konten Fleksibel — Strategi & Tips Khusus",
    priority: "MEDIUM",
  },
  {
    title: "Rutinitas Belajar Siswa Berprestasi & Hack Biar Konsisten Belajar",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Kebiasaan harian siswa peraih skor tertinggi tryout di Prima RIB agar tetap disiplin tanpa cepat bosan.",
    program_id: "prog-general",
    pillar_id: "pil-strategi",
    source: "Bank Ide Konten Fleksibel — Strategi & Tips Khusus",
    priority: "MEDIUM",
  },
  {
    title: "Belajar Salah Tapi Sering Dilakukan",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Membongkar metode belajar yang tidak efektif (seperti menghafal kunci jawaban tanpa paham konsep).",
    program_id: "prog-general",
    pillar_id: "pil-strategi",
    source: "Bank Ide Konten Fleksibel — Strategi & Tips Khusus",
    priority: "HIGH",
  },

  // --- F. KONTEN INTERAKTIF & VIRAL RELATABLE (PDF 2 HAL. 2 - 3) ---
  {
    title: "Polling: Target Kamu Tahun Ini CPNS / Sekdin / Polri?",
    description:
      "Format: Feed Foto | Output: IG/FB/TT | Postingan interaktif untuk memetakan target audiens dan memancing diskusi di kolom komentar.",
    program_id: "prog-general",
    pillar_id: "pil-interaktif",
    source: "Bank Ide Konten Fleksibel — Konten Interaktif",
    priority: "MEDIUM",
  },
  {
    title: "Kamu Tim Belajar Pagi atau Malam? & Challenge 7 Hari Belajar",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Konten interaktif mengajak followers berkomitmen ikut tantangan belajar 7 hari berturut-turut.",
    program_id: "prog-general",
    pillar_id: "pil-interaktif",
    source: "Bank Ide Konten Fleksibel — Konten Interaktif",
    priority: "MEDIUM",
  },
  {
    title: "Behind The Scene Belajar & Day in My Life Tutor Prima RIB",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Konten Branding Lembaga menampilkan keseharian pengajar menyiapkan modul dan mengajar di kelas Prima RIB.",
    program_id: "prog-general",
    pillar_id: "pil-branding",
    source: "Bank Ide Konten Fleksibel — Branding Lembaga",
    priority: "MEDIUM",
  },
  {
    title: "Yang Dirasain Pejuang CPNS & Ekspresi Pas Nilai Tryout Naik/Turun",
    description:
      "Format: Reels Video | Output: IG/FB/TT | Konten Viral (Relatable) menggunakan sound trend + caption relate suasana hati pejuang seleksi.",
    program_id: "prog-cpns",
    pillar_id: "pil-interaktif",
    source: "Bank Ide Konten Fleksibel — Konten Viral Relatable",
    priority: "MEDIUM",
  },
];

const INITIAL_IDEAS: Idea[] = RAW_MASTER_IDEAS.map((item, idx) => ({
  id: `idea-master-${idx + 1}`,
  title: item.title,
  description: item.description,
  program_id: item.program_id,
  pillar_id: item.pillar_id,
  source: item.source,
  priority: item.priority,
  status: idx < 8 ? "SELECTED" : "NEW",
  created_by: "user-idam",
  created_at: "2026-10-01T09:00:00Z",
  updated_at: "2026-10-01T09:00:00Z",
}));

// ============================================================================
// MASTER OF CONTENT PLAN & SCHEDULE POST (1 BULAN PENUH: MINGGU 1 – MINGGU 4)
// 20 Konten Terjadwal (Senin s/d Jumat × 4 Minggu) — Sesuai PDF 1 Hal. 1 – 16
// ============================================================================
const INITIAL_CONTENTS: Content[] = [
  // ==========================================================================
  // MINGGU 1 (FOKUS: CPNS / FLEKSIBEL) — 5 s/d 9 Oktober 2026
  // ==========================================================================
  {
    id: "cnt-1",
    content_code: "PR-2026-0001",
    title: "Update Dokumen & Syarat Penting Pendaftaran CPNS 2026",
    short_title: "Dokumen & Syarat CPNS",
    program_id: "prog-cpns",
    pillar_id: "pil-informatif",
    format_id: "fmt-feed",
    campaign_id: "camp-m1-cpns",
    objective: "Edukasi syarat administrasi CPNS agar peserta tidak gugur verifikasi berkas",
    target_audience: "Pejuang CPNS 2026",
    angle: "Minggu 1 Hari Senin — Feed Foto / Karusel 5 Slide Informatif",
    priority: "HIGH",
    status: "SCHEDULED",
    hook: "Wajib Tahu! 5 Dokumen Sering Gagal Verifikasi di CPNS. Jangan Sampai Ketinggalan!",
    main_content: `Slide 1 (Cover): Teks besar: "Wajib Tahu! 5 Dokumen Sering Gagal Verifikasi di CPNS. Jangan Sampai Ketinggalan!" (Visual: Ikon berkas dengan tanda seru).
Slide 2: Isi: Pengecekan KTP dan Dukcapil (Pastikan nama dan NIK sinkron tanpa typo).
Slide 3: Isi: Swafoto/Pasfoto (Perhatikan latar belakang dan ketentuan pakaian yang diminta instansi).
Slide 4: Isi: Format ijazah, transkrip nilai, dan akreditasi kampus/prodi yang sering terlewat.
Slide 5 (CTA): "Urus dari sekarang biar nggak mepet deadline! Ada pertanyaan seputar syarat? Tulis di komentar ya, atau amankan konsultasi gratis via link bio."`,
    cta: "Urus dari sekarang biar nggak mepet deadline! Ada pertanyaan seputar syarat? Tulis di komentar ya, atau amankan konsultasi gratis via link bio.",
    caption:
      "Pendaftaran CPNS tinggal menunggu waktu! Jangan sampai impianmu kandas di tahap administrasi hanya karena hal sepele. Simpan postingan ini dan tag teman pejuang NIP kamu! 📁✨",
    hashtags: "#InfoCPNS #SyaratCPNS #BimbelCPNS #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Feed Foto / Karusel 5 Slide (Desain bersih, warna resmi: biru #284078 & emas #DDB02E Prima RIB). Slide 1 menampilkan ikon berkas dengan tanda seru.",
    scheduled_at: "2026-10-05T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-01T10:00:00Z",
  },
  {
    id: "cnt-2",
    content_code: "PR-2026-0002",
    title: "Trik Jawab Soal TIU Deret Angka di Bawah 30 Detik",
    short_title: "Trik TIU Deret < 30s",
    program_id: "prog-cpns",
    pillar_id: "pil-edukatif",
    format_id: "fmt-reels",
    campaign_id: "camp-m1-cpns",
    objective: "Menunjukkan trik cepat TIU ala mentor Prima RIB & mengarahkan ke kelas intensif",
    target_audience: "Pejuang CPNS (Rotasi: Kedinasan / Polri)",
    angle: "Minggu 1 Hari Selasa — Reels Edukatif (Durasi 35 Detik)",
    priority: "HIGH",
    status: "SCHEDULED",
    hook: "Siapa nih yang kalau ketemu soal TIU deret angka langsung kepikiran nyerah? Jangan diskip!",
    main_content: `Topik: Trik Jawab Soal TIU Deret Angka di bawah 30 Detik
Durasi: 35 Detik
Opsi Rotasi Niche:
• CPNS: Trik Jawab Soal TIU Deret Angka < 30 Detik
• Kedinasan: Cara Hitung Cepat SKD STAN Tanpa Rumus Ribet
• Polri: Bedah Pola Angka Psikotes Kecermatan Polri`,
    cta: "Mau tau trik rahasia jebol soal TIU tanpa rumus ribet? Yuk gabung di kelas intensif CPNS Prima RIB. Cek link di bio!",
    caption:
      "Cara cepat taklukkan TIU CPNS tanpa buang waktu! Siapa yang sering kehabisan waktu di bagian ini? Latihan bareng mentor expert di Prima RIB yuk! 🚀",
    hashtags: "#CPNS2026 #BimbelCPNS #TipsTIU #PrimaRIB",
    script: `0-3s (Hook): "Siapa nih yang kalau ketemu soal TIU deret angka langsung kepikiran nyerah? Jangan diskip!"
3-20s (Body): "Jangan manual ngitung satu-satu. Cek polanya: loncat satu angka atau kuadrat. Contoh soal ini... lihat polanya nambah 4 terus. Dalam waktu kurang dari 15 detik, ketemu jawabannya B!"
20-35s (CTA): "Mau tau trik rahasia jebol soal TIU tanpa rumus ribet? Yuk gabung di kelas intensif CPNS Prima RIB. Cek link di bio!"`,
    creative_brief:
      "Durasi: 35 Detik | Visual Cue: Tentor menulis cepat di papan tulis / tablet dengan latar animasi angka | Audio: Musik tren yang upbeat / memotivasi.",
    scheduled_at: "2026-10-06T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:05:00Z",
    updated_at: "2026-10-01T10:05:00Z",
  },
  {
    id: "cnt-3",
    content_code: "PR-2026-0003",
    title: "Rumus Cepat & Bedah Soal TIU Perbandingan Senilai dan Berbalik Nilai",
    short_title: "Bedah TIU Perbandingan",
    program_id: "prog-cpns",
    pillar_id: "pil-edukatif",
    format_id: "fmt-carousel",
    campaign_id: "camp-m1-cpns",
    objective: "Konten saveable deep-dive rumus TIU & kesalahan pengerjaan soal SKD",
    target_audience: "Pejuang CPNS 2026",
    angle: "Minggu 1 Hari Rabu — Karusel Foto 6 Slide Edukatif (Deep-Dive)",
    priority: "HIGH",
    status: "SCHEDULED",
    hook: "Banyak yang Terkecoh! Bedah Soal TIU Perbandingan: Senilai vs Berbalik Nilai",
    main_content: `Slide 1 (Cover): "Banyak yang Terkecoh! Bedah Soal TIU Perbandingan: Senilai vs Berbalik Nilai"
Slide 2: Definisi dasar dan perbedaan logika antara senilai (jika satu naik, yang lain naik) dan berbalik nilai (jika satu naik, yang lain turun).
Slide 3: Contoh Kasus 1 (Soal Perbandingan Senilai + Penyelesaian cepat langkah demi langkah).
Slide 4: Contoh Kasus 2 (Soal Perbandingan Berbalik Nilai + Jebakan yang sering muncul).
Slide 5: Rangkuman rumus kilat yang wajib dihafal di luar kepala.
Slide 6 (CTA): "Mau kuasai ratusan rumus kilat TIU lainnya? Belajar terarah langsung di kelas intensif Prima RIB. Klik link di bio!"`,
    cta: "Mau kuasai ratusan rumus kilat TIU lainnya? Belajar terarah langsung di kelas intensif Prima RIB. Klik link di bio!",
    caption:
      "Soal TIU model begini pasti keluar di SKD! Jangan dikerjakan pakai cara manual yang makan waktu. Pahami konsepnya bareng mentor expert Prima RIB. 🧠📈",
    hashtags: "#TipsTIU #SoalCPNS #BelajarCPNS #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Karusel 6 Slide Edukatif (Deep-Dive). Topik pasangan rotasi tabel Minggu 1: 3 Kesalahan Fatal Peserta saat Mengerjakan Soal TKP.",
    scheduled_at: "2026-10-07T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:10:00Z",
    updated_at: "2026-10-01T10:10:00Z",
  },
  {
    id: "cnt-4",
    content_code: "PR-2026-0004",
    title: "Kuis Kilat TWK: Pancasila (Tebak Cepat A/B/C/D)",
    short_title: "Kuis Kilat TWK Pancasila",
    program_id: "prog-cpns",
    pillar_id: "pil-interaktif",
    format_id: "fmt-reels",
    campaign_id: "camp-m1-cpns",
    objective: "Meningkatkan interaksi komentar & tag teman lewat kuis cepat 25 detik",
    target_audience: "Pejuang CPNS (Rotasi: Kedinasan / Polri)",
    angle: "Minggu 1 Hari Kamis — Reels Interaktif (Durasi 25 Detik)",
    priority: "HIGH",
    status: "SCHEDULED",
    hook: "Kuis kilat TWK CPNS! Yang ngaku siap tes, buktikan di sini.",
    main_content: `Topik: Kuis Kilat TWK: Pancasila (Tebak Cepat A/B/C/D)
Durasi: 25 Detik
Opsi Rotasi Niche:
• CPNS: Kuis Kilat TWK Pancasila (Tebak A/B/C/D)
• Kedinasan: Tes Ketelitian Gambar & Sinonim Kedinasan
• Polri: Tebak Istilah Bahasa Indonesia & Psikotes Polri`,
    cta: "Jawabannya benar atau salah? Coba ketik di kolom komentar, dan tag teman kamu yang jago TWK!",
    caption:
      "Uji kemampuan TWK kamu sekarang! Benar apa salah tadi? Kalau masih banyak yang salah, saatnya intensifkan belajar di Prima RIB. 📚✨",
    hashtags: "#KuisCPNS #SoalTWK #BimbelKedinasan #PrimaRIB",
    script: `0-3s (Hook): "Kuis kilat TWK CPNS! Yang ngaku siap tes, buktikan di sini."
3-18s (Body): Tampilkan soal di layar: 'Penerapan sila ke-4 dalam keputusan organisasi adalah...?' Timer berjalan 5 detik. Jawaban muncul: 'Mengutamakan musyawarah untuk mufakat'."
18-25s (CTA): "Jawabannya benar atau salah? Coba ketik di kolom komentar, dan tag teman kamu yang jago TWK!"`,
    creative_brief:
      "Durasi: 25 Detik | In-Frame: Mentor/Pengajar berperan sebagai Quiz Master interaktif | Visual Cue: Teks soal besar di layar, ada animasi timer mundur 5 detik berbunyi 'tik-tok' | Audio: Musik tegang/game show.",
    scheduled_at: "2026-10-08T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:15:00Z",
    updated_at: "2026-10-01T10:15:00Z",
  },
  {
    id: "cnt-5",
    content_code: "PR-2026-0005",
    title: "Kenalan dengan Pengajar / Tentor Ahli di Prima RIB",
    short_title: "Profil Tentor Prima RIB",
    program_id: "prog-cpns",
    pillar_id: "pil-branding",
    format_id: "fmt-feed",
    campaign_id: "camp-m1-cpns",
    objective: "Membangun kredibilitas & kepercayaan terhadap kualitas pengajar Prima RIB",
    target_audience: "Calon siswa & orang tua",
    angle: "Minggu 1 Hari Jumat — Feed Foto / Karusel 3 Slide Branding",
    priority: "MEDIUM",
    status: "SCHEDULED",
    hook: "Di Balik Suksesnya Alumni Lolos Seleksi: Kenalan dengan Mentor Spesialis TWK Prima RIB.",
    main_content: `Slide 1 (Cover): "Di Balik Suksesnya Alumni Lolos Seleksi: Kenalan dengan Mentor Spesialis TWK Prima RIB."
Slide 2: Profil singkat, latar belakang pendidikan, dan jam terbang pengajar (misal: "Master of Public Administration & Pengajar TWK berpengalaman 6+ tahun").
Slide 3 (CTA): "Belajar langsung dari pakarnya bikin materi serumit apapun jadi gampang masuk! Pendaftaran kelas baru batch ini sudah dibuka. Cek link di bio."`,
    cta: "Belajar langsung dari pakarnya bikin materi serumit apapun jadi gampang masuk! Pendaftaran kelas baru batch ini sudah dibuka. Cek link di bio.",
    caption:
      "Kualitas pengajar adalah kunci utama kamu paham materi dengan cepat. Di Prima RIB, kamu dibimbing oleh tentor-tentor berdedikasi tinggi yang paham betul kisi-kisi ujian. Yuk, gabung sekarang! 👨‍🏫🌟",
    hashtags: "#TentorPrimaRIB #BimbelTerbaik #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Single Image / Karusel 3 Slide (Foto profesional tentor dengan latar belakang ruang kelas modern Prima RIB).",
    scheduled_at: "2026-10-09T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:20:00Z",
    updated_at: "2026-10-01T10:20:00Z",
  },

  // ==========================================================================
  // MINGGU 2 (FOKUS: SEKOLAH KEDINASAN / FLEKSIBEL) — 12 s/d 16 Oktober 2026
  // ==========================================================================
  {
    id: "cnt-6",
    content_code: "PR-2026-0006",
    title: "Alur Seleksi & Perbandingan 4 Sekolah Kedinasan Favorit (STAN, IPDN, STIS, Poltekim/Poltekip)",
    short_title: "Perbandingan 4 Sekdin",
    program_id: "prog-sekdin",
    pillar_id: "pil-informatif",
    format_id: "fmt-feed",
    campaign_id: "camp-m2-sekdin",
    objective: "Memberikan panduan alur & perbandingan Sekolah Kedinasan paling diminati",
    target_audience: "Siswa SMA/SMK Kelas 12 & Pejuang Sekolah Kedinasan",
    angle: "Minggu 2 Hari Senin — Feed Foto / Karusel 6 Slide Informatif",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Bingung Pilih Mana? Perbandingan 4 Sekolah Kedinasan Paling Favorit & Lulus Langsung CPNS!",
    main_content: `Slide 1 (Cover): "Bingung Pilih Mana? Perbandingan 4 Sekolah Kedinasan Paling Favorit & Lulus Langsung CPNS!"
Slide 2: PKN STAN (Fokus keuangan negara, ikatan dinas Kemenkeu).
Slide 3: IPDN (Fokus pemerintahan dalam negeri, kedinasan Kemendagri).
Slide 4: Polstat STIS (Fokus statistik, ikatan dinas Badan Pusat Statistik).
Slide 5: Poltekim & Poltekip (Fokus imigrasi dan pemasyarakatan, Kemenkumham).
Slide 6 (CTA): "Mana instansi impianmu? Tentukan pilihan dari sekarang dan siapkan SKD-nya di Prima RIB. Klik link bio!"`,
    cta: "Mana instansi impianmu? Tentukan pilihan dari sekarang dan siapkan SKD-nya di Prima RIB. Klik link bio!",
    caption:
      "Sekolah Kedinasan jadi impian jutaan pelajar karena jaminan ikatan dinasnya. Kamu pilih incaran yang mana nih? Diskusi di kolom komentar ya! 🏛️🎯",
    hashtags: "#SekolahKedinasan #STAN #IPDN #STIS #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Feed Foto / Karusel 6 Slide (Tabel perbandingan & Alur Tahapan Seleksi Sekolah Kedinasan STAN/IPDN/dll).",
    scheduled_at: "2026-10-12T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:25:00Z",
    updated_at: "2026-10-01T10:25:00Z",
  },
  {
    id: "cnt-7",
    content_code: "PR-2026-0007",
    title: "Tips Menghadapi Seleksi SKD Kedinasan untuk Pemula",
    short_title: "Tips SKD Sekdin Pemula",
    program_id: "prog-sekdin",
    pillar_id: "pil-edukatif",
    format_id: "fmt-reels",
    campaign_id: "camp-m2-sekdin",
    objective: "Edukasi langkah awal persiapan SKD Kedinasan bagi pemula",
    target_audience: "Pejuang Sekolah Kedinasan (STAN, IPDN, STIN)",
    angle: "Minggu 2 Hari Selasa — Reels Edukatif (Durasi 40 Detik)",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Mau tembus STAN, IPDN, atau STIN tahun ini tapi bingung mulai dari mana buat pemula?",
    main_content: `Topik: Tips Menghadapi Seleksi SKD Kedinasan untuk Pemula
Durasi: 40 Detik
Opsi Rotasi Niche:
• CPNS: 3 Kesalahan Fatal Saat Isi Riwayat Pendaftaran CPNS
• Kedinasan: Tips Pemula Lolos Seleksi Administrasi & SKD STAN/IPDN
• Polri: Syarat Tinggi Badan & Dokumen Wajib Bintara Polri`,
    cta: "Di Prima RIB, kita bedah kurikulum kedinasan dari nol sampai mahir. Daftar sekarang kuota terbatas!",
    caption:
      "Pejuang Kedinasan wajib tahu! Persiapan dini kunci utama lolos SKD. Yuk, mulai persiapanmu bersama mentor berpengalaman di Prima RIB. 🏛️🔥",
    hashtags: "#SekolahKedinasan #STAN #IPDN #BimbelKedinasan #PrimaRIB",
    script: `0-3s (Hook): "Mau tembus STAN, IPDN, atau STIN tahun ini tapi bingung mulai dari mana buat pemula?"
3-25s (Body): "Catat 3 hal ini: Pertama, jangan langsung belajar soal susah, pahami dulu kisi-kisi resmi CAT BKN. Kedua, biasakan simulasi pakai sistem CAT asli biar mental nggak kaget. Ketiga, atur strategi pengerjaan: TKP duluan, TIU, baru TWK atau sebaliknya sesuai ritme kamu."
25-40s (CTA): "Di Prima RIB, kita bedah kurikulum kedinasan dari nol sampai mahir. Daftar sekarang kuota terbatas!"`,
    creative_brief:
      "Durasi: 40 Detik | Visual Cue: Talking head (pembicara/mentor) dengan gaya santai tapi tegas, diselingi b-roll suasana simulasi CAT | Audio: Musik latar lo-fi produktif yang tenang.",
    scheduled_at: "2026-10-13T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:30:00Z",
    updated_at: "2026-10-01T10:30:00Z",
  },
  {
    id: "cnt-8",
    content_code: "PR-2026-0008",
    title: "3 Kesalahan Fatal Peserta saat Mengerjakan Soal TKP & Rahasia Manajemen Waktu",
    short_title: "3 Kesalahan Fatal TKP",
    program_id: "prog-sekdin",
    pillar_id: "pil-edukatif",
    format_id: "fmt-carousel",
    campaign_id: "camp-m2-sekdin",
    objective: "Membantu peserta memahami logika poin 5 TKP dan manajemen waktu ujian",
    target_audience: "Pejuang SKD Sekolah Kedinasan & CPNS",
    angle: "Minggu 2 Hari Rabu — Karusel Foto 5 Slide Edukatif",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Merasa Jawab Benar tapi Skor TKP Hancur? Ini 3 Kesalahan Fatal yang Sering Tidak Disadari!",
    main_content: `Slide 1 (Cover): "Merasa Jawab Benar tapi Skor TKP Hancur? Ini 3 Kesalahan Fatal yang Sering Tidak Disadari!"
Slide 2: Kesalahan 1: Menjawab berdasarkan idealisme pribadi, bukan nilai integritas/pelayanan publik yang diatur instansi.
Slide 3: Kesalahan 2: Terjebak memilih jawaban yang paling 'baik' tapi tidak efisien dalam birokrasi.
Slide 4: Kesalahan 3: Kehabisan waktu di soal cerita yang panjang.
Slide 5 (CTA): "Pelajari kisi-kisi penilaian poin 1 sampai 5 di TKP bersama modul eksklusif Prima RIB. Daftar sekarang!"`,
    cta: "Pelajari kisi-kisi penilaian poin 1 sampai 5 di TKP bersama modul eksklusif Prima RIB. Daftar sekarang!",
    caption:
      "Jangan anggap remeh TKP karena tidak ada hitung-hitungannya! Bagian ini justru butuh strategi logika birokrasi yang tepat. Cek tipsnya di atas! 💡✨",
    hashtags: "#TipsTKP #SKDKedinasan #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Karusel 5 Slide. Topik pendamping tabel Minggu 2: Rahasia Manajemen Waktu Paling Efektif saat Ujian.",
    scheduled_at: "2026-10-14T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:35:00Z",
    updated_at: "2026-10-01T10:35:00Z",
  },
  {
    id: "cnt-9",
    content_code: "PR-2026-0009",
    title: "Poling: Bagian SKD Mana yang Paling Bikin Stres? (TIU vs TKP)",
    short_title: "Poling SKD Paling Stres",
    program_id: "prog-sekdin",
    pillar_id: "pil-interaktif",
    format_id: "fmt-reels",
    campaign_id: "camp-m2-sekdin",
    objective: "Memancing komentar poling A atau B dari sesama pejuang SKD",
    target_audience: "Pejuang SKD Kedinasan & CPNS",
    angle: "Minggu 2 Hari Kamis — Reels Interaktif (Durasi 20 Detik)",
    priority: "MEDIUM",
    status: "PLANNED",
    hook: "Jujur, sesama pejuang SKD, mana nih musuh paling besar kalian?",
    main_content: `Topik: Poling: Bagian SKD Mana yang Paling Bikin Stres?
Durasi: 20 Detik
Opsi Rotasi Niche:
• CPNS: Poling: Musuh Terbesar SKD (TIU vs TKP)
• Kedinasan: Pilih Mana: Kuliah Kedinasan atau Universitas Umum?
• Polri: Suka Duka Latihan Fisik Kesamaptaan Polri`,
    cta: "Ketik A atau B di komentar! Solusi dua-duanya ada di kelas kita, cek bio ya.",
    caption:
      "Musuh terbesar kalian di SKD bagian apa nih? Komen di bawah ya! Tenang, di Prima RIB kita punya trik khusus naklukin TIU & TKP. 😉🎯",
    hashtags: "#PejuangNIP #SKD #PrimaRIB",
    script: `0-3s (Hook): "Jujur, sesama pejuang SKD, mana nih musuh paling besar kalian?"
3-15s (Body): "Apakah TIU karena hitung-hitungannya bikin migrain, atau TKP karena pilihan jawabannya mirip semua dan bikin galau?"
15-20s (CTA): "Ketik A atau B di komentar! Solusi dua-duanya ada di kelas kita, cek bio ya."`,
    creative_brief:
      "Durasi: 20 Detik | Visual Cue: Menampilkan dua pilihan di layar (A. TIU yang bikin pusing / B. TKP yang abu-abu). Mentor/Siswa gestur menunjuk ke pilihan | Audio: Tren audio pilihan ganda/viral.",
    scheduled_at: "2026-10-15T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:40:00Z",
    updated_at: "2026-10-01T10:40:00Z",
  },
  {
    id: "cnt-10",
    content_code: "PR-2026-0010",
    title: "Suasana Simulasi CAT & Fasilitas Lab Komputer Prima RIB",
    short_title: "Fasilitas Lab CAT Prima RIB",
    program_id: "prog-sekdin",
    pillar_id: "pil-branding",
    format_id: "fmt-feed",
    campaign_id: "camp-m2-sekdin",
    objective: "Menampilkan keunggulan fasilitas laboratorium CAT & kenyamanan kelas Prima RIB",
    target_audience: "Calon siswa & orang tua",
    angle: "Minggu 2 Hari Jumat — Feed Foto / Karusel 4 Slide Branding",
    priority: "MEDIUM",
    status: "PLANNED",
    hook: "Fasilitas Standar Ujian Asli! Intip Suasana Belajar & Simulasi CAT di Prima RIB.",
    main_content: `Slide 1 (Cover): "Fasilitas Standar Ujian Asli! Intip Suasana Belajar & Simulasi CAT di Prima RIB."
Slide 2: Ruang kelas ber-AC, nyaman, dan berkapasitas eksklusif (tidak berdesakan agar fokus belajar maksimal).
Slide 3: Simulasi komputer CAT mandiri dengan sistem penilaian real-time persis seperti saat ujian nasional.
Slide 4 (CTA): "Fasilitas terbaik mendukung hasil yang maksimal. Yuk, datang langsung atau amankan seat kelasmu via link di bio!"`,
    cta: "Fasilitas terbaik mendukung hasil yang maksimal. Yuk, datang langsung atau amankan seat kelasmu via link di bio!",
    caption:
      "Belajar dengan fasilitas modern bikin mental ujian makin siap dan percaya diri. Mau merasakannya langsung? Yuk gabung di Prima RIB! 💻🏢",
    hashtags: "#FasilitasBimbel #SimulasiCAT #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Feed Foto / Karusel 4 Slide (Foto fasilitas komputer, ruang kelas AC ber-lighting nyaman).",
    scheduled_at: "2026-10-16T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:45:00Z",
    updated_at: "2026-10-01T10:45:00Z",
  },

  // ==========================================================================
  // MINGGU 3 (FOKUS: POLRI / FLEKSIBEL) — 19 s/d 23 Oktober 2026
  // ==========================================================================
  {
    id: "cnt-11",
    content_code: "PR-2026-0011",
    title: "Syarat Tinggi Badan, Fisik & Dokumen Penting Pendaftaran Polri Terbaru",
    short_title: "Syarat Fisik & Berkas Polri",
    program_id: "prog-polri",
    pillar_id: "pil-informatif",
    format_id: "fmt-feed",
    campaign_id: "camp-m3-polri",
    objective: "Checklist informasi syarat fisik & administrasi bagi calon siswa Polri",
    target_audience: "Casis Akpol, Bintara, & Tamtama Polri",
    angle: "Minggu 3 Hari Senin — Feed Foto / Karusel 5 Slide Informatif",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Checklist Lengkap Syarat Fisik & Administrasi Pendaftaran Polri. Sudah Cek Tinggi Badanmu?",
    main_content: `Slide 1 (Cover): "Checklist Lengkap Syarat Fisik & Administrasi Pendaftaran Polri. Sudah Cek Tinggi Badanmu?"
Slide 2: Ketentuan tinggi & berat badan ideal pria dan wanita (Akpol, Bintugas, Tamtama).
Slide 3: Persyaratan nilai rata-rata rapor atau ijazah kelulusan.
Slide 4: Dokumen penting (KTP, KK, Akta Kelahiran, SKCK, Surat Sehat).
Slide 5 (CTA): "Persiapkan berkas dan fisikmu dari jauh-jauh hari! Ada pertanyaan soal syarat Polri? Tanya di komentar ya."`,
    cta: "Persiapkan berkas dan fisikmu dari jauh-jauh hari! Ada pertanyaan soal syarat Polri? Tanya di komentar ya.",
    caption:
      "Seleksi Polri menuntut kesiapan fisik dan berkas yang presisi. Jangan tunggu pendaftaran buka baru sibuk mengurus semuanya. Simpan infonya sekarang! 👮‍♂️📋",
    hashtags: "#InfoPolri #SyaratPolri #BimbelPolri #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Feed Foto / Karusel 5 Slide checklist syarat fisik & dokumen administratif seleksi Polri terbaru.",
    scheduled_at: "2026-10-19T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:50:00Z",
    updated_at: "2026-10-01T10:50:00Z",
  },
  {
    id: "cnt-12",
    content_code: "PR-2026-0012",
    title: "Bocoran Tips Lolos Tes Psikologi & Kesamaptaan Polri",
    short_title: "Tips Psikologi & Fisik Polri",
    program_id: "prog-polri",
    pillar_id: "pil-edukatif",
    format_id: "fmt-reels",
    campaign_id: "camp-m3-polri",
    objective: "Edukasi pentingnya latihan kecermatan psikotes & cicil fisik jasmani sejak dini",
    target_audience: "Casis Polri (Rotasi: CPNS / Kedinasan)",
    angle: "Minggu 3 Hari Selasa — Reels Edukatif (Durasi 35 Detik)",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Banyak yang gugur di Polri bukan karena akademik, tapi di dua tes ini! Simak baik-baik.",
    main_content: `Topik: Bocoran Tips Lolos Tes Psikologi & Kesamaptaan Polri
Durasi: 35 Detik
Opsi Rotasi Niche:
• CPNS: Cara Bedah Soal Studi Kasus TKP Anti Jebak
• Kedinasan: Rahasia Skor Aman Tembus Passing Grade STIS/IPDN
• Polri: Tips Latihan Fisik Lari & Pull Up Biar Nilai Maksimal`,
    cta: "Dapatkan modul psikotes lengkap dan bimbingan fisik terarah hanya di Prima RIB. Klik link di bio untuk info kelas!",
    caption:
      "Persiapan Polri butuh strategi matang, fisik prima, dan mental baja. Siapkan dirimu bersama pembinaan profesional Prima RIB! 👮‍♂️💪",
    hashtags: "#BimbelPolri #TesPolri #KesamaptaanPolri #PrimaRIB",
    script: `0-3s (Hook): "Banyak yang gugur di Polri bukan karena akademik, tapi di dua tes ini! Simak baik-baik."
3-22s (Body): "Pertama, psikotes Polri butuh konsistensi dan kejujuran psikologis (seperti tes kecermatan/Kecermatan Angka). Latihan kecepatan itu wajib. Kedua, kesamaptaan fisik nggak bisa dilatih mendadak seminggu sebelum tes; minimal cicil dari 3 bulan sebelumnya!"
22-35s (CTA): "Dapatkan modul psikotes lengkap dan bimbingan fisik terarah hanya di Prima RIB. Klik link di bio untuk info kelas!"`,
    creative_brief:
      "Durasi: 35 Detik | Visual Cue: Video transisi cepat antara latihan fisik (lari/push up) dan tes tulis psikotes | Audio: Musik workout/energetic.",
    scheduled_at: "2026-10-20T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T10:55:00Z",
    updated_at: "2026-10-01T10:55:00Z",
  },
  {
    id: "cnt-13",
    content_code: "PR-2026-0013",
    title: "Trik Menaklukkan Tes Kecermatan Angka (Psikotes) & Cara Hitung Skor Akademik Polri",
    short_title: "Trik Kecermatan & Skor Polri",
    program_id: "prog-polri",
    pillar_id: "pil-edukatif",
    format_id: "fmt-carousel",
    campaign_id: "camp-m3-polri",
    objective: "Panduan praktis menghadapi tes kecermatan angka & memahami bobot skor akademik Polri",
    target_audience: "Casis Bintara, Tamtama, & Akpol",
    angle: "Minggu 3 Hari Rabu — Karusel Foto 5 Slide Edukatif",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Musuh Utama Calon Anggota Polri: Cara Lolos Tes Kecermatan Angka Tanpa Panik!",
    main_content: `Slide 1 (Cover): "Musuh Utama Calon Anggota Polri: Cara Lolos Tes Kecermatan Angka Tanpa Panik!"
Slide 2: Apa itu tes kecermatan angka (kolom koran) dan apa yang sebenarnya dinilai oleh penguji (kecepatan + ketepatan).
Slide 3: Teknik memindai baris angka dan cara mengisi lembar jawaban dengan ritme stabil.
Slide 4: Latihan konsentrasi singkat untuk menghindari mental blank di tengah waktu ujian yang sangat singkat (hanya 1 menit per kolom).
Slide 5 (CTA): "Latihan simulasi psikotes Polri lengkap dengan lembar penilaian aslinya hanya di Prima RIB. Daftar sekarang!"`,
    cta: "Latihan simulasi psikotes Polri lengkap dengan lembar penilaian aslinya hanya di Prima RIB. Daftar sekarang!",
    caption:
      "Tes kecermatan butuh jam terbang latihan yang tinggi. Kalau nggak terbiasa, tangan pasti gemetar! Latih kecepatannya bareng mentor kami. ⚡📊",
    hashtags: "#PsikotesPolri #KecermatanAngka #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Karusel 5 Slide. Topik pendamping tabel Minggu 3: Cara Menghitung Skor Akumulasi Tes Akademik Polri.",
    scheduled_at: "2026-10-21T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T11:00:00Z",
    updated_at: "2026-10-01T11:00:00Z",
  },
  {
    id: "cnt-14",
    content_code: "PR-2026-0014",
    title: "Tanya Jawab (Q&A): Mitos vs Fakta Masuk Polri",
    short_title: "Q&A Mitos vs Fakta Polri",
    program_id: "prog-polri",
    pillar_id: "pil-interaktif",
    format_id: "fmt-reels",
    campaign_id: "camp-m3-polri",
    objective: "Mematahkan mitos calo & meningkatkan kepercayaan diri casis untuk belajar murni",
    target_audience: "Casis Polri & Orang Tua",
    angle: "Minggu 3 Hari Kamis — Reels Interaktif (Durasi 30 Detik)",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Mitos atau Fakta: Masuk Polri itu harus punya orang dalam? Jawabannya kita bedah!",
    main_content: `Topik: Q&A Mitos vs Fakta Masuk Polri
Durasi: 30 Detik
Opsi Rotasi Niche:
• CPNS: Q&A: Batas Usia & Formasi Favorit CPNS
• Kedinasan: Mitos vs Fakta Sekolah Kedinasan Ikatan Dinas
• Polri: Mitos vs Fakta Masuk Polri (Isu Calo vs Kemampuan Sendiri)`,
    cta: "Fokus tingkatkan kapasitas diri bareng Prima RIB. Share video ini ke teman kamu yang masih ragu!",
    caption:
      "Stop percaya mitos! Persiapan matang dengan usaha sendiri adalah koentji utama lolos Polri. Yuk gabung keluarga besar Prima RIB! 🇮🇩",
    hashtags: "#InfoPolri #MasukPolri #PrimaRIB",
    script: `0-3s (Hook): "Mitos atau Fakta: Masuk Polri itu harus punya orang dalam? Jawabannya kita bedah!"
3-20s (Body): "FAKTANYA: Seleksi sekarang sudah era CAT dan transparan. Yang menentukan lolos atau tidak murni hasil nilai kamu sendiri, psikotes, dan fisikmu! Jangan percaya calo."
20-30s (CTA): "Fokus tingkatkan kapasitas diri bareng Prima RIB. Share video ini ke teman kamu yang masih ragu!"`,
    creative_brief:
      "Durasi: 30 Detik | Visual Cue: Konsep menjawab mitos umum dengan stempel 'MITOS' atau 'FAKTA' digital di layar | Audio: Sound efek 'Boom' / transisi cepat.",
    scheduled_at: "2026-10-22T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T11:05:00Z",
    updated_at: "2026-10-01T11:05:00Z",
  },
  {
    id: "cnt-15",
    content_code: "PR-2026-0015",
    title: 'Testimoni Nyata Alumni: "Alhamdulillah Berkat Prima RIB Anak Saya Lolos!"',
    short_title: "Testimoni Alumni Prima RIB",
    program_id: "prog-polri",
    pillar_id: "pil-branding",
    format_id: "fmt-feed",
    campaign_id: "camp-m3-polri",
    objective: "Social proof bukti kelulusan nyata alumni Prima RIB",
    target_audience: "Calon siswa & orang tua",
    angle: "Minggu 3 Hari Jumat — Feed Foto / Karusel 4 Slide Branding & Testimoni",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Kata Mereka yang Berhasil Mewujudkan Mimpi: 'Terima Kasih Prima RIB, Saya Lolos!'",
    main_content: `Slide 1 (Cover): "Kata Mereka yang Berhasil Mewujudkan Mimpi: 'Terima Kasih Prima RIB, Saya Lolos!'"
Slide 2: Testimoni Alumnus A (Lolos Bintara Polri / CPNS setelah 2 kali mencoba berkat bimbingan intensif).
Slide 3: Poin penting yang mereka rasakan: modul materi yang gampang dipahami, tryout berkala, dan mental coaching dari mentor.
Slide 4 (CTA): "Giliran kamu berikutnya yang mencetak sejarah sukses tahun ini! Amankan kursimu di Prima RIB, cek link di bio."`,
    cta: "Giliran kamu berikutnya yang mencetak sejarah sukses tahun ini! Amankan kursimu di Prima RIB, cek link di bio.",
    caption:
      "Tidak ada hasil yang mengkhianati usaha. Kebahagiaan melihat nama tercantum di daftar kelulusan adalah motivasi terbaik. Yuk, susul kesuksesan mereka bersama Prima RIB! 🎓🎉",
    hashtags: "#TestimoniPrimaRIB #AlumniSukses #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Feed Foto / Karusel 4 Slide (Foto alumni berseragam / foto bahagia bersama keluarga + kutipan testimoni).",
    scheduled_at: "2026-10-23T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T11:10:00Z",
    updated_at: "2026-10-01T11:10:00Z",
  },

  // ==========================================================================
  // MINGGU 4 (FOKUS: GENERAL / CONVERSION) — 26 s/d 30 Oktober 2026
  // ==========================================================================
  {
    id: "cnt-16",
    content_code: "PR-2026-0016",
    title: "FAQ Terpenting Seputar Persiapan & Program Belajar di Bimbel Prima RIB",
    short_title: "FAQ Program Prima RIB",
    program_id: "prog-general",
    pillar_id: "pil-informatif",
    format_id: "fmt-feed",
    campaign_id: "camp-m4-general",
    objective: "Menjawab pertanyaan umum calon siswa sebelum mendaftar kelas Prima RIB",
    target_audience: "Seluruh Calon Siswa CPNS, Kedinasan, & Polri",
    angle: "Minggu 4 Hari Senin — Feed Foto / Karusel 5 Slide Informatif",
    priority: "MEDIUM",
    status: "PLANNED",
    hook: "Semua Hal yang Ingin Kamu Tahu Tentang Kelas & Program Belajar di Prima RIB (FAQ)",
    main_content: `Slide 1 (Cover): "Semua Hal yang Ingin Kamu Tahu Tentang Kelas & Program Belajar di Prima RIB (FAQ)"
Slide 2: Q: Apakah kelasnya cocok untuk pemula yang dasarnya nol? A: Sangat cocok, karena kita mulai dari konsep dasar sampai level mahir.
Slide 3: Q: Apakah ada kelas online dan offline? A: Tersedia kelas tatap muka langsung di fasilitas nyaman kami dan program intensif.
Slide 4: Q: Bagaimana cara daftarnya? A: Sangat mudah, tinggal klik tautan di bio profil kami untuk terhubung langsung dengan admin.
Slide 5 (CTA): "Punya pertanyaan lain? Jangan ragu drop di komentar atau langsung chat admin kami ya!"`,
    cta: "Punya pertanyaan lain? Jangan ragu drop di komentar atau langsung chat admin kami ya!",
    caption:
      "Punya pertanyaan seputar program kelas persiapan CPNS, Kedinasan, atau Polri di Prima RIB? Geser gambar di atas untuk temukan jawabannya! 💭✨",
    hashtags: "#FAQPrimaRIB #BimbelCPNS #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Feed Foto / Karusel 5 Slide Q&A seputar bimbel Prima RIB.",
    scheduled_at: "2026-10-26T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T11:15:00Z",
    updated_at: "2026-10-01T11:15:00Z",
  },
  {
    id: "cnt-17",
    content_code: "PR-2026-0017",
    title: "Strategi Mental Menghadapi Tekanan Hari H Ujian",
    short_title: "Strategi Mental Hari H",
    program_id: "prog-general",
    pillar_id: "pil-edukatif",
    format_id: "fmt-reels",
    campaign_id: "camp-m4-general",
    objective: "Mengedukasi pentingnya simulasi tekanan waktu lewat tryout berkala Prima RIB",
    target_audience: "Seluruh Pejuang Seleksi CPNS, Kedinasan, & Polri",
    angle: "Minggu 4 Hari Selasa — Reels Edukatif (Durasi 35 Detik)",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Udah belajar setahun tapi pas hari H ujian malah 'blank'? Ini cara atasinya.",
    main_content: `Topik: Strategi Mental Menghadapi Tekanan Hari H Ujian
Durasi: 35 Detik
Opsi Rotasi Niche:
• CPNS: Strategi Mental Menghadapi Tekanan Hari H CAT CPNS
• Kedinasan: Cara Atur Waktu Ujian SKD Kedinasan Biar Nggak Habis
• Polri: Menjaga Fokus & Mental Baja Seluruh Tahapan Seleksi Polri`,
    cta: "Jangan pertaruhkan masa depanmu dengan coba-coba. Amankan kursimu di kelas intensif Prima RIB sekarang!",
    caption:
      "Mental block saat ujian bisa dihancurkan dengan latihan rutin dan simulasi yang tepat. Siapkan mental juaramu di Prima RIB! 🧠📈",
    hashtags: "#TipsUjian #TryoutCAT #PrimaRIB",
    script: `0-3s (Hook): "Udah belajar setahun tapi pas hari H ujian malah 'blank'? Ini cara atasinya."
3-22s (Body): "Penyebab utamanya adalah kurang simulasi tekanan waktu. Di Prima RIB, kita adakan tryout berkala dengan sistem ujian persis aslinya, supaya mental kamu terbiasa di bawah tekanan waktu, dan rasa gugup berubah jadi fokus."
22-35s (CTA): "Jangan pertaruhkan masa depanmu dengan coba-coba. Amankan kursimu di kelas intensif Prima RIB sekarang!"`,
    creative_brief:
      "Durasi: 35 Detik | Visual Cue: Mentor berbicara langsung (pesan heart-to-heart menenangkan audiens) dengan suasana kelas/ruang belajar yang kondusif di latar belakang | Audio: Musik instrumen yang menenangkan/inspiratif.",
    scheduled_at: "2026-10-27T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T11:20:00Z",
    updated_at: "2026-10-01T11:20:00Z",
  },
  {
    id: "cnt-18",
    content_code: "PR-2026-0018",
    title: "Cara Mengatur Waktu (Time Management) & Bedah Soal Paling Sering Keluar Saat Ujian",
    short_title: "4 Aturan Manajemen Waktu",
    program_id: "prog-general",
    pillar_id: "pil-edukatif",
    format_id: "fmt-carousel",
    campaign_id: "camp-m4-general",
    objective: "Panduan 4 aturan manajemen waktu ujian SKD & konversi peserta tryout CAT",
    target_audience: "Seluruh Pejuang SKD & Seleksi Masuk",
    angle: "Minggu 4 Hari Rabu — Karusel Foto 5 Slide Edukatif",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Sering Kehabisan Waktu Saat Ujian? Terapkan 4 Aturan Manajemen Waktu Ini!",
    main_content: `Slide 1 (Cover): "Sering Kehabisan Waktu Saat Ujian? Terapkan 4 Aturan Manajemen Waktu Ini!"
Slide 2: Aturan 1: Jangan terpaku pada satu soal yang sulit (Tandai dan lewati dulu).
Slide 3: Aturan 2: Alokasikan waktu ideal per bagian (Contoh: TKP vs TIU vs TWK).
Slide 4: Aturan 3: Sisakan waktu 5–10 menit terakhir untuk review ulang jawaban yang ragu-ragu.
Slide 5 (CTA): "Latih manajemen waktumu lewat Tryout berkala berstandar CAT di Prima RIB. Amankan kursi belajarmu sekarang!"`,
    cta: "Latih manajemen waktumu lewat Tryout berkala berstandar CAT di Prima RIB. Amankan kursi belajarmu sekarang!",
    caption:
      "Banyak peserta pintar gagal bukan karena nggak bisa jawab soal, tapi karena manajemen waktu yang buruk! Kuasai tekniknya dari sekarang. ⏳📈",
    hashtags: "#ManajemenWaktu #TipsUjian #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Karusel 5 Slide. Topik pendamping tabel Minggu 4: Bedah Soal Paling Sering Keluar di Tahun Sebelumnya.",
    scheduled_at: "2026-10-28T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T11:25:00Z",
    updated_at: "2026-10-01T11:25:00Z",
  },
  {
    id: "cnt-19",
    content_code: "PR-2026-0019",
    title: '"This or That": Belajar Otodidak vs Les Intensif di Prima RIB',
    short_title: "Otodidak vs Les Prima RIB",
    program_id: "prog-general",
    pillar_id: "pil-interaktif",
    format_id: "fmt-reels",
    campaign_id: "camp-m4-general",
    objective: "Perbandingan visual belajar sendiri vs dibimbing mentor expert Prima RIB",
    target_audience: "Pejuang NIP / Kedinasan / Polri 2026",
    angle: "Minggu 4 Hari Kamis — Reels Interaktif (Durasi 25 Detik)",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Pejuang NIP/Kedinasan/Polri 2026, kalian tim mana nih?",
    main_content: `Topik: This or That: Belajar Otodidak vs Les Intensif di Prima RIB
Durasi: 25 Detik
Opsi Rotasi Niche:
• CPNS: This or That: Belajar Otodidak vs Les Intensif CPNS
• Kedinasan: This or That: Fokus STAN atau IPDN?
• Polri: This or That: Latihan Fisik Sendiri vs Bareng Bimbel Polri`,
    cta: "Pasti pilih Tim B kan? Yuk, amankan kuota pendaftaran kelas baru Prima RIB bulan ini. Klik link di bio!",
    caption:
      "Pilih jalan pintas yang efektif buat lulus seleksi impianmu. Daftar di Prima RIB dan raih masa depanmu! 🌟👇",
    hashtags: "#BimbelTerbaik #CpnsKedinasanPolri #PrimaRIB",
    script: `0-3s (Hook): "Pejuang NIP/Kedinasan/Polri 2026, kalian tim mana nih?"
3-15s (Body): "Tim A: Belajar sendiri pusing cari materi dan gak tau salah di mana? Atau Tim B: Belajar terarah, dapat modul eksklusif, dibimbing mentor, dan langsung tahu trik cepat?"
15-25s (CTA): "Pasti pilih Tim B kan? Yuk, amankan kuota pendaftaran kelas baru Prima RIB bulan ini. Klik link di bio!"`,
    creative_brief:
      "Durasi: 25 Detik | Visual Cue: Skrin terbelah dua (Split screen) menunjukkan skenario belajar sendirian tumpukan buku vs belajar terarah di kelas modern Prima RIB | Audio: Musik tren yang fun.",
    scheduled_at: "2026-10-29T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T11:30:00Z",
    updated_at: "2026-10-01T11:30:00Z",
  },
  {
    id: "cnt-20",
    content_code: "PR-2026-0020",
    title: "Info Pembukaan Kelas Baru & Diskon Pendaftaran Batch Bulan Ini Prima RIB",
    short_title: "Promo Kelas Baru Prima RIB",
    program_id: "prog-general",
    pillar_id: "pil-promosi",
    format_id: "fmt-feed",
    campaign_id: "camp-m4-general",
    objective: "Konversi pendaftaran siswa baru batch bulan ini dengan urgency kuota terbatas",
    target_audience: "Seluruh Calon Siswa CPNS, Sekolah Kedinasan, & Polri",
    angle: "Minggu 4 Hari Jumat — Feed Foto / Karusel 3 Slide Promosi & Konversi",
    priority: "HIGH",
    status: "PLANNED",
    hook: "Pendaftaran Batch Baru Telah Dibuka! Amankan Kursimu dan Mulai Perjalanan Lolos Seleksi Bersama Prima RIB.",
    main_content: `Slide 1 (Cover): "Pendaftaran Batch Baru Telah Dibuka! Amankan Kursimu dan Mulai Perjalanan Lolos Seleksi Bersama Prima RIB."
Slide 2: Benefit Eksklusif: Modul lengkap, Tryout CAT berkala, Bimbingan intensif mentor expert, dan kuota kelas terbatas demi fokus maksimal.
Slide 3 (CTA): "Kuota kelas terbatas untuk menjaga kualitas bimbingan! Segera daftarkan dirimu hari ini. Klik link di bio untuk klaim kursi dan info pendaftaran!"`,
    cta: "Kuota kelas terbatas untuk menjaga kualitas bimbingan! Segera daftarkan dirimu hari ini. Klik link di bio untuk klaim kursi dan info pendaftaran!",
    caption:
      "Persiapan terbaik dimulai dari keputusan hari ini. Jangan tunda impianmu berseragam atau ber-NIP tahun ini! Daftar sekarang di Prima RIB sebelum kuota penuh. 🚀🔥",
    hashtags: "#PendaftaranBimbel #CpnsKedinasanPolri #PrimaRIB",
    script: "",
    creative_brief:
      "Format: Feed Foto / Karusel 3 Slide (Desain poster promo yang elegan, bersih, dengan urgency tinggi).",
    scheduled_at: "2026-10-30T19:00:00+08:00",
    source_idea_id: null,
    created_by: "user-idam",
    created_at: "2026-10-01T11:35:00Z",
    updated_at: "2026-10-01T11:35:00Z",
  },
];

// Setiap konten terjadwal memiliki target output IG / FB / TT sesuai dokumen Schedule Post
const INITIAL_CONTENT_PLATFORMS: ContentPlatform[] = INITIAL_CONTENTS.flatMap(
  (cnt) =>
    ["plat-ig", "plat-fb", "plat-tt"].map((platId) => ({
      id: `cp-${cnt.id}-${platId}`,
      content_id: cnt.id,
      platform_id: platId,
      scheduled_at: cnt.scheduled_at,
      published_at: null,
      post_url: null,
      created_at: cnt.created_at,
      updated_at: cnt.updated_at,
    }))
);

const INITIAL_ASSIGNMENTS: ContentAssignment[] = INITIAL_CONTENTS.flatMap(
  (cnt) => [
    {
      id: `asg-${cnt.id}-planner`,
      content_id: cnt.id,
      user_id: "user-idam",
      assignment_type: "PLANNER" as AssignmentType,
      task_notes: "Master Content Plan & Schedule Post",
      deadline: cnt.scheduled_at,
      created_at: cnt.created_at,
      updated_at: cnt.updated_at,
    },
    {
      id: `asg-${cnt.id}-copy`,
      content_id: cnt.id,
      user_id: "user-budi",
      assignment_type: "COPYWRITER" as AssignmentType,
      task_notes: "Hook, Slide / Script VO & Caption",
      deadline: cnt.scheduled_at,
      created_at: cnt.created_at,
      updated_at: cnt.updated_at,
    },
    {
      id: `asg-${cnt.id}-prod`,
      content_id: cnt.id,
      user_id: cnt.format_id === "fmt-reels" ? "user-deni" : "user-citra",
      assignment_type: (cnt.format_id === "fmt-reels"
        ? "VIDEO_EDITOR"
        : "DESIGNER") as AssignmentType,
      task_notes:
        cnt.format_id === "fmt-reels"
          ? "Produksi Reels Video (IG/FB/TT)"
          : "Desain Feed / Karusel Foto",
      deadline: cnt.scheduled_at,
      created_at: cnt.created_at,
      updated_at: cnt.updated_at,
    },
    {
      id: `asg-${cnt.id}-rev`,
      content_id: cnt.id,
      user_id: "user-eko",
      assignment_type: "REVIEWER" as AssignmentType,
      task_notes: "QC Materi & Visual Prima RIB",
      deadline: cnt.scheduled_at,
      created_at: cnt.created_at,
      updated_at: cnt.updated_at,
    },
  ]
);

const INITIAL_ASSETS: ContentAsset[] = [];

const INITIAL_REVIEWS: ContentReview[] = [];

const INITIAL_ANALYTICS: ContentAnalytics[] = [];

const INITIAL_ACTIVITIES: ContentActivity[] = INITIAL_CONTENTS.map((cnt) => ({
  id: `act-init-${cnt.id}`,
  content_id: cnt.id,
  user_id: "user-idam",
  action: "CREATED",
  description: `Master Content Plan: ${cnt.content_code} — ${cnt.title} dijadwalkan pada ${(cnt.angle || "").split("—")[0].trim()}`,
  created_at: cnt.created_at,
}));

function normalizeProgramId(progId: string | null | undefined, idx: number): string {
  if (progId === "prog-cpns" || progId === "prog-sekdin" || progId === "prog-polri") {
    return progId;
  }
  const fallback = ["prog-cpns", "prog-sekdin", "prog-polri"];
  return fallback[idx % 3];
}

function normalizePillarId(pilId: string | null | undefined): string {
  if (
    pilId === "pil-edukatif" ||
    pilId === "pil-informatif" ||
    pilId === "pil-interaktif" ||
    pilId === "pil-branding"
  ) {
    return pilId;
  }
  if (pilId === "pil-promosi") return "pil-branding";
  return "pil-edukatif";
}

function inferDefaultReelTalent(cnt: Content, idx: number): string | null {
  if (cnt.format_id !== "fmt-reels") return null;
  if (cnt.talent_category) return cnt.talent_category;
  const brief = `${cnt.creative_brief || ""} ${cnt.main_content || ""}`.toLowerCase();
  if (brief.includes("siswa")) return "Siswa";
  if (brief.includes("talent")) return "Talent Model";
  if (cnt.pillar_id === "pil-interaktif" && idx % 2 === 1) return "Siswa";
  if (cnt.pillar_id === "pil-informatif" || cnt.pillar_id === "pil-branding") {
    return "Talent Model";
  }
  return "Mentor / Pengajar";
}

function getDefaultState(): AppDatabaseState {
  const normalizedContents: Content[] = INITIAL_CONTENTS.map((cnt, idx) => {
    const pillar_id = normalizePillarId(cnt.pillar_id);
    const program_id = normalizeProgramId(cnt.program_id, idx);
    const normalized: Content = {
      ...cnt,
      program_id,
      pillar_id,
      status: cnt.scheduled_at ? "SCHEDULED" : "PLANNED",
    };
    normalized.talent_category = inferDefaultReelTalent(normalized, idx);
    return normalized;
  });

  const normalizedIdeas: Idea[] = INITIAL_IDEAS.map((idea, idx) => ({
    ...idea,
    program_id: normalizeProgramId(idea.program_id, idx),
    pillar_id: normalizePillarId(idea.pillar_id),
  }));

  return {
    users: SEED_USERS,
    programs: SEED_PROGRAMS,
    pillars: SEED_PILLARS,
    formats: SEED_FORMATS,
    platforms: SEED_PLATFORMS,
    campaigns: SEED_CAMPAIGNS,
    ideas: normalizedIdeas,
    contents: normalizedContents,
    contentPlatforms: INITIAL_CONTENT_PLATFORMS,
    contentAssignments: INITIAL_ASSIGNMENTS,
    contentAssets: INITIAL_ASSETS,
    contentReviews: INITIAL_REVIEWS,
    contentAnalytics: INITIAL_ANALYTICS,
    contentActivities: INITIAL_ACTIVITIES,
    nextSequence: 21,
  };
}

export function loadStore(): AppDatabaseState {
  if (typeof window === "undefined") {
    return getDefaultState();
  }
  try {
    // Bersihkan storage dummy versi lama jika masih ada
    for (const oldKey of LEGACY_STORAGE_KEYS) {
      if (window.localStorage.getItem(oldKey)) {
        window.localStorage.removeItem(oldKey);
      }
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as AppDatabaseState;

    // Pastikan setiap konten Reel yang tersimpan di localStorage memiliki talent_category valid
    let needsMigration = false;
    if (Array.isArray(parsed.contents)) {
      parsed.contents = parsed.contents.map((cnt) => {
        if (cnt.format_id === "fmt-reels" && !cnt.talent_category) {
          needsMigration = true;
          return {
            ...cnt,
            talent_category: "Mentor / Pengajar",
          };
        }
        return cnt;
      });
    }
    if (needsMigration) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return getDefaultState();
  }
}

let isPushingToCloud = false;
let lastLocalSaveMs = 0;

export async function pushStateToSupabaseCloud(
  state: AppDatabaseState
): Promise<void> {
  if (typeof window === "undefined") return;
  isPushingToCloud = true;
  lastLocalSaveMs = Date.now();
  try {
    await fetch("/api/cloud-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state_json: state,
      }),
    });
  } catch {
    // Abaikan jika sedang offline, data tetap aman di localStorage
  } finally {
    isPushingToCloud = false;
  }
}

export async function pullStateFromSupabaseCloud(): Promise<AppDatabaseState | null> {
  if (typeof window === "undefined") return null;
  // Jangan timpa state lokal jika user baru saja melakukan perubahan < 3 detik lalu
  if (isPushingToCloud || Date.now() - lastLocalSaveMs < 3000) {
    return null;
  }
  try {
    const res = await fetch(`/api/cloud-state?t=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (isPushingToCloud || Date.now() - lastLocalSaveMs < 3000) {
      return null;
    }
    if (data?.state_json) {
      const cloudState = data.state_json as AppDatabaseState;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
      return cloudState;
    }
    // Jika tabel di Supabase masih kosong, unggah state awal sekarang
    const currentLocal = loadStore();
    await pushStateToSupabaseCloud(currentLocal);
    return currentLocal;
  } catch {
    return null;
  }
}

export function saveStore(state: AppDatabaseState): void {
  if (typeof window === "undefined") return;
  lastLocalSaveMs = Date.now();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(STORE_EVENT));
  void pushStateToSupabaseCloud(state);
}

export function resetStoreToDefault(): AppDatabaseState {
  const initial = getDefaultState();
  saveStore(initial);
  return initial;
}

// ============================================================================
// HELPER QUERIES & ENRICHED RELATIONS
// ============================================================================
export function enrichContent(
  content: Content,
  state: AppDatabaseState
): ContentWithRelations {
  const program = state.programs.find((p) => p.id === content.program_id) || null;
  const pillar = state.pillars.find((p) => p.id === content.pillar_id) || null;
  const format = state.formats.find((f) => f.id === content.format_id) || null;
  const campaign =
    state.campaigns.find((c) => c.id === content.campaign_id) || null;

  const isReel =
    content.format_id === "fmt-reels" ||
    (format?.name || "").toLowerCase().includes("reel");
  const normalizedTalentCategory = isReel
    ? content.talent_category || "Mentor / Pengajar"
    : null;

  const platforms = state.contentPlatforms
    .filter((cp) => cp.content_id === content.id)
    .map((cp) => {
      const platform =
        state.platforms.find((p) => p.id === cp.platform_id) ||
        state.platforms[0];
      const analytics =
        state.contentAnalytics.find(
          (a) => a.content_platform_id === cp.id
        ) || null;
      return { ...cp, platform, analytics };
    });

  const assignments = state.contentAssignments
    .filter((ca) => ca.content_id === content.id)
    .map((ca) => {
      const user =
        state.users.find((u) => u.id === ca.user_id) || state.users[0];
      return { ...ca, user };
    });

  const assets = state.contentAssets
    .filter((ast) => ast.content_id === content.id)
    .map((ast) => ({
      ...ast,
      uploader: state.users.find((u) => u.id === ast.uploaded_by) || null,
    }));

  const reviews = state.contentReviews
    .filter((rev) => rev.content_id === content.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((rev) => ({
      ...rev,
      reviewer: state.users.find((u) => u.id === rev.reviewer_id) || null,
    }));

  const activities = state.contentActivities
    .filter((act) => act.content_id === content.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((act) => ({
      ...act,
      user: state.users.find((u) => u.id === act.user_id) || null,
    }));

  return {
    ...content,
    talent_category: normalizedTalentCategory,
    program,
    pillar,
    format,
    campaign,
    platforms,
    assignments,
    assets,
    reviews,
    activities,
  };
}

export function enrichIdea(
  idea: Idea,
  state: AppDatabaseState
): IdeaWithRelations {
  return {
    ...idea,
    program: state.programs.find((p) => p.id === idea.program_id) || null,
    pillar: state.pillars.find((p) => p.id === idea.pillar_id) || null,
    creator: state.users.find((u) => u.id === idea.created_by) || null,
  };
}

// ============================================================================
// MUTATION ACTIONS
// ============================================================================
function logActivity(
  state: AppDatabaseState,
  contentId: string,
  action: ActivityAction,
  description: string
) {
  const currentUser = getLocalCurrentUser();
  const entry: ContentActivity = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    content_id: contentId,
    user_id: currentUser.id,
    action,
    description,
    created_at: new Date().toISOString(),
  };
  state.contentActivities = [entry, ...state.contentActivities];
}

export function createIdeaAction(input: {
  title: string;
  description?: string;
  program_id?: string;
  pillar_id?: string;
  format_id?: string | null;
  talent_category?: string | null;
  source?: string;
  priority: PriorityLevel;
}): Idea {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const now = new Date().toISOString();
  const newIdea: Idea = {
    id: `idea-${Date.now()}`,
    title: input.title,
    description: input.description || "",
    program_id: input.program_id || state.programs[0]?.id || null,
    pillar_id: input.pillar_id || state.pillars[0]?.id || null,
    format_id: input.format_id || null,
    talent_category: input.talent_category || null,
    source: input.source || "Input Konten",
    priority: input.priority,
    status: "NEW",
    created_by: currentUser.id,
    created_at: now,
    updated_at: now,
  };
  state.ideas = [newIdea, ...state.ideas];
  saveStore(state);
  return newIdea;
}

export function updateIdeaStatusAction(ideaId: string, status: IdeaStatus) {
  const state = loadStore();
  state.ideas = state.ideas.map((i) =>
    i.id === ideaId
      ? { ...i, status, updated_at: new Date().toISOString() }
      : i
  );
  saveStore(state);
}

export function updateIdeaAction(
  ideaId: string,
  updates: Partial<
    Pick<
      Idea,
      | "title"
      | "description"
      | "program_id"
      | "pillar_id"
      | "format_id"
      | "talent_category"
      | "source"
      | "priority"
      | "status"
    >
  >
) {
  const state = loadStore();
  state.ideas = state.ideas.map((i) =>
    i.id === ideaId
      ? { ...i, ...updates, updated_at: new Date().toISOString() }
      : i
  );
  saveStore(state);
}

export function createContentAction(input: {
  title: string;
  short_title?: string;
  program_id: string;
  pillar_id: string;
  format_id: string;
  talent_category?: string | null;
  campaign_id?: string | null;
  platform_ids: string[];
  objective?: string;
  target_audience?: string;
  angle?: string;
  priority: PriorityLevel;
  scheduled_at?: string | null;
  hook?: string;
  main_content?: string;
  cta?: string;
  caption?: string;
  hashtags?: string;
  script?: string;
  creative_brief?: string;
  source_idea_id?: string | null;
  assignments?: Partial<Record<AssignmentType, string>>;
}): Content {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const now = new Date().toISOString();
  const seq = state.nextSequence || state.contents.length + 1;
  const contentCode = `PR-2026-${String(seq).padStart(4, "0")}`;

  const newContent: Content = {
    id: `cnt-${Date.now()}`,
    content_code: contentCode,
    title: input.title,
    short_title: input.short_title || input.title.slice(0, 28),
    program_id: input.program_id,
    pillar_id: input.pillar_id,
    format_id: input.format_id,
    talent_category: input.talent_category || null,
    campaign_id: input.campaign_id || null,
    objective: input.objective || "",
    target_audience: input.target_audience || "",
    angle: input.angle || "",
    priority: input.priority,
    status: input.scheduled_at ? "SCHEDULED" : "PLANNED",
    hook: input.hook || "",
    main_content: input.main_content || "",
    cta: input.cta || "",
    caption: input.caption || "",
    hashtags: input.hashtags || "",
    script: input.script || "",
    creative_brief: input.creative_brief || "",
    scheduled_at: input.scheduled_at || null,
    source_idea_id: input.source_idea_id || null,
    created_by: currentUser.id,
    created_at: now,
    updated_at: now,
  };

  state.contents = [newContent, ...state.contents];
  state.nextSequence = seq + 1;

  // Insert content_platforms
  const platformIds =
    input.platform_ids.length > 0
      ? input.platform_ids
      : [state.platforms[0]?.id || "plat-ig"];
  platformIds.forEach((platId, idx) => {
    state.contentPlatforms.push({
      id: `cp-${Date.now()}-${idx}`,
      content_id: newContent.id,
      platform_id: platId,
      scheduled_at: input.scheduled_at || null,
      published_at: null,
      post_url: null,
      created_at: now,
      updated_at: now,
    });
  });

  // Insert content_assignments
  if (input.assignments) {
    (Object.keys(input.assignments) as AssignmentType[]).forEach(
      (type, idx) => {
        const userId = input.assignments?.[type];
        if (userId) {
          state.contentAssignments.push({
            id: `asg-${Date.now()}-${idx}`,
            content_id: newContent.id,
            user_id: userId,
            assignment_type: type,
            task_notes: null,
            deadline: input.scheduled_at || null,
            created_at: now,
            updated_at: now,
          });
        }
      }
    );
  }

  // If converted from an Idea, update Idea status to PLANNED
  if (input.source_idea_id) {
    state.ideas = state.ideas.map((idea) =>
      idea.id === input.source_idea_id
        ? { ...idea, status: "PLANNED", updated_at: now }
        : idea
    );
  }

  logActivity(
    state,
    newContent.id,
    "CREATED",
    `${currentUser.full_name} membuat content ${newContent.content_code} (${newContent.title})${
      input.source_idea_id ? " dari Idea Bank" : ""
    }`
  );

  saveStore(state);
  return newContent;
}

export function updateContentAction(
  contentId: string,
  updates: Partial<Content>,
  platformIds?: string[]
) {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const now = new Date().toISOString();
  const target = state.contents.find((c) => c.id === contentId);
  if (!target) return;

  state.contents = state.contents.map((c) =>
    c.id === contentId ? { ...c, ...updates, updated_at: now } : c
  );

  if (platformIds && platformIds.length > 0) {
    const existing = state.contentPlatforms.filter(
      (cp) => cp.content_id === contentId
    );
    const kept = existing.filter((cp) => platformIds.includes(cp.platform_id));
    const existingPlatIds = kept.map((cp) => cp.platform_id);
    const added: ContentPlatform[] = platformIds
      .filter((pid) => !existingPlatIds.includes(pid))
      .map((pid, idx) => ({
        id: `cp-${Date.now()}-${idx}`,
        content_id: contentId,
        platform_id: pid,
        scheduled_at: updates.scheduled_at ?? target.scheduled_at ?? null,
        published_at: null,
        post_url: null,
        created_at: now,
        updated_at: now,
      }));

    state.contentPlatforms = [
      ...state.contentPlatforms.filter((cp) => cp.content_id !== contentId),
      ...kept,
      ...added,
    ];
  }

  logActivity(
    state,
    contentId,
    "UPDATED",
    `${currentUser.full_name} memperbarui detail content ${target.content_code}`
  );

  saveStore(state);
}

export function changeContentStatusAction(
  contentId: string,
  newStatus: ContentStatus,
  note?: string
) {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const target = state.contents.find((c) => c.id === contentId);
  if (!target || target.status === newStatus) return;

  const oldStatus = target.status;
  state.contents = state.contents.map((c) =>
    c.id === contentId
      ? { ...c, status: newStatus, updated_at: new Date().toISOString() }
      : c
  );

  logActivity(
    state,
    contentId,
    "STATUS_CHANGED",
    `${currentUser.full_name} mengubah status ${target.content_code}: ${oldStatus} → ${newStatus}${
      note ? ` (${note})` : ""
    }`
  );

  saveStore(state);
}

export function updateContentAssignmentsAction(
  contentId: string,
  assignments: Partial<Record<AssignmentType, string>>
) {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const target = state.contents.find((c) => c.id === contentId);
  if (!target) return;

  const now = new Date().toISOString();
  const otherAssignments = state.contentAssignments.filter(
    (ca) => ca.content_id !== contentId
  );

  const updatedForContent: ContentAssignment[] = [];
  (Object.keys(assignments) as AssignmentType[]).forEach((type, idx) => {
    const userId = assignments[type];
    if (userId) {
      updatedForContent.push({
        id: `asg-${Date.now()}-${idx}`,
        content_id: contentId,
        user_id: userId,
        assignment_type: type,
        task_notes: null,
        deadline: target.scheduled_at,
        created_at: now,
        updated_at: now,
      });
    }
  });

  state.contentAssignments = [...otherAssignments, ...updatedForContent];

  logActivity(
    state,
    contentId,
    "ASSIGNED",
    `${currentUser.full_name} memperbarui penugasan PIC pada ${target.content_code}`
  );

  saveStore(state);
}

export function submitReviewDecisionAction(input: {
  contentId: string;
  decision: ReviewDecision;
  comment: string;
}) {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const target = state.contents.find((c) => c.id === input.contentId);
  if (!target) return;

  const now = new Date().toISOString();
  const review: ContentReview = {
    id: `rev-${Date.now()}`,
    content_id: input.contentId,
    reviewer_id: currentUser.id,
    decision: input.decision,
    comment: input.comment,
    created_at: now,
  };
  state.contentReviews = [review, ...state.contentReviews];

  const nextStatus: ContentStatus =
    input.decision === "APPROVED" ? "APPROVED" : "REVISION";
  state.contents = state.contents.map((c) =>
    c.id === input.contentId ? { ...c, status: nextStatus, updated_at: now } : c
  );

  logActivity(
    state,
    input.contentId,
    input.decision === "APPROVED" ? "APPROVED" : "REVISION_REQUESTED",
    input.decision === "APPROVED"
      ? `${currentUser.full_name} menyetujui (APPROVED) ${target.content_code}${
          input.comment ? `: "${input.comment}"` : ""
        }`
      : `${currentUser.full_name} meminta revisi pada ${target.content_code}: "${input.comment}"`
  );

  saveStore(state);
}

export function scheduleContentAction(input: {
  contentId: string;
  scheduledAt: string;
}) {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const target = state.contents.find((c) => c.id === input.contentId);
  if (!target) return;

  const now = new Date().toISOString();
  state.contents = state.contents.map((c) =>
    c.id === input.contentId
      ? {
          ...c,
          scheduled_at: input.scheduledAt,
          status: "SCHEDULED",
          updated_at: now,
        }
      : c
  );

  state.contentPlatforms = state.contentPlatforms.map((cp) =>
    cp.content_id === input.contentId
      ? { ...cp, scheduled_at: input.scheduledAt, updated_at: now }
      : cp
  );

  logActivity(
    state,
    input.contentId,
    "SCHEDULED",
    `${currentUser.full_name} menjadwalkan tayang ${target.content_code}`
  );

  saveStore(state);
}

export function markContentPublishedAction(input: {
  contentId: string;
  publishedAt: string;
  postUrl: string;
}) {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const target = state.contents.find((c) => c.id === input.contentId);
  if (!target) return;

  const now = new Date().toISOString();
  state.contents = state.contents.map((c) =>
    c.id === input.contentId
      ? { ...c, status: "PUBLISHED", updated_at: now }
      : c
  );

  state.contentPlatforms = state.contentPlatforms.map((cp) =>
    cp.content_id === input.contentId
      ? {
          ...cp,
          published_at: input.publishedAt,
          post_url: input.postUrl || cp.post_url,
          updated_at: now,
        }
      : cp
  );

  logActivity(
    state,
    input.contentId,
    "PUBLISHED",
    `${currentUser.full_name} menandai ${target.content_code} sebagai PUBLISHED`
  );

  saveStore(state);
}

export function duplicateContentAction(contentId: string): Content | null {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const source = state.contents.find((c) => c.id === contentId);
  if (!source) return null;

  const now = new Date().toISOString();
  const seq = state.nextSequence || state.contents.length + 1;
  const contentCode = `PR-2026-${String(seq).padStart(4, "0")}`;

  const duplicated: Content = {
    ...source,
    id: `cnt-${Date.now()}`,
    content_code: contentCode,
    title: `${source.title} (Copy)`,
    status: "PLANNED",
    scheduled_at: null,
    created_by: currentUser.id,
    created_at: now,
    updated_at: now,
  };

  state.contents = [duplicated, ...state.contents];
  state.nextSequence = seq + 1;

  // Copy platform links without published_at / post_url
  const sourcePlatforms = state.contentPlatforms.filter(
    (cp) => cp.content_id === source.id
  );
  sourcePlatforms.forEach((cp, idx) => {
    state.contentPlatforms.push({
      id: `cp-${Date.now()}-${idx}`,
      content_id: duplicated.id,
      platform_id: cp.platform_id,
      scheduled_at: null,
      published_at: null,
      post_url: null,
      created_at: now,
      updated_at: now,
    });
  });

  logActivity(
    state,
    duplicated.id,
    "CREATED",
    `${currentUser.full_name} menduplikasi ${source.content_code} menjadi ${duplicated.content_code}`
  );

  saveStore(state);
  return duplicated;
}

export function addContentAssetAction(input: {
  contentId: string;
  assetType: AssetType;
  fileName: string;
  filePath?: string;
  fileUrl?: string;
}) {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const target = state.contents.find((c) => c.id === input.contentId);
  if (!target) return;

  const asset: ContentAsset = {
    id: `ast-${Date.now()}`,
    content_id: input.contentId,
    asset_type: input.assetType,
    file_name: input.fileName,
    file_path:
      input.filePath ||
      `content-assets/${target.content_code}/${input.assetType.toLowerCase()}/${input.fileName}`,
    file_url:
      input.fileUrl ||
      `https://placehold.co/1080x1080/284078/DDB02E?text=${encodeURIComponent(
        input.fileName
      )}`,
    uploaded_by: currentUser.id,
    created_at: new Date().toISOString(),
  };

  state.contentAssets = [asset, ...state.contentAssets];
  logActivity(
    state,
    input.contentId,
    "ASSET_UPLOADED",
    `${currentUser.full_name} mengupload asset ${input.fileName} (${input.assetType})`
  );
  saveStore(state);
}

export function removeContentAssetAction(assetId: string) {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const asset = state.contentAssets.find((a) => a.id === assetId);
  if (!asset) return;

  state.contentAssets = state.contentAssets.filter((a) => a.id !== assetId);
  logActivity(
    state,
    asset.content_id,
    "UPDATED",
    `${currentUser.full_name} menghapus asset ${asset.file_name} (${asset.asset_type})`
  );
  saveStore(state);
}

export function upsertAnalyticsAction(input: {
  contentPlatformId: string;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers: number;
}) {
  const state = loadStore();
  const currentUser = getLocalCurrentUser();
  const cp = state.contentPlatforms.find(
    (item) => item.id === input.contentPlatformId
  );
  if (!cp) return;

  const er = calculateEngagementRate(input);
  const now = new Date().toISOString();
  const existing = state.contentAnalytics.find(
    (a) => a.content_platform_id === input.contentPlatformId
  );

  if (existing) {
    state.contentAnalytics = state.contentAnalytics.map((a) =>
      a.content_platform_id === input.contentPlatformId
        ? { ...a, ...input, engagement_rate: er, updated_at: now }
        : a
    );
  } else {
    state.contentAnalytics.push({
      id: `anl-${Date.now()}`,
      content_platform_id: input.contentPlatformId,
      ...input,
      engagement_rate: er,
      recorded_at: now,
      updated_at: now,
    });
  }

  logActivity(
    state,
    cp.content_id,
    "ANALYTICS_UPDATED",
    `${currentUser.full_name} memperbarui data analytics (ER: ${er}%)`
  );
  saveStore(state);
}

export function addMasterDataAction(
  category: "programs" | "pillars" | "formats" | "platforms" | "campaigns",
  payload: { name: string; code?: string; description?: string; start_date?: string; end_date?: string }
) {
  const state = loadStore();
  const now = new Date().toISOString();

  if (category === "programs") {
    state.programs.push({
      id: `prog-${Date.now()}`,
      name: payload.name,
      code: (payload.code || payload.name).toUpperCase(),
      description: payload.description || "",
      is_active: true,
      created_at: now,
      updated_at: now,
    });
  } else if (category === "pillars") {
    state.pillars.push({
      id: `pil-${Date.now()}`,
      name: payload.name,
      description: payload.description || "",
      is_active: true,
      created_at: now,
      updated_at: now,
    });
  } else if (category === "formats") {
    state.formats.push({
      id: `fmt-${Date.now()}`,
      name: payload.name,
      description: payload.description || "",
      is_active: true,
      created_at: now,
      updated_at: now,
    });
  } else if (category === "platforms") {
    state.platforms.push({
      id: `plat-${Date.now()}`,
      name: payload.name,
      code: (payload.code || payload.name.slice(0, 2)).toUpperCase(),
      is_active: true,
      created_at: now,
    });
  } else if (category === "campaigns") {
    state.campaigns.push({
      id: `camp-${Date.now()}`,
      name: payload.name,
      description: payload.description || "",
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
  }

  saveStore(state);
}

export function toggleMasterDataActiveAction(
  category: "programs" | "pillars" | "formats" | "platforms" | "campaigns",
  id: string
) {
  const state = loadStore();
  if (category === "programs") {
    state.programs = state.programs.map((item) =>
      item.id === id ? { ...item, is_active: !item.is_active } : item
    );
  } else if (category === "pillars") {
    state.pillars = state.pillars.map((item) =>
      item.id === id ? { ...item, is_active: !item.is_active } : item
    );
  } else if (category === "formats") {
    state.formats = state.formats.map((item) =>
      item.id === id ? { ...item, is_active: !item.is_active } : item
    );
  } else if (category === "platforms") {
    state.platforms = state.platforms.map((item) =>
      item.id === id ? { ...item, is_active: !item.is_active } : item
    );
  } else if (category === "campaigns") {
    state.campaigns = state.campaigns.map((item) =>
      item.id === id ? { ...item, is_active: !item.is_active } : item
    );
  }
  saveStore(state);
}

export function addUserAction(input: {
  full_name: string;
  email: string;
  roles: RoleName[];
}): Profile {
  const state = loadStore();
  const now = new Date().toISOString();
  const newUser: Profile = {
    id: `user-${Date.now()}`,
    full_name: input.full_name.trim(),
    email: input.email.trim(),
    is_active: true,
    roles: input.roles.length > 0 ? input.roles : ["Content Planner"],
    created_at: now,
    updated_at: now,
  };
  state.users = [...state.users, newUser];
  saveStore(state);
  return newUser;
}

export function updateUserAction(
  userId: string,
  updates: {
    full_name: string;
    email: string;
    roles: RoleName[];
    is_active: boolean;
  }
) {
  const state = loadStore();
  const now = new Date().toISOString();
  state.users = state.users.map((u) =>
    u.id === userId
      ? {
          ...u,
          full_name: updates.full_name.trim() || u.full_name,
          email: updates.email.trim() || u.email,
          roles: updates.roles.length > 0 ? updates.roles : u.roles,
          is_active: updates.is_active,
          updated_at: now,
        }
      : u
  );
  saveStore(state);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("primarib-auth-change"));
  }
}

export function toggleUserActiveAction(userId: string) {
  const state = loadStore();
  const now = new Date().toISOString();
  state.users = state.users.map((u) =>
    u.id === userId ? { ...u, is_active: !u.is_active, updated_at: now } : u
  );
  saveStore(state);
}

export function deleteContentPermanentlyAction(contentId: string) {
  const state = loadStore();
  state.contents = state.contents.filter((c) => c.id !== contentId);
  state.contentPlatforms = state.contentPlatforms.filter(
    (cp) => cp.content_id !== contentId
  );
  state.contentAssignments = state.contentAssignments.filter(
    (ca) => ca.content_id !== contentId
  );
  state.contentAssets = state.contentAssets.filter(
    (ast) => ast.content_id !== contentId
  );
  state.contentReviews = state.contentReviews.filter(
    (rev) => rev.content_id !== contentId
  );
  state.contentActivities = state.contentActivities.filter(
    (act) => act.content_id !== contentId
  );
  saveStore(state);
}

export function deleteIdeaPermanentlyAction(ideaId: string) {
  const state = loadStore();
  state.ideas = state.ideas.filter((i) => i.id !== ideaId);
  saveStore(state);
}

export function clearAllContentsAndIdeasAction() {
  const state = loadStore();
  state.contents = [];
  state.ideas = [];
  state.contentPlatforms = [];
  state.contentAssignments = [];
  state.contentAssets = [];
  state.contentReviews = [];
  state.contentActivities = [];
  state.nextSequence = 1;
  saveStore(state);
}

export function unscheduleContentAction(contentId: string) {
  const state = loadStore();
  const now = new Date().toISOString();
  state.contents = state.contents.map((c) =>
    c.id === contentId
      ? {
          ...c,
          scheduled_at: null,
          status: "PLANNED",
          updated_at: now,
        }
      : c
  );
  state.contentPlatforms = state.contentPlatforms.map((cp) =>
    cp.content_id === contentId
      ? { ...cp, scheduled_at: null, updated_at: now }
      : cp
  );
  saveStore(state);
}

export function clearAllScheduledCalendarAction() {
  const state = loadStore();
  const now = new Date().toISOString();
  state.contents = state.contents.map((c) => ({
    ...c,
    scheduled_at: null,
    status: "PLANNED",
    updated_at: now,
  }));
  state.contentPlatforms = state.contentPlatforms.map((cp) => ({
    ...cp,
    scheduled_at: null,
    updated_at: now,
  }));
  saveStore(state);
}

// ============================================================================
// REACT HOOK FOR REACTIVE STORE ACCESS
// ============================================================================
export function useAppStore() {
  const [state, setState] = useState<AppDatabaseState>(() => getDefaultState());
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setState(loadStore());
  }, []);

  useEffect(() => {
    setState(loadStore());
    setHydrated(true);

    // Tarik data terbaru dari Supabase Cloud saat halaman dibuka
    const syncFromCloud = async () => {
      const cloudState = await pullStateFromSupabaseCloud();
      if (cloudState) {
        setState(cloudState);
      }
    };
    void syncFromCloud();

    const handleUpdate = () => {
      setState(loadStore());
    };
    const handleFocus = () => {
      void syncFromCloud();
    };

    // Sinkronisasi berkala setiap 6 detik agar tampilan di HP Talent (/talent) selalu up-to-date
    const intervalId = window.setInterval(() => {
      void syncFromCloud();
    }, 6000);

    window.addEventListener(STORE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(STORE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const enrichedContents = state.contents.map((c) => enrichContent(c, state));
  const enrichedIdeas = state.ideas.map((i) => enrichIdea(i, state));

  return {
    state,
    hydrated,
    refresh,
    enrichedContents,
    enrichedIdeas,
  };
}
