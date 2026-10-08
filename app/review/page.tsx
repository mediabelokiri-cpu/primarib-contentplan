"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  FileText,
} from "lucide-react";
import {
  useAppStore,
  submitReviewDecisionAction,
  changeContentStatusAction,
} from "@/lib/store";
import {
  formatDateTime,
  getPriorityBadgeStyle,
  getProgramBadgeStyle,
  getStatusBadgeStyle,
} from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export default function ReviewPage() {
  const { enrichedContents } = useAppStore();

  const [tab, setTab] = useState<"REVIEW" | "REVISION" | "ALL">("ALL");
  const [revisionTargetId, setRevisionTargetId] = useState<string | null>(null);
  const [revisionComment, setRevisionComment] = useState("");

  const reviewItems = enrichedContents.filter((c) => {
    if (tab === "REVIEW") return c.status === "REVIEW";
    if (tab === "REVISION") return c.status === "REVISION";
    return c.status === "REVIEW" || c.status === "REVISION";
  });

  const handleApprove = (contentId: string) => {
    submitReviewDecisionAction({
      contentId,
      decision: "APPROVED",
      comment: "Konten sudah sesuai brief & siap dijadwalkan tayang.",
    });
  };

  const handleRequestRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionTargetId || !revisionComment.trim()) return;

    submitReviewDecisionAction({
      contentId: revisionTargetId,
      decision: "REVISION",
      comment: revisionComment.trim(),
    });

    setRevisionComment("");
    setRevisionTargetId(null);
  };

  const handleResubmit = (contentId: string) => {
    changeContentStatusAction(
      contentId,
      "REVIEW",
      "Resubmitted untuk direview kembali"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Content Review & Approval
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Periksa kualitas Brief, Copywriting, Caption, dan Asset sebelum disetujui tayang.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {[
            { id: "ALL", label: "Semua Antrean" },
            { id: "REVIEW", label: "Waiting Review" },
            { id: "REVISION", label: "In Revision" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as "ALL" | "REVIEW" | "REVISION")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === item.id
                  ? "bg-[#284078] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards */}
      {reviewItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-3 text-base font-bold text-slate-800">
            Tidak ada antrean konten untuk direview
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Seluruh konten pada antrean Review / Revision sudah selesai ditangani.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewItems.map((cnt) => {
            const latestReview = cnt.reviews?.[0];
            return (
              <div
                key={cnt.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/content/${cnt.id}`}
                        className="font-mono text-sm font-extrabold text-[#284078] hover:underline"
                      >
                        {cnt.content_code}
                      </Link>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-bold ${getStatusBadgeStyle(
                          cnt.status
                        )}`}
                      >
                        {cnt.status}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-bold ${getProgramBadgeStyle(
                          cnt.program?.code
                        )}`}
                      >
                        {cnt.program?.name}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {cnt.pillar?.name} • {cnt.format?.name}
                      </span>
                      <span
                        className={`rounded border px-2 py-0.5 text-xs font-bold ${getPriorityBadgeStyle(
                          cnt.priority
                        )}`}
                      >
                        {cnt.priority}
                      </span>
                    </div>

                    <Link
                      href={`/content/${cnt.id}`}
                      className="mt-2 block text-lg font-bold text-slate-900 hover:text-[#284078]"
                    >
                      {cnt.title}
                    </Link>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/content/${cnt.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <span>Buka Detail</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>

                    {cnt.status === "REVIEW" && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRevisionTargetId(cnt.id);
                            setRevisionComment("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>REQUEST REVISION</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(cnt.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>APPROVE</span>
                        </button>
                      </>
                    )}

                    {cnt.status === "REVISION" && (
                      <button
                        type="button"
                        onClick={() => handleResubmit(cnt.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDB02E] px-4 py-1.5 text-xs font-bold text-[#284078] shadow-2xs hover:bg-[#c99e23]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Submit for Review (Resubmit)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Brief, Copy, Caption & Assets */}
                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3 text-xs">
                    <p className="font-bold uppercase text-slate-500">
                      Hook & Structure
                    </p>
                    <p className="mt-1 font-semibold text-[#284078]">
                      “{cnt.hook || "-"}”
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-700 line-clamp-4">
                      {cnt.main_content || "-"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 text-xs">
                    <p className="font-bold uppercase text-slate-500">
                      Caption & CTA
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-700 line-clamp-4">
                      {cnt.caption || "-"}
                    </p>
                    {cnt.cta && (
                      <p className="mt-1.5 font-semibold text-slate-900">
                        CTA: {cnt.cta}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 text-xs">
                    <p className="font-bold uppercase text-slate-500">
                      Assets & PIC
                    </p>
                    {cnt.assets && cnt.assets.length > 0 ? (
                      <div className="mt-1.5 space-y-1">
                        {cnt.assets.map((ast) => (
                          <div
                            key={ast.id}
                            className="flex items-center gap-1.5 font-medium text-[#284078]"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="truncate">{ast.file_name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-slate-400">
                        Belum ada asset terlampir
                      </p>
                    )}

                    <div className="mt-3 border-t border-slate-200/70 pt-2 text-[11px] text-slate-600">
                      Jadwal: {formatDateTime(cnt.scheduled_at)}
                    </div>
                  </div>
                </div>

                {/* Latest Revision Note Alert */}
                {latestReview && (
                  <div
                    className={`mt-3 rounded-lg border px-3.5 py-2.5 text-xs ${
                      latestReview.decision === "REVISION"
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    <strong>
                      Catatan Reviewer ({latestReview.reviewer?.full_name}):
                    </strong>{" "}
                    “{latestReview.comment}”
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Request Revision */}
      <Modal
        isOpen={Boolean(revisionTargetId)}
        onClose={() => setRevisionTargetId(null)}
        title="Request Revision (Wajib Isi Komentar)"
      >
        <form onSubmit={handleRequestRevisionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Revision Comment *
            </label>
            <textarea
              rows={4}
              required
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              placeholder="Contoh: Hook kurang kuat, Slide 3 terlalu banyak teks, mohon diperbaiki."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#284078] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRevisionTargetId(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              Kirim Permintaan Revisi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
