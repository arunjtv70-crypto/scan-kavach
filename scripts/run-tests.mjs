async function runTests() {
  const tests = [
    {
      name: "1. Real Brand Ad",
      text: "HDFC Bank: Dear Customer, you have a Pre-approved Personal Loan of Rs. 5 Lakhs! ZERO processing fees and instant disbursal. Click here to apply: hdfcbank.com/offers/pl T&C apply."
    },
    {
      name: "2. Fake KYC SMS",
      text: "Dear User, your HDFC bank account will be blocked today due to pending PAN Card update. Click here immediately to update: http://hdfc-kyc-update-now.xyz/login"
    },
    {
      name: "3. Digital Arrest Message",
      text: "CBI NOTICE: An international courier registered under your name containing illegal passports has been intercepted. An arrest warrant is issued. Do not disconnect the call or contact anyone. Transfer funds to RBI secure account immediately for verification."
    }
  ];

  for (const t of tests) {
    console.log(`\n================================`);
    console.log(`TEST: ${t.name}`);
    console.log(`INPUT: ${t.text}`);
    try {
      const res = await fetch("http://localhost:3000/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t.text })
      });
      const data = await res.json();
      console.log(`VERDICT: ${data.verdict} (Score: ${data.risk_score})`);
      console.log(`CATEGORY: ${data.scam_category}`);
      if (data.could_not_verify && data.could_not_verify.length > 0) {
        console.log(`COULD NOT VERIFY:`, data.could_not_verify);
      }
      console.log(`REASONS:`, data.reasons);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

runTests();
