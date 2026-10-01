"use client";

import Link from "next/link";
import { MessageSquare, AlertTriangle, Shield, CreditCard, UserX, Briefcase, FileText, Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const CATEGORIES = [
    { id: "UPI_BANKING", label: t("home.cat.upi"), icon: CreditCard },
    { id: "DIGITAL_ARREST_EXTORTION", label: t("home.cat.arrest"), icon: UserX },
    { id: "JOB_INVESTMENT_FRAUD", label: t("home.cat.job"), icon: Briefcase },
    { id: "IDENTITY_DOCUMENT_FRAUD", label: t("home.cat.docs"), icon: FileText },
    { id: "PHISHING_VISHING_SMISHING", label: t("home.cat.link"), icon: Smartphone },
    { id: "SEXTORTION_CYBERBULLYING", label: t("home.cat.threats"), icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full py-6">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink leading-tight mb-8" dangerouslySetInnerHTML={{ __html: t("home.title") }}></h1>

      <div className="flex flex-col gap-4 mb-8">
        <Link 
          href="/scan" 
          className="w-full bg-forest text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-between transition-transform active:scale-[0.98] shadow-sm hover:bg-[#0c3125]"
        >
          <span className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" />
            {t("home.scan_btn")}
          </span>
          <span>→</span>
        </Link>
      </div>

      <div className="mb-auto">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ink-secondary mb-3">{t("home.categories")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={cat.id}
                href={`/scan?category=${cat.id}`} 
                className="border border-[#E3DCCB] bg-white rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 active:bg-gray-50 transition-colors shadow-sm hover:border-forest/30 min-h-[90px]"
              >
                <Icon className="w-5 h-5 text-forest" />
                <span className="font-semibold text-xs text-ink leading-tight">{cat.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        <Link 
          href="/rescue" 
          className="w-full border border-brick/30 bg-brick/5 text-brick py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:bg-brick/10 transition-colors hover:border-brick/50"
        >
          <AlertTriangle className="w-5 h-5" />
          {t("home.rescue_btn")}
        </Link>
      </div>
    </div>
  );
}
