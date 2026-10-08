"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Kanban,
  Video,
  Image as ImageIcon,
  Layers,
  X,
  Calendar,
  Printer,
  Copy,
  Share2,
  Check,
  ExternalLink,
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
    2: { name: "Selasa", rule: "Reel", isReel: true },
    3: { name: "Rabu", rule: "Feed (Single Post / Carousel)", isReel: false },
    4: { name: "Kamis", rule: "Reel", isReel: true },
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

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function SchedulePostCalendarPage() {
  const { state, enrichedContents } = useAppStore();

  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(9); // October 2026

  const [filterTalent, setFilterTalent] = useState<string>("ALL");
  const [filterProgram, setFilterProgram] = useState<string>("ALL");
  const [selectedContent, setSelectedContent] =
    useState<ContentWithRelations | null>(null);

  // WhatsApp Share Modal States
  const [showWaModal, setShowWaModal] = useState(false);
  const [waWeekFilter, setWaWeekFilter] = useState<number | "ALL">("ALL");
  const [waIncludeScript, setWaIncludeScript] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

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

  // Helper to resolve Reel talent category consistently (so cards with empty/default talent match "Mentor / Pengajar")
  const resolveReelTalent = (
    c: ContentWithRelations
  ): "Talent Model" | "Mentor / Pengajar" | "Siswa" => {
    const raw = (c.talent_category || "").trim().toLowerCase();
    if (raw.includes("model") || raw === "talent") return "Talent Model";
    if (raw.includes("siswa")) return "Siswa";
    return "Mentor / Pengajar";
  };

  // Only show scheduled contents (results from Production Board)
  const scheduledContents = enrichedContents.filter(
    (c) => c.status !== "ARCHIVED" && Boolean(c.scheduled_at)
  );

  const programFilteredScheduled = scheduledContents.filter(
    (c) => filterProgram === "ALL" || c.program_id === filterProgram
  );

  // Category counts for the filter bar
  const countTalentModel = programFilteredScheduled.filter((c) => {
    const isReel =
      c.format_id === "fmt-reels" ||
      (c.format?.name || "").toLowerCase().includes("reel");
    return isReel && resolveReelTalent(c) === "Talent Model";
  }).length;

  const countMentor = programFilteredScheduled.filter((c) => {
    const isReel =
      c.format_id === "fmt-reels" ||
      (c.format?.name || "").toLowerCase().includes("reel");
    return isReel && resolveReelTalent(c) === "Mentor / Pengajar";
  }).length;

  const countSiswa = programFilteredScheduled.filter((c) => {
    const isReel =
      c.format_id === "fmt-reels" ||
      (c.format?.name || "").toLowerCase().includes("reel");
    return isReel && resolveReelTalent(c) === "Siswa";
  }).length;

  const countCarousel = programFilteredScheduled.filter((c) => {
    const fmtLower = (c.format?.name || "").toLowerCase();
    return (
      c.format_id === "fmt-carousel" ||
      fmtLower.includes("carousel") ||
      fmtLower.includes("karusel")
    );
  }).length;

  const countSinglePost = programFilteredScheduled.filter((c) => {
    const fmtLower = (c.format?.name || "").toLowerCase();
    const isReel = c.format_id === "fmt-reels" || fmtLower.includes("reel");
    const isCarousel =
      c.format_id === "fmt-carousel" ||
      fmtLower.includes("carousel") ||
      fmtLower.includes("karusel");
    return !isReel && !isCarousel;
  }).length;

  const filteredScheduled = programFilteredScheduled
    .filter((c) => {
      const fmtLower = (c.format?.name || "").toLowerCase();
      const isReel = c.format_id === "fmt-reels" || fmtLower.includes("reel");
      const isCarousel =
        c.format_id === "fmt-carousel" ||
        fmtLower.includes("carousel") ||
        fmtLower.includes("karusel");

      if (filterTalent === "CAROUSEL_ONLY") {
        return isCarousel;
      }
      if (filterTalent === "SINGLE_ONLY") {
        return !isReel && !isCarousel;
      }
      if (filterTalent !== "ALL") {
        return isReel && resolveReelTalent(c) === filterTalent;
      }
      return true;
    })
    .sort((a, b) =>
      (a.scheduled_at || "").localeCompare(b.scheduled_at || "")
    );

  const weeks = buildScheduleWeeks(viewYear, viewMonth);

  // Distinct Table Color Style for Reels Talent Categories, Carousel, and Single Post
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
          box: "border-2 border-[#7E60FF] bg-[#ECE7FF] text-slate-900 shadow-[0_6px_16px_rgba(126,96,255,0.16)]",
          headerBadge: "bg-[#7E60FF] text-white",
          talentLabel: "Talent Model",
          printBg: "#ECE7FF",
          printBorder: "#7E60FF",
          printBadgeBg: "#7E60FF",
        };
      }
      if (resolvedTalent === "Siswa") {
        return {
          box: "border-2 border-[#F97316] bg-[#FFF0E5] text-slate-900 shadow-[0_6px_16px_rgba(249,115,22,0.15)]",
          headerBadge: "bg-[#F97316] text-white",
          talentLabel: "Siswa",
          printBg: "#FFF0E5",
          printBorder: "#F97316",
          printBadgeBg: "#F97316",
        };
      }
      return {
        box: "border-2 border-[#2B7FFF] bg-[#E5F3FF] text-slate-900 shadow-[0_6px_16px_rgba(43,127,255,0.15)]",
        headerBadge: "bg-[#2B7FFF] text-white",
        talentLabel: "Mentor / Pengajar",
        printBg: "#E5F3FF",
        printBorder: "#2B7FFF",
        printBadgeBg: "#2B7FFF",
      };
    }

    if (isCarousel) {
      return {
        box: "border-2 border-emerald-400 bg-emerald-50 text-slate-900 shadow-[0_6px_16px_rgba(16,185,129,0.12)]",
        headerBadge: "bg-emerald-600 text-white",
        talentLabel: "Carousel",
        printBg: "#ECFDF5",
        printBorder: "#10B981",
        printBadgeBg: "#059669",
      };
    }

    // Single Post
    return {
      box: "border-2 border-pink-400 bg-pink-50 text-slate-900 shadow-[0_6px_16px_rgba(219,39,119,0.12)]",
      headerBadge: "bg-pink-600 text-white",
      talentLabel: "Single Post",
      printBg: "#FDF2F8",
      printBorder: "#EC4899",
      printBadgeBg: "#DB2777",
    };
  };

  // =========================================================================
  // FITUR CARA 2A: FORMAT PESAN WHATSAPP (JADWAL + POIN SCRIPT / SLIDE)
  // =========================================================================
  const buildSingleItemWaText = (item: ContentWithRelations) => {
    const dateStr = item.scheduled_at
      ? new Date(item.scheduled_at).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Belum dijadwal";
    const isReel =
      item.format_id === "fmt-reels" ||
      (item.format?.name || "").toLowerCase().includes("reel");
    const bodyText = (item.script || item.main_content || "").trim();

    const lines = [
      `*JADWAL & BRIEF KONTEN PRIMA RIB*`,
      `📅 *Tanggal Tayang:* ${dateStr}`,
      `📌 *Judul:* ${item.title}`,
      `🎯 *Wilayah / Pilar:* ${item.program?.name || "CPNS"} • ${
        item.pillar?.name || "Edukatif"
      }`,
      `🎬 *Format:* ${item.format?.name || "Konten"}${
        isReel && item.talent_category
          ? ` (Talent: *${item.talent_category}*)`
          : ""
      }`,
      `📱 *Platform:* ${
        item.platforms?.map((p) => p.platform.name).join(", ") ||
        "Instagram, Facebook, TikTok"
      }`,
    ];

    if (bodyText) {
      lines.push(
        ``,
        isReel ? `*📝 SCRIPT POIN PER POIN:*` : `*📝 ISI MATERI / SLIDE:*`,
        bodyText
      );
    }

    if (item.caption) {
      lines.push(``, `*💬 CAPTION:*`, item.caption);
    }

    return lines.join("\n");
  };

  const buildBulkWhatsAppText = () => {
    const targetDatesSet =
      waWeekFilter === "ALL"
        ? new Set(weeks.flat().map((c) => c.dateIso))
        : new Set((weeks[waWeekFilter] || []).map((c) => c.dateIso));

    const itemsInScope = filteredScheduled.filter(
      (c) => c.scheduled_at && targetDatesSet.has(c.scheduled_at.slice(0, 10))
    );

    const filterLabel =
      filterTalent === "ALL"
        ? "Semua Kategori"
        : filterTalent === "CAROUSEL_ONLY"
        ? "Khusus Carousel"
        : filterTalent === "SINGLE_ONLY"
        ? "Khusus Single Post"
        : `Khusus Reel (${filterTalent})`;

    const weekLabel =
      waWeekFilter === "ALL"
        ? `${monthFullNames[viewMonth]} ${viewYear} (Minggu 1–4)`
        : `Minggu ${waWeekFilter + 1} (${monthFullNames[viewMonth]} ${viewYear})`;

    const headerLines = [
      `*📅 SCHEDULE POST & SCRIPT PRIMA RIB*`,
      `Periode: *${weekLabel}*`,
      `Filter: *${filterLabel}*`,
      `Total Konten: *${itemsInScope.length} jadwal*`,
      `----------------------------------------`,
    ];

    if (itemsInScope.length === 0) {
      headerLines.push(`Belum ada konten terjadwal pada filter ini.`);
      return headerLines.join("\n");
    }

    const itemBlocks = itemsInScope.map((item, idx) => {
      const dStr = item.scheduled_at
        ? new Date(item.scheduled_at).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })
        : "-";
      const isReel =
        item.format_id === "fmt-reels" ||
        (item.format?.name || "").toLowerCase().includes("reel");
      const roleTag =
        isReel && item.talent_category
          ? `Reel • Talent: *${item.talent_category}*`
          : `${item.format?.name || "Feed"}`;

      const block = [
        `*${idx + 1}. [${dStr}] ${item.title}*`,
        `   • Wilayah/Pilar: ${item.program?.name} (${item.pillar?.name})`,
        `   • Format: ${roleTag}`,
      ];

      const rawScript = (item.script || item.main_content || "").trim();
      if (waIncludeScript && rawScript) {
        const indentedScript = rawScript
          .split(/\r?\n/)
          .map((l) => `     ↳ ${l.trim()}`)
          .join("\n");
        block.push(`   • *Isi Script / Slide:*\n${indentedScript}`);
      }

      return block.join("\n");
    });

    return [...headerLines, ...itemBlocks].join("\n\n");
  };

  const handleCopyText = async (text: string, successLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successLabel);
    } catch {
      showToast("Gagal menyalin otomatis, silakan blok & copy manual.");
    }
  };

  // =========================================================================
  // FITUR CARA 2B: EXPORT / CETAK PDF KALENDER BERWARNA & LAMPIRAN SCRIPT
  // =========================================================================
  const handlePrintPdfSchedule = (options?: {
    singleItem?: ContentWithRelations;
    includeScriptPages?: boolean;
  }) => {
    const singleItem = options?.singleItem;
    const includeScriptPages = options?.includeScriptPages ?? true;

    const win = window.open("", "_blank", "width=1200,height=860");
    if (!win) {
      showToast("Izinkan pop-up di browser untuk membuka halaman cetak PDF.");
      return;
    }

    const filterLabel =
      filterTalent === "ALL"
        ? "Semua Konten (Reel & Feed)"
        : filterTalent === "CAROUSEL_ONLY"
        ? "Khusus Feed: Carousel"
        : filterTalent === "SINGLE_ONLY"
        ? "Khusus Feed: Single Post"
        : `Khusus Reel: ${filterTalent}`;

    if (singleItem) {
      const styleMeta = getScheduleBoxStyle(singleItem);
      const dateStr = singleItem.scheduled_at
        ? new Date(singleItem.scheduled_at).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "-";
      const lines = (singleItem.script || singleItem.main_content || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Brief Konten - ${escapeHtml(singleItem.title)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 12px; background: #fff; }
    .card { border: 2px solid ${styleMeta.printBorder}; background: ${styleMeta.printBg}; border-radius: 14px; padding: 20px; break-inside: avoid; page-break-inside: avoid; }
    .badge { display: inline-block; background: ${styleMeta.printBadgeBg}; color: #fff; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 6px; margin-right: 6px; }
    .meta { font-size: 12px; color: #475569; margin-top: 6px; font-weight: 600; }
    h1 { font-size: 18px; margin: 12px 0 4px; }
    .section { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-top: 14px; break-inside: avoid; }
    .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
    .point { border: 1px solid #e2e8f0; border-radius: 7px; padding: 8px 10px; margin-bottom: 6px; font-size: 12px; line-height: 1.45; background: #f8fafc; break-inside: avoid; }
  </style>
</head>
<body>
  <div class="card">
    <div>
      <span class="badge">${escapeHtml(styleMeta.talentLabel)}</span>
      <span class="badge" style="background:#334155">${escapeHtml(singleItem.program?.name || "CPNS")} • ${escapeHtml(singleItem.pillar?.name || "Edukatif")}</span>
    </div>
    <h1>${escapeHtml(singleItem.title)}</h1>
    <div class="meta">Jadwal Tayang: ${escapeHtml(dateStr)} | Platform: ${escapeHtml(
        singleItem.platforms?.map((p) => p.platform.name).join(", ") ||
          "IG, FB, TikTok"
      )}</div>
    <div class="section">
      <div class="section-title">Detail Poin Script / Isi Slide</div>
      ${
        lines.length > 0
          ? lines
              .map((line) => `<div class="point">${escapeHtml(line)}</div>`)
              .join("")
          : `<div class="point">-</div>`
      }
    </div>
    ${
      singleItem.caption
        ? `<div class="section"><div class="section-title">Caption & Hashtag</div><div style="font-size:12px;white-space:pre-line">${escapeHtml(
            singleItem.caption
          )}</div></div>`
        : ""
    }
  </div>
  <script>window.onload = () => { setTimeout(() => window.print(), 250); };</script>
</body>
</html>`);
      win.document.close();
      return;
    }

    // Build Full Calendar Table (Compact so Minggu 1 - Minggu 4 ALWAYS fits on Page 1)
    const calendarRowsHtml = weeks
      .map((week, wIdx) => {
        const tds = week
          .map((cell) => {
            const cellItems = filteredScheduled.filter(
              (c) =>
                c.scheduled_at && c.scheduled_at.slice(0, 10) === cell.dateIso
            );

            const cardsHtml =
              cellItems.length > 0
                ? cellItems
                    .map((item) => {
                      const st = getScheduleBoxStyle(item);
                      return `
                        <div class="cal-card" style="border:1.5px solid ${st.printBorder};background:${st.printBg};">
                          <div class="cal-card-top">
                            <span class="cal-badge" style="background:${st.printBadgeBg};">
                              ${escapeHtml(st.talentLabel)}
                            </span>
                            <span class="cal-prog">
                              ${escapeHtml(item.program?.code || "CPNS")}
                            </span>
                          </div>
                          <div class="cal-title">
                            ${escapeHtml(item.title)}
                          </div>
                          <div class="cal-meta">
                            ${escapeHtml(item.pillar?.name || "")} • ${escapeHtml(
                        item.platforms?.map((p) => p.platform.code).join("/") ||
                          "IG/FB/TT"
                      )}
                          </div>
                        </div>
                      `;
                    })
                    .join("")
                : `<div class="cal-empty">Kosong</div>`;

            return `
              <td style="background:${cell.isReelDay ? "#faf9ff" : "#ffffff"};">
                <div class="cell-head">
                  <strong>${cell.dayNumber} ${cell.monthLabel}</strong>
                  <span>Minggu ${wIdx + 1}</span>
                </div>
                ${cardsHtml}
              </td>
            `;
          })
          .join("");

        return `<tr class="cal-row">${tds}</tr>`;
      })
      .join("");

    const scriptCardsHtml = filteredScheduled
      .map((item, idx) => {
        const st = getScheduleBoxStyle(item);
        const dateStr = item.scheduled_at
          ? new Date(item.scheduled_at).toLocaleDateString("id-ID", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-";
        const scriptLines = (item.script || item.main_content || "")
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        return `
          <div class="script-card" style="border:1.5px solid ${st.printBorder};background:${st.printBg};">
            <div class="script-card-head">
              <div>
                <span class="script-badge" style="background:${st.printBadgeBg};">
                  ${escapeHtml(st.talentLabel)}
                </span>
                <span class="script-prog">${escapeHtml(item.program?.code || "CPNS")} • ${escapeHtml(item.pillar?.name || "")}</span>
              </div>
              <span class="script-date">${escapeHtml(dateStr)}</span>
            </div>
            <div class="script-title">${idx + 1}. ${escapeHtml(item.title)}</div>
            ${
              scriptLines.length > 0
                ? `<div class="script-lines">
                    ${scriptLines
                      .map(
                        (l) =>
                          `<div class="script-line">${escapeHtml(l)}</div>`
                      )
                      .join("")}
                   </div>`
                : ""
            }
          </div>
        `;
      })
      .join("");

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Schedule Post Prima RIB - ${monthFullNames[viewMonth]} ${viewYear}</title>
  <style>
    @page { size: A4 landscape; margin: 6mm 8mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #fff; }
    .calendar-sheet { width: 100%; break-inside: avoid; page-break-inside: avoid; }
    .top-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 6px; gap: 8px; }
    .top-title { font-size: 14px; font-weight: 800; margin: 0; letter-spacing: -0.01em; }
    .top-sub { font-size: 9.5px; color: #64748b; margin: 1px 0 0; font-weight: 600; }
    .legend { display: flex; gap: 8px; flex-wrap: wrap; font-size: 8.5px; font-weight: 700; align-items: center; }
    .legend-item { display: inline-flex; align-items: center; gap: 3.5px; background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; }
    .dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    thead { display: table-row-group; }
    tr, td, th { break-inside: avoid !important; page-break-inside: avoid !important; }
    th { border: 1px solid #cbd5e1; background: #f8fafc; padding: 5px 7px; text-align: left; font-size: 10px; font-weight: 800; }
    th .th-sub { font-size: 8px; font-weight: 500; color: #64748b; margin-top: 1px; }
    td { border: 1px solid #cbd5e1; vertical-align: top; padding: 5px 6px; height: 108px; }
    .cell-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .cell-head strong { font-size: 10px; color: #1e293b; }
    .cell-head span { font-size: 8px; color: #64748b; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-weight: 600; }
    .cal-card { border-radius: 7px; padding: 5px 6px; margin-bottom: 4px; break-inside: avoid !important; page-break-inside: avoid !important; }
    .cal-card-top { display: flex; justify-content: space-between; align-items: center; gap: 3px; }
    .cal-badge { color: #fff; font-size: 8px; font-weight: 800; padding: 1.5px 5px; border-radius: 4px; }
    .cal-prog { background: #fff; color: #334155; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 3px; }
    .cal-title { font-size: 9.5px; font-weight: 700; color: #0f172a; margin-top: 4px; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .cal-meta { font-size: 8px; color: #475569; margin-top: 3px; font-weight: 600; }
    .cal-empty { color: #cbd5e1; font-size: 9px; text-align: center; padding: 24px 0; }
    .page-break { break-before: page; page-break-before: always; padding-top: 4px; }
    .script-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start; }
    .script-card { border-radius: 9px; padding: 8px 10px; break-inside: avoid !important; page-break-inside: avoid !important; }
    .script-card-head { display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px; }
    .script-badge { color: #fff; font-size: 8.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-right: 4px; }
    .script-prog { font-size: 9px; font-weight: 700; color: #334155; }
    .script-date { font-size: 8.5px; font-weight: 700; color: #334155; background: #fff; padding: 2px 6px; border-radius: 4px; }
    .script-title { font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 5px; }
    .script-lines { background: #fff; border-radius: 6px; padding: 5px 8px; border: 1px solid #e2e8f0; }
    .script-line { font-size: 9.5px; color: #1e293b; padding: 2.5px 0; border-bottom: 1px dashed #f1f5f9; line-height: 1.35; }
    .script-line:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="calendar-sheet">
    <div class="top-bar">
      <div style="display:flex;align-items:center;gap:8px;">
        <img src="${window.location.origin}/logo.png" alt="Prima RIB" style="width:28px;height:28px;border-radius:6px;object-fit:contain;" />
        <div>
          <h1 class="top-title">SCHEDULE POST KALENDER KONTEN — PRIMA RIB (${
            monthFullNames[viewMonth]
          } ${viewYear})</h1>
          <p class="top-sub">Filter: ${escapeHtml(filterLabel)} • Total Terjadwal: ${
      filteredScheduled.length
    } Konten</p>
        </div>
      </div>
      <div class="legend">
        <span class="legend-item"><span class="dot" style="background:#ECE7FF;border:1.5px solid #7E60FF;"></span> Talent Model</span>
        <span class="legend-item"><span class="dot" style="background:#E5F3FF;border:1.5px solid #2B7FFF;"></span> Mentor</span>
        <span class="legend-item"><span class="dot" style="background:#FFF0E5;border:1.5px solid #F97316;"></span> Siswa</span>
        <span class="legend-item"><span class="dot" style="background:#ECFDF5;border:1.5px solid #10B981;"></span> Carousel</span>
        <span class="legend-item"><span class="dot" style="background:#FDF2F8;border:1.5px solid #EC4899;"></span> Single Post</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>SENIN <span style="float:right;color:#059669;font-size:8px;">FEED</span><div class="th-sub">Single Post / Carousel</div></th>
          <th>SELASA <span style="float:right;color:#7E60FF;font-size:8px;">REEL</span><div class="th-sub">Talent / Mentor / Siswa</div></th>
          <th>RABU <span style="float:right;color:#059669;font-size:8px;">FEED</span><div class="th-sub">Single Post / Carousel</div></th>
          <th>KAMIS <span style="float:right;color:#7E60FF;font-size:8px;">REEL</span><div class="th-sub">Talent / Mentor / Siswa</div></th>
          <th>JUMAT <span style="float:right;color:#059669;font-size:8px;">FEED</span><div class="th-sub">Single Post / Carousel</div></th>
        </tr>
      </thead>
      <tbody>
        ${calendarRowsHtml}
      </tbody>
    </table>
  </div>

  ${
    includeScriptPages && filteredScheduled.length > 0
      ? `<div class="page-break">
          <div class="top-bar" style="margin-bottom:8px;">
            <div>
              <h2 class="top-title" style="font-size:13px;">LAMPIRAN DETAIL POIN SCRIPT & ISI SLIDE — ${monthFullNames[viewMonth].toUpperCase()} ${viewYear}</h2>
              <p class="top-sub">Panduan naskah video Reel (Poin per Poin) dan materi slide Carousel sesuai tanggal tayang</p>
            </div>
          </div>
          <div class="script-grid">
            ${scriptCardsHtml}
          </div>
        </div>`
      : ""
  }

  <script>window.onload = () => { setTimeout(() => window.print(), 300); };</script>
</body>
</html>`);
    win.document.close();
  };

  const previewWaText = buildBulkWhatsAppText();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner + Export PDF & WhatsApp Buttons */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            3. Schedule Post — Kalender Tayang & Distribusi ke Talent
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Menampilkan hasil jadwal dari{" "}
            <strong className="text-slate-700">Production Board</strong>. Anda bisa{" "}
            <strong className="text-slate-700">Cetak PDF Kalender (1 Halaman Utuh)</strong> atau{" "}
            <strong className="text-emerald-700">Copy ke WhatsApp Talent</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Buka Halaman View Khusus Talent */}
          <Link
            href={
              filterTalent === "ALL"
                ? "/talent"
                : `/talent?role=${encodeURIComponent(filterTalent)}`
            }
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Buka View Talent</span>
          </Link>

          {/* Tombol Copy Link View Talent */}
          <button
            type="button"
            onClick={() => {
              const path =
                filterTalent === "ALL"
                  ? `${window.location.origin}/talent`
                  : `${window.location.origin}/talent?role=${encodeURIComponent(
                      filterTalent
                    )}`;
              handleCopyText(
                path,
                "Link Halaman View Talent berhasil disalin! Siap dikirim ke Talent."
              );
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <Copy className="h-3.5 w-3.5 text-[#6D4AFF]" />
            <span>Copy Link Talent</span>
          </button>

          {/* Tombol Copy / Share ke WhatsApp */}
          <button
            type="button"
            onClick={() => setShowWaModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Copy ke WA</span>
          </button>

          {/* Tombol Download PDF Kalender Saja (1 Halaman Utuh) */}
          <button
            type="button"
            onClick={() => handlePrintPdfSchedule({ includeScriptPages: false })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5 text-[#6D4AFF]" />
            <span>PDF Kalender (1 Hal)</span>
          </button>

          {/* Tombol Download PDF Kalender + Lampiran Script */}
          <button
            type="button"
            onClick={() => handlePrintPdfSchedule({ includeScriptPages: true })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCD4FF] bg-[#F3F0FF] px-3.5 py-2 text-xs font-bold text-[#6D4AFF] transition hover:bg-[#6D4AFF] hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>PDF Kalender + Script</span>
          </button>
        </div>
      </div>

      {/* Color-Coded Filter Bar for Talent Reels, Carousel, Single Post & Wilayah */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
        {/* Color Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold text-slate-500">
            Filter Warna Card:
          </span>

          <button
            type="button"
            onClick={() => setFilterTalent("ALL")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterTalent === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({programFilteredScheduled.length})
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterTalent((prev) =>
                prev === "Talent Model" ? "ALL" : "Talent Model"
              )
            }
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              filterTalent === "Talent Model"
                ? "border-[#7E60FF] bg-[#7E60FF] text-white shadow-xs"
                : "border-[#7E60FF]/40 bg-[#ECE7FF] text-[#7E60FF]"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            <span>Reel: Talent Model ({countTalentModel})</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterTalent((prev) =>
                prev === "Mentor / Pengajar" ? "ALL" : "Mentor / Pengajar"
              )
            }
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              filterTalent === "Mentor / Pengajar"
                ? "border-[#2B7FFF] bg-[#2B7FFF] text-white shadow-xs"
                : "border-[#2B7FFF]/40 bg-[#E5F3FF] text-[#1D74F5]"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            <span>Reel: Mentor / Pengajar ({countMentor})</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterTalent((prev) => (prev === "Siswa" ? "ALL" : "Siswa"))
            }
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              filterTalent === "Siswa"
                ? "border-[#F97316] bg-[#F97316] text-white shadow-xs"
                : "border-[#F97316]/40 bg-[#FFF0E5] text-[#EA6A15]"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            <span>Reel: Siswa ({countSiswa})</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterTalent((prev) =>
                prev === "CAROUSEL_ONLY" ? "ALL" : "CAROUSEL_ONLY"
              )
            }
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              filterTalent === "CAROUSEL_ONLY"
                ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                : "border-emerald-300 bg-emerald-50 text-emerald-700"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            <span>Carousel ({countCarousel})</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterTalent((prev) =>
                prev === "SINGLE_ONLY" ? "ALL" : "SINGLE_ONLY"
              )
            }
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              filterTalent === "SINGLE_ONLY"
                ? "border-pink-600 bg-pink-600 text-white shadow-xs"
                : "border-pink-300 bg-pink-50 text-pink-700"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            <span>Single Post ({countSinglePost})</span>
          </button>
        </div>

        {/* Right: Wilayah Filter & Month Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-[#6D4AFF] focus:outline-none"
          >
            <option value="ALL">Semua Wilayah</option>
            {state.programs
              .filter((p) => p.is_active)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  Wilayah: {p.name}
                </option>
              ))}
          </select>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[120px] text-center text-xs font-extrabold text-slate-800">
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
      </div>

      {/* =================================================================== */}
      {/* TABEL KALENDER SCHEDULE POST (SENIN - JUMAT)                        */}
      {/* =================================================================== */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-6">
        <table className="w-full min-w-[820px] table-fixed border-collapse">
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
            {weeks.map((week, wIdx) => (
              <tr key={`sched-week-${wIdx}`}>
                {week.map((cell) => {
                  const cellItems = filteredScheduled.filter(
                    (c) =>
                      c.scheduled_at &&
                      c.scheduled_at.slice(0, 10) === cell.dateIso
                  );

                  return (
                    <td
                      key={cell.dateIso}
                      className={`min-h-[165px] align-top border border-slate-200/80 p-3 ${
                        cell.isReelDay ? "bg-[#FAF9FF]/70" : "bg-white"
                      }`}
                    >
                      {/* Date Number Header */}
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

                      {/* Scheduled Content Cards */}
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
                              {/* Top Badge: Talent Category (for Reels) or Format (for Feed) */}
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

                              {/* Content Title */}
                              <p className="mt-2 text-xs font-bold leading-snug text-slate-900">
                                {item.title}
                              </p>

                              {/* Pillar & Platforms */}
                              <div className="mt-2.5 flex items-center justify-between border-t border-black/5 pt-2 text-[10px] font-semibold text-slate-600">
                                <span>{item.pillar?.name}</span>
                                <span className="font-bold">
                                  {item.platforms
                                    ?.map((p) => p.platform.code)
                                    .join(" • ") || "IG • FB • TT"}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: SHARE / COPY JADWAL & SCRIPT KE WHATSAPP                   */}
      {/* =================================================================== */}
      {showWaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
          onClick={() => setShowWaModal(false)}
        >
          <div
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bagikan Jadwal & Script ke WhatsApp Talent
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pilih minggu dan salin format pesan siap kirim ke grup WA Talent / Mentor / Siswa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWaModal(false)}
                className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Minggu & Opsi Script */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
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
                    onClick={() => setWaWeekFilter(wk.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      waWeekFilter === wk.id
                        ? "bg-[#6D4AFF] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {wk.label}
                  </button>
                ))}
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={waIncludeScript}
                  onChange={(e) => setWaIncludeScript(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#6D4AFF]"
                />
                <span>Sertakan Poin Script / Isi Slide</span>
              </label>
            </div>

            {/* Preview Box */}
            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Preview Pesan WhatsApp
              </label>
              <textarea
                readOnly
                rows={12}
                value={previewWaText}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    previewWaText,
                    "Jadwal & Script berhasil disalin! Silakan paste di WhatsApp."
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#6D4AFF] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#5B38E8]"
              >
                <Copy className="h-4 w-4" />
                <span>Salin Teks ke Clipboard</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(previewWaText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Kirim Langsung ke WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: DETAIL KONTEN UNTUK TALENT (DENGAN TOMBOL COPY & PRINT)    */}
      {/* =================================================================== */}
      {selectedContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
          onClick={() => setSelectedContent(null)}
        >
          <div
            className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-[#F3F0FF] px-2.5 py-1 text-xs font-bold text-[#6D4AFF]">
                    {selectedContent.program?.name}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {selectedContent.pillar?.name}
                  </span>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                      selectedContent.format_id === "fmt-reels"
                        ? "bg-[#F3F0FF] text-[#6D4AFF]"
                        : selectedContent.format_id === "fmt-carousel"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-pink-50 text-pink-700"
                    }`}
                  >
                    {selectedContent.format?.name}
                  </span>
                  {selectedContent.talent_category && (
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-extrabold text-white ${
                        selectedContent.talent_category === "Talent Model"
                          ? "bg-[#7E60FF]"
                          : selectedContent.talent_category ===
                            "Mentor / Pengajar"
                          ? "bg-[#2B7FFF]"
                          : "bg-[#F97316]"
                      }`}
                    >
                      Talent: {selectedContent.talent_category}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">
                  {selectedContent.title}
                </h3>

                {selectedContent.scheduled_at && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-[#6D4AFF]" />
                    <span>
                      Jadwal Post:{" "}
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
                className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-700">
              {selectedContent.hook && (
                <div className="rounded-xl bg-[#F3F0FF] p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#6D4AFF]">
                    Hook Pembuka
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedContent.hook}
                  </p>
                </div>
              )}

              {(selectedContent.script || selectedContent.main_content) && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {selectedContent.format_id === "fmt-reels"
                      ? "Script Video"
                      : selectedContent.format_id === "fmt-carousel"
                      ? "Isi Materi per Slide Carousel"
                      : "Isi Materi Single Post"}
                  </p>
                  <div className="mt-2.5 rounded-xl border border-slate-200/80 bg-white p-4 text-xs sm:text-sm font-medium leading-relaxed text-slate-800 whitespace-pre-line shadow-2xs">
                    {(
                      selectedContent.script ||
                      selectedContent.main_content ||
                      ""
                    )
                      .split(/\r?\n/)
                      .map((line) =>
                        line
                          .replace(
                            /^Poin\s*\d+\s*\((Hook Pembuka|Isi Script|CTA\s*\/\s*Penutup)\)\s*:\s*/i,
                            ""
                          )
                          .trim()
                      )
                      .filter(Boolean)
                      .join("\n")}
                  </div>
                </div>
              )}

              {selectedContent.caption && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Caption & Hashtags
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-slate-700">
                    {selectedContent.caption}
                  </p>
                  {selectedContent.hashtags && (
                    <p className="mt-2 font-semibold text-[#6D4AFF]">
                      {selectedContent.hashtags}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Quick Actions for Single Content Item */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() =>
                  handlePrintPdfSchedule({ singleItem: selectedContent })
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5 text-[#6D4AFF]" />
                <span>Cetak Brief Ini (PDF)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      buildSingleItemWaText(selectedContent),
                      "Script & Brief konten ini berhasil disalin ke clipboard!"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Script ke WA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
