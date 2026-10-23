"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Globe,
  Printer,
  Zap,
  MessageCircle,
  Home,
} from "lucide-react";

export default function MobileAppDock() {
  const [activeTab, setActiveTab] = useState<"home" | "demo" | "hardware" | "pricing">("home");

  // Track active section as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;

      const demoEl = document.getElementById("demo");
      const hardwareEl = document.getElementById("hardware");
      const pricingEl = document.getElementById("pricing");

      if (pricingEl && scrollPos >= pricingEl.offsetTop) {
        setActiveTab("pricing");
      } else if (hardwareEl && scrollPos >= hardwareEl.offsetTop) {
        setActiveTab("hardware");
      } else if (demoEl && scrollPos >= demoEl.offsetTop) {
        setActiveTab("demo");
      } else {
        setActiveTab("home");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const whatsappInquiryUrl =
    "https://wa.me/918639831132?text=" +
    encodeURIComponent("Hi ReviewSmart AI! I'm on your website and want to see an instant demo & get the ₹2,999 Lifetime Pass for my business.");

  return (
    <nav
      aria-label="Mobile Application Navigation Dock"
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:hidden px-2 pt-1 pb-safe"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1 h-16">
        {/* TAB 1: HOME */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("home");
            scrollToSection("top");
          }}
          className={`flex flex-col items-center justify-center py-1 transition-transform active:scale-90 relative ${
            activeTab === "home" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {activeTab === "home" && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-indigo-600 animate-fadeIn" />
          )}
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* TAB 2: AI DEMO */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("demo");
            scrollToSection("demo");
          }}
          className={`flex flex-col items-center justify-center py-1 transition-transform active:scale-90 relative ${
            activeTab === "demo" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {activeTab === "demo" && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-indigo-600 animate-fadeIn" />
          )}
          <Globe className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">AI Demo</span>
        </button>

        {/* TAB 3: STANDEE STUDIO */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("hardware");
            scrollToSection("hardware");
          }}
          className={`flex flex-col items-center justify-center py-1 transition-transform active:scale-90 relative ${
            activeTab === "hardware" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {activeTab === "hardware" && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-indigo-600 animate-fadeIn" />
          )}
          <Printer className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Standee</span>
        </button>

        {/* TAB 4: PRICING (HIGH-CONVERSION) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("pricing");
            scrollToSection("pricing");
          }}
          className={`flex flex-col items-center justify-center py-1 transition-transform active:scale-90 relative ${
            activeTab === "pricing" ? "text-amber-600 font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {activeTab === "pricing" && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-amber-500 animate-fadeIn" />
          )}
          <div className="relative">
            <Zap className="w-5 h-5 mb-0.5 text-amber-500" />
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <span className="text-[10px] tracking-tight font-black">₹2,999</span>
        </button>

        {/* TAB 5: WHATSAPP CHAT (DIRECT 1-TAP ACTION) */}
        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 text-emerald-600 hover:text-emerald-700 transition-transform active:scale-90 relative"
          aria-label="Direct WhatsApp Consultation"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 mb-0.5">
            <MessageCircle className="w-4 h-4 fill-white" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 tracking-tight">Chat</span>
        </a>
      </div>
    </nav>
  );
}
