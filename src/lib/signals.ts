export interface SignalResult {
  senderHeaderValid: boolean;
  urls: { url: string; isSuspicious: boolean }[];
  asksOtpPinPassword: boolean;
  asksMoneyOrFee: boolean;
  asksInstallApp: boolean;
  threatOrArrest: boolean;
  fakeAuthority: boolean;
  urgencyWords: boolean;
  secrecyWords: boolean;
  guaranteedReturns: boolean;
  blackmail: boolean;
  phoneNumbers: string[];
}

export function extractSignals(text: string): SignalResult {
  // Sender header usually appears at the beginning of Indian SMS like "VM-SBIUPI" or "AD-HDFCBK"
  const senderHeaderValid = /^[A-Z]{2}-[A-Z0-9]{3,8}(-[A-Z])?/.test(text.trim());
  
  // Extract URLs
  const urlRegex = /(?:https?:\/\/|www\.)[^\s]+/gi;
  const foundUrls = text.match(urlRegex) || [];
  const urls = foundUrls.map(url => {
    const isSuspicious = /(bit\.ly|tinyurl|is\.gd|goo\.gl|t\.co|wa\.me|t\.me|\.xyz|\.top|\.online|free|hdfcbk\.co)/i.test(url)
                         || url.split(".").length > 4; // Too many subdomains
    return { url, isSuspicious };
  });

  const phoneRegex = /(?:\+91|91)?\s?[6-9]\d{9}/g;
  const phoneNumbers = Array.from(new Set(text.match(phoneRegex) || []));

  const hasOtpWord = /(otp|pin|password|cvv|expiry|card details|login details)/i.test(text);
  const cleanText = text.toLowerCase().replace(/do not share/g, '').replace(/never share/g, '').replace(/don't share/g, '');
  const isAskingToShare = /(share|verify|update|provide|give|enter|required|tell me|ask)/i.test(cleanText);
  const asksOtpPinPassword = hasOtpWord && (isAskingToShare || urls.some(u => u.isSuspicious));
  const asksMoneyOrFee = /(processing fee|registration fee|refundable fee|pay (rs|₹|inr)|deposit|send money|transfer (rs|₹|inr)|refund|extra \d+|gift card)/i.test(text);
  const asksInstallApp = /(apk|anydesk|teamviewer|quicksupport|rustdesk)/i.test(text);
  const threatOrArrest = /(arrest|warrant|fir|police|jail|court|legal action|frozen|block(ed)? your account|cut|disconnect)/i.test(text);
  const fakeAuthority = /(cbi|customs|trai|rbi|supreme court|narcotics|fedex|dhl|india post|electricity|power|bescom|mahavitaran|mseb)/i.test(text);
  const urgencyWords = /(immediately|urgent|act now|today only|within 24 hours|expires in|blocked if|suspend(ed)?)/i.test(text);
  const secrecyWords = /(do not tell|keep secret|confidential|alone|don't share)/i.test(text);
  const guaranteedReturns = /(guaranteed return|profit|earn daily|task(s)?|part time job|work from home|telegram group|whatsapp group)/i.test(text);
  const blackmail = /(leak|photos|videos|nude|family|expose|shame)/i.test(text);

  return {
    senderHeaderValid,
    urls,
    asksOtpPinPassword,
    asksMoneyOrFee,
    asksInstallApp,
    threatOrArrest,
    fakeAuthority,
    urgencyWords,
    secrecyWords,
    guaranteedReturns,
    blackmail,
    phoneNumbers
  };
}

export function scoreSignals(signals: SignalResult): { score: number; verdict: "SAFE" | "SUSPICIOUS" | "SCAM"; advice?: string; category: string } {
  let redFlags = 0;
  let weakFlags = 0;

  if (signals.asksOtpPinPassword) redFlags++;
  if (signals.asksMoneyOrFee) redFlags++;
  if (signals.asksInstallApp) redFlags++;
  if (signals.threatOrArrest) redFlags++;
  if (signals.blackmail) redFlags++;

  if (signals.fakeAuthority) weakFlags++;
  if (signals.urgencyWords) weakFlags++;
  if (signals.secrecyWords) weakFlags++;
  if (signals.guaranteedReturns) weakFlags++;
  if (signals.urls.some(u => u.isSuspicious)) weakFlags++;

  const hasOnlyLinkOrPhone = redFlags === 0 && weakFlags <= 1 && signals.urls.some(u => u.isSuspicious);

  if (redFlags > 0 || weakFlags >= 3) {
    let category = "OTHER";
    if (signals.asksOtpPinPassword || signals.asksInstallApp) category = "PHISHING_VISHING_SMISHING";
    if (signals.threatOrArrest || signals.fakeAuthority) category = "DIGITAL_ARREST_EXTORTION";
    if (signals.guaranteedReturns) category = "JOB_INVESTMENT_FRAUD";
    if (signals.blackmail) category = "SEXTORTION_CYBERBULLYING";

    return { 
      score: Math.min(95, 70 + (redFlags * 10) + (weakFlags * 5)), 
      verdict: "SCAM",
      category
    };
  }

  if (hasOnlyLinkOrPhone) {
    return { 
      score: 35, 
      verdict: "SUSPICIOUS", 
      advice: "Do not click unverified links. Open the official app instead.",
      category: "SAFE" 
    };
  }

  return { 
    score: 10, 
    verdict: "SAFE",
    category: "SAFE"
  };
}
