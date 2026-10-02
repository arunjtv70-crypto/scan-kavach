import { NextResponse } from "next/server";
import { callAI, getAIProviderInfo } from "@/lib/ai";

export async function GET() {
  const { provider, error } = getAIProviderInfo();

  if (provider === "none") {
    return NextResponse.json({ ok: false, provider, error }, { status: 503 });
  }

  try {
    await callAI('Return exactly: {"status": "ok"}', "ping");
    return NextResponse.json({ ok: true, provider });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, provider, error: msg }, { status: 503 });
  }
}
