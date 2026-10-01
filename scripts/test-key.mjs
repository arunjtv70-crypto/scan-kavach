const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("OPENROUTER_API_KEY is missing");
  process.exit(1);
}

async function test() {
  const req = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.2-11b-vision-instruct:free",
      messages: [{ role: "user", content: "Say OK" }]
    })
  });
  const data = await req.json();
  console.log("Llama 3.2 Vision 11B:", JSON.stringify(data));

  const req2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-lite-preview-02-05:free",
      messages: [{ role: "user", content: "Say OK" }]
    })
  });
  const data2 = await req2.json();
  console.log("Gemini 2.0 Flash Lite:", JSON.stringify(data2));
}

test();
