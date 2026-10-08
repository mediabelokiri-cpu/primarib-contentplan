"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Video,
  Layers,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ContentWithRelations } from "@/types/database";

interface ScheduleDayCell {
  dateIso: string;
  dayNumber: number;
  monthLabel: string;
  weekdayName: string;
  ruleLabel: string;
  isReelDay: boolean;
}

function buildScheduleWeeks(
  year: number,
  month: number
): ScheduleDayCell[][] {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const weekdayMeta: Record<
    number,
    { name: string; rule: string; isReel: boolean }
  > = {
    1: { name: "Senin", rule: "Feed (Single Post / Carousel)", isReel: false },
    2: { name: "Selasa", rule: "Reel (Talent / Mentor / Siswa)", isReel: true },
    3: { name: "Rabu", rule: "Feed (Single Post / Carousel)", isReel: false },
    4: { name: "Kamis", rule: "Reel (Talent / Mentor / Siswa)", isReel: true },
    5: { name: "Jumat", rule: "Feed (Single Post / Carousel)", isReel: false },
  };

  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  let firstMondayDate = 1;
  if (dayOfWeek === 0) {
    firstMondayDate = 2;
  } else if (dayOfWeek > 1) {
    firstMondayDate = 1 + (8 - dayOfWeek);
  }

  const weeks: ScheduleDayCell[][] = [];
  for (let w = 0; w < 4; w++) {
    const weekRow: ScheduleDayCell[] = [];
    for (let d = 0; d < 5; d++) {
      const dateObj = new Date(year, month, firstMondayDate + w * 7 + d);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const meta = weekdayMeta[d + 1];

      weekRow.push({
        dateIso: `${yyyy}-${mm}-${dd}`,
        dayNumber: dateObj.getDate(),
        monthLabel: monthNames[dateObj.getMonth()],
        weekdayName: meta.name,
        ruleLabel: meta.rule,
        isReelDay: meta.isReel,
      });
    }
    weeks.push(weekRow);
  }

  return weeks;
}

function TalentScheduleViewInner() {
  const searchParams = useSearchParams();
  const { enrichedContents } = useAppStore();

  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(9); // Oktober 2026
  const [filterTalent, setFilterTalent] = useState<string>("ALL");
  const [activeWeek, setActiveWeek] = useState<number | "ALL">("ALL");
  const [selectedContent, setSelectedContent] =
    useState<ContentWithRelations | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) {
      setFilterTalent(roleParam);
    }
  }, [searchParams]);

  const monthFullNames = [
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

  const resolveReelTalent = (
    c: ContentWithRelations
  ): "Talent Model" | "Mentor / Pengajar" | "Siswa" => {
    const raw = (c.talent_category || "").trim().toLowerCase();
    if (raw.includes("model") || raw === "talent") return "Talent Model";
    if (raw.includes("siswa")) return "Siswa";
    return "Mentor / Pengajar";
  };

  const weeks = buildScheduleWeeks(viewYear, viewMonth);

  const scheduledContents = enrichedContents.filter(
    (c) => c.status !== "ARCHIVED" && Boolean(c.scheduled_at)
  );

  // Hitung jumlah per kategori untuk memudahkan Talent melihat beban jadwal
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

  const countCarousel = scheduledContents.filter((c) => {
    const fmtLower = (c.format?.name || "").toLowerCase();
    return (
      c.format_id === "fmt-carousel" ||
      fmtLower.includes("carousel") ||
      fmtLower.includes("karusel")
    );
  }).length;

  const countSinglePost = scheduledContents.filter((c) => {
    const fmtLower = (c.format?.name || "").toLowerCase();
    const isReel = c.format_id === "fmt-reels" || fmtLower.includes("reel");
    const isCarousel =
      c.format_id === "fmt-carousel" ||
      fmtLower.includes("carousel") ||
      fmtLower.includes("karusel");
    return !isReel && !isCarousel;
  }).length;

  const filteredScheduled = scheduledContents
    .filter((c) => {
      const fmtLower = (c.format?.name || "").toLowerCase();
      const isReel = c.format_id === "fmt-reels" || fmtLower.includes("reel");
      const isCarousel =
        c.format_id === "fmt-carousel" ||
        fmtLower.includes("carousel") ||
        fmtLower.includes("karusel");

      if (filterTalent === "CAROUSEL_ONLY") return isCarousel;
      if (filterTalent === "SINGLE_ONLY") return !isReel && !isCarousel;
      if (filterTalent !== "ALL") {
        return isReel && resolveReelTalent(c) === filterTalent;
      }
      return true;
    })
    .sort((a, b) =>
      (a.scheduled_at || "").localeCompare(b.scheduled_at || "")
    );

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
          box: "border-2 border-[#7E60FF] bg-[#ECE7FF] text-slate-900 shadow-2xs",
          headerBadge: "bg-[#7E60FF] text-white",
          typeLabel: "REEL",
          talentLabel: "Talent Model",
        };
      }
      if (resolvedTalent === "Siswa") {
        return {
          box: "border-2 border-[#F97316] bg-[#FFF0E5] text-slate-900 shadow-2xs",
          headerBadge: "bg-[#F97316] text-white",
          typeLabel: "REEL",
          talentLabel: "Siswa",
        };
      }
      return {
        box: "border-2 border-[#2B7FFF] bg-[#E5F3FF] text-slate-900 shadow-2xs",
        headerBadge: "bg-[#2B7FFF] text-white",
        typeLabel: "REEL",
        talentLabel: "Mentor / Pengajar",
      };
    }

    if (isCarousel) {
      return {
        box: "border-2 border-emerald-400 bg-emerald-50 text-slate-900 shadow-2xs",
        headerBadge: "bg-emerald-600 text-white",
        typeLabel: "FEED",
        talentLabel: "Carousel",
      };
    }

    return {
      box: "border-2 border-pink-400 bg-pink-50 text-slate-900 shadow-2xs",
      headerBadge: "bg-pink-600 text-white",
      typeLabel: "FEED",
      talentLabel: "Single Post",
    };
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-10 text-slate-900">
      {/* =================================================================== */}
      {/* HEADER SEDERHANA & RAMAH HP                                         */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="Prima RIB"
              className="h-9 w-9 shrink-0 rounded-xl object-contain"
            />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">
                Jadwal Konten Prima RIB
              </h1>
              <p className="truncate text-[11px] font-medium text-slate-500">
                Kalender Tayang Feed & Reels Talent
              </p>
            </div>
          </div>

          {/* Pemilih Bulan */}
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-slate-600 active:bg-slate-200 hover:bg-white"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[96px] text-center text-xs font-extrabold text-slate-800 sm:min-w-[115px]">
              {monthFullNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-slate-600 active:bg-slate-200 hover:bg-white"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-3.5 pt-4 sm:px-6">
        {/* ================================================================= */}
        {/* FILTER WARNA KATEGORI (MUDAH DI-TAP DI LAYAR HP)                  */}
        {/* ================================================================= */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:p-4">
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Filter Kategori Konten & Talent:
          </p>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setFilterTalent("ALL")}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                filterTalent === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Semua ({scheduledContents.length})
            </button>

            <button
              type="button"
              onClick={() =>
                setFilterTalent((prev) =>
                  prev === "Mentor / Pengajar" ? "ALL" : "Mentor / Pengajar"
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                filterTalent === "Mentor / Pengajar"
                  ? "border-[#2B7FFF] bg-[#2B7FFF] text-white shadow-xs"
                  : "border-[#2B7FFF]/40 bg-[#E5F3FF] text-[#1D74F5]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              <span>Reel: Mentor ({countMentor})</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setFilterTalent((prev) => (prev === "Siswa" ? "ALL" : "Siswa"))
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                filterTalent === "Siswa"
                  ? "border-[#F97316] bg-[#F97316] text-white shadow-xs"
                  : "border-[#F97316]/40 bg-[#FFF0E5] text-[#EA6A15]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              <span>Reel: Siswa ({countSiswa})</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setFilterTalent((prev) =>
                  prev === "Talent Model" ? "ALL" : "Talent Model"
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                filterTalent === "Talent Model"
                  ? "border-[#7E60FF] bg-[#7E60FF] text-white shadow-xs"
                  : "border-[#7E60FF]/40 bg-[#ECE7FF] text-[#7E60FF]"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              <span>Reel: Talent Model ({countTalentModel})</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setFilterTalent((prev) =>
                  prev === "CAROUSEL_ONLY" ? "ALL" : "CAROUSEL_ONLY"
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                filterTalent === "CAROUSEL_ONLY"
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              <span>Feed: Carousel ({countCarousel})</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setFilterTalent((prev) =>
                  prev === "SINGLE_ONLY" ? "ALL" : "SINGLE_ONLY"
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                filterTalent === "SINGLE_ONLY"
                  ? "border-pink-600 bg-pink-600 text-white shadow-xs"
                  : "border-pink-300 bg-pink-50 text-pink-700"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              <span>Feed: Single Post ({countSinglePost})</span>
            </button>
          </div>

          {/* Tab Pemilih Minggu (Sangat membantu di layar HP) */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 pt-3">
            {[
              { id: "ALL" as const, label: "Semua Minggu" },
              { id: 0 as const, label: "Minggu 1" },
              { id: 1 as const, label: "Minggu 2" },
              { id: 2 as const, label: "Minggu 3" },
              { id: 3 as const, label: "Minggu 4" },
            ].map((wk) => (
              <button
                key={String(wk.id)}
                type="button"
                onClick={() => setActiveWeek(wk.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeWeek === wk.id
                    ? "bg-[#6D4AFF] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {wk.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAMPILAN MOBILE (< md): KALENDER HARI SENIN - JUMAT PER MINGGU    */}
        {/* ================================================================= */}
        <div className="space-y-4 md:hidden">
          {weeks.map((week, wIdx) => {
            if (activeWeek !== "ALL" && activeWeek !== wIdx) return null;
            const firstCell = week[0];
            const lastCell = week[week.length - 1];

            return (
              <div
                key={`mob-week-${wIdx}`}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs"
              >
                {/* Header Minggu */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-2.5 text-white">
                  <span className="text-xs font-extrabold tracking-wide uppercase">
                    Minggu {wIdx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300">
                    {firstCell.dayNumber} {firstCell.monthLabel} –{" "}
                    {lastCell.dayNumber} {lastCell.monthLabel} {viewYear}
                  </span>
                </div>

                {/* Daftar Hari Senin s/d Jumat */}
                <div className="divide-y divide-slate-100">
                  {week.map((cell) => {
                    const cellItems = filteredScheduled.filter(
                      (c) =>
                        c.scheduled_at &&
                        c.scheduled_at.slice(0, 10) === cell.dateIso
                    );

                    return (
                      <div
                        key={cell.dateIso}
                        className={`p-3.5 ${
                          cell.isReelDay ? "bg-[#FAF9FF]" : "bg-white"
                        }`}
                      >
                        {/* Baris Hari & Penanda FEED / REEL */}
                        <div className="mb-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-extrabold text-white">
                              {cell.dayNumber}
                            </span>
                            <div>
                              <span className="text-xs font-extrabold uppercase text-slate-900">
                                {cell.weekdayName}
                              </span>
                              <span className="ml-1.5 text-[11px] font-medium text-slate-400">
                                {cell.dayNumber} {cell.monthLabel}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold ${
                              cell.isReelDay
                                ? "bg-[#ECE7FF] text-[#7E60FF]"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {cell.isReelDay ? "JADWAL REELS" : "JADWAL FEED"}
                          </span>
                        </div>

                        {/* Kartu Konten di Hari Tersebut */}
                        {cellItems.length > 0 ? (
                          <div className="space-y-2.5">
                            {cellItems.map((item) => {
                              const styleMeta = getScheduleBoxStyle(item);
                              const isReel =
                                item.format_id === "fmt-reels" ||
                                (item.format?.name || "")
                                  .toLowerCase()
                                  .includes("reel");

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => setSelectedContent(item)}
                                  className={`cursor-pointer rounded-xl p-3.5 active:scale-[0.99] transition ${styleMeta.box}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${styleMeta.headerBadge}`}
                                    >
                                      {isReel ? (
                                        <Video className="h-3.5 w-3.5" />
                                      ) : item.format_id === "fmt-carousel" ? (
                                        <Layers className="h-3.5 w-3.5" />
                                      ) : (
                                        <ImageIcon className="h-3.5 w-3.5" />
                                      )}
                                      <span>
                                        {styleMeta.typeLabel} •{" "}
                                        {styleMeta.talentLabel}
                                      </span>
                                    </span>

                                    <span className="rounded-md bg-white/85 px-2 py-0.5 text-[11px] font-extrabold text-slate-700">
                                      {item.program?.code || "CPNS"}
                                    </span>
                                  </div>

                                  <p className="mt-2.5 text-sm font-extrabold leading-snug text-slate-900">
                                    {item.title}
                                  </p>

                                  <div className="mt-2.5 flex items-center justify-between border-t border-black/10 pt-2 text-[11px] font-semibold text-slate-700">
                                    <span>Pilar: {item.pillar?.name}</span>
                                    <span className="font-extrabold text-[#6D4AFF]">
                                      Tap lihat script →
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 py-3 text-center text-xs font-medium text-slate-400">
                            Tidak ada jadwal pada filter ini
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================================================================= */}
        {/* TAMPILAN DESKTOP (>= md): TABEL KALENDER 5 KOLOM SENIN - JUMAT    */}
        {/* ================================================================= */}
        <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs md:block">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                {[
                  {
                    day: "SENIN",
                    sub: "Feed (Single Post / Carousel)",
                    isReel: false,
                  },
                  {
                    day: "SELASA",
                    sub: "Reel (Talent Model / Mentor / Siswa)",
                    isReel: true,
                  },
                  {
                    day: "RABU",
                    sub: "Feed (Single Post / Carousel)",
                    isReel: false,
                  },
                  {
                    day: "KAMIS",
                    sub: "Reel (Talent Model / Mentor / Siswa)",
                    isReel: true,
                  },
                  {
                    day: "JUMAT",
                    sub: "Feed (Single Post / Carousel)",
                    isReel: false,
                  },
                ].map((col) => (
                  <th
                    key={col.day}
                    className="w-1/5 border border-slate-200/80 bg-slate-50/90 p-3.5 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold tracking-wide text-slate-800">
                        {col.day}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          col.isReel
                            ? "bg-[#ECE7FF] text-[#7E60FF]"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {col.isReel ? "REEL" : "FEED"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                      {col.sub}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {weeks.map((week, wIdx) => {
                if (activeWeek !== "ALL" && activeWeek !== wIdx) return null;
                return (
                  <tr key={`desk-week-${wIdx}`}>
                    {week.map((cell) => {
                      const cellItems = filteredScheduled.filter(
                        (c) =>
                          c.scheduled_at &&
                          c.scheduled_at.slice(0, 10) === cell.dateIso
                      );

                      return (
                        <td
                          key={cell.dateIso}
                          className={`min-h-[160px] align-top border border-slate-200/80 p-3 ${
                            cell.isReelDay ? "bg-[#FAF9FF]/70" : "bg-white"
                          }`}
                        >
                          <div className="mb-2.5 flex items-center justify-between">
                            <span className="inline-flex items-baseline gap-1">
                              <span className="text-sm font-extrabold text-slate-800">
                                {cell.dayNumber}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {cell.monthLabel}
                              </span>
                            </span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                              Minggu {wIdx + 1}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {cellItems.map((item) => {
                              const styleMeta = getScheduleBoxStyle(item);
                              const isReel =
                                item.format_id === "fmt-reels" ||
                                (item.format?.name || "")
                                  .toLowerCase()
                                  .includes("reel");

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => setSelectedContent(item)}
                                  className={`cursor-pointer rounded-xl p-3 transition-all hover:-translate-y-0.5 ${styleMeta.box}`}
                                >
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${styleMeta.headerBadge}`}
                                    >
                                      {isReel ? (
                                        <Video className="h-3 w-3" />
                                      ) : item.format_id === "fmt-carousel" ? (
                                        <Layers className="h-3 w-3" />
                                      ) : (
                                        <ImageIcon className="h-3 w-3" />
                                      )}
                                      <span>{styleMeta.talentLabel}</span>
                                    </span>

                                    <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700">
                                      {item.program?.code || "CPNS"}
                                    </span>
                                  </div>

                                  <p className="mt-2 text-xs font-bold leading-snug text-slate-900">
                                    {item.title}
                                  </p>

                                  <div className="mt-2.5 flex items-center justify-between border-t border-black/5 pt-2 text-[10px] font-semibold text-slate-600">
                                    <span>{item.pillar?.name}</span>
                                    <span className="font-bold text-[#6D4AFF]">
                                      Lihat Script →
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {cellItems.length === 0 && (
                              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-100 p-2 text-center">
                                <span className="text-[11px] font-medium text-slate-300">
                                  Kosong
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* =================================================================== */}
      {/* MODAL / BOTTOM SHEET DETAIL POIN SCRIPT SAAT KARTU DI-TAP           */}
      {/* =================================================================== */}
      {selectedContent && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
          onClick={() => setSelectedContent(null)}
        >
          <div
            className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                      getScheduleBoxStyle(selectedContent).headerBadge
                    }`}
                  >
                    {getScheduleBoxStyle(selectedContent).typeLabel} •{" "}
                    {getScheduleBoxStyle(selectedContent).talentLabel}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {selectedContent.program?.name}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {selectedContent.pillar?.name}
                  </span>
                </div>

                <h3 className="mt-2.5 text-base font-extrabold leading-snug text-slate-900">
                  {selectedContent.title}
                </h3>

                {selectedContent.scheduled_at && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-[#6D4AFF]" />
                    <span>
                      {new Date(
                        selectedContent.scheduled_at
                      ).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedContent(null)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 active:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs leading-relaxed text-slate-700">
              {(selectedContent.script || selectedContent.main_content) && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    {selectedContent.format_id === "fmt-reels"
                      ? "Poin-per-Poin Script Video"
                      : "Isi Materi / Slide"}
                  </p>
                  <div className="mt-2.5 space-y-2">
                    {(
                      selectedContent.script ||
                      selectedContent.main_content ||
                      ""
                    )
                      .split(/\r?\n/)
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-slate-800 shadow-2xs"
                        >
                          {line}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedContent.caption && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Caption
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-slate-700">
                    {selectedContent.caption}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TalentScheduleViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6FA] p-6 text-xs text-slate-500">
          Memuat kalender konten...
        </div>
      }
    >
      <TalentScheduleViewInner />
    </Suspense>
  );
}
