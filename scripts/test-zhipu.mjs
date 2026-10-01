const apiKey = process.env.ZHIPU_API_KEY;

if (!apiKey) {
  console.error("ZHIPU_API_KEY is missing");
  process.exit(1);
}

async function test() {
  const req = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "glm-4",
      messages: [{ role: "user", content: "Say OK" }]
    })
  });
  const data = await req.json();
  console.log("Zhipu:", JSON.stringify(data));
}
test();
