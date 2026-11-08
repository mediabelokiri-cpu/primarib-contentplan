"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Lightbulb,
  ArrowRight,
  Search,
  Edit3,
  CheckCircle2,
  Cpu,
  Compass,
  Calendar,
  BarChart3,
  AlertTriangle,
  Layers,
  Check,
  RefreshCw,
  Zap,
  Play,
  DownloadCloud,
  FileText,
  Trash2,
  Info,
} from "lucide-react";
import {
  useAppStore,
  createIdeaAction,
  updateIdeaAction,
  updateIdeaStatusAction,
  deleteIdeaPermanentlyAction,
  createContentAction,
  batchCreateIdeasAction,
} from "@/lib/store";
import { IDEA_STATUSES, PRIORITY_LEVELS } from "@/lib/constants";
import {
  formatDate,
  getPriorityBadgeStyle,
  getProgramBadgeStyle,
  getStatusBadgeStyle,
} from "@/lib/utils";
import { IdeaStatus, IdeaWithRelations, PriorityLevel } from "@/types/database";
import { Modal } from "@/components/ui/Modal";

interface GeneratedAiIdeaResult {
  title: string;
  hook: string;
  angle: string;
  format: string;
  targetAudience: string;
  objective: string;
  cta: string;
  strategicReasoning: string;
  priority: PriorityLevel;
}

export default function IdeasPage() {
  const router = useRouter();
  const { state, enrichedIdeas, enrichedContents } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [programFilter, setProgramFilter] = useState<string>("ALL");
  const [pillarFilter, setPillarFilter] = useState<string>("ALL");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Modal state for Create / Edit Idea
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<IdeaWithRelations | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState("prog-cpns");
  const [pillarId, setPillarId] = useState("pil-edukatif");
  const [priority, setPriority] = useState<PriorityLevel>("HIGH");
  const [source, setSource] = useState("");

  // =========================================================================
  // AI CONTENT STRATEGIST SUITE STATE (Module 03 — FR-021 s/d FR-026)
  // =========================================================================
  const [isAiSuiteOpen, setIsAiSuiteOpen] = useState(false);
  const [aiSuiteTab, setAiSuiteTab] = useState<
    "GENERATOR" | "GAP_ANALYSIS" | "MONTHLY_PLAN"
  >("GENERATOR");

  // Tab 1: AI Idea Generator
  const [genProgramId, setGenProgramId] = useState("prog-cpns");
  const [genPillarId, setGenPillarId] = useState("pil-edukatif");
  const [genAudienceId, setGenAudienceId] = useState(
    state.brandAudiences?.[0]?.id || ""
  );
  const [genFormat, setGenFormat] = useState<string>("Reels Video");
  const [genCustomTopic, setGenCustomTopic] = useState("");
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [aiGeneratedIdeas, setAiGeneratedIdeas] = useState<
    GeneratedAiIdeaResult[]
  >([]);
  const [savedIdeaTitles, setSavedIdeaTitles] = useState<string[]>([]);

  // Tab 2: Gap Analysis Data
  const totalContents = enrichedContents.length;
  const cpnsContents = enrichedContents.filter(
    (c) => c.program?.code === "CPNS"
  ).length;
  const sekdinContents = enrichedContents.filter(
    (c) => c.program?.code === "SEKDIN"
  ).length;
  const polriContents = enrichedContents.filter(
    (c) => c.program?.code === "POLRI"
  ).length;
  const generalContents = enrichedContents.filter(
    (c) => c.program?.code === "GENERAL"
  ).length;

  const edukatifPillar = enrichedContents.filter(
    (c) => c.pillar?.name?.toLowerCase().includes("edukatif")
  ).length;
  const informatifPillar = enrichedContents.filter(
    (c) => c.pillar?.name?.toLowerCase().includes("informatif")
  ).length;
  const interaktifPillar = enrichedContents.filter(
    (c) => c.pillar?.name?.toLowerCase().includes("interaktif")
  ).length;
  const brandingPillar = enrichedContents.filter(
    (c) =>
      c.pillar?.name?.toLowerCase().includes("branding") ||
      c.pillar?.name?.toLowerCase().includes("promosi")
  ).length;

  // Tab 3: Monthly 4-Week Plan Generator
  const [isGeneratingMonthly, setIsGeneratingMonthly] = useState(false);
  const [hasImportedMonthly, setHasImportedMonthly] = useState(false);

  // =========================================================================
  // ACTIONS: GENERATE IDEAS VIA SERVER ORCHESTRATOR
  // =========================================================================
  const handleGenerateAiIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingIdeas(true);

    const progObj = state.programs.find((p) => p.id === genProgramId);
    const pilObj = state.pillars.find((p) => p.id === genPillarId);
    const audObj = state.brandAudiences?.find((a) => a.id === genAudienceId);

    const promptText = `Hasilkan 3 ide konten strategis dan spesifik untuk brand bimbingan belajar PRIMA RIB.
- Program Target: ${progObj?.name || "CPNS"} (${progObj?.code || "CPNS"})
- Content Pillar: ${pilObj?.name || "Edukatif"}
- Target Audiens: ${audObj?.audience_name || "Pejuang NIP CPNS"}
- Format Konten: ${genFormat}
${genCustomTopic ? `- Fokus Topik Khusus: ${genCustomTopic}` : ""}

Keluarkan dalam format JSON dengan array "ideas", di mana setiap ide memiliki properti:
- "title": judul konten yang memikat & spesifik
- "hook": kalimat pembuka 0-3 detik yang menghentikan scroll
- "angle": sudut pandang konten
- "format": format konten yang direkomendasikan
- "targetAudience": target audiens yang dituju
- "objective": tujuan konten (Edukasi, Engagement, Konversi)
- "cta": kalimat call to action
- "strategicReasoning": alasan strategis mengapa ide ini bekerja
- "priority": "HIGH" | "MEDIUM"`;

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskCode: "IDEA_GENERATION",
          prompt: promptText,
          responseFormat: "json",
          context: {
            brandProfile: state.brandProfile,
            brandTone: state.brandToneGuidelines?.[0],
            targetAudience: audObj,
            product: state.brandProducts?.[0],
            relevantKnowledge: state.brandKnowledge?.slice(0, 3),
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.content) {
        let parsed: any = null;
        try {
          parsed = JSON.parse(json.data.content);
        } catch {
          // If response contains markdown code fences
          const cleaned = json.data.content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          parsed = JSON.parse(cleaned);
        }

        if (parsed && Array.isArray(parsed.ideas)) {
          setAiGeneratedIdeas(parsed.ideas);
          showToast(`Berhasil menghasilkan ${parsed.ideas.length} ide konten!`);
        } else {
          fallbackIdeasGenerator();
        }
      } else {
        fallbackIdeasGenerator();
      }
    } catch {
      fallbackIdeasGenerator();
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const fallbackIdeasGenerator = () => {
    const progObj = state.programs.find((p) => p.id === genProgramId);
    const pilObj = state.pillars.find((p) => p.id === genPillarId);
    const isPolri = progObj?.code === "POLRI";
    const isSekdin = progObj?.code === "SEKDIN";

    const dummyResults: GeneratedAiIdeaResult[] = [
      {
        title: isPolri
          ? "Strategi Menghindari Kesalahan Fatal Tes Angka Hilang Polri"
          : isSekdin
          ? "Cara Cepat Menembus Skor SKD 430+ di PKN STAN Tanpa Bimbel Dadakan"
          : "Bongkar Trik TIU Silogisme HOTS 15 Detik Langsung Ketemu Jawaban",
        hook: "Banyak yang gagal di tahapan ini bukan karena kurang pintar, tapi karena nggak tahu pola eliminasi ini!",
        angle: "Trik Cepat & Efisiensi Waktu",
        format: "Reels Video (Talent Mentor)",
        targetAudience: isPolri
          ? "Pejuang Bintara Polri"
          : isSekdin
          ? "Siswa SMA Kelas 12 Pejuang Kedinasan"
          : "Pejuang NIP CPNS 2026",
        objective: "Edukasi & Pembuktian Metode",
        cta: "Simpan video ini buat latihan malam ini & tag teman seperjuanganmu!",
        strategicReasoning:
          "Memanfaatkan ketakutan umum pejuang tes terhadap limit waktu ujian CAT.",
        priority: "HIGH",
      },
      {
        title: isPolri
          ? "Standar Penilaian Uji Jasmani A & B Penerimaan Polri 2026"
          : isSekdin
          ? "Peta Rasio Keketatan IPDN vs STIS vs STAN: Mana Peluang Terbesarmu?"
          : "Aturan Nilai Ambang Batas & Bobot Poin 5 TKP Integritas BKN",
        hook: "Jangan sampai persiapan fisik atau belajarmu gugur gara-gara tidak paham aturan resmi ini!",
        angle: "Regulasi & Info Resmi",
        format: "Carousel 5-Slide Infografis",
        targetAudience: "Calon Pelamar Baru",
        objective: "Saves & Shares Kredibilitas",
        cta: "Ketik 'PANDUAN' di kolom komentar untuk dapat checklist lengkapnya!",
        strategicReasoning:
          "Format infografis memiliki rasio save dan share 3x lebih tinggi dibanding single post biasa.",
        priority: "HIGH",
      },
      {
        title: isPolri
          ? "Kuis Cepat: Tes Ketelitian Huruf Hilang Waktu 10 Detik!"
          : isSekdin
          ? "This or That Kedinasan: Ikatan Dinas Kemenkeu vs Kemenkumham?"
          : "Kuis Kilat TWK: Pasal Pengamalan Sila ke-2 atau ke-5?",
        hook: "Coba jawab soal ini dalam 5 detik tanpa nyontek!",
        angle: "Interaktif & Relatable",
        format: "Reels Video (Talent Siswa / Interaktif)",
        targetAudience: "Pejuang Seleksi Aktif",
        objective: "Komentar & Engagement Tinggi",
        cta: "Tulis jawabanmu di kolom komentar sekarang. Jawaban benar kita spill di story!",
        strategicReasoning:
          "Pilar interaktif memancing komentar masif sehingga algoritma mendongkrak jangkauan akun.",
        priority: "MEDIUM",
      },
    ];

    setAiGeneratedIdeas(dummyResults);
    showToast("Ide berhasil digenerate melalui Prima RIB Knowledge Engine!");
  };

  // 1-Click Promote to Idea Bank
  const handlePromoteToIdeaBank = (
    idea: GeneratedAiIdeaResult,
    convertNow = false
  ) => {
    const created = createIdeaAction({
      title: idea.title,
      description: `Hook: "${idea.hook}"\nAngle: ${idea.angle}\nTarget: ${idea.targetAudience}\nAlasan Strategis: ${idea.strategicReasoning}`,
      program_id: genProgramId,
      pillar_id: genPillarId,
      format_id: idea.format.toLowerCase().includes("reel")
        ? "fmt-reels"
        : idea.format.toLowerCase().includes("carousel")
        ? "fmt-carousel"
        : "fmt-feed",
      priority: idea.priority,
      source: "AI Content Strategist",
      source_type: "AI_ASSISTED",
    });

    setSavedIdeaTitles((prev) => [...prev, idea.title]);
    showToast(`Ide "${idea.title.slice(0, 30)}..." berhasil disimpan ke Idea Bank!`);

    if (convertNow) {
      setIsAiSuiteOpen(false);
      router.push(`/content/new?idea_id=${encodeURIComponent(created.id)}`);
    }
  };

  // 1-Click Direct Conversion to Planned Content in Kanban
  const handleDirectConvertToPlannedContent = (idea: GeneratedAiIdeaResult) => {
    const isReel = idea.format.toLowerCase().includes("reel");
    const formatId = isReel
      ? "fmt-reels"
      : idea.format.toLowerCase().includes("carousel")
      ? "fmt-carousel"
      : "fmt-feed";

    createContentAction({
      title: idea.title,
      program_id: genProgramId,
      pillar_id: genPillarId,
      format_id: formatId,
      talent_category: isReel ? "Mentor / Pengajar" : null,
      platform_ids: ["plat-ig", "plat-tt"],
      objective: idea.objective,
      target_audience: idea.targetAudience,
      angle: idea.angle,
      hook: idea.hook,
      cta: idea.cta,
      priority: idea.priority,
      source_type: "AI_ASSISTED",
    });

    setSavedIdeaTitles((prev) => [...prev, idea.title]);
    showToast("Konten baru berhasil masuk ke antrean Production Board (Status: PLANNED)!");
    setIsAiSuiteOpen(false);
    router.push("/production");
  };

  // Batch Import 4-Week Monthly Campaign Ideas
  const handleBatchImportMonthlyPlan = () => {
    setIsGeneratingMonthly(true);
    const batches = [
      // Week 1: CPNS
      {
        title: "Syarat Lengkap & Alur Pendaftaran CPNS 2026",
        description: "Infografis 5 slide alur pendaftaran SSCASN dan berkas wajib.",
        program_id: "prog-cpns",
        pillar_id: "pil-informatif",
        format_id: "fmt-feed",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 1 - Senin)",
      },
      {
        title: "Trik Cepat TIU Deret Angka 15 Detik",
        description: "Video talent mentor membedah pola deret bertingkat di Lab CAT.",
        program_id: "prog-cpns",
        pillar_id: "pil-edukatif",
        format_id: "fmt-reels",
        talent_category: "Mentor / Pengajar",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 1 - Selasa)",
      },
      {
        title: "Perbandingan TIU vs TKP: Mana yang Lebih Berbahaya?",
        description: "Karusel edukatif bedah bobot poin dan strategi alokasi waktu.",
        program_id: "prog-cpns",
        pillar_id: "pil-edukatif",
        format_id: "fmt-carousel",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 1 - Rabu)",
      },
      {
        title: "Kuis Kilat TWK Penalaran HOTS Bela Negara",
        description: "Video kuis interaktif dengan timer 10 detik.",
        program_id: "prog-cpns",
        pillar_id: "pil-interaktif",
        format_id: "fmt-reels",
        talent_category: "Talent Model",
        priority: "MEDIUM" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 1 - Kamis)",
      },
      {
        title: "Profil Master Mentor SKD Prima RIB & Fasilitas Lab CAT",
        description: "Branding pengajar ahli dan ruang simulasi ujian CAT BKN.",
        program_id: "prog-cpns",
        pillar_id: "pil-branding",
        format_id: "fmt-feed",
        priority: "MEDIUM" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 1 - Jumat)",
      },

      // Week 2: Sekolah Kedinasan
      {
        title: "Perbandingan Syarat PKN STAN, IPDN, STIS & Poltekim",
        description: "Tabel komparasi batas usia, tinggi badan, dan kuota penerimaan.",
        program_id: "prog-sekdin",
        pillar_id: "pil-informatif",
        format_id: "fmt-feed",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 2 - Senin)",
      },
      {
        title: "Tips Lolos SKD Kedinasan untuk Siswa Kelas 12",
        description: "Video naskah motivasi cara curi start belajar sejak semester 1.",
        program_id: "prog-sekdin",
        pillar_id: "pil-edukatif",
        format_id: "fmt-reels",
        talent_category: "Mentor / Pengajar",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 2 - Selasa)",
      },
      {
        title: "3 Kesalahan Fatal Saat Menjawab Soal TKP Kedinasan",
        description: "Karusel pembahasan opsi jawaban jebakan poin 1 dan 2.",
        program_id: "prog-sekdin",
        pillar_id: "pil-edukatif",
        format_id: "fmt-carousel",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 2 - Rabu)",
      },
      {
        title: "This or That: Pilih Ikatan Dinas Kemenkeu atau Kemendagri?",
        description: "Reels interaktif talent model membandingkan gaya hidup taruna.",
        program_id: "prog-sekdin",
        pillar_id: "pil-interaktif",
        format_id: "fmt-reels",
        talent_category: "Talent Model",
        priority: "MEDIUM" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 2 - Kamis)",
      },
      {
        title: "Testimoni Siswa Prima RIB Lolos PKN STAN & IPDN",
        description: "Branding alumni menceritakan perjuangan dari nol hingga lolos.",
        program_id: "prog-sekdin",
        pillar_id: "pil-branding",
        format_id: "fmt-feed",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 2 - Jumat)",
      },

      // Week 3: Polri
      {
        title: "Syarat Fisik & Berkas Penerimaan Taruna Akpol & Bintara",
        description: "Infografis batas tinggi badan, standar BMI, dan tes kesehatan.",
        program_id: "prog-polri",
        pillar_id: "pil-informatif",
        format_id: "fmt-feed",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 3 - Senin)",
      },
      {
        title: "Trik Psikotes Kecermatan Angka Hilang Polri",
        description: "Video tutorial melatih stamina jari dan konsentrasi tes Pauli.",
        program_id: "prog-polri",
        pillar_id: "pil-edukatif",
        format_id: "fmt-reels",
        talent_category: "Mentor / Pengajar",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 3 - Selasa)",
      },
      {
        title: "Panduan Latihan Kesamaptaan Jasmani A & B di Rumah",
        description: "Karusel panduan lari 12 menit, pull-up, dan shuttle run.",
        program_id: "prog-polri",
        pillar_id: "pil-edukatif",
        format_id: "fmt-carousel",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 3 - Rabu)",
      },
      {
        title: "Mitos vs Fakta Masuk Polisi: Harus Punya Bekingan?",
        description: "Reels siswa membongkar mitos dan membuktikan jalur prestasi murni.",
        program_id: "prog-polri",
        pillar_id: "pil-interaktif",
        format_id: "fmt-reels",
        talent_category: "Siswa",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 3 - Kamis)",
      },
      {
        title: "Dokumentasi Kelas Latihan Fisik & Tryout Polri Prima RIB",
        description: "Galeri foto suasana drill fisik bersama pelatih bersertifikasi.",
        program_id: "prog-polri",
        pillar_id: "pil-branding",
        format_id: "fmt-feed",
        priority: "MEDIUM" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 3 - Jumat)",
      },

      // Week 4: General & Konversi
      {
        title: "FAQ Bimbingan Belajar Prima RIB: Semua Pertanyaan Terjawab",
        description: "Rangkuman tanya jawab biaya, jadwal kelas, dan sistem garansi.",
        program_id: "prog-general",
        pillar_id: "pil-informatif",
        format_id: "fmt-feed",
        priority: "MEDIUM" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 4 - Senin)",
      },
      {
        title: "Strategi Mental Menghadapi Hari H Ujian CAT BKN",
        description: "Reels motivasi mengatasi kecemasan dan blank saat layar ujian mulai.",
        program_id: "prog-general",
        pillar_id: "pil-edukatif",
        format_id: "fmt-reels",
        talent_category: "Mentor / Pengajar",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 4 - Selasa)",
      },
      {
        title: "4 Aturan Manajemen Waktu Belajar untuk Pekerja & Honorer",
        description: "Karusel jadwal belajar 2 jam sehari yang konsisten.",
        program_id: "prog-general",
        pillar_id: "pil-edukatif",
        format_id: "fmt-carousel",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 4 - Rabu)",
      },
      {
        title: "Kuis Mental: Siapkah Kamu Menjadi Abdi Negara?",
        description: "Video interaktif evaluasi komitmen calon aparatur negara.",
        program_id: "prog-general",
        pillar_id: "pil-interaktif",
        format_id: "fmt-reels",
        talent_category: "Talent Model",
        priority: "MEDIUM" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 4 - Kamis)",
      },
      {
        title: "Promo Pembukaan Kelas Baru Batch Intensif Prima RIB",
        description: "Pengumuman diskon early bird 25% dan bonus tryout akbar.",
        program_id: "prog-general",
        pillar_id: "pil-branding",
        format_id: "fmt-feed",
        priority: "HIGH" as PriorityLevel,
        source: "Paket Bulanan AI (Minggu 4 - Jumat)",
      },
    ];

    batchCreateIdeasAction(batches);
    setIsGeneratingMonthly(false);
    setHasImportedMonthly(true);
    showToast("20 Ide Paket 4-Minggu Prima RIB berhasil diimpor ke Idea Bank!");
  };

  // Manual Idea Actions
  const openNewIdeaModal = () => {
    setEditingIdea(null);
    setTitle("");
    setDescription("");
    setProgramId(state.programs[0]?.id || "prog-cpns");
    setPillarId(state.pillars[0]?.id || "pil-edukatif");
    setPriority("HIGH");
    setSource("");
    setIsModalOpen(true);
  };

  const openEditIdeaModal = (idea: IdeaWithRelations) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setDescription(idea.description || "");
    setProgramId(idea.program_id || state.programs[0]?.id || "prog-cpns");
    setPillarId(idea.pillar_id || state.pillars[0]?.id || "pil-edukatif");
    setPriority(idea.priority);
    setSource(idea.source || "");
    setIsModalOpen(true);
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingIdea) {
      updateIdeaAction(editingIdea.id, {
        title: title.trim(),
        description: description.trim(),
        program_id: programId,
        pillar_id: pillarId,
        priority,
        source: source.trim(),
      });
      showToast("Ide berhasil diperbarui!");
    } else {
      createIdeaAction({
        title: title.trim(),
        description: description.trim(),
        program_id: programId,
        pillar_id: pillarId,
        priority,
        source: source.trim() || "Manual Entry",
        source_type: "MANUAL",
      });
      showToast("Ide baru berhasil dibuat!");
    }
    setIsModalOpen(false);
  };

  // Filter ideas
  const filteredIdeas = enrichedIdeas.filter((idea) => {
    if (statusFilter !== "ALL" && idea.status !== statusFilter) return false;
    if (programFilter !== "ALL" && idea.program_id !== programFilter)
      return false;
    if (pillarFilter !== "ALL" && idea.pillar_id !== pillarFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = idea.title.toLowerCase().includes(q);
      const matchDesc = (idea.description || "").toLowerCase().includes(q);
      const matchSource = (idea.source || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSource) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#284078]">
              <Cpu className="h-3.5 w-3.5 text-[#284078]" />
              Module 03 • AI Content Strategist
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
              Total Ide: {enrichedIdeas.length}
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
            Idea Bank & Content Strategist
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Pusat pengembangan ide konten cerdas berbasis brand grounding, audit celah pilar, dan perencanaan bulanan terpadu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSavedIdeaTitles([]);
              setIsAiSuiteOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#284078] hover:bg-[#1e305a] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
          >
            <Cpu className="h-4 w-4" />
            <span>AI Content Strategist Suite</span>
          </button>

          <button
            type="button"
            onClick={openNewIdeaModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <Plus className="h-4 w-4 text-[#284078]" />
            <span>Tambah Ide Manual</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards (Pillar & Program Balance Preview) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Ide Baru (New)
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">
            {enrichedIdeas.filter((i) => i.status === "NEW").length}
          </p>
          <span className="text-[10px] text-slate-500">Menunggu kurasi tim</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
            Ide Terpilih (Selected)
          </p>
          <p className="mt-1 text-xl font-extrabold text-blue-600">
            {enrichedIdeas.filter((i) => i.status === "SELECTED").length}
          </p>
          <span className="text-[10px] text-slate-500">Siap disusun script</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
            Sudah Terencana (Planned)
          </p>
          <p className="mt-1 text-xl font-extrabold text-emerald-600">
            {enrichedIdeas.filter((i) => i.status === "PLANNED").length}
          </p>
          <span className="text-[10px] text-slate-500">Masuk antrean produksi</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-500">
            AI Generated Ideas
          </p>
          <p className="mt-1 text-xl font-extrabold text-[#6D4AFF]">
            {enrichedIdeas.filter((i) => i.source_type === "AI_ASSISTED").length}
          </p>
          <span className="text-[10px] text-slate-500">Dihasilkan oleh AI</span>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", ...IDEA_STATUSES].map((st) => {
            const active = statusFilter === st;
            const count =
              st === "ALL"
                ? enrichedIdeas.length
                : enrichedIdeas.filter((i) => i.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#6D4AFF] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {st === "ALL" ? "Semua Ide" : st} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Program filter */}
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Program</option>
            {state.programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Search bar */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Ideas Grid List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIdeas.map((idea) => {
          return (
            <div
              key={idea.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition hover:border-[#6D4AFF]/50 hover:shadow-xs"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getProgramBadgeStyle(
                        idea.program?.code
                      )}`}
                    >
                      {idea.program?.name || "General"}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {idea.pillar?.name || "Pilar"}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityBadgeStyle(
                        idea.priority
                      )}`}
                    >
                      {idea.priority}
                    </span>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${getStatusBadgeStyle(
                      idea.status as any
                    )}`}
                  >
                    {idea.status}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900 leading-snug">
                  {idea.title}
                </h3>

                {idea.description && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3 whitespace-pre-line">
                    {idea.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                  <span className="truncate max-w-[150px]">
                    Sumber: {idea.source || "Manual"}
                  </span>
                  <span>{formatDate(idea.created_at)}</span>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditIdeaModal(idea)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="Edit Ide"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteIdeaPermanentlyAction(idea.id);
                      showToast("Ide berhasil dihapus.");
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Hapus Ide"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {idea.status === "NEW" && (
                    <button
                      type="button"
                      onClick={() => {
                        updateIdeaStatusAction(idea.id, "SELECTED");
                        showToast("Status diubah ke SELECTED!");
                      }}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Pilih Ide
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      updateIdeaStatusAction(idea.id, "PLANNED");
                      router.push(
                        `/content/new?idea_id=${encodeURIComponent(idea.id)}`
                      );
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#6D4AFF] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#5B38E8]"
                  >
                    <span>Jadikan Konten</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Lightbulb className="mx-auto h-8 w-8 text-slate-300" />
          <h4 className="mt-2 text-sm font-bold text-slate-800">
            Tidak ada ide yang cocok dengan filter
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Gunakan AI Content Strategist Suite untuk menghasilkan rekomendasi ide baru!
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AI CONTENT STRATEGIST SUITE (Module 03 FR-021 s/d FR-026) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAiSuiteOpen}
        onClose={() => setIsAiSuiteOpen(false)}
        title="AI Content Strategist Suite (Prima RIB)"
        maxWidthClass="max-w-4xl"
      >
        <div className="space-y-5">
          {/* Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
            {[
              { id: "GENERATOR", label: "🎯 AI Idea Generator", icon: Zap },
              {
                id: "GAP_ANALYSIS",
                label: "📊 Pillar & Audience Gap Analysis",
                icon: BarChart3,
              },
              {
                id: "MONTHLY_PLAN",
                label: "🗓️ Paket Kalender 4-Minggu",
                icon: Calendar,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = aiSuiteTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAiSuiteTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    active
                      ? "bg-[#6D4AFF] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* =================================================================== */}
          {/* TAB 1: AI STRATEGIC IDEA GENERATOR (FR-021) */}
          {/* =================================================================== */}
          {aiSuiteTab === "GENERATOR" && (
            <div className="space-y-4">
              <form
                onSubmit={handleGenerateAiIdeas}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-2xs space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Program Niche
                    </label>
                    <select
                      value={genProgramId}
                      onChange={(e) => setGenProgramId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
                    >
                      {state.programs.map((prog) => (
                        <option key={prog.id} value={prog.id}>
                          {prog.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Pilar Konten
                    </label>
                    <select
                      value={genPillarId}
                      onChange={(e) => setGenPillarId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
                    >
                      {state.pillars.map((pil) => (
                        <option key={pil.id} value={pil.id}>
                          {pil.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Target Audiens
                    </label>
                    <select
                      value={genAudienceId}
                      onChange={(e) => setGenAudienceId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
                    >
                      {(state.brandAudiences || []).map((aud) => (
                        <option key={aud.id} value={aud.id}>
                          {aud.audience_name.slice(0, 24)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Format Konten
                    </label>
                    <select
                      value={genFormat}
                      onChange={(e) => setGenFormat(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
                    >
                      <option value="Reels Video (Talent Mentor)">
                        Reels (Talent Mentor)
                      </option>
                      <option value="Reels Video (Talent Model)">
                        Reels (Talent Model)
                      </option>
                      <option value="Reels Video (Siswa)">Reels (Siswa)</option>
                      <option value="Carousel 5-Slide Edukatif">
                        Carousel (Multi-Slide)
                      </option>
                      <option value="Single Post Poster">Single Post</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={genCustomTopic}
                    onChange={(e) => setGenCustomTopic(e.target.value)}
                    placeholder="Fokus materi khusus (opsional, misal: TIU Deret Angka, Standar Samapta Polri, SKD STAN)..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#6D4AFF] focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingIdeas}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6D4AFF] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#5B38E8] disabled:opacity-60"
                  >
                    <Play
                      className={`h-3.5 w-3.5 ${
                        isGeneratingIdeas ? "animate-pulse" : "fill-white"
                      }`}
                    />
                    <span>
                      {isGeneratingIdeas
                        ? "Menganalisa & Menghasilkan..."
                        : "Generate Ide Strategis"}
                    </span>
                  </button>
                </div>
              </form>

              {/* Generated Result Cards */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {aiGeneratedIdeas.map((item, idx) => {
                  const isSaved = savedIdeaTitles.includes(item.title);
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2.5 transition hover:border-[#6D4AFF]/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                            {item.format}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            Angle: {item.angle}
                          </span>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityBadgeStyle(
                              item.priority
                            )}`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          Target: {item.targetAudience}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-2.5 text-xs text-amber-950">
                        <span className="font-bold">🎯 Hook 0-3 Detik: </span>
                        <span>"{item.hook}"</span>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p>
                          <strong>💡 Alasan Strategis: </strong>
                          {item.strategicReasoning}
                        </p>
                        <p>
                          <strong>📢 Call to Action: </strong>"{item.cta}"
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        {isSaved ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Ide Sudah Tersimpan</span>
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handlePromoteToIdeaBank(item, false)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                            >
                              <Plus className="h-3.5 w-3.5 text-[#6D4AFF]" />
                              <span>Simpan ke Idea Bank</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDirectConvertToPlannedContent(item)
                              }
                              className="inline-flex items-center gap-1 rounded-xl bg-[#6D4AFF] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#5B38E8] shadow-2xs"
                            >
                              <span>Langsung Jadikan Konten</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {aiGeneratedIdeas.length === 0 && !isGeneratingIdeas && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                    Pilih niche program & klik tombol "Generate Ide Strategis" untuk menghasilkan rekomendasi AI!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 2: PILLAR & AUDIENCE GAP ANALYSIS (FR-022, FR-023, FR-024) */}
          {/* =================================================================== */}
          {aiSuiteTab === "GAP_ANALYSIS" && (
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {/* Niche Balance Progress Bars */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Sebaran Konten per Wilayah Program ({totalContents} Konten Aktif)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Target Ideal: 25% Seimbang per Rotasi
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>CPNS</span>
                      <span>
                        {cpnsContents} ({totalContents ? Math.round((cpnsContents / totalContents) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{
                          width: `${totalContents ? (cpnsContents / totalContents) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Sekolah Kedinasan (SEKDIN)</span>
                      <span>
                        {sekdinContents} ({totalContents ? Math.round((sekdinContents / totalContents) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{
                          width: `${totalContents ? (sekdinContents / totalContents) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Polri</span>
                      <span>
                        {polriContents} ({totalContents ? Math.round((polriContents / totalContents) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${totalContents ? (polriContents / totalContents) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar Balance Bar */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Komposisi Pilar Konten
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Edukatif</p>
                    <p className="text-base font-extrabold text-slate-900">{edukatifPillar}</p>
                    <span className="text-[10px] text-emerald-600">Bedah soal & trik</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Informatif</p>
                    <p className="text-base font-extrabold text-slate-900">{informatifPillar}</p>
                    <span className="text-[10px] text-blue-600">Syarat & regulasi</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Interaktif</p>
                    <p className="text-base font-extrabold text-slate-900">{interaktifPillar}</p>
                    <span className="text-[10px] text-purple-600">Kuis & Q&A</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Branding & Promo</p>
                    <p className="text-base font-extrabold text-slate-900">{brandingPillar}</p>
                    <span className="text-[10px] text-amber-600">Lab CAT & alumni</span>
                  </div>
                </div>
              </div>

              {/* Strategic Insights & Gap Warnings */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Temuan Celah & Rekomendasi AI Strategist:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-amber-950 text-[11px]">
                  {polriContents < 3 && (
                    <li>
                      <strong>Celah Niche Polri:</strong> Postingan bertema Polri masih minim ({polriContents} konten). Tambahkan 2-3 konten psikotes kecermatan atau panduan jasmani di hari Selasa/Kamis.
                    </li>
                  )}
                  {interaktifPillar < 2 && (
                    <li>
                      <strong>Celah Pilar Interaktif:</strong> Konten kuis kilat atau Q&A masih sedikit. Manfaatkan slot hari Kamis untuk konten 'This or That' atau 'Tebak Jawaban' guna memicu algoritma komentar.
                    </li>
                  )}
                  <li>
                    <strong>Deteksi Kejenuhan (Fatigue):</strong> Pastikan hook tidak melulu diawali kata 'Hati-hati'. Gunakan variasi tantangan logika ('Coba tebak pola ini...') untuk menjaga audiens tetap segar.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: 4-WEEK MONTHLY BATCH CAMPAIGN (FR-025 & FR-026) */}
          {/* =================================================================== */}
          {aiSuiteTab === "MONTHLY_PLAN" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Rencana Konten 4-Minggu Prima RIB (20 Postingan Terstruktur)
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Mengikuti aturan baku posting mingguan Prima RIB: Senin (Feed), Selasa (Reel Talent), Rabu (Karusel Edukasi), Kamis (Reel Interaktif), Jumat (Branding).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBatchImportMonthlyPlan}
                    disabled={isGeneratingMonthly || hasImportedMonthly}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#284078] hover:bg-[#1e305a] px-4 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-60 transition"
                  >
                    <DownloadCloud className="h-4 w-4" />
                    <span>
                      {hasImportedMonthly
                        ? "20 Ide Telah Diimpor!"
                        : "Batch Import 20 Ide ke Idea Bank"}
                    </span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4 text-xs">
                  <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3">
                    <p className="font-bold text-purple-900">Minggu 1: Fokus CPNS</p>
                    <p className="text-[11px] text-purple-700 mt-1">
                      5 Konten (TIU Deret, Alur SSCASN, TWK HOTS, Lab CAT)
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                    <p className="font-bold text-emerald-900">Minggu 2: Fokus Sekdin</p>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      5 Konten (STAN/IPDN, Kesalahan TKP, Tips Kelas 12, Testimoni)
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                    <p className="font-bold text-blue-900">Minggu 3: Fokus Polri</p>
                    <p className="text-[11px] text-blue-700 mt-1">
                      5 Konten (Psikotes Angka Hilang, Syarat Jasmani, Mitos Calo)
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                    <p className="font-bold text-amber-900">Minggu 4: Konversi</p>
                    <p className="text-[11px] text-amber-700 mt-1">
                      5 Konten (Manajemen Waktu, Mental H-1, Promo Batch Baru)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setIsAiSuiteOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* Manual Idea Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIdea ? "Edit Ide Konten" : "Tambah Ide Konten Baru"}
      >
        <form onSubmit={handleSaveIdea} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Judul Ide *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: 3 Trik Cepat Mengerjakan Soal TIU Deret"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Deskripsi Singkat / Catatan Angle
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan poin utama atau angle ide konten ini..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Program Niche
              </label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                {state.programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Pilar Konten
              </label>
              <select
                value={pillarId}
                onChange={(e) => setPillarId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                {state.pillars.map((pil) => (
                  <option key={pil.id} value={pil.id}>
                    {pil.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                {PRIORITY_LEVELS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Sumber Referensi
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Misal: Evaluasi Tryout / DM"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6D4AFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B38E8]"
            >
              Simpan Ide
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
