"use client";

import React, { useState, useEffect, useId } from "react";
import Link from "next/link";
import {
  Sparkles,
  Star,
  Smartphone,
  QrCode,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Store,
  Phone,
  MessageCircle,
  Play,
  RotateCw,
  Gift,
  HelpCircle,
  Check,
  MapPin,
  ChevronRight,
  Flame,
  Award,
  Globe,
  Loader2,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";

interface ThemeOption {
  id: string;
  name: string;
  subtitle: string;
  bgGradient: string;
  borderClass: string;
  glowColor: string;
  accentText: string;
  badgeBg: string;
  qrColorDark: string;
  dotColor: string;
}

const THEMES: Record<string, ThemeOption> = {
  "royal-gold": {
    id: "royal-gold",
    name: "Obsidian & 24K Gold",
    subtitle: "Luxury Black with Metallic Gold Accents",
    bgGradient: "from-slate-950 via-zinc-900 to-black",
    borderClass: "border-amber-400/80 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.25)]",
    glowColor: "rgba(245, 158, 11, 0.4)",
    accentText: "text-amber-400",
    badgeBg: "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black",
    qrColorDark: "#09090b",
    dotColor: "#f59e0b",
  },
  "crystal-sapphire": {
    id: "crystal-sapphire",
    name: "Crystal Sapphire",
    subtitle: "Frosted Glass Acrylic with Electric Blue",
    bgGradient: "from-slate-950 via-slate-900 to-blue-950",
    borderClass: "border-cyan-400/80 shadow-[0_25px_60px_-15px_rgba(6,182,212,0.25)]",
    glowColor: "rgba(6, 182, 212, 0.4)",
    accentText: "text-cyan-400",
    badgeBg: "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black",
    qrColorDark: "#0284c7",
    dotColor: "#06b6d4",
  },
  "emerald-jade": {
    id: "emerald-jade",
    name: "Emerald & Gold",
    subtitle: "Deep Regal Green with Warm Gold",
    bgGradient: "from-slate-950 via-zinc-900 to-emerald-950",
    borderClass: "border-emerald-400/80 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.25)]",
    glowColor: "rgba(16, 185, 129, 0.4)",
    accentText: "text-emerald-400",
    badgeBg: "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black",
    qrColorDark: "#064e3b",
    dotColor: "#10b981",
  },
  "pearl-rose": {
    id: "pearl-rose",
    name: "Pearl Alabaster",
    subtitle: "Minimalist Pure White with Rose Gold",
    bgGradient: "from-zinc-900 via-stone-900 to-black",
    borderClass: "border-rose-300/80 shadow-[0_25px_60px_-15px_rgba(244,63,94,0.25)]",
    glowColor: "rgba(244, 63, 94, 0.4)",
    accentText: "text-rose-300",
    badgeBg: "bg-gradient-to-r from-rose-300 to-pink-400 text-slate-950 font-black",
    qrColorDark: "#881337",
    dotColor: "#fb7185",
  },
};

const POPULAR_PRESETS = [
  { name: "Sri Guru Fashions", city: "Kadapa, AP", category: "Clothing & Menswear" },
  { name: "Aroma Spices Multi-Cuisine", city: "Kadapa, AP", category: "Restaurant & Cafe" },
  { name: "AS Refrigerations", city: "Kadapa & Bangalore", category: "AC & Appliance Repair" },
  { name: "Apex Smile Dental", city: "Indiranagar, Bangalore", category: "Dental Clinic" },
  { name: "Luxe Glow Salon & Spa", city: "Jubilee Hills, Hyderabad", category: "Beauty & Wellness" },
  { name: "VR Gold Jewellers", city: "R.S. Road, Kadapa", category: "Gold & Jewellery" },
];

export default function HeroCustomizer() {
  const [businessName, setBusinessName] = useState("Your Business Name");
  const [city, setCity] = useState("Hyderabad / Bangalore / Kadapa");
  const [category, setCategory] = useState("Retail & Store");
  const [activeThemeKey, setActiveThemeKey] = useState<string>("royal-gold");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [tiltAngle, setTiltAngle] = useState({ x: 4, y: -7 });
  const [isNfcSimulating, setIsNfcSimulating] = useState(false);

  const theme = THEMES[activeThemeKey] || THEMES["royal-gold"];

  // Generate QR Code dynamically
  useEffect(() => {
    const slugSafe = encodeURIComponent(
      businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "demo-business"
    );
    const demoUrl = `https://www.reviewsmart.online/r/${slugSafe}`;

    QRCode.toDataURL(demoUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: theme.qrColorDark,
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Error", err));
  }, [businessName, theme.qrColorDark]);

  const handleSelectPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setBusinessName(preset.name);
    setCity(preset.city);
    setCategory(preset.category);
  };

  const handleSimulateNfcTap = () => {
    setIsNfcSimulating(true);
    setTimeout(() => {
      setIsNfcSimulating(false);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      alert("Please enter a valid 10-digit WhatsApp phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/lead/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          city,
          category,
          phone,
          source: "HERO_3D_CUSTOMIZER",
          notes: `Theme: ${theme.name}`,
        }),
      });

      if (!res.ok) throw new Error("Failed to record lead");

      setSubmitSuccess(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });

      // Automatically redirect to WhatsApp with custom pre-filled message
      const whatsappMsg = encodeURIComponent(
        `Hi ReviewSmart AI Team! I just customized my Luxury Acrylic Standee for *${businessName}* (${city}). Please send me the 3D design mockups, delivery timeline, and the ₹2,999 Lifetime Pass activation details.`
      );

      setTimeout(() => {
        window.open(`https://wa.me/918639831132?text=${whatsappMsg}`, "_blank");
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Redirecting directly to WhatsApp chat...");
      window.open(
        `https://wa.me/918639831132?text=Hi%20ReviewSmart,%20I%20want%20to%20order%20the%20NFC%20standee%20for%20${encodeURIComponent(
          businessName
        )}`,
        "_blank"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 overflow-hidden">
      {/* Ambient background glow behind Hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Trust & Launch Badges */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>INDIA'S #1 SMART NFC REVIEW STANDEE</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telugu &bull; Hindi &bull; Tamil &bull; Kannada &bull; English</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>₹2,999 One-Time Lifetime Pass</span>
          </div>
        </div>

        {/* 2-Column Hero Grid: Value Pitch (Left) + 3D Standee Customizer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* LEFT COLUMN: Headings, Value proposition & Instant lead input */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.12] sm:leading-[1.1]">
              Collect <span className="text-amber-300 underline decoration-amber-400/50 decoration-wavy underline-offset-4">100+ 5-Star</span> Google Reviews Every Month.
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Customers simply <strong>tap their phone</strong> on your luxury acrylic standee or scan the smart QR code. Gemini AI writes authentic 5-star reviews in their native language in 10 seconds. Negative reviews are privately shielded to your WhatsApp.
            </p>

            {/* Quick Live Preview Input Form */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-white/15 shadow-2xl backdrop-blur-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  Customize Your Standee Live:
                </span>
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Instant Preview Below &darr;
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 text-left">
                    Your Shop / Clinic Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Sri Krishna Sweets"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 text-left">
                    City / Locality
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kadapa / Hyderabad / Bangalore"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              {/* Quick Try Presets */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5 justify-start">
                <span className="text-[10px] text-slate-400 font-medium">Quick Try:</span>
                {POPULAR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition"
                  >
                    {p.name.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Primary Call to Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4 text-slate-950" />
                  <span>Get Free 3D Design &amp; ₹500 Voucher</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#pricing"
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>₹2,999 Lifetime Pass</span>
                </a>
              </div>
            </div>

            {/* Micro Social Proof Row */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-white ml-1 font-black">4.9/5</span>
                <span className="text-slate-400 font-normal">(1,280+ Reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Google Policy Safe</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Zero Recurring Fees</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Photorealistic 3D Luxury Acrylic Standee */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            {/* Standee Theme Selector Pills */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl">
              {Object.keys(THEMES).map((key) => {
                const t = THEMES[key];
                const isActive = activeThemeKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveThemeKey(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      isActive
                        ? "bg-white text-slate-950 font-black shadow-lg scale-105"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.dotColor }} />
                    <span className="text-[11px]">{t.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* 3D Acrylic Standee Container */}
            <div
              className="relative p-2 flex flex-col items-center justify-center w-full max-w-sm"
              style={{ perspective: "1200px" }}
            >
              {/* Luxury Acrylic Standee Card */}
              <div
                className={`relative w-72 sm:w-80 rounded-[28px] bg-gradient-to-b ${theme.bgGradient} p-6 border-2 ${theme.borderClass} text-center transition-all duration-500`}
                style={{
                  transform: `rotateY(${tiltAngle.y}deg) rotateX(${tiltAngle.x}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Acrylic Gloss Reflection Highlight */}
                <div className="absolute inset-0 rounded-[26px] bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

                {/* Top Badge: Google Review Official Accent */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider ${theme.badgeBg}`}>
                    Tap NFC &bull; Scan QR
                  </div>
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                    <span className="text-[10px] font-black text-amber-300">5.0</span>
                    <span className="text-amber-400 text-xs">★★★★★</span>
                  </div>
                </div>

                {/* Business Name Heading */}
                <div className="py-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight line-clamp-2">
                    {businessName || "Your Business Name"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">{city || "Kadapa / Hyderabad"}</span>
                  </p>
                </div>

                {/* QR Code Inlay with High Contrast Card */}
                <div className="my-3 p-3 rounded-2xl bg-white shadow-xl mx-auto w-40 sm:w-44 flex flex-col items-center justify-center relative group">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="ReviewSmart QR Code"
                      className="w-32 sm:w-36 h-32 sm:h-36 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  )}

                  <div className="mt-1 text-[9px] font-black text-slate-900 tracking-wider uppercase">
                    Scan for 5-Star Review
                  </div>
                </div>

                {/* Glowing NFC Tap Target with animated pulse */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-indigo-300" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-indigo-400/30 animate-ping pointer-events-none" />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-black text-white leading-tight">TAP PHONE HERE</p>
                      <p className="text-[9px] text-slate-400">Instant NFC Detection</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateNfcTap}
                    disabled={isNfcSimulating}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold transition active:scale-95 flex items-center gap-1"
                  >
                    {isNfcSimulating ? (
                      <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                    ) : (
                      <Play className="w-3 h-3 text-emerald-400" />
                    )}
                    <span>{isNfcSimulating ? "Tapping..." : "Test Tap"}</span>
                  </button>
                </div>
              </div>

              {/* 3D Acrylic Base Standee Foot (Reflected shadow) */}
              <div className="w-48 h-4 rounded-full bg-black/80 blur-md mx-auto -mt-2 -z-10" />
              <div className="w-64 h-3 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full mx-auto mt-1 border-t border-white/15" />
            </div>

            {/* Quick Helper text */}
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Crystal Acrylic A6 Counter Standee &bull; Built-in High-Frequency NTAG213 NFC chip &bull; No Battery or Charging Needed
            </p>
          </div>
        </div>
      </div>

      {/* LEAD CAPTURE MODAL (High-Converting WhatsApp Mockup Funnel) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-7 shadow-2xl text-left">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSubmitSuccess(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            {!submitSuccess ? (
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mb-4 text-slate-950 shadow-lg shadow-emerald-500/20">
                  <Gift className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-black text-white tracking-tight">
                  Get Your Free 3D Standee Design &amp; ₹500 Launch Voucher
                </h3>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  We will send a high-resolution 3D proof for <strong>{businessName}</strong> and your ₹500 discount voucher directly to your WhatsApp.
                </p>

                <form onSubmit={handleSubmitLead} className="mt-5 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Business Name:
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      WhatsApp Phone Number:
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-white/15 bg-slate-950 text-slate-400 text-xs font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-2.5 rounded-r-xl bg-slate-950 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Mockup...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>Send My Free 3D Design on WhatsApp &rarr;</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center">
                    🔒 No spam. 100% Free. Direct 1-on-1 support from MOMO IT Technologies team.
                  </p>
                </form>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-white">Mockup Requested Successfully!</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                  Opening WhatsApp to connect you directly with your dedicated ReviewSmart specialist...
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
