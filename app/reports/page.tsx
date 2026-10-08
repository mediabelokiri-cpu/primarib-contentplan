"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Clock,
  Layers,
  Award,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getProgramBadgeStyle } from "@/lib/utils";

export default function ReportsPage() {
  const { state, enrichedContents } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState("2026-10");

  const activeContents = enrichedContents.filter((c) => {
    if (c.status === "ARCHIVED") return false;
    if (selectedPeriod === "ALL") return true;
    const refDate = c.scheduled_at || c.created_at;
    return refDate.startsWith(selectedPeriod);
  });

  const totalCount = activeContents.length;
  const publishedCount = activeContents.filter(
    (c) => c.status === "PUBLISHED"
  ).length;
  const inProductionCount = activeContents.filter(
    (c) =>
      c.status === "PLANNED" ||
      c.status === "BRIEF" ||
      c.status === "PRODUCTION" ||
      c.status === "REVISION"
  ).length;
  const inReviewCount = activeContents.filter(
    (c) => c.status === "REVIEW" || c.status === "APPROVED" || c.status === "SCHEDULED"
  ).length;

  // Distribution helpers
  const programMix = state.programs.map((prog) => {
    const count = activeContents.filter((c) => c.program_id === prog.id).length;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { ...prog, count, pct };
  });

  const pillarMix = state.pillars.map((pil) => {
    const count = activeContents.filter((c) => c.pillar_id === pil.id).length;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { ...pil, count, pct };
  });

  const formatMix = state.formats
    .map((fmt) => {
      const count = activeContents.filter((c) => c.format_id === fmt.id).length;
      const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { ...fmt, count, pct };
    })
    .filter((f) => f.count > 0);

  const platformMix = state.platforms.map((plat) => {
    const count = activeContents.filter((c) =>
      c.platforms?.some((cp) => cp.platform_id === plat.id)
    ).length;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { ...plat, count, pct };
  });

  // Top performing published contents
  const topContents = activeContents
    .filter((c) => c.status === "PUBLISHED")
    .map((cnt) => {
      const views =
        cnt.platforms?.reduce(
          (sum, cp) => sum + (cp.analytics?.views || 0),
          0
        ) || 0;
      const avgEr =
        cnt.platforms && cnt.platforms.length > 0
          ? Number(
              (
                cnt.platforms.reduce(
                  (sum, cp) => sum + (cp.analytics?.engagement_rate || 0),
                  0
                ) / cnt.platforms.length
              ).toFixed(2)
            )
          : 0;
      return { cnt, views, avgEr };
    })
    .sort((a, b) => b.avgEr - a.avgEr || b.views - a.views);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Monthly Content Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Ringkasan eksekutif produksi konten, komposisi Program/Pillar/Format Mix, dan Top Content.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Pilih Periode Laporan"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs"
          >
            <option value="2026-10">OCTOBER 2026 REPORT</option>
            <option value="2026-09">SEPTEMBER 2026 REPORT</option>
            <option value="ALL">ALL TIME 2026 REPORT</option>
          </select>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#284078] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#1e305a]"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <span className="rounded-md bg-[#DDB02E]/25 px-2.5 py-1 text-xs font-extrabold text-[#284078]">
              PRIMA RIB EXECUTIVE SUMMARY
            </span>
            <h2 className="mt-2 text-lg font-extrabold text-slate-900">
              CONTENT REPORT —{" "}
              {selectedPeriod === "2026-10"
                ? "OCTOBER 2026"
                : selectedPeriod === "2026-09"
                ? "SEPTEMBER 2026"
                : "ALL PERIODS 2026"}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 px-4 py-2.5 text-center">
              <p className="text-[11px] font-semibold text-slate-500">
                Total Content
              </p>
              <p className="text-xl font-extrabold text-[#284078]">
                {totalCount}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-center">
              <p className="text-[11px] font-semibold text-emerald-700">
                Published
              </p>
              <p className="text-xl font-extrabold text-emerald-800">
                {publishedCount}
              </p>
            </div>
            <div className="rounded-lg bg-indigo-50 px-4 py-2.5 text-center">
              <p className="text-[11px] font-semibold text-indigo-700">
                In Production
              </p>
              <p className="text-xl font-extrabold text-indigo-800">
                {inProductionCount}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 px-4 py-2.5 text-center">
              <p className="text-[11px] font-semibold text-amber-800">
                Review / Ready
              </p>
              <p className="text-xl font-extrabold text-amber-900">
                {inReviewCount}
              </p>
            </div>
          </div>
        </div>

        {/* Distribution Grids: Program Mix, Pillar Mix, Format Mix, Platform Mix */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 1. PROGRAM MIX (Keseimbangan CPNS, Sekdin, Polri) */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#284078]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#284078]">
                Program Mix (CPNS, Sekdin, Polri, General)
              </h3>
            </div>
            <div className="space-y-3">
              {programMix.map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {item.name}
                    </span>
                    <span className="font-semibold text-slate-600">
                      {item.count} konten ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#284078]"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. CONTENT PILLAR DISTRIBUTION */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-[#284078]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#284078]">
                Content Pillar Distribution
              </h3>
            </div>
            <div className="space-y-2.5">
              {pillarMix.map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {item.name}
                    </span>
                    <span className="font-semibold text-slate-600">
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#DDB02E]"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. FORMAT DISTRIBUTION */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#284078]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#284078]">
                Format Distribution
              </h3>
            </div>
            <div className="space-y-2.5">
              {formatMix.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-2xs"
                >
                  <span className="font-semibold text-slate-800">
                    {item.name}
                  </span>
                  <span className="font-bold text-[#284078]">
                    {item.count} konten ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. PLATFORM DISTRIBUTION */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#284078]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#284078]">
                Platform Distribution
              </h3>
            </div>
            <div className="space-y-2.5">
              {platformMix.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-2xs"
                >
                  <span className="font-semibold text-slate-800">
                    {item.name} ({item.code})
                  </span>
                  <span className="font-bold text-[#284078]">
                    {item.count} distribusi
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP PERFORMING CONTENT */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-[#DDB02E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#284078]">
              Top Performing Content
            </h3>
          </div>

          {topContents.length === 0 ? (
            <p className="text-xs text-slate-400">
              Belum ada konten published pada periode ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {topContents.map(({ cnt, views, avgEr }, index) => (
                <Link
                  key={cnt.id}
                  href={`/content/${cnt.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-[#284078]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#284078] text-xs font-bold text-[#DDB02E]">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#284078]">
                          {cnt.content_code}
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.2 text-[10px] font-bold ${getProgramBadgeStyle(
                            cnt.program?.code
                          )}`}
                        >
                          {cnt.program?.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-slate-900">
                        {cnt.title}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <p className="font-extrabold text-emerald-700">
                      ER {avgEr}%
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {views.toLocaleString("id-ID")} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
