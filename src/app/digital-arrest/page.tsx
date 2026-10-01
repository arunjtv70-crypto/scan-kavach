"use client";

import Link from "next/link";
import { Phone, ShieldAlert, ArrowLeft, ExternalLink } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DigitalArrestPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full py-4 gap-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink w-fit">
        <ArrowLeft className="w-4 h-4" />
        {t("back")}
      </Link>

      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-brick/10 border border-brick/20 rounded-2xl p-6 flex flex-col items-center text-center">
          <ShieldAlert className="w-12 h-12 text-brick mb-4" />
          <h1 className="font-serif text-3xl font-bold text-brick leading-tight mb-4">
            {t("da.title")}
          </h1>
          <p className="text-ink font-medium text-base mb-6 leading-relaxed">
            {t("da.desc")}
          </p>

          <div className="w-full bg-white rounded-xl border border-brick/10 overflow-hidden text-left mb-6">
            <div className="p-4 border-b border-brick/10 flex gap-3">
              <span className="text-brick font-bold">1.</span>
              <span className="text-ink font-semibold">{t("da.step1")}</span>
            </div>
            <div className="p-4 border-b border-brick/10 flex gap-3">
              <span className="text-brick font-bold">2.</span>
              <span className="text-ink font-semibold">{t("da.step2")}</span>
            </div>
            <div className="p-4 flex gap-3">
              <span className="text-brick font-bold">3.</span>
              <span className="text-ink font-semibold">{t("da.step3")}</span>
            </div>
          </div>

          <div className="w-full flex gap-2 mb-3">
            <a 
              href="tel:1930"
              className="flex-1 bg-brick text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
            >
              <Phone className="w-5 h-5" />
              {t("da.call")}
            </a>
            <CopyButton text="1930" className="px-5 bg-white border border-brick/30 rounded-xl text-brick hidden sm:inline-flex" />
          </div>
          
          <a 
            href="https://cybercrime.gov.in"
            target="_blank" rel="noreferrer"
            className="w-full border border-brick/30 text-brick bg-white py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:bg-brick/5 transition-colors shadow-sm"
          >
            <ExternalLink className="w-5 h-5" />
            cybercrime.gov.in
          </a>
        </div>
      </div>
    </div>
  );
}
