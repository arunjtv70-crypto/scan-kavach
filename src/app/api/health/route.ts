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
    await callAI('Return exactly: {"status": "ok"}', "ping");
    return NextResponse.json({ ok: true, provider });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, provider, error: msg }, { status: 500 });
  }
}
