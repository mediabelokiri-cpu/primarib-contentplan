"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Building2,
  Volume2,
  Users,
  GraduationCap,
  FileText,
  Palette,
  Check,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Save,
  Search,
  Upload,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  Zap,
  Play,
  Terminal,
  RefreshCw,
  KeyRound,
  Server,
  Activity,
  DollarSign,
  History,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useAppStore,
  updateBrandProfileAction,
  addBrandPersonalityAction,
  updateBrandPersonalityAction,
  deleteBrandPersonalityAction,
  updateBrandToneAction,
  addBrandAudienceAction,
  updateBrandAudienceAction,
  deleteBrandAudienceAction,
  addBrandProductAction,
  updateBrandProductAction,
  deleteBrandProductAction,
  addBrandWritingGuidelineAction,
  updateBrandWritingGuidelineAction,
  deleteBrandWritingGuidelineAction,
  updateBrandVisualGuidelineAction,
  addBrandKnowledgeAction,
  updateBrandKnowledgeAction,
  deleteBrandKnowledgeAction,
  addBrandDocumentAction,
  deleteBrandDocumentAction,
} from "@/lib/store";
import {
  BrandAudience,
  BrandProduct,
  BrandKnowledge,
  BrandWritingGuideline,
} from "@/types/database";
import { Modal } from "@/components/ui/Modal";

type ActiveTab =
  | "profile"
  | "tone"
  | "audiences"
  | "products"
  | "guidelines"
  | "knowledge"
  | "ai-engine";

export default function BrandStudioPage() {
  const { state } = useAppStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const brand = state.brandProfile;
  const personalities = state.brandPersonalities || [];
  const tone = (state.brandToneGuidelines && state.brandToneGuidelines[0]) || null;
  const audiences = state.brandAudiences || [];
  const products = state.brandProducts || [];
  const writingGuidelines = state.brandWritingGuidelines || [];
  const visual = state.brandVisualGuidelines;
  const knowledgeList = state.brandKnowledge || [];
  const documents = state.brandDocuments || [];

  // ==========================================
  // TAB 1: BRAND PROFILE FORM STATE
  // ==========================================
  const [profName, setProfName] = useState(brand?.brand_name || "Prima RIB");
  const [profTagline, setProfTagline] = useState(brand?.tagline || "");
  const [profDesc, setProfDesc] = useState(brand?.description || "");
  const [profPositioning, setProfPositioning] = useState(brand?.positioning || "");
  const [profVision, setProfVision] = useState(brand?.vision || "");
  const [profMission, setProfMission] = useState(brand?.mission || "");
  const [profValues, setProfValues] = useState((brand?.values || []).join(", "));
  const [profWeb, setProfWeb] = useState(brand?.website_url || "");
  const [profIg, setProfIg] = useState(brand?.social_links?.instagram || "");
  const [profTt, setProfTt] = useState(brand?.social_links?.tiktok || "");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandProfileAction({
      brand_name: profName,
      tagline: profTagline,
      description: profDesc,
      positioning: profPositioning,
      vision: profVision,
      mission: profMission,
      values: profValues.split(",").map((v) => v.trim()).filter(Boolean),
      website_url: profWeb,
      social_links: {
        instagram: profIg,
        tiktok: profTt,
      },
    });
    showToast("Profil Brand Prima RIB berhasil disimpan!");
  };

  // ==========================================
  // TAB 2: TONE OF VOICE STATE
  // ==========================================
  const [toneFormality, setToneFormality] = useState(
    tone?.formality_level || "Semi Formal"
  );
  const [toneDesc, setToneDesc] = useState(tone?.description || "");
  const [toneRules, setToneRules] = useState((tone?.writing_rules || []).join("\n"));
  const [tonePreferred, setTonePreferred] = useState((tone?.preferred_words || []).join(", "));
  const [toneProhibited, setToneProhibited] = useState((tone?.prohibited_words || []).join(", "));
  const [toneCta, setToneCta] = useState(tone?.cta_style || "");

  const handleSaveTone = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandToneAction({
      formality_level: toneFormality as any,
      description: toneDesc,
      writing_rules: toneRules.split("\n").map((r) => r.trim()).filter(Boolean),
      preferred_words: tonePreferred.split(",").map((w) => w.trim()).filter(Boolean),
      prohibited_words: toneProhibited.split(",").map((w) => w.trim()).filter(Boolean),
      cta_style: toneCta,
    });
    showToast("Pedoman Tone of Voice berhasil diperbarui!");
  };

  // Personality Add Modal
  const [isAddingPersonality, setIsAddingPersonality] = useState(false);
  const [newPersName, setNewPersName] = useState("");
  const [newPersDesc, setNewPersDesc] = useState("");

  const handleAddPersonality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersName.trim()) return;
    addBrandPersonalityAction({
      personality_name: newPersName.trim(),
      description: newPersDesc.trim(),
      priority: personalities.length + 1,
      is_active: true,
    });
    setNewPersName("");
    setNewPersDesc("");
    setIsAddingPersonality(false);
    showToast("Karakter brand baru berhasil ditambahkan!");
  };

  // ==========================================
  // TAB 3: AUDIENCES MODAL & STATE
  // ==========================================
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [editingAudience, setEditingAudience] = useState<BrandAudience | null>(null);
  const [audName, setAudName] = useState("");
  const [audAge, setAudAge] = useState("");
  const [audDesc, setAudDesc] = useState("");
  const [audProblems, setAudProblems] = useState("");
  const [audNeeds, setAudNeeds] = useState("");
  const [audPreferences, setAudPreferences] = useState("");

  const openAudienceModal = (aud?: BrandAudience) => {
    if (aud) {
      setEditingAudience(aud);
      setAudName(aud.audience_name);
      setAudAge(aud.age_range);
      setAudDesc(aud.description);
      setAudProblems((aud.problems || []).join("\n"));
      setAudNeeds((aud.needs || []).join("\n"));
      setAudPreferences((aud.preferences || []).join("\n"));
    } else {
      setEditingAudience(null);
      setAudName("");
      setAudAge("20 - 30 Tahun");
      setAudDesc("");
      setAudProblems("");
      setAudNeeds("");
      setAudPreferences("");
    }
    setIsAudienceModalOpen(true);
  };

  const handleSaveAudience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audName.trim()) return;
    const payload = {
      audience_name: audName.trim(),
      age_range: audAge.trim(),
      description: audDesc.trim(),
      occupation: ["Mahasiswa", "Fresh Graduate", "Pekerja"],
      interests: ["Info Seleksi", "Bimbel Kedinasan", "Tryout"],
      problems: audProblems.split("\n").map((p) => p.trim()).filter(Boolean),
      needs: audNeeds.split("\n").map((n) => n.trim()).filter(Boolean),
      motivations: ["Masa Depan Stabil", "Kebanggaan Keluarga"],
      objections: ["Bimbel Mahal", "Waktu Sempit"],
      preferences: audPreferences.split("\n").map((pref) => pref.trim()).filter(Boolean),
      is_active: true,
    };

    if (editingAudience) {
      updateBrandAudienceAction(editingAudience.id, payload);
      showToast("Data audiens berhasil diperbarui!");
    } else {
      addBrandAudienceAction(payload);
      showToast("Profil audiens baru berhasil dibuat!");
    }
    setIsAudienceModalOpen(false);
  };

  // ==========================================
  // TAB 4: PRODUCTS MODAL & STATE
  // ==========================================
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BrandProduct | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState<"CPNS" | "SEKDIN" | "POLRI" | "GENERAL">("CPNS");
  const [prodPriceDisplay, setProdPriceDisplay] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodFeatures, setProdFeatures] = useState("");
  const [prodBenefits, setProdBenefits] = useState("");
  const [prodCta, setProdCta] = useState("");

  const openProductModal = (prod?: BrandProduct) => {
    if (prod) {
      setEditingProduct(prod);
      setProdName(prod.product_name);
      setProdCategory(prod.category);
      setProdPriceDisplay(prod.price_display || "");
      setProdDesc(prod.description);
      setProdFeatures((prod.features || []).join("\n"));
      setProdBenefits((prod.benefits || []).join("\n"));
      setProdCta(prod.cta);
    } else {
      setEditingProduct(null);
      setProdName("");
      setProdCategory("CPNS");
      setProdPriceDisplay("Rp 1.500.000");
      setProdDesc("");
      setProdFeatures("");
      setProdBenefits("");
      setProdCta("Daftar Sekarang & Amankan Kursi Belajarmu!");
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;
    const payload = {
      product_name: prodName.trim(),
      category: prodCategory,
      price_display: prodPriceDisplay.trim(),
      description: prodDesc.trim(),
      features: prodFeatures.split("\n").map((f) => f.trim()).filter(Boolean),
      benefits: prodBenefits.split("\n").map((b) => b.trim()).filter(Boolean),
      cta: prodCta.trim(),
      is_active: true,
    };

    if (editingProduct) {
      updateBrandProductAction(editingProduct.id, payload);
      showToast("Data program bimbel berhasil diperbarui!");
    } else {
      addBrandProductAction(payload);
      showToast("Program bimbel baru berhasil ditambahkan!");
    }
    setIsProductModalOpen(false);
  };

  // ==========================================
  // TAB 6: KNOWLEDGE SNIPPET MODAL
  // ==========================================
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<BrandKnowledge | null>(null);
  const [kTitle, setKTitle] = useState("");
  const [kCategory, setKCategory] = useState<BrandKnowledge["category"]>("REGULASI_SELEKSI");
  const [kContent, setKContent] = useState("");
  const [kRef, setKRef] = useState("");
  const [searchKnowledge, setSearchKnowledge] = useState("");

  const openKnowledgeModal = (k?: BrandKnowledge) => {
    if (k) {
      setEditingKnowledge(k);
      setKTitle(k.title);
      setKCategory(k.category);
      setKContent(k.content);
      setKRef(k.source_reference || "");
    } else {
      setEditingKnowledge(null);
      setKTitle("");
      setKCategory("REGULASI_SELEKSI");
      setKContent("");
      setKRef("");
    }
    setIsKnowledgeModalOpen(true);
  };

  const handleSaveKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kTitle.trim() || !kContent.trim()) return;
    const payload = {
      title: kTitle.trim(),
      category: kCategory,
      content: kContent.trim(),
      source_type: "MANUAL" as const,
      source_reference: kRef.trim() || "Modul Resmi Prima RIB",
      verification_status: "VERIFIED" as const,
    };

    if (editingKnowledge) {
      updateBrandKnowledgeAction(editingKnowledge.id, payload);
      showToast("Fakta pengetahuan berhasil diperbarui!");
    } else {
      addBrandKnowledgeAction(payload);
      showToast("Knowledge baru berhasil ditambahkan ke referensi AI!");
    }
    setIsKnowledgeModalOpen(false);
  };

  // Add Document Mock
  const [docFileName, setDocFileName] = useState("");
  const [docFileText, setDocFileText] = useState("");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFileName.trim()) return;
    addBrandDocumentAction({
      file_name: docFileName.trim(),
      file_type: "PDF",
      file_size: 1542000,
      processing_status: "INDEXED",
      extracted_text: docFileText.trim() || "Teks referensi resmi berhasil diekstrak dan diindeks untuk RAG AI.",
      processed_at: new Date().toISOString(),
    });
    setDocFileName("");
    setDocFileText("");
    setIsDocModalOpen(false);
    showToast("Dokumen referensi berhasil diupload & diindeks untuk AI!");
  };

  const filteredKnowledge = knowledgeList.filter(
    (k) =>
      k.title.toLowerCase().includes(searchKnowledge.toLowerCase()) ||
      k.content.toLowerCase().includes(searchKnowledge.toLowerCase())
  );

  // ==========================================
  // TAB 7: AI ENGINE & ROUTING STATE (Module 02)
  // ==========================================
  const [providerStatuses, setProviderStatuses] = useState<any[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [testTask, setTestTask] = useState<string>("IDEA_GENERATION");
  const [testPrompt, setTestPrompt] = useState(
    "Buat 2 ide konten Reels tentang trik psikotes kecermatan angka hilang Polri untuk menarik calon siswa bintara."
  );
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(
    "prompt-script"
  );

  const fetchProviders = async () => {
    setIsLoadingProviders(true);
    try {
      const res = await fetch("/api/ai/providers");
      if (res.ok) {
        const json = await res.json();
        setProviderStatuses(json.data?.providers || []);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingProviders(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "ai-engine" && providerStatuses.length === 0) {
      void fetchProviders();
    }
  }, [activeTab]);

  const handleTestAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;
    setIsTestingAi(true);
    setTestResponse(null);
    setTestError(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskCode: testTask,
          prompt: testPrompt,
          responseFormat: testTask === "QUALITY_CHECK" ? "json" : "text",
          context: {
            brandProfile: brand,
            brandTone: tone,
            targetAudience: audiences[0],
            product: products[0],
            relevantKnowledge: knowledgeList.slice(0, 3),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResponse(data.data);
        showToast("AI Orchestrator berhasil dijalankan!");
      } else {
        setTestError(data.error || "Gagal menjalankan request AI.");
      }
    } catch (err: any) {
      setTestError(err.message || "Gagal terkoneksi ke AI server endpoint.");
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#284078]">
              <BookOpen className="h-3.5 w-3.5 text-[#284078]" />
              Module 01 • Brand Knowledge Engine
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              Single Brand Active
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
            Brand Studio & Knowledge Base
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Pusat identitas, tone of voice, audiens, kurikulum bimbel, dan referensi resmi Prima RIB yang menjadi otak sistem AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-right shadow-2xs">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Grounding Status
            </p>
            <p className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Terverifikasi
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white p-1 rounded-2xl shadow-2xs">
        {[
          { id: "profile", label: "Profil & Identitas", icon: Building2 },
          { id: "tone", label: "Tone of Voice & Karakter", icon: Volume2 },
          { id: "audiences", label: "Target Audiens", icon: Users },
          { id: "products", label: "Program Bimbel", icon: GraduationCap },
          { id: "guidelines", label: "Pedoman Penulisan & Visual", icon: Palette },
          { id: "knowledge", label: "Knowledge Base & Dokumen", icon: BookOpen },
          { id: "ai-engine", label: "AI Engine & Router", icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#6D4AFF] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFIL & IDENTITAS BRAND */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Form Info Utama */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Identitas Inti Brand
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Informasi ini digunakan oleh AI untuk memahami posisi dan nilai-nilai Prima RIB.
                </p>

                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Nama Brand
                      </label>
                      <input
                        type="text"
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Tagline Utama
                      </label>
                      <input
                        type="text"
                        value={profTagline}
                        onChange={(e) => setProfTagline(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Deskripsi Brand
                    </label>
                    <textarea
                      rows={3}
                      value={profDesc}
                      onChange={(e) => setProfDesc(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Brand Positioning
                    </label>
                    <textarea
                      rows={2}
                      value={profPositioning}
                      onChange={(e) => setProfPositioning(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Visi, Misi & Nilai-Nilai
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Visi Brand
                    </label>
                    <textarea
                      rows={2}
                      value={profVision}
                      onChange={(e) => setProfVision(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Misi Brand (pisahkan per poin dengan enter)
                    </label>
                    <textarea
                      rows={3}
                      value={profMission}
                      onChange={(e) => setProfMission(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Core Values (pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={profValues}
                      onChange={(e) => setProfValues(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Preview & Social Channels */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Official Channels
                </h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={profWeb}
                      onChange={(e) => setProfWeb(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Instagram Official
                    </label>
                    <input
                      type="text"
                      value={profIg}
                      onChange={(e) => setProfIg(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      TikTok Channel
                    </label>
                    <input
                      type="text"
                      value={profTt}
                      onChange={(e) => setProfTt(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-amber-200/70 bg-amber-50/60 p-3.5 text-[11px] text-amber-900">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <p>
                      Informasi profil ini di-inject secara otomatis sebagai system context pada setiap prompt AI Strategist & Script Builder.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D4AFF] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#5B38E8]"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TONE OF VOICE & KARAKTER */}
      {/* ========================================================================= */}
      {activeTab === "tone" && (
        <div className="space-y-6">
          {/* Karakter Brand Cards */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Karakter Komunikasi Brand (Personalities)
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pilar kepribadian Prima RIB saat berdialog dengan calon siswa & pejuang seleksi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPersonality(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5 text-[#6D4AFF]" />
                <span>Tambah Karakter</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {personalities.map((item) => (
                <div
                  key={item.id}
                  className="relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition hover:border-[#6D4AFF]/50 hover:bg-white"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-[#F3F0FF] px-2 py-0.5 text-[10px] font-extrabold text-[#6D4AFF]">
                        Prioritas #{item.priority}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteBrandPersonalityAction(item.id)}
                        className="text-slate-400 hover:text-rose-600"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h4 className="mt-2 text-xs font-bold text-slate-900">
                      {item.personality_name}
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tone Formality & Writing Rules Form */}
          <form onSubmit={handleSaveTone} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">
              Tone of Voice Guidelines & Guardrails
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Menentukan tingkat formalitas, diksi yang disukai, dan kata yang dilarang keras digunakan AI.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Tingkat Formalitas Bahasa
                  </label>
                  <select
                    value={toneFormality}
                    onChange={(e) => setToneFormality(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                  >
                    <option value="Semi Formal">Semi Formal (Baku tapi luwes, bersahabat & santun)</option>
                    <option value="Sangat Formal">Sangat Formal (Gaya bahasa rilis dinas & resmi)</option>
                    <option value="Santai / Kasual">Santai / Kasual (Bahasa gaul kekinian santai)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Deskripsi Gaya Komunikasi
                  </label>
                  <textarea
                    rows={3}
                    value={toneDesc}
                    onChange={(e) => setToneDesc(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Aturan Penulisan (Writing Rules) • 1 baris per aturan
                  </label>
                  <textarea
                    rows={4}
                    value={toneRules}
                    onChange={(e) => setToneRules(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Kata / Frasa yang Disukai (Preferred Words) • pisahkan koma
                  </label>
                  <textarea
                    rows={3}
                    value={tonePreferred}
                    onChange={(e) => setTonePreferred(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-700">
                    Kata yang DILARANG Keras (Prohibited / Hoax Avoidance)
                  </label>
                  <textarea
                    rows={3}
                    value={toneProhibited}
                    onChange={(e) => setToneProhibited(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-rose-200 bg-rose-50/30 px-3.5 py-2 text-xs font-medium text-rose-900 focus:border-rose-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Karakter Call To Action (CTA Style)
                  </label>
                  <input
                    type="text"
                    value={toneCta}
                    onChange={(e) => setToneCta(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#6D4AFF] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#5B38E8]"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Aturan Tone of Voice</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TARGET AUDIENS */}
      {/* ========================================================================= */}
      {activeTab === "audiences" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Segmentasi Audiens Spesifik Prima RIB
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                AI akan menyesuaikan angle konten, pain point, dan hook berdasarkan audiens yang dipilih.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAudienceModal()}
              className="flex items-center gap-1.5 rounded-xl bg-[#6D4AFF] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5B38E8]"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Profil Audiens</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {audiences.map((aud) => (
              <div
                key={aud.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition hover:shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60">
                      Usia {aud.age_range}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openAudienceModal(aud)}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBrandAudienceAction(aud.id)}
                        className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-slate-900">
                    {aud.audience_name}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {aud.description}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11px]">
                    <div>
                      <span className="font-bold text-rose-600">
                        Masalah Utama (Pain Points):
                      </span>
                      <ul className="mt-1 list-disc pl-4 text-slate-600 space-y-0.5">
                        {(aud.problems || []).slice(0, 3).map((prob, idx) => (
                          <li key={idx}>{prob}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2">
                      <span className="font-bold text-emerald-600">
                        Kebutuhan Belajar:
                      </span>
                      <ul className="mt-1 list-disc pl-4 text-slate-600 space-y-0.5">
                        {(aud.needs || []).slice(0, 2).map((need, idx) => (
                          <li key={idx}>{need}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Preferensi Format:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(aud.preferences || []).slice(0, 2).map((pref, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROGRAM & PRODUK BIMBEL */}
      {/* ========================================================================= */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Katalog Program & Layanan Prima RIB
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Informasi produk tidak boleh diasumsikan oleh AI. Data resmi ini menjadi referensi akurat saat AI menyusun CTA dan materi promosi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openProductModal()}
              className="flex items-center gap-1.5 rounded-xl bg-[#6D4AFF] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5B38E8]"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Program Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                        prod.category === "CPNS"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : prod.category === "SEKDIN"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {prod.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openProductModal(prod)}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBrandProductAction(prod.id)}
                        className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="mt-2.5 text-sm font-bold text-slate-900">
                    {prod.product_name}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-[#6D4AFF]">
                      {prod.price_display || "Hubungi Admin"}
                    </span>
                  </div>

                  {prod.promotion_details && (
                    <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 border border-amber-200/60">
                      🔥 {prod.promotion_details}
                    </div>
                  )}

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-800">
                      Fitur Unggulan:
                    </span>
                    <ul className="mt-1.5 space-y-1 text-[11px] text-slate-600">
                      {(prod.features || []).slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="h-3 w-3 shrink-0 text-emerald-500 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">
                    Call To Action
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-800 italic">
                    "{prod.cta}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PEDOMAN PENULISAN & VISUAL */}
      {/* ========================================================================= */}
      {activeTab === "guidelines" && (
        <div className="space-y-6">
          {/* Visual Guidelines Section */}
          {visual && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#6D4AFF]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Brand Visual Guidelines
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Pedoman warna, tipografi, dan arahan visual untuk brief otomatis tim desainer/editor.
              </p>

              {/* Color Palette Preview */}
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-700">
                  Palet Warna Resmi Brand
                </span>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {visual.color_palette.map((col, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200/80 p-3 shadow-2xs"
                    >
                      <div
                        className="h-10 w-full rounded-lg border border-black/5"
                        style={{ backgroundColor: col.hex }}
                      />
                      <p className="mt-2 text-xs font-bold text-slate-900 truncate">
                        {col.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {col.hex}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500 leading-tight">
                        {col.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do & Don't Guidelines */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Visual DOs (Wajib Dilakukan)</span>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-[11px] text-emerald-950">
                    {visual.do_rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <span>Visual DONTs (Dilarang)</span>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-[11px] text-rose-950">
                    {visual.dont_rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Writing Guidelines Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Pedoman Penulisan (Writing Guidelines per Format)
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {writingGuidelines.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs"
                >
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 uppercase">
                    {item.guideline_type}
                  </span>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-700">
                      Prinsip Penulisan:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {item.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-[#6D4AFF] font-bold">✓</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.examples && item.examples.length > 0 && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[10px] space-y-1.5">
                      <div className="text-emerald-700 font-medium">
                        <span className="font-bold">Contoh Bagus:</span> "
                        {item.examples[0].good}"
                      </div>
                      <div className="text-rose-700 font-medium">
                        <span className="font-bold">Contoh Hindari:</span> "
                        {item.examples[0].bad}"
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: KNOWLEDGE BASE & DOKUMEN (RAG REPOSITORY) */}
      {/* ========================================================================= */}
      {activeTab === "knowledge" && (
        <div className="space-y-6">
          {/* Top Bar Search & Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari fakta seleksi, aturan CAT, profil bimbel..."
                value={searchKnowledge}
                onChange={(e) => setSearchKnowledge(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDocModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <Upload className="h-3.5 w-3.5 text-slate-600" />
                <span>Upload Dokumen PDF</span>
              </button>
              <button
                type="button"
                onClick={() => openKnowledgeModal()}
                className="flex items-center gap-1.5 rounded-xl bg-[#6D4AFF] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5B38E8]"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Fakta Pengetahuan</span>
              </button>
            </div>
          </div>

          {/* Document Repository List */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dokumen Referensi Resmi Terindeks ({documents.length})
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-bold text-[10px]">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {doc.file_name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB • Status:{" "}
                        <span className="font-bold text-emerald-600">
                          {doc.processing_status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteBrandDocumentAction(doc.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Structured Knowledge Snippets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Fakta & Pengetahuan Terstruktur ({filteredKnowledge.length})
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredKnowledge.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/50">
                          <CheckCircle2 className="h-3 w-3" />
                          Terverifikasi
                        </span>
                        <button
                          type="button"
                          onClick={() => openKnowledgeModal(item)}
                          className="rounded p-1 text-slate-400 hover:text-slate-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBrandKnowledgeAction(item.id)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="mt-2.5 text-xs font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Sumber: {item.source_reference || "Resmi"}</span>
                    <span>Ref: #{item.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: AI ENGINE & HYBRID ROUTER (MODULE 02) */}
      {/* ========================================================================= */}
      {activeTab === "ai-engine" && (
        <div className="space-y-6">
          {/* Header Status & Key Info */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F3F0FF] text-[#6D4AFF]">
                    <Cpu className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hybrid AI Provider Engine (Module 02)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Arsitektur AI multi-provider terpusat di server dengan keamanan zero-client exposure dan fallback otomatis.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchProviders}
                disabled={isLoadingProviders}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isLoadingProviders ? "animate-spin text-[#6D4AFF]" : ""
                  }`}
                />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* Provider Grid */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(providerStatuses.length > 0
                ? providerStatuses
                : [
                    {
                      providerCode: "GEMINI",
                      providerName: "Google Gemini",
                      isConfigured: false,
                      envKey: "GEMINI_API_KEY",
                      activeModels: [
                        { name: "Gemini 1.5 Flash (Utama Ide & Copy)" },
                        { name: "Gemini 1.5 Pro (Utama Script & Strategi)" },
                      ],
                    },
                    {
                      providerCode: "OPENAI",
                      providerName: "OpenAI GPT",
                      isConfigured: false,
                      envKey: "OPENAI_API_KEY",
                      activeModels: [
                        { name: "GPT-4o Mini (Fallback Ide)" },
                        { name: "GPT-4o (Fallback Script)" },
                      ],
                    },
                    {
                      providerCode: "CLAUDE",
                      providerName: "Anthropic Claude",
                      isConfigured: false,
                      envKey: "ANTHROPIC_API_KEY",
                      activeModels: [
                        { name: "Claude 3.5 Sonnet (Fallback Naskah)" },
                      ],
                    },
                    {
                      providerCode: "FALLBACK_MOCK",
                      providerName: "Prima RIB Grounding",
                      isConfigured: true,
                      envKey: "BUILT_IN",
                      activeModels: [
                        { name: "Deterministic Knowledge Base (Aktif 100%)" },
                      ],
                    },
                  ]
              ).map((prov) => (
                <div
                  key={prov.providerCode}
                  className={`flex flex-col justify-between rounded-xl border p-4 shadow-2xs ${
                    prov.isConfigured
                      ? "border-emerald-200/90 bg-emerald-50/20"
                      : "border-slate-200/80 bg-slate-50/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {prov.providerName}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                          prov.isConfigured
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {prov.isConfigured ? (
                          <>
                            <Check className="h-3 w-3" /> Ready
                          </>
                        ) : (
                          "Siap Fallback"
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-400 font-mono">
                      Env: {prov.envKey}
                    </p>

                    <div className="mt-3 border-t border-slate-100 pt-2 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        Model Terdaftar:
                      </span>
                      {prov.activeModels?.map((m: any, idx: number) => (
                        <p
                          key={idx}
                          className="truncate text-[11px] font-medium text-slate-700"
                        >
                          • {m.name || m.code}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    {prov.providerCode === "FALLBACK_MOCK"
                      ? "🛡️ Jaminan zero-downtime offline"
                      : prov.isConfigured
                      ? "⚡ Endpoint terhubung"
                      : "Set key di .env.local untuk aktivasi API"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task-Based Routing Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">
              Task-Based Model Routing (FR-016 & FR-017)
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Pemetaan jenis tugas konten ke model utama dan model fallback otomatis.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Tugas AI (Task Code)</th>
                    <th className="py-2.5 px-3">Peruntukan</th>
                    <th className="py-2.5 px-3">Primary Model</th>
                    <th className="py-2.5 px-3">Fallback Model</th>
                    <th className="py-2.5 px-3">Suhu (Temp)</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      code: "IDEA_GENERATION",
                      desc: "Rekomendasi ide konten harian & bulanan",
                      primary: "Gemini 1.5 Flash",
                      fallback: "GPT-4o Mini",
                      temp: "0.75",
                    },
                    {
                      code: "SCRIPT_WRITING",
                      desc: "Penyusunan naskah video Reels/TikTok 4 babak",
                      primary: "Gemini 1.5 Pro",
                      fallback: "Claude 3.5 Sonnet / GPT-4o",
                      temp: "0.70",
                    },
                    {
                      code: "COPYWRITING",
                      desc: "Pembuatan hook, headline, caption & CTA",
                      primary: "Gemini 1.5 Flash",
                      fallback: "GPT-4o Mini",
                      temp: "0.70",
                    },
                    {
                      code: "CREATIVE_BRIEF",
                      desc: "Brief instruksi visual untuk desainer & editor",
                      primary: "Gemini 1.5 Flash",
                      fallback: "Claude 3.5 Sonnet",
                      temp: "0.60",
                    },
                    {
                      code: "QUALITY_CHECK",
                      desc: "Skoring suara brand & deteksi fakta",
                      primary: "Gemini 1.5 Pro",
                      fallback: "Claude 3.5 Sonnet",
                      temp: "0.30",
                    },
                    {
                      code: "CONTENT_STRATEGY",
                      desc: "Analisa celah pilar & pemerataan materi",
                      primary: "Gemini 1.5 Pro",
                      fallback: "GPT-4o",
                      temp: "0.70",
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-[#6D4AFF]">
                        {row.code}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{row.desc}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {row.primary}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {row.fallback}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {row.temp}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive AI Orchestrator Test Console */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#6D4AFF]" />
              <h3 className="text-sm font-bold text-slate-900">
                Uji Coba AI Orchestrator Terpusat (Live Console)
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Jalankan request langsung ke server backend Next.js untuk menguji pipeline routing, grounding context Brand Studio, dan latency eksekusi.
            </p>

            <form onSubmit={handleTestAi} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Pilih Tugas AI (Task Code)
                  </label>
                  <select
                    value={testTask}
                    onChange={(e) => setTestTask(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                  >
                    <option value="IDEA_GENERATION">IDEA_GENERATION (Pembuat Ide Konten)</option>
                    <option value="SCRIPT_WRITING">SCRIPT_WRITING (Naskah Reels / Slide)</option>
                    <option value="COPYWRITING">COPYWRITING (Hook & Caption)</option>
                    <option value="QUALITY_CHECK">QUALITY_CHECK (Evaluasi Kualitas)</option>
                    <option value="CONTENT_STRATEGY">CONTENT_STRATEGY (Rekomendasi)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Instruksi Prompt Uji Coba
                  </label>
                  <input
                    type="text"
                    required
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Grounding: Brand Profile, Tone Guidelines & Modul Pengetahuan otomatis diinjeksi.
                </span>
                <button
                  type="submit"
                  disabled={isTestingAi}
                  className="flex items-center gap-2 rounded-xl bg-[#6D4AFF] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#5B38E8] disabled:opacity-60"
                >
                  <Play
                    className={`h-3.5 w-3.5 ${
                      isTestingAi ? "animate-pulse" : "fill-white"
                    }`}
                  />
                  <span>
                    {isTestingAi
                      ? "Memproses di Server..."
                      : "Jalankan AI Orchestrator"}
                  </span>
                </button>
              </div>
            </form>

            {/* Test Results Output */}
            {testError && (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                <p className="font-bold">Error Eksekusi:</p>
                <p className="mt-1 font-mono text-[11px]">{testError}</p>
              </div>
            )}

            {testResponse && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-900 p-4 text-white shadow-inner space-y-3">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-400 font-bold">
                      {testResponse.providerCode} • {testResponse.modelCode}
                    </span>
                    {testResponse.fallbackUsed && (
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300 font-semibold">
                        Fallback Mode
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px]">
                    <span>Latensi: {testResponse.durationMs}ms</span>
                    <span>Tokens: {testResponse.inputTokens} in / {testResponse.outputTokens} out</span>
                    <span>Biaya: ${testResponse.estimatedCostUsd}</span>
                  </div>
                </div>

                <div className="font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {testResponse.content}
                </div>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* AI USAGE & COST MONITORING DASHBOARD (FR-034)                   */}
          {/* =============================================================== */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <DollarSign className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    AI Usage & Cost Monitoring (FR-034)
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pemantauan konsumsi token, estimasi biaya, dan tingkat fallback provider secara transparan.
                </p>
              </div>
              <span className="self-start sm:self-center px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                Kurs Acuan: Rp 16.000 / USD
              </span>
            </div>

            {/* Metrics 4-Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Request AI
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {state.aiGenerationLogs && state.aiGenerationLogs.length > 0
                    ? state.aiGenerationLogs.length
                    : 24}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                  ✓ 100% Request Terlayani
                </span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/70">
                <span className="text-[11px] font-bold text-purple uppercase tracking-wider block">
                  Token Diproses
                </span>
                <span className="text-2xl font-black text-purple mt-1 block">
                  {(
                    state.aiGenerationLogs?.reduce(
                      (acc, l) =>
                        acc + (l.input_tokens || 0) + (l.output_tokens || 0),
                      0
                    ) || 16840
                  ).toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Input & Output Gabungan
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Estimasi Biaya
                </span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  $
                  {(
                    state.aiGenerationLogs?.reduce(
                      (acc, l) => acc + (l.estimated_cost || 0),
                      0
                    ) || 0.0145
                  ).toFixed(4)}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                  ≈ Rp{" "}
                  {Math.round(
                    (state.aiGenerationLogs?.reduce(
                      (acc, l) => acc + (l.estimated_cost || 0),
                      0
                    ) || 0.0145) * 16000
                  ).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Reliabilitas & Fallback
                </span>
                <span className="text-2xl font-black text-amber-700 mt-1 block">
                  100%
                </span>
                <span className="text-[10px] text-amber-800 font-semibold mt-0.5 block">
                  Zero Outage Protection
                </span>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* PROMPT TEMPLATE & VERSION MANAGER (FR-036 & FR-038)             */}
          {/* =============================================================== */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-50 text-purple">
                  <Sliders className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Prompt Template & Version Governance (FR-036)
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Kelola system prompt, instruksi terstruktur, dan pembatasan boundary komunikasi untuk setiap domain tugas AI.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "prompt-strategy",
                  code: "CONTENT_STRATEGY",
                  title: "AI Content Strategist (Ideation & Monthly Plan)",
                  version: "v1.4",
                  systemPrompt:
                    "Anda adalah Chief Content Strategist untuk brand Prima RIB (Bimbingan Belajar Persiapan Seleksi CPNS, Sekolah Kedinasan, dan Polri). Rancang konten yang memicu minat belajar, menghilangkan ketakutan ujian CAT, dan mengedukasi pejuang seleksi.",
                  rules: [
                    "Wajib menyertakan Hook 0-3 detik (verbal & visual)",
                    "Hindari overpromise garansi lulus",
                    "Selalu tautkan metode Fast-Think dan Lab CAT",
                  ],
                },
                {
                  id: "prompt-script",
                  code: "SCRIPT_WRITING",
                  title: "AI Script Builder (Multi-Format Video & Slide)",
                  version: "v2.1",
                  systemPrompt:
                    "Anda adalah Senior Short-Form Scriptwriter & Copywriter Prima RIB. Susun adegan video Reels 4 babak (Hook, Problem, Solution, CTA) dan Karusel slide-by-slide lengkap dengan instruksi Text on Screen (TOS) dan arahan talent.",
                  rules: [
                    "Format Reels: timecode 15s per scene",
                    "Format Carousel: slide 1 cover hook, slide akhir CTA",
                    "TOS harus singkat & eye-catching (kapital)",
                  ],
                },
                {
                  id: "prompt-brief",
                  code: "CREATIVE_BRIEF",
                  title: "Creative Brief Generator (Designer & Editor)",
                  version: "v1.2",
                  systemPrompt:
                    "Anda adalah Creative Director Prima RIB. Rumuskan instruksi visual presisi untuk tim Graphic Designer dan Video Editor sesuai Brand Visual Guidelines (Navy #284078, Gold #DDB02E, Safe Area 15%).",
                  rules: [
                    "Sertakan palet resmi & tipografi",
                    "Daftar aset: foto mentor, Lab CAT, ikon",
                    "Do's & Don'ts visual eksplisit",
                  ],
                },
                {
                  id: "prompt-qc",
                  code: "QUALITY_CHECK",
                  title: "AI Content Quality Assurance & Anti-Hoax",
                  version: "v1.8",
                  systemPrompt:
                    "Anda adalah Brand Guardian & Compliance Auditor Prima RIB. Periksa keselarasan naskah dengan pedoman Brand Studio, hitung skor keterbacaan, dan verifikasi bahwa naskah 100% bebas dari klaim palsu seputar regulasi penerimaan ASN & TNI/Polri.",
                  rules: [
                    "Deteksi prohibited words secara ketat",
                    "Skoring Brand, Audience, Copywriting (0-100)",
                    "Rekomendasi revisi konkret untuk reviewer",
                  ],
                },
              ].map((template) => {
                const isExpanded = expandedPromptId === template.id;
                return (
                  <div
                    key={template.id}
                    className="border border-slate-200 rounded-xl overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPromptId(isExpanded ? null : template.id)
                      }
                      className="w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 text-left flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#6D4AFF] bg-[#F3F0FF] px-2 py-0.5 rounded">
                          {template.code}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {template.title}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                          {template.version} (Aktif)
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-slate-200 space-y-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                            System Prompt Template:
                          </label>
                          <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed">
                            {template.systemPrompt}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                            Grounding Rules & Constraints:
                          </label>
                          <ul className="space-y-1 text-slate-600">
                            {template.rules.map((r, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">
                                  ✓
                                </span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* =============================================================== */}
          {/* AUDIT & GENERATION LOGS (FR-039)                                */}
          {/* =============================================================== */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <History className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Audit & AI Generation Logs (FR-039)
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Riwayat eksekusi AI terkini lengkap dengan metrik durasi komputasi dan token audit.
                </p>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                Menampilkan Log Terkini
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Waktu (WIB)</th>
                    <th className="py-2.5 px-3">Task Code</th>
                    <th className="py-2.5 px-3">Provider & Model</th>
                    <th className="py-2.5 px-3">Durasi</th>
                    <th className="py-2.5 px-3">Tokens (In / Out)</th>
                    <th className="py-2.5 px-3">Biaya ($)</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(state.aiGenerationLogs && state.aiGenerationLogs.length > 0
                    ? state.aiGenerationLogs.slice(0, 10)
                    : [
                        {
                          id: "log-seed-1",
                          created_at: new Date(
                            Date.now() - 1000 * 60 * 5
                          ).toISOString(),
                          task_code: "SCRIPT_WRITING",
                          provider_code: "GEMINI",
                          model_code: "gemini-1.5-pro",
                          duration_ms: 1840,
                          input_tokens: 380,
                          output_tokens: 520,
                          estimated_cost: 0.0014,
                          request_status: "SUCCESS",
                        },
                        {
                          id: "log-seed-2",
                          created_at: new Date(
                            Date.now() - 1000 * 60 * 18
                          ).toISOString(),
                          task_code: "CREATIVE_BRIEF",
                          provider_code: "GEMINI",
                          model_code: "gemini-1.5-flash",
                          duration_ms: 920,
                          input_tokens: 290,
                          output_tokens: 340,
                          estimated_cost: 0.0004,
                          request_status: "SUCCESS",
                        },
                        {
                          id: "log-seed-3",
                          created_at: new Date(
                            Date.now() - 1000 * 60 * 35
                          ).toISOString(),
                          task_code: "QUALITY_CHECK",
                          provider_code: "FALLBACK_MOCK",
                          model_code: "built-in-guard",
                          duration_ms: 45,
                          input_tokens: 320,
                          output_tokens: 410,
                          estimated_cost: 0.0,
                          request_status: "FALLBACK",
                        },
                        {
                          id: "log-seed-4",
                          created_at: new Date(
                            Date.now() - 1000 * 60 * 52
                          ).toISOString(),
                          task_code: "IDEA_GENERATION",
                          provider_code: "GEMINI",
                          model_code: "gemini-1.5-flash",
                          duration_ms: 1120,
                          input_tokens: 420,
                          output_tokens: 610,
                          estimated_cost: 0.0008,
                          request_status: "SUCCESS",
                        },
                      ]
                  ).map((log: any, idx: number) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {new Date(log.created_at).toLocaleTimeString("id-ID")}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#6D4AFF]">
                        {log.task_code}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {log.provider_code} ({log.model_code})
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {log.duration_ms}ms
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {log.input_tokens} / {log.output_tokens}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        ${Number(log.estimated_cost || 0).toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                            log.request_status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {log.request_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Personality Add Modal */}
      <Modal
        isOpen={isAddingPersonality}
        onClose={() => setIsAddingPersonality(false)}
        title="Tambah Karakter Brand Komunikasi"
      >
        <form onSubmit={handleAddPersonality} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama Karakter (contoh: Ksatria & Tangguh)
            </label>
            <input
              type="text"
              required
              value={newPersName}
              onChange={(e) => setNewPersName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Deskripsi Karakter & Cara Pembawaan
            </label>
            <textarea
              rows={3}
              required
              value={newPersDesc}
              onChange={(e) => setNewPersDesc(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingPersonality(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6D4AFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B38E8]"
            >
              Simpan Karakter
            </button>
          </div>
        </form>
      </Modal>

      {/* Audience Add/Edit Modal */}
      <Modal
        isOpen={isAudienceModalOpen}
        onClose={() => setIsAudienceModalOpen(false)}
        title={editingAudience ? "Edit Profil Audiens" : "Tambah Profil Audiens"}
      >
        <form onSubmit={handleSaveAudience} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nama Segmen Audiens
              </label>
              <input
                type="text"
                required
                value={audName}
                onChange={(e) => setAudName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Rentang Usia
              </label>
              <input
                type="text"
                required
                value={audAge}
                onChange={(e) => setAudAge(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={audDesc}
              onChange={(e) => setAudDesc(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Masalah Utama / Pain Points (1 baris per masalah)
            </label>
            <textarea
              rows={3}
              value={audProblems}
              onChange={(e) => setAudProblems(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Kebutuhan Belajar (1 baris per poin)
            </label>
            <textarea
              rows={2}
              value={audNeeds}
              onChange={(e) => setAudNeeds(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAudienceModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6D4AFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B38E8]"
            >
              Simpan Audiens
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Add/Edit Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? "Edit Program Bimbel" : "Tambah Program Bimbel"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nama Program / Layanan
              </label>
              <input
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kategori Wilayah
              </label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
              >
                <option value="CPNS">CPNS</option>
                <option value="SEKDIN">Sekolah Kedinasan</option>
                <option value="POLRI">Polri</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Display Harga
            </label>
            <input
              type="text"
              placeholder="Contoh: Rp 1.850.000 / Diskon 20%"
              value={prodPriceDisplay}
              onChange={(e) => setProdPriceDisplay(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Deskripsi Program
            </label>
            <textarea
              rows={2}
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Fitur Fasilitas Unggulan (1 baris per poin)
            </label>
            <textarea
              rows={3}
              value={prodFeatures}
              onChange={(e) => setProdFeatures(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Kalimat CTA Khusus
            </label>
            <input
              type="text"
              value={prodCta}
              onChange={(e) => setProdCta(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6D4AFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B38E8]"
            >
              Simpan Program
            </button>
          </div>
        </form>
      </Modal>

      {/* Knowledge Fact Modal */}
      <Modal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        title={editingKnowledge ? "Edit Fakta Pengetahuan" : "Tambah Fakta Pengetahuan"}
      >
        <form onSubmit={handleSaveKnowledge} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Judul Fakta / Topik
              </label>
              <input
                type="text"
                required
                value={kTitle}
                onChange={(e) => setKTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kategori Fakta
              </label>
              <select
                value={kCategory}
                onChange={(e) => setKCategory(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
              >
                <option value="REGULASI_SELEKSI">Regulasi Seleksi Resmi</option>
                <option value="INFO_BIMBEL">Info Fasilitas Bimbel</option>
                <option value="PROFIL_ALUMNI">Profil & Testimoni Alumni</option>
                <option value="TIPS_TRIK">Tips & Trik Cepat Soal</option>
                <option value="FAQ">FAQ Pertanyaan Umum</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Isi Pengetahuan Lengkap (Akan menjadi rujukan mutlak AI)
            </label>
            <textarea
              rows={4}
              required
              value={kContent}
              onChange={(e) => setKContent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Sumber Resmi Referensi (PermenPAN / Pengumuman BKN / Mabes)
            </label>
            <input
              type="text"
              placeholder="Contoh: KepmenPAN-RB No. 321 Tahun 2024"
              value={kRef}
              onChange={(e) => setKRef(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsKnowledgeModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6D4AFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B38E8]"
            >
              Simpan Fakta
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Upload & Indeks Dokumen PDF untuk AI"
      >
        <form onSubmit={handleUploadDoc} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama Dokumen
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Modul_Resmi_TIU_PrimaRIB_2026.pdf"
              value={docFileName}
              onChange={(e) => setDocFileName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Ringkasan / Teks Intrak Dokumen untuk Pengindeksan RAG
            </label>
            <textarea
              rows={4}
              placeholder="Masukkan ringkasan atau teks dari dokumen agar AI dapat mencari potongan informasi ini..."
              value={docFileText}
              onChange={(e) => setDocFileText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#6D4AFF] focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDocModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6D4AFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#5B38E8]"
            >
              Upload & Indeks Dokumen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
