"use client";

import React, { useState } from "react";
import {
  Plus,
  RotateCcw,
  Layers,
  Compass,
  LayoutGrid,
  Share2,
  Power,
  Check,
  Video,
} from "lucide-react";
import {
  useAppStore,
  addMasterDataAction,
  toggleMasterDataActiveAction,
  resetStoreToDefault,
} from "@/lib/store";

type SettingsTab = "programs" | "pillars" | "formats" | "platforms";

export default function SettingsPage() {
  const { state } = useAppStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("programs");

  // Form states for adding Master Data
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "programs", label: "Wilayah Konten", icon: Layers },
    { id: "pillars", label: "Pilar Konten", icon: Compass },
    { id: "formats", label: "Format Konten", icon: LayoutGrid },
    { id: "platforms", label: "Platform", icon: Share2 },
  ];

  const handleAddMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMasterDataAction(activeTab, {
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
    });

    setName("");
    setCode("");
    setDescription("");
    showToast(`Data ${name.trim()} berhasil ditambahkan!`);
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Pengaturan Master Data Prima RIB
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Atur pilihan Wilayah Konten, Pilar, Format, dan Platform yang muncul saat Input Konten.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetStoreToDefault();
            showToast("Seluruh data dikembalikan ke pengaturan default!");
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#6D4AFF]" />
          <span>Reset ke Default</span>
        </button>
      </div>

      {/* Reference Card: Skema Warna Card Kalender */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Video className="h-4 w-4 text-[#6D4AFF]" />
          <span>Skema Warna Card di Production Board & Schedule Post</span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="flex items-center gap-3 rounded-xl border-2 border-[#7E60FF] bg-[#ECE7FF] p-3">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#7E60FF]" />
            <div>
              <p className="text-xs font-bold text-slate-900">Talent Model</p>
              <p className="text-[10px] text-slate-600">Reel • Ungu</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border-2 border-[#2B7FFF] bg-[#E5F3FF] p-3">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#2B7FFF]" />
            <div>
              <p className="text-xs font-bold text-slate-900">
                Mentor / Pengajar
              </p>
              <p className="text-[10px] text-slate-600">Reel • Biru</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border-2 border-[#F97316] bg-[#FFF0E5] p-3">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#F97316]" />
            <div>
              <p className="text-xs font-bold text-slate-900">Siswa</p>
              <p className="text-[10px] text-slate-600">Reel • Oranye</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-emerald-600" />
            <div>
              <p className="text-xs font-bold text-slate-900">Carousel</p>
              <p className="text-[10px] text-slate-600">Feed • Hijau</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border-2 border-pink-400 bg-pink-50 p-3">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-pink-600" />
            <div>
              <p className="text-xs font-bold text-slate-900">Single Post</p>
              <p className="text-[10px] text-slate-600">Feed • Pink</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                active
                  ? "bg-[#7E60FF] text-white shadow-[0_8px_20px_rgba(126,96,255,0.28)]"
                  : "border border-slate-100 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add Form + Table for Active Tab */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form Tambah Item */}
        <form
          onSubmit={handleAddMaster}
          className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] lg:col-span-4"
        >
          <h3 className="text-sm font-bold text-slate-900">
            + Tambah{" "}
            {tabs.find((t) => t.id === activeTab)?.label || "Master Data"}
          </h3>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Nama <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-[#7E60FF] focus:bg-white focus:outline-none"
            />
          </div>

          {(activeTab === "programs" || activeTab === "platforms") && (
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Kode Singkat
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: CPNS / IG"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-[#7E60FF] focus:bg-white focus:outline-none"
              />
            </div>
          )}

          {activeTab !== "platforms" && (
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Keterangan
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-[#7E60FF] focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#7E60FF] py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(126,96,255,0.28)] transition hover:bg-[#694be8]"
          >
            <Plus className="h-4 w-4" />
            <span>Simpan Data</span>
          </button>
        </form>

        {/* Daftar Item */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] lg:col-span-8">
          <div className="divide-y divide-slate-100">
            {activeTab === "programs" &&
              state.programs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {item.name}
                      </span>
                      <span className="rounded-md bg-[#ECE7FF] px-2 py-0.5 text-[10px] font-bold text-[#7E60FF]">
                        {item.code}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleMasterDataActiveAction("programs", item.id)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      item.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{item.is_active ? "Aktif" : "Nonaktif"}</span>
                  </button>
                </div>
              ))}

            {activeTab === "pillars" &&
              state.pillars.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleMasterDataActiveAction("pillars", item.id)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      item.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{item.is_active ? "Aktif" : "Nonaktif"}</span>
                  </button>
                </div>
              ))}

            {activeTab === "formats" &&
              state.formats.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleMasterDataActiveAction("formats", item.id)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      item.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{item.is_active ? "Aktif" : "Nonaktif"}</span>
                  </button>
                </div>
              ))}

            {activeTab === "platforms" &&
              state.platforms.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {item.name}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {item.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleMasterDataActiveAction("platforms", item.id)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      item.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{item.is_active ? "Aktif" : "Nonaktif"}</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
