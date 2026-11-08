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
  BrandProfile,
  BrandPersonality,
  BrandToneGuideline,
  BrandAudience,
  BrandProduct,
  BrandWritingGuideline,
  BrandVisualGuideline,
  BrandDocument,
  BrandKnowledge,
  AiProvider,
  AiModel,
  AiTaskRoute,
  AiPromptTemplate,
  AiPromptVersion,
  AiGenerationLog,
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

// ============================================================================
// BRAND STUDIO DEFAULT SEED DATA (Module 01 — PRD FR-001 s/d FR-012)
// ============================================================================

export const DEFAULT_BRAND_PROFILE: BrandProfile = {
  id: "brand-primarib-main",
  brand_name: "Prima RIB",
  description:
    "Bimbingan Belajar dan Konsultan Pelatihan Terdepan Spesialis Seleksi CPNS, Sekolah Kedinasan (Sekdin), dan Calon Anggota Polri. Mengedepankan metode pembelajaran adaptif, bedah materi HOTS terkini, serta simulasi sistem CAT berstandar BKN.",
  positioning:
    "Pusat bimbingan persiapan seleksi kedinasan & aparatur negara nomor 1 yang mendidik calon abdi negara berintegritas, bermental tangguh, dan siap menembus passing grade tinggi.",
  vision:
    "Menjadi lembaga bimbingan belajar terbaik dan paling tepercaya di Indonesia dalam mencetak putra-putri berprestasi yang lolos seleksi ASN, Taruna Kedinasan, dan Anggota Polri.",
  mission:
    "1. Menyediakan kurikulum belajar terpadu dengan ribuan latihan soal HOTS berstandar resmi.\n2. Membangun kultur disiplin, kepemimpinan, dan kesamaptaan fisik prima.\n3. Memberikan pendampingan holistik oleh mentor eksklusif, alumni terbaik, dan praktisi ahli.",
  values: [
    "Integritas & Kejujuran",
    "Disiplin & Mental Juara",
    "Edukasi Berorientasi Hasil",
    "Keluargaan & Empati Bimbingan",
  ],
  tagline: "Siapkan Diri, Raih Impian Abdi Negara Bersama Prima RIB!",
  website_url: "https://primarib.com",
  social_links: {
    instagram: "https://instagram.com/primarib.official",
    tiktok: "https://tiktok.com/@primarib_academy",
    facebook: "https://facebook.com/primarib.bimbel",
    youtube: "https://youtube.com/@primaribofficial",
  },
  brand_status: "ACTIVE",
  created_at: "2026-10-01T08:00:00Z",
  updated_at: "2026-10-01T08:00:00Z",
};

export const DEFAULT_BRAND_PERSONALITIES: BrandPersonality[] = [
  {
    id: "bp-1",
    brand_id: "brand-primarib-main",
    personality_name: "Profesional & Kredibel",
    description:
      "Setiap informasi materi, kisi-kisi, dan aturan tes berpedoman langsung pada rilis resmi BKN, KemenPAN-RB, dan Mabes Polri tanpa rumor spekulatif.",
    priority: 1,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "bp-2",
    brand_id: "brand-primarib-main",
    personality_name: "Edukatif & Solutif",
    description:
      "Membongkar konsep sulit (TIU deret angka, silogisme, psikotes kecermatan) menjadi rumus kilat dan penalaran logis yang mudah dicerna peserta.",
    priority: 2,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "bp-3",
    brand_id: "brand-primarib-main",
    personality_name: "Memotivasi & Disiplin",
    description:
      "Membangkitkan daya juang siswa agar pantang menyerah menghadapi ketatnya persaingan kuota formasi dengan pendekatan ala ksatria.",
    priority: 3,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "bp-4",
    brand_id: "brand-primarib-main",
    personality_name: "Empatis & Bersahabat",
    description:
      "Memahami keresahan dan tekanan emosional siswa/pejuang NIP, hadir sebagai sahabat belajar yang selalu suportif.",
    priority: 4,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
  },
];

export const DEFAULT_BRAND_TONE_GUIDELINES: BrandToneGuideline[] = [
  {
    id: "btg-main",
    brand_id: "brand-primarib-main",
    tone_name: "Semi-Formal, Tegas & Menginspirasi",
    formality_level: "Semi Formal",
    description:
      "Kombinasi bahasa Indonesia yang baku namun luwes, energik, menghargai audiens, dan sarat panggilan semangat kebersamaan pejuang masa depan.",
    writing_rules: [
      "Gunakan sapaan khas: 'Sobat Prima', 'Pejuang NIP', 'Pejuang Taruna', 'Calon Abdi Negara'.",
      "Gunakan hook yang memancing rasa penasaran atau problem nyata pada 3 detik pertama.",
      "Selalu sertakan analogi atau contoh konkret saat menjelaskan rumus matematika/silogisme.",
      "Hindari kalimat pasif panjang yang bertele-tele; utamakan kalimat aksi yang dinamis.",
      "Wajib menyertakan Call To Action (CTA) di akhir: Ajak simpan (Save), share ke sesama pejuang, atau DM/Klik link bio.",
    ],
    preferred_words: [
      "Sobat Prima",
      "Pejuang NIP",
      "Pejuang Kedinasan",
      "Lolos Passing Grade",
      "Trik Hitung Cepat",
      "Lab Simulasi CAT",
      "Mental Juara",
      "Amankan Kursi Formasi",
      "Bimbel Prima RIB",
    ],
    prohibited_words: [
      "Pasti Lulus Tanpa Belajar",
      "Bocoran Kunci Jawaban BKN",
      "Jalur Orang Dalam / Calo",
      "Garansi 100% Uang Kembali Tanpa Syarat",
      "Soal Bocor Resmi",
    ],
    cta_style: "Tegas, mengajak aksi nyata, dan membakar antusiasme audiens.",
    communication_boundaries: [
      "Dilarang membuat klaim tanggal pendaftaran atau jumlah kuota sebelum diterbitkan SK/Pengumuman resmi dari instansi pemerintah.",
      "Dilarang merendahkan instansi pemerintah, kepolisian, atau bimbingan belajar lain.",
    ],
    is_default: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const DEFAULT_BRAND_AUDIENCES: BrandAudience[] = [
  {
    id: "aud-cpns",
    brand_id: "brand-primarib-main",
    audience_name: "Pejuang NIP CPNS 2026 (Fresh Graduate & Pekerja Honorer)",
    description:
      "Lulusan D3/S1 fresh graduate atau tenaga honorer yang bercita-cita mengabdi sebagai Pegawai Negeri Sipil dengan jaminan masa depan stabil.",
    age_range: "21 – 35 Tahun",
    occupation: ["Fresh Graduate Perguruan Tinggi", "Tenaga Honorer / Pegawai Kontrak", "Karyawan Swasta"],
    interests: ["Peluang Formasi CPNS", "Kenaikan Gaji & Tunjangan Kinerja ASN", "Strategi Trik CAT TIU & TWK", "Tryout Nasional"],
    problems: [
      "Waktu belajar sempit karena bekerja atau kesibukan skripsi.",
      "Trauma dengan soal hitungan matematika dasar TIU dan silogisme penarikan kesimpulan.",
      "TKP sering terjebak poin 1-2 karena kurang memahami prinsip integritas ASN.",
    ],
    needs: [
      "Modul ringkas to-the-point yang bisa dipelajari via smartphone kapan saja.",
      "Drilling soal berulang dengan sistem CAT yang persis seperti ujian asli.",
      "Tips eliminasi jawaban salah dalam 20 detik.",
    ],
    motivations: [
      "Ingin stabilitas finansial jangka panjang dan jaminan pensiun.",
      "Membahagiakan keluarga dan meraih status sosial terhormat.",
    ],
    objections: [
      "Khawatir bimbel online membosankan dan materi tidak keluar saat ujian.",
      "Ragu bisa bersaing dengan ratusan ribu pelamar lain di satu formasi.",
    ],
    preferences: [
      "Video Reels pendek bedah 1 tipe soal HOTS.",
      "Carousel perbandingan syarat berkas atau formasi sepi peminat.",
      "Live Q&A bersama mentor peraih skor 470+.",
    ],
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "aud-sekdin",
    brand_id: "brand-primarib-main",
    audience_name: "Pejuang Sekolah Kedinasan (PKN STAN, IPDN, STIS, Poltekim)",
    description:
      "Siswa SMA/SMK/MA kelas 12 dan lulusan gap year yang ingin kuliah gratis ikatan dinas dan langsung diangkat menjadi CPNS setelah lulus.",
    age_range: "17 – 21 Tahun",
    occupation: ["Siswa Kelas 12 SMA/SMK/MA", "Gap Year Alumni SMA"],
    interests: ["Kuliah Gratis Ikatan Dinas", "Seragam & Taruna Kedinasan", "Peta Persaingan IPDN vs STAN vs STIS", "Tes Kesamaptaan"],
    problems: [
      "Rasio keketatan sangat tinggi (bisa 1:50 hingga 1:100).",
      "Harus membagi waktu antara Ujian Sekolah dan persiapan SKD Kedinasan.",
      "Fisik belum pernah dilatih untuk lari 12 menit atau pull up kesamaptaan.",
    ],
    needs: [
      "Panduan kurikulum terstruktur dari nol (akademik + pembinaan fisik).",
      "Simulasi perang ranking per sekolah kedinasan pilihan.",
      "Mentor yang merupakan alumni sekolah kedinasan terkait.",
    ],
    motivations: [
      "Meringankan beban orang tua dengan kuliah 100% dibiayai negara.",
      "Pasti diangkat CPNS setelah wisuda tanpa bingung cari kerja.",
    ],
    objections: [
      "Minder dengan nilai rapor atau merasa bukan siswa ranking 1 di kelas.",
      "Takut gagal di tahapan tes fisik atau psikotes tahap 2.",
    ],
    preferences: [
      "Konten edukasi perbandingan jurusan & prospek kerja taruna.",
      "Video tutorial gerakan fisik kesamaptaan yang benar.",
      "Kuis interaktif 'This or That' seputar sekolah kedinasan.",
    ],
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "aud-polri",
    brand_id: "brand-primarib-main",
    audience_name: "Pejuang Taruna Akpol & Bintara/Tamtama Polri",
    description:
      "Pemuda-pemudi dengan fisik tangguh yang bertekad menjadi anggota kepolisian Republik Indonesia melalui jalur Akpol, Bintara PTU, atau Bakomsus.",
    age_range: "17 – 22 Tahun",
    occupation: ["Siswa SMA/SMK Kelas 12", "Pemuda Lulusan SMA/SMK"],
    interests: ["Penerimaan Polri", "Syarat Tinggi & Berat Badan Ideal", "Psikotes Angka Hilang & Kecermatan", "Tes Kesamaptaan Jasmani A/B"],
    problems: [
      "Gugur di tes psikotes kecermatan Pauli / Kraepelin karena kurang latihan stamina jari dan konsentrasi.",
      "Bingung standar tes akademik Bahasa Inggris dan Pengetahuan Umum.",
      "Bentuk fisik belum memenuhi postur ideal (BMI) dan tes kesehatan awal.",
    ],
    needs: [
      "Latihan simulasi psikotes kecermatan harian.",
      "Program drill akademik khusus materi uji penerimaan Polri.",
      "Panduan standar penilaian jasmani A & B.",
    ],
    motivations: [
      "Jiwa pengabdian kepada bangsa dan negara sebagai pelindung masyarakat.",
      "Kebanggaan memakai seragam korps Polri di hadapan keluarga.",
    ],
    objections: [
      "Terpengaruh mitos bahwa masuk polisi harus ada bekingan.",
      "Takut gagal di tahapan rikkes (pemeriksaan kesehatan) atau tes kepribadian.",
    ],
    preferences: [
      "Reels video motivasi latihan fisik dan tips psikotes angka hilang.",
      "Testimoni siswa yang lolos murni dengan perjuangan gigih.",
      "Infografis jadwal tahapan seleksi panitia daerah (Panda).",
    ],
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const DEFAULT_BRAND_PRODUCTS: BrandProduct[] = [
  {
    id: "prod-cpns-intensif",
    brand_id: "brand-primarib-main",
    product_name: "Program Super Intensif SKD CPNS 2026",
    category: "CPNS",
    description:
      "Program bimbingan komprehensif mengupas tuntas 110 butir soal SKD (TWK, TIU, TKP) dengan metode 'Fast-Think Method' dan sistem CAT BKN real-time.",
    features: [
      "40 Sesi Kelas Tatap Muka & Live Zoom Interaktif bersama Master Mentor",
      "Bank Soal 5.000+ Butir Soal HOTS Terupdate beserta Pembahasan Video",
      "30x Simulasi Tryout CAT dengan Ranking Nasional & Analisis Lemah Materi",
      "Modul Cetak Eksklusif 'Kamus Rumus Kilat TIU & Bedah Soal HOTS'",
      "Grup Diskusi 24/7 dan Konsultasi Penentuan Formasi Sesuai Jurusan",
    ],
    benefits: [
      "Meningkatkan kecepatan menjawab hingga 45 detik per soal.",
      "Percaya diri menembus skor di atas target passing grade aman (400 - 450+).",
      "Pemilihan formasi strategis untuk meminimalisir persaingan ekstrem.",
    ],
    target_audience_id: "aud-cpns",
    price: 1850000,
    price_display: "Rp 1.850.000",
    promotion_details: "Diskon Early Bird 25% untuk 50 pendaftar pertama bulan ini!",
    registration_info: "Pendaftaran dibuka setiap awal bulan via WhatsApp resmi atau website primarib.com/cpns",
    cta: "Daftar Kelas CPNS Sekarang & Amankan Kursi NIP-mu!",
    official_reference: "Sesuai Keputusan MenPAN-RB No. 321 tentang Nilai Ambang Batas Pengadaan PNS",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "prod-sekdin-garansi",
    brand_id: "brand-primarib-main",
    product_name: "Program Kedinasan All-in-One (STAN, IPDN, STIS, Poltekim)",
    category: "SEKDIN",
    description:
      "Program persiapan lengkap akademik dan fisik untuk menembus seleksi sekolah ikatan dinas favorit di Indonesia.",
    features: [
      "Bimbingan SKD Kedinasan 50 Pertemuan + Bedah Materi TPA/TBI Khusus STAN & STIS",
      "Program Pembinaan Kesamaptaan Fisik Mingguan (Lari, Pull-up, Push-up, Shuttle Run)",
      "Simulasi Psikotes & Wawancara Karakter Kedinasan",
      "Konseling Pemilihan Sekolah Kedinasan berdasarkan Potensi Diri dan Nilai Rapor",
    ],
    benefits: [
      "Siap menembus tahap SKD sekaligus tes lanjutan fisik dan wawancara.",
      "Fisik terlatih dan terukur sesuai standar samapta instansi terkait.",
    ],
    target_audience_id: "aud-sekdin",
    price: 2450000,
    price_display: "Rp 2.450.000",
    promotion_details: "Gratis Tryout Akbar Kedinasan se-Indonesia untuk pendaftar minggu ini.",
    registration_info: "Kuota dibatasi 20 siswa per kelas demi menjaga kualitas pembinaan.",
    cta: "Wujudkan Mimpi Kuliah Gratis Ikatan Dinas Bersama Prima RIB!",
    official_reference: "Surat Edaran BKN tentang Jadwal Seleksi Sekolah Kedinasan",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "prod-polri-akpol",
    brand_id: "brand-primarib-main",
    product_name: "Bimbel Khusus Calon Taruna Akpol & Bintara Polri",
    category: "POLRI",
    description:
      "Program bimbingan komplit mencakup Pemeriksaan Kesehatan Awal, Psikotes Kecermatan, Akademik (TPA, B. Inggris, PU, Wawasan Kebangsaan), dan Kesamaptaan Jasmani.",
    features: [
      "Drill Rutin Psikotes Angka Hilang, Huruf Hilang, Simbol Hilang & Pauli",
      "Latihan Akademik Terpadu Pengetahuan Umum, Wawasan Kebangsaan, dan Numerik",
      "Panduan Pola Hidup & Diet Sehat untuk Mencapai BMI & Kesamaptaan Maksimal",
      "Simulasi Penelusuran Mental Kepribadian (PMK) & Wawancara Psikologi",
    ],
    benefits: [
      "Meningkatkan konsentrasi dan stamina tangan dalam psikotes kecermatan.",
      "Menguasai tipe soal akademik penerimaan Polri.",
    ],
    target_audience_id: "aud-polri",
    price: 2650000,
    price_display: "Rp 2.650.000",
    promotion_details: "Bonus Tes Minat Bakat dan Analisis Postur Tubuh awal.",
    registration_info: "Konsultasi tatap muka tersedia di kantor cabang Prima RIB.",
    cta: "Siapkan Mental dan Fisikmu Menjadi Bhayangkara Sejati!",
    official_reference: "Pengumuman Resmi Kapolri tentang Penerimaan Terpadu Anggota Polri",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const DEFAULT_BRAND_WRITING_GUIDELINES: BrandWritingGuideline[] = [
  {
    id: "bwg-hook",
    brand_id: "brand-primarib-main",
    guideline_type: "HOOK",
    title: "Pedoman Hook 0–3 Detik (Video Reels & Karusel Slide 1)",
    content:
      "Hook bertugas menghentikan jempol audiens yang sedang scrolling. Gunakan kontradiksi, fakta mengejutkan, rasa takut kehilangan kesempatan (FOMO), atau tantangan logika.",
    rules: [
      "Panjang teks hook maksimal 10 - 14 kata agar terbaca sekilas.",
      "Sertakan trigger visual atau gerakan tegas pada talent video di detik pertama.",
      "Gunakan format 'Ternyata...', 'Hati-hati, 3 Kesalahan...', 'Cara Cepat...', atau 'Jangan Lakukan Ini...'",
    ],
    examples: [
      {
        good: "Banyak yang gugur di TKP bukan karena salah pilih jawaban, tapi karena nggak tahu pola poin 5 ini!",
        bad: "Halo teman-teman, hari ini kita akan belajar tentang tes karakteristik pribadi CPNS.",
      },
      {
        good: "Stop hitung pecahan deret pakai rumus panjang kalau mau selesai ujian tepat waktu!",
        bad: "Berikut ini adalah materi matematika untuk tes TIU.",
      },
    ],
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "bwg-caption",
    brand_id: "brand-primarib-main",
    guideline_type: "CAPTION",
    title: "Pedoman Penulisan Caption Instagram & TikTok",
    content:
      "Caption memperkuat pesan video/karusel, memberikan ruang untuk penjelasan detail, dan memicu percakapan di kolom komentar.",
    rules: [
      "Baris pertama caption mengulang intisari hook dengan emoji relevan.",
      "Bagi teks menjadi paragraf pendek (maksimal 2-3 baris per paragraf) dengan spasi bersih.",
      "Sertakan rangkuman poin-poin penting menggunakan bullet points emoji (contoh: 📌, ✅, 👉).",
      "Tutup dengan pertanyaan diskusi untuk menaikkan engagement rate ('Kira-kira formasi mana yang mau kamu ambil? Ketik di kolom komentar!').",
    ],
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "bwg-reels",
    brand_id: "brand-primarib-main",
    guideline_type: "REELS_SCRIPT",
    title: "Pedoman Naskah Video Reels (Durasi 30–60 Detik)",
    content:
      "Struktur naskah video vertikal terbagi menjadi 4 babak: Hook (0-5s), Problem Context (5-15s), Solution/Trik Inti (15-45s), dan Call-To-Action (45-60s).",
    rules: [
      "Wajib menyertakan instruksi visual (b-roll, ekspresi talent, teks pop-up layar).",
      "Tempo berbicara mantap, bersemangat, artikulasi jelas tanpa jeda canggung.",
      "Gunakan alat peraga (papan tulis, tablet stylus, atau modul cetak Prima RIB) saat talent mentor menjelaskan materi.",
    ],
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const DEFAULT_BRAND_VISUAL_GUIDELINES: BrandVisualGuideline = {
  id: "bvg-main",
  brand_id: "brand-primarib-main",
  guideline_name: "Brand Visual Guidelines Prima RIB",
  color_palette: [
    { name: "Prima Navy", hex: "#284078", role: "Warna Utama Brand, Kredibilitas & Background Resmi" },
    { name: "Prima Gold / Yellow", hex: "#DDB02E", role: "Aksen Prestasi, Badge Juara & Tombol CTA Menarik" },
    { name: "Digital Purple", hex: "#6D4AFF", role: "Aksen Modern, Sorotan Interaktif & Tagline Digital" },
    { name: "Slate Deep", hex: "#0F172A", role: "Teks Utama & Heading Kontras Tinggi" },
    { name: "Pure White", hex: "#FFFFFF", role: "Background Bersih & Ruang Negatif" },
  ],
  typography: {
    heading: "Plus Jakarta Sans / Inter Bold",
    body: "Inter Regular / Medium",
    notes: "Gunakan ketebalan Bold / Extrabold untuk headline agar mudah dibaca pada layar smartphone berukuran kecil.",
  },
  visual_direction:
    "Desain harus terkesan rapi, modern, profesional (institusional resmi), namun tetap dinamis dan anak muda (tidak kaku seperti poster birokrasi lama). Utamakan hierarki informasi yang jelas dengan kontras warna tinggi.",
  do_rules: [
    "Selalu letakkan logo resmi Prima RIB di sudut kiri atas atau kanan atas pada slide pertama.",
    "Gunakan padding yang lega di sisi kiri dan kanan agar teks tidak terpotong tepi layar Instagram.",
    "Foto talent atau siswa harus beresolusi tajam dengan pencahayaan terang dan ekspresi percaya diri.",
    "Gunakan warna kartu konten sesuai standarisasi (Ungu=Talent, Biru=Mentor, Oranye=Siswa, Hijau=Karusel, Pink=Single Post).",
  ],
  dont_rules: [
    "Dilarang menggunakan ilustrasi kartun generik yang menurunkan kredibilitas bimbel resmi.",
    "Dilarang menumpuk lebih dari 3 jenis font berbeda dalam satu desain.",
    "Dilarang memasang teks panjang tanpa pemenggalan poin-poin yang mudah dipindai mata.",
    "Dilarang menggunakan foto buram atau hasil screenshot beresolusi rendah.",
  ],
  references: [
    "Layout Karusel Edukatif 5-Slide Prima RIB",
    "Template Reels 9:16 dengan SafeArea Instagram",
    "Kartu Jadwal Postingan Standardized System",
  ],
  created_at: "2026-10-01T08:00:00Z",
  updated_at: "2026-10-01T08:00:00Z",
};

export const DEFAULT_BRAND_KNOWLEDGE: BrandKnowledge[] = [
  {
    id: "bk-1",
    brand_id: "brand-primarib-main",
    category: "REGULASI_SELEKSI",
    title: "Struktur & Jumlah Soal SKD CAT CPNS Berdasarkan KepmenPAN-RB",
    content:
      "Ujian Seleksi Kompetensi Dasar (SKD) CPNS menggunakan sistem Computer Assisted Test (CAT) BKN dengan total 110 soal berdurasi 100 menit. Terdiri dari:\n- TWK (Tes Wawasan Kebangsaan): 30 butir (passing grade 65, benar +5, salah 0).\n- TIU (Tes Inteligensia Umum): 35 butir (passing grade 80, benar +5, salah 0).\n- TKP (Tes Karakteristik Pribadi): 45 butir (passing grade 166, skala nilai 1 sampai 5, tidak menjawab 0).\nTotal nilai maksimal adalah 550.",
    source_type: "MANUAL",
    source_reference: "Keputusan MenPAN-RB No. 321 Tahun Pengadaan PNS",
    verification_status: "VERIFIED",
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "bk-2",
    brand_id: "brand-primarib-main",
    category: "REGULASI_SELEKSI",
    title: "Tahapan Seleksi Masuk Sekolah Kedinasan (SPCP / SIPENCATAR)",
    content:
      "Tahapan seleksi sekolah kedinasan umumnya meliputi: 1. Pendaftaran daring di portal SSCASN Dikdin BKN, 2. Seleksi Administrasi & Verifikasi Dokumen, 3. SKD CAT BKN (TWK, TIU, TKP), 4. Tes Kesehatan Tahap 1 & 2, 5. Tes Kesamaptaan Jasmani, 6. Tes Psikologi / Wawancara Karakteristik, 7. Pantukhir (Penentuan Akhir).",
    source_type: "MANUAL",
    source_reference: "Portal Resmi BKN SSCASN Sekolah Kedinasan",
    verification_status: "VERIFIED",
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "bk-3",
    brand_id: "brand-primarib-main",
    category: "INFO_BIMBEL",
    title: "Fasilitas Unggulan Laboratorium CAT Prima RIB",
    content:
      "Prima RIB menyediakan ruang simulasi Lab CAT dengan 60 unit PC berspesifikasi tinggi yang disetting menyerupai ruang ujian resmi BKN, lengkap dengan timer berjalan otomatis, sistem pembobotan nilai langsung keluar (real-time scoring), dan grafik analisis kelemahan per sub-materi.",
    source_type: "MANUAL",
    source_reference: "Brosur Profil Fasilitas Prima RIB",
    verification_status: "VERIFIED",
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "bk-4",
    brand_id: "brand-primarib-main",
    category: "TIPS_TRIK",
    title: "Metode Eliminasi Cepat Poin 5 Soal TKP Integritas",
    content:
      "Dalam soal TKP, kunci meraih poin 5 (skor tertinggi) adalah memilih opsi tindakan yang menunjukkan inisiatif pribadi yang solutif, bertanggung jawab, tidak melempar tugas ke orang lain, dan tetap taat prosedur kode etik ASN tanpa mencari pembenaran.",
    source_type: "MANUAL",
    source_reference: "Modul Rahasia Skor 450+ Prima RIB",
    verification_status: "VERIFIED",
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const DEFAULT_BRAND_DOCUMENTS: BrandDocument[] = [
  {
    id: "doc-1",
    brand_id: "brand-primarib-main",
    file_name: "Panduan_Resmi_Seleksi_CPNS_dan_Kedinasan_2026.pdf",
    file_type: "PDF",
    file_size: 2450800,
    processing_status: "INDEXED",
    extracted_text:
      "Dokumen pedoman teknis pendaftaran, jadwal seleksi, dan passing grade CAT SSCASN untuk kebutuhan bimbel Prima RIB.",
    created_at: "2026-10-01T08:00:00Z",
    processed_at: "2026-10-01T08:05:00Z",
  },
  {
    id: "doc-2",
    brand_id: "brand-primarib-main",
    file_name: "Silabus_Materi_HOTS_SKD_PrimaRIB.pdf",
    file_type: "PDF",
    file_size: 1890200,
    processing_status: "INDEXED",
    extracted_text:
      "Rangkuman silabus kisi-kisi resmi TWK, TIU, dan TKP HOTS edisi pengadaan aparatur sipil negara.",
    created_at: "2026-10-01T08:00:00Z",
    processed_at: "2026-10-01T08:05:00Z",
  },
];

// ============================================================================
// MODULE 02 — HYBRID AI INFRASTRUCTURE DEFAULTS (PRD Module 02 & ERD Domain 5, 6)
// ============================================================================

export const DEFAULT_AI_PROVIDERS: AiProvider[] = [
  {
    id: "prov-gemini",
    provider_name: "Google Gemini",
    provider_code: "GEMINI",
    adapter_key: "gemini",
    api_base_url: "https://generativelanguage.googleapis.com",
    credential_env_key: "GEMINI_API_KEY",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "prov-openai",
    provider_name: "OpenAI GPT",
    provider_code: "OPENAI",
    adapter_key: "openai",
    api_base_url: "https://api.openai.com",
    credential_env_key: "OPENAI_API_KEY",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "prov-claude",
    provider_name: "Anthropic Claude",
    provider_code: "CLAUDE",
    adapter_key: "claude",
    api_base_url: "https://api.anthropic.com",
    credential_env_key: "ANTHROPIC_API_KEY",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "prov-mock",
    provider_name: "Prima RIB Hybrid Offline Fallback",
    provider_code: "FALLBACK_MOCK",
    adapter_key: "mock",
    credential_env_key: "BUILT_IN",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const DEFAULT_AI_MODELS: AiModel[] = [
  {
    id: "mod-gemini-flash",
    provider_id: "prov-gemini",
    provider_code: "GEMINI",
    model_name: "Gemini 1.5 Flash",
    model_code: "gemini-1.5-flash",
    capabilities: ["fast", "multimodal", "streaming"],
    context_window: 1048576,
    input_price_per_m: 0.075,
    output_price_per_m: 0.3,
    pricing_currency: "USD",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "mod-gemini-pro",
    provider_id: "prov-gemini",
    provider_code: "GEMINI",
    model_name: "Gemini 1.5 Pro",
    model_code: "gemini-1.5-pro",
    capabilities: ["reasoning", "long_context", "multimodal"],
    context_window: 2097152,
    input_price_per_m: 3.5,
    output_price_per_m: 10.5,
    pricing_currency: "USD",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "mod-gpt-4o-mini",
    provider_id: "prov-openai",
    provider_code: "OPENAI",
    model_name: "GPT-4o Mini",
    model_code: "gpt-4o-mini",
    capabilities: ["fast", "structured_json"],
    context_window: 128000,
    input_price_per_m: 0.15,
    output_price_per_m: 0.6,
    pricing_currency: "USD",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "mod-gpt-4o",
    provider_id: "prov-openai",
    provider_code: "OPENAI",
    model_name: "GPT-4o",
    model_code: "gpt-4o",
    capabilities: ["flagship", "creative", "vision"],
    context_window: 128000,
    input_price_per_m: 2.5,
    output_price_per_m: 10.0,
    pricing_currency: "USD",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "mod-claude-35-sonnet",
    provider_id: "prov-claude",
    provider_code: "CLAUDE",
    model_name: "Claude 3.5 Sonnet",
    model_code: "claude-3-5-sonnet-20241022",
    capabilities: ["reasoning", "nuance", "code"],
    context_window: 200000,
    input_price_per_m: 3.0,
    output_price_per_m: 15.0,
    pricing_currency: "USD",
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];

export const DEFAULT_AI_TASK_ROUTES: AiTaskRoute[] = [
  {
    id: "route-idea",
    task_code: "IDEA_GENERATION",
    task_name: "Pembuat Ide Konten Bulanan & Harian",
    primary_model_id: "mod-gemini-flash",
    fallback_model_id: "mod-gpt-4o-mini",
    temperature: 0.75,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "route-script",
    task_code: "SCRIPT_WRITING",
    task_name: "Penyusun Naskah Video Reels & TikTok",
    primary_model_id: "mod-gemini-pro",
    fallback_model_id: "mod-gpt-4o",
    temperature: 0.7,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "route-copy",
    task_code: "COPYWRITING",
    task_name: "Copywriting Caption, Hook & CTA",
    primary_model_id: "mod-gemini-flash",
    fallback_model_id: "mod-gpt-4o-mini",
    temperature: 0.7,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "route-brief",
    task_code: "CREATIVE_BRIEF",
    task_name: "Pembuat Creative Brief Desain & Video",
    primary_model_id: "mod-gemini-flash",
    fallback_model_id: "mod-claude-35-sonnet",
    temperature: 0.6,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "route-qc",
    task_code: "QUALITY_CHECK",
    task_name: "Quality Checker Kepatuhan Suara Brand & Fakta",
    primary_model_id: "mod-gemini-pro",
    fallback_model_id: "mod-claude-35-sonnet",
    temperature: 0.3,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: "route-strategy",
    task_code: "CONTENT_STRATEGY",
    task_name: "Analisa Celah Konten & Rekomendasi Program",
    primary_model_id: "mod-gemini-pro",
    fallback_model_id: "mod-gpt-4o",
    temperature: 0.7,
    is_active: true,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
];


