import { GoogleGenAI } from "@google/genai";

export const MODEL_NAME = "gemini-3.8-flash";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key-to-prevent-crash" });
