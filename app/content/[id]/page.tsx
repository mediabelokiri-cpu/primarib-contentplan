"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Copy,
  Archive,
  Trash2,
  Users,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Send,
  Calendar,
  ExternalLink,
  Activity,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  useAppStore,
  changeContentStatusAction,
  duplicateContentAction,
  updateContentAction,
  updateContentAssignmentsAction,
  submitReviewDecisionAction,
  scheduleContentAction,
  markContentPublishedAction,
  addContentAssetAction,
  removeContentAssetAction,
  deleteContentPermanentlyAction,
} from "@/lib/store";
import {
  buildStorageFilePath,
  uploadContentAssetFile,
} from "@/lib/storage";
import {
  STATUS_LABELS,
  VALID_STATUS_TRANSITIONS,
} from "@/lib/constants";
import {
  formatDateTime,
  getPriorityBadgeStyle,
  getProgramBadgeStyle,
  getStatusBadgeStyle,
} from "@/lib/utils";
import {
  canDeletePermanently,
  canReviewAndApprove,
  getLocalCurrentUser,
  isAdminOrPlanner,
} from "@/lib/auth";
import {
  AssetType,
  AssignmentType,
  ContentStatus,
  Profile,
} from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import {
  AiAssistantModal,
  AiContentPatch,
} from "@/components/content/AiAssistantModal";

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, enrichedContents } = useAppStore();
  const [currentUser, setCurrentUser] = useState<Profile>(() =>
    getLocalCurrentUser()
  );

  useEffect(() => {
    const syncUser = () => setCurrentUser(getLocalCurrentUser());
    window.addEventListener("primarib-auth-change", syncUser);
    return () => window.removeEventListener("primarib-auth-change", syncUser);
  }, []);

  const content = enrichedContents.find(
    (c) =>
      c.id === id || c.content_code.toLowerCase() === decodeURIComponent(id).toLowerCase()
  );

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isAssetOpen, setIsAssetOpen] = useState(false);

  // Edit Content fields
  const [editTitle, setEditTitle] = useState("");
  const [editObjective, setEditObjective] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editAngle, setEditAngle] = useState("");
  const [editHook, setEditHook] = useState("");
  const [editMain, setEditMain] = useState("");
  const [editBrief, setEditBrief] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editCta, setEditCta] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [editScript, setEditScript] = useState("");

  // Assignment fields
  const [asgPlanner, setAsgPlanner] = useState("");
  const [asgCopywriter, setAsgCopywriter] = useState("");
  const [asgDesigner, setAsgDesigner] = useState("");
  const [asgVideoEditor, setAsgVideoEditor] = useState("");
  const [asgReviewer, setAsgReviewer] = useState("");

  // Review / Revision comment
  const [revisionComment, setRevisionComment] = useState("");

  // Publish modal fields
  const [postUrl, setPostUrl] = useState("");

  // Upload Asset modal fields
  const [assetFilter, setAssetFilter] = useState<string>("ALL");
  const [assetType, setAssetType] = useState<AssetType>("DESIGN");
  const [assetFileName, setAssetFileName] = useState("");
  const [assetFileUrl, setAssetFileUrl] = useState("");
  const [selectedLocalFile, setSelectedLocalFile] = useState<File | null>(null);
  const [uploadingAsset, setUploadingAsset] = useState(false);

  if (!content) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
        <h2 className="text-base font-bold text-slate-800">
          Konten tidak ditemukan ({id})
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Konten mungkin telah dihapus atau ID tidak valid.
        </p>
        <Link
          href="/content"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#284078] px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Content Database</span>
        </Link>
      </div>
    );
  }

  const validNextStatuses = VALID_STATUS_TRANSITIONS[content.status] || [];

  const openEditModal = () => {
    setEditTitle(content.title);
    setEditObjective(content.objective || "");
    setEditTarget(content.target_audience || "");
    setEditAngle(content.angle || "");
    setEditHook(content.hook || "");
    setEditMain(content.main_content || "");
    setEditBrief(content.creative_brief || "");
    setEditCaption(content.caption || "");
    setEditCta(content.cta || "");
    setEditHashtags(content.hashtags || "");
    setEditScript(content.script || "");
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContentAction(content.id, {
      title: editTitle.trim() || content.title,
      objective: editObjective.trim(),
      target_audience: editTarget.trim(),
      angle: editAngle.trim(),
      hook: editHook.trim(),
      main_content: editMain.trim(),
      creative_brief: editBrief.trim(),
      caption: editCaption.trim(),
      cta: editCta.trim(),
      hashtags: editHashtags.trim(),
      script: editScript.trim(),
    });
    setIsEditOpen(false);
  };

  const openAssignModal = () => {
    const findUser = (type: AssignmentType) =>
      content.assignments?.find((a) => a.assignment_type === type)?.user_id ||
      "";
    setAsgPlanner(findUser("PLANNER"));
    setAsgCopywriter(findUser("COPYWRITER"));
    setAsgDesigner(findUser("DESIGNER"));
    setAsgVideoEditor(findUser("VIDEO_EDITOR"));
    setAsgReviewer(findUser("REVIEWER"));
    setIsAssignOpen(true);
  };

  const handleSaveAssignments = (e: React.FormEvent) => {
    e.preventDefault();
    updateContentAssignmentsAction(content.id, {
      PLANNER: asgPlanner || undefined,
      COPYWRITER: asgCopywriter || undefined,
      DESIGNER: asgDesigner || undefined,
      VIDEO_EDITOR: asgVideoEditor || undefined,
      REVIEWER: asgReviewer || undefined,
    });
    setIsAssignOpen(false);
  };

  const handleDuplicate = () => {
    const duplicated = duplicateContentAction(content.id);
    if (duplicated) {
      router.push(`/content/${duplicated.id}`);
    }
  };

  const handleArchive = () => {
    changeContentStatusAction(content.id, "ARCHIVED", "Diarsipkan oleh user");
  };

  const handleApprove = () => {
    submitReviewDecisionAction({
      contentId: content.id,
      decision: "APPROVED",
      comment: "Konten telah sesuai brief & disetujui untuk tayang.",
    });
  };

  const handleRequestRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionComment.trim()) return;
    submitReviewDecisionAction({
      contentId: content.id,
      decision: "REVISION",
      comment: revisionComment.trim(),
    });
    setRevisionComment("");
    setIsRevisionOpen(false);
  };

  const handleMarkPublished = (e: React.FormEvent) => {
    e.preventDefault();
    markContentPublishedAction({
      contentId: content.id,
      publishedAt: new Date().toISOString(),
      postUrl:
        postUrl.trim() ||
        `https://instagram.com/p/${content.content_code.toLowerCase()}`,
    });
    setPostUrl("");
    setIsPublishOpen(false);
  };

  const handleUploadAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      assetFileName.trim() || selectedLocalFile?.name || "";
    if (!finalName) return;

    setUploadingAsset(true);
    try {
      if (selectedLocalFile) {
        const uploaded = await uploadContentAssetFile({
          contentCode: content.content_code,
          assetType,
          file: selectedLocalFile,
        });
        addContentAssetAction({
          contentId: content.id,
          assetType,
          fileName: finalName,
          filePath: uploaded.filePath,
          fileUrl: assetFileUrl.trim() || uploaded.fileUrl,
        });
      } else {
        const filePath = buildStorageFilePath(
          content.content_code,
          assetType,
          finalName
        );
        addContentAssetAction({
          contentId: content.id,
          assetType,
          fileName: finalName,
          filePath,
          fileUrl: assetFileUrl.trim() || undefined,
        });
      }
      setAssetFileName("");
      setAssetFileUrl("");
      setSelectedLocalFile(null);
      setIsAssetOpen(false);
    } finally {
      setUploadingAsset(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CONTENT HEADER CARD */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/content"
                className="mr-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Link>
              <span className="font-mono text-sm font-extrabold text-[#284078]">
                {content.content_code}
              </span>
              <span
                className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${getStatusBadgeStyle(
                  content.status
                )}`}
              >
                {content.status}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 text-xs font-bold ${getProgramBadgeStyle(
                  content.program?.code
                )}`}
              >
                {content.program?.name}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {content.pillar?.name}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {content.format?.name}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 text-xs font-bold ${getPriorityBadgeStyle(
                  content.priority
                )}`}
              >
                {content.priority}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {content.title}
            </h1>
          </div>

          {/* Header Actions: AI Assistant, Edit, Change Status, Assign, Duplicate, Archive, Delete (Admin) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAiOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDB02E] bg-[#DDB02E]/25 px-3 py-1.5 text-xs font-bold text-[#284078] shadow-2xs transition hover:bg-[#DDB02E]/40"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#284078]" />
              <span>✨ AI Assistant</span>
            </button>

            <button
              type="button"
              onClick={openEditModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            {isAdminOrPlanner(currentUser) && (
              <button
                type="button"
                onClick={openAssignModal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Assign PIC</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDuplicate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate</span>
            </button>

            {content.status !== "ARCHIVED" && (
              <button
                type="button"
                onClick={handleArchive}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Archive</span>
              </button>
            )}

            {canDeletePermanently(currentUser) && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Hapus permanen ${content.content_code}? Tindakan ini hanya untuk Admin dan tidak dapat dibatalkan.`
                    )
                  ) {
                    deleteContentPermanentlyAction(content.id);
                    router.push("/content");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete (Admin)</span>
              </button>
            )}
          </div>
        </div>

        {/* Workflow Transition Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Pindahkan Tahapan Workflow:
            </span>
            {validNextStatuses.map((nextSt: ContentStatus) => (
              <button
                key={nextSt}
                type="button"
                onClick={() => changeContentStatusAction(content.id, nextSt)}
                className="rounded-lg border border-[#284078]/30 bg-[#284078]/5 px-3 py-1 text-xs font-bold text-[#284078] transition hover:bg-[#284078] hover:text-white"
              >
                → {STATUS_LABELS[nextSt]}
              </button>
            ))}
          </div>

          {/* Contextual Primary Workflow Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {content.status === "REVIEW" &&
              (canReviewAndApprove(currentUser) ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRevisionOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Request Revision</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve Content</span>
                  </button>
                </>
              ) : (
                <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  Menunggu keputusan Reviewer
                </span>
              ))}

            {content.status === "REVISION" && (
              <button
                type="button"
                onClick={() =>
                  changeContentStatusAction(
                    content.id,
                    "REVIEW",
                    "Resubmitted setelah perbaikan revisi"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDB02E] px-4 py-1.5 text-xs font-bold text-[#284078] shadow-2xs hover:bg-[#c99e23]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Submit for Review (Resubmit)</span>
              </button>
            )}

            {content.status === "APPROVED" && (
              <button
                type="button"
                onClick={() =>
                  scheduleContentAction({
                    contentId: content.id,
                    scheduledAt:
                      content.scheduled_at || new Date().toISOString(),
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Set Status to Scheduled</span>
              </button>
            )}

            {content.status === "SCHEDULED" && (
              <button
                type="button"
                onClick={() => setIsPublishOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#284078] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#1e305a]"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Mark as Published</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN GRID: LEFT (Planning, Brief, Copy, Assets) & RIGHT (Assignments, Reviews, Activity) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN (8 Cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* 1. PLANNING SECTION */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h2 className="mb-4 border-b border-slate-100 pb-2.5 text-sm font-bold uppercase tracking-wider text-[#284078]">
              Planning Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Objective
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {content.objective || "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Target Audience
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {content.target_audience || "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Angle
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {content.angle || "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Publish Schedule
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#284078]">
                  {formatDateTime(content.scheduled_at)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Platforms
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {content.platforms?.map((cp) => (
                    <span
                      key={cp.id}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      <span>{cp.platform.name}</span>
                      {cp.post_url && (
                        <a
                          href={cp.post_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#284078] hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Campaign
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {content.campaign?.name || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. CREATIVE BRIEF SECTION */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="border-b border-slate-100 pb-2.5 text-sm font-bold uppercase tracking-wider text-[#284078]">
              Creative Brief
            </h2>

            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Hook Utama
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                “{content.hook || "Belum diisi"}”
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Content / Slide Structure
                </p>
                <pre className="mt-1.5 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-800">
                  {content.main_content || "Belum ada struktur slide."}
                </pre>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Visual / Video Direction
                </p>
                <pre className="mt-1.5 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-800">
                  {content.creative_brief || "Belum ada arahan visual."}
                </pre>
              </div>
            </div>
          </div>

          {/* 3. COPYWRITING & SCRIPT SECTION */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="border-b border-slate-100 pb-2.5 text-sm font-bold uppercase tracking-wider text-[#284078]">
              Copywriting & Script
            </h2>

            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Caption
              </p>
              <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800">
                <p className="whitespace-pre-wrap">
                  {content.caption || "Belum ada caption."}
                </p>
                {content.cta && (
                  <p className="mt-2 font-semibold text-[#284078]">
                    CTA: {content.cta}
                  </p>
                )}
                {content.hashtags && (
                  <p className="mt-2 font-mono text-[11px] text-slate-500">
                    {content.hashtags}
                  </p>
                )}
              </div>
            </div>

            {content.script && (
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Video / Voice Over Script
                </p>
                <pre className="mt-1.5 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-800">
                  {content.script}
                </pre>
              </div>
            )}
          </div>

          {/* 4. ASSETS SECTION (Phase 3 Asset Management) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="mb-3 flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#284078]">
                  Production Assets ({content.assets?.length || 0})
                </h2>
                <p className="text-[11px] text-slate-400">
                  Bucket: <code className="font-mono text-slate-600">content-assets/{content.content_code}/</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssetOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#284078] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1e305a]"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>+ Upload Asset</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {["ALL", "DESIGN", "VIDEO", "THUMBNAIL", "DOCUMENT", "OTHER"].map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAssetFilter(type)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                      assetFilter === type
                        ? "bg-[#284078] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {type === "DOCUMENT" ? "SOURCE / DOC" : type}
                  </button>
                )
              )}
            </div>

            {!content.assets || content.assets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
                <Upload className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Belum ada file desain, video, thumbnail, atau source file yang diupload.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {content.assets
                  .filter(
                    (ast) =>
                      assetFilter === "ALL" || ast.asset_type === assetFilter
                  )
                  .map((ast) => {
                    const isImagePreview =
                      ast.asset_type === "DESIGN" ||
                      ast.asset_type === "THUMBNAIL" ||
                      (ast.file_url || "").startsWith("data:image/");
                    const canDeleteAsset =
                      isAdminOrPlanner(currentUser) ||
                      ast.uploaded_by === currentUser.id;

                    return (
                      <div
                        key={ast.id}
                        className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-[#284078]/40"
                      >
                        <div>
                          {isImagePreview && ast.file_url && (
                            <div className="mb-2.5 h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900/5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ast.file_url}
                                alt={ast.file_name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-2">
                            <span className="rounded bg-[#284078]/10 px-2 py-0.5 text-[10px] font-bold text-[#284078]">
                              {ast.asset_type === "DOCUMENT"
                                ? "SOURCE FILE"
                                : ast.asset_type}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDateTime(ast.created_at)}
                            </span>
                          </div>

                          <p className="mt-1.5 truncate text-xs font-bold text-slate-900">
                            {ast.file_name}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                            {ast.file_path}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            Oleh: {ast.uploader?.full_name || "Tim"}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2.5">
                          {ast.file_url ? (
                            <a
                              href={ast.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#284078] hover:bg-slate-50"
                            >
                              <span>Preview / Open</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              No URL
                            </span>
                          )}

                          {canDeleteAsset && (
                            <button
                              type="button"
                              onClick={() => removeContentAssetAction(ast.id)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (4 Cols): Assignments, Reviews, Activity Timeline */}
        <div className="space-y-6 lg:col-span-4">
          {/* ASSIGNMENTS */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#284078]">
                Team Assignments
              </h2>
              <button
                type="button"
                onClick={openAssignModal}
                className="text-xs font-semibold text-[#284078] hover:underline"
              >
                Ubah PIC
              </button>
            </div>

            <div className="space-y-2.5">
              {(
                [
                  "PLANNER",
                  "COPYWRITER",
                  "DESIGNER",
                  "VIDEO_EDITOR",
                  "REVIEWER",
                ] as AssignmentType[]
              ).map((roleType) => {
                const assigned = content.assignments?.find(
                  (a) => a.assignment_type === roleType
                );
                return (
                  <div
                    key={roleType}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-500">
                      {roleType.replace("_", " ")}
                    </span>
                    <span className="font-bold text-slate-900">
                      {assigned ? assigned.user.full_name : "Belum ditugaskan"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REVIEW HISTORY */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <MessageSquare className="h-4 w-4 text-[#284078]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#284078]">
                Review & Revision History
              </h2>
            </div>

            {!content.reviews || content.reviews.length === 0 ? (
              <p className="text-xs text-slate-400">
                Belum ada catatan review pada konten ini.
              </p>
            ) : (
              <div className="space-y-3">
                {content.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`rounded-lg border p-3 text-xs ${
                      rev.decision === "APPROVED"
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-rose-200 bg-rose-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{rev.reviewer?.full_name || "Reviewer"}</span>
                      <span
                        className={
                          rev.decision === "APPROVED"
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }
                      >
                        {rev.decision}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-700">{rev.comment}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {formatDateTime(rev.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVITY TIMELINE */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Activity className="h-4 w-4 text-[#284078]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#284078]">
                Activity Timeline
              </h2>
            </div>

            {!content.activities || content.activities.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada aktivitas.</p>
            ) : (
              <ol className="relative ml-2 border-l border-slate-200 space-y-3.5">
                {content.activities.map((act) => (
                  <li key={act.id} className="ml-4">
                    <div className="absolute -left-1.5 mt-1 h-2.5 w-2.5 rounded-full bg-[#DDB02E]" />
                    <p className="text-xs font-medium text-slate-800">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(act.created_at)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: EDIT CONTENT */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${content.content_code}`}
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Title
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Objective
              </label>
              <input
                type="text"
                value={editObjective}
                onChange={(e) => setEditObjective(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Target Audience
              </label>
              <input
                type="text"
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Angle
              </label>
              <input
                type="text"
                value={editAngle}
                onChange={(e) => setEditAngle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Hook
            </label>
            <input
              type="text"
              value={editHook}
              onChange={(e) => setEditHook(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Main Content / Slide Structure
              </label>
              <textarea
                rows={4}
                value={editMain}
                onChange={(e) => setEditMain(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Creative Brief
              </label>
              <textarea
                rows={4}
                value={editBrief}
                onChange={(e) => setEditBrief(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Caption
              </label>
              <textarea
                rows={3}
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Script
              </label>
              <textarea
                rows={3}
                value={editScript}
                onChange={(e) => setEditScript(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                CTA
              </label>
              <input
                type="text"
                value={editCta}
                onChange={(e) => setEditCta(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Hashtags
              </label>
              <input
                type="text"
                value={editHashtags}
                onChange={(e) => setEditHashtags(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#284078] px-4 py-2 text-xs font-semibold text-white"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN PIC */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Assign PIC — ${content.content_code}`}
      >
        <form onSubmit={handleSaveAssignments} className="space-y-3.5">
          {[
            { label: "Planner", val: asgPlanner, set: setAsgPlanner },
            { label: "Copywriter", val: asgCopywriter, set: setAsgCopywriter },
            { label: "Designer", val: asgDesigner, set: setAsgDesigner },
            {
              label: "Video Editor",
              val: asgVideoEditor,
              set: setAsgVideoEditor,
            },
            { label: "Reviewer", val: asgReviewer, set: setAsgReviewer },
          ].map((item) => (
            <div key={item.label}>
              <label className="block text-xs font-semibold text-slate-700">
                {item.label}
              </label>
              <select
                value={item.val}
                onChange={(e) => item.set(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">-- Belum Ditugaskan --</option>
                {state.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.roles?.join(", ")})
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#284078] px-4 py-2 text-xs font-semibold text-white"
            >
              Simpan Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REQUEST REVISION */}
      <Modal
        isOpen={isRevisionOpen}
        onClose={() => setIsRevisionOpen(false)}
        title={`Request Revision — ${content.content_code}`}
      >
        <form onSubmit={handleRequestRevision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Revision Comment (Wajib diisi) *
            </label>
            <textarea
              rows={4}
              required
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              placeholder="Contoh: Slide 3 terlalu banyak teks, mohon dipadatkan dan perjelas CTA."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRevisionOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              Kirim Revisi (Status → REVISION)
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: MARK AS PUBLISHED */}
      <Modal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        title={`Mark as Published — ${content.content_code}`}
      >
        <form onSubmit={handleMarkPublished} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Post URL (Link Instagram / TikTok / YouTube) *
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
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPublishOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#284078] px-4 py-2 text-xs font-bold text-white"
            >
              Confirm Published
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPLOAD ASSET */}
      <Modal
        isOpen={isAssetOpen}
        onClose={() => setIsAssetOpen(false)}
        title={`Upload Asset — ${content.content_code}`}
      >
        <form onSubmit={handleUploadAsset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Tipe Asset
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="DESIGN">DESIGN (Final / Slide Feed)</option>
              <option value="VIDEO">VIDEO (Final Reels / TikTok / YT)</option>
              <option value="THUMBNAIL">THUMBNAIL (Cover Image)</option>
              <option value="DOCUMENT">DOCUMENT (Source File PSD/AI/Canva)</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Pilih File dari Komputer (Opsional)
            </label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedLocalFile(file);
                if (file && !assetFileName) {
                  setAssetFileName(file.name);
                }
              }}
              className="mt-1 block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#284078] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama File *
            </label>
            <input
              type="text"
              required={!selectedLocalFile}
              value={assetFileName}
              onChange={(e) => setAssetFileName(e.target.value)}
              placeholder="Contoh: PR-2026-0001_Carousel_Final.png"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 font-mono text-[10px] text-slate-400">
              Target Path:{" "}
              {buildStorageFilePath(
                content.content_code,
                assetType,
                assetFileName || selectedLocalFile?.name || "filename.ext"
              )}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              External URL / Link Canva / Drive (Opsional)
            </label>
            <input
              type="url"
              value={assetFileUrl}
              onChange={(e) => setAssetFileUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssetOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploadingAsset}
              className="rounded-lg bg-[#284078] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {uploadingAsset ? "Mengupload..." : "Simpan Asset"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: AI ASSISTANT CO-PILOT */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        initialTitle={content.title}
        initialProgramCode={content.program?.code || "CPNS"}
        initialPillarName={content.pillar?.name || "Education"}
        onApply={(patch: AiContentPatch) => {
          updateContentAction(content.id, {
            ...(patch.hook !== undefined ? { hook: patch.hook } : {}),
            ...(patch.mainContent !== undefined
              ? { main_content: patch.mainContent }
              : {}),
            ...(patch.creativeBrief !== undefined
              ? { creative_brief: patch.creativeBrief }
              : {}),
            ...(patch.caption !== undefined ? { caption: patch.caption } : {}),
            ...(patch.cta !== undefined ? { cta: patch.cta } : {}),
            ...(patch.hashtags !== undefined
              ? { hashtags: patch.hashtags }
              : {}),
            ...(patch.script !== undefined ? { script: patch.script } : {}),
          });
        }}
      />
    </div>
  );
}
