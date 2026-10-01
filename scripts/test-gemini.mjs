import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing in .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function test() {
  console.log("Testing with configured Gemini API key");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Hello, just say exactly 'OK'",
    });
    console.log("✅ Success! Response:", response.text);
  } catch (error) {
    console.error("❌ API Call Failed:");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    if (error.status) console.error("Status:", error.status);
    if (error.error) console.error("Details:", JSON.stringify(error.error, null, 2));
  }
}

test();
