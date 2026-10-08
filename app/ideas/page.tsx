"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Lightbulb,
  ArrowRight,
  Search,
  Edit3,
  CheckCircle2,
  Sparkles,
  Compass,
} from "lucide-react";
import {
  useAppStore,
  createIdeaAction,
  updateIdeaAction,
  updateIdeaStatusAction,
} from "@/lib/store";
import { IDEA_STATUSES, PRIORITY_LEVELS } from "@/lib/constants";
import {
  formatDate,
  getPriorityBadgeStyle,
  getProgramBadgeStyle,
  getStatusBadgeStyle,
} from "@/lib/utils";
import {
  generateAiIdeas,
  generateAiRecommendations,
  GeneratedIdeaItem,
} from "@/lib/ai-assistant";
import { IdeaStatus, IdeaWithRelations, PriorityLevel } from "@/types/database";
import { Modal } from "@/components/ui/Modal";

export default function IdeasPage() {
  const router = useRouter();
  const { state, enrichedIdeas, enrichedContents } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [programFilter, setProgramFilter] = useState<string>("ALL");
  const [pillarFilter, setPillarFilter] = useState<string>("ALL");

  // Modal state for Create / Edit Idea
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<IdeaWithRelations | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState("prog-cpns");
  const [pillarId, setPillarId] = useState("pil-edukatif");
  const [priority, setPriority] = useState<PriorityLevel>("HIGH");
  const [source, setSource] = useState("");

  // AI Idea Generator & Recommendation modal state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiTab, setAiTab] = useState<"GENERATOR" | "RECOMMENDATION">("GENERATOR");
  const [aiProgramId, setAiProgramId] = useState("prog-cpns");
  const [aiPillarId, setAiPillarId] = useState("pil-edukatif");
  const [aiTopic, setAiTopic] = useState("");
  const [savedAiTitles, setSavedAiTitles] = useState<string[]>([]);

  const selectedAiProgram =
    state.programs.find((p) => p.id === aiProgramId) || state.programs[0];
  const selectedAiPillar =
    state.pillars.find((p) => p.id === aiPillarId) || state.pillars[0];

  const generatedIdeas = generateAiIdeas({
    programCode: selectedAiProgram?.code || "CPNS",
    pillarName: selectedAiPillar?.name || "Education",
    customTopic: aiTopic,
  });

  const cpnsCount = enrichedContents.filter(
    (c) => c.program?.code === "CPNS"
  ).length;
  const sekdinCount = enrichedContents.filter(
    (c) => c.program?.code === "SEKDIN"
  ).length;
  const polriCount = enrichedContents.filter(
    (c) => c.program?.code === "POLRI"
  ).length;

  const aiRecommendations = generateAiRecommendations({
    cpnsCount,
    sekdinCount,
    polriCount,
  });

  const handleSaveAiIdea = (item: GeneratedIdeaItem, convertNow = false) => {
    const created = createIdeaAction({
      title: item.title,
      description: `${item.description} (Angle: ${item.angle})`,
      program_id: aiProgramId,
      pillar_id: aiPillarId,
      priority: item.priority,
      source: "Prima RIB AI Idea Generator",
    });
    setSavedAiTitles((prev) => [...prev, item.title]);
    if (convertNow) {
      setIsAiOpen(false);
      router.push(`/content/new?idea_id=${encodeURIComponent(created.id)}`);
    }
  };

  const handleSaveRecommendationIdea = (rec: {
    suggestedProgramCode: string;
    suggestedPillarName: string;
    suggestedIdeaTitle: string;
    insight: string;
  }) => {
    const prog =
      state.programs.find((p) => p.code === rec.suggestedProgramCode) ||
      state.programs[0];
    const pil =
      state.pillars.find(
        (p) => p.name.toLowerCase() === rec.suggestedPillarName.toLowerCase()
      ) || state.pillars[0];

    createIdeaAction({
      title: rec.suggestedIdeaTitle,
      description: rec.insight,
      program_id: prog?.id || "prog-cpns",
      pillar_id: pil?.id || "pil-edukatif",
      priority: "HIGH",
      source: "AI Strategy Recommendation",
    });
    setSavedAiTitles((prev) => [...prev, rec.suggestedIdeaTitle]);
  };

  const openNewIdeaModal = () => {
    setEditingIdea(null);
    setTitle("");
    setDescription("");
    setProgramId(state.programs[0]?.id || "prog-cpns");
    setPillarId(state.pillars[0]?.id || "pil-edukatif");
    setPriority("HIGH");
    setSource("");
    setIsModalOpen(true);
  };

  const openEditIdeaModal = (idea: IdeaWithRelations) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setDescription(idea.description || "");
    setProgramId(idea.program_id || state.programs[0]?.id || "prog-cpns");
    setPillarId(idea.pillar_id || state.pillars[0]?.id || "pil-edukatif");
    setPriority(idea.priority);
    setSource(idea.source || "");
    setIsModalOpen(true);
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingIdea) {
      updateIdeaAction(editingIdea.id, {
        title: title.trim(),
        description: description.trim(),
        program_id: programId,
        pillar_id: pillarId,
        priority,
        source: source.trim(),
      });
    } else {
      createIdeaAction({
        title: title.trim(),
        description: description.trim(),
        program_id: programId,
        pillar_id: pillarId,
        priority,
        source: source.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleConvertToContent = (idea: IdeaWithRelations) => {
    router.push(`/content/new?idea_id=${encodeURIComponent(idea.id)}`);
  };

  const filteredIdeas = enrichedIdeas.filter((idea) => {
    if (statusFilter !== "ALL" && idea.status !== statusFilter) return false;
    if (programFilter !== "ALL" && idea.program_id !== programFilter)
      return false;
    if (pillarFilter !== "ALL" && idea.pillar_id !== pillarFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = idea.title.toLowerCase().includes(q);
      const matchDesc = (idea.description || "").toLowerCase().includes(q);
      const matchSource = (idea.source || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSource) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Idea Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Tempat penampungan ide mentah sebelum dikonversi menjadi Content Plan resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSavedAiTitles([]);
              setIsAiOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DDB02E] bg-[#DDB02E]/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#284078] shadow-2xs transition hover:bg-[#DDB02E]/35"
          >
            <Sparkles className="h-4 w-4 text-[#284078]" />
            <span>✨ AI Idea & Strategy</span>
          </button>

          <button
            type="button"
            onClick={openNewIdeaModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#284078] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e305a]"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Idea</span>
          </button>
        </div>
      </div>


      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", ...IDEA_STATUSES].map((st) => {
            const active = statusFilter === st;
            const count =
              st === "ALL"
                ? enrichedIdeas.length
                : enrichedIdeas.filter((i) => i.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-[#284078] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{st}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active
                      ? "bg-[#DDB02E] text-[#284078]"
                      : "bg-white text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ide atau sumber..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-[#284078] focus:bg-white focus:outline-none"
            />
          </div>

          <select
            aria-label="Filter Program"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-[#284078] focus:outline-none"
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
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-[#284078] focus:outline-none"
          >
            <option value="ALL">Semua Pillar</option>
            {state.pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Idea Cards Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
          <Lightbulb className="mx-auto h-10 w-10 text-[#DDB02E]" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">
            Belum ada ide yang sesuai filter
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Tambahkan ide konten baru untuk CPNS, Sekdin, atau Polri.
          </p>
          <button
            type="button"
            onClick={openNewIdeaModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#284078] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Idea</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-[#284078]/40 hover:shadow-md"
            >
              <div>
                {/* Top Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getProgramBadgeStyle(
                        idea.program?.code
                      )}`}
                    >
                      {idea.program?.name || "GENERAL"}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {idea.pillar?.name || "Education"}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityBadgeStyle(
                        idea.priority
                      )}`}
                    >
                      {idea.priority}
                    </span>
                  </div>

                  <select
                    aria-label="Status Ide"
                    value={idea.status}
                    onChange={(e) =>
                      updateIdeaStatusAction(
                        idea.id,
                        e.target.value as IdeaStatus
                      )
                    }
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold cursor-pointer ${getStatusBadgeStyle(
                      idea.status
                    )}`}
                  >
                    {IDEA_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Idea Title & Description */}
                <h2 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                  {idea.title}
                </h2>
                {idea.description && (
                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-3">
                    {idea.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  <span>Sumber: {idea.source || "-"}</span>
                  <span>•</span>
                  <span>Oleh: {idea.creator?.full_name || "Tim"}</span>
                  <span>•</span>
                  <span>{formatDate(idea.created_at)}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                <button
                  type="button"
                  onClick={() => openEditIdeaModal(idea)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>

                {idea.status === "PLANNED" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Sudah Jadi Content</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConvertToContent(idea)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDB02E] px-3 py-1.5 text-xs font-bold text-[#284078] shadow-2xs transition hover:bg-[#c99e23]"
                  >
                    <span>Convert to Content</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create / Edit Idea */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIdea ? "Edit Idea" : "Create New Idea"}
      >
        <form onSubmit={handleSaveIdea} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Idea Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kenapa peserta sering kehabisan waktu saat TIU?"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#284078] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Description / Catatan Ide
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Gambaran isi konten, poin bahasan, atau referensi..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#284078] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Program *
              </label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#284078] focus:outline-none"
              >
                {state.programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Content Pillar *
              </label>
              <select
                value={pillarId}
                onChange={(e) => setPillarId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#284078] focus:outline-none"
              >
                {state.pillars.map((pil) => (
                  <option key={pil.id} value={pil.id}>
                    {pil.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#284078] focus:outline-none"
              >
                {PRIORITY_LEVELS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Source / Sumber Ide
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Contoh: Pertanyaan DM / Evaluasi Tryout"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#284078] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#284078] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1e305a]"
            >
              Save Idea
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal AI Idea Generator & Strategy Recommendation */}
      <Modal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        title="✨ AI Idea Generator & Strategy Recommendation"
        maxWidthClass="max-w-3xl"
      >
        <div className="space-y-4">
          {/* Sub-Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2.5">
            <button
              type="button"
              onClick={() => setAiTab("GENERATOR")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                aiTab === "GENERATOR"
                  ? "bg-[#284078] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Idea Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setAiTab("RECOMMENDATION")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                aiTab === "RECOMMENDATION"
                  ? "bg-[#284078] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>AI Content Strategy Recommendation</span>
            </button>
          </div>

          {aiTab === "GENERATOR" ? (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="rounded-xl border border-[#284078]/20 bg-gradient-to-r from-[#284078]/5 via-amber-50/60 to-white p-3.5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#284078]">
                      Program
                    </label>
                    <select
                      value={aiProgramId}
                      onChange={(e) => setAiProgramId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      {state.programs.map((prog) => (
                        <option key={prog.id} value={prog.id}>
                          {prog.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#284078]">
                      Content Pillar
                    </label>
                    <select
                      value={aiPillarId}
                      onChange={(e) => setAiPillarId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      {state.pillars.map((pil) => (
                        <option key={pil.id} value={pil.id}>
                          {pil.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#284078]">
                      Fokus Materi / Topik Khusus (Opsional)
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Misal: TIU Figural / Jasmani Polri..."
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Generated Ideas List */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {generatedIdeas.map((item, idx) => {
                  const isSaved = savedAiTitles.includes(item.title);
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-[#284078]/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getProgramBadgeStyle(
                              selectedAiProgram?.code
                            )}`}
                          >
                            {selectedAiProgram?.name}
                          </span>
                          <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                            {selectedAiPillar?.name}
                          </span>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityBadgeStyle(
                              item.priority
                            )}`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          Angle: {item.angle}
                        </span>
                      </div>

                      <h4 className="mt-2 text-sm font-bold text-slate-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-600">
                        {item.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        {isSaved ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Tersimpan di Idea Bank</span>
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveAiIdea(item, false)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#284078] bg-white px-3 py-1.5 text-xs font-bold text-[#284078] hover:bg-[#284078]/5"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Simpan ke Idea Bank</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveAiIdea(item, true)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#DDB02E] px-3 py-1.5 text-xs font-bold text-[#284078] hover:bg-[#c99e23]"
                            >
                              <span>Langsung Buat Content</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              <p className="text-xs text-slate-500">
                Rekomendasi strategi konten berdasarkan komposisi database Prima RIB saat ini (CPNS: {cpnsCount}, Sekdin: {sekdinCount}, Polri: {polriCount}):
              </p>

              {aiRecommendations.map((rec) => {
                const isSaved = savedAiTitles.includes(rec.suggestedIdeaTitle);
                return (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-[#284078]/10 px-2 py-0.5 text-[10px] font-bold text-[#284078]">
                        {rec.category.replace("_", " ")}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Saran Program: {rec.suggestedProgramCode} • {rec.suggestedPillarName}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-600">{rec.insight}</p>
                    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-950">
                      <strong>Action Item:</strong> {rec.actionItem}
                      <div className="mt-1 font-semibold text-[#284078]">
                        💡 Ide Disarankan: “{rec.suggestedIdeaTitle}”
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      {isSaved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Ide Rekomendasi Tersimpan</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSaveRecommendationIdea(rec)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#284078] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1e305a]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ Tambahkan Ide Rekomendasi ke Idea Bank</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={() => setIsAiOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

