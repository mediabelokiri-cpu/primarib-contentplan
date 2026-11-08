"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Video,
  Layers,
  FileText,
  Image as ImageIcon,
  X,
  Clock,
  Check,
  Copy,
  BookOpen,
  Info,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Award,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ContentWithRelations } from "@/types/database";

// ============================================================================
// METADATA & HELPER HARI KALENDER
// ============================================================================
interface ScheduleDayCell {
  dateIso: string;
  dayNumber: number;
  monthLabel: string;
  weekdayName: string;
  weekdayShort: string;
  ruleLabel: string;
  isReelDay: boolean;
  isToday: boolean;
}

const WEEKDAY_META: Record<
  number,
  { name: string; short: string; rule: string; isReel: boolean }
> = {
  1: { name: "Senin", short: "SEN", rule: "Feed (Single / Carousel)", isReel: false },
  2: { name: "Selasa", short: "SEL", rule: "Reel (Talent / Mentor / Siswa)", isReel: true },
  3: { name: "Rabu", short: "RAB", rule: "Feed (Single / Carousel)", isReel: false },
  4: { name: "Kamis", short: "KAM", rule: "Reel (Talent / Mentor / Siswa)", isReel: true },
  5: { name: "Jumat", short: "JUM", rule: "Feed (Single / Carousel)", isReel: false },
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function buildMonthSchedule(year: number, month: number): ScheduleDayCell[] {
  const days: ScheduleDayCell[] = [];
  const todayIso = new Date().toISOString().slice(0, 10);
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dayOfWeek = dateObj.getDay(); // 0: Minggu, 1: Senin, ..., 5: Jumat, 6: Sabtu

    // Hanya ambil hari kerja aktif (Senin - Jumat) sesuai jadwal standar Prima RIB
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const dateIso = `${yyyy}-${mm}-${dd}`;
      const meta = WEEKDAY_META[dayOfWeek];

      days.push({
        dateIso,
        dayNumber: d,
        monthLabel: MONTH_NAMES[month].slice(0, 3),
        weekdayName: meta.name,
        weekdayShort: meta.short,
        ruleLabel: meta.rule,
        isReelDay: meta.isReel,
        isToday: dateIso === todayIso,
      });
    }
  }

  return days;
}

// ============================================================================
// TALENT SCHEDULE VIEW INNER (MOBILE-FIRST APP)
// ============================================================================
function TalentScheduleViewInner() {
  const searchParams = useSearchParams();
  const { state, enrichedContents } = useAppStore();

  // Navigation Tabs (Menu Bawah)
  const [activeTab, setActiveTab] = useState<"JADWAL" | "SHOOTING" | "NASKAH" | "PANDUAN">(
    "JADWAL"
  );

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  // Tanggal yang sedang aktif dipilih di kalender harian
  const todayIso = new Date().toISOString().slice(0, 10);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const [showAllDates, setShowAllDates] = useState<boolean>(false);

  // Filter Kategori
  const [filterTalent, setFilterTalent] = useState<string>("ALL");
  const [selectedContent, setSelectedContent] = useState<ContentWithRelations | null>(null);

  // Copy feedback state
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [scriptModalTab, setScriptModalTab] = useState<"SCENE" | "CAPTION" | "BRIEF">("SCENE");

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) {
      setFilterTalent(roleParam);
      if (roleParam.includes("Talent") || roleParam.includes("Mentor")) {
        setActiveTab("SHOOTING");
      }
    }
  }, [searchParams]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDateIso(now.toISOString().slice(0, 10));
    setShowAllDates(false);
  };

  const resolveReelTalent = (
    c: ContentWithRelations
  ): "Talent Model" | "Mentor / Pengajar" | "Siswa" => {
    const raw = (c.talent_category || "").trim().toLowerCase();
    if (raw.includes("model") || raw === "talent") return "Talent Model";
    if (raw.includes("siswa")) return "Siswa";
    return "Mentor / Pengajar";
  };

  const scheduleDays = buildMonthSchedule(viewYear, viewMonth);

  const scheduledContents = enrichedContents.filter(
    (c) => c.status !== "ARCHIVED" && Boolean(c.scheduled_at)
  );

  // Hitung jumlah konten per kategori
  const countTalentModel = scheduledContents.filter((c) => {
    const isReel =
      c.format_id === "fmt-reels" ||
      (c.format?.name || "").toLowerCase().includes("reel");
    return isReel && resolveReelTalent(c) === "Talent Model";
  }).length;

  const countMentor = scheduledContents.filter((c) => {
    const isReel =
      c.format_id === "fmt-reels" ||
      (c.format?.name || "").toLowerCase().includes("reel");
    return isReel && resolveReelTalent(c) === "Mentor / Pengajar";
  }).length;

  const countSiswa = scheduledContents.filter((c) => {
    const isReel =
      c.format_id === "fmt-reels" ||
      (c.format?.name || "").toLowerCase().includes("reel");
    return isReel && resolveReelTalent(c) === "Siswa";
  }).length;

  // Daftar Konten Terfilter
  const allFilteredContents = scheduledContents
    .filter((c) => {
      const fmtLower = (c.format?.name || "").toLowerCase();
      const isReel = c.format_id === "fmt-reels" || fmtLower.includes("reel");
      const isCarousel =
        c.format_id === "fmt-carousel" ||
        fmtLower.includes("carousel") ||
        fmtLower.includes("karusel");

      if (activeTab === "SHOOTING") {
        if (!isReel) return false;
      }

      if (filterTalent === "CAROUSEL_ONLY") return isCarousel;
      if (filterTalent === "SINGLE_ONLY") return !isReel && !isCarousel;
      if (filterTalent !== "ALL") {
        return isReel && resolveReelTalent(c) === filterTalent;
      }
      return true;
    })
    .sort((a, b) => (a.scheduled_at || "").localeCompare(b.scheduled_at || ""));

  // Konten untuk tanggal terpilih
  const dateSpecificContents = allFilteredContents.filter(
    (c) => c.scheduled_at && c.scheduled_at.slice(0, 10) === selectedDateIso
  );

  const displayedContents =
    showAllDates || activeTab === "NASKAH"
      ? allFilteredContents
      : dateSpecificContents;

  const getScheduleBoxStyle = (item: ContentWithRelations) => {
    const fmtLower = (item.format?.name || "").toLowerCase();
    const isReel = item.format_id === "fmt-reels" || fmtLower.includes("reel");
    const isCarousel =
      item.format_id === "fmt-carousel" ||
      fmtLower.includes("carousel") ||
      fmtLower.includes("karusel");

    if (isReel) {
      const resolvedTalent = resolveReelTalent(item);
      if (resolvedTalent === "Talent Model") {
        return {
          badgeBg: "bg-[#284078] text-white",
          dotColor: "bg-[#284078]",
          border: "border-l-4 border-l-[#284078]",
          typeLabel: "REEL",
          talentLabel: "Talent Model",
        };
      }
      if (resolvedTalent === "Siswa") {
        return {
          badgeBg: "bg-[#EA580C] text-white",
          dotColor: "bg-[#EA580C]",
          border: "border-l-4 border-l-[#EA580C]",
          typeLabel: "REEL",
          talentLabel: "Siswa",
        };
      }
      return {
        badgeBg: "bg-[#0284C7] text-white",
        dotColor: "bg-[#0284C7]",
        border: "border-l-4 border-l-[#0284C7]",
        typeLabel: "REEL",
        talentLabel: "Mentor",
      };
    }

    if (isCarousel) {
      return {
        badgeBg: "bg-[#059669] text-white",
        dotColor: "bg-[#059669]",
        border: "border-l-4 border-l-[#059669]",
        typeLabel: "FEED",
        talentLabel: "Carousel",
      };
    }

    return {
      badgeBg: "bg-[#E11D48] text-white",
      dotColor: "bg-[#E11D48]",
      border: "border-l-4 border-l-[#E11D48]",
      typeLabel: "FEED",
      talentLabel: "Single Post",
    };
  };

  // Helper salin teks
  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Mencari detail naskah tersimpan di Store jika ada
  const activeScript = selectedContent
    ? state.contentScripts?.find((s) => s.content_id === selectedContent.id)
    : null;

  return (
    <div className="min-h-screen bg-slate-900/5 sm:py-6 text-slate-900 font-sans">
      {/* =================================================================== */}
      {/* MOBILE APP FRAME CONTAINER (MAX-W-MD DENGAN TAMPILAN APP NATIVE)    */}
      {/* =================================================================== */}
      <div className="mx-auto min-h-screen max-w-md bg-white shadow-2xl sm:rounded-[36px] sm:border sm:border-slate-200 overflow-hidden flex flex-col relative pb-24">
        
        {/* ================================================================= */}
        {/* TOP APP BAR (HEADER NATIVE MOBILE APP)                            */}
        {/* ================================================================= */}
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-[#284078] text-white px-4 pt-3.5 pb-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/logo.png"
                alt="Prima RIB"
                className="h-9 w-9 shrink-0 rounded-xl bg-white p-1 object-contain shadow-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#DDB02E]">
                    Portal Talent & Mentor
                  </span>
                </div>
                <h1 className="truncate text-base font-extrabold text-white leading-tight">
                  Jadwal Konten Prima RIB
                </h1>
              </div>
            </div>

            {/* Quick Today Pill */}
            <button
              type="button"
              onClick={handleGoToday}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 px-3 py-1 text-[11px] font-bold text-white transition backdrop-blur-xs"
            >
              <Clock className="h-3 w-3 text-[#DDB02E]" />
              <span>Hari Ini</span>
            </button>
          </div>

          {/* Month Switcher Bar */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-2 py-1.5 backdrop-blur-xs text-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-white hover:bg-white/15 active:scale-95"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-extrabold tracking-wide text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-white hover:bg-white/15 active:scale-95"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ================================================================= */}
        {/* KONTEN UTAMA SESUAI TAB AKTIF                                     */}
        {/* ================================================================= */}
        <main className="flex-1 px-4 pt-3.5 space-y-4">
          
          {/* TAB 1: JADWAL (BERANDA KALENDER INTERAKTIF) */}
          {activeTab === "JADWAL" && (
            <>
              {/* Horizontal Date Picker Strip (Geser & Pilih Tanggal) */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 shadow-2xs">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Pilih Tanggal Tayang:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllDates(!showAllDates)}
                    className="text-[11px] font-bold text-[#284078] underline"
                  >
                    {showAllDates ? "Pilih Per Tanggal" : "Lihat Semua Hari"}
                  </button>
                </div>

                {!showAllDates && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                    {scheduleDays.map((day) => {
                      const isSelected = selectedDateIso === day.dateIso;
                      // Cek apakah ada jadwal di tanggal ini
                      const hasItems = scheduledContents.some(
                        (c) => c.scheduled_at && c.scheduled_at.slice(0, 10) === day.dateIso
                      );

                      return (
                        <button
                          key={day.dateIso}
                          type="button"
                          onClick={() => {
                            setSelectedDateIso(day.dateIso);
                            setShowAllDates(false);
                          }}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-12 py-2 rounded-xl transition-all ${
                            isSelected
                              ? "bg-[#284078] text-white shadow-md scale-105"
                              : day.isToday
                              ? "bg-amber-100/70 border border-amber-300 text-slate-900"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className={`text-[9px] font-bold uppercase ${isSelected ? "text-slate-200" : "text-slate-400"}`}>
                            {day.weekdayShort}
                          </span>
                          <span className="text-sm font-extrabold leading-tight mt-0.5">
                            {day.dayNumber}
                          </span>
                          {/* Dot Indicator jika ada konten */}
                          <span
                            className={`h-1.5 w-1.5 rounded-full mt-1 ${
                              hasItems
                                ? isSelected
                                  ? "bg-[#DDB02E]"
                                  : "bg-[#284078]"
                                : "bg-transparent"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status Hari Terpilih Banner */}
              {!showAllDates && (
                <div className="flex items-center justify-between rounded-xl bg-blue-50/70 border border-blue-100 px-3.5 py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#284078]" />
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(selectedDateIso).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="rounded-md bg-[#284078] px-2 py-0.5 text-[10px] font-extrabold text-white">
                    {dateSpecificContents.length} Konten
                  </span>
                </div>
              )}

              {/* Filter Cepat Kategori */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: "ALL", label: `Semua (${scheduledContents.length})` },
                  { id: "Mentor / Pengajar", label: `Mentor (${countMentor})` },
                  { id: "Talent Model", label: `Talent (${countTalentModel})` },
                  { id: "Siswa", label: `Siswa (${countSiswa})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilterTalent(item.id)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                      filterTalent === item.id
                        ? "bg-[#284078] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* TAB 2: SHOOTING REEL (TUGAS REEL TALENT) */}
          {activeTab === "SHOOTING" && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5">
                <div className="flex items-center gap-2 text-[#284078]">
                  <Video className="h-4 w-4" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wide">
                    Tugas Shooting Video Reels
                  </h3>
                </div>
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                  Daftar seluruh naskah video yang melibatkan Talent Model, Mentor Pengajar, atau Siswa Prima RIB.
                </p>
              </div>

              {/* Selector Role Shooting */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "Talent Model", label: "Talent Model", count: countTalentModel },
                  { id: "Mentor / Pengajar", label: "Mentor", count: countMentor },
                  { id: "Siswa", label: "Siswa", count: countSiswa },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFilterTalent(filterTalent === role.id ? "ALL" : role.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                      filterTalent === role.id
                        ? "border-[#284078] bg-[#284078] text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-[11px] font-bold">{role.label}</span>
                    <span className={`text-[10px] font-extrabold ${filterTalent === role.id ? "text-[#DDB02E]" : "text-slate-400"}`}>
                      {role.count} Video
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NASKAH LENGKAP */}
          {activeTab === "NASKAH" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
                <FileText className="h-4 w-4 text-[#284078]" />
                <span>Direktori Seluruh Naskah Siap Tayang</span>
              </div>
              <p className="text-[11px]">
                Ketuk kartu di bawah untuk membuka naskah video dengan tampilan teks besar yang ramah saat di depan kamera.
              </p>
            </div>
          )}

          {/* TAB 4: PANDUAN TALENT (SOP) */}
          {activeTab === "PANDUAN" && (
            <div className="space-y-3.5">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <Award className="h-4 w-4 text-[#DDB02E]" />
                  <span>SOP & Standar Penampilan Talent Prima RIB</span>
                </div>
                <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                  Panduan wajib bagi talent model, mentor, dan siswa sebelum melakukan take video reels / podcast:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-[#284078] block">
                    1. Dresscode & Warna Pakaian
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Gunakan kemeja/blazer rapi dengan nuansa warna resmi Prima RIB (Navy, Putih, Abu, atau Aksen Emas). Dilarang mengenakan baju bermotif ramai atau berlogo brand lain.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-[#284078] block">
                    2. Latar Belakang & Tata Cahaya
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Prioritaskan pengambilan gambar di fasilitas <strong>Lab Simulasi CAT Prima RIB</strong> atau standing banner resmi. Pastikan pencahayaan terang merata dan mic clip-on terpasang rapi.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-[#284078] block">
                    3. Intonasi & Hook 3 Detik Awal
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Buka video dengan kontak mata langsung ke lensa kamera dan intonasi antusias pejuang. Tuntaskan kalimat hook dalam 0–3 detik awal sebelum jeda nafas.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 space-y-1">
                  <span className="text-xs font-bold text-rose-800 block">
                    4. Batasan Ketat Brand (Anti-Hoaks)
                  </span>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Dilarang menyebutkan klaim garansi kelulusan 100% tanpa belajar atau membocorkan soal asli rahasia negara. Sampaikan fakta regulasi resmi secara profesional.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* DAFTAR KARTU KONTEN RAPI & TERSTRUKTUR                           */}
          {/* =============================================================== */}
          {activeTab !== "PANDUAN" && (
            <div className="space-y-3">
              {displayedContents.length > 0 ? (
                displayedContents.map((item) => {
                  const styleMeta = getScheduleBoxStyle(item);
                  const isReel =
                    item.format_id === "fmt-reels" ||
                    (item.format?.name || "").toLowerCase().includes("reel");

                  // Parse hook dari naskah jika ada
                  const itemScript = state.contentScripts?.find(
                    (s) => s.content_id === item.id
                  );
                  const hookText =
                    itemScript?.hook ||
                    (item.script || "").match(/Hook[^:]*:\s*"?([^"\n\r]+)"?/i)?.[1] ||
                    null;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedContent(item)}
                      className={`cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md transition active:scale-[0.99] ${styleMeta.border}`}
                    >
                      {/* Baris Badge Atas */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold ${styleMeta.badgeBg}`}
                          >
                            {isReel ? (
                              <Video className="h-3 w-3" />
                            ) : item.format_id === "fmt-carousel" ? (
                              <Layers className="h-3 w-3" />
                            ) : (
                              <ImageIcon className="h-3 w-3" />
                            )}
                            <span>{styleMeta.typeLabel} • {styleMeta.talentLabel}</span>
                          </span>

                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {item.program?.code || "CPNS"}
                          </span>
                        </div>

                        {item.scheduled_at && (
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(item.scheduled_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>

                      {/* Judul Konten */}
                      <h4 className="mt-2.5 text-xs sm:text-sm font-extrabold leading-snug text-slate-900">
                        {item.title}
                      </h4>

                      {/* Box Hook 0-3 Detik Highlight */}
                      {hookText && (
                        <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                            ⚡ Hook 0–3 Detik:
                          </span>
                          <p className="mt-0.5 text-[11px] font-medium italic text-slate-800 line-clamp-2">
                            &ldquo;{hookText.replace(/^Slide\s*\d+:\s*/i, "")}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Footer Kartu & Tombol Aksi */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-500">
                        <span>Pilar: {item.pillar?.name}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-[#284078]">
                          Buka Naskah →
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-10 px-4 text-center space-y-2">
                  <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">
                    Tidak ada jadwal konten pada tanggal ini
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Silakan pilih tanggal lain pada kalender di atas atau ketuk &ldquo;Lihat Semua Hari&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAllDates(true)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#284078] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs mt-2"
                  >
                    Tampilkan Semua Jadwal
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ================================================================= */}
        {/* BOTTOM NAVIGATION BAR (FIXED MELAYANG DI BAWAH SMARTPHONE)        */}
        {/* ================================================================= */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg sm:rounded-b-[36px]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("JADWAL");
              setShowAllDates(false);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === "JADWAL"
                ? "text-[#284078] font-extrabold"
                : "text-slate-400 font-semibold hover:text-slate-600"
            }`}
          >
            <Calendar className={`h-5 w-5 ${activeTab === "JADWAL" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px]">Jadwal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("SHOOTING");
              setShowAllDates(true);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === "SHOOTING"
                ? "text-[#284078] font-extrabold"
                : "text-slate-400 font-semibold hover:text-slate-600"
            }`}
          >
            <Video className={`h-5 w-5 ${activeTab === "SHOOTING" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px]">Shooting</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("NASKAH");
              setShowAllDates(true);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === "NASKAH"
                ? "text-[#284078] font-extrabold"
                : "text-slate-400 font-semibold hover:text-slate-600"
            }`}
          >
            <FileText className={`h-5 w-5 ${activeTab === "NASKAH" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px]">Naskah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PANDUAN")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              activeTab === "PANDUAN"
                ? "text-[#284078] font-extrabold"
                : "text-slate-400 font-semibold hover:text-slate-600"
            }`}
          >
            <Info className={`h-5 w-5 ${activeTab === "PANDUAN" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px]">Panduan</span>
          </button>
        </nav>

        {/* ================================================================= */}
        {/* BOTTOM SHEET DETAIL NASKAH SHOOTING SAAT KARTU DI-TAP             */}
        {/* ================================================================= */}
        {selectedContent && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:items-center sm:p-4"
            onClick={() => setSelectedContent(null)}
          >
            <div
              className="max-h-[92vh] w-full max-w-md overflow-hidden rounded-t-[32px] bg-white shadow-2xl flex flex-col sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle Bar */}
              <div className="pt-3 pb-1 flex justify-center bg-slate-50">
                <div className="h-1.5 w-12 rounded-full bg-slate-300" />
              </div>

              {/* Sheet Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${
                          getScheduleBoxStyle(selectedContent).badgeBg
                        }`}
                      >
                        {getScheduleBoxStyle(selectedContent).typeLabel} •{" "}
                        {getScheduleBoxStyle(selectedContent).talentLabel}
                      </span>
                      <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {selectedContent.program?.name}
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-sm sm:text-base font-extrabold leading-snug text-slate-900 line-clamp-2">
                      {selectedContent.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedContent(null)}
                    className="p-1.5 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Sub Tab Switcher di dalam Sheet */}
                <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-200/70 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setScriptModalTab("SCENE")}
                    className={`py-1.5 rounded-lg font-bold text-center transition ${
                      scriptModalTab === "SCENE"
                        ? "bg-white text-[#284078] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Naskah & Adegan
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptModalTab("CAPTION")}
                    className={`py-1.5 rounded-lg font-bold text-center transition ${
                      scriptModalTab === "CAPTION"
                        ? "bg-white text-[#284078] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Caption & CTA
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptModalTab("BRIEF")}
                    className={`py-1.5 rounded-lg font-bold text-center transition ${
                      scriptModalTab === "BRIEF"
                        ? "bg-white text-[#284078] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Brief & Info
                  </button>
                </div>
              </div>

              {/* Sheet Body (Scrollable) */}
              <div className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs">
                
                {/* TAB MODAL 1: NASKAH & TIMELINE ADEGAN */}
                {scriptModalTab === "SCENE" && (
                  <div className="space-y-3">
                    {/* Hook Pembuka */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                          ⚡ Hook Pembuka 0–3 Detik (Hafalkan / Baca Tegas)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              activeScript?.hook ||
                                (selectedContent.script || "").match(/Hook[^:]*:\s*"?([^"\n\r]+)"?/i)?.[1] ||
                                selectedContent.title,
                              "hook"
                            )
                          }
                          className="text-[10px] font-bold text-amber-900 hover:underline inline-flex items-center gap-1"
                        >
                          {copiedSection === "hook" ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm font-bold italic text-slate-900">
                        &ldquo;
                        {(
                          activeScript?.hook ||
                          (selectedContent.script || "").match(/Hook[^:]*:\s*"?([^"\n\r]+)"?/i)?.[1] ||
                          "Stop buang waktu persiapanmu, simak tips penting ini!"
                        ).replace(/^Slide\s*\d+:\s*/i, "")}
                        &rdquo;
                      </p>
                    </div>

                    {/* Breakdown Adegan Video Reels */}
                    {activeScript?.reels_scenes && activeScript.reels_scenes.length > 0 ? (
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                          Timeline & Dialog Adegan (Scene Breakdown):
                        </span>
                        {activeScript.reels_scenes.map((sc, idx) => (
                          <div
                            key={sc.id || idx}
                            className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-1.5"
                          >
                            <div className="flex items-center justify-between font-bold text-[#284078]">
                              <span className="text-xs">Adegan {idx + 1} ({sc.timecode})</span>
                              <span className="text-[10px] uppercase bg-blue-100 px-2 py-0.5 rounded font-extrabold text-[#284078]">
                                {sc.text_on_screen || "VISUAL"}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                              {sc.audio_dialogue}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              <strong>Arahan Visual:</strong> {sc.visual_direction}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Tampilan Teks Naskah Penuh jika belum ada scene breakdown */
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Naskah Shooting Siap Baca:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                selectedContent.script ||
                                  selectedContent.main_content ||
                                  selectedContent.title,
                                "full-script"
                              )
                            }
                            className="text-[10px] font-bold text-[#284078] hover:underline inline-flex items-center gap-1"
                          >
                            {copiedSection === "full-script" ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Salin Naskah</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-900 whitespace-pre-line shadow-2xs">
                          {selectedContent.script ||
                            selectedContent.main_content ||
                            "Belum ada naskah tersimpan untuk konten ini."}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB MODAL 2: CAPTION & CTA */}
                {scriptModalTab === "CAPTION" && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Caption Media Sosial:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(selectedContent.caption || "", "caption")
                          }
                          className="text-[10px] font-bold text-[#284078] hover:underline inline-flex items-center gap-1"
                        >
                          {copiedSection === "caption" ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Salin Caption</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-slate-800 bg-white p-3 rounded-lg border border-slate-200">
                        {selectedContent.caption || "Belum ada caption untuk konten ini."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#284078] block">
                        Call to Action (CTA):
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-slate-800">
                        {selectedContent.cta ||
                          activeScript?.cta ||
                          "Simpan video ini dan konsultasikan persiapanmu di Prima RIB via link bio!"}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB MODAL 3: BRIEF & INFORMASI */}
                {scriptModalTab === "BRIEF" && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Program
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedContent.program?.name}
                        </span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Pilar Konten
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedContent.pillar?.name}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Jadwal Penayangan
                      </span>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#284078]" />
                        <span>
                          {selectedContent.scheduled_at
                            ? new Date(selectedContent.scheduled_at).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "Belum dijadwalkan"}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-[11px] text-amber-900 leading-relaxed">
                      💡 <strong>Tips Talent:</strong> Ucapkan dialog dengan tempo rileks dan artikulasi jelas. Jangan ragu mengulang take jika ada diksi yang kurang pas.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE EXPORT DENGAN SUSPENSE
// ============================================================================
export default function TalentScheduleViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-xs text-slate-500 font-bold">
          Memuat aplikasi jadwal talent...
        </div>
      }
    >
      <TalentScheduleViewInner />
    </Suspense>
  );
}
