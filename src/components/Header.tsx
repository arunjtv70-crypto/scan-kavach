"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="p-4 flex items-center justify-between border-b border-[#E3DCCB]">
      <Link href="/" className="flex items-center gap-2 text-forest font-bold text-lg font-serif">
        <Shield className="w-5 h-5" />
        <span>{t("app.title")}</span>
      </Link>
      <div className="text-sm font-semibold uppercase tracking-wider flex bg-gray-100 p-1 rounded-lg">
        <button 
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 rounded-md transition-colors ${language === "en" ? "bg-white text-ink shadow-sm" : "text-gray-500 hover:text-ink"}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage("hi")}
          className={`px-3 py-1 rounded-md transition-colors ${language === "hi" ? "bg-white text-ink shadow-sm" : "text-gray-500 hover:text-ink"}`}
        >
          HI
        </button>
      </div>
    </header>
  );
}
