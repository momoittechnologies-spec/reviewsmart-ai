"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Share2,
  Check,
  Star,
  MapPin,
  MessageCircle,
  Copy,
  Zap,
  Globe,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Phone,
  HelpCircle,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { copyToClipboard } from "@/lib/clipboard";

// ─── 6 LANGUAGES REVIEW GENERATOR PRESETS ──────────────────────────────────
type LanguageKey = "ENGLISH" | "HINDI" | "TELUGU" | "TAMIL" | "KANNADA" | "MALAYALAM";

const PREVIEW_LANGUAGES: { key: LanguageKey; label: string; native: string; flag: string }[] = [
  { key: "ENGLISH", label: "English", native: "English", flag: "🇬🇧" },
  { key: "TELUGU", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { key: "HINDI", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { key: "TAMIL", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { key: "KANNADA", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { key: "MALAYALAM", label: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
];

function PreviewContent() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name") || "City Grafix Flex & Printing";
  const city = searchParams.get("city") || "Kadapa, Andhra Pradesh";
  const category = searchParams.get("category") || "Retail & Commercial Services";
  const theme = searchParams.get("theme") || "royal-gold";

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedLang, setSelectedLang] = useState<LanguageKey>("ENGLISH");
  const [selectedTags, setSelectedTags] = useState<string[]>(["High Quality", "Polite Staff", "Fast Service"]);
  const [copied, setCopied] = useState(false);
  const [showShieldModal, setShowShieldModal] = useState(false);
  const [shieldFeedbackText, setShieldFeedbackText] = useState("");
  const [shieldSubmitted, setShieldSubmitted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Quick default tags
  const availableTags = [
    "High Quality",
    "Polite Staff",
    "Fast Service",
    "Fair Pricing",
    "Clean Ambience",
    "Great Support",
    "Highly Recommended",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Generate synthetic review text based on shop name, tags, and language
  const generatedReview = useMemo(() => {
    const tagList = selectedTags.length > 0 ? selectedTags.join(", ") : "excellent service";
    switch (selectedLang) {
      case "TELUGU":
        return `${name} లో సర్వీస్ ఎంతో అద్భుతంగా ఉంది! ${tagList} పరంగా చాలా బాగా చూసుకున్నారు. సిబ్బంది చాలా మర్యాదగా ఉన్నారు. కచ్చితంగా అందరికీ రికమెండ్ చేస్తున్నాను!`;
      case "HINDI":
        return `${name} में हमारा अनुभव बहुत ही शानदार रहा! ${tagList} की वजह से काम बहुत जल्दी और आसानी से हो गया। स्टाफ बहुत ही विनम्र है। बहुत अच्छा काम!`;
      case "TAMIL":
        return `${name} நிறுவனத்தில் மிகச் சிறந்த சேவை கிடைத்தது! ${tagList} மிகவும் திருப்திகரமாக இருந்தது. பணியாளர்களின் உபசரிப்பு அருமை. மிகவும் பரிந்துரைக்கிறேன்!`;
      case "KANNADA":
        return `${name} ನಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಸೇವೆ ದೊರೆತಿದೆ! ${tagList} ಗುಣಮಟ್ಟ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ. ಸಿಬ್ಬಂದಿ ಸಹಕಾರ ಅದ್ಭುತ. ಖಂಡಿತವಾಗಿಯೂ ಭೇಟಿ ನೀಡಿ!`;
      case "MALAYALAM":
        return `${name} ലെ സേవനം അതിശയകരമായിരുന്നു! ${tagList} വളരെ മികച്ച നിലവാരമുള്ളതാണ്. വളരെ മാന്യമായ പെരുമാറ്റം. തീർച്ചയായും ശുപാർശ ചെയ്യുന്നു!`;
      case "ENGLISH":
      default:
        return `Exceptional experience at ${name}! Impressed with their ${tagList}. The staff is courteous, professional, and very efficient. Highly recommended to everyone in ${city.split(",")[0] || "town"}!`;
    }
  }, [name, city, selectedTags, selectedLang]);

  const handleCopyReview = async () => {
    await copyToClipboard(generatedReview);
    setCopied(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
    setShowCelebration(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStarClick = (s: number) => {
    setRating(s);
    if (s <= 3) {
      setShowShieldModal(true);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-4 px-3 sm:px-6 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* ─── DEMO MODE DISCREET TOP BANNER ───────────────────────────────── */}
      <div className="w-full max-w-lg mb-4">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-slate-900/90 to-purple-900/90 border border-indigo-500/40 shadow-lg text-center backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/#customizer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white transition bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin" />
              <span className="truncate">Live Customer Scan Preview</span>
            </div>

            <Link
              href="/#pricing"
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow-xs shrink-0"
            >
              Order Standee
            </Link>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
            This is an interactive simulation of what your walk-in customers see when scanning your standee.
          </p>
        </div>
      </div>

      {/* ─── STORE PROFILE CARD ───────────────────────────────────────────── */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl relative text-center space-y-3.5">
        {/* Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Logo Avatar */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center mx-auto shadow-xl border-2 border-white/20">
          {name.slice(0, 2).toUpperCase()}
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5 flex-wrap">
            <span>{name}</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium max-w-xs mx-auto">
            Rate our service &amp; share your honest experience!
          </p>
        </div>

        {/* Category & Location Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
            {category}
          </span>
          <span className="text-[10px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-400 shrink-0" />
            <span className="truncate max-w-[180px]">{city}</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified Counter
          </span>
        </div>
      </div>

      {/* ─── STAR RATING INTERACTION CARD ─────────────────────────────────── */}
      <div className="w-full max-w-lg mt-4 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 border border-amber-400/30 shadow-2xl text-center space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white">
            How was your visit today?
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tap a star rating to experience instant multi-lingual review synthesis
          </p>
        </div>

        {/* 5-Star Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleStarClick(star)}
              className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
              aria-label={`Rate ${star} star`}
            >
              <Star
                className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.6)]"
                    : "text-slate-700"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Status text */}
        <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
          {rating >= 4 ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>5-Star Google Review Generator Active</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Private Feedback Shield Active (Demo)</span>
            </>
          )}
        </div>

        {/* Tag chips */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            What did you like best? (Tap to customize)
          </label>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all active:scale-95 ${
                    active
                      ? "bg-amber-400/20 border-amber-400 text-amber-300 font-bold"
                      : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selector */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center flex items-center justify-center gap-1">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select Customer Language:</span>
          </label>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {PREVIEW_LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.key;
              return (
                <button
                  key={lang.key}
                  type="button"
                  onClick={() => setSelectedLang(lang.key)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md border border-indigo-400"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Draft Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 text-left space-y-2 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Review Draft ({selectedLang})</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Illustrative sample</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium italic bg-slate-900/60 p-3 rounded-xl border border-white/5">
            &quot;{generatedReview}&quot;
          </p>

          <button
            type="button"
            onClick={handleCopyReview}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition active:scale-98 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>1-Tap Copy &amp; Open Google Maps</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── CELEBRATION DEMO TOAST ───────────────────────────────────────── */}
      {showCelebration && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-slideUp">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl text-center space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                <Check className="w-4 h-4" /> 1-Tap Experience Complete
              </span>
              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Review copied! In live production with your standee, this action automatically opens your official Google Maps listing so walk-in customers paste and publish in 1 tap.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <Link
                href="/#pricing"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
              >
                Claim Lifetime Standee Pass
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRIVATE NEGATIVE FEEDBACK SHIELD DEMO MODAL ───────────────────── */}
      {showShieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Private Negative Review Shield
                  </h3>
                  <span className="text-[11px] text-amber-300 font-semibold">
                    Customer rated {rating} star{rating > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShieldModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <p className="font-bold text-amber-300">
                💡 How the ReviewSmart Shield Works:
              </p>
              <p>
                When a customer selects 1, 2, or 3 stars, our intelligent shield intercepts the grievance privately to your personal business WhatsApp or merchant inbox.
              </p>
              <p className="text-[11px] text-slate-400">
                You resolve the issue directly with the customer, while your public Google Maps rating stays 100% protected from negative damage!
              </p>
            </div>

            {shieldSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
                <p className="text-xs font-black text-emerald-300">
                  ✓ Grievance Intercepted (Demo Mode)
                </p>
                <p className="text-[11px] text-slate-300">
                  In live production, this note is instantly dispatched to your private WhatsApp desk.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowShieldModal(false);
                    setShieldSubmitted(false);
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                >
                  Close Demo Shield
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShieldSubmitted(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Try entering sample customer feedback:
                  </label>
                  <textarea
                    rows={3}
                    value={shieldFeedbackText}
                    onChange={(e) => setShieldFeedbackText(e.target.value)}
                    placeholder="e.g. Service was slightly slow during afternoon rush hour..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                  >
                    Simulate Private Grievance Intercept
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShieldModal(false)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="w-full max-w-lg mt-8 pt-4 pb-12 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2">
        <p>ReviewSmart AI &bull; Interactive Product Showroom</p>
        <p className="text-[11px] text-slate-600">
          Ready to deploy this experience at your shop counter?{" "}
          <Link href="/#pricing" className="text-indigo-400 hover:underline font-bold">
            Explore Standee Packages &rarr;
          </Link>
        </p>
      </footer>
    </main>
  );
}

export default function StandeeDemoPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading preview...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
