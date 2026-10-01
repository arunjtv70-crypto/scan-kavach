"use client";

import InstantHelp from "@/components/InstantHelp";
import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Check, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const SCAM_EVENTS = [
  { id: "paisa", key: "rescue.events.paisa" },
  { id: "investment", key: "rescue.events.investment" },
  { id: "otp", key: "rescue.events.otp" },
  { id: "link", key: "rescue.events.link" },
  { id: "docs", key: "rescue.events.docs" },
  { id: "blackmail", key: "rescue.events.blackmail" },
];

type RescueResult = {
  priority_steps: string[];
  complaint_draft: string;
  bank_letter: string;
  reassurance: string;
};

export default function RescuePage() {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RescueResult | null>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(3599); // 59:59
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  
  const [details, setDetails] = useState({
    bankName: "",
    amount: "",
    time: "",
    utr: "",
    scammerId: ""
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleEvent = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selected.length === 0) {
      setError(t("rescue.error.select"));
      return;
    }
    setError("");
    setLoading(true);

    try {
      const labels = selected.map((id) => {
        return id;
      });

      const res = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: labels, language: language, details }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "System error.");
      }
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "System error.";
      setError(message || t("scan.error.ai"));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "bank" | "draft") => {
    navigator.clipboard.writeText(text);
    if (type === "bank") {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } else {
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
    }
  };

  if (result) {
    const isSextortion = selected.includes("blackmail");

    return (
      <div className="flex flex-col gap-6 py-4 animate-in fade-in">
        <button onClick={() => setResult(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink w-fit">
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </button>

        {isSextortion && (
          <div className="bg-ivory border border-forest/20 p-5 rounded-2xl flex flex-col gap-2 text-center">
             <h2 className="text-forest font-bold text-xl font-serif">{t("rescue.title2")}</h2>
             <p className="text-sm text-ink-secondary font-medium">{result.reassurance}</p>
          </div>
        )}

        <div className={`bg-white p-5 rounded-2xl border ${isSextortion ? 'border-[#E3DCCB]' : 'border-brick/20'} shadow-sm`}>
          <h2 className="font-serif text-xl font-bold text-ink mb-2">{t("rescue.priority")}</h2>
          {!isSextortion && <p className="text-sm font-medium text-ink-secondary mb-4">{result.reassurance}</p>}
          <div className="relative pl-6 mt-4">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#E3DCCB]"></div>
            <div className="flex flex-col gap-6">
              {result.priority_steps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-forest border-2 border-white shadow-sm z-10"></div>
                  <p className="text-sm font-medium text-ink leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {result.bank_letter && result.bank_letter.length > 20 && !result.bank_letter.includes('Not applicable') && !isSextortion && (
          <div className="bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-ink text-sm">{t("rescue.bank_letter")}</h3>
              <button onClick={() => copyToClipboard(result.bank_letter, "bank")} className="text-forest flex items-center gap-1 text-xs font-bold uppercase">
                {copiedBank ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedBank ? t("copied") : t("copy")}
              </button>
            </div>
            <p className="text-sm text-ink-secondary bg-ivory p-3 rounded-xl font-mono whitespace-pre-wrap">
              {result.bank_letter}
            </p>
          </div>
        )}

        {result.complaint_draft && result.complaint_draft.length > 20 && (
          <div className="bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-ink text-sm">{t("rescue.cyber_draft")}</h3>
              <button onClick={() => copyToClipboard(result.complaint_draft, "draft")} className="text-forest flex items-center gap-1 text-xs font-bold uppercase">
                {copiedDraft ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedDraft ? t("copied") : t("copy")}
              </button>
            </div>
            <p className="text-sm text-ink-secondary bg-ivory p-3 rounded-xl font-mono whitespace-pre-wrap">
              {result.complaint_draft}
            </p>
          </div>
        )}

        <InstantHelp 
          detectedEntities={details.bankName ? [details.bankName] : []} 
          scamCategory={
            selected.includes("blackmail") ? "SEXTORTION_CYBERBULLYING" :
            selected.includes("paisa") ? "UPI_BANKING" :
            selected.includes("investment") ? "JOB_INVESTMENT_FRAUD" :
            selected.includes("docs") ? "IDENTITY_DOCUMENT_FRAUD" :
            selected.includes("link") ? "PHISHING_VISHING_SMISHING" :
            "OTHER"
          } 
        />

        <div className="bg-ivory border border-[#E3DCCB] p-4 rounded-xl flex gap-3 text-sm font-medium text-ink-secondary mt-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-ink-secondary" />
          <p>{t("rescue.disclaimer")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full py-4 gap-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink w-fit">
        <ArrowLeft className="w-4 h-4" />
        {t("back")}
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink leading-tight mb-2">
            {t("rescue.title1")}<br />{t("rescue.title2")}
          </h1>
          <div className="flex items-center gap-2 mt-4 text-saffron font-bold text-base bg-saffron/10 w-fit px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            <span>{t("rescue.timer")} {formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-ink text-sm uppercase tracking-wider mb-1">{t("rescue.what_happened")}</h3>
        {SCAM_EVENTS.map((ev) => {
          const isSelected = selected.includes(ev.id);
          const isBlackmail = ev.id === "blackmail";
          // @ts-expect-error valid key
          const label = t(ev.key);
          return (
            <button
              key={ev.id}
              onClick={() => toggleEvent(ev.id)}
              className={`w-full p-4 rounded-xl border text-left font-semibold text-sm transition-colors ${
                isSelected 
                  ? (isBlackmail ? 'bg-forest/10 border-forest text-forest' : 'bg-brick/10 border-brick text-brick') 
                  : 'bg-white border-[#E3DCCB] text-ink hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{label}</span>
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? (isBlackmail ? 'border-forest bg-forest text-white' : 'border-brick bg-brick text-white') : 'border-[#E3DCCB]'}`}>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 bg-ivory p-4 rounded-xl border border-gray-200 mt-2">
        <h3 className="font-bold text-ink text-sm">{t("rescue.details")}</h3>
        <input type="text" placeholder={t("rescue.bank_name")} className="p-3 border rounded-lg text-sm w-full" value={details.bankName} onChange={e => setDetails({...details, bankName: e.target.value})} />
        <input type="text" placeholder={t("rescue.amount")} className="p-3 border rounded-lg text-sm w-full" value={details.amount} onChange={e => setDetails({...details, amount: e.target.value})} />
        <input type="text" placeholder={t("rescue.time")} className="p-3 border rounded-lg text-sm w-full" value={details.time} onChange={e => setDetails({...details, time: e.target.value})} />
        <input type="text" placeholder={t("rescue.utr")} className="p-3 border rounded-lg text-sm w-full" value={details.utr} onChange={e => setDetails({...details, utr: e.target.value})} />
        <input type="text" placeholder={t("rescue.scammer")} className="p-3 border rounded-lg text-sm w-full" value={details.scammerId} onChange={e => setDetails({...details, scammerId: e.target.value})} />
      </div>

      {error && (
        <div className="text-brick text-sm font-semibold bg-brick/5 p-4 rounded-xl border border-brick/20 flex flex-col gap-3">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 flex flex-col gap-3">
        <button 
          onClick={handleGenerate}
          disabled={loading || selected.length === 0}
          className={`w-full text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] transition-all shadow-sm ${selected.includes("blackmail") && selected.length === 1 ? 'bg-forest' : 'bg-brick'}`}
        >
          {loading ? (
            <span className="animate-pulse">{t("rescue.loading")}</span>
          ) : (
            t("rescue.btn")
          )}
        </button>
      </div>
    </div>
  );
}
