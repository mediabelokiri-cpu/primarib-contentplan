"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Heart,
  Sparkles,
  Clock,
  Award,
  Edit3,
} from "lucide-react";
import { useAppStore, upsertAnalyticsAction } from "@/lib/store";
import { calculateEngagementRate, getProgramBadgeStyle } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export default function AnalyticsPage() {
  const { state, enrichedContents } = useAppStore();

  const [programFilter, setProgramFilter] = useState("ALL");
  const [pillarFilter, setPillarFilter] = useState("ALL");
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [platformFilter, setPlatformFilter] = useState("ALL");

  // Modal state for manual performance input
  const [editingCpId, setEditingCpId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [views, setViews] = useState(0);
  const [reach, setReach] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [shares, setShares] = useState(0);
  const [saves, setSaves] = useState(0);
  const [followers, setFollowers] = useState(0);

  // Flatten published content_platforms for per-platform analytics ranking
  const publishedContents = enrichedContents.filter(
    (c) => c.status === "PUBLISHED"
  );

  const platformRows = publishedContents.flatMap((cnt) =>
    (cnt.platforms || []).map((cp) => ({
      content: cnt,
      cp,
      analytics: cp.analytics,
    }))
  );

  const filteredRows = platformRows.filter(({ content, cp }) => {
    if (programFilter !== "ALL" && content.program_id !== programFilter)
      return false;
    if (pillarFilter !== "ALL" && content.pillar_id !== pillarFilter)
      return false;
    if (formatFilter !== "ALL" && content.format_id !== formatFilter)
      return false;
    if (platformFilter !== "ALL" && cp.platform_id !== platformFilter)
      return false;
    return true;
  });

  // Sort by Engagement Rate descending, then Views descending
  const rankedRows = filteredRows.slice().sort((a, b) => {
    const erA = a.analytics?.engagement_rate || 0;
    const erB = b.analytics?.engagement_rate || 0;
    if (erB !== erA) return erB - erA;
    return (b.analytics?.views || 0) - (a.analytics?.views || 0);
  });

  // Aggregate KPIs
  const totalViews = filteredRows.reduce(
    (sum, r) => sum + (r.analytics?.views || 0),
    0
  );
  const totalReach = filteredRows.reduce(
    (sum, r) => sum + (r.analytics?.reach || 0),
    0
  );
  const totalEngagement = filteredRows.reduce(
    (sum, r) =>
      sum +
      (r.analytics?.likes || 0) +
      (r.analytics?.comments || 0) +
      (r.analytics?.shares || 0) +
      (r.analytics?.saves || 0),
    0
  );
  const avgEngagementRate =
    filteredRows.length > 0
      ? (
          filteredRows.reduce(
            (sum, r) => sum + (r.analytics?.engagement_rate || 0),
            0
          ) / filteredRows.length
        ).toFixed(2)
      : "0.00";

  // Content Insights (Section 20 of Masterplan)
  const topRow = rankedRows[0];
  const topProgram = topRow?.content.program?.name || "CPNS";
  const topPillar = topRow?.content.pillar?.name || "Education";
  const topFormat = topRow?.content.format?.name || "Carousel";

  const openMetricsModal = (row: (typeof rankedRows)[number]) => {
    setEditingCpId(row.cp.id);
    setEditingTitle(
      `${row.content.content_code} — ${row.content.title} (${row.cp.platform.name})`
    );
    setViews(row.analytics?.views || 0);
    setReach(row.analytics?.reach || 0);
    setLikes(row.analytics?.likes || 0);
    setComments(row.analytics?.comments || 0);
    setShares(row.analytics?.shares || 0);
    setSaves(row.analytics?.saves || 0);
    setFollowers(row.analytics?.followers || 0);
  };

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCpId) return;
    upsertAnalyticsAction({
      contentPlatformId: editingCpId,
      views: Number(views) || 0,
      reach: Number(reach) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      saves: Number(saves) || 0,
      followers: Number(followers) || 0,
    });
    setEditingCpId(null);
  };

  const previewEr = calculateEngagementRate({
    views,
    reach,
    likes,
    comments,
    shares,
    saves,
  });

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Content Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Data performa per platform, kalkulasi otomatis Engagement Rate, dan Content Insight.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter Program"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Semua Program</option>
            {state.programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter Pillar"
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Semua Pillar</option>
            {state.pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter Format"
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Semua Format</option>
            {state.formats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter Platform"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Semua Platform</option>
            {state.platforms.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-[#284078] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Views</span>
            <Eye className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {totalViews.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Reach</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {totalReach.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-rose-500 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Engagement</span>
            <Heart className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {totalEngagement.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-[#DDB02E] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Avg Engagement Rate</span>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#284078]">
            {avgEngagementRate}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Published Posts</span>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {filteredRows.length}
          </p>
        </div>
      </div>

      {/* CONTENT INSIGHT CARDS (Section 20 of Masterplan) */}
      <div className="rounded-xl border border-slate-200 bg-[#284078] p-5 text-white shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#DDB02E]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#DDB02E]">
            Content Insight & Strategy Highlights
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white/10 p-3.5">
            <p className="text-[10px] font-semibold uppercase text-white/70">
              Top Program
            </p>
            <p className="mt-1 text-lg font-extrabold text-white">
              {topProgram}
            </p>
            <p className="text-[11px] text-[#DDB02E]">
              Interaksi & saves tertinggi
            </p>
          </div>

          <div className="rounded-lg bg-white/10 p-3.5">
            <p className="text-[10px] font-semibold uppercase text-white/70">
              Top Pillar
            </p>
            <p className="mt-1 text-lg font-extrabold text-white">
              {topPillar}
            </p>
            <p className="text-[11px] text-[#DDB02E]">
              Pillar paling diminati audiens
            </p>
          </div>

          <div className="rounded-lg bg-white/10 p-3.5">
            <p className="text-[10px] font-semibold uppercase text-white/70">
              Top Format
            </p>
            <p className="mt-1 text-lg font-extrabold text-white">
              {topFormat}
            </p>
            <p className="text-[11px] text-[#DDB02E]">
              Format dengan ER tertinggi
            </p>
          </div>

          <div className="rounded-lg bg-white/10 p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase text-white/70">
                Best Posting Time
              </p>
              <Clock className="h-3.5 w-3.5 text-[#DDB02E]" />
            </div>
            <p className="mt-1 text-lg font-extrabold text-white">
              19:00 – 20:00 WIB
            </p>
            <p className="text-[11px] text-[#DDB02E]">
              Jam aktif pejuang CPNS/Polri
            </p>
          </div>
        </div>
      </div>

      {/* PERFORMANCE RANKING TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#DDB02E]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Content Performance Ranking
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Klik <strong>Input Metrik</strong> untuk memperbarui data performa manual
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Rank</th>
                <th className="px-4 py-3.5">Content</th>
                <th className="px-4 py-3.5">Platform</th>
                <th className="px-4 py-3.5 text-right">Views</th>
                <th className="px-4 py-3.5 text-right">Reach</th>
                <th className="px-4 py-3.5 text-right">Likes</th>
                <th className="px-4 py-3.5 text-right">Comments</th>
                <th className="px-4 py-3.5 text-right">Shares</th>
                <th className="px-4 py-3.5 text-right">Saves</th>
                <th className="px-4 py-3.5 text-right">Engagement Rate</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedRows.map((row, idx) => {
                const anl = row.analytics;
                return (
                  <tr key={row.cp.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                          idx === 0
                            ? "bg-[#DDB02E] text-[#284078]"
                            : idx === 1
                            ? "bg-slate-200 text-slate-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/content/${row.content.id}`}
                          className="font-mono text-xs font-bold text-[#284078] hover:underline"
                        >
                          {row.content.content_code}
                        </Link>
                        <span
                          className={`rounded border px-1.5 py-0.2 text-[10px] font-bold ${getProgramBadgeStyle(
                            row.content.program?.code
                          )}`}
                        >
                          {row.content.program?.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-slate-900">
                        {row.content.title}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {row.cp.platform.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-700">
                      {(anl?.views || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-700">
                      {(anl?.reach || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-700">
                      {(anl?.likes || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-700">
                      {(anl?.comments || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-700">
                      {(anl?.shares || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-700">
                      {(anl?.saves || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                        {anl?.engagement_rate ?? 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openMetricsModal(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#284078] hover:bg-[#284078] hover:text-white"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Input Metrik</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input / Update Performance Metrics */}
      <Modal
        isOpen={Boolean(editingCpId)}
        onClose={() => setEditingCpId(null)}
        title="Input Data Performa Konten"
      >
        <form onSubmit={handleSaveMetrics} className="space-y-4">
          <p className="rounded-lg bg-slate-50 p-2.5 text-xs font-semibold text-slate-700">
            {editingTitle}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Views
              </label>
              <input
                type="number"
                min={0}
                value={views}
                onChange={(e) => setViews(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Reach
              </label>
              <input
                type="number"
                min={0}
                value={reach}
                onChange={(e) => setReach(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Likes
              </label>
              <input
                type="number"
                min={0}
                value={likes}
                onChange={(e) => setLikes(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Comments
              </label>
              <input
                type="number"
                min={0}
                value={comments}
                onChange={(e) => setComments(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Shares
              </label>
              <input
                type="number"
                min={0}
                value={shares}
                onChange={(e) => setShares(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Saves
              </label>
              <input
                type="number"
                min={0}
                value={saves}
                onChange={(e) => setSaves(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Followers Gained
              </label>
              <input
                type="number"
                min={0}
                value={followers}
                onChange={(e) => setFollowers(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col justify-center rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <span className="text-[10px] font-bold uppercase text-emerald-700">
                Calculated ER
              </span>
              <span className="text-lg font-extrabold text-emerald-800">
                {previewEr}%
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingCpId(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#284078] px-4 py-2 text-xs font-bold text-white"
            >
              Simpan Analytics
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
