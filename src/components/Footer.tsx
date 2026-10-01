"use client";

import CopyButton from "./CopyButton";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="p-4 text-center text-sm text-ink-secondary border-t border-[#E3DCCB]">
      <p className="flex items-center justify-center gap-1">
        {t("footer.helpline")} <a href="tel:1930" className="font-bold text-forest">1930</a>
        <CopyButton text="1930" className="hidden sm:inline-flex" />
      </p>
      <p className="mt-1">
        <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-forest">
          cybercrime.gov.in
        </a>
      </p>
    </footer>
  );
}
