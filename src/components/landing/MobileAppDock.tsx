"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Globe, Sparkles, MessageCircle } from "lucide-react";

const WHATSAPP_HELP_URL =
  "https://wa.me/918639831132?text=" +
  encodeURIComponent(
    "Hi ReviewSmart AI! I have a question about the QR review standee or need help before ordering."
  );

export default function MobileAppDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "demo">(
    pathname === "/preview" ? "demo" : "home"
  );
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Sync active tab based on current route and scroll section on homepage
  useEffect(() => {
    if (pathname === "/preview") {
      setActiveTab("demo");
      return;
    }
    if (pathname !== "/") return;

    const handleScroll = () => {
      const demoEl = document.getElementById("demo");
      const pricingEl = document.getElementById("pricing");
      const probe = window.scrollY + 240;

      if (pricingEl && probe >= pricingEl.offsetTop) {
        setActiveTab("home");
      } else if (demoEl && probe >= demoEl.offsetTop) {
        setActiveTab("demo");
      } else {
        setActiveTab("home");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Hide mobile bottom bar while the user types into a checkout/support input so the keyboard isn't crowded
  useEffect(() => {
    const isFormField = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
    };

    const onFocusIn = (e: FocusEvent) => {
      if (isFormField(e.target)) setKeyboardOpen(true);
    };
    const onFocusOut = () => {
      setTimeout(() => {
        if (!isFormField(document.activeElement)) {
          setKeyboardOpen(false);
        }
      }, 120);
    };

    const baselineHeight = window.visualViewport?.height || window.innerHeight;
    const onViewportResize = () => {
      const currentH = window.visualViewport?.height || window.innerHeight;
      if (baselineHeight - currentH > 150) {
        setKeyboardOpen(true);
      } else if (!isFormField(document.activeElement)) {
        setKeyboardOpen(false);
      }
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    window.visualViewport?.addEventListener("resize", onViewportResize);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      window.visualViewport?.removeEventListener("resize", onViewportResize);
    };
  }, []);

  if (keyboardOpen) return null;

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    triggerHaptic();
    if (pathname === "/") {
      e.preventDefault();
      setActiveTab("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDemoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    triggerHaptic();
    if (pathname === "/") {
      e.preventDefault();
      setActiveTab("demo");
      const demoEl = document.getElementById("demo");
      if (demoEl) demoEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOrderClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    triggerHaptic();
    if (pathname === "/") {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent("reviewsmart:select-plan", { detail: { plan: "starter" } })
      );
    } else {
      e.preventDefault();
      router.push("/?order=starter");
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-[#e3ded6] shadow-[0_-8px_28px_rgba(23,32,51,0.08)] no-print"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center gap-1.5 px-2.5 py-2">
        {/* 1. HOME */}
        <Link
          href="/"
          onClick={handleHomeClick}
          aria-current={activeTab === "home" ? "page" : undefined}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338ca] ${
            activeTab === "home"
              ? "bg-indigo-50 text-[#4338ca] font-bold"
              : "text-slate-600 hover:text-[#172033] font-medium"
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span className="text-[11px] leading-tight">Home</span>
        </Link>

        {/* 2. DEMO */}
        <Link
          href={pathname === "/preview" ? "/preview" : "/#demo"}
          onClick={handleDemoClick}
          aria-current={activeTab === "demo" ? "page" : undefined}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4338ca] ${
            activeTab === "demo"
              ? "bg-indigo-50 text-[#4338ca] font-bold"
              : "text-slate-600 hover:text-[#172033] font-medium"
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span className="text-[11px] leading-tight">Demo</span>
        </Link>

        {/* 3. ORDER (Primary High-Emphasis Action -> Direct Checkout Flow) */}
        <Link
          href="/?order=starter"
          onClick={handleOrderClick}
          className="min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] text-white font-black shadow-md shadow-indigo-700/25 active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#172033]"
        >
          <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
          <span className="text-[11px] leading-tight tracking-tight">Order</span>
        </Link>

        {/* 4. HELP (Distinct WhatsApp Concierge Support) */}
        <a
          href={WHATSAPP_HELP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={triggerHaptic}
          className="min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1.5 text-emerald-800 hover:bg-emerald-50 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <MessageCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="text-[11px] leading-tight">Help</span>
        </a>
      </div>
    </nav>
  );
}
