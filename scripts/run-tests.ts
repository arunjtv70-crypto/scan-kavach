import fs from "fs";
import path from "path";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  const casesPath = path.join(process.cwd(), "tests", "cases.json");
  const payloads = JSON.parse(fs.readFileSync(casesPath, "utf-8"));

  const results: any[] = [];
  let passCount = 0;

  for (const p of payloads) {
    let success = false;
    while (!success) {
      try {
        const res = await fetch("http://localhost:3000/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: p.text, language: "en" })
        });
        const data = await res.json();
        
        if (data.details === "RATE_LIMIT" || data.error?.includes("Dobara try karein")) {
          console.log(`[Rate Limited] Waiting 5 seconds before retrying case ${p.id}...`);
          await delay(5000);
          continue;
        }

        const got = data.verdict;
        const pass = got === p.expected;
        if (pass) passCount++;
        
        results.push({
          Case: p.id,
          Expected: p.expected,
          Got: got || "ERROR",
          Score: data.risk_score || 0,
          Status: pass ? "✅ PASS" : "❌ FAIL"
        });
        
        success = true;
      } catch (e: any) {
        console.error(`Error on case ${p.id}:`, e.message);
        success = true;
        results.push({
          Case: p.id,
          Expected: p.expected,
          Got: "CRASH",
          Score: 0,
          Status: "❌ FAIL"
        });
      }
    }
    await delay(3000); // polite delay between cases
  }

  console.table(results);
  console.log(`\nFinal Score: ${passCount} / ${payloads.length} PASSED`);
}

runTests();
