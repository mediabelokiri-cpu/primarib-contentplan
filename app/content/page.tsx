"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Pencil,
  Video,
  Image as ImageIcon,
  Layers,
  Kanban,
  Search,
  Check,
  BookOpen,
  RotateCcw,
  X,
  ListPlus,
  FileText,
  ArrowRight,
  UserCheck,
  GraduationCap,
  Users,
} from "lucide-react";
import {
  useAppStore,
  createContentAction,
  updateContentAction,
  deleteContentPermanentlyAction,
  deleteIdeaPermanentlyAction,
  clearAllContentsAndIdeasAction,
  resetStoreToDefault,
} from "@/lib/store";
import { REEL_TALENT_CATEGORIES } from "@/lib/constants";
import { ContentWithRelations, IdeaWithRelations } from "@/types/database";

function parsePointsFromText(raw: string, defaultCount = 3): string[] {
  const trimmed = (raw || "").trim();
  if (!trimmed) {
    return Array.from({ length: defaultCount }, () => "");
  }
  const lines = trimmed
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^(Slide\s*\d+\s*(\([^)]*\))?\s*:\s*)/i, "")
        .replace(/^(Poin\s*\d+\s*(\([^)]*\))?\s*:\s*)/i, "")
        .replace(/^[-•*]\s*/, "")
        .trim()
    )
    .filter(Boolean);

  if (lines.length === 0) {
    return Array.from({ length: defaultCount }, () => "");
  }
  return lines;
}

function InputKontenInner() {
  const { state, enrichedContents, enrichedIdeas } = useAppStore();

  const activePrograms = state.programs.filter((p) => p.is_active);
  const activePillars = state.pillars.filter((p) => p.is_active);
  const activeFormats = state.formats.filter((f) => f.is_active);
  const activePlatforms = state.platforms.filter((p) => p.is_active);

  // Form Input States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [programId, setProgramId] = useState(
    activePrograms[0]?.id || "prog-cpns"
  );
  const [pillarId, setPillarId] = useState(
    activePillars[0]?.id || "pil-edukatif"
  );
  const [formatId, setFormatId] = useState(
    activeFormats[0]?.id || "fmt-reels"
  );
  const [talentCategory, setTalentCategory] =
    useState<string>("Mentor / Pengajar");
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>([
    "plat-ig",
    "plat-fb",
    "plat-tt",
  ]);

  // Structured Wide Inputs for Reel (Poin per Poin Script), Carousel (Isi per Slide), and Single Post
  const [reelPoints, setReelPoints] = useState<string[]>(["", "", ""]);
  const [carouselSlides, setCarouselSlides] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [singlePostBody, setSinglePostBody] = useState("");
  const [captionText, setCaptionText] = useState("");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("ALL");
  const [filterFormat, setFilterFormat] = useState("ALL");
  const [filterTalent, setFilterTalent] = useState("ALL");
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const selectedFormatObj = state.formats.find((f) => f.id === formatId);
  const formatNameLower = (selectedFormatObj?.name || "").toLowerCase();
  const isReelFormat =
    formatId === "fmt-reels" || formatNameLower.includes("reel");
  const isCarouselFormat =
    formatId === "fmt-carousel" ||
    formatNameLower.includes("carousel") ||
    formatNameLower.includes("karusel");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const togglePlatform = (platId: string) => {
    setSelectedPlatformIds((prev) =>
      prev.includes(platId)
        ? prev.length > 1
          ? prev.filter((id) => id !== platId)
          : prev
        : [...prev, platId]
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setReelPoints(["", "", ""]);
    setCarouselSlides(["", "", "", "", ""]);
    setSinglePostBody("");
    setCaptionText("");
    setSelectedPlatformIds(["plat-ig", "plat-fb", "plat-tt"]);
  };

  // Build formatted main_content & script from structured inputs
  const buildStructuredContentPayload = () => {
    if (isReelFormat) {
      const formattedPoints = reelPoints
        .map((pt) => pt.trim())
        .filter(Boolean)
        .map((pt, idx) => {
          const label =
            idx === 0
              ? "Poin 1 (Hook Pembuka)"
              : idx === reelPoints.length - 1 && reelPoints.length > 1
              ? `Poin ${idx + 1} (CTA / Penutup)`
              : `Poin ${idx + 1} (Isi Script)`;
          return `${label}: ${pt}`;
        })
        .join("\n");

      const firstHook = reelPoints[0]?.trim() || "";
      return {
        hook: firstHook,
        script: formattedPoints,
        main_content: formattedPoints,
        caption: captionText.trim(),
      };
    }

    if (isCarouselFormat) {
      const formattedSlides = carouselSlides
        .map((sl) => sl.trim())
        .filter(Boolean)
        .map((sl, idx) => {
          const slideLabel =
            idx === 0
              ? "Slide 1 (Cover)"
              : idx === carouselSlides.length - 1 && carouselSlides.length > 1
              ? `Slide ${idx + 1} (CTA)`
              : `Slide ${idx + 1}`;
          return `${slideLabel}: ${sl}`;
        })
        .join("\n");

      const coverHook = carouselSlides[0]?.trim() || "";
      return {
        hook: coverHook,
        script: "",
        main_content: formattedSlides,
        caption: captionText.trim(),
      };
    }

    // Single Post
    return {
      hook: singlePostBody.trim().split("\n")[0] || "",
      script: "",
      main_content: singlePostBody.trim(),
      caption: captionText.trim(),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const structured = buildStructuredContentPayload();

    if (editingId) {
      updateContentAction(
        editingId,
        {
          title: title.trim(),
          short_title: title.trim().slice(0, 28),
          program_id: programId,
          pillar_id: pillarId,
          format_id: formatId,
          talent_category: isReelFormat ? talentCategory : null,
          hook: structured.hook,
          script: structured.script,
          main_content: structured.main_content,
          caption: structured.caption,
        },
        selectedPlatformIds
      );
      showToast("Konten berhasil diperbarui!");
      resetForm();
      return;
    }

    createContentAction({
      title: title.trim(),
      short_title: title.trim().slice(0, 28),
      program_id: programId,
      pillar_id: pillarId,
      format_id: formatId,
      talent_category: isReelFormat ? talentCategory : null,
      platform_ids: selectedPlatformIds,
      priority: "HIGH",
      scheduled_at: null,
      hook: structured.hook,
      script: structured.script,
      main_content: structured.main_content,
      caption: structured.caption,
    });

    showToast(
      "Konten berhasil disimpan! Silakan Drag & Drop tanggalnya di Production Board."
    );
    resetForm();
  };

  const handleEditContent = (item: ContentWithRelations) => {
    setEditingId(item.id);
    setTitle(item.title);
    setProgramId(item.program_id || activePrograms[0]?.id || "prog-cpns");
    setPillarId(item.pillar_id || activePillars[0]?.id || "pil-edukatif");
    const targetFmtId =
      item.format_id || activeFormats[0]?.id || "fmt-reels";
    setFormatId(targetFmtId);
    setTalentCategory(item.talent_category || "Mentor / Pengajar");
    const platIds = item.platforms?.map((p) => p.platform_id) || [];
    setSelectedPlatformIds(
      platIds.length > 0 ? platIds : ["plat-ig", "plat-fb", "plat-tt"]
    );

    const rawText = item.script || item.main_content || "";
    const fmtObj = state.formats.find((f) => f.id === targetFmtId);
    const fmtLower = (fmtObj?.name || "").toLowerCase();

    if (targetFmtId === "fmt-reels" || fmtLower.includes("reel")) {
      const parsed = parsePointsFromText(rawText, 3);
      setReelPoints(parsed.length >= 2 ? parsed : [...parsed, "", ""]);
    } else if (
      targetFmtId === "fmt-carousel" ||
      fmtLower.includes("carousel") ||
      fmtLower.includes("karusel")
    ) {
      const parsed = parsePointsFromText(rawText, 5);
      setCarouselSlides(parsed.length >= 3 ? parsed : [...parsed, "", ""]);
    } else {
      setSinglePostBody(rawText);
    }

    setCaptionText(item.caption || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConvertIdeaToContent = (idea: IdeaWithRelations) => {
    const descLower = (idea.description || "").toLowerCase();
    const isReelIdea = descLower.includes("reel");
    const guessedFormatId = isReelIdea ? "fmt-reels" : "fmt-carousel";
    let guessedTalent: string | null = null;
    if (isReelIdea) {
      if (descLower.includes("siswa")) guessedTalent = "Siswa";
      else if (descLower.includes("talent")) guessedTalent = "Talent Model";
      else guessedTalent = "Mentor / Pengajar";
    }

    createContentAction({
      title: idea.title,
      short_title: idea.title.slice(0, 28),
      program_id: idea.program_id || "prog-cpns",
      pillar_id: idea.pillar_id || "pil-edukatif",
      format_id: guessedFormatId,
      talent_category: guessedTalent,
      platform_ids: ["plat-ig", "plat-fb", "plat-tt"],
      priority: "HIGH",
      scheduled_at: null,
      main_content: idea.description || "",
      caption: idea.description || "",
      source_idea_id: idea.id,
    });
    deleteIdeaPermanentlyAction(idea.id);
    showToast(`"${idea.title}" masuk ke Daftar Konten siap jadwal!`);
  };

  const handleClearAll = () => {
    clearAllContentsAndIdeasAction();
    setConfirmClearAll(false);
    resetForm();
    showToast("Semua ide konten & jadwal berhasil dihapus bersih!");
  };

  const activeContents = enrichedContents.filter(
    (c) => c.status !== "ARCHIVED"
  );
  const availableIdeas = enrichedIdeas.filter(
    (i) => i.status !== "ARCHIVED" && i.status !== "PLANNED"
  );

  const q = searchQuery.trim().toLowerCase();
  const filteredContents = activeContents.filter((c) => {
    if (filterProgram !== "ALL" && c.program_id !== filterProgram) return false;
    if (filterFormat !== "ALL" && c.format_id !== filterFormat) return false;
    if (filterTalent !== "ALL" && c.talent_category !== filterTalent)
      return false;
    if (
      q &&
      !c.title.toLowerCase().includes(q) &&
      !c.content_code.toLowerCase().includes(q) &&
      !(c.program?.name || "").toLowerCase().includes(q) &&
      !(c.pillar?.name || "").toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  const getTalentBadgeClass = (talent?: string | null) => {
    if (talent === "Talent Model") {
      return "bg-[#ECE7FF] text-[#7E60FF] border-[#D5C8FF]";
    }
    if (talent === "Mentor / Pengajar") {
      return "bg-[#E5F3FF] text-[#1D74F5] border-[#BBDFFF]";
    }
    if (talent === "Siswa") {
      return "bg-[#FFF0E5] text-[#EA6A15] border-[#FFD5B8]";
    }
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Info Banner & Quick Link to Production Board */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            1. Input Ide Konten Prima RIB
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Pola Rutin: <strong className="text-slate-700">Senin, Rabu, Jumat</strong> = Feed (Single Post / Carousel) •{" "}
            <strong className="text-[#6D4AFF]">Selasa & Kamis</strong> = Reel (Pilih Talent Model, Mentor / Pengajar, atau Siswa)
          </p>
        </div>

        <Link
          href="/production"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#6D4AFF] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#5B38E8]"
        >
          <Kanban className="h-4 w-4" />
          <span>Lanjut ke Production Board</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* =================================================================== */}
      {/* FORM INPUT KONTEN DENGAN EDITOR POIN SCRIPT & ISI PER SLIDE LEBAR   */}
      {/* =================================================================== */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs"
      >
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F0FF] text-[#6D4AFF]">
              {editingId ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? "Edit Ide Konten" : "Tambah Ide Konten Baru"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Kolom isi menyesuaikan format: Poin-per-poin Script untuk Reel, atau Isi per Slide untuk Carousel
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              <X className="h-3.5 w-3.5" />
              <span>Batal Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          {/* Judul Konten */}
          <div className="md:col-span-6">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Judul / Topik Ide Konten <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Trik Jawab Soal TIU Deret Angka < 30 Detik"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Wilayah Konten */}
          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Wilayah Konten
            </label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
            >
              {activePrograms.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pilar Konten */}
          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Pilar Konten
            </label>
            <select
              value={pillarId}
              onChange={(e) => setPillarId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
            >
              {activePillars.map((pil) => (
                <option key={pil.id} value={pil.id}>
                  {pil.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format Konten (Reel, Single Post, Carousel) */}
          <div className="md:col-span-4">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Format Konten
            </label>
            <div className="grid grid-cols-3 gap-2">
              {activeFormats.map((fmt) => {
                const selected = formatId === fmt.id;
                const isReel =
                  fmt.id === "fmt-reels" ||
                  fmt.name.toLowerCase().includes("reel");
                const isCarousel =
                  fmt.id === "fmt-carousel" ||
                  fmt.name.toLowerCase().includes("carousel");
                const activeFmtColor = isReel
                  ? "border-[#6D4AFF] bg-[#F3F0FF] text-[#6D4AFF]"
                  : isCarousel
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-pink-500 bg-pink-50 text-pink-700";

                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormatId(fmt.id)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 px-2 text-xs font-bold transition-all ${
                      selected
                        ? `${activeFmtColor} shadow-2xs`
                        : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {isReel ? (
                      <Video className="h-4 w-4" />
                    ) : isCarousel ? (
                      <Layers className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    <span>{fmt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* KHUSUS FORMAT REEL: PILIH KATEGORI TALENT IN-FRAME (BEBAS PILIH) */}
          {isReelFormat ? (
            <div className="md:col-span-5">
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Talent In-Frame (Khusus Reel — Bebas Pilih)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {REEL_TALENT_CATEGORIES.map((tc) => {
                  const isSel = talentCategory === tc;
                  const activeColors =
                    tc === "Talent Model"
                      ? "border-[#6D4AFF] bg-[#F3F0FF] text-[#6D4AFF]"
                      : tc === "Mentor / Pengajar"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-orange-500 bg-orange-50 text-orange-700";

                  const TalentIcon =
                    tc === "Talent Model"
                      ? UserCheck
                      : tc === "Mentor / Pengajar"
                      ? GraduationCap
                      : Users;

                  return (
                    <button
                      key={tc}
                      type="button"
                      onClick={() => setTalentCategory(tc)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2 px-2 text-center text-xs font-bold transition-all ${
                        isSel
                          ? `${activeColors} shadow-2xs`
                          : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <TalentIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="md:col-span-5 flex items-center">
              <div className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-500">
                Format <strong>{selectedFormatObj?.name}</strong> (Feed) tidak memerlukan pilihan Talent In-Frame video.
              </div>
            </div>
          )}

          {/* Platform (Instagram, Facebook, TikTok) */}
          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Platform Tayang
            </label>
            <div className="flex flex-wrap gap-1.5">
              {activePlatforms.map((plat) => {
                const checked = selectedPlatformIds.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => togglePlatform(plat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      checked
                        ? "border-[#7E60FF] bg-[#ECE7FF] text-[#7E60FF]"
                        : "border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <span>{plat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =============================================================== */}
          {/* AREA LEBAR: EDITOR POIN SCRIPT (REEL) / ISI PER SLIDE (CAROUSEL)*/}
          {/* =============================================================== */}
          <div className="md:col-span-12">
            {/* MODE 1: KHUSUS FORMAT REEL -> INPUT SCRIPT POIN PER POIN */}
            {isReelFormat && (
              <div className="rounded-3xl border border-[#ECE7FF] bg-[#FAF9FF] p-5">
                <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-[#7E60FF]" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Kolom Script Video Reel (Poin per Poin)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Tulis alur pembicaraan atau adegan Talent/Mentor/Siswa poin demi poin
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReelPoints((prev) => [...prev, ""])}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#7E60FF] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#694be8]"
                  >
                    <ListPlus className="h-3.5 w-3.5" />
                    <span>+ Tambah Poin Script</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {reelPoints.map((pt, idx) => {
                    const pointLabel =
                      idx === 0
                        ? "Poin 1 — Hook Pembuka (0–3 Detik)"
                        : idx === reelPoints.length - 1 && reelPoints.length > 1
                        ? `Poin ${idx + 1} — CTA / Penutup`
                        : `Poin ${idx + 1} — Isi Materi / Pembahasan`;

                    const placeholderText =
                      idx === 0
                        ? "Contoh: Siapa nih yang kalau ketemu soal TIU deret angka langsung nyerah? Jangan diskip!"
                        : idx === reelPoints.length - 1 && reelPoints.length > 1
                        ? "Contoh: Mau tau trik rahasia lainnya? Yuk gabung kelas intensif Prima RIB, klik link di bio!"
                        : "Contoh: Jangan ngitung manual satu-satu. Cek pola loncat angkanya, dalam 15 detik langsung ketemu jawaban B!";

                    return (
                      <div
                        key={`reel-pt-${idx}`}
                        className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs"
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#7E60FF]">
                            {pointLabel}
                          </span>
                          {reelPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setReelPoints((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Hapus Poin</span>
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={pt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReelPoints((prev) =>
                              prev.map((item, i) => (i === idx ? val : item))
                            );
                          }}
                          placeholder={placeholderText}
                          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-[#7E60FF] focus:bg-white focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODE 2: KHUSUS FORMAT CAROUSEL -> INPUT ISI PER SLIDE */}
            {isCarouselFormat && (
              <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/40 p-5">
                <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-700" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Kolom Isi Carousel (Per Slide)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Tulis isi materi untuk masing-masing slide Carousel (Slide 1 Cover s/d Slide CTA)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCarouselSlides((prev) => [...prev, ""])}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Tambah Slide</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {carouselSlides.map((slideText, idx) => {
                    const slideTitle =
                      idx === 0
                        ? "Slide 1 — Judul / Cover Utama"
                        : idx === carouselSlides.length - 1 &&
                          carouselSlides.length > 1
                        ? `Slide ${idx + 1} — CTA / Penutup`
                        : `Slide ${idx + 1} — Isi Materi`;

                    const slidePlaceholder =
                      idx === 0
                        ? "Contoh: Wajib Tahu! 5 Dokumen Sering Gagal Verifikasi di CPNS"
                        : idx === carouselSlides.length - 1 &&
                          carouselSlides.length > 1
                        ? "Contoh: Simpan postingan ini & daftar kelas intensif Prima RIB via link di bio!"
                        : `Tulis isi poin pembahasan untuk Slide ${idx + 1}...`;

                    return (
                      <div
                        key={`slide-${idx}`}
                        className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs"
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-[11px]">
                              {idx + 1}
                            </span>
                            <span>{slideTitle}</span>
                          </span>

                          {carouselSlides.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setCarouselSlides((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>

                        <textarea
                          rows={3}
                          value={slideText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCarouselSlides((prev) =>
                              prev.map((item, i) => (i === idx ? val : item))
                            );
                          }}
                          placeholder={slidePlaceholder}
                          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODE 3: KHUSUS FORMAT SINGLE POST -> TEXTAREA LEBAR */}
            {!isReelFormat && !isCarouselFormat && (
              <div className="rounded-2xl border border-pink-200/90 bg-pink-50/40 p-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-pink-600" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Isi Konten Single Post (Teks Visual / Poin Poster)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tulis headline poster dan poin informasi yang akan ditampilkan pada desain Single Post
                    </p>
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={singlePostBody}
                  onChange={(e) => setSinglePostBody(e.target.value)}
                  placeholder={
                    "Headline Poster: ...\n• Poin 1: ...\n• Poin 2: ...\n• CTA: ..."
                  }
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-pink-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Caption & Hashtag + Tombol Simpan */}
          <div className="md:col-span-9">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Caption Postingan & Hashtag (Opsional)
            </label>
            <textarea
              rows={2}
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="Tulis caption untuk Instagram / Facebook / TikTok beserta hashtag (#PrimaRIB #CPNS #Sekdin #Polri)..."
              className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#7E60FF] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7E60FF] px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_8px_20px_rgba(126,96,255,0.3)] transition hover:bg-[#694be8]"
            >
              <Plus className="h-4 w-4" />
              <span>{editingId ? "Update Konten" : "Simpan Konten"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* =================================================================== */}
      {/* DAFTAR IDE KONTEN + TOMBOL HAPUS SEMUA IDE KONTEN                   */}
      {/* =================================================================== */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daftar Ide Konten ({filteredContents.length})
            </h3>
            <p className="text-xs text-slate-400">
              Semua konten di bawah ini bisa langsung Anda Drag & Drop ke kalender di menu Production Board
            </p>
          </div>

          {/* Bulk Action Buttons: Hapus Semua Ide Konten & Reset Default */}
          <div className="flex flex-wrap items-center gap-2.5">
            {activeContents.length === 0 && availableIdeas.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  resetStoreToDefault();
                  showToast("Data ide konten awal berhasil dipulihkan!");
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Pulihkan Ide Default</span>
              </button>
            )}

            {(activeContents.length > 0 || availableIdeas.length > 0) && (
              <>
                {!confirmClearAll ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(true)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Semua Ide Konten</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 px-3 py-1.5">
                    <span className="text-xs font-bold text-rose-700">
                      Yakin hapus semua?
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="rounded-xl bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
                    >
                      Ya, Hapus Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="rounded-xl bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul konten..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs font-medium text-slate-800 focus:border-[#7E60FF] focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-[#7E60FF] focus:bg-white focus:outline-none"
          >
            <option value="ALL">Semua Wilayah (CPNS, Sekdin, Polri)</option>
            {activePrograms.map((p) => (
              <option key={p.id} value={p.id}>
                Wilayah: {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-[#7E60FF] focus:bg-white focus:outline-none"
          >
            <option value="ALL">
              Semua Format (Reel, Single Post, Carousel)
            </option>
            {activeFormats.map((f) => (
              <option key={f.id} value={f.id}>
                Format: {f.name}
              </option>
            ))}
          </select>

          <select
            value={filterTalent}
            onChange={(e) => setFilterTalent(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-[#7E60FF] focus:bg-white focus:outline-none"
          >
            <option value="ALL">Semua Kategori Talent Reel</option>
            {REEL_TALENT_CATEGORIES.map((tc) => (
              <option key={tc} value={tc}>
                Talent Reel: {tc}
              </option>
            ))}
          </select>
        </div>

        {/* Table of Contents */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 pr-3">Judul & Isi Script / Slide</th>
                <th className="py-3 px-3">Wilayah</th>
                <th className="py-3 px-3">Pilar</th>
                <th className="py-3 px-3">Format & Talent Reel</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Status Jadwal</th>
                <th className="py-3 pl-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContents.map((item) => {
                const isReel =
                  item.format_id === "fmt-reels" ||
                  (item.format?.name || "").toLowerCase().includes("reel");
                const detailPreview =
                  item.script || item.main_content || item.caption || "";

                return (
                  <tr
                    key={item.id}
                    className="group transition hover:bg-slate-50/80"
                  >
                    <td className="py-3.5 pr-3">
                      <p className="font-bold text-slate-800">{item.title}</p>
                      {detailPreview && (
                        <p className="mt-1 whitespace-pre-line line-clamp-2 max-w-md text-[11px] leading-relaxed text-slate-500">
                          {detailPreview}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                          item.program?.code === "CPNS"
                            ? "bg-[#FFF0E5] text-[#EA6A15]"
                            : item.program?.code === "SEKDIN"
                            ? "bg-[#ECE7FF] text-[#7E60FF]"
                            : "bg-[#E5F3FF] text-[#1D74F5]"
                        }`}
                      >
                        {item.program?.name || "CPNS"}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {item.pillar?.name || "Edukatif"}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${
                            isReel
                              ? "border-[#DCD4FF] bg-[#F3F0FF] text-[#6D4AFF]"
                              : item.format_id === "fmt-carousel"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-pink-200 bg-pink-50 text-pink-700"
                          }`}
                        >
                          {item.format?.name || "Single Post"}
                        </span>
                        {isReel && item.talent_category && (
                          <span
                            className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${getTalentBadgeClass(
                              item.talent_category
                            )}`}
                          >
                            {item.talent_category}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {item.platforms?.map((cp) => (
                          <span
                            key={cp.id}
                            className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600"
                          >
                            {cp.platform.code}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {item.scheduled_at ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {new Date(item.scheduled_at).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          Belum Dijadwalkan
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 pl-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditContent(item)}
                          className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-[#ECE7FF] hover:text-[#7E60FF]"
                          title="Edit Konten"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteContentPermanentlyAction(item.id);
                            showToast("Konten dihapus!");
                          }}
                          className="rounded-xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                          title="Hapus Konten"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredContents.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-400">
                Belum ada ide konten di daftar ini.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Silakan input ide konten baru menggunakan form di atas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* CADANGAN IDE DARI FILE PDF (BISA DI-KLik "+ MASUKKAN KE DAFTAR")    */}
      {/* =================================================================== */}
      {availableIdeas.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#6D4AFF]" />
              <h3 className="text-sm font-bold text-slate-800">
                Arsip Ide dari Master PDF ({availableIdeas.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Klik &ldquo;+ Masukkan&rdquo; untuk memindahkan ke daftar konten siap Drag & Drop
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {availableIdeas.slice(0, 12).map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:border-[#ECE7FF] hover:bg-white"
              >
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-[#ECE7FF] px-2 py-0.5 text-[10px] font-bold text-[#7E60FF]">
                      {idea.program?.name} • {idea.pillar?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteIdeaPermanentlyAction(idea.id)}
                      className="text-slate-300 hover:text-rose-500"
                      title="Hapus ide ini"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {idea.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                    {idea.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleConvertIdeaToContent(idea)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 py-1.5 text-xs font-bold text-[#7E60FF] transition hover:bg-[#7E60FF] hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Masukkan ke Daftar Konten</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentListPage() {
  return (
    <Suspense fallback={null}>
      <InputKontenInner />
    </Suspense>
  );
}
