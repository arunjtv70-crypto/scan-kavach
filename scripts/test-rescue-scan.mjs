async function runTests() {
  const rescueTests = [
    {
      name: "1. Only OTP diya (Hindi)",
      payload: {
        events: ["OTP diya"],
        language: "hi",
        details: { bankName: "SBI", amount: "10000", time: "Oct 12, 10 AM", utr: "12345", scammerId: "9876543210" }
      }
    },
    {
      name: "2. Only Paisa bheja (English)",
      payload: {
        events: ["Paisa bheja / Bank Fraud"],
        language: "en",
        details: { bankName: "ICICI", amount: "5000", time: "Today 5PM", utr: "9999", scammerId: "UPI123" }
      }
    },
    {
      name: "3. Remote app + Paisa bheja (Hindi)",
      payload: {
        events: ["Remote app install kiya", "Paisa bheja / Bank Fraud"],
        language: "hi",
        details: { bankName: "HDFC", amount: "50000", time: "Yesterday", utr: "888", scammerId: "AnyDesk User" }
      }
    },
    {
      name: "4. Documents diye (English)",
      payload: {
        events: ["Identity documents diye (Aadhaar/PAN)"],
        language: "en",
        details: { bankName: "", amount: "", time: "", utr: "", scammerId: "Telegram Guy" }
      }
    }
  ];

  console.log("=== RESCUE TESTS ===");
  for (const t of rescueTests) {
    console.log(`\n--- ${t.name} ---`);
    try {
      const res = await fetch("http://localhost:3000/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t.payload)
      });
      const data = await res.json();
      console.log(`Priority Steps (${data.priority_steps?.length || 0}):`, data.priority_steps);
      console.log(`Bank Letter preview:`, data.bank_letter?.substring(0, 100).replace(/\n/g, " ") + "...");
    } catch (e) {
      console.log(`Error:`, e.message);
    }
  }

  const scanTests = [
    { name: "1. Real Ad", text: "HDFC: Pre-approved 5 lakh loan! Click hdfcbank.com/loan" },
    { name: "2. Fake KYC", text: "SBI KYC Blocked! Update on http://sbi-update-now.xyz" },
    { name: "3. Arrest", text: "CBI Notice: Video call arrest warrant issued. Pay RBI secure account." }
  ];

  console.log("\n=== SCAN TESTS ===");
  for (const t of scanTests) {
    console.log(`\n--- ${t.name} ---`);
    try {
      const res = await fetch("http://localhost:3000/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t.text })
      });
      const data = await res.json();
      console.log(`Verdict: ${data.verdict} (Score: ${data.risk_score})`);
      console.log(`Next Steps:`, data.next_steps);
    } catch (e) {
      console.log(`Error:`, e.message);
    }
  }
}

runTests();
