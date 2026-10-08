"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Send,
  ExternalLink,
  CheckCircle2,
  BarChart3,
  Clock,
} from "lucide-react";
import { useAppStore, markContentPublishedAction } from "@/lib/store";
import {
  formatDateTime,
  getProgramBadgeStyle,
} from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export default function PublishedPage() {
  const { enrichedContents } = useAppStore();

  const [publishModalTarget, setPublishModalTarget] = useState<string | null>(
    null
  );
  const [publishDate, setPublishDate] = useState("2026-10-05");
  const [publishTime, setPublishTime] = useState("19:00");
  const [postUrl, setPostUrl] = useState("");

  const scheduledItems = enrichedContents.filter(
    (c) => c.status === "SCHEDULED" || c.status === "APPROVED"
  );
  const publishedItems = enrichedContents.filter(
    (c) => c.status === "PUBLISHED"
  );

  const handleConfirmPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishModalTarget) return;

    const publishedIso = new Date(
      `${publishDate}T${publishTime || "19:00"}:00`
    ).toISOString();

    markContentPublishedAction({
      contentId: publishModalTarget,
      publishedAt: publishedIso,
      postUrl: postUrl.trim() || "https://instagram.com/p/primarib-post",
    });

    setPublishModalTarget(null);
    setPostUrl("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Published Content & Ready to Publish
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Daftar konten yang siap dipublish (`SCHEDULED`) dan arsip konten yang sudah tayang (`PUBLISHED`).
        </p>
      </div>

      {/* Ready to Publish (Scheduled / Approved) */}
      {scheduledItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-2xs">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#284078]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#284078]">
              Siap Tayang / Scheduled ({scheduledItems.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {scheduledItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#284078]">
                      {item.content_code}
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${getProgramBadgeStyle(
                        item.program?.code
                      )}`}
                    >
                      {item.program?.name}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Jadwal: {formatDateTime(item.scheduled_at)}
                    </span>
                  </div>
                  <Link
                    href={`/content/${item.id}`}
                    className="mt-1 block text-sm font-bold text-slate-900 hover:text-[#284078]"
                  >
                    {item.title}
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPublishModalTarget(item.id);
                    setPostUrl("");
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#284078] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#1e305a]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark as Published</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published Content Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Arsip Konten Published ({publishedItems.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Content ID</th>
                <th className="px-4 py-3.5">Title</th>
                <th className="px-4 py-3.5">Program</th>
                <th className="px-4 py-3.5">Platform</th>
                <th className="px-4 py-3.5">Published Date & Time</th>
                <th className="px-4 py-3.5">Performance</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publishedItems.map((cnt) => {
                const firstPlat = cnt.platforms?.[0];
                const totalViews =
                  cnt.platforms?.reduce(
                    (acc, cp) => acc + (cp.analytics?.views || 0),
                    0
                  ) || 0;
                const avgEr =
                  cnt.platforms && cnt.platforms.length > 0
                    ? (
                        cnt.platforms.reduce(
                          (acc, cp) =>
                            acc + (cp.analytics?.engagement_rate || 0),
                          0
                        ) / cnt.platforms.length
                      ).toFixed(2)
                    : "0.00";

                return (
                  <tr key={cnt.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-[#284078]">
                      {cnt.content_code}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/content/${cnt.id}`}
                        className="font-semibold text-slate-900 hover:text-[#284078]"
                      >
                        {cnt.title}
                      </Link>
                      <p className="text-[11px] text-slate-500">
                        {cnt.pillar?.name} • {cnt.format?.name}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-bold ${getProgramBadgeStyle(
                          cnt.program?.code
                        )}`}
                      >
                        {cnt.program?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {cnt.platforms?.map((cp) => (
                          <span
                            key={cp.id}
                            className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                          >
                            {cp.platform.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                      {formatDateTime(
                        firstPlat?.published_at || cnt.scheduled_at
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                      <span className="font-bold text-slate-900">
                        {totalViews.toLocaleString("id-ID")} views
                      </span>
                      <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        ER {avgEr}%
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {firstPlat?.post_url && (
                          <a
                            href={firstPlat.post_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#284078] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e305a]"
                          >
                            <Send className="h-3 w-3" />
                            <span>View Post</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <Link
                          href="/analytics"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                          <span>Analytics</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mark as Published */}
      <Modal
        isOpen={Boolean(publishModalTarget)}
        onClose={() => setPublishModalTarget(null)}
        title="Mark Content as Published"
      >
        <form onSubmit={handleConfirmPublish} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Published Date *
              </label>
              <input
                type="date"
                required
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Published Time *
              </label>
              <input
                type="time"
                required
                value={publishTime}
                onChange={(e) => setPublishTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Post URL (Link Postingan Tayang) *
            </label>
            <input
              type="url"
              required
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder="https://instagram.com/p/..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPublishModalTarget(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#284078] px-4 py-2 text-xs font-bold text-white"
            >
              Simpan & Publish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
