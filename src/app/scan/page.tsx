"use client";

import InstantHelp from "@/components/InstantHelp";
import { useState, Suspense, useEffect } from "react";
import { Upload, Send, Share2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type ScanResult = {
  verdict: "SCAM" | "SUSPICIOUS" | "SAFE";
  scam_category: string;
  risk_score: number;
  scam_type: string;
  reasons: string[];
  suspicious_phrases: string[];
  could_not_verify?: string[];
  detected_entities?: string[];
  next_steps: string[];
  family_alert_text: string;
};

function ScanPageContent() {
  const searchParams = useSearchParams();
  const categoryHint = searchParams.get("category");
  const { t, language } = useLanguage();
  
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState(t("scan.status.1"));
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warmup: true })
    }).catch(() => {});
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 10 * 1024 * 1024) {
        setError(t("scan.error.size"));
        return;
      }
      setFile(f);
      setText(""); 
      setError("");
      setErrorDetails("");
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          const MAX_SIZE = 1024;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
             resolve(reader.result?.toString().replace(/^data:(.*,)?/, "") ?? "");
             return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const encoded = canvas.toDataURL("image/jpeg", 0.8).replace(/^data:(.*,)?/, "");
          resolve(encoded);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleScan = async () => {
    if (!text && !file) {
      setError(t("scan.error.empty"));
      return;
    }
    setError("");
    setErrorDetails("");
    setLoading(true);
    setResult(null);
    setStatusText(t("scan.status.1"));
    
    let cycle = 0;
    const statuses = [t("scan.status.1"), t("scan.status.2"), t("scan.status.3"), t("scan.status.4")];
    const interval = setInterval(() => {
      cycle++;
      setStatusText(statuses[cycle % statuses.length]);
    }, 2000);

    try {
      const payload: Record<string, string> = { language };
      if (categoryHint) payload.categoryHint = categoryHint;
      
      if (file) {
        payload.imageBase64 = await getBase64(file);
        payload.imageMimeType = "image/jpeg";
      } else {
        payload.text = text;
      }

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) setErrorDetails(data.details);
        throw new Error(data.error || "Analysis failed.");
      }
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || t("scan.error.ai"));
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-8 animate-in fade-in h-full">
        <div className="text-center font-bold text-xl text-ink mb-2">{statusText}</div>
        <div className="bg-white border border-[#E3DCCB] p-6 rounded-2xl shadow-sm relative overflow-hidden animate-pulse">
          <div className="h-4 bg-gray-200 w-24 mb-4 rounded"></div>
          <div className="h-8 bg-gray-200 w-48 mb-6 rounded"></div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gray-200 w-1/3"></div>
          </div>
        </div>
        <div className="flex flex-col gap-4 animate-pulse mt-4">
          <div className="h-6 bg-gray-200 w-32 rounded"></div>
          <div className="flex flex-col gap-3">
            <div className="h-4 bg-gray-200 w-full rounded"></div>
            <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
            <div className="h-4 bg-gray-200 w-4/6 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const isScam = result.verdict === "SCAM";
    const isSafe = result.verdict === "SAFE";
    const isSextortion = result.scam_category === "SEXTORTION_CYBERBULLYING";
    
    return (
      <div className="flex flex-col gap-6 py-4 animate-in fade-in">
        <Link href="/" onClick={() => setResult(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink w-fit">
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>
        
        {isSextortion && (
          <div className="bg-ivory border border-forest/20 p-4 rounded-xl flex flex-col gap-1 text-center">
             <h3 className="text-forest font-bold text-lg font-serif">{t("scan.sextortion.title")}</h3>
             <p className="text-sm text-ink-secondary font-medium">{t("scan.sextortion.desc")}</p>
          </div>
        )}

        <div className={`border ${isSextortion ? 'border-[#E3DCCB]' : isScam ? 'border-brick/30' : isSafe ? 'border-forest/30' : 'border-[#E3DCCB]'} bg-white p-6 rounded-2xl shadow-sm relative overflow-hidden`}>
          <div className="text-xs font-bold tracking-widest text-ink-secondary mb-2 uppercase">
            {result.scam_category.replace(/_/g, " ")}
          </div>
          <h2 className={`font-serif text-3xl font-bold ${isSextortion ? 'text-ink' : isScam ? 'text-brick' : isSafe ? 'text-forest' : 'text-saffron'}`}>
            {isScam ? t("scan.verdict.scam") : isSafe ? t("scan.verdict.safe") : t("scan.verdict.suspicious")}
          </h2>
          
          <div className="mt-6 mb-2 flex justify-between text-xs font-bold text-ink-secondary">
            <span>{t("scan.risk")}</span>
            <span>{result.risk_score}/100</span>
          </div>
          <div className="w-full bg-[#E3DCCB] h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isSextortion ? 'bg-saffron' : isScam ? 'bg-brick' : isSafe ? 'bg-forest' : 'bg-saffron'}`}
              style={{ width: `${result.risk_score}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-lg text-ink">{t("scan.why")}</h3>
          <ul className="flex flex-col gap-3">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-ink">
                <span className={`mt-1 flex-shrink-0 ${isScam && !isSextortion ? 'text-brick' : 'text-forest'}`}>•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          
          {result.suspicious_phrases.length > 0 && (
            <div className="mt-2 p-4 bg-white border border-[#E3DCCB] rounded-xl text-sm">
              <div className="text-xs font-bold text-ink-secondary mb-2 uppercase">{t("scan.phrases")}</div>
              <div className="flex flex-wrap gap-2">
                {result.suspicious_phrases.map((phrase, i) => (
                  <span key={i} className={`underline decoration-2 text-ink font-medium ${isSextortion ? 'decoration-saffron' : 'decoration-brick'}`}>
                    &quot;{phrase}&quot;
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.could_not_verify && result.could_not_verify.length > 0 && (
            <div className="mt-2 p-4 bg-ivory border border-[#E3DCCB] rounded-xl text-sm">
              <div className="text-xs font-bold text-ink-secondary mb-2 uppercase">{t("scan.unverified")}</div>
              <ul className="flex flex-col gap-2">
                {result.could_not_verify.map((item, i) => (
                  <li key={i} className="text-ink flex gap-2">
                    <span className="text-saffron">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg text-ink mt-2">{t("scan.next_steps")}</h3>
          <div className="bg-white border border-[#E3DCCB] rounded-xl overflow-hidden">
            {result.next_steps.map((step, i) => (
              <div key={i} className={`p-4 flex gap-3 ${i !== 0 ? 'border-t border-[#E3DCCB]' : ''}`}>
                <div className="bg-ivory text-ink font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                  {i + 1}
                </div>
                <p className="text-ink text-sm font-medium leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <InstantHelp 
          detectedEntities={result.detected_entities} 
          scamCategory={result.scam_category} 
          isSafe={isSafe} 
        />

        <div className="flex flex-col gap-3 mt-4">
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(result.family_alert_text)}`}
            target="_blank" rel="noreferrer"
            className="w-full bg-forest text-white py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
          >
            <Share2 className="w-5 h-5" />
            {t("scan.share")}
          </a>
          <button 
            onClick={() => setResult(null)}
            className="w-full mt-2 text-sm text-ink-secondary font-semibold"
          >
            {t("scan.new")}
          </button>
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
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink">{t("scan.title")}</h1>
        <p className="text-ink-secondary text-sm mt-1">{t("scan.subtitle")}</p>
        {categoryHint && (
          <div className="mt-3 inline-block px-3 py-1 bg-forest/10 text-forest text-xs font-bold uppercase rounded-md tracking-widest border border-forest/20">
            {categoryHint.replace(/_/g, " ")}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <textarea
          className="w-full border border-[#E3DCCB] bg-white rounded-xl p-4 min-h-[160px] focus:outline-none focus:border-forest text-ink text-base resize-none shadow-sm"
          placeholder={t("scan.placeholder")}
          value={text}
          onChange={(e) => { setText(e.target.value); setFile(null); }}
          disabled={loading || !!file}
        />

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#E3DCCB]"></div>
          <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">{t("scan.or")}</span>
          <div className="flex-1 h-px bg-[#E3DCCB]"></div>
        </div>

        <div>
          <input 
            type="file" 
            accept="image/*" 
            id="image-upload" 
            className="hidden" 
            onChange={handleFile}
            disabled={loading}
          />
          <label 
            htmlFor="image-upload" 
            className={`w-full border border-[#E3DCCB] ${file ? 'bg-forest/5 border-forest' : 'bg-white'} rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer active:bg-gray-50 transition-colors shadow-sm`}
          >
            <Upload className={`w-6 h-6 ${file ? 'text-forest' : 'text-ink-secondary'}`} />
            <span className={`text-sm font-semibold ${file ? 'text-forest' : 'text-ink'}`}>
              {file ? file.name : t("scan.upload")}
            </span>
            {!file && <span className="text-xs text-ink-secondary">{t("scan.max_size")}</span>}
          </label>
        </div>
      </div>

      {error && (
        <div className="flex flex-col gap-1">
          <div className="text-brick text-sm font-semibold bg-brick/5 p-4 rounded-xl border border-brick/20 flex flex-col gap-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              onClick={handleScan}
              className="w-full bg-brick text-white py-2 rounded-lg font-bold text-sm shadow-sm"
            >
              {t("scan.retry")}
            </button>
          </div>
          {errorDetails && process.env.NODE_ENV !== "production" && (
            <p className="text-xs text-ink-secondary text-center font-mono mt-1 px-2 break-all">{errorDetails}</p>
          )}
        </div>
      )}

      <div className="mt-auto pt-4">
        <button 
          onClick={handleScan}
          disabled={loading || (!text && !file)}
          className="w-full bg-forest text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] transition-all shadow-sm"
        >
          {loading ? (
            <span className="animate-pulse">{t("scan.scanning")}</span>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t("scan.btn")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <ScanPageContent />
    </Suspense>
  );
}
