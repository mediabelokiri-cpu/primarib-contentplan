"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Check,
  Copy,
  Layers,
  MessageSquareText,
  Film,
  Zap,
  Wand2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  generateAiHooks,
  generateAiCarousel,
  generateAiCaption,
  generateAiReels,
} from "@/lib/ai-assistant";

export interface AiContentPatch {
  hook?: string;
  mainContent?: string;
  creativeBrief?: string;
  caption?: string;
  cta?: string;
  hashtags?: string;
  script?: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialProgramCode?: string;
  initialPillarName?: string;
  onApply: (patch: AiContentPatch, summaryLabel: string) => void;
}

type AiTab = "HOOK" | "CAROUSEL" | "CAPTION" | "REELS";

export function AiAssistantModal({
  isOpen,
  onClose,
  initialTitle,
  initialProgramCode = "CPNS",
  initialPillarName = "Edukatif",
  onApply,
}: AiAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<AiTab>("HOOK");
  const [topic, setTopic] = useState(initialTitle);
  const [programCode, setProgramCode] = useState(initialProgramCode);
  const [pillarName, setPillarName] = useState(initialPillarName);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTopic(initialTitle || "Strategi Menaklukkan Soal TIU & Manajemen Waktu");
      setProgramCode(initialProgramCode || "CPNS");
      setPillarName(initialPillarName || "Edukatif");
      setAppliedBanner(null);
    }
  }, [isOpen, initialTitle, initialProgramCode, initialPillarName]);

  const hooks = generateAiHooks({
    title: topic,
    programCode,
    pillarName,
  });

  const carousel = generateAiCarousel({
    title: topic,
    programCode,
    pillarName,
  });

  const captionData = generateAiCaption({
    title: topic,
    programCode,
    pillarName,
  });

  const reelsData = generateAiReels({
    title: topic,
    programCode,
    pillarName,
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const triggerApply = (patch: AiContentPatch, label: string) => {
    onApply(patch, label);
    setAppliedBanner(label);
    setTimeout(() => setAppliedBanner(null), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✨ Prima RIB AI Content Co-Pilot"
      maxWidthClass="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Top Context Input Bar */}
        <div className="rounded-xl border border-[#284078]/20 bg-gradient-to-r from-[#284078]/5 via-amber-50/60 to-white p-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#284078]">
                Topik / Judul Konten
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masukkan topik bahasan..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-[#284078] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#284078]">
                Program
              </label>
              <select
                value={programCode}
                onChange={(e) => setProgramCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#284078] focus:outline-none"
              >
                <option value="CPNS">CPNS</option>
                <option value="SEKDIN">Sekolah Kedinasan</option>
                <option value="POLRI">Polri</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#284078]">
                Content Pillar
              </label>
              <select
                value={pillarName}
                onChange={(e) => setPillarName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#284078] focus:outline-none"
              >
                <option value="Informatif">Informatif</option>
                <option value="Edukatif">Edukatif</option>
                <option value="Interaktif">Interaktif</option>
                <option value="Branding">Branding</option>
                <option value="Promosi">Promosi</option>
                <option value="Strategi & Tips">Strategi & Tips</option>
                <option value="Motivasi & Mentality">Motivasi & Mentality</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applied Notification Banner */}
        {appliedBanner && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Berhasil diterapkan ke konten: {appliedBanner}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800"
            >
              Selesai & Tutup
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2.5">
          {[
            { id: "HOOK" as AiTab, label: "1. AI Hook Generator", icon: Zap },
            {
              id: "CAROUSEL" as AiTab,
              label: "2. AI Carousel (6 Slide)",
              icon: Layers,
            },
            {
              id: "CAPTION" as AiTab,
              label: "3. AI Caption & Hashtag",
              icon: MessageSquareText,
            },
            {
              id: "REELS" as AiTab,
              label: "4. AI Reels Script",
              icon: Film,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#284078] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: AI HOOK GENERATOR */}
        {activeTab === "HOOK" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Pilih variasi kalimat pembuka (Hook) untuk Slide 1 Carousel atau 3 detik pertama Reels:
            </p>
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {hooks.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-[#284078]/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md bg-[#284078]/10 px-2 py-0.5 text-[10px] font-bold text-[#284078]">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Cocok untuk: {item.bestFor}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm font-bold text-slate-900">
                    “{item.hook}”
                  </p>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.hook, `hook-${idx}`)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      {copiedKey === `hook-${idx}` ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        triggerApply(
                          { hook: item.hook },
                          `Hook (${item.category})`
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-[#DDB02E] px-3 py-1 text-xs font-bold text-[#284078] hover:bg-[#c99e23]"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Gunakan Hook Ini</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AI CAROUSEL GENERATOR */}
        {activeTab === "CAROUSEL" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Struktur 6 Slide Carousel otomatis beserta arahan visual untuk Designer:
              </p>
              <button
                type="button"
                onClick={() =>
                  triggerApply(
                    {
                      hook: carousel.hook,
                      mainContent: carousel.formattedMainContent,
                      creativeBrief: carousel.formattedCreativeBrief,
                      cta: carousel.cta,
                    },
                    "Struktur 6 Slide Carousel + Visual Brief"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDB02E] px-3.5 py-1.5 text-xs font-bold text-[#284078] shadow-2xs hover:bg-[#c99e23]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Terapkan Struktur Carousel ke Form</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-h-[350px] overflow-y-auto pr-1">
              {carousel.slides.map((s) => (
                <div
                  key={s.slideNumber}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-[#284078] px-2 py-0.5 text-[10px] font-bold text-white">
                      Slide {s.slideNumber}
                    </span>
                    <span className="text-[11px] font-bold text-[#284078]">
                      {s.section}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {s.headline}
                  </p>
                  <p className="whitespace-pre-line text-xs text-slate-600">
                    {s.body}
                  </p>
                  <p className="rounded bg-amber-50/80 px-2 py-1 text-[11px] text-amber-900 border border-amber-200/60">
                    <strong>Visual:</strong> {s.visualDirection}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI CAPTION GENERATOR */}
        {activeTab === "CAPTION" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Caption edukatif-interaktif lengkap dengan Call to Action & Hashtags resmi Prima RIB:
              </p>
              <button
                type="button"
                onClick={() =>
                  triggerApply(
                    {
                      caption: captionData.caption,
                      cta: captionData.cta,
                      hashtags: captionData.hashtags,
                    },
                    "Caption, CTA & Hashtags"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDB02E] px-3.5 py-1.5 text-xs font-bold text-[#284078] shadow-2xs hover:bg-[#c99e23]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Terapkan Caption, CTA & Hashtags</span>
              </button>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500">
                    Generated Caption
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `${captionData.caption}\n\n${captionData.cta}\n\n${captionData.hashtags}`,
                        "caption-all"
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#284078] hover:underline"
                  >
                    {copiedKey === "caption-all" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Semua</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="mt-1.5 whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 font-sans text-xs leading-relaxed text-slate-800">
                  {captionData.caption}
                </pre>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500">
                  Call to Action (CTA)
                </span>
                <p className="mt-1 rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-semibold text-[#284078]">
                  {captionData.cta}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500">
                  Recommended Hashtags
                </span>
                <p className="mt-1 rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-xs text-slate-600">
                  {captionData.hashtags}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI REELS GENERATOR */}
        {activeTab === "REELS" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Naskah video singkat (Reels / TikTok 35 detik) dengan Hook, Voice Over, B-Roll, & Scene:
              </p>
              <button
                type="button"
                onClick={() =>
                  triggerApply(
                    {
                      hook: reelsData.hook,
                      script: reelsData.formattedScript,
                      creativeBrief: reelsData.formattedBrief,
                      cta: reelsData.cta,
                    },
                    "Naskah Reels (Hook + VO Script + B-Roll Brief)"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDB02E] px-3.5 py-1.5 text-xs font-bold text-[#284078] shadow-2xs hover:bg-[#c99e23]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Terapkan Script Reels ke Form</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  3-Second Stop-Scroller Hook
                </span>
                <p className="mt-0.5 text-xs font-bold text-slate-900">
                  “{reelsData.hook}”
                </p>
              </div>

              {reelsData.scenes.map((sc, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-[#284078] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                      {sc.timecode}
                    </span>
                    <span className="text-xs font-bold text-[#284078]">
                      {sc.scene}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800">
                    <strong>Voice Over (VO):</strong> “{sc.audioVo}”
                  </p>
                  <p className="text-xs text-slate-600">
                    <strong>Visual / B-Roll:</strong> {sc.visualBroll}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer All-in-One Action */}
        <div className="flex flex-col gap-2 border-t border-slate-200 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              onApply(
                {
                  hook: carousel.hook,
                  mainContent: carousel.formattedMainContent,
                  creativeBrief: carousel.formattedCreativeBrief,
                  caption: captionData.caption,
                  cta: captionData.cta,
                  hashtags: captionData.hashtags,
                  script: reelsData.formattedScript,
                },
                "Paket Lengkap AI (Hook, Carousel, Caption, Hashtags, & Script)"
              );
              onClose();
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#284078] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#1e305a]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#DDB02E]" />
            <span>Isi Otomatis Semua Field (All-in-One) & Tutup</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}
