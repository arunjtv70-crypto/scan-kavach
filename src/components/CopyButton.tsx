"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text, className = "" }: { text: string, className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      title="Copy number"
      className={`inline-flex items-center justify-center p-1.5 rounded-md hover:bg-forest/10 transition-colors ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5 text-ink-secondary" />}
    </button>
  );
}
