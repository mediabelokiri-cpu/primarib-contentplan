import {
  AiProviderCode,
  AiTaskCode,
  UnifiedAiContext,
  UnifiedAiRequest,
  UnifiedAiResponse,
} from "./types";
import { GeminiAdapter } from "./adapters/gemini";
import { OpenAIAdapter } from "./adapters/openai";
import { ClaudeAdapter } from "./adapters/claude";
import { MockFallbackAdapter } from "./adapters/mock";

export class AiOrchestrator {
  private gemini = new GeminiAdapter();
  private openai = new OpenAIAdapter();
  private claude = new ClaudeAdapter();
  private mock = new MockFallbackAdapter();

  /**
   * Mengumpulkan instruksi sistem terpadu berbasis Brand Studio Prima RIB (Grounding)
   */
  public buildSystemInstruction(context?: UnifiedAiContext): string {
    const brand = context?.brandProfile;
    const tone = context?.brandTone;
    const aud = context?.targetAudience;
    const prod = context?.product;
    const knowledge = context?.relevantKnowledge || [];

    const instructions: string[] = [
      "Kamu adalah AI Content Strategist & Production Specialist resmi untuk brand bimbingan belajar PRIMA RIB (spesialis persiapan tes CPNS, Sekolah Kedinasan, dan Seleksi Masuk Polri).",
      "MISI UTAMA: Membantu tim konten menghasilkan perencanaan konten, hook, naskah reels/tiktok, dan copy karusel yang bernilai edukatif tinggi, persuasif, memotivasi, dan berlandaskan fakta resmi.",
    ];

    if (brand) {
      instructions.push(
        `IDENTITAS BRAND:\n- Nama: ${brand.brand_name}\n- Tagline: "${brand.tagline}"\n- Positioning: ${brand.positioning}\n- Nilai: ${(brand.values || []).join(", ")}`
      );
    }

    if (tone) {
      instructions.push(
        `TONE OF VOICE & ATURAN BAHASA:\n- Tingkat Formalitas: ${tone.formality_level}\n- Karakter: ${tone.description}\n- Diksi yang disukai: ${(tone.preferred_words || []).join(", ")}\n- Diksi DILARANG (Anti-Hoax): ${(tone.prohibited_words || []).join(", ")}\n- Aturan Penulisan:\n${(tone.writing_rules || []).map((r) => `  * ${r}`).join("\n")}`
      );
    }

    if (aud) {
      instructions.push(
        `TARGET AUDIENS KONTEN INI:\n- Segmen: ${aud.audience_name} (Usia ${aud.age_range})\n- Masalah Utama: ${(aud.problems || []).join("; ")}\n- Kebutuhan Belajar: ${(aud.needs || []).join("; ")}\n- Format Disukai: ${(aud.preferences || []).join(", ")}`
      );
    }

    if (prod) {
      instructions.push(
        `PRODUK / LAYANAN TERKAIT:\n- Nama Program: ${prod.product_name} (${prod.category})\n- Display Harga: ${prod.price_display || "Hubungi Admin"}\n- Fitur Unggulan: ${(prod.features || []).slice(0, 3).join("; ")}\n- CTA Resmi: "${prod.cta}"`
      );
    }

    if (knowledge.length > 0) {
      instructions.push(
        `FAKTA & REGULASI RESMI TERVERIFIKASI (JANGAN MENGARANG ATURAN DI LUAR INI):\n${knowledge
          .map((k) => `[${k.category}] ${k.title}:\n${k.content}`)
          .join("\n\n")}`
      );
    }

    instructions.push(
      "BATASAN KETAT (GUARDRAILS):\n1. Jangan pernah menjanjikan kelulusan 100% tanpa belajar atau membocorkan soal resmi BKN.\n2. Jika ada informasi kuota atau tanggal yang belum diumumkan resmi oleh pemerintah, sampaikan secara jujur bahwa jadwal menunggu pengumuman resmi.\n3. Format jawaban to-the-point, jelas, dan siap diproduksi oleh tim video/desain."
    );

    return instructions.join("\n\n");
  }

  private resolveAdapter(providerCode: AiProviderCode) {
    switch (providerCode) {
      case "GEMINI":
        return this.gemini;
      case "OPENAI":
        return this.openai;
      case "CLAUDE":
        return this.claude;
      default:
        return this.mock;
    }
  }

  /**
   * Menentukan model utama & fallback berdasarkan jenis tugas (Task-Based Routing FR-016)
   */
  private getRouting(taskCode: AiTaskCode): {
    primaryProvider: AiProviderCode;
    primaryModel: string;
    fallbackProvider: AiProviderCode;
    fallbackModel: string;
  } {
    switch (taskCode) {
      case "CONTENT_STRATEGY":
      case "QUALITY_CHECK":
        return {
          primaryProvider: "GEMINI",
          primaryModel: "gemini-flash-latest",
          fallbackProvider: "OPENAI",
          fallbackModel: "gpt-4o",
        };
      case "SCRIPT_WRITING":
        return {
          primaryProvider: "GEMINI",
          primaryModel: "gemini-flash-latest",
          fallbackProvider: "CLAUDE",
          fallbackModel: "claude-3-5-sonnet-20241022",
        };
      case "IDEA_GENERATION":
      case "NEWS_REPURPOSE":
      case "COPYWRITING":
      case "CREATIVE_BRIEF":
      default:
        return {
          primaryProvider: "GEMINI",
          primaryModel: "gemini-flash-latest",
          fallbackProvider: "OPENAI",
          fallbackModel: "gpt-4o-mini",
        };
    }
  }

  /**
   * Eksekusi sentral AI Orchestration dengan mekanisme Fallback otomatis (FR-017 & FR-018)
   */
  public async execute(request: UnifiedAiRequest): Promise<UnifiedAiResponse> {
    const route = this.getRouting(request.taskCode);
    const systemInstruction =
      request.systemInstruction || this.buildSystemInstruction(request.context);

    const enrichedRequest: UnifiedAiRequest = {
      ...request,
      systemInstruction,
    };

    // 1. Percobaan Model Utama
    const primaryAdapter = this.resolveAdapter(route.primaryProvider);
    if (primaryAdapter.isAvailable()) {
      try {
        const resp = await primaryAdapter.generate(
          enrichedRequest,
          request.modelCode || route.primaryModel
        );
        return resp;
      } catch (err: any) {
        console.warn(
          `[AI Orchestrator] Primary provider (${route.primaryProvider}) failed: ${err.message}. Switching to fallback...`
        );
      }
    }

    // 2. Percobaan Model Fallback Pertama (Provider Alternatif)
    const fallbackAdapter = this.resolveAdapter(route.fallbackProvider);
    if (fallbackAdapter.isAvailable()) {
      try {
        const resp = await fallbackAdapter.generate(
          enrichedRequest,
          route.fallbackModel
        );
        return {
          ...resp,
          fallbackUsed: true,
        };
      } catch (err: any) {
        console.warn(
          `[AI Orchestrator] Fallback provider (${route.fallbackProvider}) failed: ${err.message}. Activating deterministic emergency fallback...`
        );
      }
    }

    // 3. Fallback Mutlak (High-Fidelity Deterministic Fallback - Zero Downtime Guarantee)
    const mockResp = await this.mock.generate(
      enrichedRequest,
      "primarib-hybrid-fallback"
    );
    return mockResp;
  }
}

// Singleton server orchestrator
export const aiOrchestrator = new AiOrchestrator();
