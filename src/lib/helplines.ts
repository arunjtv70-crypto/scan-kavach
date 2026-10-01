export const nationalHelplines = {
  cyber: 1930,
  cybercrimePortal: "https://cybercrime.gov.in",
  emergency: 112,
  uidai: 1947,
  childline: 1098,
  telemanas: 14416,
  stopncii: "https://stopncii.org",
  sancharSaathi: "https://sancharsaathi.gov.in",
  mAadhaar: "https://uidai.gov.in/en/ecosystem/authentication-devices-documents/maadhaar-app.html"
};

export type BankDirectoryEntry = {
  key: string;
  names: string[];
  tollFree: string[];
  fraudReportUrl: string;
  source: string;
};

export const bankDirectory: BankDirectoryEntry[] = [
  {
    key: "SBI",
    names: ["sbi", "state bank of india", "sbioa"],
    tollFree: ["1800111109", "18001234", "18002100"],
    fraudReportUrl: "https://bank.sbi/web/customer-care/cyber-security-and-frauds",
    source: "https://bank.sbi/web/customer-care/"
  },
  {
    key: "HDFC",
    names: ["hdfc", "hdfc bank"],
    tollFree: ["18002586161"],
    fraudReportUrl: "https://www.hdfcbank.com/personal/useful-links/report-unauthorized-transactions",
    source: "https://www.hdfcbank.com/personal/need-help/contact-us/toll-free"
  },
  {
    key: "ICICI",
    names: ["icici", "icici bank"],
    tollFree: ["18001080"],
    fraudReportUrl: "https://www.icicibank.com/Personal-Banking/fraud-prevention",
    source: "https://www.icicibank.com/customer-care"
  },
  {
    key: "AXIS",
    names: ["axis", "axis bank"],
    tollFree: ["18001035577"], // specific for fraud
    fraudReportUrl: "https://www.axisbank.com/support/report-fraud",
    source: "https://www.axisbank.com/support/report-fraud"
  },
  {
    key: "PNB",
    names: ["pnb", "punjab national bank"],
    tollFree: ["18001802222", "18001032222"],
    fraudReportUrl: "https://www.pnbindia.in/Security-Tips.html",
    source: "https://www.pnbindia.in/Contact-Us.html"
  },
  {
    key: "BOB",
    names: ["bob", "bank of baroda", "baroda"],
    tollFree: ["18002584455", "18001024455"],
    fraudReportUrl: "https://www.bankofbaroda.in/report-fraud",
    source: "https://www.bankofbaroda.in/contact-us"
  },
  {
    key: "KOTAK",
    names: ["kotak", "kotak mahindra", "kotak bank"],
    tollFree: ["18002090000"],
    fraudReportUrl: "https://www.kotak.com/en/customer-service/contact-us/fraud.html",
    source: "https://www.kotak.com/en/customer-service/contact-us.html"
  },
  {
    key: "CANARA",
    names: ["canara", "canara bank"],
    tollFree: ["18004250018", "18001030"],
    fraudReportUrl: "https://canarabank.com/report-fraud",
    source: "https://canarabank.com/contact-us"
  },
  {
    key: "UNION",
    names: ["union bank", "union bank of india", "ubi"],
    tollFree: ["1800222244", "18002082244"],
    fraudReportUrl: "https://www.unionbankofindia.co.in/english/report-fraud.aspx",
    source: "https://www.unionbankofindia.co.in/english/contact-us.aspx"
  },
  {
    key: "IDFC",
    names: ["idfc", "idfc first", "idfc first bank"],
    tollFree: ["180010888"],
    fraudReportUrl: "https://www.idfcfirstbank.com/support/report-fraud",
    source: "https://www.idfcfirstbank.com/support/customer-care"
  },
  {
    key: "YES",
    names: ["yes bank", "yesbank"],
    tollFree: ["18001200"],
    fraudReportUrl: "https://www.yesbank.in/about-us/security",
    source: "https://www.yesbank.in/contact-us"
  },
  {
    key: "INDIAN_BANK",
    names: ["indian bank", "allahabad bank"],
    tollFree: ["180042500000"],
    fraudReportUrl: "https://www.indianbank.in/departments/report-fraud/",
    source: "https://www.indianbank.in/departments/customer-care/"
  },
  {
    key: "PAYTM",
    names: ["paytm", "one97"],
    tollFree: [],
    fraudReportUrl: "https://paytm.com/care/fraud",
    source: "https://paytm.com/care"
  },
  {
    key: "PHONEPE",
    names: ["phonepe", "phone pe"],
    tollFree: [],
    fraudReportUrl: "https://www.phonepe.com/report-fraud/",
    source: "https://www.phonepe.com/contact-us/"
  },
  {
    key: "GPAY",
    names: ["gpay", "google pay"],
    tollFree: ["18004190157"],
    fraudReportUrl: "https://support.google.com/pay/india/answer/11412501",
    source: "https://support.google.com/pay/india/answer/9008234"
  },
  {
    key: "AMAZON_PAY",
    names: ["amazon pay", "amazonpay"],
    tollFree: [],
    fraudReportUrl: "https://www.amazon.in/gp/help/customer/display.html?nodeId=202154430",
    source: "https://www.amazon.in/gp/help/customer/display.html"
  },
  {
    key: "BHIM",
    names: ["bhim", "npci bhim"],
    tollFree: ["18001201740"],
    fraudReportUrl: "https://www.bhimupi.org.in/get-touch",
    source: "https://www.bhimupi.org.in/get-touch"
  }
];

export function findBankHelplines(detectedEntities: string[]): BankDirectoryEntry[] {
  if (!detectedEntities || !detectedEntities.length) return [];
  const matches: BankDirectoryEntry[] = [];
  
  const searchStrs = detectedEntities.map(e => e.toLowerCase().trim());
  
  for (const entry of bankDirectory) {
    if (entry.names.some(name => searchStrs.some(s => s.includes(name) || name.includes(s)))) {
      matches.push(entry);
    }
  }
  
  return matches;
}
