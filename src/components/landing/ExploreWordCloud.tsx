"use client";

import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

interface ExploreWordCloudProps {
  onSelectDemoLanguage?: (lang: "ENGLISH" | "TELUGU" | "HINDI" | "TAMIL" | "KANNADA" | "MALAYALAM") => void;
}

interface CloudPhrase {
  label: string;
  href: string;
  sizeClass: string;
  colorClass: string;
  onClickType?: "TELUGU" | "ORDER" | "SCROLL";
  scrollTarget?: string;
}

const WORD_CLOUD_PHRASES: CloudPhrase[] = [
  {
    label: "QR review standees",
    href: "/#hero-showcase",
    onClickType: "SCROLL",
    scrollTarget: "hero-showcase",
    sizeClass: "text-xl sm:text-2xl font-black tracking-tight px-4 py-2",
    colorClass:
      "bg-indigo-50/90 text-[#4338ca] border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400",
  },
  {
    label: "Custom branding",
    href: "/#design-showcase",
    onClickType: "SCROLL",
    scrollTarget: "design-showcase",
    sizeClass: "text-base sm:text-lg font-extrabold px-3.5 py-2",
    colorClass:
      "bg-white text-[#172033] border-[#e3ded6] hover:bg-slate-50 hover:border-[#4338ca]/50",
  },
  {
    label: "Telugu demo",
    href: "/?lang=TELUGU#demo",
    onClickType: "TELUGU",
    scrollTarget: "demo",
    sizeClass: "text-base sm:text-lg font-extrabold px-3.5 py-2",
    colorClass:
      "bg-emerald-50/90 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400",
  },
  {
    label: "Pricing from ₹2,999",
    href: "/#pricing",
    onClickType: "SCROLL",
    scrollTarget: "pricing",
    sizeClass: "text-base sm:text-lg font-extrabold px-3.5 py-2",
    colorClass:
      "bg-amber-50/90 text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-400",
  },
  {
    label: "How it works",
    href: "/#how-it-works",
    onClickType: "SCROLL",
    scrollTarget: "how-it-works",
    sizeClass: "text-sm sm:text-base font-bold px-3.5 py-2",
    colorClass:
      "bg-white text-slate-800 border-[#e3ded6] hover:bg-slate-50 hover:border-indigo-300",
  },
  {
    label: "Merchant examples",
    href: "/#merchants",
    onClickType: "SCROLL",
    scrollTarget: "merchants",
    sizeClass: "text-sm sm:text-base font-bold px-3.5 py-2",
    colorClass:
      "bg-white text-slate-800 border-[#e3ded6] hover:bg-slate-50 hover:border-indigo-300",
  },
  {
    label: "6-language AI review portal",
    href: "/preview",
    sizeClass: "text-sm font-bold px-3.5 py-2",
    colorClass:
      "bg-slate-100/90 text-[#172033] border-slate-300/80 hover:bg-indigo-50 hover:text-[#4338ca] hover:border-indigo-300",
  },
];

export default function ExploreWordCloud({ onSelectDemoLanguage }: ExploreWordCloudProps) {
  const handlePhraseClick = (e: React.MouseEvent<HTMLAnchorElement>, phrase: CloudPhrase) => {
    if (phrase.onClickType === "TELUGU") {
      e.preventDefault();
      onSelectDemoLanguage?.("TELUGU");
      const target = document.getElementById("demo");
      if (target) target.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (phrase.onClickType === "SCROLL" && phrase.scrollTarget) {
      e.preventDefault();
      const target = document.getElementById(phrase.scrollTarget);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      aria-labelledby="explore-reviewsmart-heading"
      className="py-10 sm:py-12 px-4 sm:px-6 bg-[#f7f6f2] border-t border-[#e3ded6]"
    >
      <div className="max-w-[1380px] 2xl:max-w-[1440px] mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#4338ca]">
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Quick Topic Explorer</span>
            </div>
            <h2
              id="explore-reviewsmart-heading"
              className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight"
            >
              Explore ReviewSmart
            </h2>
          </div>

          <nav
            aria-label="Explore ReviewSmart topics"
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
          >
            {WORD_CLOUD_PHRASES.map((phrase) => (
              <Link
                key={phrase.label}
                href={phrase.href}
                onClick={(e) => handlePhraseClick(e, phrase)}
                className={`min-h-[42px] inline-flex items-center justify-center rounded-2xl border shadow-2xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338ca] focus-visible:ring-offset-2 ${phrase.sizeClass} ${phrase.colorClass}`}
              >
                {phrase.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
