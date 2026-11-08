"use client";

import React, { useState } from "react";
import {
  Link2,
  FileText,
  Video,
  Layers,
  ArrowRight,
  RotateCcw,
  Check,
  AlertCircle,
  Cpu,
  Globe,
  Share2,
  CheckCircle2,
  AlignLeft,
  Lightbulb,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAppStore } from "@/lib/store";

export interface RepurposedContentResult {
  title: string;
  hook: string;
  formatType: "REELS" | "CAROUSEL" | "SINGLE_POST";
  sourceTitle: string;
  sourceUrl?: string;
  sourceType: string;
  // Format Reels
  scenes?: Array<{
    timecode: string;
    visual_direction: string;
    audio_dialogue: string;
    text_on_screen: string;
  }>;
  // Format Carousel
  slides?: Array<{
    slide_number: number;
    slide_type: string;
    headline: string;
    body: string;
  }>;
  // Format Single Post
  single_post_body?: string;
  caption: string;
  cta: string;
  hashtags: string;
}

interface AiLinkRepurposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgramId?: string;
  initialFormatId?: string;
  onApplyToForm: (result: RepurposedContentResult) => void;
  onApplyAndOpenScriptBuilder: (result: RepurposedContentResult) => void;
}

export function AiLinkRepurposerModal({
  isOpen,
  onClose,
  initialProgramId = "prog-cpns",
  initialFormatId = "fmt-reels",
  onApplyToForm,
  onApplyAndOpenScriptBuilder,
}: AiLinkRepurposerModalProps) {
  const { state } = useAppStore();

  const [inputMode, setInputMode] = useState<"URL" | "TEXT">("URL");
  const [inputUrl, setInputUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState(initialProgramId);
  const [selectedFormat, setSelectedFormat] = useState<
    "REELS" | "CAROUSEL" | "SINGLE_POST"
  >(
    initialFormatId === "fmt-carousel"
      ? "CAROUSEL"
      : initialFormatId === "fmt-feed"
      ? "SINGLE_POST"
      : "REELS"
  );
  const [customAngle, setCustomAngle] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] =
    useState<RepurposedContentResult | null>(null);

  const activePrograms = state.programs.filter((p) => p.is_active);

  const handleProcess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (inputMode === "URL" && !inputUrl.trim()) {
      setErrorMessage("Silakan masukkan link URL berita atau video sosial media.");
      return;
    }

    if (inputMode === "TEXT" && !rawText.trim()) {
      setErrorMessage("Silakan tempel teks berita, caption video, atau transkrip.");
      return;
    }

    setIsLoading(true);

    try {
      // TAHAP 1: Ekstraksi Link / Teks
      setLoadingStep("1/2: Mengekstrak isi link & fakta berita...");
      const extractRes = await fetch("/api/ai/extract-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: inputMode === "URL" ? inputUrl.trim() : "",
          rawText: inputMode === "TEXT" ? rawText.trim() : "",
        }),
      });

      const extractJson = await extractRes.json();
      if (!extractRes.ok || !extractJson.success) {
        throw new Error(
          extractJson.error ||
            "Gagal mengekstrak isi link. Pastikan link dapat diakses publik atau gunakan tab Salinan Teks."
        );
      }

      const extractedData = extractJson.data;
      const cleanContent = extractedData.cleanContent;
      const sourceTitle = extractedData.title;

      // TAHAP 2: Transformasi AI Menjadi Konten Prima RIB
      setLoadingStep("2/2: Merumuskan naskah & hook viral Prima RIB...");

      const progObj = state.programs.find((p) => p.id === selectedProgramId);
      const programName = progObj?.name || "CPNS";

      const promptText = `Tugas: Berperan sebagai Content Strategist resmi BIMBEL PRIMA RIB. 
Ubahlah materi referensi berita/konten berikut menjadi naskah konten edukatif dan berdaya tarik tinggi untuk media sosial.

SUMBER REFERENSI:
Judul Asli: "${sourceTitle}"
Isi Referensi:
"""
${cleanContent.slice(0, 3000)}
"""

PARAMETER TARGET:
- Wilayah Seleksi: ${programName} (${progObj?.code || "CPNS"})
- Format Konten yang Diminta: ${selectedFormat}
${customAngle.trim() ? `- Sudut Pandang Khusus: "${customAngle.trim()}"` : ""}

BRAND IDENTITY & ATURAN PRIMA RIB:
- Bimbel spesialis persiapan tes CPNS, Sekolah Kedinasan, dan Polri.
- Keunggulan: Fasilitas Lab Simulasi CAT standar BKN, metode hitung cepat Fast-Think, modul resmi akurat.
- Dilarang membuat klaim hoaks seperti "pasti lolos 100% tanpa belajar".
- Buat Hook 0-3 detik yang menyengat rasa penasaran pejuang seleksi.
- PERHATIAN KHUSUS FORMAT: Format yang WAJIB dihasilkan adalah ${selectedFormat}.
${
  selectedFormat === "REELS"
    ? '- HANYA sertakan array "scenes". JANGAN membuat array slides dan DILARANG menyebut "Slide 1" pada hook maupun caption!'
    : selectedFormat === "CAROUSEL"
    ? '- HANYA sertakan array "slides" berstruktur cover, poin materi, dan CTA.'
    : '- HANYA sertakan string "single_post_body" yang padat dan informatif.'
}

OUTPUT WAJIB FORMAT JSON VALID PERSIS DENGAN STRUKTUR INI:
{
  "title": "Judul konten spesifik, menarik, maksimal 12 kata",
  "hook": "Kalimat pembuka hook 0-3 detik pemikat perhatian",
  "formatType": "${selectedFormat}",
  ${
    selectedFormat === "REELS"
      ? `"scenes": [
    {
      "timecode": "00:00 - 00:05",
      "visual_direction": "Adegan talent/mentor di depan layar simulasi Lab CAT",
      "audio_dialogue": "Kalimat dialog yang diucapkan dengan intonasi antusias",
      "text_on_screen": "TEKS BESAR DI LAYAR"
    },
    {
      "timecode": "00:05 - 00:25",
      "visual_direction": "Cut ke layar menampilkan poin regulasi/soal ujian",
      "audio_dialogue": "Pembahasan fakta inti berita dan tips menyikapinya",
      "text_on_screen": "POIN UTAMA REGULASI"
    },
    {
      "timecode": "00:25 - 00:40",
      "visual_direction": "Talent mengajak audiens bertindak, banner promo muncul",
      "audio_dialogue": "CTA konsultasi dan persiapan bersama mentor Prima RIB",
      "text_on_screen": "KLIK LINK DI BIO"
    }
  ],`
      : selectedFormat === "CAROUSEL"
      ? `"slides": [
    {
      "slide_number": 1,
      "slide_type": "COVER",
      "headline": "Judul headline cover carousel yang heboh & memicu swipe",
      "body": "Subheadline pemantik rasa penasaran pejuang ujian"
    },
    {
      "slide_number": 2,
      "slide_type": "CONTENT",
      "headline": "Poin Fakta 1",
      "body": "Penjelasan fakta berita secara padat dan mudah dipahami"
    },
    {
      "slide_number": 3,
      "slide_type": "CONTENT",
      "headline": "Poin Fakta 2",
      "body": "Konsekuensi atau persiapan yang harus dilakukan peserta"
    },
    {
      "slide_number": 4,
      "slide_type": "CTA",
      "headline": "Siapkan Diri di Lab CAT Prima RIB",
      "body": "Konsultasikan peluang lolosmu sekarang, klik link di bio!"
    }
  ],`
      : `"single_post_body": "Headline utama dan isi poin poster edukatif lengkap.",`
  }
  "caption": "Tulis caption edukatif yang mengalir lengkap dengan tips praktis",
  "cta": "Simpan postingan ini dan konsultasikan persiapanmu di Prima RIB!",
  "hashtags": "#PrimaRIB #${progObj?.code || "CPNS"} #PejuangNIP #BimbelKedinasan"
}`;

      const aiRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskCode: "NEWS_REPURPOSE",
          task: "NEWS_REPURPOSE",
          prompt: promptText,
          responseFormat: "json",
          context: {
            brandProfile: state.brandProfile,
            brandTone: state.brandToneGuidelines?.[0],
            relevantKnowledge: state.brandKnowledge?.slice(0, 3),
          },
        }),
        signal: AbortSignal.timeout(20000), // Max 20 detik agar proses LLM generasi naskah tuntas
      });

      const aiJson = await aiRes.json();
      const rawAiText = aiJson.content || aiJson.data?.content || "";

      let parsed: any = null;
      try {
        parsed = JSON.parse(rawAiText);
      } catch {
        try {
          const cleaned = rawAiText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = null;
        }
      }

      if (parsed && parsed.title) {
        let finalHook = parsed.hook || "Info penting yang wajib kamu tahu hari ini!";
        let finalCaption = parsed.caption || "";
        let scenes = parsed.scenes || [];
        let slides = parsed.slides || [];

        // Normalisasi format jika model menghasilkan struktur silang
        if (selectedFormat === "REELS") {
          finalHook = finalHook.replace(/^Slide\s*\d+:\s*/i, "");
          finalCaption = finalCaption.replace(/carousel/gi, "video");
          if (scenes.length === 0 && slides.length > 0) {
            scenes = slides.map((sl: any, idx: number) => ({
              timecode: `00:${String(idx * 15).padStart(2, "0")} - 00:${String((idx + 1) * 15).padStart(2, "0")}`,
              visual_direction: sl.visual_direction || "Talent mentor berdiri di depan Lab CAT Prima RIB",
              audio_dialogue: `${sl.headline}. ${sl.body}`,
              text_on_screen: sl.headline || "POIN PENTING",
            }));
          }
        } else if (selectedFormat === "CAROUSEL") {
          if (slides.length === 0 && scenes.length > 0) {
            slides = scenes.map((sc: any, idx: number) => ({
              slide_number: idx + 1,
              slide_type: idx === 0 ? "COVER" : idx === scenes.length - 1 ? "CTA" : "CONTENT",
              headline: sc.text_on_screen || `Poin ${idx + 1}`,
              body: sc.audio_dialogue || "",
            }));
          }
        }

        setGeneratedResult({
          title: parsed.title,
          hook: finalHook,
          formatType: selectedFormat,
          sourceTitle,
          sourceUrl: extractedData.sourceUrl || "",
          sourceType: extractedData.sourceType || "NEWS_ARTICLE",
          scenes,
          slides,
          single_post_body: parsed.single_post_body || "",
          caption: finalCaption,
          cta: parsed.cta || "Klik link di bio untuk info kelas intensif!",
          hashtags: parsed.hashtags || "#PrimaRIB #CPNS",
        });
      } else {
        // Fallback jika respons AI tidak terurai
        setGeneratedResult({
          title: `Update Resmi: ${sourceTitle.slice(0, 50)}`,
          hook: "BKN dan instansi resmi baru saja umumkan update penting ini!",
          formatType: selectedFormat,
          sourceTitle,
          sourceUrl: extractedData.sourceUrl || "",
          sourceType: extractedData.sourceType || "NEWS_ARTICLE",
          scenes: [
            {
              timecode: "00:00 - 00:05",
              visual_direction: "Talent mentor berdiri di depan Lab CAT Prima RIB",
              audio_dialogue: "Siapa di sini yang mau ikut seleksi tahun ini? Ada info resmi baru!",
              text_on_screen: "UPDATE RESMI SELEKSI",
            },
            {
              timecode: "00:05 - 00:25",
              visual_direction: "Layar menampilkan dokumen fakta berita",
              audio_dialogue: cleanContent.slice(0, 180),
              text_on_screen: "POIN PENTING REGULASI",
            },
            {
              timecode: "00:25 - 00:35",
              visual_direction: "Talent mengajak gabung kelas simulasi Prima RIB",
              audio_dialogue: "Jangan belajar mepet, siapkan dari sekarang di Prima RIB!",
              text_on_screen: "KLIK LINK DI BIO",
            },
          ],
          slides: [
            {
              slide_number: 1,
              slide_type: "COVER",
              headline: sourceTitle,
              body: "Simak fakta resmi dan persiapannya sebelum terlambat!",
            },
            {
              slide_number: 2,
              slide_type: "CONTENT",
              headline: "Poin Pembahasan Utama",
              body: cleanContent.slice(0, 200),
            },
            {
              slide_number: 3,
              slide_type: "CTA",
              headline: "Amankan Kursi Belajarmu!",
              body: "Gabung kelas bimbingan Prima RIB, klik link di bio.",
            },
          ],
          single_post_body: `${sourceTitle}\n\n${cleanContent.slice(0, 300)}`,
          caption: `${sourceTitle}\n\nSimak info lengkapnya dan siapkan dirimu bersama Prima RIB!`,
          cta: "Klik link di bio untuk konsultasi gratis!",
          hashtags: "#PrimaRIB #CPNS #Sekdin #Polri",
        });
      }
    } catch (err: any) {
      console.error("[Link Repurposer Error]:", err);
      setErrorMessage(
        err.message || "Terjadi kesalahan saat memproses konten dari link."
      );
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleReset = () => {
    setGeneratedResult(null);
    setInputUrl("");
    setRawText("");
    setErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Generator Konten dari Link Berita & Sosmed — Prima RIB"
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-5">
        {/* Header Ribbon Solid Navy */}
        <div className="rounded-xl border border-[#1f3260] bg-[#284078] p-4 text-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDB02E]/40 bg-[#DDB02E]/20 px-2.5 py-0.5 text-xs font-semibold text-[#DDB02E]">
                  <Link2 className="h-3.5 w-3.5" /> News & Social Repurposer
                </span>
                <span className="text-[11px] text-slate-200">
                  Ubah berita viral & referensi jadi naskah siap tayang
                </span>
              </div>
              <h3 className="text-base font-bold tracking-wide text-white">
                Transformasi Link Berita & Video Viral ke Konten Prima RIB
              </h3>
              <p className="mt-0.5 text-xs text-slate-200">
                AI otomatis menyaring fakta, merumuskan hook 0–3 detik, dan
                mengemas naskah edukatif sesuai standar Bimbel Prima RIB.
              </p>
            </div>
          </div>
        </div>

        {/* Form Input Mode (Jika belum ada hasil) */}
        {!generatedResult ? (
          <form onSubmit={handleProcess} className="space-y-4">
            {/* Tab Input: Link URL vs Teks Salinan */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => {
                  setInputMode("URL");
                  setErrorMessage(null);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  inputMode === "URL"
                    ? "bg-[#284078] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>1. Link URL (Berita / TikTok / IG / YouTube)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMode("TEXT");
                  setErrorMessage(null);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  inputMode === "TEXT"
                    ? "bg-[#284078] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <AlignLeft className="h-3.5 w-3.5" />
                <span>2. Salinan Teks / Caption Video</span>
              </button>
            </div>

            {/* Input Field Sesuai Tab */}
            {inputMode === "URL" ? (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Tempel Link Berita Web atau Video Sosmed{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Contoh: https://news.detik.com/berita/... atau https://www.tiktok.com/@akun/video/..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#284078] focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Mendukung portal berita (Kompas, Detik, CNN, BKN.go.id, dll)
                  serta video publik YouTube / TikTok.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Salinan Teks / Caption / Transkrip Konten{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Tempel potongan berita, rilis resmi BKN, atau caption postingan video yang ingin di-remake..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3.5 text-xs sm:text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-[#284078] focus:outline-none"
                />
              </div>
            )}

            {/* Target Konfigurasi: Wilayah, Format, Angle */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Wilayah Target Konten
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#284078] focus:outline-none"
                  >
                    {activePrograms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Format Konten yang Diinginkan
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFormat("REELS")}
                      className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-bold transition ${
                        selectedFormat === "REELS"
                          ? "border-[#284078] bg-blue-50 text-[#284078]"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Reel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFormat("CAROUSEL")}
                      className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-bold transition ${
                        selectedFormat === "CAROUSEL"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Karusel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFormat("SINGLE_POST")}
                      className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-bold transition ${
                        selectedFormat === "SINGLE_POST"
                          ? "border-pink-600 bg-pink-50 text-pink-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Single</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sudut Pandang / Instruksi Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={customAngle}
                  onChange={(e) => setCustomAngle(e.target.value)}
                  placeholder="Contoh: Fokus ke trik hitung cepat waktu CAT, Tekankan passing grade, atau Peringatan berkas TMS"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#284078] focus:outline-none"
                />
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#284078] hover:bg-[#1e305a] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin text-[#DDB02E]" />
                    <span>{loadingStep || "Sedang memproses..."}</span>
                  </>
                ) : (
                  <>
                    <Cpu className="h-4 w-4 text-[#DDB02E]" />
                    <span>Baca Link & Buat Konten AI</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* =============================================================== */
          /* TAMPILAN HASIL TRANSFORMASI KONTEN                              */
          /* =============================================================== */
          <div className="space-y-4">
            {/* Header Hasil & Tombol Reset */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Naskah Konten Siap Pakai Berhasil Dibuat
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Berdasarkan:{" "}
                    <strong className="text-slate-700">
                      &ldquo;{generatedResult.sourceTitle}&rdquo;
                    </strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Ganti Link / Buat Ulang</span>
              </button>
            </div>

            {/* Judul & Hook Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#284078]">
                  Judul Konten Rekomendasi:
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {generatedResult.title}
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  ⚡ Hook Pembuka 0–3 Detik:
                </span>
                <p className="mt-0.5 text-xs font-semibold text-slate-800 italic">
                  &ldquo;{generatedResult.hook}&rdquo;
                </p>
              </div>
            </div>

            {/* Pratinjau Naskah / Slide */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 max-h-[300px] overflow-y-auto space-y-3">
              <h5 className="text-xs font-bold text-slate-800">
                Struktur Konten ({generatedResult.formatType}):
              </h5>

              {/* Scene Reels */}
              {generatedResult.formatType === "REELS" &&
                generatedResult.scenes && (
                  <div className="space-y-2">
                    {generatedResult.scenes.map((sc, idx) => (
                      <div
                        key={`sc-${idx}`}
                        className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-[#284078]">
                          <span>Adegan {idx + 1} ({sc.timecode})</span>
                          <span className="text-[10px] uppercase bg-blue-100 px-2 py-0.5 rounded text-[#284078]">
                            {sc.text_on_screen || "VISUAL"}
                          </span>
                        </div>
                        <p className="text-slate-800">
                          <strong className="text-slate-600">Audio:</strong>{" "}
                          {sc.audio_dialogue}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          <strong>Visual:</strong> {sc.visual_direction}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* Slide Carousel */}
              {generatedResult.formatType === "CAROUSEL" &&
                generatedResult.slides && (
                  <div className="space-y-2">
                    {generatedResult.slides.map((sl, idx) => (
                      <div
                        key={`sl-${idx}`}
                        className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-emerald-800">
                          <span>
                            Slide {sl.slide_number} ({sl.slide_type})
                          </span>
                          <span className="text-[10px] uppercase bg-emerald-100 px-2 py-0.5 rounded text-emerald-700">
                            {sl.headline}
                          </span>
                        </div>
                        <p className="text-slate-800">{sl.body}</p>
                      </div>
                    ))}
                  </div>
                )}

              {/* Single Post */}
              {generatedResult.formatType === "SINGLE_POST" && (
                <div className="whitespace-pre-line text-xs leading-relaxed text-slate-800">
                  {generatedResult.single_post_body}
                </div>
              )}
            </div>

            {/* Caption & Hashtags */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1">
              <strong className="text-slate-900 block">Caption & CTA:</strong>
              <p className="whitespace-pre-line text-[11px] leading-relaxed">
                {generatedResult.caption}
              </p>
              <p className="text-[11px] font-bold text-[#284078] pt-1">
                CTA: {generatedResult.cta}
              </p>
              <p className="text-[11px] text-blue-600 font-semibold">
                {generatedResult.hashtags}
              </p>
            </div>

            {/* Tombol Aksi Akhir */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onApplyToForm(generatedResult);
                  onClose();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 transition shadow-2xs"
              >
                <Check className="h-4 w-4 text-emerald-600" />
                <span>1. Terapkan ke Form Konten</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplyAndOpenScriptBuilder(generatedResult);
                  onClose();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#284078] hover:bg-[#1e305a] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition"
              >
                <Cpu className="h-4 w-4 text-[#DDB02E]" />
                <span>2. Terapkan & Buka AI Script Builder →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
