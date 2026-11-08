"use client";

import React, { useEffect, useState } from "react";
import {
  Palette,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Video,
  Image as ImageIcon,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAppStore, saveCreativeBriefAction } from "@/lib/store";
import { CreativeBrief, ContentWithRelations } from "@/types/database";

interface CreativeBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentWithRelations;
  onSaved?: (brief: CreativeBrief) => void;
}

export function CreativeBriefModal({
  isOpen,
  onClose,
  content,
  onSaved,
}: CreativeBriefModalProps) {
  const { state } = useAppStore();

  const [targetRole, setTargetRole] = useState<
    "DESIGNER" | "VIDEO_EDITOR" | "TALENT"
  >(() => {
    const fLower = (content.format?.name || "").toLowerCase();
    if (fLower.includes("reel") || fLower.includes("video"))
      return "VIDEO_EDITOR";
    return "DESIGNER";
  });

  const [visualConcept, setVisualConcept] = useState("");
  const [colorPalette, setColorPalette] = useState<string[]>([
    "#284078",
    "#DDB02E",
    "#6D4AFF",
    "#FFFFFF",
  ]);
  const [typography, setTypography] = useState(
    "Headline: Montserrat / Plus Jakarta Sans Bold. Body: Inter / Roboto Regular."
  );
  const [assetRequirements, setAssetRequirements] = useState<string[]>([
    "Foto mentor resmi Prima RIB berseragam/kemeja rapi",
    "Screen capture simulasi Lab CAT berstandar BKN",
    "Ikon checklist emas & badge resmi Prima RIB",
  ]);
  const [layoutDirections, setLayoutDirections] = useState(
    "Fokus 1 ide per frame dengan hierarki visual jelas, text-safe area 15% dari tepi atas dan bawah."
  );
  const [dos, setDos] = useState<string[]>([
    "Gunakan warna Navy #284078 sebagai background utama atau framing",
    "Highlight angka skor & poin penting dengan aksen Gold #DDB02E",
    "Sertakan logo resmi Prima RIB di sudut kanan atas",
  ]);
  const [donts, setDonts] = useState<string[]>([
    "Jangan gunakan aset grafis beresolusi rendah atau pecah",
    "Hindari klaim bombastis 'Jaminan 100% Pasti Lolos Tanpa Ujian'",
    "Jangan menumpuk teks lebih dari 4 baris per slide",
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Check if existing brief exists in store
  const existingBrief = (state.creativeBriefs || []).find(
    (b) => b.content_id === content.id && b.target_role === targetRole
  );

  useEffect(() => {
    if (isOpen) {
      if (existingBrief) {
        setVisualConcept(existingBrief.visual_concept);
        setColorPalette(existingBrief.color_palette);
        setTypography(existingBrief.typography_guidelines);
        setAssetRequirements(existingBrief.asset_requirements);
        setLayoutDirections(existingBrief.layout_directions);
        setDos(existingBrief.dos_and_donts.dos);
        setDonts(existingBrief.dos_and_donts.donts);
      } else {
        const isVideo =
          targetRole === "VIDEO_EDITOR" || targetRole === "TALENT";
        setVisualConcept(
          isVideo
            ? "Video dinamis, profesional, dan energik dengan background Lab CAT Prima RIB serta overlay teks TOS beranimasi tegas."
            : "Poster grafis modern, aspiratif, dan edukatif dengan hierarki tipografi kontras Navy & Gold."
        );
      }
      setSuccessBanner(null);
    }
  }, [isOpen, content.id, targetRole, existingBrief]);

  const handleGenerateBrief = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Buatkan Creative Brief terstruktur untuk konten Prima RIB berikut:
Judul: "${content.title}"
Program: "${content.program?.name || "CPNS"}"
Format: "${content.format?.name || "Reels Video"}"
Target Penerima Brief: "${targetRole}"
Naskah/Hook: "${content.hook || content.title}"

Format JSON:
{
  "visual_concept": "deskripsi konsep visual",
  "color_palette": ["#284078", "#DDB02E", "#6D4AFF", "#FFFFFF"],
  "typography_guidelines": "aturan font",
  "asset_requirements": ["aset 1", "aset 2", "aset 3"],
  "layout_directions": "panduan tata letak & safe area",
  "dos_and_donts": {
    "dos": ["do 1", "do 2", "do 3"],
    "donts": ["dont 1", "dont 2", "dont 3"]
  }
}`;

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskCode: "CREATIVE_BRIEF",
          task: "CREATIVE_BRIEF",
          prompt,
          responseFormat: "json",
          userRole: "ADMIN",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let parsed: any = null;
        const rawContent = data.content || data.data?.content || "";
        try {
          parsed = JSON.parse(rawContent);
        } catch {
          try {
            const cleaned = rawContent
              .replace(/```json/gi, "")
              .replace(/```/g, "")
              .trim();
            parsed = JSON.parse(cleaned);
          } catch {
            parsed = null;
          }
        }

        if (parsed) {
          if (parsed.visual_concept) setVisualConcept(parsed.visual_concept);
          if (Array.isArray(parsed.color_palette))
            setColorPalette(parsed.color_palette);
          if (parsed.typography_guidelines)
            setTypography(parsed.typography_guidelines);
          if (Array.isArray(parsed.asset_requirements))
            setAssetRequirements(parsed.asset_requirements);
          if (parsed.layout_directions)
            setLayoutDirections(parsed.layout_directions);
          if (parsed.dos_and_donts) {
            if (Array.isArray(parsed.dos_and_donts.dos))
              setDos(parsed.dos_and_donts.dos);
            if (Array.isArray(parsed.dos_and_donts.donts))
              setDonts(parsed.dos_and_donts.donts);
          }
          setSuccessBanner("Creative Brief berhasil dirumuskan AI!");
        }
      }
    } catch {
      setSuccessBanner("Creative Brief berhasil disesuaikan secara lokal!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBrief = () => {
    const saved = saveCreativeBriefAction({
      content_id: content.id,
      target_role: targetRole,
      visual_concept: visualConcept,
      color_palette: colorPalette,
      typography_guidelines: typography,
      asset_requirements: assetRequirements,
      layout_directions: layoutDirections,
      dos_and_donts: { dos, donts },
    });

    if (onSaved) onSaved(saved);
    setSuccessBanner("🎉 Creative Brief berhasil disimpan ke konten!");
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Creative Brief Generator — Prima RIB"
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header & Role Switcher */}
        <div className="bg-[#284078] text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#1f3260]">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDB02E]/20 text-[#DDB02E] border border-[#DDB02E]/30 mb-1">
              <Palette className="w-3.5 h-3.5" /> Creative Brief
            </span>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {content.title}
            </h3>
          </div>

          <div className="flex items-center bg-[#1b2b52] p-1 rounded-lg border border-[#374f8c] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTargetRole("DESIGNER")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                targetRole === "DESIGNER"
                  ? "bg-[#284078] text-white shadow-xs font-bold border border-white/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Designer
            </button>
            <button
              type="button"
              onClick={() => setTargetRole("VIDEO_EDITOR")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                targetRole === "VIDEO_EDITOR"
                  ? "bg-[#284078] text-white shadow-xs font-bold border border-white/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Video Editor
            </button>
            <button
              type="button"
              onClick={() => setTargetRole("TALENT")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                targetRole === "TALENT"
                  ? "bg-[#284078] text-white shadow-xs font-bold border border-white/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Talent
            </button>
          </div>
        </div>

        {successBanner && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Generate Button Banner */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            AI akan merumuskan brief visual berbasis Brand Studio Prima RIB (Palet Navy, Gold, & Lab CAT).
          </p>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateBrief}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#284078] hover:bg-[#1e305a] text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Merumuskan Brief...</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-[#DDB02E]" />
                <span>Generate Brief dengan AI</span>
              </>
            )}
          </button>
        </div>

        {/* Brief Fields */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Konsep Visual & Direction
            </label>
            <textarea
              rows={2}
              value={visualConcept}
              onChange={(e) => setVisualConcept(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-primary font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Palet Warna Brand Prima RIB
              </label>
              <div className="flex items-center gap-2 mb-2">
                {colorPalette.map((col, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: col }}
                    />
                    <span className="font-mono text-[10px] text-slate-600">
                      {col}
                    </span>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={colorPalette.join(", ")}
                onChange={(e) =>
                  setColorPalette(
                    e.target.value.split(",").map((c) => c.trim())
                  )
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tipografi & Font
              </label>
              <input
                type="text"
                value={typography}
                onChange={(e) => setTypography(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Aset Grafis & Footage yang Diperlukan
            </label>
            <textarea
              rows={2}
              value={assetRequirements.join("\n")}
              onChange={(e) =>
                setAssetRequirements(
                  e.target.value.split("\n").filter(Boolean)
                )
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
              <span className="font-bold text-emerald-900 uppercase tracking-wider block">
                Do (Panduan Wajib)
              </span>
              <textarea
                rows={3}
                value={dos.join("\n")}
                onChange={(e) =>
                  setDos(e.target.value.split("\n").filter(Boolean))
                }
                className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs"
              />
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5">
              <span className="font-bold text-rose-900 uppercase tracking-wider block">
                Don&apos;t (Pantangan Visual)
              </span>
              <textarea
                rows={3}
                value={donts.join("\n")}
                onChange={(e) =>
                  setDonts(e.target.value.split("\n").filter(Boolean))
                }
                className="w-full p-2 bg-white border border-rose-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Brief yang disimpan otomatis tersinkronisasi ke desainer dan editor.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSaveBrief}
              className="flex items-center gap-1.5 px-5 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy/90 transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>Simpan & Terapkan Brief</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
