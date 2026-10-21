"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Zap, ArrowRight, Sparkles } from "lucide-react";

export default function StickyMobileCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show only after scrolling down 200px
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const whatsappInquiryUrl =
    "https://wa.me/918639831132?text=" +
    encodeURIComponent("Hi ReviewSmart AI! I'm on your website and want to see an instant demo & get the ₹2,999 Lifetime Pass for my business.");

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 lg:hidden shadow-[0_-10px_25px_rgba(0,0,0,0.08)] animate-slideUp">
      <div className="max-w-md mx-auto flex items-center gap-2">
        {/* WhatsApp 1-tap quick chat */}
        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-white shrink-0" />
          <span className="truncate">WhatsApp Demo</span>
        </a>

        {/* Claim ₹2,999 Pass */}
        <a
          href="#pricing"
          className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-black text-xs tracking-wide shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate">₹2,999 Lifetime</span>
        </a>
      </div>
    </div>
  );
}
