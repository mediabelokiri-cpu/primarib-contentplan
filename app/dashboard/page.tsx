"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Video,
  Layers,
  Image as ImageIcon,
  Landmark,
  GraduationCap,
  Shield,
  CalendarDays,
  Kanban,
  FilePlus2,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const router = useRouter();
  const { enrichedContents } = useAppStore();

  // Interactive filter states
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<
    "ALL" | "CPNS" | "SEKDIN" | "POLRI"
  >("ALL");
  const [selectedDay, setSelectedDay] = useState<number>(8);
  const [filterBySelectedDay, setFilterBySelectedDay] = useState<boolean>(false);

  const activeContents = enrichedContents.filter(
    (c) => c.status !== "ARCHIVED"
  );
  const scheduledContents = activeContents.filter((c) => Boolean(c.scheduled_at));

  // Real counts per Wilayah
  const cpnsItems = activeContents.filter((c) => c.program?.code === "CPNS");
  const sekdinItems = activeContents.filter((c) => c.program?.code === "SEKDIN");
  const polriItems = activeContents.filter(
    (c) => c.program?.code === "POLRI" || c.program?.code === "GENERAL"
  );

  // Real counts per Talent Reel & Feed
  const reelItems = activeContents.filter(
    (c) =>
      c.format_id === "fmt-reels" ||
      (c.format?.name || "").toLowerCase().includes("reel")
  );
  const feedItems = activeContents.filter(
    (c) =>
      c.format_id !== "fmt-reels" &&
      !(c.format?.name || "").toLowerCase().includes("reel")
  );

  const carouselCount = feedItems.filter(
    (c) =>
      c.format_id === "fmt-carousel" ||
      (c.format?.name || "").toLowerCase().includes("carousel")
  ).length;
  const singlePostCount = feedItems.length - carouselCount;

  const talentModelCount = reelItems.filter(
    (c) => c.talent_category === "Talent Model"
  ).length;
  const siswaCount = reelItems.filter(
    (c) => c.talent_category === "Siswa"
  ).length;
  const mentorCount = reelItems.length - talentModelCount - siswaCount;

  // Filter table contents based on interactive selections
  const filteredTableContents = activeContents
    .filter((item) => {
      if (selectedProgramFilter === "CPNS") {
        return item.program?.code === "CPNS";
      }
      if (selectedProgramFilter === "SEKDIN") {
        return item.program?.code === "SEKDIN";
      }
      if (selectedProgramFilter === "POLRI") {
        return (
          item.program?.code === "POLRI" || item.program?.code === "GENERAL"
        );
      }
      return true;
    })
    .filter((item) => {
      if (!filterBySelectedDay) return true;
      if (!item.scheduled_at) return false;
      const dayNum = new Date(item.scheduled_at).getDate();
      return dayNum === selectedDay;
    })
    .sort((a, b) =>
      (a.scheduled_at || "9999").localeCompare(b.scheduled_at || "9999")
    );

  const displayedContents = filteredTableContents.slice(0, 8);

  const formatShortDate = (iso: string | null | undefined) => {
    if (!iso) return "Belum dijadwal";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  // October 2026 Calendar Grid (Sun - Sat)
  const calendarCells: { day: number; currentMonth: boolean }[] = [
    { day: 27, currentMonth: false },
    { day: 28, currentMonth: false },
    { day: 29, currentMonth: false },
    { day: 30, currentMonth: false },
    ...Array.from({ length: 31 }, (_, idx) => ({
      day: idx + 1,
      currentMonth: true,
    })),
  ];

  const scheduledDaysSet = new Set(
    scheduledContents.map((c) => new Date(c.scheduled_at as string).getDate())
  );

  // Weekly schedule fulfillment (October 2026 Mon-Fri weeks)
  const weeklyRanges = [
    {
      id: 1,
      title: "Minggu 1",
      rangeLabel: "5 – 9 Okt 2026",
      startDay: 5,
      endDay: 9,
    },
    {
      id: 2,
      title: "Minggu 2",
      rangeLabel: "12 – 16 Okt 2026",
      startDay: 12,
      endDay: 16,
    },
    {
      id: 3,
      title: "Minggu 3",
      rangeLabel: "19 – 23 Okt 2026",
      startDay: 19,
      endDay: 23,
    },
    {
      id: 4,
      title: "Minggu 4",
      rangeLabel: "26 – 30 Okt 2026",
      startDay: 26,
      endDay: 30,
    },
  ];

  const territoryCards = [
    {
      key: "CPNS" as const,
      title: "Wilayah CPNS",
      subtitle: "SKD: TWK, TIU, TKP & Info Formasi",
      icon: Landmark,
      total: cpnsItems.length,
      scheduled: cpnsItems.filter((c) => c.scheduled_at).length,
      accentBg: "bg-orange-50",
      accentText: "text-orange-600",
      accentBorder: "border-orange-200",
      activeRing: "ring-2 ring-orange-500 border-orange-400",
    },
    {
      key: "SEKDIN" as const,
      title: "Sekolah Kedinasan",
      subtitle: "STAN, IPDN, STIS, Poltekip & Sekdin",
      icon: GraduationCap,
      total: sekdinItems.length,
      scheduled: sekdinItems.filter((c) => c.scheduled_at).length,
      accentBg: "bg-[#F3F0FF]",
      accentText: "text-[#6D4AFF]",
      accentBorder: "border-[#DCD4FF]",
      activeRing: "ring-2 ring-[#6D4AFF] border-[#6D4AFF]",
    },
    {
      key: "POLRI" as const,
      title: "Wilayah Polri",
      subtitle: "Akpol, Bintara, Tamtama & Psikotes",
      icon: Shield,
      total: polriItems.length,
      scheduled: polriItems.filter((c) => c.scheduled_at).length,
      accentBg: "bg-blue-50",
      accentText: "text-blue-600",
      accentBorder: "border-blue-200",
      activeRing: "ring-2 ring-blue-500 border-blue-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* TOP WORKFLOW SHORTCUT BAR (3 LANGKAH SEDERHANA)                     */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs md:grid-cols-3">
        <Link
          href="/content"
          className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-[#6D4AFF]/40 hover:bg-[#F3F0FF]/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6D4AFF] text-white">
              <FilePlus2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                1. Input Ide Konten
              </p>
              <p className="text-[11px] text-slate-500">
                {activeContents.length} ide konten tersimpan
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-[#6D4AFF]" />
        </Link>

        <Link
          href="/production"
          className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-[#6D4AFF]/40 hover:bg-[#F3F0FF]/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Kanban className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                2. Production Board
              </p>
              <p className="text-[11px] text-slate-500">
                Atur jadwal Drag & Drop Senin–Jumat
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-[#6D4AFF]" />
        </Link>

        <Link
          href="/calendar"
          className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-[#6D4AFF]/40 hover:bg-[#F3F0FF]/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                3. Schedule Post
              </p>
              <p className="text-[11px] text-slate-500">
                {scheduledContents.length} konten terjadwal tayang
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-emerald-600" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* ================================================================= */}
        {/* LEFT / CENTER MAIN COLUMN                                         */}
        {/* ================================================================= */}
        <div className="space-y-6 xl:col-span-8">
          {/* SECTION 1: 3 WILAYAH KONTEN CARDS */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Ringkasan Wilayah Konten
                </h2>
                <p className="text-xs text-slate-500">
                  Klik salah satu wilayah untuk menyaring daftar jadwal di bawah
                </p>
              </div>
              <Link
                href="/content"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D4AFF] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#5B38E8]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Konten</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {territoryCards.map((card) => {
                const Icon = card.icon;
                const isSelected = selectedProgramFilter === card.key;
                const pct =
                  card.total > 0
                    ? Math.round((card.scheduled / card.total) * 100)
                    : 0;

                return (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => {
                      setFilterBySelectedDay(false);
                      setSelectedProgramFilter((prev) =>
                        prev === card.key ? "ALL" : card.key
                      );
                    }}
                    className={`flex flex-col justify-between rounded-2xl border bg-white p-4 text-left transition-all hover:shadow-md ${
                      isSelected
                        ? card.activeRing
                        : "border-slate-200/80 shadow-2xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.accentBg} ${card.accentText} ${card.accentBorder}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {card.total} Konten
                        </span>
                      </div>

                      <h3 className="mt-3.5 text-sm font-bold text-slate-900">
                        {card.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>Terjadwal Tayang</span>
                        <span>
                          {card.scheduled}/{card.total} ({pct}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#6D4AFF] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: DISTRIBUSI WARNA CARD REELS, CAROUSEL & SINGLE POST */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-[#DCD4FF] bg-[#F3F0FF]/70 p-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#6D4AFF]" />
                <span className="truncate text-[11px] font-bold text-slate-700">
                  Talent Model
                </span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-[#6D4AFF]">
                {talentModelCount}{" "}
                <span className="text-[11px] font-medium text-slate-500">
                  Reel
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                <span className="truncate text-[11px] font-bold text-slate-700">
                  Mentor
                </span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-blue-600">
                {mentorCount}{" "}
                <span className="text-[11px] font-medium text-slate-500">
                  Reel
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
                <span className="truncate text-[11px] font-bold text-slate-700">
                  Siswa
                </span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-orange-600">
                {siswaCount}{" "}
                <span className="text-[11px] font-medium text-slate-500">
                  Reel
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" />
                <span className="truncate text-[11px] font-bold text-slate-700">
                  Carousel
                </span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-emerald-700">
                {carouselCount}{" "}
                <span className="text-[11px] font-medium text-slate-500">
                  Feed
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-pink-200 bg-pink-50/70 p-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-pink-600" />
                <span className="truncate text-[11px] font-bold text-slate-700">
                  Single Post
                </span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-pink-600">
                {singlePostCount}{" "}
                <span className="text-[11px] font-medium text-slate-500">
                  Feed
                </span>
              </p>
            </div>
          </div>

          {/* SECTION 3: JADWAL KONTEN TABLE */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-slate-900">
                  Daftar Jadwal Konten
                </h2>
                {(selectedProgramFilter !== "ALL" || filterBySelectedDay) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProgramFilter("ALL");
                      setFilterBySelectedDay(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    <span>Reset Filter</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <Link
                href="/calendar"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#6D4AFF] hover:underline"
              >
                <span>Buka Kalender Schedule Post</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-3">Judul Konten</th>
                    <th className="pb-3 px-3">Jadwal Tayang</th>
                    <th className="pb-3 px-3">Format & Talent</th>
                    <th className="pb-3 pl-3">Pilar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedContents.map((item) => {
                    const isReel =
                      item.format_id === "fmt-reels" ||
                      (item.format?.name || "").toLowerCase().includes("reel");
                    const isCarousel =
                      item.format_id === "fmt-carousel" ||
                      (item.format?.name || "")
                        .toLowerCase()
                        .includes("carousel");

                    return (
                      <tr
                        key={item.id}
                        onClick={() => router.push(`/calendar`)}
                        className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                      >
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                isReel
                                  ? "bg-[#F3F0FF] text-[#6D4AFF]"
                                  : isCarousel
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-pink-50 text-pink-600"
                              }`}
                            >
                              {isReel ? (
                                <Video className="h-4 w-4" />
                              ) : isCarousel ? (
                                <Layers className="h-4 w-4" />
                              ) : (
                                <ImageIcon className="h-4 w-4" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-800 group-hover:text-[#6D4AFF]">
                                {item.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {item.program?.name} •{" "}
                                {item.platforms
                                  ?.map((p) => p.platform.code)
                                  .join(", ") || "IG, FB, TT"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-xs font-semibold text-slate-600">
                          {formatShortDate(item.scheduled_at)}
                        </td>

                        <td className="py-3 px-3 text-xs">
                          {isReel && item.talent_category ? (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                                item.talent_category === "Talent Model"
                                  ? "border-[#DCD4FF] bg-[#F3F0FF] text-[#6D4AFF]"
                                  : item.talent_category === "Mentor / Pengajar"
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : "border-orange-200 bg-orange-50 text-orange-700"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              <span>Reel • {item.talent_category}</span>
                            </span>
                          ) : isCarousel ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              <span>Carousel</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-pink-600" />
                              <span>Single Post</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 pl-3 text-xs font-medium text-slate-600">
                          {item.pillar?.name || "Edukatif"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {displayedContents.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                  <p className="text-xs font-medium text-slate-400">
                    Tidak ada jadwal konten pada filter yang dipilih.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterBySelectedDay(false);
                      setSelectedProgramFilter("ALL");
                    }}
                    className="mt-2 text-xs font-semibold text-[#6D4AFF] hover:underline"
                  >
                    Tampilkan semua jadwal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: MINI CALENDAR & WEEKLY SCHEDULE PROGRESS            */}
        {/* ================================================================= */}
        <div className="space-y-6 xl:col-span-4">
          {/* 1. MINI CALENDAR (Oktober 2026) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Kalender Oktober 2026
                </h3>
                <p className="text-[11px] text-slate-400">
                  Klik tanggal untuk melihat konten terjadwal
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay((d) => (d > 1 ? d - 1 : 31));
                    setFilterBySelectedDay(true);
                  }}
                  className="rounded-lg border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                  aria-label="Hari sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay((d) => (d < 31 ? d + 1 : 1));
                    setFilterBySelectedDay(true);
                  }}
                  className="rounded-lg border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                  aria-label="Hari berikutnya"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400">
              <span className="py-1.5">Min</span>
              <span className="py-1.5">Sen</span>
              <span className="py-1.5">Sel</span>
              <span className="py-1.5">Rab</span>
              <span className="py-1.5">Kam</span>
              <span className="py-1.5">Jum</span>
              <span className="py-1.5">Sab</span>
            </div>

            <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-xs">
              {calendarCells.map((cell, index) => {
                const isSelected =
                  cell.currentMonth &&
                  cell.day === selectedDay &&
                  filterBySelectedDay;
                const hasScheduled =
                  cell.currentMonth && scheduledDaysSet.has(cell.day);

                return (
                  <div
                    key={`${cell.currentMonth ? "cur" : "prev"}-${cell.day}-${index}`}
                    className="flex items-center justify-center py-0.5"
                  >
                    <button
                      type="button"
                      disabled={!cell.currentMonth}
                      onClick={() => {
                        if (!cell.currentMonth) return;
                        if (selectedDay === cell.day && filterBySelectedDay) {
                          setFilterBySelectedDay(false);
                        } else {
                          setSelectedDay(cell.day);
                          setFilterBySelectedDay(true);
                        }
                      }}
                      className={`relative flex h-8 w-8 flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        !cell.currentMonth
                          ? "cursor-default text-slate-300"
                          : isSelected
                          ? "bg-[#6D4AFF] text-white shadow-xs"
                          : hasScheduled
                          ? "bg-[#F3F0FF] font-bold text-[#6D4AFF] hover:bg-[#E4DEFF]"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{cell.day}</span>
                      {hasScheduled && !isSelected && (
                        <span className="mt-0.5 h-1 w-1 rounded-full bg-[#6D4AFF]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. PROGRES JADWAL MINGGUAN (MINGGU 1 - 4) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Keterisian Jadwal Mingguan
                </h2>
                <p className="text-[11px] text-slate-400">
                  Target 5 hari tayang per minggu (Senin–Jumat)
                </p>
              </div>
              <Link
                href="/production"
                className="text-xs font-semibold text-[#6D4AFF] hover:underline"
              >
                Atur
              </Link>
            </div>

            <div className="space-y-3">
              {weeklyRanges.map((wk) => {
                const filledCount = scheduledContents.filter((c) => {
                  const d = new Date(c.scheduled_at as string);
                  return (
                    d.getMonth() === 9 &&
                    d.getDate() >= wk.startDay &&
                    d.getDate() <= wk.endDay
                  );
                }).length;
                const pct = Math.min(100, Math.round((filledCount / 5) * 100));

                return (
                  <Link
                    key={wk.id}
                    href="/production"
                    className="block rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-[#6D4AFF]/40 hover:bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {wk.title} • {wk.rangeLabel}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {filledCount} dari 5 slot hari terisi
                        </p>
                      </div>
                      <span
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${
                          pct === 100
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#F3F0FF] text-[#6D4AFF]"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>

                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct === 100 ? "bg-emerald-500" : "bg-[#6D4AFF]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
