const apiKey = process.env.OLLAMA_API_KEY;

if (!apiKey) {
  console.error("OLLAMA_API_KEY is missing");
  process.exit(1);
}

async function test() {
  try {
    const res = await fetch("https://ollama.com/api/tags", {
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    const data = await res.json();
    console.log("Models:", data.models.map(m => m.name).join(", "));
  } catch (e) {
    console.log("Error:", e);
  }
}
test();
