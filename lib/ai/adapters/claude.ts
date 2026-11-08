import {
  AiProviderAdapter,
  UnifiedAiRequest,
  UnifiedAiResponse,
} from "../types";

export class ClaudeAdapter implements AiProviderAdapter {
  providerCode = "CLAUDE" as const;

  private getApiKey(): string | null {
    return process.env.ANTHROPIC_API_KEY || null;
  }

  isAvailable(): boolean {
    return Boolean(this.getApiKey());
  }

  async generate(
    request: UnifiedAiRequest,
    modelCode = "claude-3-5-sonnet-20241022"
  ): Promise<UnifiedAiResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY tidak dikonfigurasi di server environment."
      );
    }

    const startTime = Date.now();
    const endpoint = "https://api.anthropic.com/v1/messages";

    const payload: any = {
      model: modelCode,
      max_tokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0.7,
      messages: [{ role: "user", content: request.prompt }],
    };

    if (request.systemInstruction) {
      payload.system = request.systemInstruction;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - startTime;

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Claude API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const rawText = data.content?.[0]?.text || "";

    const promptTokens = data.usage?.input_tokens || 500;
    const outputTokens = data.usage?.output_tokens || 400;

    const estimatedCostUsd =
      (promptTokens / 1_000_000) * 3.0 + (outputTokens / 1_000_000) * 15.0;

    return {
      content: rawText,
      providerCode: "CLAUDE",
      modelCode,
      inputTokens: promptTokens,
      outputTokens,
      durationMs,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      fallbackUsed: false,
      status: "SUCCESS",
    };
  }
}
