"use client";

import React, { useState, useEffect, useRef } from "react";
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
  CreditCard,
  Truck,
  Copy,
  ExternalLink,
  Lock,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import { copyToClipboard } from "@/lib/clipboard";

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
  textColor: string;
}

interface GoogleSearchResult {
  name: string;
  branchName: string;
  address: string;
  category: string;
  googlePlaceId?: string;
  placeId?: string;
  googleReviewUrl: string;
  rating?: number;
  reviewCount?: string;
  suggestedTags?: string[];
  logoUrl?: string | null;
}

const THEMES: Record<string, ThemeOption> = {
  "royal-gold": {
    id: "royal-gold",
    name: "Obsidian & 24K Gold",
    subtitle: "Luxury Black with Metallic Gold Accents",
    bgGradient: "from-slate-950 via-zinc-900 to-black",
    borderClass: "border-amber-400/90 shadow-[0_20px_50px_-10px_rgba(245,158,11,0.35)]",
    glowColor: "rgba(245, 158, 11, 0.4)",
    accentText: "text-amber-400",
    badgeBg: "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black",
    qrColorDark: "#09090b",
    dotColor: "#f59e0b",
    textColor: "text-white",
  },
  "crystal-sapphire": {
    id: "crystal-sapphire",
    name: "Crystal Sapphire",
    subtitle: "Frosted Glass Acrylic with Electric Blue",
    bgGradient: "from-slate-950 via-slate-900 to-blue-950",
    borderClass: "border-cyan-400/90 shadow-[0_20px_50px_-10px_rgba(6,182,212,0.35)]",
    glowColor: "rgba(6, 182, 212, 0.4)",
    accentText: "text-cyan-400",
    badgeBg: "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black",
    qrColorDark: "#0284c7",
    dotColor: "#06b6d4",
    textColor: "text-white",
  },
  "emerald-jade": {
    id: "emerald-jade",
    name: "Emerald & Gold",
    subtitle: "Deep Regal Green with Warm Gold",
    bgGradient: "from-slate-950 via-zinc-900 to-emerald-950",
    borderClass: "border-emerald-400/90 shadow-[0_20px_50px_-10px_rgba(16,185,129,0.35)]",
    glowColor: "rgba(16, 185, 129, 0.4)",
    accentText: "text-emerald-400",
    badgeBg: "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black",
    qrColorDark: "#064e3b",
    dotColor: "#10b981",
    textColor: "text-white",
  },
  "pearl-rose": {
    id: "pearl-rose",
    name: "Pearl Alabaster",
    subtitle: "Minimalist Pure White with Rose Gold",
    bgGradient: "from-white via-rose-50/50 to-pink-50/40",
    borderClass: "border-rose-300 shadow-[0_20px_50px_-10px_rgba(244,63,94,0.25)] ring-1 ring-rose-200",
    glowColor: "rgba(244, 63, 94, 0.3)",
    accentText: "text-rose-600",
    badgeBg: "bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black",
    qrColorDark: "#881337",
    dotColor: "#fb7185",
    textColor: "text-slate-900",
  },
};

const POPULAR_PRESETS = [
  { name: "MANA Tours & Travels", city: "Kadapa, Andhra Pradesh", category: "Tours & Travels" },
  { name: "MOMO IT Technologies", city: "Kadapa, Andhra Pradesh", category: "Software & Technology" },
  { name: "VR Gold Company", city: "Kadapa, Andhra Pradesh", category: "Gold Buying & Pledged Gold" },
  { name: "City Grafix Flex & Printing", city: "Kadapa, Andhra Pradesh", category: "Flex & Digital Printing" },
  { name: "AS Refrigeration & AC Services", city: "Kadapa, Andhra Pradesh", category: "AC & Appliance Repair" },
  { name: "Paradise Biryani Point", city: "Hyderabad, Telangana", category: "Restaurant & Cafe" },
];

export default function HeroCustomizer() {
  const [businessName, setBusinessName] = useState("MANA Tours & Travels");
  const [city, setCity] = useState("Kadapa, Andhra Pradesh");
  const [category, setCategory] = useState("Tours & Travels");
  const [selectedTheme, setSelectedTheme] = useState<string>("royal-gold");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isNfcSimulating, setIsNfcSimulating] = useState(false);

  // Google Places Live Search State (Modal & Hero)
  const [modalSearchResults, setModalSearchResults] = useState<GoogleSearchResult[]>([]);
  const [isSearchingModal, setIsSearchingModal] = useState(false);
  const [isModalDropdownOpen, setIsModalDropdownOpen] = useState(false);
  const [verifiedGoogleProfile, setVerifiedGoogleProfile] = useState<GoogleSearchResult | null>(null);

  const [heroSearchResults, setHeroSearchResults] = useState<GoogleSearchResult[]>([]);
  const [isSearchingHero, setIsSearchingHero] = useState(false);
  const [isHeroDropdownOpen, setIsHeroDropdownOpen] = useState(false);

  const modalDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const heroDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const modalSearchContainerRef = useRef<HTMLDivElement | null>(null);
  const heroSearchContainerRef = useRef<HTMLDivElement | null>(null);

  // Modal & Self-Onboarding Flow State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"instant_order" | "whatsapp_proof">("instant_order");

  // Instant Order Form State
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentQrUrl, setPaymentQrUrl] = useState<string>("");

  // Success Confirmation State
  const [orderSuccessData, setOrderSuccessData] = useState<{
    slug: string;
    businessName: string;
    reviewUrl: string;
    dashboardUrl: string;
  } | null>(null);

  const theme = THEMES[selectedTheme] || THEMES["royal-gold"];
  const upiId = "momopedeals@oksbi";
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent("ReviewSmart AI")}&am=2999&cu=INR&tn=${encodeURIComponent(
    `ReviewSmart 3D Standee - ${businessName.slice(0, 20)}`
  )}`;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalSearchContainerRef.current && !modalSearchContainerRef.current.contains(e.target as Node)) {
        setIsModalDropdownOpen(false);
      }
      if (heroSearchContainerRef.current && !heroSearchContainerRef.current.contains(e.target as Node)) {
        setIsHeroDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate Review Card Preview QR code
  useEffect(() => {
    const slugSafe = businessName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "my-shop";
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

  // Generate Payment QR code for modal
  useEffect(() => {
    QRCode.toDataURL(upiDeepLink, {
      width: 250,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setPaymentQrUrl(url))
      .catch((err) => console.error("Payment QR Error", err));
  }, [upiDeepLink]);

  const handleSelectPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setBusinessName(preset.name);
    setCity(preset.city);
    setCategory(preset.category);
    setVerifiedGoogleProfile(null);
  };

  const handleSimulateNfcTap = () => {
    setIsNfcSimulating(true);
    setTimeout(() => {
      setIsNfcSimulating(false);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  const handleCopyUpi = async () => {
    await copyToClipboard(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Google Places Search Handlers (Modal)
  const handleModalBusinessSearch = (val: string) => {
    setBusinessName(val);
    if (modalDebounceRef.current) clearTimeout(modalDebounceRef.current);

    if (!val || val.trim().length < 2) {
      setModalSearchResults([]);
      setIsModalDropdownOpen(false);
      setIsSearchingModal(false);
      return;
    }

    setIsSearchingModal(true);
    setIsModalDropdownOpen(true);

    modalDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/business/search-google?query=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setModalSearchResults(data.results);
        } else {
          setModalSearchResults([]);
        }
      } catch (err) {
        console.error("Google Places search error:", err);
        setModalSearchResults([]);
      } finally {
        setIsSearchingModal(false);
      }
    }, 300);
  };

  // Google Places Search Handlers (Hero)
  const handleHeroBusinessSearch = (val: string) => {
    setBusinessName(val);
    if (heroDebounceRef.current) clearTimeout(heroDebounceRef.current);

    if (!val || val.trim().length < 2) {
      setHeroSearchResults([]);
      setIsHeroDropdownOpen(false);
      setIsSearchingHero(false);
      return;
    }

    setIsSearchingHero(true);
    setIsHeroDropdownOpen(true);

    heroDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/business/search-google?query=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setHeroSearchResults(data.results);
        } else {
          setHeroSearchResults([]);
        }
      } catch (err) {
        console.error("Hero search error:", err);
        setHeroSearchResults([]);
      } finally {
        setIsSearchingHero(false);
      }
    }, 300);
  };

  // When user selects a matching Google Business Profile
  const handleSelectGoogleProfile = (profile: GoogleSearchResult) => {
    setBusinessName(profile.name);
    setGoogleMapsUrl(profile.googleReviewUrl);
    setCategory(profile.category || category);

    if (profile.address) {
      setDeliveryAddress(profile.address);
      const addressParts = profile.address.split(",");
      if (addressParts.length > 1) {
        setCity(addressParts.slice(-2).join(",").trim());
      }
    }

    setVerifiedGoogleProfile(profile);
    setIsModalDropdownOpen(false);
    setIsHeroDropdownOpen(false);
  };

  // 1. Direct Self-Serve Order Submission
  const handleInstantSelfServeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");

    if (!phone || phone.trim().replace(/\D/g, "").length < 10) {
      setOrderError("Please enter a valid 10-digit WhatsApp number.");
      return;
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 8) {
      setOrderError("Please enter your complete shop delivery address with city and pincode.");
      return;
    }

    if (!utrNumber || utrNumber.trim().length < 6) {
      setOrderError("Please enter your 12-digit UPI Transaction / UTR reference number.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step A: Create Merchant Account & Business
      const createRes = await fetch("/api/card/instant-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          phone: phone.trim(),
          category: category.trim(),
          googleReviewUrl: googleMapsUrl.trim() || undefined,
          primaryColor: theme.dotColor,
          tagline: `Tasted or experienced ${businessName}? Rate us 5-stars!`,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || "Failed to create business card.");
      }

      // Step B: Submit Payment Record for Verification
      await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utrNumber: utrNumber.trim(),
          amount: 2999,
          customerPhone: phone.trim(),
          packageTier: "EXECUTIVE_STANDEE",
          notes: `Delivery Address: ${deliveryAddress.trim()}, Pincode: ${pincode.trim()} | Theme: ${theme.name}${
            verifiedGoogleProfile ? ` | Verified GMB: ${verifiedGoogleProfile.name}` : ""
          }`,
        }),
      });

      // Step C: Trigger Autonomous Business DNA Enrichment in background
      if (createData.businessId) {
        fetch("/api/business/enrich-dna", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: createData.businessId,
            businessName: businessName.trim(),
            city: city.trim(),
            category: category.trim(),
            googleAddress: deliveryAddress.trim(),
            autoSave: true,
          }),
        }).catch(() => {});
      }

      // Trigger Confetti Celebration
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });

      setOrderSuccessData({
        slug: createData.slug,
        businessName: businessName.trim(),
        reviewUrl: createData.reviewUrl || `/r/${createData.slug}`,
        dashboardUrl: createData.dashboardUrl || "/dashboard",
      });
    } catch (err: any) {
      setOrderError(err.message || "Something went wrong while placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. WhatsApp Proof Request
  const handleSubmitWhatsAppProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      alert("Please enter a valid 10-digit WhatsApp phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch("/api/lead/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          city,
          category,
          phone,
          source: "HERO_3D_CUSTOMIZER",
          notes: `Theme: ${theme.name}${verifiedGoogleProfile ? ` | Verified GMB: ${verifiedGoogleProfile.name}` : ""}`,
        }),
      });

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });

      const whatsappMsg = encodeURIComponent(
        `Hi ReviewSmart AI Team! I just customized my Luxury Acrylic Standee for *${businessName}* (${city}). Please send me the 3D design mockups, delivery timeline, and the ₹2,999 Lifetime Pass activation details.`
      );

      setTimeout(() => {
        window.open(`https://wa.me/918639831132?text=${whatsappMsg}`, "_blank");
        setIsModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error(err);
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
    <div id="customizer" className="relative pt-6 pb-16 sm:pt-10 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#fafbfe] via-slate-50 to-white">
      {/* Ambient background glow behind Hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-indigo-100/60 via-purple-100/30 to-transparent blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Trust & Launch Badges */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>INDIA&apos;S #1 SMART NFC REVIEW STANDEE</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-sm">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Telugu &bull; Hindi &bull; Tamil &bull; Kannada &bull; English</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>₹2,999 One-Time Lifetime Pass</span>
          </div>
        </div>

        {/* 2-Column Hero Grid: Value Pitch (Left) + 3D Standee Customizer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* LEFT COLUMN: Headings, Value proposition & Instant lead input */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 leading-[1.18] sm:leading-[1.15]">
              Turn Walk-In Customers Into{" "}
              <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 bg-clip-text text-transparent block sm:inline mt-1 sm:mt-0">
                5-Star Google Reviews.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Customers simply <strong>tap their phone</strong> on your luxury acrylic standee or scan the smart QR code. Gemini AI writes authentic 5-star reviews in their native language in 10 seconds. Negative reviews are privately shielded to your WhatsApp.
            </p>

            {/* Quick Live Preview Input Form */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  Customize Your Standee Live:
                </span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Instant Preview Beside &rarr;
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Hero Store Name Input with Google Places Autocomplete */}
                <div ref={heroSearchContainerRef} className="relative">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 text-left flex items-center justify-between">
                    <span>Shop / Clinic Name</span>
                    <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                      <Search className="w-2.5 h-2.5" /> Google Search
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => handleHeroBusinessSearch(e.target.value)}
                      onFocus={() => {
                        if (heroSearchResults.length > 0) setIsHeroDropdownOpen(true);
                      }}
                      placeholder="e.g. Sri Krishna Sweets"
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                      {isSearchingHero ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Hero Google Places Dropdown */}
                  {isHeroDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 animate-fadeIn text-left max-h-56 overflow-y-auto">
                      <div className="px-3 py-1.5 bg-slate-950 text-[10px] font-bold text-slate-400 flex items-center justify-between">
                        <span>{isSearchingHero ? "Searching Google Maps..." : `Google Places (${heroSearchResults.length})`}</span>
                        <span className="text-amber-400 font-normal">Tap to link</span>
                      </div>

                      {isSearchingHero && heroSearchResults.length === 0 && (
                        <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                          <span>Finding matching Google profiles...</span>
                        </div>
                      )}

                      {!isSearchingHero && heroSearchResults.length === 0 && businessName.trim().length >= 2 && (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No exact match found on Google Maps. Keep typing!
                        </div>
                      )}

                      {heroSearchResults.map((r, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectGoogleProfile(r)}
                          className="w-full p-2.5 text-left hover:bg-slate-800 flex items-start gap-2.5 transition text-xs group cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-400/20">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                                {r.name}
                              </span>
                              {r.rating && (
                                <span className="text-[10px] font-bold text-amber-400 shrink-0">
                                  ★ {r.rating} {r.reviewCount ? `(${r.reviewCount})` : ""}
                                </span>
                              )}
                            </div>
                            {r.branchName && (
                              <span className="text-[10px] font-semibold text-indigo-400 block truncate">
                                {r.branchName}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                              {r.address}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 text-left">
                    City Location
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kadapa, Hyderabad, Bangalore"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>
              </div>

              {/* Quick Try Presets */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5 justify-start">
                <span className="text-[10px] text-slate-500 font-bold">Quick Try:</span>
                {POPULAR_PRESETS.map((p) => {
                  const shortLabel = p.name.startsWith("MANA")
                    ? "MANA"
                    : p.name.startsWith("MOMO")
                    ? "MOMO IT"
                    : p.name.startsWith("VR")
                    ? "VR Gold"
                    : p.name.startsWith("City")
                    ? "City Grafix"
                    : p.name.startsWith("AS")
                    ? "AS Ref"
                    : p.name.split(" ")[0];
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition active:scale-95"
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>

              {/* Primary Call to Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode("instant_order");
                    setIsModalOpen(true);
                  }}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-600/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Order 3D Standee &bull; ₹2,999</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalMode("whatsapp_proof");
                    setIsModalOpen(true);
                  }}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Get WhatsApp Proof</span>
                </button>
              </div>
            </div>

            {/* Micro Social Proof Row */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-slate-900 ml-1 font-black">4.9/5</span>
                <span className="text-slate-500 font-normal">(1,280+ Reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Google Policy Safe</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Zero Recurring Fees</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Photorealistic 3D Luxury Acrylic Standee */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            {/* Standee Theme Selector Pills */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 shadow-md">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTheme(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedTheme === t.id
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: t.dotColor }}
                  />
                  <span>{t.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {/* 3D Acrylic Standee Container on Illuminated Countertop */}
            <div
              className="relative p-2 flex flex-col items-center justify-center w-full max-w-sm"
              style={{ perspective: "1200px" }}
            >
              {/* Luxury Acrylic Standee Card */}
              <div
                className={`relative w-[270px] xs:w-[280px] sm:w-80 max-w-[calc(100vw-36px)] rounded-[28px] bg-gradient-to-b ${theme.bgGradient} p-5 sm:p-6 border-2 ${theme.borderClass} text-center transition-all duration-500 [transform:none] sm:[transform:rotateY(-6deg)_rotateX(4deg)]`}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Acrylic Gloss Reflection Highlight */}
                <div className="absolute inset-0 rounded-[26px] bg-gradient-to-tr from-white/20 via-transparent to-white/10 pointer-events-none" />

                {/* Top Badge: Google Review Official Accent */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider ${theme.badgeBg}`}>
                    Tap NFC &bull; Scan QR
                  </div>
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                    <span className="text-[10px] font-black text-amber-300">5.0</span>
                    <span className="text-amber-400 text-xs">★★★★★</span>
                  </div>
                </div>

                {/* Business Name Heading */}
                <div className="py-2">
                  <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-tight line-clamp-2 ${theme.textColor}`}>
                    {businessName || "Your Business Name"}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium flex items-center justify-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">{city || "Kadapa / Hyderabad"}</span>
                  </p>
                </div>

                {/* QR Code Inlay with High Contrast Card */}
                <div className="my-3 p-3 rounded-2xl bg-white shadow-xl mx-auto w-40 sm:w-44 flex flex-col items-center justify-center relative border border-slate-100">
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
                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-indigo-300" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-indigo-400/40 animate-ping pointer-events-none" />
                    </div>
                    <div className="text-left">
                      <p className={`text-[11px] font-black leading-tight ${theme.textColor}`}>TAP PHONE HERE</p>
                      <p className="text-[9px] text-slate-300">Instant NFC Detection</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateNfcTap}
                    disabled={isNfcSimulating}
                    className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-[10px] font-bold transition active:scale-95 flex items-center gap-1"
                  >
                    {isNfcSimulating ? (
                      <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                    ) : (
                      <Play className="w-3 h-3 text-emerald-300" />
                    )}
                    <span>{isNfcSimulating ? "Tapping..." : "Test Tap"}</span>
                  </button>
                </div>
              </div>

              {/* 3D Acrylic Base Standee Foot (Reflected shadow) */}
              <div className="w-52 h-4 rounded-full bg-slate-900/15 blur-lg mx-auto -mt-2 -z-10" />
              <div className="w-64 h-3 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full mx-auto mt-1 border-t border-slate-200" />
            </div>

            {/* Quick Helper text */}
            <p className="text-[11px] text-slate-500 mt-2 text-center font-medium">
              Crystal Acrylic A6 Counter Standee &bull; Built-in High-Frequency NTAG213 NFC chip &bull; No Battery Needed
            </p>
          </div>
        </div>
      </div>

      {/* ── SELF-ONBOARDING & DIRECT ORDER MODAL ───────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-t-[32px] sm:rounded-3xl bg-white border-t sm:border border-slate-200 p-6 sm:p-8 shadow-2xl text-left max-h-[92vh] overflow-y-auto animate-slideUp">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setOrderSuccessData(null);
                setOrderError("");
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* If Order Succeeded: Show Live Review Card & Dashboard Jump */}
            {orderSuccessData ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-500/20">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">Order Placed Successfully! 🚀</h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    Your 3D Acrylic NFC Standee for <strong>{orderSuccessData.businessName}</strong> has been received and queued for custom printing and doorstep dispatch.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-left space-y-2">
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Your Digital AI Review Card is Already Live:</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-indigo-100 text-xs font-mono font-bold text-indigo-600">
                    <span className="truncate">https://www.reviewsmart.online{orderSuccessData.reviewUrl}</span>
                    <a
                      href={orderSuccessData.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={orderSuccessData.dashboardUrl}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm text-center shadow-lg shadow-indigo-600/30 transition"
                  >
                    Open Merchant Dashboard &rarr;
                  </Link>

                  <a
                    href={`https://wa.me/918639831132?text=${encodeURIComponent(
                      `Hi MOMO IT Technologies team, I just paid ₹2,999 for my ReviewSmart standee for ${orderSuccessData.businessName}. Please share dispatch tracking!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Get WhatsApp Tracking
                  </a>
                </div>
              </div>
            ) : (
              <div>
                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => setModalMode("instant_order")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      modalMode === "instant_order"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Instant Order &bull; ₹2,999</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalMode("whatsapp_proof")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      modalMode === "whatsapp_proof"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free Proof on WhatsApp</span>
                  </button>
                </div>

                {orderError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {orderError}
                  </div>
                )}

                {/* ── MODE 1: SELF-SERVE ORDER & UPI CHECKOUT ────────────── */}
                {modalMode === "instant_order" && (
                  <form onSubmit={handleInstantSelfServeOrder} className="space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Claim Your 3D NFC Standee &bull; Lifetime Pass</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        One-time ₹2,999 payment. Zero monthly or annual recurring fees. Delivered to your shop counter.
                      </p>
                    </div>

                    {/* Step 1: Business & Delivery Address */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Step 1: Store &amp; Delivery Details</span>
                        </div>
                        {verifiedGoogleProfile && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Google Verified
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Store / Business Name with Google Places Typeahead Search */}
                        <div ref={modalSearchContainerRef} className="relative">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>Store / Business Name *</span>
                            <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                              <Search className="w-2.5 h-2.5" /> Google Places
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={businessName}
                              onChange={(e) => handleModalBusinessSearch(e.target.value)}
                              onFocus={() => {
                                if (modalSearchResults.length > 0) setIsModalDropdownOpen(true);
                              }}
                              placeholder="Search your business on Google Maps..."
                              className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                              {isSearchingModal ? (
                                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                              ) : (
                                <Search className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </div>

                          {/* Dropdown matching Google Business Profile Results */}
                          {isModalDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 animate-fadeIn max-h-60 overflow-y-auto">
                              <div className="px-3 py-2 bg-slate-950 text-[10px] font-bold text-slate-400 flex items-center justify-between">
                                <span>{isSearchingModal ? "Searching Google Maps..." : `Google Maps Profiles (${modalSearchResults.length})`}</span>
                                <span className="text-amber-400 font-normal">Tap to auto-fill</span>
                              </div>

                              {isSearchingModal && modalSearchResults.length === 0 && (
                                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                  <span>Searching Google Maps live profiles...</span>
                                </div>
                              )}

                              {!isSearchingModal && modalSearchResults.length === 0 && businessName.trim().length >= 2 && (
                                <div className="p-3 text-center text-xs text-slate-400">
                                  No matching profile found. You can continue typing manually!
                                </div>
                              )}

                              {modalSearchResults.map((r, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSelectGoogleProfile(r)}
                                  className="w-full p-2.5 text-left hover:bg-slate-800 flex items-start gap-2.5 transition text-xs group cursor-pointer"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-400/20">
                                    <MapPin className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                                        {r.name}
                                      </span>
                                      {r.rating && (
                                        <span className="text-[10px] font-bold text-amber-400 shrink-0 flex items-center gap-0.5">
                                          ★ {r.rating} {r.reviewCount ? `(${r.reviewCount})` : ""}
                                        </span>
                                      )}
                                    </div>
                                    {r.branchName && (
                                      <span className="text-[10px] font-semibold text-indigo-400 block truncate">
                                        {r.branchName}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                                      {r.address}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            WhatsApp Mobile Number *
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                              placeholder="9876543210"
                              className="w-full px-3 py-2 rounded-r-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Verified Google Profile Badge banner */}
                      {verifiedGoogleProfile && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-900 animate-fadeIn">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold">{verifiedGoogleProfile.name}</span>
                              <span className="text-[10px] text-emerald-700 block truncate">
                                {verifiedGoogleProfile.address}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setVerifiedGoogleProfile(null)}
                            className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0 ml-2 cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Full Shop Shipping Address *
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Shop #, Street Name, Landmark, City & Pincode"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Step 2: Payment via UPI QR */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Step 2: Pay Flat ₹2,999 (Lifetime Pass)</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          ₹0 AMC Forever
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        {paymentQrUrl && (
                          <div className="bg-white p-2 rounded-xl shrink-0">
                            <img src={paymentQrUrl} alt="UPI QR" className="w-24 h-24 object-contain" />
                          </div>
                        )}

                        <div className="text-left space-y-1.5 flex-1">
                          <div className="text-[11px] text-slate-400">Scan with GPay, PhonePe, or Paytm:</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-300">{upiId}</span>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedUpi ? "Copied" : "Copy"}</span>
                            </button>
                          </div>

                          <a
                            href={upiDeepLink}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline pt-0.5"
                          >
                            <span>Open UPI App on Phone &rarr;</span>
                          </a>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Enter 12-Digit UPI Ref / UTR Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value.trim())}
                          placeholder="e.g. 429810294812"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Found in your payment app under &quot;Transaction Details&quot; or &quot;UPI Ref No.&quot;
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-600/30 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Activating Card &amp; Placing Order...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete Order &amp; Activate My Standee &rarr;</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ── MODE 2: FREE PROOF ON WHATSAPP ───────────────────── */}
                {modalMode === "whatsapp_proof" && (
                  <form onSubmit={handleSubmitWhatsAppProof} className="space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        Get Free 3D Standee Proof on WhatsApp
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        We will send a high-resolution 3D proof with your shop name, logo, and custom QR code for <strong>{businessName}</strong> directly to your WhatsApp before you pay anything.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Business Name:
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        WhatsApp Phone Number:
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          required
                          maxLength={10}
                          className="w-full px-4 py-2.5 rounded-r-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating Proof...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>Send My Free 3D Design on WhatsApp &rarr;</span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-slate-500 text-center">
                      🔒 No spam. 100% Free. Direct 1-on-1 support from MOMO IT Technologies team.
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
