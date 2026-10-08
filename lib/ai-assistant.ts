import { PriorityLevel } from "@/types/database";

// ============================================================================
// PRIMA RIB CONTENT PLAN — PHASE 5: AI ASSISTANT ENGINE
// Supports:
// 1. AI Idea Generator
// 2. AI Hook Generator
// 3. AI Carousel Generator
// 4. AI Caption Generator
// 5. AI Reels Generator (Hook, Voice Over, B-roll, Scene, CTA)
// 6. AI Content Strategy Recommendation
// ============================================================================

export interface GeneratedIdeaItem {
  title: string;
  description: string;
  priority: PriorityLevel;
  angle: string;
}

export interface GeneratedHookItem {
  category: string;
  hook: string;
  bestFor: string;
}

export interface GeneratedCarouselResult {
  hook: string;
  slides: {
    slideNumber: number;
    section: string;
    headline: string;
    body: string;
    visualDirection: string;
  }[];
  cta: string;
  formattedMainContent: string;
  formattedCreativeBrief: string;
}

export interface GeneratedCaptionResult {
  caption: string;
  cta: string;
  hashtags: string;
}

export interface GeneratedReelsResult {
  hook: string;
  voiceOver: string;
  bRoll: string;
  scenes: {
    timecode: string;
    scene: string;
    audioVo: string;
    visualBroll: string;
  }[];
  cta: string;
  formattedScript: string;
  formattedBrief: string;
}

export interface AiStrategyRecommendation {
  id: string;
  category: "PROGRAM_MIX" | "PILLAR_BALANCE" | "FORMAT_OPTIMIZATION" | "TIMING";
  title: string;
  insight: string;
  actionItem: string;
  suggestedProgramCode: string;
  suggestedPillarName: string;
  suggestedIdeaTitle: string;
}

const PROGRAM_TOPICS: Record<
  string,
  { keywords: string[]; audience: string; hashtags: string }
> = {
  CPNS: {
    keywords: [
      "Trik Cepat TIU Deret & Silogisme",
      "TWK Penalaran HOTS Bela Negara & Integritas",
      "Kata Kunci Poin 5 Soal TKP Pelayanan Publik",
      "Strategi Manajemen Waktu 100 Menit CAT SKD",
      "Cara Tembus Skor SKD 450+ Tanpa Bimbel Dadakan",
    ],
    audience: "Pejuang NIP & Peserta Seleksi CPNS 2026",
    hashtags:
      "#CPNS2026 #SKDCPNS #PejuangNIP #BelajarTIU #TWKPenalaran #SoalTKP #CATBKN #PrimaRIB",
  },
  SEKDIN: {
    keywords: [
      "Peta Persaingan & Rasio Keketatan IPDN vs PKN STAN",
      "Tahapan Seleksi STIN, STMKG, dan Polstat STIS",
      "Strategi Curi Start Belajar SKD Sekolah Kedinasan Kelas 12",
      "Syarat Fisik & Nilai Rapor Masuk Sekolah Kedinasan",
      "Keuntungan Lulusan Ikatan Dinas Langsung Jadi CPNS",
    ],
    audience: "Siswa SMA/SMK Kelas 12 & Pejuang Sekolah Kedinasan",
    hashtags:
      "#SekolahKedinasan2026 #IPDN #PKNSTAN #STIN #STMKG #PolstatSTIS #PejuangSekdin #PrimaRIB",
  },
  POLRI: {
    keywords: [
      "Rahasia Konsistensi Tes Psikologi Kecermatan Polri",
      "Teknik Benar Pull-Up, Push-Up, & Lari 12 Menit Jasmani Polri",
      "Materi Ujian Akademik Pengetahuan Umum & Wawasan Kebangsaan Polri",
      "Persiapan Mental Ideologi & Rikkes Bintara Polri",
      "Jadwal Latihan Fisik & Akademik Casis Polri",
    ],
    audience: "Calon Siswa (Casis) Bintara, Tamtama, & Taruna Akpol",
    hashtags:
      "#BintaraPolri2026 #CasisPolri #TesPsikologiPolri #JasmaniPolri #Akpol #PejuangPolri #PrimaRIB",
  },
  GENERAL: {
    keywords: [
      "Metode Belajar Pomodoro untuk Pejuang Seleksi Abdi Negara",
      "Suasana Simulasi CAT & Pembahasan Intensif di Kelas Prima RIB",
      "Kisah Sukses Alumni Prima RIB Lulus Seleksi Tahun Pertama",
      "Cara Mengatasi Burnout & Rasa Malas Saat Persiapan Ujian",
    ],
    audience: "Seluruh Pejuang CPNS, Sekolah Kedinasan, dan Polri",
    hashtags:
      "#PrimaRIB #BimbelCPNS #BimbelKedinasan #BimbelPolri #PejuangAbdiNegara #TryoutCAT",
  },
};

function getProgramConfig(programCode?: string) {
  const code = (programCode || "CPNS").toUpperCase();
  return PROGRAM_TOPICS[code] || PROGRAM_TOPICS.CPNS;
}

// ----------------------------------------------------------------------------
// 1. AI IDEA GENERATOR
// ----------------------------------------------------------------------------
export function generateAiIdeas(params: {
  programCode: string;
  pillarName: string;
  customTopic?: string;
}): GeneratedIdeaItem[] {
  const cfg = getProgramConfig(params.programCode);
  const topicFocus = params.customTopic?.trim() || cfg.keywords[0];
  const prog = params.programCode.toUpperCase();
  const pillar = params.pillarName;

  if (pillar === "Promosi" || pillar === "Promotion") {
    return [
      {
        title: `Kenapa Harus Ikut Simulasi Tryout CAT ${prog} di Prima RIB Sekarang?`,
        description: `Tunjukkan perbandingan peserta yang rutin simulasi CAT vs yang belajar tanpa ukur skor. Fokus topik: ${topicFocus}.`,
        priority: "HIGH",
        angle: "Fear of Missing Out (FOMO) & Bukti Sistem Ranking Real-Time",
      },
      {
        title: `Bedah Fasilitas Kelas Intensif ${prog} Prima RIB Batch Terbaru`,
        description: `Ulasan singkat modul eksklusif, pendampingan mentor, dan evaluasi berkala untuk menaklukkan ${topicFocus}.`,
        priority: "HIGH",
        angle: "Value Stack & Solusi Belajar Terarah",
      },
      {
        title: `Checklist Persiapan ${prog}: Sudahkah Kamu Punya Mentor yang Tepat?`,
        description: `Konten edukasi-promosi yang mengarahkan audiens untuk bergabung ke program bimbingan Prima RIB.`,
        priority: "MEDIUM",
        angle: "Self-Assessment & Soft Selling",
      },
    ];
  }

  return [
    {
      title: `5 Kesalahan Fatal Peserta Saat Menghadapi ${topicFocus}`,
      description: `Bahas kesalahan yang paling sering membuat skor ${prog} mentok beserta solusi praktis ala mentor Prima RIB.`,
      priority: "HIGH",
      angle: `Problem-Solution (${pillar})`,
    },
    {
      title: `Rumus & Strategi 30 Detik Menaklukkan ${topicFocus}`,
      description: `Panduan langkah demi langkah yang mudah disimpan (saveable) oleh ${cfg.audience}.`,
      priority: "HIGH",
      angle: `Actionable Tutorial & Quick Win (${pillar})`,
    },
    {
      title: `Simulasi HOTS ${prog}: Berani Jawab Soal ${topicFocus} Ini?`,
      description: `Berikan 1 studi kasus / soal jebakan terkait ${topicFocus} untuk memancing diskusi di kolom komentar.`,
      priority: "MEDIUM",
      angle: `Interactive Challenge (${pillar})`,
    },
    {
      title: `Roadmap Belajar 30 Hari Kuasai ${topicFocus} dari Nol`,
      description: `Susunan target mingguan bagi peserta ${prog} agar belajar lebih terstruktur dan tidak bingung mulai dari mana.`,
      priority: "MEDIUM",
      angle: `Step-by-Step Roadmap (${pillar})`,
    },
  ];
}

// ----------------------------------------------------------------------------
// 2. AI HOOK GENERATOR
// ----------------------------------------------------------------------------
export function generateAiHooks(params: {
  title: string;
  programCode: string;
  pillarName: string;
}): GeneratedHookItem[] {
  const topic = params.title.trim() || "Materi Seleksi";
  const prog = params.programCode.toUpperCase();

  return [
    {
      category: "Problem / Pain Point Hook",
      hook: `Kenapa nilai ${prog} kamu nggak naik-naik padahal sudah latihan tiap hari? Ternyata ini penyebabnya di ${topic}!`,
      bestFor: "Carousel Slide 1 & Reels Edukasi",
    },
    {
      category: "Curiosity / Mistake Hook",
      hook: `8 dari 10 peserta ${prog} terjebak di bagian ini! Jangan sampai kamu melakukan kesalahan yang sama saat ${topic}.`,
      bestFor: "Reels 3 Detik Pertama & TikTok",
    },
    {
      category: "Direct Value / Saveable Hook",
      hook: `Simpan dulu sebelum lewat! Ini panduan paling ringkas untuk menaklukkan ${topic} di seleksi ${prog} 2026.`,
      bestFor: "Carousel & Infographic",
    },
    {
      category: "Challenge / Engagement Hook",
      hook: `Berani tes kemampuanmu? Coba jawab tantangan ${topic} ini dalam waktu kurang dari 30 detik!`,
      bestFor: "Quiz & Single Feed Engagement",
    },
    {
      category: "Authority / Mentor Secret Hook",
      hook: `Jarang dibahas! Ini rahasia mentor Prima RIB membantu siswa lolos ${prog} lewat strategi ${topic}.`,
      bestFor: "Social Proof & Branding",
    },
  ];
}

// ----------------------------------------------------------------------------
// 3. AI CAROUSEL GENERATOR (Slide 1 - Slide 6)
// ----------------------------------------------------------------------------
export function generateAiCarousel(params: {
  title: string;
  programCode: string;
  pillarName: string;
}): GeneratedCarouselResult {
  const topic = params.title.trim() || "Strategi Lolos Seleksi";
  const prog = params.programCode.toUpperCase();
  const hook = `Kenapa banyak peserta ${prog} kehilangan poin penting di ${topic}?`;
  const cta = `Simpan post ini buat bahan belajar malam nanti & ikuti Tryout CAT ${prog} Prima RIB di link bio!`;

  const slides = [
    {
      slideNumber: 1,
      section: "Hook Cover",
      headline: hook,
      body: `Geser untuk tahu 3 kesalahan utama & strategi penaklukannya →`,
      visualDirection:
        "Background Primary Navy #284078, teks utama putih bold dengan highlight Secondary Yellow #DDB02E.",
    },
    {
      slideNumber: 2,
      section: "The Problem",
      headline: "Masalah yang Sering Terjadi Saat Ujian",
      body: `Banyak pejuang ${prog} langsung menghafal pola tanpa memahami konsep dasar dari ${topic}, sehingga panik saat bertemu variasi soal baru.`,
      visualDirection:
        "Ilustrasi stopwatch / grafik skor stagnan dengan poin masalah singkat.",
    },
    {
      slideNumber: 3,
      section: "Kesalahan / Poin #1",
      headline: "1. Terlalu Lama Terpaku di Satu Soal",
      body: "Manajemen waktu adalah kunci. Jika dalam 45 detik belum menemukan pola, segera tandai dan amankan soal yang lebih mudah terlebih dahulu.",
      visualDirection: "Layout bersih putih, badge nomor 01 warna #DDB02E.",
    },
    {
      slideNumber: 4,
      section: "Kesalahan / Poin #2",
      headline: "2. Mengabaikan Kata Kunci pada Soal",
      body: `Setiap soal ${prog} memiliki kata kunci indikator. Fokus pada kalimat pertanyaan inti sebelum membaca seluruh narasi panjang.`,
      visualDirection:
        "Tampilkan contoh potongan kalimat soal dengan stabilo kuning pada kata kunci.",
    },
    {
      slideNumber: 5,
      section: "Solusi Praktis Prima RIB",
      headline: "Formula 3 Langkah Ala Mentor Prima RIB",
      body: "1) Identifikasi tipe soal dalam 5 detik\n2) Eliminasi 2 opsi pengecoh ekstrem\n3) Evaluasi hasil latihan dengan sistem CAT real-time.",
      visualDirection: "Diagram step 1-2-3 vertikal dengan warna aksen Navy.",
    },
    {
      slideNumber: 6,
      section: "Summary & Call To Action",
      headline: `Siap Tembus Passing Grade ${prog} Tahun Ini?`,
      body: cta,
      visualDirection:
        "Tombol visual Save, Share, & informasi pendaftaran kelas/tryout Prima RIB.",
    },
  ];

  const formattedMainContent = slides
    .map(
      (s) =>
        `Slide ${s.slideNumber} (${s.section}):\n- Headline: ${s.headline}\n- Isi: ${s.body}`
    )
    .join("\n\n");

  const formattedCreativeBrief = slides
    .map((s) => `Slide ${s.slideNumber}: ${s.visualDirection}`)
    .join("\n");

  return {
    hook,
    slides,
    cta,
    formattedMainContent,
    formattedCreativeBrief,
  };
}

// ----------------------------------------------------------------------------
// 4. AI CAPTION GENERATOR
// ----------------------------------------------------------------------------
export function generateAiCaption(params: {
  title: string;
  programCode: string;
  pillarName: string;
}): GeneratedCaptionResult {
  const cfg = getProgramConfig(params.programCode);
  const topic = params.title.trim() || "Persiapan Seleksi";
  const prog = params.programCode.toUpperCase();

  const caption = `Persiapan menghadapi seleksi ${prog} bukan cuma soal siapa yang belajar paling lama, tapi siapa yang strateginya paling tepat! 🎯

Banyak peserta masih sering kehilangan poin saat menghadapi "${topic}". Padahal kalau kamu tahu pola dan kata kuncinya, bagian ini justru bisa jadi ladang poin buat mendongkrak skor akhir kamu.

Di konten kali ini, tim Prima RIB sudah merangkum poin-poin krusial yang wajib kamu kuasai supaya nggak terjebak lagi saat ujian nanti.

Sudah sejauh mana persiapan ${prog} kamu minggu ini? Yuk diskusi di kolom komentar! 👇`;

  const cta = `📌 Save postingan ini supaya nggak hilang saat butuh review materi, dan klik link di bio untuk gabung program intensif & Tryout CAT Prima RIB!`;

  return {
    caption,
    cta,
    hashtags: cfg.hashtags,
  };
}

// ----------------------------------------------------------------------------
// 5. AI REELS GENERATOR (Hook, Voice Over, B-roll, Scene, CTA)
// ----------------------------------------------------------------------------
export function generateAiReels(params: {
  title: string;
  programCode: string;
  pillarName: string;
}): GeneratedReelsResult {
  const topic = params.title.trim() || "Trik Lulus Seleksi";
  const prog = params.programCode.toUpperCase();

  const hook = `Jangan skip kalau kamu daftar ${prog} tahun ini! Ini alasan kenapa banyak peserta gagal di ${topic}.`;
  const cta = `Komen "MAU LULUS" dan follow Prima RIB buat dapetin bocoran strategi ${prog} setiap hari!`;

  const scenes = [
    {
      timecode: "00:00 - 00:04",
      scene: "Scene 1 — Hook Stop-Scroller",
      audioVo: hook,
      visualBroll:
        "Talent/Mentor menghadap kamera di ruang kelas Prima RIB sambil menunjuk teks headline di layar.",
    },
    {
      timecode: "00:04 - 00:12",
      scene: "Scene 2 — Agitate Problem",
      audioVo: `Masih banyak yang mengira ${topic} cukup dihafal semalam. Padahal di sistem ujian terbaru, waktu dan ketelitian kamu benar-benar diuji.`,
      visualBroll:
        "B-roll close-up peserta sedang mengerjakan simulasi CAT di laptop dengan timer berjalan.",
    },
    {
      timecode: "00:12 - 00:25",
      scene: "Scene 3 — Core Tips / Solution",
      audioVo: `Kuncinya ada di 2 hal: Pertama, kuasai pola dasar dan kata kunci soal. Kedua, biasakan latihan dengan batas waktu nyata supaya mentalmu terlatih.`,
      visualBroll:
        "Pop-up teks poin 1 & 2 berwarna Kuning #DDB02E di atas background Navy #284078 + footage mentor menjelaskan di papan tulis.",
    },
    {
      timecode: "00:25 - 00:35",
      scene: "Scene 4 — Call To Action",
      audioVo: cta,
      visualBroll:
        "Talent mengajak interaksi + animasi panah menuju kolom komentar & link di bio Prima RIB.",
    },
  ];

  const voiceOver = scenes.map((s) => s.audioVo).join(" ");
  const bRoll = scenes
    .map((s) => `${s.timecode}: ${s.visualBroll}`)
    .join("\n");

  const formattedScript = scenes
    .map(
      (s) =>
        `[${s.timecode}] ${s.scene}\nVO: "${s.audioVo}"\nVisual/B-Roll: ${s.visualBroll}`
    )
    .join("\n\n");

  return {
    hook,
    voiceOver,
    bRoll,
    scenes,
    cta,
    formattedScript,
    formattedBrief: `Format: Reels/TikTok 9:16 (35 Detik)\nTone: Energetik, Edukatif, & Meyakinkan\nB-Roll Utama:\n${bRoll}`,
  };
}

// ----------------------------------------------------------------------------
// 6. AI STRATEGY RECOMMENDATION
// ----------------------------------------------------------------------------
export function generateAiRecommendations(params?: {
  cpnsCount?: number;
  sekdinCount?: number;
  polriCount?: number;
}): AiStrategyRecommendation[] {
  const cpns = params?.cpnsCount ?? 0;
  const sekdin = params?.sekdinCount ?? 0;
  const polri = params?.polriCount ?? 0;

  return [
    {
      id: "rec-program-mix",
      category: "PROGRAM_MIX",
      title: "Rotasi Mingguan Niche (Minggu 1 CPNS • Minggu 2 Sekdin • Minggu 3 Polri • Minggu 4 General)",
      insight: `Saat ini tercatat ${cpns} konten CPNS, ${sekdin} konten Sekdin, dan ${polri} konten Polri. Pastikan rotasi mingguan tetap terjaga sesuai Master Schedule Post (5 konten per minggu: Senin s/d Jumat).`,
      actionItem:
        "Gunakan Opsi Rotasi Niche pada hari Selasa & Kamis untuk menjangkau target market CPNS, Kedinasan, dan Polri secara seimbang.",
      suggestedProgramCode: sekdin <= polri ? "SEKDIN" : "POLRI",
      suggestedPillarName: "Edukatif",
      suggestedIdeaTitle:
        sekdin <= polri
          ? "Cara Hitung Cepat SKD STAN Tanpa Rumus Ribet"
          : "Bedah Pola Angka Psikotes Kecermatan Polri",
    },
    {
      id: "rec-pillar-balance",
      category: "PILLAR_BALANCE",
      title: "Komposisi Pilar Harian (Senin Informatif • Selasa/Rabu Edukatif • Kamis Interaktif • Jumat Branding/Promosi)",
      insight:
        "Pola jadwal Prima RIB dirancang agar audiens mendapat informasi di hari Senin, edukasi mendalam di Selasa-Rabu, interaksi di Kamis, dan bukti sosial/konversi di hari Jumat.",
      actionItem:
        "Pastikan setiap hari Kamis diisi Reels Interaktif (Kuis Kilat, Poling, Q&A Mitos vs Fakta, atau This or That) untuk mendongkrak engagement.",
      suggestedProgramCode: "CPNS",
      suggestedPillarName: "Interaktif",
      suggestedIdeaTitle:
        "Kuis Kilat TWK: Pancasila & Bela Negara (Tebak Cepat A/B/C/D)",
    },
    {
      id: "rec-format-saves",
      category: "FORMAT_OPTIMIZATION",
      title: "Kombinasi Format: Feed/Karusel (Senin, Rabu, Jumat) & Reels 20–40 Detik (Selasa, Kamis)",
      insight:
        "Karusel 5–6 slide di hari Senin & Rabu memicu rasio Save tertinggi sebagai bahan belajar, sedangkan Reels 20–40 detik di hari Selasa & Kamis memperluas jangkauan organik di IG, FB, dan TikTok.",
      actionItem:
        "Distribusikan seluruh konten secara konsisten ke 3 platform utama (OUTPUT: IG/FB/TT).",
      suggestedProgramCode: "GENERAL",
      suggestedPillarName: "Strategi & Tips",
      suggestedIdeaTitle:
        "Strategi Belajar 30–60–90 Hari Sebelum Tes SKD & Seleksi Masuk",
    },
    {
      id: "rec-prime-time",
      category: "TIMING",
      title: "Konten Motivasi, Mentality & Relatable untuk Menjaga Retensi Audiens",
      insight:
        "Pejuang CPNS, Sekolah Kedinasan, dan Polri sering mengalami kejenuhan (burnout) dan tekanan mental menjelang hari H ujian.",
      actionItem:
        "Sisipkan konten Motivasi & Mentality ('Cerita gagal → bangkit → lolos' atau 'POV Pejuang CPNS') untuk membangun ikatan emosional dengan audiens.",
      suggestedProgramCode: "GENERAL",
      suggestedPillarName: "Motivasi & Mentality",
      suggestedIdeaTitle:
        "Cerita Gagal → Bangkit → Lolos Seleksi Bersama Prima RIB",
    },
  ];
}

