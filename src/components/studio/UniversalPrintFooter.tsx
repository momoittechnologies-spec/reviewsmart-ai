"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import {
  UNIVERSAL_BRANDING_LINE,
  VERIFIED_PARTNER_LINE,
  PrintThemeColors,
} from "@/lib/print-branding";

interface UniversalPrintFooterProps {
  theme: PrintThemeColors;
  size?: "card" | "stand" | "poster" | "jumbo";
  partnerText?: string;
  className?: string;
}

export default function UniversalPrintFooter({
  theme,
  size = "stand",
  partnerText = "ReviewSmart AI • Verified Google Partner",
  className = "",
}: UniversalPrintFooterProps) {
  // Dimension and typography presets based on display scale
  const sizeConfig = {
    card: {
      gap: "gap-0.5",
      partnerTextSize: "text-[7.5px]",
      brandingTextSize: "text-[6.5px]",
      iconSize: "w-2 h-2",
      letterSpacing: "tracking-wider",
    },
    stand: {
      gap: "gap-0.5",
      partnerTextSize: "text-[9px]",
      brandingTextSize: "text-[8px]",
      iconSize: "w-2.5 h-2.5",
      letterSpacing: "tracking-widest",
    },
    poster: {
      gap: "gap-1",
      partnerTextSize: "text-[12px]",
      brandingTextSize: "text-[10.5px]",
      iconSize: "w-3.5 h-3.5",
      letterSpacing: "tracking-[0.16em]",
    },
    jumbo: {
      gap: "gap-1.5",
      partnerTextSize: "text-[14px]",
      brandingTextSize: "text-[12px]",
      iconSize: "w-4 h-4",
      letterSpacing: "tracking-[0.18em]",
    },
  }[size];

  const brandingColor =
    theme.id === "pearl-gold" ? "#334155" : "rgba(255, 255, 255, 0.78)";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${sizeConfig.gap} ${className}`}
    >
      {/* Line 1: Partner / AI badge */}
      <div
        className={`font-bold flex items-center justify-center gap-1 ${sizeConfig.partnerTextSize}`}
        style={{ color: theme.accent }}
      >
        <Sparkles className={sizeConfig.iconSize} style={{ color: theme.accent }} />
        <span>{partnerText}</span>
      </div>

      {/* Line 2: Universal MOMO IT TECHNOLOGIES Branding */}
      <div
        className={`font-black uppercase font-mono ${sizeConfig.brandingTextSize} ${sizeConfig.letterSpacing}`}
        style={{ color: brandingColor }}
      >
        {UNIVERSAL_BRANDING_LINE}
      </div>
    </div>
  );
}
