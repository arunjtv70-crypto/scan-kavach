import { Phone, ExternalLink, ShieldAlert } from "lucide-react";
import CopyButton from "./CopyButton";
import { findBankHelplines, nationalHelplines } from "@/lib/helplines";
import { useLanguage } from "@/contexts/LanguageContext";

type HelpCardProps = {
  title: string;
  phone?: string;
  link?: string;
  linkText?: string;
  description?: string;
  isSoft?: boolean;
};

function HelpCard({ title, phone, link, linkText, description, isSoft }: HelpCardProps) {
  const bgClass = isSoft ? "bg-forest/5 border-forest/20" : "bg-brick/5 border-brick/20";
  
  return (
    <div className={`p-4 rounded-xl border ${bgClass} flex flex-col gap-3 mb-3`}>
      <h4 className="font-bold text-ink">{title}</h4>
      {description && <p className="text-sm text-ink-secondary">{description}</p>}
      
      <div className="flex flex-col gap-2">
        {phone && (
          <div className="flex items-center gap-2">
            <a 
              href={`tel:${phone}`}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border ${isSoft ? 'border-forest text-forest bg-white' : 'border-brick text-brick bg-white'} font-bold active:scale-[0.98] transition-transform`}
            >
              <Phone className="w-4 h-4" />
              Call {phone}
            </a>
            <CopyButton text={phone} className="p-3 bg-white border border-[#E3DCCB] rounded-lg" />
          </div>
        )}
        
        {link && (
          <a 
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 py-3 rounded-lg bg-white border border-[#E3DCCB] font-bold text-ink hover:bg-gray-50 active:scale-[0.98] transition-transform`}
          >
            <ExternalLink className="w-4 h-4" />
            {linkText || "Visit Website"}
          </a>
        )}
      </div>
    </div>
  );
}

export default function InstantHelp({ 
  detectedEntities = [], 
  scamCategory = "OTHER",
  isSafe = false
}: { 
  detectedEntities?: string[], 
  scamCategory?: string,
  isSafe?: boolean
}) {
  const { t } = useLanguage();

  if (isSafe || scamCategory === "SAFE") {
    return (
      <div className="mt-4 p-4 text-center text-sm font-semibold text-ink-secondary border border-[#E3DCCB] rounded-xl bg-ivory">
        {t("help.safe")} <a href="tel:1930" className="text-forest underline">1930</a>
      </div>
    );
  }

  const matchedBanks = findBankHelplines(detectedEntities);
  const isSextortion = scamCategory === "SEXTORTION_CYBERBULLYING";

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className={`w-5 h-5 ${isSextortion ? 'text-forest' : 'text-brick'}`} />
        <h3 className="font-bold text-lg text-ink font-serif">{t("help.title")}</h3>
      </div>

      {/* 1. Matched Banks */}
      {matchedBanks.length > 0 ? (
        matchedBanks.map(bank => (
          <HelpCard 
            key={bank.key}
            title={`${bank.names[0].toUpperCase()} Fraud Support`}
            phone={bank.tollFree[0]}
            link={bank.fraudReportUrl}
            linkText={t("help.bank.link")}
            description={t("help.bank.desc")}
            isSoft={isSextortion}
          />
        ))
      ) : (
        <div className="p-4 rounded-xl border border-[#E3DCCB] bg-white mb-3 text-sm font-medium text-ink">
          {t("help.unmatched")}
        </div>
      )}

      {/* 2. 1930 National Helpline */}
      <HelpCard 
        title={t("help.national.title")}
        phone={nationalHelplines.cyber.toString()}
        link={nationalHelplines.cybercrimePortal}
        linkText="cybercrime.gov.in"
        description={t("help.national.desc")}
        isSoft={isSextortion}
      />

      {/* 3. Category Specific */}
      {scamCategory === "DIGITAL_ARREST_EXTORTION" && (
        <HelpCard 
          title={t("help.police.title")}
          phone={nationalHelplines.emergency.toString()}
          description={t("help.police.desc")}
        />
      )}

      {scamCategory === "IDENTITY_DOCUMENT_FRAUD" && (
        <>
          <HelpCard 
            title={t("help.uidai.title")}
            phone={nationalHelplines.uidai.toString()}
            link={nationalHelplines.mAadhaar}
            linkText={t("help.uidai.link")}
            description={t("help.uidai.desc")}
          />
          <HelpCard 
            title={t("help.sanchar.title")}
            link={nationalHelplines.sancharSaathi}
            linkText="sancharsaathi.gov.in"
            description={t("help.sanchar.desc")}
          />
        </>
      )}

      {scamCategory === "PHISHING_VISHING_SMISHING" && (
        <HelpCard 
          title={t("help.chakshu.title")}
          link={nationalHelplines.sancharSaathi}
          linkText={t("help.chakshu.link")}
          description={t("help.chakshu.desc")}
        />
      )}

      {isSextortion && (
        <>
          <HelpCard 
            title={t("help.stopncii.title")}
            link={nationalHelplines.stopncii}
            linkText="StopNCII.org"
            description={t("help.stopncii.desc")}
            isSoft={true}
          />
          <HelpCard 
            title={t("help.telemanas.title")}
            phone={nationalHelplines.telemanas.toString()}
            description={t("help.telemanas.desc")}
            isSoft={true}
          />
          <HelpCard 
            title={t("help.childline.title")}
            phone={nationalHelplines.childline.toString()}
            description={t("help.childline.desc")}
            isSoft={true}
          />
        </>
      )}

    </div>
  );
}
