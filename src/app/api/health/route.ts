import { NextResponse } from "next/server";
import { callAI, getAIProviderInfo } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET() {
  const { provider, error } = getAIProviderInfo();

  if (provider === "none") {
    return NextResponse.json({ ok: false, provider, error }, { status: 500 });
  }

  try {
    // Tiny AI call just to verify connection
    // We expect valid JSON based on the system prompt we provide, but since we are just checking if it resolves:
    const systemPrompt = "Return exactly: {\"status\": \"ok\"}";
    const promptText = "ping";
    
    await callAI(systemPrompt, promptText);
    
    return NextResponse.json({ ok: true, provider });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, provider, error: msg }, { status: 500 });
  }
}
