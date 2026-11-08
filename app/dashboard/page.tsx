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

const MONTH_FULL_NAMES = [
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

const MONTH_SHORT_NAMES = [
  "Okt",
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

export default function DashboardPage() {
  const router = useRouter();
  const { enrichedContents } = useAppStore();

  const now = new Date();
  const [viewYear, setViewYear] = useState<number>(() => now.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => now.getMonth());

  // Interactive filter states
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<
    "ALL" | "CPNS" | "SEKDIN" | "POLRI"
  >("ALL");
  const [selectedDay, setSelectedDay] = useState<number>(() => now.getDate());
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
      const d = new Date(item.scheduled_at);
      return (
        d.getFullYear() === viewYear &&
        d.getMonth() === viewMonth &&
        d.getDate() === selectedDay
      );
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

  // Dynamic Calendar Grid (Sun - Sat) for viewYear and viewMonth
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const prevMonthTotalDays = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells: { day: number; currentMonth: boolean }[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({ day: prevMonthTotalDays - i, currentMonth: false });
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarCells.push({ day: d, currentMonth: true });
  }
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    calendarCells.push({ day: d, currentMonth: false });
  }

  const scheduledDaysSet = new Set(
    scheduledContents
      .filter((c) => {
        if (!c.scheduled_at) return false;
        const d = new Date(c.scheduled_at);
        return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
      })
      .map((c) => new Date(c.scheduled_at as string).getDate())
  );

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setFilterBySelectedDay(false);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setFilterBySelectedDay(false);
  };

  // Weekly schedule fulfillment (Dynamic Mon-Fri weeks for viewMonth)
  const shortMonthName = MONTH_SHORT_NAMES[viewMonth + 1] || "Bln";
  const weeklyRanges = (() => {
    const list: {
      id: number;
      title: string;
      rangeLabel: string;
      startDay: number;
      endDay: number;
    }[] = [];
    let weekIndex = 1;
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayOfWeek = new Date(viewYear, viewMonth, day).getDay();
      if (dayOfWeek === 1 || (day === 1 && dayOfWeek >= 1 && dayOfWeek <= 5)) {
        const startDay = day;
        const daysToFriday = dayOfWeek === 1 ? 4 : Math.max(0, 5 - dayOfWeek);
        const endDay = Math.min(totalDaysInMonth, day + daysToFriday);
        list.push({
          id: weekIndex,
          title: `Minggu ${weekIndex}`,
          rangeLabel: `${startDay} – ${endDay} ${shortMonthName} ${viewYear}`,
          startDay,
          endDay,
        });
        weekIndex++;
        day = endDay;
      }
    }
    return list.slice(0, 5);
  })();

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
      accentBg: "bg-blue-50/80",
      accentText: "text-[#284078]",
      accentBorder: "border-blue-200",
      activeRing: "ring-2 ring-[#284078] border-[#284078]",
    },
    {
      key: "POLRI" as const,
      title: "Wilayah Polri",
      subtitle: "Akpol, Bintara, Tamtama & Psikotes",
      icon: Shield,
      total: polriItems.length,
      scheduled: polriItems.filter((c) => c.scheduled_at).length,
      accentBg: "bg-sky-50",
      accentText: "text-sky-600",
      accentBorder: "border-sky-200",
      activeRing: "ring-2 ring-sky-500 border-sky-400",
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
          className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-[#284078]/40 hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#284078] text-white">
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
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-[#284078]" />
        </Link>

        <Link
          href="/production"
          className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-[#284078]/40 hover:bg-slate-50"
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
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-[#284078]" />
        </Link>

        <Link
          href="/calendar"
          className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-[#284078]/40 hover:bg-slate-50"
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#284078] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1e305a]"
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
                          className="h-full rounded-full bg-[#284078] transition-all"
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
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#284078]" />
                <span className="truncate text-[11px] font-bold text-slate-700">
                  Talent Model
                </span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-[#284078]">
                {talentModelCount}{" "}
                <span className="text-[11px] font-medium text-slate-500">
                  Reel
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-700" />
                <span className="truncate text-[11px] font-bold text-slate-700">
                  Mentor
                </span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold text-slate-800">
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
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#284078] hover:underline"
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
                                  ? "bg-blue-50 text-[#284078]"
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
                              <p className="truncate text-xs font-bold text-slate-800 group-hover:text-[#284078]">
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
                          {isReel ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#284078]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#284078]" />
                              <span>{item.talent_category || "Reel"}</span>
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
                    className="mt-2 text-xs font-semibold text-[#284078] hover:underline"
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
          {/* 1. MINI CALENDAR (DYNAMIC MONTH & YEAR) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Kalender {MONTH_FULL_NAMES[viewMonth]} {viewYear}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Klik tanggal untuk melihat konten terjadwal
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-lg border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                  aria-label="Bulan sebelumnya"
                  title="Bulan sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-lg border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                  aria-label="Bulan berikutnya"
                  title="Bulan berikutnya"
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
                    key={`${cell.currentMonth ? "cur" : "out"}-${cell.day}-${index}`}
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
                          ? "bg-[#284078] text-white shadow-xs"
                          : hasScheduled
                          ? "bg-blue-50 font-bold text-[#284078] hover:bg-blue-100"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{cell.day}</span>
                      {hasScheduled && !isSelected && (
                        <span className="mt-0.5 h-1 w-1 rounded-full bg-[#284078]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. PROGRES JADWAL MINGGUAN (DYNAMIC WEEKS) */}
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
                className="text-xs font-semibold text-[#284078] hover:underline"
              >
                Atur
              </Link>
            </div>

            <div className="space-y-3">
              {weeklyRanges.map((wk) => {
                const filledCount = scheduledContents.filter((c) => {
                  const d = new Date(c.scheduled_at as string);
                  return (
                    d.getFullYear() === viewYear &&
                    d.getMonth() === viewMonth &&
                    d.getDate() >= wk.startDay &&
                    d.getDate() <= wk.endDay
                  );
                }).length;
                const pct = Math.min(100, Math.round((filledCount / 5) * 100));

                return (
                  <Link
                    key={wk.id}
                    href="/production"
                    className="block rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-[#284078]/40 hover:bg-white"
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
                            : "bg-blue-50 text-[#284078]"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>

                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct === 100 ? "bg-emerald-500" : "bg-[#284078]"
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
