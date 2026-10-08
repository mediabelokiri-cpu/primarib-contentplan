"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GripVertical,
  CalendarDays,
  Trash2,
  X,
  Plus,
  Check,
  Video,
  Image as ImageIcon,
  Layers,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  useAppStore,
  scheduleContentAction,
  unscheduleContentAction,
  clearAllScheduledCalendarAction,
  deleteContentPermanentlyAction,
} from "@/lib/store";
import { ContentWithRelations } from "@/types/database";

interface CalendarDayCell {
  dateIso: string; // YYYY-MM-DD
  dayNumber: number;
  monthLabel: string;
  weekdayIndex: number; // 1=Senin ... 5=Jumat
  weekdayName: string;
  ruleLabel: string;
  isReelDay: boolean;
}

// Generate 4 weeks of Monday–Friday for a given year & month (0-indexed)
function buildMonFriCalendarWeeks(
  year: number,
  month: number
): CalendarDayCell[][] {
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
    1: {
      name: "Senin",
      rule: "Feed (Single Post / Carousel)",
      isReel: false,
    },
    2: { name: "Selasa", rule: "Reel", isReel: true },
    3: {
      name: "Rabu",
      rule: "Feed (Single Post / Carousel)",
      isReel: false,
    },
    4: { name: "Kamis", rule: "Reel", isReel: true },
    5: {
      name: "Jumat",
      rule: "Feed (Single Post / Carousel)",
      isReel: false,
    },
  };

  // Find the first Monday on or after the 1st of the month (or leading week)
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon...
  let firstMondayDate = 1;
  if (dayOfWeek === 0) {
    firstMondayDate = 2;
  } else if (dayOfWeek > 1) {
    firstMondayDate = 1 + (8 - dayOfWeek);
  }

  const weeks: CalendarDayCell[][] = [];
  for (let w = 0; w < 4; w++) {
    const weekRow: CalendarDayCell[] = [];
    for (let d = 0; d < 5; d++) {
      const dateObj = new Date(year, month, firstMondayDate + w * 7 + d);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const wIdx = d + 1;
      const meta = weekdayMeta[wIdx];

      weekRow.push({
        dateIso: `${yyyy}-${mm}-${dd}`,
        dayNumber: dateObj.getDate(),
        monthLabel: monthNames[dateObj.getMonth()],
        weekdayIndex: wIdx,
        weekdayName: meta.name,
        ruleLabel: meta.rule,
        isReelDay: meta.isReel,
      });
    }
    weeks.push(weekRow);
  }

  return weeks;
}

export default function ProductionBoardPage() {
  const { state, enrichedContents } = useAppStore();

  // Default to October 2026 (where our 20 seed items are scheduled)
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(9); // 9 = October

  const [draggedContentId, setDraggedContentId] = useState<string | null>(null);
  const [dragOverDateIso, setDragOverDateIso] = useState<string | null>(null);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);

  const [filterProgram, setFilterProgram] = useState("ALL");
  const [filterQueueMode, setFilterQueueMode] = useState<"UNSCHEDULED" | "ALL">(
    "UNSCHEDULED"
  );
  const [confirmClearCalendar, setConfirmClearCalendar] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const activeContents = enrichedContents.filter(
    (c) => c.status !== "ARCHIVED"
  );

  // Queue items on the left panel
  const queueContents = activeContents.filter((c) => {
    if (filterQueueMode === "UNSCHEDULED" && c.scheduled_at) return false;
    if (filterProgram !== "ALL" && c.program_id !== filterProgram) return false;
    return true;
  });

  const weeks = buildMonFriCalendarWeeks(viewYear, viewMonth);

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

  const handleDropOnCell = (cell: CalendarDayCell, contentId?: string) => {
    const targetId = contentId || draggedContentId || selectedQueueId;
    if (!targetId) return;

    const scheduledIso = `${cell.dateIso}T19:00:00+08:00`;
    scheduleContentAction({
      contentId: targetId,
      scheduledAt: scheduledIso,
    });

    const item = activeContents.find((c) => c.id === targetId);
    setDraggedContentId(null);
    setDragOverDateIso(null);
    setSelectedQueueId(null);

    if (item) {
      showToast(
        `"${item.short_title || item.title}" dijadwalkan ke ${cell.weekdayName}, ${cell.dayNumber} ${cell.monthLabel}!`
      );
    }
  };

  const handleUnscheduleCard = (item: ContentWithRelations) => {
    unscheduleContentAction(item.id);
    showToast(
      `"${item.short_title || item.title}" dicopot dari kalender (Schedule Post otomatis diperbarui).`
    );
  };

  const handleDeleteCardPermanently = (item: ContentWithRelations) => {
    deleteContentPermanentlyAction(item.id);
    showToast(`"${item.short_title || item.title}" dihapus permanen.`);
  };

  // Distinct Card Color Coding for Reels (Talent Model, Mentor / Pengajar, Siswa), Carousel, and Single Post
  const getCalendarCardColor = (item: ContentWithRelations) => {
    const fmtLower = (item.format?.name || "").toLowerCase();
    const isReel = item.format_id === "fmt-reels" || fmtLower.includes("reel");
    const isCarousel =
      item.format_id === "fmt-carousel" ||
      fmtLower.includes("carousel") ||
      fmtLower.includes("karusel");

    if (isReel) {
      if (item.talent_category === "Talent Model") {
        return {
          card: "border-[#7E60FF] bg-[#ECE7FF] text-slate-900 shadow-[0_4px_12px_rgba(126,96,255,0.14)]",
          badge: "bg-[#7E60FF] text-white",
          label: "Reel • Talent Model",
        };
      }
      if (item.talent_category === "Siswa") {
        return {
          card: "border-[#F97316] bg-[#FFF0E5] text-slate-900 shadow-[0_4px_12px_rgba(249,115,22,0.14)]",
          badge: "bg-[#F97316] text-white",
          label: "Reel • Siswa",
        };
      }
      // Default Reel: Mentor / Pengajar
      return {
        card: "border-[#2B7FFF] bg-[#E5F3FF] text-slate-900 shadow-[0_4px_12px_rgba(43,127,255,0.14)]",
        badge: "bg-[#2B7FFF] text-white",
        label: `Reel • ${item.talent_category || "Mentor / Pengajar"}`,
      };
    }

    if (isCarousel) {
      return {
        card: "border-emerald-400 bg-emerald-50 text-slate-900 shadow-[0_4px_12px_rgba(16,185,129,0.12)]",
        badge: "bg-emerald-600 text-white",
        label: "Carousel",
      };
    }

    // Single Post
    return {
      card: "border-pink-400 bg-pink-50 text-slate-900 shadow-[0_4px_12px_rgba(219,39,119,0.12)]",
      badge: "bg-pink-600 text-white",
      label: "Single Post",
    };
  };

  const scheduledTotal = activeContents.filter((c) => c.scheduled_at).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Color Legend */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            2. Production Board — Drag & Drop Jadwal Kalender (Senin–Jumat)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Tarik (Drag) kartu konten dari daftar di kiri ke kotak tanggal kalender. Hasil di tabel ini otomatis tampil di menu{" "}
            <strong className="text-[#6D4AFF]">Schedule Post</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {scheduledTotal > 0 && (
            <>
              {!confirmClearCalendar ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearCalendar(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Kosongkan Semua Card Kalender</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5">
                  <span className="text-xs font-bold text-rose-700">
                    Copot semua jadwal?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearAllScheduledCalendarAction();
                      setConfirmClearCalendar(false);
                      showToast(
                        "Semua card di kalender berhasil dikosongkan!"
                      );
                    }}
                    className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
                  >
                    Ya, Kosongkan
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearCalendar(false)}
                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600"
                  >
                    Batal
                  </button>
                </div>
              )}
            </>
          )}

          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6D4AFF] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#5B38E8]"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Lihat Hasil Schedule Post</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Color Legend for Reels Talent Categories, Carousel, and Single Post */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3.5 text-xs">
          <span className="font-bold text-slate-700">
            Keterangan Warna Card:
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="h-3.5 w-3.5 rounded-md border border-[#7E60FF] bg-[#ECE7FF]" />
            <span>Reel: Talent Model (Ungu)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="h-3.5 w-3.5 rounded-md border border-[#2B7FFF] bg-[#E5F3FF]" />
            <span>Reel: Mentor / Pengajar (Biru)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="h-3.5 w-3.5 rounded-md border border-[#F97316] bg-[#FFF0E5]" />
            <span>Reel: Siswa (Oranye)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="h-3.5 w-3.5 rounded-md border border-emerald-400 bg-emerald-50" />
            <span>Carousel (Hijau)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="h-3.5 w-3.5 rounded-md border border-pink-400 bg-pink-50" />
            <span>Single Post (Pink)</span>
          </span>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[125px] text-center text-xs font-extrabold text-slate-800">
            {monthFullNames[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MAIN WORKSPACE: LEFT QUEUE + RIGHT CALENDAR TABLE (SENIN - JUMAT)   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* LEFT PANEL: DAFTAR KONTEN SIAP DRAG & DROP */}
        <div className="xl:col-span-3">
          <div className="sticky top-6 rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Ide Konten
                </h3>
                <p className="text-[11px] text-slate-400">
                  Tarik kartu ke kalender di kanan
                </p>
              </div>
              <Link
                href="/content"
                className="inline-flex items-center gap-1 rounded-xl bg-[#ECE7FF] px-2.5 py-1.5 text-[11px] font-bold text-[#7E60FF] hover:bg-[#7E60FF] hover:text-white"
              >
                <Plus className="h-3 w-3" />
                <span>Input</span>
              </Link>
            </div>

            {/* Filter Queue */}
            <div className="mb-3 space-y-2">
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setFilterQueueMode("UNSCHEDULED")}
                  className={`rounded-lg py-1.5 text-[11px] font-bold transition ${
                    filterQueueMode === "UNSCHEDULED"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Belum Jadwal (
                  {activeContents.filter((c) => !c.scheduled_at).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterQueueMode("ALL")}
                  className={`rounded-lg py-1.5 text-[11px] font-bold transition ${
                    filterQueueMode === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Semua ({activeContents.length})
                </button>
              </div>

              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#7E60FF] focus:outline-none"
              >
                <option value="ALL">Semua Wilayah</option>
                {state.programs
                  .filter((p) => p.is_active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Draggable Content Cards */}
            <div className="max-h-[65vh] space-y-2.5 overflow-y-auto pr-1">
              {queueContents.map((item) => {
                const colorMeta = getCalendarCardColor(item);
                const isSelected = selectedQueueId === item.id;
                const isReel =
                  item.format_id === "fmt-reels" ||
                  (item.format?.name || "").toLowerCase().includes("reel");

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedContentId(item.id);
                      e.dataTransfer.setData("text/plain", item.id);
                    }}
                    onDragEnd={() => {
                      setDraggedContentId(null);
                      setDragOverDateIso(null);
                    }}
                    onClick={() =>
                      setSelectedQueueId((prev) =>
                        prev === item.id ? null : item.id
                      )
                    }
                    className={`group cursor-grab active:cursor-grabbing rounded-2xl border p-3 transition-all ${
                      colorMeta.card
                    } ${
                      isSelected
                        ? "ring-2 ring-[#7E60FF] ring-offset-1"
                        : "hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${colorMeta.badge}`}
                        >
                          {isReel ? (
                            <Video className="h-2.5 w-2.5" />
                          ) : item.format_id === "fmt-carousel" ? (
                            <Layers className="h-2.5 w-2.5" />
                          ) : (
                            <ImageIcon className="h-2.5 w-2.5" />
                          )}
                          <span>{colorMeta.label}</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCardPermanently(item);
                        }}
                        className="rounded-lg p-1 text-slate-400 opacity-70 transition hover:bg-rose-100 hover:text-rose-600 group-hover:opacity-100"
                        title="Hapus permanen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="mt-2 text-xs font-bold leading-snug text-slate-800">
                      {item.title}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[10px] font-semibold text-slate-600">
                      <span>
                        {item.program?.name} • {item.pillar?.name}
                      </span>
                      {item.scheduled_at && (
                        <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                          {new Date(item.scheduled_at).toLocaleDateString(
                            "id-ID",
                            { day: "2-digit", month: "short" }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {queueContents.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-xs font-semibold text-slate-400">
                    {filterQueueMode === "UNSCHEDULED"
                      ? "Semua konten sudah masuk ke tabel kalender!"
                      : "Belum ada konten yang diinput."}
                  </p>
                  {filterQueueMode === "UNSCHEDULED" &&
                    activeContents.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilterQueueMode("ALL")}
                        className="mt-2 text-[11px] font-bold text-[#7E60FF] hover:underline"
                      >
                        Lihat semua konten ({activeContents.length})
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: TABEL KALENDER SENIN – JUMAT (DROP TARGETS) */}
        <div className="xl:col-span-9">
          <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-5">
            <table className="w-full min-w-[780px] table-fixed border-collapse">
              <thead>
                <tr>
                  {[
                    {
                      day: "SENIN",
                      rule: "Feed (Single Post / Carousel)",
                      isReel: false,
                    },
                    {
                      day: "SELASA",
                      rule: "Reel (Talent / Mentor / Siswa)",
                      isReel: true,
                    },
                    {
                      day: "RABU",
                      rule: "Feed (Single Post / Carousel)",
                      isReel: false,
                    },
                    {
                      day: "KAMIS",
                      rule: "Reel (Talent / Mentor / Siswa)",
                      isReel: true,
                    },
                    {
                      day: "JUMAT",
                      rule: "Feed (Single Post / Carousel)",
                      isReel: false,
                    },
                  ].map((col) => (
                    <th
                      key={col.day}
                      className="w-1/5 border border-slate-100 bg-slate-50/90 p-3 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold tracking-wide text-slate-800">
                          {col.day}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            col.isReel
                              ? "bg-[#ECE7FF] text-[#7E60FF]"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {col.isReel ? "REEL" : "FEED"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                        {col.rule}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {weeks.map((week, wIdx) => (
                  <tr key={`week-${wIdx}`}>
                    {week.map((cell) => {
                      const cellContents = activeContents.filter(
                        (c) =>
                          c.scheduled_at &&
                          c.scheduled_at.slice(0, 10) === cell.dateIso
                      );
                      const isDragOver = dragOverDateIso === cell.dateIso;

                      return (
                        <td
                          key={cell.dateIso}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverDateIso !== cell.dateIso) {
                              setDragOverDateIso(cell.dateIso);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverDateIso === cell.dateIso) {
                              setDragOverDateIso(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const transferredId =
                              e.dataTransfer.getData("text/plain");
                            handleDropOnCell(cell, transferredId);
                          }}
                          onClick={() => {
                            if (selectedQueueId) {
                              handleDropOnCell(cell, selectedQueueId);
                            }
                          }}
                          className={`min-h-[160px] align-top border border-slate-100 p-2.5 transition-all ${
                            isDragOver
                              ? "bg-[#ECE7FF]/70 ring-2 ring-inset ring-[#7E60FF]"
                              : cell.isReelDay
                              ? "bg-[#FAF9FF]"
                              : "bg-white"
                          }`}
                        >
                          {/* Date Cell Header */}
                          <div className="mb-2 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-700">
                              <span>{cell.dayNumber}</span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {cell.monthLabel}
                              </span>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-300">
                              Minggu {wIdx + 1}
                            </span>
                          </div>

                          {/* Dropped Cards Inside This Date Cell */}
                          <div className="space-y-2">
                            {cellContents.map((item) => {
                              const colorMeta = getCalendarCardColor(item);

                              return (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => {
                                    setDraggedContentId(item.id);
                                    e.dataTransfer.setData(
                                      "text/plain",
                                      item.id
                                    );
                                  }}
                                  onDragEnd={() => {
                                    setDraggedContentId(null);
                                    setDragOverDateIso(null);
                                  }}
                                  className={`group relative cursor-grab active:cursor-grabbing rounded-2xl border p-2.5 transition-all ${colorMeta.card}`}
                                >
                                  {/* Top Row: Badge + Remove/Delete Card Buttons */}
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={`truncate rounded-md px-1.5 py-0.5 text-[9px] font-extrabold ${colorMeta.badge}`}
                                    >
                                      {colorMeta.label}
                                    </span>

                                    <div className="flex items-center gap-0.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUnscheduleCard(item);
                                        }}
                                        className="rounded-md bg-white/80 p-1 text-rose-600 shadow-2xs transition hover:bg-rose-600 hover:text-white"
                                        title="Hapus / Copot Card dari Tanggal Kalender ini"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Content Title */}
                                  <p className="mt-1.5 text-[11px] font-bold leading-snug text-slate-900">
                                    {item.title}
                                  </p>

                                  {/* Wilayah & Pilar */}
                                  <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[10px] font-semibold text-slate-600">
                                    <span>{item.program?.code || "CPNS"}</span>
                                    <span>•</span>
                                    <span className="truncate">
                                      {item.pillar?.name}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Empty Slot Drop Hint */}
                            {cellContents.length === 0 && (
                              <div className="flex h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 p-2 text-center">
                                <p className="text-[10px] font-semibold text-slate-300">
                                  Drop {cell.isReelDay ? "Reel" : "Feed"} di sini
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
