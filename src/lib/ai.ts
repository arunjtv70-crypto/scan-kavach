export function getAIProviderInfo(): { provider: string; error?: string } {
  if (process.env.GROQ_API_KEY) return { provider: "groq" };
  if (process.env.GEMINI_API_KEY) return { provider: "gemini" };
  if (process.env.OLLAMA_API_KEY) return { provider: "ollama_hosted" };
  if (process.env.OLLAMA_BASE_URL) return { provider: "ollama_local" };
  return { provider: "none", error: "Vercel par AI chalane ke liye GROQ_API_KEY ya GEMINI_API_KEY set karein" };
}

export async function callAI(systemPrompt: string, promptText: string, imageBase64?: string): Promise<string> {
  const { provider, error } = getAIProviderInfo();
  
  if (provider === "none") {
    console.error("❌ AI Provider Error:", error);
    throw new Error(error);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: promptText }
  ];

  if (provider === "groq") {
    if (imageBase64) {
      messages[1].content = [
        { type: "text", text: promptText },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      ];
    }
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) throw new Error(`Groq API Error: ${await res.text()}`);
    const data = await res.json();
    return data.choices[0].message.content;
  }

  if (provider === "gemini") {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [systemPrompt, promptText];
    if (imageBase64) {
      contents.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
    }
    
    const response = await ai.models.generateContent({
      model,
      contents,
      config: { temperature: 0.2, responseMimeType: "application/json" }
    });
    return response.text || "";
  }

  // Fallback to Ollama
  const ollamaUrl = provider === "ollama_hosted" ? "https://ollama.com/api/chat" : `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/chat`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (provider === "ollama_hosted") headers["Authorization"] = `Bearer ${process.env.OLLAMA_API_KEY}`;
  
  if (imageBase64) messages[1].images = [imageBase64];

  const fetchRes = await fetch(ollamaUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || "gemma4:31b",
      messages,
      format: "json",
      options: { num_predict: 500, temperature: 0.2 },
      stream: false
    })
  });

  if (!fetchRes.ok) throw new Error(`Ollama API error: ${fetchRes.status} ${await fetchRes.text()}`);
  const data = await fetchRes.json();
  return data.message.content;
}
