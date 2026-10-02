import { NextResponse } from "next/server";
import { callAI, getAIProviderInfo } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a crisis responder for cyber financial fraud and cybercrime in India.
The user is panicked. You must produce steps SPECIFIC to the selected events, ordered by urgency.

Rules for steps based on events:
- Paisa bheja / Bank Fraud: 1930 + bank freeze first.
- OTP diya / Card details shared: Block card and UPI immediately.
- Remote app install kiya: Disconnect internet, uninstall app, change passwords.
- Documents diye / Identity shared: Lock Aadhaar biometrics via mAadhaar, check SIMs on Sanchar Saathi.
- Blackmail / Sextortion / Threats: Do not pay, keep evidence, StopNCII.org.

Combine steps when multiple options are selected. No duplicates.
If sextortion/cyberbullying is selected: Warm, non-judgmental tone. Tell them: "Aapki galti nahi hai." Mention Childline 1098 if child, Tele-MANAS 14416 if deeply distressed.

Output MUST BE valid JSON matching exactly this structure:
{
  "priority_steps": ["step 1", "step 2"],
  "complaint_draft": "Copyable complaint draft for cybercrime.gov.in. Fill it with the provided details.",
  "bank_letter": "Copyable bank freeze letter draft. Fill it with the provided details. If no money was lost, say 'Not applicable'.",
  "reassurance": "Calming reassurance text that it is not their fault"
}`;

export async function POST(req: Request) {
  try {
    const { provider, error: providerError } = getAIProviderInfo();
    if (provider === "none") {
      console.error("❌ AI configuration missing:", providerError);
      return NextResponse.json({ error: "AI configuration is missing. " + providerError }, { status: 500 });
    }

    const { events, language = "Hinglish", details } = await req.json();

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "No events provided" }, { status: 400 });
    }

    const detailsText = details ? `
Bank Name: ${details.bankName || "____"}
Amount Lost: ${details.amount || "____"}
Date and Time: ${details.time || "____"}
Transaction/UTR ID: ${details.utr || "____"}
Scammer ID/Number: ${details.scammerId || "____"}` : "";

    const promptText = `Output language MUST be ${language === 'hi' ? 'Hindi (Devanagari)' : language === 'en' ? 'English' : 'Hinglish'}. No mixed language output.
The user has experienced the following: ${events.join(", ")}.
Here are the specific details they provided to fill in the complaint draft and bank letter:${detailsText}
Provide specific recovery steps based on the events, the complaint draft filled with details, the bank letter filled with details, and reassurance.`;

    let textResponse;
    try {
      textResponse = await callAI(SYSTEM_PROMPT, promptText);
    } catch (apiError: unknown) {
      console.error("❌ AI API Error in /api/rescue:", apiError);
      const msg = apiError instanceof Error ? apiError.message : String(apiError);
      return NextResponse.json({ 
        error: "AI abhi available nahi hai. Dobara try karein.",
        details: process.env.NODE_ENV !== "production" ? msg : undefined
      }, { status: 500 });
    }

    if (!textResponse) {
      console.error("❌ Empty response from AI in /api/rescue");
      return NextResponse.json({ error: "AI abhi available nahi hai. Dobara try karein." }, { status: 500 });
    }

    try {
      const cleanedText = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const json = JSON.parse(cleanedText);
      return NextResponse.json(json);
    } catch (parseError) {
      console.error("❌ JSON Parse Error in /api/rescue:", parseError);
      return NextResponse.json({ error: "AI abhi available nahi hai. Dobara try karein." }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ System error in /api/rescue:", error);
    return NextResponse.json({ error: "AI abhi available nahi hai. Dobara try karein." }, { status: 500 });
  }
}
