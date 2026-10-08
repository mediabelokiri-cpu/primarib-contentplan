import {
  Campaign,
  ContentFormat,
  ContentPillar,
  ContentStatus,
  IdeaStatus,
  Platform,
  PriorityLevel,
  Profile,
  Program,
  RoleName,
} from "@/types/database";

// ============================================================================
// BRAND IDENTITY (Section 37 of Masterplan)
// ============================================================================
export const BRAND_COLORS = {
  primaryNavy: "#284078",
  secondaryYellow: "#DDB02E",
  white: "#FFFFFF",
} as const;

// ============================================================================
// WORKFLOW STATUSES & VALID TRANSITIONS (User Flow Section 9 & 21)
// ============================================================================
export const WORKFLOW_STATUSES: ContentStatus[] = [
  "PLANNED",
  "BRIEF",
  "PRODUCTION",
  "REVIEW",
  "REVISION",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
];

export const ALL_CONTENT_STATUSES: ContentStatus[] = [
  ...WORKFLOW_STATUSES,
  "ARCHIVED",
];

export const STATUS_LABELS: Record<ContentStatus, string> = {
  PLANNED: "Planned",
  BRIEF: "Brief",
  PRODUCTION: "Production",
  REVIEW: "Review",
  REVISION: "Revision",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

// Valid next status transitions (No jumping directly from REVIEW to PUBLISHED without APPROVAL)
export const VALID_STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  PLANNED: ["BRIEF", "ARCHIVED"],
  BRIEF: ["PLANNED", "PRODUCTION", "ARCHIVED"],
  PRODUCTION: ["BRIEF", "REVIEW", "ARCHIVED"],
  REVIEW: ["APPROVED", "REVISION"],
  REVISION: ["PRODUCTION", "REVIEW", "ARCHIVED"],
  APPROVED: ["SCHEDULED", "REVISION"],
  SCHEDULED: ["PUBLISHED", "APPROVED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["PLANNED"],
};

export const IDEA_STATUSES: IdeaStatus[] = [
  "NEW",
  "SELECTED",
  "PLANNED",
  "ARCHIVED",
];

export const PRIORITY_LEVELS: PriorityLevel[] = ["LOW", "MEDIUM", "HIGH"];

export const ROLES_LIST: { name: RoleName; description: string }[] = [
  { name: "Admin", description: "Mengelola seluruh sistem dan manajemen user" },
  {
    name: "Content Planner",
    description: "Merencanakan dan mengelola konten, ide, kalender, dan assignment",
  },
  {
    name: "Copywriter",
    description: "Membuat copy, hook, caption, CTA, dan script",
  },
  {
    name: "Designer",
    description: "Membuat dan mengupload asset visual / desain",
  },
  {
    name: "Video Editor",
    description: "Membuat dan mengupload asset video / reels / tiktok",
  },
  {
    name: "Reviewer",
    description: "Memeriksa, meminta revisi, dan menyetujui (approve) konten",
  },
];

export const REEL_TALENT_CATEGORIES = [
  "Talent Model",
  "Mentor / Pengajar",
  "Siswa",
] as const;

export type ReelTalentCategory = (typeof REEL_TALENT_CATEGORIES)[number];

// ============================================================================
// DEFAULT SEED DATA (Standardized Prima RIB Content Plan)
// ============================================================================
export const SEED_PROGRAMS: Program[] = [
  {
    id: "prog-cpns",
    name: "CPNS",
    code: "CPNS",
    description: "Wilayah Konten CPNS: SKD (TWK, TIU, TKP), Formasi & Persiapan CPNS",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "prog-sekdin",
    name: "Sekolah Kedinasan (Sekdin)",
    code: "SEKDIN",
    description: "Wilayah Konten Sekolah Kedinasan: PKN STAN, IPDN, STIS, Poltekim/Poltekip & SKD Kedinasan",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "prog-polri",
    name: "Polri",
    code: "POLRI",
    description: "Wilayah Konten Polri: Akpol, Bintara, Tamtama, Psikotes, Akademik & Kesamaptaan",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const SEED_PILLARS: ContentPillar[] = [
  {
    id: "pil-edukatif",
    name: "Edukatif",
    description: "Pilar Edukatif: Bedah soal, rumus cepat, materi SKD, psikotes & tips ujian",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "pil-informatif",
    name: "Informatif",
    description: "Pilar Informatif: Info pendaftaran, syarat dokumen, kuota formasi & alur seleksi",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "pil-interaktif",
    name: "Interaktif",
    description: "Pilar Interaktif: Kuis kilat, poling, tanya jawab (Q&A), mitos vs fakta & this or that",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "pil-branding",
    name: "Branding & Promosi",
    description: "Pilar Branding & Promosi: Profil mentor, fasilitas Lab CAT, testimoni alumni & info pembukaan kelas",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const SEED_FORMATS: ContentFormat[] = [
  {
    id: "fmt-reels",
    name: "Reel",
    description: "Video Vertikal (Selasa & Kamis) dengan pilihan Talent Model, Mentor / Pengajar, atau Siswa",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "fmt-feed",
    name: "Single Post",
    description: "Feed 1 Gambar / Poster (Senin, Rabu, Jumat)",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "fmt-carousel",
    name: "Carousel",
    description: "Feed Multi-Slide / Karusel 3–6 Slide (Senin, Rabu, Jumat)",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const SEED_PLATFORMS: Platform[] = [
  { id: "plat-ig", name: "Instagram", code: "IG", is_active: true, created_at: "2026-10-01T08:00:00Z" },
  { id: "plat-fb", name: "Facebook", code: "FB", is_active: true, created_at: "2026-10-01T08:00:00Z" },
  { id: "plat-tt", name: "TikTok", code: "TT", is_active: true, created_at: "2026-10-01T08:00:00Z" },
];

export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-m1-cpns",
    name: "Minggu 1 — Fokus CPNS / Fleksibel",
    description: "Rotasi Minggu 1: Update Dokumen CPNS, Trik TIU Deret, Perbandingan TIU/TKP, Kuis TWK Pancasila, & Profil Tentor",
    start_date: "2026-10-05",
    end_date: "2026-10-09",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "camp-m2-sekdin",
    name: "Minggu 2 — Fokus Sekolah Kedinasan / Fleksibel",
    description: "Rotasi Minggu 2: Perbandingan 4 Sekdin, Tips SKD Pemula, 3 Kesalahan TKP, Poling SKD, & Fasilitas Lab CAT",
    start_date: "2026-10-12",
    end_date: "2026-10-16",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "camp-m3-polri",
    name: "Minggu 3 — Fokus Polri / Fleksibel",
    description: "Rotasi Minggu 3: Syarat Fisik & Berkas Polri, Tips Psikotes & Kesamaptaan, Kecermatan Angka, Q&A Mitos/Fakta, & Testimoni",
    start_date: "2026-10-19",
    end_date: "2026-10-23",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "camp-m4-general",
    name: "Minggu 4 — Fokus General & Konversi",
    description: "Rotasi Minggu 4: FAQ Prima RIB, Strategi Mental Hari H, 4 Aturan Manajemen Waktu, This or That, & Promo Kelas Baru",
    start_date: "2026-10-26",
    end_date: "2026-10-30",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const SEED_USERS: Profile[] = [
  {
    id: "user-idam",
    full_name: "Idam (Admin & Planner)",
    email: "idam@primarib.com",
    is_active: true,
    roles: ["Admin", "Content Planner"],
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "user-andi",
    full_name: "Andi Pratama",
    email: "andi@primarib.com",
    is_active: true,
    roles: ["Content Planner"],
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "user-budi",
    full_name: "Budi Santoso",
    email: "budi@primarib.com",
    is_active: true,
    roles: ["Copywriter"],
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "user-citra",
    full_name: "Citra Lestari",
    email: "citra@primarib.com",
    is_active: true,
    roles: ["Designer"],
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "user-deni",
    full_name: "Deni Kurniawan",
    email: "deni@primarib.com",
    is_active: true,
    roles: ["Video Editor"],
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "user-eko",
    full_name: "Eko Wijaya",
    email: "eko@primarib.com",
    is_active: true,
    roles: ["Reviewer"],
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];
