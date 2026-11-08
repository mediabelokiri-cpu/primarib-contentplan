import {
  AiProviderAdapter,
  UnifiedAiRequest,
  UnifiedAiResponse,
} from "../types";

export class GeminiAdapter implements AiProviderAdapter {
  providerCode = "GEMINI" as const;

  private getApiKey(): string | null {
    return (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_AI_KEY ||
      null
    );
  }

  isAvailable(): boolean {
    return Boolean(this.getApiKey());
  }

  async generate(
    request: UnifiedAiRequest,
    modelCode = "gemini-flash-latest"
  ): Promise<UnifiedAiResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY tidak dikonfigurasi di server environment.");
    }

    const effectiveModel =
      modelCode.includes("1.5") || !modelCode
        ? "gemini-flash-latest"
        : modelCode;

    const startTime = Date.now();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${apiKey}`;

    const contents: any[] = [];
    if (request.prompt) {
      contents.push({
        role: "user",
        parts: [{ text: request.prompt }],
      });
    }

    const payload: any = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    if (request.systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: request.systemInstruction }],
      };
    }

    if (request.responseFormat === "json") {
      payload.generationConfig.responseMimeType = "application/json";
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000), // Max 6s agar tidak menggantung jika API Google antre
    });

    const durationMs = Date.now() - startTime;

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text || "";

    const promptTokens = data.usageMetadata?.promptTokenCount || 500;
    const candidatesTokens = data.usageMetadata?.candidatesTokenCount || 400;

    // Pricing calculation
    const isPro = modelCode.includes("pro");
    const inputPricePerM = isPro ? 3.5 : 0.075;
    const outputPricePerM = isPro ? 10.5 : 0.3;
    const estimatedCostUsd =
      (promptTokens / 1_000_000) * inputPricePerM +
      (candidatesTokens / 1_000_000) * outputPricePerM;

    return {
      content: rawText,
      providerCode: "GEMINI",
      modelCode,
      inputTokens: promptTokens,
      outputTokens: candidatesTokens,
      durationMs,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      fallbackUsed: false,
      status: "SUCCESS",
    };
  }
}
