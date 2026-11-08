import { NextResponse } from "next/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { UnifiedAiRequest } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      taskCode,
      prompt,
      systemInstruction,
      context,
      modelCode,
      temperature,
      maxTokens,
      responseFormat,
    } = body;

    if (!taskCode || !prompt) {
      return NextResponse.json(
        { error: "Parameter 'taskCode' dan 'prompt' wajib disertakan." },
        { status: 400 }
      );
    }

    const aiRequest: UnifiedAiRequest = {
      taskCode,
      prompt,
      systemInstruction,
      context,
      modelCode,
      temperature,
      maxTokens,
      responseFormat,
    };

    const result = await aiOrchestrator.execute(aiRequest);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[API AI Generate Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Terjadi kesalahan pada AI Orchestrator server.",
      },
      { status: 500 }
    );
  }
}
