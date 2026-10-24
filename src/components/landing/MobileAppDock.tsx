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

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const scrollToSection = (id: string) => {
    triggerHaptic();
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const whatsappOrderUrl =
    "https://wa.me/918639831132?text=" +
    encodeURIComponent("Hi ReviewSmart AI! I want to order the ReviewSmart AI 3D NFC + QR Standee for my business (₹2,999 Lifetime Pass). Please guide me with the next steps.");

  const whatsappInquiryUrl =
    "https://wa.me/918639831132?text=" +
    encodeURIComponent("Hi ReviewSmart AI! I'm on your website and want to see an instant demo & get the ₹2,999 Lifetime Pass for my business.");

  return (
    <nav
      aria-label="Mobile Application Navigation Dock"
      className="fixed bottom-2.5 inset-x-3 z-50 max-w-md mx-auto bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-2xl lg:hidden px-1.5 py-1"
      style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-5 items-center gap-1 h-14">
        {/* TAB 1: HOME */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("home");
            scrollToSection("top");
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all active:scale-90 ${
            activeTab === "home"
              ? "bg-indigo-50 text-indigo-600 font-bold shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* TAB 2: AI DEMO */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("demo");
            scrollToSection("demo");
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all active:scale-90 ${
            activeTab === "demo"
              ? "bg-indigo-50 text-indigo-600 font-bold shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Globe className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Demo</span>
        </button>

        {/* TAB 3: CENTER HERO ACTION (ORDER NOW) */}
        <a
          href={whatsappOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={triggerHaptic}
          className="flex flex-col items-center justify-center -mt-4 py-1 relative group"
          aria-label="Order 3D Standee"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/35 border-2 border-white transition-all transform active:scale-90 group-hover:scale-105">
            <Sparkles className="w-5 h-5 fill-slate-950 animate-pulse" />
          </div>
          <span className="text-[9.5px] font-black text-amber-600 tracking-tight mt-0.5 whitespace-nowrap">
            Order Now
          </span>
        </a>

        {/* TAB 4: PRICING (HIGH-CONVERSION) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("pricing");
            scrollToSection("pricing");
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all active:scale-90 ${
            activeTab === "pricing"
              ? "bg-amber-50 text-amber-600 font-black shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="relative">
            <Zap className="w-4 h-4 mb-0.5 text-amber-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <span className="text-[10px] tracking-tight font-black">₹2,999</span>
        </button>

        {/* TAB 5: WHATSAPP CHAT (DIRECT 1-TAP ACTION) */}
        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={triggerHaptic}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-emerald-600 hover:text-emerald-700 transition-all active:scale-90"
          aria-label="Direct WhatsApp Consultation"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 mb-0.5">
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 tracking-tight">Chat</span>
        </a>
      </div>
    </nav>
  );
}
