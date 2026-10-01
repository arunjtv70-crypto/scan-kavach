import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OLLAMA_URL = "https://ollama.com/api/chat";
const OLLAMA_MODEL = "gemma4:31b";

const SYSTEM_PROMPT = `You are Scam Kavach, an expert Indian fraud analyst. Analyse the message/screenshot and decide if it is a scam. Be accurate: do not over-warn, do not under-warn.

THINK IN THIS ORDER (silently):
1. What is the sender asking the user to DO (pay, share OTP/PIN/documents, click, install an app, keep it secret, reply)?
2. Count real red flags from this list:
   - asks for OTP, UPI PIN, CVV, password, Aadhaar/PAN images
   - asks for money upfront, a "refund of extra payment", a fee, a deposit
   - fake authority (CBI, police, customs, TRAI, RBI, court) or arrest/legal threat, video-call "arrest"
   - remote-access app (AnyDesk, TeamViewer, QuickSupport) or unknown APK
   - link to non-official or shortened domain, personal UPI ID or personal account for payment
   - unsolicited contact + booking/ordering for third parties + cannot meet in person (fake client)
   - guaranteed returns, task-based earning, Telegram/WhatsApp group tips
   - blackmail with photos/videos, threats to leak
   - urgency, secrecy ("do not tell anyone"), pressure to act now
   - broken/templated language mismatched with the claimed identity
3. Count real trust signals: verified business badge, official template buttons, known brand, no request for money/OTP/secrets.
4. Marketing language alone ("pre-approved", "limited offer", "zero charges") is NOT a scam signal.

SCORING:
- 0-25 SAFE: normal marketing or ordinary chat, no red flags.
- 26-60 SUSPICIOUS: 1-2 weak or unclear red flags.
- 61-100 SCAM: any strong flag (OTP/PIN request, fake authority, upfront fee, remote app, blackmail) OR 3+ weak flags together. Overpayment/fake-client patterns with 3+ weak flags score 70-90 even if no money was asked yet; say "no money asked yet, but this is the known first step".

CATEGORY: one of UPI_BANKING, DIGITAL_ARREST_EXTORTION, PHISHING_VISHING_SMISHING, IDENTITY_DOCUMENT_FRAUD, JOB_INVESTMENT_FRAUD, SEXTORTION_CYBERBULLYING, FAKE_CLIENT_OVERPAYMENT, OTHER, SAFE. Pick by the scammer's method, not by the topic of the message.

OUTPUT RULES:
- Return ONLY valid JSON matching the schema. No extra text.
- reasons: max 3, each under 20 words, specific to THIS message.
- suspicious_phrases: max 3, copied exactly from the message, only real red-flag phrases.
- next_steps: max 3, concrete actions for this category.
- could_not_verify: things you cannot confirm from the screenshot (link destination, sender authenticity).
- detected_entities: names of banks, wallets, companies or brands visible in the message (sender name, logo, text). Only output the brand/bank name, not phone numbers.
- Never claim 100% certainty. Never invent phone numbers; only use 1930, cybercrime.gov.in, 1098, 14416, StopNCII.org, Sanchar Saathi, mAadhaar.
- Write all text fields in simple Hindi (Devanagari) when the requested language is HI, otherwise English.
- For sextortion/cyberbullying: warm, non-blaming tone, include "Aapki galti nahi hai", never describe explicit images.

Output MUST be valid JSON matching this exact structure:
{
  "verdict": "SCAM" | "SUSPICIOUS" | "SAFE",
  "scam_category": "UPI_BANKING" | "DIGITAL_ARREST_EXTORTION" | "PHISHING_VISHING_SMISHING" | "IDENTITY_DOCUMENT_FRAUD" | "JOB_INVESTMENT_FRAUD" | "SEXTORTION_CYBERBULLYING" | "FAKE_CLIENT_OVERPAYMENT" | "OTHER" | "SAFE",
  "risk_score": 0-100,
  "scam_type": "Short human readable label",
  "reasons": ["reason 1", "reason 2"],
  "suspicious_phrases": ["exact phrase 1"],
  "could_not_verify": ["what could not be verified 1"],
  "detected_entities": ["brand name 1", "bank name 2"],
  "next_steps": ["1. step", "2. step"],
  "family_alert_text": "Short WhatsApp message to warn family"
}`;

import crypto from "crypto";

// Simple in-memory cache
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scanCache = new Map<string, any>();

// Warm up model on server start
const warmUpModel = async () => {
  try {
    const apiKey = process.env.OLLAMA_API_KEY;
    if (!apiKey) return;
    await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: "warmup" }],
        options: { num_predict: 1 },
        keep_alive: "30m"
      })
    });
    console.log("🔥 Ollama warmed up!");
  } catch {
    // ignore
  }
};
warmUpModel();

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const apiKey = process.env.OLLAMA_API_KEY;
    if (!apiKey) {
      console.error("❌ OLLAMA_API_KEY is missing in environment variables");
      return NextResponse.json({ error: "AI abhi available nahi hai. Dobara try karein." }, { status: 500 });
    }

    const body = await req.json();
    
    if (body.warmup) {
      warmUpModel();
      return NextResponse.json({ status: "warmed up" });
    }

    const { text, imageBase64, categoryHint, language } = body;

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    // Check cache
    const cacheKeyInput = `${text || ""}|${categoryHint || ""}|${language || "hi"}|${imageBase64 ? crypto.createHash("sha256").update(imageBase64).digest("hex") : "no-image"}`;
    const cacheKey = crypto.createHash("sha256").update(cacheKeyInput).digest("hex");
    
    if (scanCache.has(cacheKey)) {
      console.log(`⏱️ [Cache Hit] Scan took: ${Date.now() - startTime}ms`);
      return NextResponse.json(scanCache.get(cacheKey));
    }

    let promptText = `OUTPUT LANGUAGE: ${language === 'en' ? 'ENGLISH' : 'HINDI (Devanagari)'}\n\n`;
    if (categoryHint) {
      promptText += `User hints this is related to: ${categoryHint}. `;
    }
    if (text) {
      promptText += text;
    }
    if (!promptText) promptText = "Analyze this image for scams.";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message: any = {
      role: "user",
      content: promptText,
    };

    if (imageBase64) {
      message.images = [imageBase64];
    }

    let response;
    let retries = 1;
    
    while (retries >= 0) {
      try {
        const fetchRes = await fetch(OLLAMA_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          cache: "no-store",
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              message
            ],
            format: "json",
            stream: false,
            keep_alive: "30m",
            options: {
              temperature: 0.2,
              num_predict: 500,
              num_ctx: 4096
            }
          })
        });

        if (!fetchRes.ok) {
          throw new Error(`Ollama API error: ${fetchRes.status} ${await fetchRes.text()}`);
        }
        
        response = await fetchRes.json();
        break;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (apiError: any) {
        if (retries === 0) {
          console.error("❌ Ollama API Error in /api/scan:");
          console.error("- Message:", apiError?.message);
          return NextResponse.json({ error: "AI abhi available nahi hai. Dobara try karein." }, { status: 500 });
        }
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const textResponse = response?.message?.content;
    if (!textResponse) {
      console.error("❌ Empty response from AI in /api/scan");
      return NextResponse.json({ error: "AI abhi available nahi hai. Dobara try karein." }, { status: 500 });
    }

    try {
      const cleanedText = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const json = JSON.parse(cleanedText);
      scanCache.set(cacheKey, json);
      console.log(`⏱️ [API Hit] Scan took: ${Date.now() - startTime}ms`);
      return NextResponse.json(json);
    } catch (parseError) {
      console.error("❌ JSON Parse Error in /api/scan:", parseError);
      console.error("Raw response:", textResponse);
      return NextResponse.json({ error: "AI abhi available nahi hai. Dobara try karein." }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ System error in /api/scan:", error);
    return NextResponse.json({ error: "AI abhi available nahi hai. Dobara try karein." }, { status: 500 });
  }
}
