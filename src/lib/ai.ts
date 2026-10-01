import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4:31b";

export type AIProvider = "gemini" | "ollama_hosted" | "ollama_local" | "none";

export function getAIProviderInfo(): { provider: AIProvider; error?: string } {
  if (process.env.GEMINI_API_KEY) return { provider: "gemini" };
  if (process.env.OLLAMA_BASE_URL && process.env.OLLAMA_API_KEY) return { provider: "ollama_hosted" };
  if (process.env.NODE_ENV !== "production") return { provider: "ollama_local" };
  
  if (!process.env.GEMINI_API_KEY && !process.env.OLLAMA_API_KEY) {
    return { provider: "none", error: "Missing GEMINI_API_KEY or OLLAMA_BASE_URL+OLLAMA_API_KEY" };
  }
  return { provider: "none", error: "AI key not configured" };
}

export async function callAI(systemPrompt: string, promptText: string, imageBase64?: string): Promise<string> {
  const { provider, error } = getAIProviderInfo();
  
  if (provider === "none") {
    console.error("❌ AI Provider Error:", error);
    throw new Error("AI key not configured");
  }

  if (provider === "gemini") {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [promptText];
    if (imageBase64) {
      contents.push({
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      });
    }
    
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });
      return response.text || "";
    } catch (err) {
      console.error("❌ Gemini API Error:", err);
      throw err;
    }
  }

  // Ollama (hosted or local)
  let baseUrl = "http://localhost:11434";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  if (provider === "ollama_hosted") {
    baseUrl = process.env.OLLAMA_BASE_URL!.replace(/\/$/, "");
    headers["Authorization"] = `Bearer ${process.env.OLLAMA_API_KEY}`;
  }
  const ollamaUrl = `${baseUrl}/api/chat`;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: promptText }
  ];
  
  if (imageBase64) {
    messages[1].images = [imageBase64];
  }

  try {
    const fetchRes = await fetch(ollamaUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        format: "json",
        options: { num_predict: 500, temperature: 0.2 },
        stream: false
      })
    });

    if (!fetchRes.ok) {
      throw new Error(`Ollama API error: ${fetchRes.status} ${await fetchRes.text()}`);
    }
    const response = await fetchRes.json();
    return response.message.content;
  } catch (err) {
    console.error(`❌ Ollama API Error (${provider}):`, err);
    throw err;
  }
}
