import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_AI_KEY
  );
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY);

  const providers = [
    {
      providerCode: "GEMINI",
      providerName: "Google Gemini",
      isConfigured: hasGemini,
      envKey: "GEMINI_API_KEY",
      activeModels: [
        { code: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Super Cepat & Efisien)", recommendedFor: "Idea & Copywriting" },
        { code: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Reasoning Mendalam & Panjang)", recommendedFor: "Strategy & Quality Check" },
      ],
    },
    {
      providerCode: "OPENAI",
      providerName: "OpenAI GPT",
      isConfigured: hasOpenAI,
      envKey: "OPENAI_API_KEY",
      activeModels: [
        { code: "gpt-4o-mini", name: "GPT-4o Mini (Cepat & Ringan)", recommendedFor: "Fallback Ideation" },
        { code: "gpt-4o", name: "GPT-4o Flagship (Kreatif & Terstruktur)", recommendedFor: "Fallback Scriptwriting" },
      ],
    },
    {
      providerCode: "CLAUDE",
      providerName: "Anthropic Claude",
      isConfigured: hasClaude,
      envKey: "ANTHROPIC_API_KEY",
      activeModels: [
        { code: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Nuansa Bahasa Halus)", recommendedFor: "Long-form Script & Tone Tuning" },
      ],
    },
    {
      providerCode: "FALLBACK_MOCK",
      providerName: "Prima RIB Hybrid Offline Fallback",
      isConfigured: true,
      envKey: "BUILT_IN",
      activeModels: [
        { code: "primarib-hybrid-fallback", name: "Deterministic Knowledge Grounding (Zero Downtime)", recommendedFor: "Semua Kategori Saat Offline" },
      ],
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      providers,
      totalConfigured: [hasGemini, hasOpenAI, hasClaude].filter(Boolean).length,
      defaultStrategy: "Hybrid (Gemini Primary -> OpenAI/Claude Fallback -> Local Grounding)",
    },
  });
}
