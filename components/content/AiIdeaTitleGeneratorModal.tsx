"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Cpu,
  Check,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Film,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAppStore } from "@/lib/store";

export interface GeneratedIdeaOption {
  id: string;
  title: string;
  hook: string;
  angle: string;
  formatId: string;
  formatLabel: string;
  strategicReason: string;
}

interface AiIdeaTitleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgramId?: string;
  initialPillarId?: string;
  initialFormatId?: string;
  onSelectTitle: (title: string, hook?: string, formatId?: string) => void;
  onSelectAndOpenScriptBuilder: (
    title: string,
    hook?: string,
    formatId?: string
  ) => void;
}

export function AiIdeaTitleGeneratorModal({
  isOpen,
  onClose,
  initialProgramId = "prog-cpns",
  initialPillarId = "pil-edukatif",
  initialFormatId = "fmt-reels",
  onSelectTitle,
  onSelectAndOpenScriptBuilder,
}: AiIdeaTitleGeneratorModalProps) {
  const { state } = useAppStore();

  const [selectedProgramId, setSelectedProgramId] = useState(initialProgramId);
  const [selectedPillarId, setSelectedPillarId] = useState(initialPillarId);
  const [selectedFormatId, setSelectedFormatId] = useState(initialFormatId);
  const [customKeyword, setCustomKeyword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdeaOption[]>([]);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialProgramId) setSelectedProgramId(initialProgramId);
      if (initialPillarId) setSelectedPillarId(initialPillarId);
      if (initialFormatId) setSelectedFormatId(initialFormatId);
      setErrorMessage(null);

      // If no ideas yet, auto generate first batch
      if (generatedIdeas.length === 0) {
        generateIdeasInternal(
          initialProgramId,
          initialPillarId,
          initialFormatId,
          ""
        );
      }
    }
  }, [isOpen, initialProgramId, initialPillarId, initialFormatId]);

  const activePrograms = state.programs.filter((p) => p.is_active);
  const activePillars = state.pillars.filter((p) => p.is_active);
  const activeFormats = state.formats.filter((f) => f.is_active);

  const generateIdeasInternal = async (
    progId: string,
    pilId: string,
    fmtId: string,
    keyword: string
  ) => {
    setIsGenerating(true);
    setErrorMessage(null);

    const progObj = state.programs.find((p) => p.id === progId);
    const pilObj = state.pillars.find((p) => p.id === pilId);
    const fmtObj = state.formats.find((f) => f.id === fmtId);

    const programName = progObj?.name || "CPNS";
    const pillarName = pilObj?.name || "Edukatif";
    const formatName = fmtObj?.name || "Reels / Video Pendek";

    try {
      const promptText = `Hasilkan 4 rekomendasi judul konten & ide topik spesifik berkinerja tinggi untuk brand Bimbel Seleksi Prima RIB.
Wilayah Target: "${programName}" (${progObj?.code || "CPNS"})
Pilar Konten: "${pillarName}"
Format Konten: "${formatName}"
${keyword.trim() ? `Topik / Kata Kunci Khusus: "${keyword.trim()}"` : ""}

Konteks Brand Prima RIB:
- Bimbel persiapan tes CPNS, Sekolah Kedinasan (STAN, IPDN, STIS, Poltekip), dan Polri (Akpol, Bintara, Tamtama).
- Fasilitas unggulan: Lab Simulasi CAT berstandar BKN, modul resmi akurat, metode hitung cepat Fast-Think.
- Tone: Semi-formal, kredibel, anti-hoaks (dilarang menggunakan klaim "100% pasti lulus tanpa ujian"), menyemangati pejuang seleksi.

Output format HARUS JSON valid dengan struktur:
{
  "ideas": [
    {
      "title": "Judul konten menarik & klik-tinggi (maks 12 kata)",
      "hook": "Kalimat pembuka 0-3 detik pemantik rasa penasaran",
      "angle": "Sudut pandang konten (misal: Trik Cepat, Ceklis Berkas, Tips Mental)",
      "formatLabel": "${formatName}",
      "strategicReason": "1 kalimat mengapa topik ini akan banyak di-save atau di-share"
    }
  ]
}`;

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
            relevantKnowledge: state.brandKnowledge?.slice(0, 3),
          },
        }),
      });

      const json = await res.json();
      const rawText = json.content || json.data?.content || "";

      if (json.success && rawText) {
        let parsed: any = null;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          try {
            const cleaned = rawText
              .replace(/```json/gi, "")
              .replace(/```/g, "")
              .trim();
            parsed = JSON.parse(cleaned);
          } catch {
            parsed = null;
          }
        }

        if (parsed && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
          const mapped: GeneratedIdeaOption[] = parsed.ideas.map(
            (item: any, idx: number) => ({
              id: `gen-idea-${Date.now()}-${idx}`,
              title: item.title || "Strategi Menembus Seleksi Prima RIB",
              hook: item.hook || "Wajib tahu sebelum kamu ikut ujian!",
              angle: item.angle || "Tips & Trik Edukatif",
              formatId: fmtId,
              formatLabel: item.formatLabel || formatName,
              strategicReason:
                item.strategicReason ||
                item.strategicReasoning ||
                "Relevan dengan kendala utama pejuang ujian CAT.",
            })
          );
          setGeneratedIdeas(mapped);
          return;
        }
      }
      // Fallback if parsing didn't return list
      fallbackGenerator(progId, pilId, fmtId, keyword);
    } catch {
      fallbackGenerator(progId, pilId, fmtId, keyword);
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackGenerator = (
    progId: string,
    pilId: string,
    fmtId: string,
    keyword: string
  ) => {
    const progObj = state.programs.find((p) => p.id === progId);
    const fmtObj = state.formats.find((f) => f.id === fmtId);
    const isPolri = progObj?.code === "POLRI";
    const isSekdin = progObj?.code === "SEKDIN";
    const progLabel = isPolri ? "Polri" : isSekdin ? "Sekolah Kedinasan" : "CPNS";
    const formatName = fmtObj?.name || "Reels / Video";
    const cleanKw = keyword.trim();

    const baseList: GeneratedIdeaOption[] = cleanKw
      ? [
          {
            id: `fb-kw-1-${Date.now()}`,
            title: `${cleanKw}: Solusi Tembus Seleksi ${progLabel} Tanpa Panik`,
            hook: `Masih bingung persiapan ${progLabel}? Simak panduan langsung dari mentor Prima RIB!`,
            angle: "Solutif & Edukasi",
            formatId: fmtId,
            formatLabel: formatName,
            strategicReason: "Menjawab langsung kebutuhan spesifik pencarian audiens pejuang tes.",
          },
          {
            id: `fb-kw-2-${Date.now()}`,
            title: `Keunggulan Program ${cleanKw} Prima RIB Dibanding Belajar Mandiri`,
            hook: "Jangan buang waktu belajar metode lama kalau sistem ujian CAT sekarang sudah berubah!",
            angle: "Perbandingan & Edukasi",
            formatId: fmtId,
            formatLabel: formatName,
            strategicReason: "Membangun rasa urgensi dan kepercayaan terhadap bimbingan intensif.",
          },
          {
            id: `fb-kw-3-${Date.now()}`,
            title: `Review Fasilitas Simulasi Lab CAT Mirip BKN untuk ${cleanKw}`,
            hook: "Ini alasan kenapa siswa Prima RIB jauh lebih tenang saat hari H ujian CAT!",
            angle: "Social Proof & Fasilitas",
            formatId: fmtId,
            formatLabel: formatName,
            strategicReason: "Meningkatkan kredibilitas bimbel dan rasa percaya calon siswa.",
          },
          {
            id: `fb-kw-4-${Date.now()}`,
            title: `Bongkar Syarat & Jadwal Resmi Pembukaan Seleksi Terkait ${cleanKw}`,
            hook: "Jangan sampai ketinggalan info penting yang sering terlewat oleh pendaftar lain!",
            angle: "Ceklis Regulasi Resmi",
            formatId: fmtId,
            formatLabel: formatName,
            strategicReason: "Konten informasi regulasi resmi selalu memicu share dan save tinggi.",
          },
        ]
      : [
          {
            id: `fb-1-${Date.now()}`,
            title: isPolri
              ? "Strategi Menghindari Kesalahan Fatal Tes Angka Hilang Polri"
              : isSekdin
              ? "Cara Tembus Skor SKD 430+ di PKN STAN Tanpa Belajar Dadakan"
              : "Bongkar Trik TIU Silogisme HOTS 15 Detik Langsung Ketemu Jawaban",
            hook: "Banyak yang gagal bukan karena kurang pintar, tapi karena nggak tahu pola eliminasi kilat ini!",
            angle: "Trik Cepat & Efisiensi Waktu CAT",
            formatId: fmtId,
            formatLabel: formatName,
            strategicReason:
              "Memanfaatkan ketakutan umum pejuang tes terhadap limit waktu ujian CAT.",
          },
          {
            id: `fb-2-${Date.now()}`,
            title: isPolri
              ? "Standar Penilaian Uji Jasmani A & B Penerimaan Polri 2026"
              : isSekdin
              ? "Peta Rasio Keketatan IPDN vs STIS vs STAN: Mana Peluang Terbesarmu?"
              : "Aturan Nilai Ambang Batas & Bobot Poin 5 TKP Integritas BKN",
            hook: "Jangan sampai persiapan berbulan-bulan gugur cuma gara-gara salah paham aturan resmi ini!",
            angle: "Regulasi & Ceklis Resmi",
            formatId: fmtId,
            formatLabel: formatName,
            strategicReason:
              "Konten regulasi resmi memiliki rasio save dan share 3x lebih tinggi.",
          },
          {
            id: `fb-3-${Date.now()}`,
            title: isPolri
              ? "Tes Ketelitian Huruf Hilang: Bisa Temukan Jawaban dalam 10 Detik?"
              : isSekdin
              ? "This or That Kedinasan: Ikatan Dinas Kemenkeu vs Kemenkumham?"
              : "Kuis Kilat TWK: Pasal Pengamalan Sila ke-2 atau ke-5?",
            hook: "Coba jawab soal ini dalam 5 detik tanpa nyontek!",
            angle: "Interaktif & Kuis Cepat",
            formatId: fmtId,
            formatLabel: formatName,
            strategicReason:
              "Memancing komentar masif sehingga algoritma mendongkrak jangkauan akun.",
          },
          {
            id: `fb-4-${Date.now()}`,
            title: isPolri
              ? "Simulasi CAT Psikotes Polri di Lab Prima RIB: Seperti Apa Rasanya?"
              : isSekdin
              ? "Real Testimonial: Dari Siswa Ragu Sampai Lolos Ranking 1 Sekdin"
              : "Fasilitas Lab CAT Prima RIB Mirip 100% Sistem BKN: Intip Dalamnya!",
            hook: "Ini alasan kenapa siswa Prima RIB jauh lebih tenang saat hadapi hari H ujian!",
            angle: "Social Proof & Fasilitas Lab CAT",
            formatId: fmtId,
            formatLabel: formatName,
            strategicReason:
              "Membangun kredibilitas dan mengonversi penonton menjadi calon siswa.",
          },
        ];

    setGeneratedIdeas(baseList);
  };

  const handleTriggerGenerate = () => {
    generateIdeasInternal(
      selectedProgramId,
      selectedPillarId,
      selectedFormatId,
      customKeyword
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Generator Ide & Judul Konten — Prima RIB"
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-5">
        {/* Header Ribbon */}
        <div className="rounded-xl border border-[#1f3260] bg-[#284078] p-4 text-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDB02E]/30 bg-[#DDB02E]/20 px-2.5 py-0.5 text-xs font-semibold text-[#DDB02E]">
                  <Cpu className="h-3.5 w-3.5" /> AI Idea & Title Generator
                </span>
                <span className="text-[11px] text-slate-200">
                  Tahap 1: Temukan Ide & Judul sebelum Script Builder
                </span>
              </div>
              <h3 className="text-base font-bold tracking-wide text-white">
                Rekomendasi Topik & Judul Berkualitas Tinggi
              </h3>
              <p className="mt-0.5 text-xs text-slate-200">
                AI merumuskan judul klik-tinggi dan hook 3 detik yang patuh Brand Knowledge Prima RIB.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Filters */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Wilayah Program
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
                Pilar Konten
              </label>
              <select
                value={selectedPillarId}
                onChange={(e) => setSelectedPillarId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#284078] focus:outline-none"
              >
                {activePillars.map((pil) => (
                  <option key={pil.id} value={pil.id}>
                    {pil.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Format Konten
              </label>
              <select
                value={selectedFormatId}
                onChange={(e) => setSelectedFormatId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#284078] focus:outline-none"
              >
                {activeFormats.map((fmt) => (
                  <option key={fmt.id} value={fmt.id}>
                    {fmt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTriggerGenerate();
            }}
            className="flex flex-col sm:flex-row items-center gap-2 pt-1"
          >
            <div className="flex-1 w-full">
              <input
                type="text"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                placeholder="Kata kunci spesifik (opsional, contoh: Silogisme HOTS, Passing Grade SKD, Lab CAT)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#284078] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#284078] hover:bg-[#1e305a] px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50 shadow-xs shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Merumuskan Ide AI...</span>
                </>
              ) : (
                <>
                  <Lightbulb className="h-3.5 w-3.5 text-[#DDB02E]" />
                  <span>Generate Rekomendasi Judul</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Ideas List */}
        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
          {generatedIdeas.map((idea, index) => (
            <div
              key={idea.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-[#284078]/40 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#284078] border border-blue-200">
                      Opsi {index + 1}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      {idea.angle}
                    </span>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200/60">
                      {idea.formatLabel}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {idea.title}
                  </h4>

                  <div className="rounded-lg bg-amber-50/60 border border-amber-200/70 p-2 text-xs">
                    <span className="font-bold text-amber-900 block text-[10px] uppercase tracking-wider">
                      Hook Verbal 0–3 Detik:
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5 italic">
                      &quot;{idea.hook}&quot;
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    💡 <strong>Alasan Strategis:</strong> {idea.strategicReason}
                  </p>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-row sm:flex-col items-stretch gap-2 shrink-0 pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTitle(idea.title, idea.hook, idea.formatId);
                      onClose();
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#284078] bg-blue-50/70 hover:bg-blue-100 px-3 py-2 text-xs font-bold text-[#284078] transition shadow-2xs"
                    title="Isi judul ini ke formulir input konten"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Gunakan Judul Ini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectAndOpenScriptBuilder(
                        idea.title,
                        idea.hook,
                        idea.formatId
                      );
                      onClose();
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#284078] hover:bg-[#1e305a] px-3.5 py-2 text-xs font-bold text-white transition shadow-2xs"
                    title="Gunakan judul ini dan langsung buka AI Script Builder"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span>Gunakan & Buat Script AI →</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {generatedIdeas.length === 0 && !isGenerating && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
              <Lightbulb className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                Belum ada ide yang digenerate
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Pilih wilayah dan klik tombol &quot;Generate Rekomendasi Judul&quot; di atas.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            Tips: Judul yang Anda pilih akan otomatis mengisi form dan dapat langsung dilanjutkan ke AI Script Builder.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}
