import {
  AiProviderCode,
  AiTaskCode,
  BrandProfile,
  BrandToneGuideline,
  BrandAudience,
  BrandProduct,
  BrandKnowledge,
} from "@/types/database";

export type { AiProviderCode, AiTaskCode };

export interface UnifiedAiContext {
  brandProfile?: BrandProfile;
  brandTone?: BrandToneGuideline;
  targetAudience?: BrandAudience;
  product?: BrandProduct;
  relevantKnowledge?: BrandKnowledge[];
}

export interface UnifiedAiRequest {
  taskCode: AiTaskCode;
  prompt: string;
  systemInstruction?: string;
  context?: UnifiedAiContext;
  modelCode?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
}

export interface UnifiedAiResponse {
  content: string;
  providerCode: AiProviderCode;
  modelCode: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  estimatedCostUsd: number;
  fallbackUsed: boolean;
  status: "SUCCESS" | "FALLBACK" | "FAILED";
  rawError?: string;
}

export interface AiProviderAdapter {
  providerCode: AiProviderCode;
  isAvailable(): boolean;
  generate(
    request: UnifiedAiRequest,
    modelCode: string
  ): Promise<UnifiedAiResponse>;
}
