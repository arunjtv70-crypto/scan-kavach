async function runTests() {
  const payloads = [
    { name: "BOI SMS", text: "Dear User, Your BOI account is being linked to your UPI App. Report to us on 18001031906 if not done by you. NACH debit alert." },
    { name: "HDFC EMI", text: "HDFC EMI deferment SMS with a short link https://bit.ly/hdfcemi" },
    { name: "Navi Ad", text: "Pre-approved loan up to 5 lakhs from Navi. Download app now. No charges." },
    { name: "Fake KYC", text: "Dear customer your bank account blocked please complete KYC via link http://kyc-update.xyz. OTP required." },
    { name: "Overpayment", text: "Hi, I am buying this for my co-workers sick bed. Can I send you an extra 2000 so you can buy a gift card for them?" }
  ];

  for (const p of payloads) {
    console.log(`\n--- TESTING: ${p.name} ---`);
    let success = false;
    while (!success) {
      try {
        const res = await fetch("http://localhost:3000/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: p.text, language: "en" })
        });
        const data = await res.json();
        if (data.details === "RATE_LIMIT") {
          console.log("Rate limited... waiting 4 seconds.");
          await new Promise(r => setTimeout(r, 4000));
        } else {
          console.log(JSON.stringify(data, null, 2));
          success = true;
        }
      } catch (e) {
        console.error(e.message);
        success = true;
      }
    }
    // wait before next
    await new Promise(r => setTimeout(r, 3000));
  }
}
runTests();
