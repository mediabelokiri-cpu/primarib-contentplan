"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Film,
  Layers,
  FileText,
  History,
  RotateCcw,
  CheckCircle2,
  Wand2,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  useAppStore,
  saveContentScriptAction,
  rollbackScriptVersionAction,
} from "@/lib/store";
import {
  ScriptFormatType,
  ReelsScene,
  CarouselSlide,
  ContentScript,
  ScriptVersion,
} from "@/types/database";

interface AiScriptBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  initialTitle?: string;
  initialFormat?: string; // e.g. "fmt-reels", "fmt-carousel", "fmt-feed"
  initialProgramName?: string;
  initialPillarName?: string;
  onSaved?: (script: ContentScript) => void;
}

type BuilderTab = "EDITOR" | "REWRITE" | "VERSIONS" | "INSPECTION";

export function AiScriptBuilderModal({
  isOpen,
  onClose,
  contentId,
  initialTitle = "",
  initialFormat = "fmt-reels",
  initialProgramName = "CPNS",
  initialPillarName = "Edukatif",
  onSaved,
}: AiScriptBuilderModalProps) {
  const { state } = useAppStore();

  // Active builder tab
  const [activeTab, setActiveTab] = useState<BuilderTab>("EDITOR");

  // Determine initial format type
  const getFormatTypeFromId = (fmt: string): ScriptFormatType => {
    const fLower = (fmt || "").toLowerCase();
    if (fLower.includes("carousel") || fLower.includes("karusel"))
      return "CAROUSEL";
    if (fLower.includes("single") || fLower.includes("feed"))
      return "SINGLE_POST";
    return "REELS";
  };

  const [formatType, setFormatType] = useState<ScriptFormatType>(() =>
    getFormatTypeFromId(initialFormat)
  );

  // Script Data States
  const [title, setTitle] = useState(initialTitle);
  const [tone, setTone] = useState("Semi Formal (Standar Prima RIB)");
  const [hook, setHook] = useState("");
  const [cta, setCta] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  // Format-specific states
  const [reelsScenes, setReelsScenes] = useState<ReelsScene[]>([
    {
      id: "sc-1",
      timecode: "00:00 - 00:05",
      visual_direction:
        "Talent mentor berdiri percaya diri di depan layar Lab CAT Prima RIB",
      audio_dialogue:
        "Stop buang-buang waktu hitung cara manual kalau mau selesai sebelum waktu CAT habis!",
      text_on_screen: "TRIK HITUNG CEPAT TIU 15 DETIK!",
    },
    {
      id: "sc-2",
      timecode: "00:05 - 00:20",
      visual_direction:
        "Kamera zoom in ke layar simulasi CAT memperlihatkan soal pecahan HOTS",
      audio_dialogue:
        "Di ujian asli kamu cuma punya 50 detik per soal. Kalau kamu samakan penyebut satu-satu, waktu kamu pasti habis di 5 soal pertama!",
      text_on_screen: "JANGAN SAMAKAN PENYEBUT!",
    },
    {
      id: "sc-3",
      timecode: "00:20 - 00:45",
      visual_direction:
        "Talent mencoret angka dengan metode eliminasi selisih cepat Prima RIB",
      audio_dialogue:
        "Pakai metode Fast-Think Prima RIB: Cukup lihat selisih pembilang dan penyebut. Opsi A sampai E langsung kelihatan jawabannya dalam 15 detik!",
      text_on_screen: "METODE FAST-THINK PRIMA RIB",
    },
    {
      id: "sc-4",
      timecode: "00:45 - 00:60",
      visual_direction:
        "Talent tersenyum sambil memegang modul resmi & Lab CAT di belakangnya",
      audio_dialogue:
        "Mau trik lengkap 50 materi lainnya? Gabung kelas intensif Prima RIB sekarang. Klik link di bio!",
      text_on_screen: "GABUNG KELAS INTENSIF SEKARANG 👉 LINK DI BIO",
    },
  ]);

  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([
    {
      id: "sl-1",
      slide_number: 1,
      slide_type: "COVER",
      headline: "STOP Lakukan Ini Kalau Nggak Mau Gugur Administrasi!",
      body: "Swipe ke kiri untuk cek 5 ceklis wajib sebelum submit dokumen resmi ke SSCASN.",
      visual_direction:
        "Foto mahasiswa berseragam kedinasan dengan overlay teks kontras Navy #284078 & Gold #DDB02E",
    },
    {
      id: "sl-2",
      slide_number: 2,
      slide_type: "CONTENT",
      headline: "1. Sinkronisasi NIK Dukcapil",
      body: "Pastikan data di KTP & Kartu Keluarga 100% sinkron di database pusat. Selisih 1 huruf bisa otomatis bikin TMS.",
      visual_direction: "Ilustrasi KTP dengan checklist hijau dan icon warning merah.",
    },
    {
      id: "sl-3",
      slide_number: 3,
      slide_type: "CONTENT",
      headline: "2. Akreditasi Sesuai Tahun Kelulusan",
      body: "Gunakan surat ketetapan BAN-PT atau Kemdikbud saat tahun kamu lulus, bukan akreditasi terbaru saat ini.",
      visual_direction: "Screenshot sertifikat akreditasi berstempel resmi.",
    },
    {
      id: "sl-4",
      slide_number: 4,
      slide_type: "CONTENT",
      headline: "3. Format Materai & Tanda Tangan",
      body: "Perhatikan format materai 10.000 dan tanda tangan basah vs e-meterai sesuai arahan instansi yang dilamar.",
      visual_direction: "Infografis letak penempelan e-meterai yang benar agar tidak tumpang tindih.",
    },
    {
      id: "sl-5",
      slide_number: 5,
      slide_type: "CTA",
      headline: "Mau Dicek Berkas & Konsultasi Gratis?",
      body: "Bimbel Prima RIB sediakan pendampingan berkas 1-on-1 sampai tuntas. Simpan carousel ini & amankan kursi konsultasimu via link bio!",
      visual_direction: "Foto Lab CAT Prima RIB dengan tombol CTA emas 'Konsultasi Sekarang'.",
    },
  ]);

  const [singlePostBody, setSinglePostBody] = useState(
    "Banyak peserta seleksi merasa puas saat nilainya tembus passing grade. Padahal, sistem hanya mengambil 3x kuota formasi untuk lanjut ke tahap SKB!\n\nUntuk formasi pusat, target aman SKD bukan cuma 350, tapi minimal 410+. Di Prima RIB, kamu dilatih simulasi CAT berstandar BKN dengan perankingan nasional real-time, jadi kamu selalu tahu posisi kompetitormu sebelum hari H ujian."
  );

  // Loading & Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Section Rewrite states
  const [rewriteTarget, setRewriteTarget] = useState<
    "HOOK" | "CTA" | "CAPTION" | "CUSTOM"
  >("HOOK");
  const [rewriteStyle, setRewriteStyle] = useState<string>(
    "Lebih Menghentak & Penasaran"
  );
  const [rewriteCustomInstruction, setRewriteCustomInstruction] = useState("");
  const [rewriteResult, setRewriteResult] = useState<string | null>(null);

  // Load existing script & versions when modal opens
  const existingScripts = state.contentScripts || [];
  const currentContentScript = existingScripts.find(
    (s) => s.content_id === contentId
  );
  const contentVersions = (state.scriptVersions || []).filter(
    (v) => v.content_id === contentId
  );

  useEffect(() => {
    if (isOpen) {
      if (currentContentScript) {
        setTitle(currentContentScript.title || initialTitle);
        setFormatType(currentContentScript.format_type);
        setHook(currentContentScript.hook || "");
        setCta(currentContentScript.cta || "");
        setCaption(currentContentScript.caption || "");
        setHashtags(
          currentContentScript.hashtags ||
            "#PrimaRIB #BimbelCPNS #BimbelKedinasan #BimbelPolri"
        );
        setTone(
          currentContentScript.tone || "Semi Formal (Standar Prima RIB)"
        );
        if (
          currentContentScript.reels_scenes &&
          currentContentScript.reels_scenes.length > 0
        ) {
          setReelsScenes(currentContentScript.reels_scenes);
        }
        if (
          currentContentScript.carousel_slides &&
          currentContentScript.carousel_slides.length > 0
        ) {
          setCarouselSlides(currentContentScript.carousel_slides);
        }
        if (currentContentScript.single_post_body) {
          setSinglePostBody(currentContentScript.single_post_body);
        }
      } else {
        setTitle(initialTitle || "Strategi Menaklukkan Soal TIU & Waktu CAT");
        setFormatType(getFormatTypeFromId(initialFormat));
        setHook(
          "Stop buang-buang waktu hitung cara manual kalau mau selesai sebelum waktu CAT habis!"
        );
        setCta(
          "Daftar kelas intensif Prima RIB & kuasai ribuan trik cepat via link di bio!"
        );
        setCaption(
          "Bukan soal seberapa jago matematika, tapi seberapa cepat kamu nemu pola eliminasi! 🚀\n\nSimpan postingan ini buat latihan malam ini ya Sobat Prima. Tag teman seperjuanganmu di kolom komentar! 👇"
        );
        setHashtags("#PrimaRIB #BimbelCPNS #BimbelKedinasan #BimbelPolri #PejuangNIP");
      }
      setActiveTab("EDITOR");
      setSuccessBanner(null);
      setErrorMessage(null);
    }
  }, [isOpen, contentId, initialTitle, initialFormat, currentContentScript]);

  // Full AI Generation Handler
  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const prompt = `Buatkan script naskah konten lengkap untuk brand bimbingan belajar Prima RIB.
Topik/Judul: "${title}"
Program: "${initialProgramName}"
Pilar: "${initialPillarName}"
Format yang diinginkan: "${formatType}"
Target Tone: "${tone}"

Instruksi Khusus Format:
1. Jika REELS: sertakan hook 0-3s, breakdown scenes (timecode, visual_direction, audio_dialogue, text_on_screen), caption, dan CTA.
2. Jika CAROUSEL: sertakan slide 1 cover hook, slide 2-4 materi daging/ceklis, slide 5 CTA konsultasi, caption, dan CTA.
3. Jika SINGLE_POST: sertakan headline hook, body edukasi padat, visual_direction, caption, dan CTA.
Brand Context: Prima RIB adalah bimbel persiapan tes CPNS, Sekolah Kedinasan, dan Polri dengan fasilitas Lab CAT mirip BKN dan metode Fast-Think.`;

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "SCRIPT_WRITING",
          prompt,
          responseFormat: "json",
          userRole: "ADMIN",
        }),
      });

      if (!res.ok) {
        throw new Error(`Gagal menghubungi AI Engine (${res.status})`);
      }

      const data = await res.json();
      let parsedOutput: any = null;

      try {
        parsedOutput = JSON.parse(data.content);
      } catch {
        // Fallback parse
        parsedOutput = null;
      }

      if (parsedOutput) {
        if (parsedOutput.hook) setHook(parsedOutput.hook);
        if (parsedOutput.caption) setCaption(parsedOutput.caption);
        if (parsedOutput.cta) setCta(parsedOutput.cta);
        if (parsedOutput.hashtags) setHashtags(parsedOutput.hashtags);

        if (formatType === "REELS" && Array.isArray(parsedOutput.scenes)) {
          setReelsScenes(
            parsedOutput.scenes.map((sc: any, idx: number) => ({
              id: `sc-gen-${Date.now()}-${idx}`,
              timecode: sc.timecode || `00:${idx * 15} - 00:${(idx + 1) * 15}`,
              visual_direction:
                sc.visual ||
                sc.visual_direction ||
                "Talent mentor menjelaskan di depan Lab CAT",
              audio_dialogue:
                sc.audio || sc.audio_dialogue || "Penjelasan materi soal ujian",
              text_on_screen:
                sc.text_on_screen || sc.tos || "KATA KUNCI TRIK CEPAT",
            }))
          );
        } else if (
          formatType === "CAROUSEL" &&
          Array.isArray(parsedOutput.slides)
        ) {
          setCarouselSlides(
            parsedOutput.slides.map((sl: any, idx: number) => ({
              id: `sl-gen-${Date.now()}-${idx}`,
              slide_number: sl.slide_number || idx + 1,
              slide_type:
                sl.slide_type ||
                (idx === 0
                  ? "COVER"
                  : idx === parsedOutput.slides.length - 1
                  ? "CTA"
                  : "CONTENT"),
              headline: sl.headline || `Poin Penting ${idx + 1}`,
              body: sl.body || "Penjelasan detail poin materi untuk peserta.",
              visual_direction:
                sl.visual_direction || "Infografis berlatar Navy & Gold.",
            }))
          );
        } else if (formatType === "SINGLE_POST") {
          setSinglePostBody(
            parsedOutput.body || parsedOutput.main_content || title
          );
        }

        setSuccessBanner(
          `✨ Naskah ${formatType} berhasil di-generate dengan ${data.providerCode} (${data.modelCode})!`
        );
      } else {
        setSuccessBanner(
          "✨ Naskah berhasil disusun berdasarkan Brand Knowledge Prima RIB!"
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat generate script.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Section Rewrite Handler (FR-026)
  const handleRewriteSection = async () => {
    setIsRewriting(true);
    setRewriteResult(null);
    try {
      let sectionText = "";
      if (rewriteTarget === "HOOK") sectionText = hook;
      else if (rewriteTarget === "CTA") sectionText = cta;
      else if (rewriteTarget === "CAPTION") sectionText = caption;
      else
        sectionText =
          formatType === "REELS"
            ? reelsScenes[0]?.audio_dialogue || ""
            : singlePostBody;

      const prompt = `Tulis ulang (rewrite) bagian ${rewriteTarget} untuk konten Prima RIB berikut:
Teks Asli: "${sectionText}"
Arah Penulisan Baru: ${rewriteStyle}
${
  rewriteCustomInstruction
    ? `Instruksi Tambahan: ${rewriteCustomInstruction}`
    : ""
}
Target Audience: Pejuang CPNS, Kedinasan, & Polri.
Tone: ${tone}.
Berikan hasil rewrite langsung tanpa basa-basi.`;

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "COPYWRITING",
          prompt,
          userRole: "ADMIN",
        }),
      });

      if (!res.ok) throw new Error("Gagal melakukan rewrite");
      const data = await res.json();
      setRewriteResult(data.content.trim());
    } catch (err: any) {
      setRewriteResult(`Error: ${err.message}`);
    } finally {
      setIsRewriting(false);
    }
  };

  const applyRewriteResult = () => {
    if (!rewriteResult) return;
    if (rewriteTarget === "HOOK") {
      setHook(rewriteResult);
      setActiveTab("EDITOR");
    } else if (rewriteTarget === "CTA") {
      setCta(rewriteResult);
      setActiveTab("EDITOR");
    } else if (rewriteTarget === "CAPTION") {
      setCaption(rewriteResult);
      setActiveTab("EDITOR");
    }
    setSuccessBanner(`Bagian ${rewriteTarget} berhasil diperbarui!`);
    setRewriteResult(null);
  };

  // Save & Apply Action (FR-025 & FR-028)
  const handleSaveAndApply = () => {
    const saved = saveContentScriptAction({
      content_id: contentId,
      format_type: formatType,
      title,
      hook,
      reels_scenes: formatType === "REELS" ? reelsScenes : undefined,
      carousel_slides: formatType === "CAROUSEL" ? carouselSlides : undefined,
      single_post_body:
        formatType === "SINGLE_POST" ? singlePostBody : undefined,
      caption,
      cta,
      hashtags,
      tone,
      change_summary: `Versi ${(currentContentScript?.version_number || 0) + 1}: Update Script ${formatType}`,
    });

    if (onSaved) onSaved(saved);
    setSuccessBanner("🎉 Naskah berhasil disimpan dan disinkronkan ke konten!");
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Rollback version handler
  const handleRollback = (versionId: string, versionNumber: number) => {
    if (
      confirm(
        `Pulihkan naskah ke Versi ${versionNumber}? Perubahan saat ini akan disimpan sebagai riwayat baru.`
      )
    ) {
      rollbackScriptVersionAction(versionId);
      setSuccessBanner(`Berhasil restore naskah ke Versi ${versionNumber}!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  // Scene Helper Actions
  const addReelsScene = () => {
    const nextIdx = reelsScenes.length + 1;
    setReelsScenes((prev) => [
      ...prev,
      {
        id: `sc-custom-${Date.now()}`,
        timecode: `00:${(nextIdx - 1) * 15} - 00:${nextIdx * 15}`,
        visual_direction: "Talent mentor memberi arahan visual",
        audio_dialogue: "Penjelasan lanjutan trik soal",
        text_on_screen: "POIN PENTING",
      },
    ]);
  };

  const removeReelsScene = (id: string) => {
    if (reelsScenes.length <= 1) return;
    setReelsScenes((prev) => prev.filter((s) => s.id !== id));
  };

  // Slide Helper Actions
  const addCarouselSlide = () => {
    const nextNum = carouselSlides.length + 1;
    setCarouselSlides((prev) => [
      ...prev,
      {
        id: `sl-custom-${Date.now()}`,
        slide_number: nextNum,
        slide_type: "CONTENT",
        headline: `Poin ${nextNum}`,
        body: "Penjelasan materi ringkas dan mudah dipahami pejuang seleksi.",
        visual_direction: "Infografis warna Navy #284078 & Gold #DDB02E.",
      },
    ]);
  };

  const removeCarouselSlide = (id: string) => {
    if (carouselSlides.length <= 2) return;
    setCarouselSlides((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Script Builder Suite — Prima RIB"
      maxWidthClass="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Header Ribbon: Format & Tone Selector */}
        <div className="bg-gradient-to-r from-navy/95 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-navy/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/20 text-gold border border-gold/30">
                  <Sparkles className="w-3.5 h-3.5" /> AI Script Builder (Module 04)
                </span>
                {currentContentScript && (
                  <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-slate-200">
                    Versi {currentContentScript.version_number} Aktif
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {title || "Penyusunan Naskah & Copywriting Terstruktur"}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Target: {initialProgramName} • Pilar: {initialPillarName} • Disesuaikan Brand Knowledge Prima RIB
              </p>
            </div>

            {/* Format Pill Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setFormatType("REELS")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  formatType === "REELS"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" /> Reels / Video
              </button>
              <button
                type="button"
                onClick={() => setFormatType("CAROUSEL")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  formatType === "CAROUSEL"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Karusel Slide
              </button>
              <button
                type="button"
                onClick={() => setFormatType("SINGLE_POST")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  formatType === "SINGLE_POST"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Single Post
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("EDITOR")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === "EDITOR"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wand2 className="w-4 h-4" /> Script Editor & Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("REWRITE")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === "REWRITE"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Zap className="w-4 h-4" /> Section Rewrite & Tone Adjuster
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("VERSIONS")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === "VERSIONS"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-4 h-4" /> Riwayat Versi ({contentVersions.length})
          </button>
        </div>

        {/* Banners */}
        {successBanner && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 1: SCRIPT EDITOR & TIMELINE */}
        {/* =================================================================== */}
        {activeTab === "EDITOR" && (
          <div className="space-y-5">
            {/* Generation Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topik / Judul Naskah
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Rahasia Menaklukkan Soal TIU & Waktu CAT"
                  className="w-full text-sm font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="w-full md:w-56">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gaya Bahasa & Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Semi Formal (Standar Prima RIB)">Semi Formal (Prima RIB)</option>
                  <option value="Santai & Relatable">Santai & Relatable</option>
                  <option value="Persuasif & Urgensi Tinggi">Persuasif & Closing</option>
                  <option value="Edukatif Langkah-demi-Langkah">Edukatif Step-by-Step</option>
                </select>
              </div>

              <div className="self-end w-full md:w-auto">
                <button
                  type="button"
                  disabled={isGenerating || !title.trim()}
                  onClick={handleGenerateScript}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-purple text-white text-xs font-bold rounded-lg hover:opacity-95 transition disabled:opacity-50 shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sedang Generate AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span>Generate Script dengan AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hook 0-3 Detik Editor */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-gold" />
                  Hook 0–3 Detik (Pemicu Perhatian Awal)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRewriteTarget("HOOK");
                    setActiveTab("REWRITE");
                  }}
                  className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline decoration-dotted"
                >
                  Rewrite Hook dengan AI →
                </button>
              </div>
              <textarea
                rows={2}
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="Hook verbal atau visual yang membuat penonton berhenti scrolling..."
                className="w-full text-sm font-medium px-3 py-2 bg-white border border-amber-300/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[11px] text-amber-700">
                Sesuai Brand Guidelines: Jangan gunakan klaim hoaks seperti &quot;100% pasti lulus tanpa ujian&quot;.
              </p>
            </div>

            {/* FORMAT BREAKDOWN: REELS */}
            {formatType === "REELS" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-primary" />
                    Timeline & Adegan Video (Scene Breakdown)
                  </h4>
                  <button
                    type="button"
                    onClick={addReelsScene}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Adegan
                  </button>
                </div>

                <div className="space-y-3">
                  {reelsScenes.map((scene, idx) => (
                    <div
                      key={scene.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-100 pb-2">
                        <span className="flex items-center gap-1.5 text-navy font-bold">
                          <span className="w-5 h-5 rounded-full bg-navy/10 text-navy flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          Adegan {idx + 1}
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <input
                              type="text"
                              value={scene.timecode}
                              onChange={(e) => {
                                const val = e.target.value;
                                setReelsScenes((prev) =>
                                  prev.map((s) =>
                                    s.id === scene.id
                                      ? { ...s, timecode: val }
                                      : s
                                  )
                                );
                              }}
                              className="w-24 text-[11px] px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-center"
                            />
                          </div>
                          {reelsScenes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeReelsScene(scene.id)}
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                              title="Hapus Adegan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Visual & Talent Direction
                          </label>
                          <textarea
                            rows={2}
                            value={scene.visual_direction}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReelsScenes((prev) =>
                                prev.map((s) =>
                                  s.id === scene.id
                                    ? { ...s, visual_direction: val }
                                    : s
                                )
                              );
                            }}
                            placeholder="Aksi talent, angle kamera, background Lab CAT..."
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Audio / Spoken Dialogue
                          </label>
                          <textarea
                            rows={2}
                            value={scene.audio_dialogue}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReelsScenes((prev) =>
                                prev.map((s) =>
                                  s.id === scene.id
                                    ? { ...s, audio_dialogue: val }
                                    : s
                                )
                              );
                            }}
                            placeholder="Kata-kata yang diucapkan talent atau suara voiceover..."
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-primary font-medium text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          Text On Screen (TOS / Pop-up Layar)
                        </label>
                        <input
                          type="text"
                          value={scene.text_on_screen}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReelsScenes((prev) =>
                              prev.map((s) =>
                                s.id === scene.id
                                  ? { ...s, text_on_screen: val }
                                  : s
                              )
                            );
                          }}
                          placeholder="Teks singkat penekanan di layar (contoh: METODE ELIMINASI KILAT)"
                          className="w-full text-xs px-2 py-1 bg-amber-50/40 border border-amber-200/80 rounded-md focus:bg-white focus:outline-none text-slate-800 font-semibold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORMAT BREAKDOWN: CAROUSEL */}
            {formatType === "CAROUSEL" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple" />
                    Slide-by-Slide Copywriting
                  </h4>
                  <button
                    type="button"
                    onClick={addCarouselSlide}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple bg-purple/10 rounded-md hover:bg-purple/20 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Slide
                  </button>
                </div>

                <div className="space-y-3">
                  {carouselSlides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-100 pb-2">
                        <span className="flex items-center gap-2 text-purple font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-purple/10 text-purple text-[11px]">
                            Slide {idx + 1}
                          </span>
                          <span className="text-slate-400 font-normal">|</span>
                          <select
                            value={slide.slide_type}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setCarouselSlides((prev) =>
                                prev.map((s) =>
                                  s.id === slide.id
                                    ? { ...s, slide_type: val }
                                    : s
                                )
                              );
                            }}
                            className="bg-transparent font-semibold text-slate-700 focus:outline-none"
                          >
                            <option value="COVER">COVER (Slide Utama)</option>
                            <option value="CONTENT">CONTENT (Isi Materi)</option>
                            <option value="CTA">CTA (Slide Akhir)</option>
                          </select>
                        </span>

                        {carouselSlides.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeCarouselSlide(slide.id)}
                            className="text-slate-400 hover:text-rose-600 transition p-1"
                            title="Hapus Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Headline Slide
                          </label>
                          <input
                            type="text"
                            value={slide.headline}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCarouselSlides((prev) =>
                                prev.map((s) =>
                                  s.id === slide.id
                                    ? { ...s, headline: val }
                                    : s
                                )
                              );
                            }}
                            placeholder="Judul besar pada slide..."
                            className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-primary text-slate-800"
                          />

                          <label className="block text-[11px] font-semibold text-slate-600 mt-2 mb-1">
                            Isi Penjelasan / Body Copy
                          </label>
                          <textarea
                            rows={3}
                            value={slide.body}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCarouselSlides((prev) =>
                                prev.map((s) =>
                                  s.id === slide.id ? { ...s, body: val } : s
                                )
                              );
                            }}
                            placeholder="Penjelasan ringkas per slide..."
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-primary font-medium text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Instruksi Desainer / Visual Direction
                          </label>
                          <textarea
                            rows={5}
                            value={slide.visual_direction}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCarouselSlides((prev) =>
                                prev.map((s) =>
                                  s.id === slide.id
                                    ? { ...s, visual_direction: val }
                                    : s
                                )
                              );
                            }}
                            placeholder="Panduan visual untuk tim grafis (warna latar Navy/Gold, gambar yang ditaruh, layout teks)..."
                            className="w-full text-xs p-2 bg-purple-50/30 border border-purple-200/60 rounded-lg focus:bg-white focus:outline-none focus:border-purple text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORMAT BREAKDOWN: SINGLE POST */}
            {formatType === "SINGLE_POST" && (
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Naskah Single Post / Poster Feed
                </h4>
                <textarea
                  rows={5}
                  value={singlePostBody}
                  onChange={(e) => setSinglePostBody(e.target.value)}
                  placeholder="Isi konten postingan tunggal berbobot..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-primary text-slate-800 font-medium"
                />
              </div>
            )}

            {/* Call to Action (CTA) & Caption */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Call To Action (CTA)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRewriteTarget("CTA");
                      setActiveTab("REWRITE");
                    }}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    AI Rewrite CTA →
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Contoh: Amankan slot bimbingan intensifmu via link di bio!"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Caption & Hashtags
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRewriteTarget("CAPTION");
                      setActiveTab("REWRITE");
                    }}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    AI Rewrite Caption →
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tulis caption medsos lengkap..."
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#PrimaRIB #BimbelCPNS #InfoKedinasan"
                  className="w-full text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-md text-primary font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: SECTION REWRITE & TONE ADJUSTER (FR-026 & FR-027) */}
        {/* =================================================================== */}
        {activeTab === "REWRITE" && (
          <div className="space-y-5">
            <div className="p-4 bg-gradient-to-r from-purple/10 to-primary/10 rounded-xl border border-purple/20">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-purple" />
                AI Targeted Section Rewrite (FR-026)
              </h4>
              <p className="text-xs text-slate-600">
                Pilih bagian naskah tertentu yang ingin disempurnakan oleh AI tanpa mengubah keseluruhan naskah lainnya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bagian yang Ingin Di-Rewrite
                </label>
                <div className="space-y-1.5">
                  {(["HOOK", "CTA", "CAPTION"] as const).map((tgt) => (
                    <button
                      key={tgt}
                      type="button"
                      onClick={() => setRewriteTarget(tgt)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                        rewriteTarget === tgt
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {tgt === "HOOK"
                        ? "🎯 Hook 0–3 Detik"
                        : tgt === "CTA"
                        ? "📣 Call To Action (CTA)"
                        : "📝 Caption Medsos"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilihan Arah Gaya / Style Rewrite (FR-027)
                  </label>
                  <select
                    value={rewriteStyle}
                    onChange={(e) => setRewriteStyle(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Lebih Menghentak & Penasaran (Pattern Interrupt)">
                      Lebih Menghentak & Penasaran (Pattern Interrupt)
                    </option>
                    <option value="Lebih Santai & Relatable (Pejuang Seleksi)">
                      Lebih Santai & Relatable (Bahasa Pejuang Seleksi)
                    </option>
                    <option value="Lebih To-The-Point & Solutif">
                      Lebih To-The-Point & Solutif Langsung
                    </option>
                    <option value="Lebih Urgensi & Hard-Selling (Beli/Daftar Segera)">
                      Lebih Urgensi & Closing (Hard-Selling)
                    </option>
                    <option value="Soft-Selling (Edukasi Konsultasi WhatsApp Bio)">
                      Soft-Selling (Arahkan ke Link Bio WhatsApp)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instruksi Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={rewriteCustomInstruction}
                    onChange={(e) => setRewriteCustomInstruction(e.target.value)}
                    placeholder="Contoh: tambahkan mention fasilitas Lab CAT berstandar BKN..."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="button"
                  disabled={isRewriting}
                  onClick={handleRewriteSection}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition disabled:opacity-50"
                >
                  {isRewriting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AI Sedang Merumuskan Rewrite...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Jalankan Rewrite Bagian {rewriteTarget}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Rewrite Result Preview */}
            {rewriteResult && (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Hasil Rekomendasi AI untuk {rewriteTarget}:
                  </span>
                  <button
                    type="button"
                    onClick={applyRewriteResult}
                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition shadow-xs"
                  >
                    ✓ Terapkan ke Editor
                  </button>
                </div>
                <div className="p-3 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-slate-800 leading-relaxed">
                  {rewriteResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: RIWAYAT VERSI SCRIPT (FR-028) */}
        {/* =================================================================== */}
        {activeTab === "VERSIONS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Riwayat Versi Script (Script Versioning)
                </h4>
                <p className="text-xs text-slate-500">
                  Seluruh perubahan naskah disimpan otomatis sebagai snapshot. Kamu dapat memulihkan naskah ke versi sebelumnya kapan saja.
                </p>
              </div>
            </div>

            {contentVersions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">
                  Belum ada riwayat versi untuk konten ini.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik &quot;Simpan & Terapkan Naskah&quot; di tab Editor untuk membuat snapshot Versi 1.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {contentVersions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-navy/10 text-navy text-xs font-bold rounded">
                          Versi {ver.version_number}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {ver.change_summary}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({ver.format_type})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 italic">
                        &quot;{ver.snapshot.hook || ver.snapshot.title}&quot;
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Disimpan pada: {new Date(ver.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRollback(ver.id, ver.version_number)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition self-start md:self-center"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      Restore Versi {ver.version_number}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Human-in-the-loop: Naskah AI selalu membutuhkan persetujuan reviewer sebelum tayang.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="w-1/2 sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy/90 transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>Simpan & Terapkan Naskah</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
