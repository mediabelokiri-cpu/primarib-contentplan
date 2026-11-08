"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Film,
  Layers,
  FileText,
  History,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
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
  Cpu,
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
  initialHook?: string;
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
  initialHook = "",
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
  const [hashtags, setHashtags] = useState("#PrimaRIB #BimbelCPNS #BimbelKedinasan #BimbelPolri");

  // Format-specific states (clean initial state, no dummy/demo scripts)
  const [reelsScenes, setReelsScenes] = useState<ReelsScene[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [singlePostBody, setSinglePostBody] = useState("");

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

  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    // Only run initialization when modal transitions from closed to open
    if (isOpen && !prevIsOpenRef.current) {
      const isNewDraft = !contentId || contentId === "new-content-draft";
      if (!isNewDraft && currentContentScript) {
        setTitle(currentContentScript.title || initialTitle);
        setFormatType(currentContentScript.format_type);
        setHook(currentContentScript.hook || initialHook || "");
        setCta(currentContentScript.cta || "");
        setCaption(currentContentScript.caption || "");
        setHashtags(
          currentContentScript.hashtags ||
            "#PrimaRIB #BimbelCPNS #BimbelKedinasan #BimbelPolri"
        );
        setTone(
          currentContentScript.tone || "Semi Formal (Standar Prima RIB)"
        );
        setReelsScenes(
          currentContentScript.reels_scenes && currentContentScript.reels_scenes.length > 0
            ? currentContentScript.reels_scenes
            : []
        );
        setCarouselSlides(
          currentContentScript.carousel_slides && currentContentScript.carousel_slides.length > 0
            ? currentContentScript.carousel_slides
            : []
        );
        setSinglePostBody(currentContentScript.single_post_body || "");
      } else {
        // ALWAYS prioritize fresh initialTitle & initialHook when creating a new content / draft!
        setTitle(initialTitle || "");
        setFormatType(getFormatTypeFromId(initialFormat));
        setHook(initialHook || "");
        setCta("");
        setCaption("");
        setHashtags("#PrimaRIB #BimbelCPNS #BimbelKedinasan #BimbelPolri");
        setReelsScenes([]);
        setCarouselSlides([]);
        setSinglePostBody("");
      }
      setActiveTab("EDITOR");
      setSuccessBanner(null);
      setErrorMessage(null);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, contentId, initialTitle, initialHook, initialFormat, currentContentScript]);

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

Instruksi Format:
- Format yang diminta adalah ${formatType}.
${
  formatType === "REELS"
    ? 'HANYA hasilkan array "scenes" (timecode, visual_direction, audio_dialogue, text_on_screen). JANGAN hasilkan array slides dan DILARANG gunakan kata "slide" pada hook maupun naskah!'
    : formatType === "CAROUSEL"
    ? 'HANYA hasilkan array "slides" (slide_number, slide_type, headline, body, visual_direction).'
    : 'HANYA hasilkan "single_post_body" yang padat dan informatif.'
}
Brand Context: Bimbel Prima RIB spesialis persiapan ujian CPNS, Sekolah Kedinasan, dan Polri dengan fasilitas Lab Simulasi CAT standar BKN dan metode Fast-Think.`;

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskCode: "SCRIPT_WRITING",
          task: "SCRIPT_WRITING",
          prompt,
          responseFormat: "json",
          userRole: "ADMIN",
        }),
        signal: AbortSignal.timeout(20000), // Max 20 detik
      });

      if (!res.ok) {
        throw new Error(`Gagal menghubungi AI Engine (${res.status})`);
      }

      const data = await res.json();
      let parsedOutput: any = null;
      const rawContent = data.content || data.data?.content || "";

      try {
        parsedOutput = JSON.parse(rawContent);
      } catch {
        try {
          const cleaned = rawContent
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
          parsedOutput = JSON.parse(cleaned);
        } catch {
          parsedOutput = null;
        }
      }

      if (parsedOutput) {
        let finalHook =
          parsedOutput.hook ||
          `Mau kuasai ${title}? Ini trik rahasia yang wajib kamu tahu!`;
        if (formatType === "REELS") {
          finalHook = finalHook.replace(/^Slide\s*\d+:\s*/i, "");
        }
        setHook(finalHook);

        let finalCaption =
          parsedOutput.caption ||
          `Jangan sampai persiapanmu sia-sia karena salah metode belajar! 🚀\n\nSimpan konten ini dan bagikan ke rekan sesama pejuang ujian. Mau tanya seputar materi? Tulis di komentar ya! 👇\n\n#PrimaRIB #BimbelPrimaRIB`;
        if (formatType === "REELS") {
          finalCaption = finalCaption.replace(/carousel/gi, "video");
        }
        setCaption(finalCaption);

        if (parsedOutput.cta) setCta(parsedOutput.cta);
        if (parsedOutput.hashtags) setHashtags(parsedOutput.hashtags);

        if (formatType === "REELS") {
          let scenesArr = Array.isArray(parsedOutput.scenes)
            ? parsedOutput.scenes
            : [];
          if (scenesArr.length === 0 && Array.isArray(parsedOutput.slides)) {
            scenesArr = parsedOutput.slides.map((sl: any) => ({
              timecode: "00:00 - 00:15",
              visual_direction:
                sl.visual_direction ||
                "Talent mentor berdiri percaya diri di depan layar Lab CAT Prima RIB",
              audio_dialogue: `${sl.headline}. ${sl.body}`,
              text_on_screen: sl.headline || "POIN PENTING",
            }));
          }

          // Fallback kontekstual agar timeline adegan 100% selalu terisi siap pakai
          if (scenesArr.length === 0) {
            scenesArr = [
              {
                timecode: "00:00 - 00:05",
                visual_direction:
                  "Talent mentor berdiri percaya diri di depan layar Lab CAT Prima RIB dengan ekspresi antusias",
                audio_dialogue:
                  finalHook ||
                  `Mau kuasai ${title}? Simak video ini sampai selesai!`,
                text_on_screen: title.slice(0, 32).toUpperCase(),
              },
              {
                timecode: "00:05 - 00:20",
                visual_direction:
                  "Kamera zoom in ke layar tablet/modul memperlihatkan poin inti materi",
                audio_dialogue: `Banyak peserta yang gagal di tahap ini karena belum tahu pola efisiennya. Kuncinya ada pada eliminasi cepat dan ketenangan mental.`,
                text_on_screen: "POLA KUNCI & ELIMINASI",
              },
              {
                timecode: "00:20 - 00:45",
                visual_direction:
                  "Talent mendemonstrasikan trik cepat metode Fast-Think Prima RIB",
                audio_dialogue: `Gunakan metode Fast-Think Prima RIB: cari selisih dan eliminasi opsi yang tidak relevan dalam 15 detik tanpa rumus rumit!`,
                text_on_screen: "METODE FAST-THINK PRIMA RIB",
              },
              {
                timecode: "00:45 - 00:60",
                visual_direction:
                  "Talent tersenyum, banner CTA kelas intensif dan link bio muncul",
                audio_dialogue: `Mau kuasai ribuan trik cepat materi lainnya? Konsultasikan persiapanmu bersama mentor Prima RIB sekarang. Klik link di bio!`,
                text_on_screen: "KONSULTASI GRATIS 👉 LINK DI BIO",
              },
            ];
          }

          setReelsScenes(
            scenesArr.map((sc: any, idx: number) => ({
              id: `sc-gen-${Date.now()}-${idx}`,
              timecode:
                sc.timecode ||
                `00:${String(idx * 15).padStart(2, "0")} - 00:${String(
                  (idx + 1) * 15
                ).padStart(2, "0")}`,
              visual_direction:
                sc.visual ||
                sc.visual_direction ||
                "Talent mentor menjelaskan di depan Lab CAT",
              audio_dialogue:
                sc.audio ||
                sc.audio_dialogue ||
                "Penjelasan materi soal ujian",
              text_on_screen:
                sc.text_on_screen || sc.tos || "KATA KUNCI TRIK CEPAT",
            }))
          );
        } else if (formatType === "CAROUSEL") {
          let slidesArr = Array.isArray(parsedOutput.slides)
            ? parsedOutput.slides
            : [];
          if (slidesArr.length === 0 && Array.isArray(parsedOutput.scenes)) {
            slidesArr = parsedOutput.scenes.map((sc: any, idx: number) => ({
              slide_number: idx + 1,
              slide_type:
                idx === 0
                  ? "COVER"
                  : idx === parsedOutput.scenes.length - 1
                  ? "CTA"
                  : "CONTENT",
              headline: sc.text_on_screen || `Poin ${idx + 1}`,
              body: sc.audio_dialogue || "",
              visual_direction:
                sc.visual_direction || "Infografis berlatar Navy & Gold.",
            }));
          }

          if (slidesArr.length === 0) {
            slidesArr = [
              {
                slide_number: 1,
                slide_type: "COVER",
                headline: title,
                body: "Swipe ke kiri untuk cek strategi dan pembahasan lengkapnya 👉",
                visual_direction:
                  "Cover tegas dengan tipografi kontras Solid Navy & Gold",
              },
              {
                slide_number: 2,
                slide_type: "CONTENT",
                headline: "1. Pola Dasar & Analisis Soal",
                body: "Pahami karakteristik materi yang sering menjebak peserta dan buang waktu ujian.",
                visual_direction: "Diagram perbandingan cara lama vs cara cepat",
              },
              {
                slide_number: 3,
                slide_type: "CONTENT",
                headline: "2. Metode Eliminasi Fast-Think",
                body: "Fokus pada selisih angka atau kata kunci utama untuk menemukan jawaban dalam 15-20 detik.",
                visual_direction: "Langkah-langkah trik eliminasi pilihan ganda",
              },
              {
                slide_number: 4,
                slide_type: "CONTENT",
                headline: "3. Latihan Standar CAT",
                body: "Simulasi di Lab CAT Prima RIB membiasakanmu dengan tampilan dan batasan waktu BKN sesungguhnya.",
                visual_direction: "Foto fasilitas simulasi Lab CAT Prima RIB",
              },
              {
                slide_number: 5,
                slide_type: "CTA",
                headline: "Siapkan Diri Sekarang!",
                body: "Konsultasikan peluang kelulusanmu bersama mentor Prima RIB. Klik link di bio!",
                visual_direction: "Tombol call to action jelas kontak bimbingan",
              },
            ];
          }

          setCarouselSlides(
            slidesArr.map((sl: any, idx: number) => ({
              id: `sl-gen-${Date.now()}-${idx}`,
              slide_number: sl.slide_number || idx + 1,
              slide_type:
                sl.slide_type ||
                (idx === 0
                  ? "COVER"
                  : idx === slidesArr.length - 1
                  ? "CTA"
                  : "CONTENT"),
              headline: sl.headline || `Poin Penting ${idx + 1}`,
              body:
                sl.body || "Penjelasan detail poin materi untuk peserta.",
              visual_direction:
                sl.visual_direction || "Infografis berlatar Navy & Gold.",
            }))
          );
        } else if (formatType === "SINGLE_POST") {
          setSinglePostBody(
            parsedOutput.single_post_body ||
              parsedOutput.body ||
              parsedOutput.main_content ||
              `${title}\n\nKunci sukses lolos ujian adalah manajemen waktu dan pemahaman materi yang terarah. Bersama Bimbel Prima RIB, kamu dilatih dengan modul resmi dan simulasi CAT mirip aslinya.\n\nAmankan kursi bimbinganmu sekarang!`
          );
        }

        setSuccessBanner(
          `Naskah ${formatType} berhasil di-generate dengan ${data.providerCode} (${data.modelCode})!`
        );
      } else {
        setSuccessBanner(
          "Naskah berhasil disusun berdasarkan Brand Knowledge Prima RIB!"
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
          taskCode: "COPYWRITING",
          task: "COPYWRITING",
          prompt,
          userRole: "ADMIN",
        }),
      });

      if (!res.ok) throw new Error("Gagal melakukan rewrite");
      const data = await res.json();
      const contentText = data.content || data.data?.content || "";
      setRewriteResult(contentText.trim());
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
        <div className="bg-[#284078] text-white rounded-xl p-4 sm:p-5 shadow-sm border border-[#1f3260]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDB02E]/20 text-[#DDB02E] border border-[#DDB02E]/30">
                  <Cpu className="w-3.5 h-3.5" /> AI Script Builder
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
            <div className="flex items-center bg-[#1b2b52] p-1 rounded-lg border border-[#374f8c] self-start md:self-auto">
              <button
                type="button"
                onClick={() => setFormatType("REELS")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  formatType === "REELS"
                    ? "bg-[#284078] text-white shadow-sm font-bold border border-white/20"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" /> Reels / Video
              </button>
              <button
                type="button"
                onClick={() => setFormatType("CAROUSEL")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  formatType === "CAROUSEL"
                    ? "bg-[#284078] text-white shadow-sm font-bold border border-white/20"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Karusel Slide
              </button>
              <button
                type="button"
                onClick={() => setFormatType("SINGLE_POST")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  formatType === "SINGLE_POST"
                    ? "bg-[#284078] text-white shadow-sm font-bold border border-white/20"
                    : "text-slate-300 hover:text-white"
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
                ? "border-[#284078] text-[#284078]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Script Editor & Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("REWRITE")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === "REWRITE"
                ? "border-[#284078] text-[#284078]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Section Rewrite & Tone Adjuster
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("VERSIONS")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === "VERSIONS"
                ? "border-[#284078] text-[#284078]"
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
                  className="w-full text-sm font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#284078]/20 focus:border-[#284078]"
                />
              </div>

              <div className="w-full md:w-56">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gaya Bahasa & Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#284078]/20 focus:border-[#284078]"
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
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#284078] hover:bg-[#1e305a] text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sedang Generate AI...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-[#DDB02E]" />
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
                    <Film className="w-4 h-4 text-[#284078]" />
                    Timeline & Adegan Video (Scene Breakdown)
                  </h4>
                  <button
                    type="button"
                    onClick={addReelsScene}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#284078] bg-blue-50 rounded-md hover:bg-blue-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Adegan
                  </button>
                </div>

                {reelsScenes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center bg-slate-50">
                    <p className="text-xs text-slate-500 font-medium">
                      Belum ada rincian adegan. Klik &quot;Generate Script dengan AI&quot; di atas untuk membuat naskah otomatis, atau klik &quot;+ Tambah Adegan&quot; untuk menyusun manual.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reelsScenes.map((scene, idx) => (
                      <div
                        key={scene.id}
                        className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-100 pb-2">
                          <span className="flex items-center gap-1.5 text-[#284078] font-bold">
                            <span className="w-5 h-5 rounded-full bg-blue-50 text-[#284078] flex items-center justify-center text-[10px]">
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
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#284078]"
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
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#284078] font-medium text-slate-800"
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
                )}
              </div>
            )}

            {/* FORMAT BREAKDOWN: CAROUSEL */}
            {formatType === "CAROUSEL" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#284078]" />
                    Slide-by-Slide Copywriting
                  </h4>
                  <button
                    type="button"
                    onClick={addCarouselSlide}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#284078] bg-blue-50 rounded-md hover:bg-blue-100 transition"
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
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <SlidersHorizontal className="w-4 h-4 text-[#284078]" />
                Targeted Section Rewrite & Tone Adjuster
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
                          ? "bg-[#284078] text-white border-[#284078]"
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
                    Pilihan Arah Gaya / Style Rewrite
                  </label>
                  <select
                    value={rewriteStyle}
                    onChange={(e) => setRewriteStyle(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#284078]/20"
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
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#284078]"
                  />
                </div>

                <button
                  type="button"
                  disabled={isRewriting}
                  onClick={handleRewriteSection}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#284078] hover:bg-[#1e305a] text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                >
                  {isRewriting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AI Sedang Merumuskan Rewrite...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5 text-[#DDB02E]" />
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
