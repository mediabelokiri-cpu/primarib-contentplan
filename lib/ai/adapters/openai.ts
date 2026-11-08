import {
  AiProviderAdapter,
  UnifiedAiRequest,
  UnifiedAiResponse,
} from "../types";

export class OpenAIAdapter implements AiProviderAdapter {
  providerCode = "OPENAI" as const;

  private getApiKey(): string | null {
    return process.env.OPENAI_API_KEY || null;
  }

  isAvailable(): boolean {
    return Boolean(this.getApiKey());
  }

  async generate(
    request: UnifiedAiRequest,
    modelCode = "gpt-4o-mini"
  ): Promise<UnifiedAiResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY tidak dikonfigurasi di server environment.");
    }

    const startTime = Date.now();
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const messages: any[] = [];
    if (request.systemInstruction) {
      messages.push({
        role: "system",
        content: request.systemInstruction,
      });
    }
    messages.push({
      role: "user",
      content: request.prompt,
    });

    const payload: any = {
      model: modelCode,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
    };

    if (request.responseFormat === "json") {
      payload.response_format = { type: "json_object" };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startTime;

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    const promptTokens = data.usage?.prompt_tokens || 500;
    const completionTokens = data.usage?.completion_tokens || 400;

    const isMini = modelCode.includes("mini");
    const inputPricePerM = isMini ? 0.15 : 2.5;
    const outputPricePerM = isMini ? 0.6 : 10.0;
    const estimatedCostUsd =
      (promptTokens / 1_000_000) * inputPricePerM +
      (completionTokens / 1_000_000) * outputPricePerM;

    return {
      content: rawText,
      providerCode: "OPENAI",
      modelCode,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      durationMs,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      fallbackUsed: false,
      status: "SUCCESS",
    };
  }
}
