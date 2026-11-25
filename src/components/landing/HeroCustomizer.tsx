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
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Receipt,
  Shield,
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

export interface PackageOption {
  id: "starter" | "hub" | "growth";
  name: string;
  subtitle: string;
  price: number;
  badge?: string;
  popular?: boolean;
}

export const PACKAGES: Record<string, PackageOption> = {
  starter: {
    id: "starter",
    name: "Starter Review Booster",
    subtitle: "1 Physical Standee + QR Review Gateway",
    price: 2999,
  },
  hub: {
    id: "hub",
    name: "Smart Business Hub",
    subtitle: "Standee + 6-Language AI Assistant + WhatsApp Shield",
    price: 3999,
    popular: true,
    badge: "MOST POPULAR",
  },
  growth: {
    id: "growth",
    name: "360° Growth & Loyalty",
    subtitle: "2 Standees + Smart Review NFC Cards + AI Auto-Pilot",
    price: 4999,
    badge: "BEST VALUE",
  },
};

export const CANONICAL_MERCHANTS: Record<string, string> = {
  "mana tours & travels": "mana-tours-travels",
  "mana tours travels": "mana-tours-travels",
  "mana": "mana-tours-travels",
  "new roshan tours & travels": "new-roshan-tours-and-travels",
  "new roshan": "new-roshan-tours-and-travels",
  "golden hair wig studio": "golden-hair-wig-studio",
  "golden hair wig studio - nandyal": "golden-hair-wig-studio-nandyal",
  "golden hair wig studio - madanapalle": "golden-hair-wig-studio-madanapalle",
  "golden hair wig studio - proddatur": "golden-hair-wig-studio-proddatur",
  "city grafix flex & printing": "citygrafix",
  "city grafix": "citygrafix",
  "vr gold company": "vrgold",
  "vr gold": "vrgold",
  "as refrigeration & ac services": "as-refrigeration",
  "as refrigeration": "as-refrigeration",
  "evania luxury salon": "evania-luxury-salon",
  "sri guru fashions": "sri-guru-fashions-393a",
  "her choice - kadapa": "her-choice-kadapa",
  "her choice": "her-choice-kadapa",
};

export function resolveDemoDestination(
  name: string,
  cityLoc?: string,
  cat?: string,
  themeId?: string
): string {
  const cleanName = (name || "").trim().toLowerCase();
  const directSlug = CANONICAL_MERCHANTS[cleanName];
  if (directSlug) {
    return `/r/${directSlug}?demo=true`;
  }
  return `/preview?name=${encodeURIComponent(name.trim() || "My Business")}&city=${encodeURIComponent(
    (cityLoc || "").trim()
  )}&category=${encodeURIComponent((cat || "").trim())}&theme=${encodeURIComponent(
    themeId || "royal-gold"
  )}&demo=true`;
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

const SAMPLE_REVIEW_DRAFTS = {
  en: {
    label: "English",
    lang: "en",
    text: "I visited the shop to ask about a few options. The staff explained the differences clearly. I\u2019d have liked to know the waiting time upfront.",
  },
  te: {
    label: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",
    lang: "te",
    text: "\u0C15\u0C4A\u0C28\u0C4D\u0C28\u0C3F \u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41 \u0C24\u0C46\u0C32\u0C41\u0C38\u0C41\u0C15\u0C4B\u0C35\u0C21\u0C3E\u0C28\u0C3F\u0C15\u0C3F \u0C37\u0C3E\u0C2A\u0C41\u0C15\u0C3F \u0C35\u0C46\u0C33\u0C4D\u0C32\u0C3E\u0C28\u0C41. \u0C05\u0C15\u0C4D\u0C15\u0C21\u0C3F \u0C38\u0C3F\u0C2C\u0C4D\u0C2C\u0C02\u0C26\u0C3F \u0C12\u0C15\u0C4D\u0C15\u0C4B \u0C26\u0C3E\u0C28\u0C3F\u0C32\u0C4B \u0C24\u0C47\u0C21\u0C3E \u0C0F\u0C02\u0C1F\u0C4B \u0C05\u0C30\u0C4D\u0C25\u0C2E\u0C2F\u0C4D\u0C2F\u0C47\u0C32\u0C3E \u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C3E\u0C30\u0C41. \u0C0E\u0C02\u0C24\u0C38\u0C47\u0C2A\u0C41 \u0C35\u0C47\u0C1A\u0C3F \u0C09\u0C02\u0C21\u0C3E\u0C32\u0C4B \u0C2E\u0C41\u0C02\u0C26\u0C47 \u0C1A\u0C46\u0C2A\u0C4D\u0C2A\u0C3F \u0C09\u0C02\u0C1F\u0C47 \u0C2C\u0C3E\u0C17\u0C41\u0C02\u0C21\u0C47\u0C26\u0C3F.",
  },
} as const;

type SampleReviewLang = keyof typeof SAMPLE_REVIEW_DRAFTS;

export default function HeroCustomizer() {
  const [sampleLang, setSampleLang] = useState<SampleReviewLang>("en");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("Local Business");
  const [selectedPlanId, setSelectedPlanId] = useState<"starter" | "hub" | "growth">("starter");

  // Google Places Live Search State (Checkout Modal only)
  const [modalSearchResults, setModalSearchResults] = useState<GoogleSearchResult[]>([]);
  const [isSearchingModal, setIsSearchingModal] = useState(false);
  const [isModalDropdownOpen, setIsModalDropdownOpen] = useState(false);
  const [verifiedGoogleProfile, setVerifiedGoogleProfile] = useState<GoogleSearchResult | null>(null);

  const modalDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const modalSearchContainerRef = useRef<HTMLDivElement | null>(null);

  // Modal & Self-Onboarding Flow State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Instant Order Form State
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [paymentTab, setPaymentTab] = useState<"apps" | "qr" | "manual">("apps");
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [selectedAppHelp, setSelectedAppHelp] = useState<"phonepe" | "gpay" | "paytm">("phonepe");
  const [platformUpiId, setPlatformUpiId] = useState("9036909110@apl");
  const [platformUpiPayee, setPlatformUpiPayee] = useState("Damerla Mohan");
  const upiPhoneNumber = /^\d{10}/.exec(platformUpiId)?.[0] || "9036909110";

  const trackFunnel = (
    event:
      | "product_view"
      | "sample_language_toggle"
      | "order_button_tap"
      | "checkout_start"
      | "purchase_confirmed"
      | "demo_open"
      | "whatsapp_tap",
    meta?: { planId?: string; price?: number; language?: string; source?: string }
  ) => {
    try {
      const payload = JSON.stringify({ event, ...meta });
      if (typeof window !== "undefined") {
        const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
        if (Array.isArray(w.dataLayer)) {
          w.dataLayer.push({ event: `reviewsmart_${event}`, ...meta });
        }
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/analytics/funnel", blob);
        } else {
          fetch("/api/analytics/funnel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    } catch {
      // Never block user interactions on analytics
    }
  };

  useEffect(() => {
    trackFunnel("product_view", { planId: "starter", price: PACKAGES.starter.price, source: "hero" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    fetch("/api/platform-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.upiId) setPlatformUpiId(data.settings.upiId);
        if (data?.settings?.upiPayeeName) setPlatformUpiPayee(data.settings.upiPayeeName);
      })
      .catch(() => {});
  }, [isModalOpen]);

  const handleCopyPhone = async () => {
    await copyToClipboard(upiPhoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };
  const [paymentQrUrl, setPaymentQrUrl] = useState<string>("");

  // Success Confirmation State
  const [orderSuccessData, setOrderSuccessData] = useState<{
    slug: string;
    businessName: string;
    reviewUrl: string;
    dashboardUrl: string;
  } | null>(null);

  const currentPlan = PACKAGES[selectedPlanId] || PACKAGES.starter;
  const upiId = platformUpiId;
  const upiPayee = platformUpiPayee;
  const upiNote = `ReviewSmart - ${currentPlan.name.slice(0, 12)} - ${businessName.slice(0, 12) || "Order"}`;
  const upiEncodedNote = encodeURIComponent(upiNote);
  const upiEncodedPayee = encodeURIComponent(upiPayee);
  const upiEncodedId = encodeURIComponent(upiId);

  // Dynamic Multi-App Protocol Deep Links based on selected package
  const merchantParams = "mc=7372&mode=01&purpose=00";
  const phonePeDeepLink = `phonepe://pay?pa=${upiEncodedId}&pn=${upiEncodedPayee}&am=${currentPlan.price}&cu=INR&tn=${upiEncodedNote}&${merchantParams}`;
  const gpayDeepLink = `tez://upi/pay?pa=${upiEncodedId}&pn=${upiEncodedPayee}&am=${currentPlan.price}&cu=INR&tn=${upiEncodedNote}&${merchantParams}`;
  const paytmDeepLink = `paytmmp://pay?pa=${upiEncodedId}&pn=${upiEncodedPayee}&am=${currentPlan.price}&cu=INR&tn=${upiEncodedNote}&${merchantParams}`;
  const credDeepLink = `credpay://upi/pay?pa=${upiEncodedId}&pn=${upiEncodedPayee}&am=${currentPlan.price}&cu=INR&tn=${upiEncodedNote}&${merchantParams}`;
  const upiDeepLink = `upi://pay?pa=${upiEncodedId}&pn=${upiEncodedPayee}&am=${currentPlan.price}&cu=INR&tn=${upiEncodedNote}&${merchantParams}`;

  // Listen for package selection events from pricing section or mobile dock
  useEffect(() => {
    const handleSelectPlan = (e: Event) => {
      const customEvent = e as CustomEvent<{ plan: "starter" | "hub" | "growth" }>;
      if (customEvent.detail?.plan && PACKAGES[customEvent.detail.plan]) {
        setSelectedPlanId(customEvent.detail.plan);
        setIsModalOpen(true);
      }
    };
    window.addEventListener("reviewsmart:select-plan", handleSelectPlan as EventListener);
    return () => window.removeEventListener("reviewsmart:select-plan", handleSelectPlan as EventListener);
  }, []);

  // Close modal dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalSearchContainerRef.current && !modalSearchContainerRef.current.contains(e.target as Node)) {
        setIsModalDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Featured live demo portal linked from the hero
  const activeDemoHref = "/r/mana-tours-travels?demo=true";
  const activeSampleDraft = SAMPLE_REVIEW_DRAFTS[sampleLang];

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

  // When user selects a matching Google Business Profile inside the checkout modal
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
    trackFunnel("checkout_start", { planId: currentPlan.id, price: currentPlan.price, source: "checkout_modal" });

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
          primaryColor: "#4338ca",
          tagline: `Visited ${businessName}? Share your experience in seconds!`,
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
          amount: currentPlan.price,
          customerPhone: phone.trim(),
          packageTier: currentPlan.id === "starter" ? "STARTER" : currentPlan.id === "hub" ? "SMART_HUB" : "GROWTH_SUITE",
          notes: `Delivery Address: ${deliveryAddress.trim()}, Pincode: ${pincode.trim()} | Package: ${currentPlan.name} (₹${currentPlan.price}) | Custom Standee Design${
            verifiedGoogleProfile ? ` | Verified GMB: ${verifiedGoogleProfile.name}` : ""
          }`,
        }),
      });

      trackFunnel("purchase_confirmed", { planId: currentPlan.id, price: currentPlan.price, source: "checkout_modal" });

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

  return (
    <div id="hero-showcase" className="relative pt-6 pb-16 sm:pt-10 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#fafbfe] via-slate-50 to-white">
      {/* Ambient background glow behind Hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-[480px] bg-gradient-to-b from-indigo-100/50 via-purple-100/25 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[1380px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust & Launch Badges */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>CUSTOM AI REVIEW STANDEES FOR INDIAN BUSINESSES</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Telugu &bull; Hindi &bull; Tamil &bull; Kannada &bull; English &bull; Malayalam</span>
          </div>

          <a
            href="#pricing"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100/90 border border-amber-200/80 text-amber-900 text-xs font-bold shadow-xs transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Modular Packages From ₹2,999 &bull; Lifetime</span>
          </a>
        </div>

        {/* 2-Column Hero Grid: Store Checker & Value Pitch (Left 6 Cols) + MANA Acrylic Standee Showcase (Right 6 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          {/* LEFT COLUMN: Headings, Business Lookup & Action CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-[#172033] leading-[1.12]">
              Your counter standee, ready for customer reviews.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Customers scan your custom-designed counter standee, tap a rating, and draft an authentic Google review in their preferred language in seconds.
            </p>

            {/* Primary Action Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanId("starter");
                  trackFunnel("order_button_tap", { planId: "starter", price: PACKAGES.starter.price, source: "hero_primary" });
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-sm shadow-md shadow-indigo-900/15 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Order your standee &bull; ₹2,999</span>
              </button>

              <a
                href={activeDemoHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackFunnel("demo_open", { source: "hero_cta" })}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-[#e3ded6] text-[#172033] font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition"
              >
                <Smartphone className="w-4 h-4 text-[#4338ca]" />
                <span>Try the customer demo</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
              <span>
                <strong className="text-[#172033]">Starter Review Booster: ₹2,999 one-time</strong> &bull; 4&Prime;&times;6&Prime; acrylic standee, custom design, lifetime portal &amp; free India delivery
              </span>
              <a
                href={`https://wa.me/918639831132?text=${encodeURIComponent(
                  "Hi ReviewSmart AI, I want to ask about the Starter Review Booster standee (₹2,999 one-time)."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackFunnel("whatsapp_tap", { planId: "starter", price: 2999, source: "hero_ask" })}
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2"
              >
                <span>Ask about this standee</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Interactive Customer Review Preview */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e3ded6] shadow-[0_15px_35px_-10px_rgba(23,32,51,0.06)] space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-[#172033] tracking-tight">
                    See what your customers see
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Switch languages to preview a sample review draft.
                  </p>
                </div>

                <span className="inline-flex items-center self-start px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-[#4338ca] text-[11px] font-bold shrink-0">
                  Sample review
                </span>
              </div>

              {/* Language Switch */}
              <div
                role="group"
                aria-label="Sample review language"
                className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#f7f6f2] border border-[#e3ded6]"
              >
                {(Object.keys(SAMPLE_REVIEW_DRAFTS) as SampleReviewLang[]).map((langKey) => {
                  const isSelected = sampleLang === langKey;
                  const item = SAMPLE_REVIEW_DRAFTS[langKey];
                  return (
                    <button
                      key={langKey}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSampleLang(langKey);
                        trackFunnel("sample_language_toggle", { language: langKey, source: "hero_sample_card" });
                      }}
                      className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338ca] focus-visible:ring-offset-1 ${
                        isSelected
                          ? "bg-[#172033] text-white shadow-xs"
                          : "text-slate-700 hover:text-[#172033] hover:bg-white/80"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Sample Review Draft Card (fixed min-height prevents layout jump) */}
              <div className="p-4 rounded-2xl bg-[#f7f6f2]/85 border border-[#e3ded6] min-h-[168px] sm:min-h-[124px] flex items-center">
                <p
                  lang={activeSampleDraft.lang}
                  className={
                    sampleLang === "te"
                      ? "text-sm sm:text-[15px] leading-[1.85] text-[#172033] font-medium"
                      : "text-sm sm:text-[15px] leading-relaxed text-[#172033] font-medium"
                  }
                >
                  {activeSampleDraft.text}
                </p>
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

          {/* RIGHT COLUMN: Approved MANA Tours & Travels Standee Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div className="relative flex flex-col items-center justify-center w-full max-w-md">
              {/* Soft studio backdrop halo */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 via-amber-400/10 to-red-500/10 rounded-[40px] blur-2xl pointer-events-none -z-10" />

              {/* Optical Clear 3mm Acrylic Counter Standee Frame */}
              <div className="relative p-2.5 sm:p-3 rounded-[28px] bg-gradient-to-br from-white/95 via-slate-200/75 to-white/90 border border-white shadow-[0_30px_70px_-15px_rgba(15,23,42,0.42),0_0_0_1px_rgba(148,163,184,0.35)]">
                <div className="acrylic-edge-highlight" />
                <img
                  src="/images/hero-mana-standee.webp"
                  alt="MANA Tours & Travels custom ReviewSmart AI counter standee with Google review QR code"
                  width={682}
                  height={1024}
                  className="w-[265px] sm:w-[310px] lg:w-[330px] h-auto rounded-[20px] block"
                />
              </div>

              {/* Optical Acrylic Standee Base Foot & Grounded Shadow */}
              <div className="acrylic-base-stand w-56 sm:w-64 h-3.5 mx-auto -mt-1 z-10" />
              <div className="acrylic-contact-shadow w-64 sm:w-72 h-4 mx-auto -mt-1" />
            </div>

            {/* Standee Caption & Direct Live Action */}
            <div className="mt-4 flex flex-col items-center gap-2 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/90 text-[11px] font-bold text-slate-700 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Design preview &bull; MANA Tours &amp; Travels, Kadapa
              </span>

              <a
                href="/r/mana-tours-travels?demo=true"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackFunnel("demo_open", { source: "hero_standee_card" })}
                className="w-full max-w-xs py-3 px-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white font-black text-xs shadow-lg border border-slate-700/80 transition active:scale-95 flex items-center justify-center gap-2 group"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Live MANA Customer Card</span>
                <ExternalLink className="w-3 h-3 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* 3 Hardware Quality Badges */}
            <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-md text-left">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-800 leading-tight">3mm Cast Acrylic</p>
                  <p className="text-[9px] text-slate-500">Laser-cut &amp; scratch guard</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-800 leading-tight">Custom Design</p>
                  <p className="text-[9px] text-slate-500">Tailored to your brand</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-800 leading-tight">Instant Smart QR</p>
                  <p className="text-[9px] text-slate-500">Camera &amp; UPI scanner</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Merchant Social Proof & Trust Strip */}
        <div className="mt-12 pt-8 border-t border-slate-200/90">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                ⭐ Trusted by Premier Retailers, Salons, Clinics &amp; Services
              </p>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Generating 5-Star Reviews Daily Across Andhra Pradesh &amp; Telangana
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> 140+ Active Merchants
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" /> 12,850+ Google Reviews
              </span>
            </div>
          </div>

          {/* Client Showcase Pills */}
          <div className="flex flex-wrap items-center justify-start gap-2">
            {[
              { name: "New Roshan Tours & Travels", type: "Umrah, Ziyarat & Flights", city: "Kadapa", rating: "5.0 ★", slug: "new-roshan-tours-and-travels" },
              { name: "Golden Hair Wig Studio (Proddatur)", type: "Hair Wigs & Replacement", city: "Proddatur", rating: "5.0 ★", slug: "golden-hair-wig-studio-proddatur" },
              { name: "Golden Hair Wig Studio (Madanapalle)", type: "Hair Wigs & Replacement", city: "Madanapalle", rating: "5.0 ★", slug: "golden-hair-wig-studio-madanapalle" },
              { name: "Golden Hair Wig Studio (Nandyal)", type: "Hair Wigs & Replacement", city: "Nandyal", rating: "5.0 ★", slug: "golden-hair-wig-studio-nandyal" },
              { name: "Golden Hair Wig Studio (Kadapa)", type: "Hair Wigs & Replacement", city: "Kadapa", rating: "5.0 ★", slug: "golden-hair-wig-studio" },
              { name: "City Grafix", type: "Flex & Sign Boards", city: "Kadapa", rating: "5.0 ★", slug: "citygrafix" },
              { name: "Her Choice", type: "Jewelry & Boutique", city: "Kadapa", rating: "5.0 ★", slug: "her-choice-kadapa" },
              { name: "Evania Luxury Unisex Salon", type: "Salon & Aesthetics", city: "Madhapur", rating: "5.0 ★", slug: "evania-luxury-salon" },
              { name: "AS Refrigeration", type: "AC & Appliance Repair", city: "Kadapa", rating: "4.9 ★", slug: "as-refrigeration" },
              { name: "MANA Tours & Travels", type: "Tours & Cabs", city: "Kadapa", rating: "5.0 ★", slug: "mana-tours-travels" },
              { name: "VR Gold Company", type: "Bullion & Gold", city: "Kadapa", rating: "4.9 ★", slug: "vrgold" },
            ].map((c) => (
              <a
                key={c.name}
                href={`/r/${c.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs flex items-center gap-2 text-xs hover:border-indigo-400 hover:shadow-sm transition group"
              >
                <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">({c.type})</span>
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                  {c.rating}
                </span>
                <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── SELF-ONBOARDING & DIRECT ORDER MODAL ───────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-t-[32px] sm:rounded-3xl bg-white border-t sm:border border-slate-200 p-6 sm:p-8 shadow-2xl text-left max-h-[92vh] overflow-y-auto animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 tracking-tight">ReviewSmart AI Checkout</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Merchant
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-medium">ReviewSmart AI &bull; Direct Peer-to-Bank Rails</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/80">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit Encrypted</span>
                </div>
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setOrderSuccessData(null);
                    setOrderError("");
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* If Order Succeeded: Show Live Review Card & Dashboard Jump */}
            {orderSuccessData ? (
              <div className="text-center py-6 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Order Placed Successfully! 🚀</h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    Your 3D Acrylic Review Standee for <strong>{orderSuccessData.businessName}</strong> has been received and queued for custom printing and doorstep dispatch.
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
                      `Hi ReviewSmart AI team, I just paid ₹${currentPlan.price.toLocaleString("en-IN")} for my ${currentPlan.name} for ${orderSuccessData.businessName}. Please share dispatch tracking!`
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
              <div className="pt-4 space-y-4">
                {/* Package Tier Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>Select ReviewSmart Package:</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">100% Lifetime &bull; Zero AMC</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.values(PACKAGES) as PackageOption[]).map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPlanId(pkg.id)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          selectedPlanId === pkg.id
                            ? "bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-900 truncate">
                            {pkg.id === "starter" ? "Starter" : pkg.id === "hub" ? "Smart Hub" : "360° Growth"}
                          </span>
                          {pkg.popular && (
                            <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">
                              HOT
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-black text-indigo-700 mt-1">₹{pkg.price.toLocaleString("en-IN")}</div>
                        <div className="text-[9px] text-slate-500 truncate mt-0.5">{pkg.subtitle}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collapsible Enterprise Order Summary (Razorpay/Shopify Style) */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setShowOrderSummary(!showOrderSummary)}
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100/60 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800">Order Summary:</span>
                      <span className="text-[11px] text-slate-500 font-medium">{currentPlan.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">₹{currentPlan.price.toLocaleString("en-IN")}</span>
                      {showOrderSummary ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </button>

                  {showOrderSummary && (
                    <div className="px-3 pb-3 pt-1 space-y-2 border-t border-slate-200/60 bg-white text-[11px] animate-fadeIn">
                      <div className="flex justify-between items-start text-slate-600 pt-1">
                        <div>
                          <span className="font-bold text-slate-800 block">{currentPlan.name}</span>
                          <span className="text-[10px] text-slate-400">Custom Brand Standee Design &bull; Laser-Crisp Smart QR</span>
                        </div>
                        <span className="font-mono font-semibold line-through text-slate-400">₹{currentPlan.price * 2}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Gemini AI Engine (6 Indian Languages + WhatsApp Shield)</span>
                        <span className="font-mono font-semibold line-through text-slate-400">₹2,500</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Pan-India Safe Doorstep Courier &amp; Transit Insurance</span>
                        <span className="font-bold text-emerald-600">FREE</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-100">
                        <span>Pan-India Launch Discount (Included)</span>
                        <span className="font-mono font-bold">-₹{currentPlan.price + 2500}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-900 font-bold pt-2 border-t border-slate-200 text-xs">
                        <span>Total Payable (All Taxes &amp; GST Included)</span>
                        <span className="font-mono font-black text-emerald-600 text-sm">₹{currentPlan.price.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleInstantSelfServeOrder} className="space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Claim Your {currentPlan.name} &bull; Lifetime Pass</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        One-time ₹{currentPlan.price.toLocaleString("en-IN")} payment. Zero monthly or annual recurring fees. Delivered to your shop counter.
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

                    {/* What Happens After Order & Support */}
                    <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-[11px] text-slate-700 space-y-1.5">
                      <div className="font-bold text-indigo-950 flex items-center justify-between gap-2">
                        <span>What happens after payment:</span>
                        <a
                          href={`https://wa.me/918639831132?text=${encodeURIComponent(
                            `Hi ReviewSmart AI, I have a quick question before ordering the ${currentPlan.name} (₹${currentPlan.price.toLocaleString("en-IN")}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackFunnel("whatsapp_tap", { planId: currentPlan.id, price: currentPlan.price, source: "checkout_modal" })}
                          className="text-emerald-700 hover:underline font-bold shrink-0"
                        >
                          Ask on WhatsApp &rarr;
                        </a>
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-600">
                        1. Instant digital card activation &bull; 2. Custom standee artwork proof sent on WhatsApp for approval before printing &bull; 3. Free India-wide courier delivery (₹0 monthly software fee).
                      </p>
                    </div>

                    {/* Step 2: Professional Payment Gateway (Razorpay/Stripe Standard) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                      {/* Step 2 Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
                            2
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              Select Payment Method
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Instant Direct Bank Settlement &bull; 0% Convenience Fee
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Total: ₹{currentPlan.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Segmented Payment Mode Tabs */}
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-center text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setPaymentTab("apps")}
                          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            paymentTab === "apps"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">UPI Apps</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentTab("qr")}
                          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            paymentTab === "qr"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">Scan QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentTab("manual")}
                          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            paymentTab === "manual"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">Number / ID</span>
                        </button>
                      </div>

                      {/* TAB 1: 1-Tap UPI Apps (PhonePe, GPay, Paytm, CRED) */}
                      {paymentTab === "apps" && (
                        <div className="space-y-2.5 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                            <span>Tap your preferred UPI app on mobile to pay ₹{currentPlan.price.toLocaleString("en-IN")}:</span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              ✓ Direct Bank Rail
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {/* PhonePe */}
                            <a
                              href={phonePeDeepLink}
                              className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-950 transition flex flex-col items-center justify-center gap-1 group active:scale-95 shadow-xs text-center"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#5f259f] text-white flex items-center justify-center font-black text-xs shadow-sm">
                                Pe
                              </div>
                              <span className="text-xs font-black text-purple-900">PhonePe</span>
                              <span className="text-[9px] text-purple-700 font-bold bg-purple-100/90 px-1.5 py-0.5 rounded">
                                Tap to Pay
                              </span>
                            </a>

                            {/* Google Pay */}
                            <a
                              href={gpayDeepLink}
                              className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-950 transition flex flex-col items-center justify-center gap-1 group active:scale-95 shadow-xs text-center"
                            >
                              <div className="w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center shadow-sm">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.665-5.2 3.665-9.12z" />
                                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.43 7.37 24 12 24z" />
                                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
                                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.28 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                                </svg>
                              </div>
                              <span className="text-xs font-black text-blue-900">Google Pay</span>
                              <span className="text-[9px] text-blue-700 font-bold bg-blue-100/90 px-1.5 py-0.5 rounded">
                                Tap to Pay
                              </span>
                            </a>

                            {/* Paytm */}
                            <a
                              href={paytmDeepLink}
                              className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-950 transition flex flex-col items-center justify-center gap-1 group active:scale-95 shadow-xs text-center"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#002e6e] text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                                Paytm
                              </div>
                              <span className="text-xs font-black text-sky-900">Paytm</span>
                              <span className="text-[9px] text-sky-700 font-bold bg-sky-100/90 px-1.5 py-0.5 rounded">
                                Tap to Pay
                              </span>
                            </a>

                            {/* CRED / Any UPI */}
                            <a
                              href={upiDeepLink}
                              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 transition flex flex-col items-center justify-center gap-1 group active:scale-95 shadow-xs text-center"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs shadow-sm">
                                <Zap className="w-4 h-4 fill-amber-400" />
                              </div>
                              <span className="text-xs font-black text-slate-900">CRED / BHIM</span>
                              <span className="text-[9px] text-slate-600 font-bold bg-slate-200/80 px-1.5 py-0.5 rounded">
                                Any App
                              </span>
                            </a>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Direct app launch bypasses screenshot gallery limits. Pre-fills ₹{currentPlan.price.toLocaleString("en-IN")} and merchant VPA automatically.</span>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: Scan QR Code */}
                      {paymentTab === "qr" && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left animate-fadeIn">
                          {paymentQrUrl ? (
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0 relative">
                              <img src={paymentQrUrl} alt="UPI Payment QR" className="w-36 h-36 object-contain" />
                              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            </div>
                          ) : (
                            <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-xl" />
                          )}
                          <div className="space-y-1.5 flex-1">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active Payment Session &bull; ₹{currentPlan.price.toLocaleString("en-IN")}
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">Scan with Phone Camera or any UPI App</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Works with PhonePe, Google Pay, Paytm, BHIM, CRED, Navi, and banking apps.
                            </p>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Merchant VPA: {upiId}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: Pay to Number / UPI ID */}
                      {paymentTab === "manual" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fadeIn">
                          {/* Card 1: PhonePe Mobile Number */}
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                              <span className="flex items-center gap-1">
                                <Smartphone className="w-3 h-3 text-purple-600" /> Pay to Mobile Number
                              </span>
                              <span className="text-emerald-700">PhonePe / GPay</span>
                            </div>
                            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                              <span className="font-mono text-xs font-black text-slate-900">{upiPhoneNumber}</span>
                              <button
                                type="button"
                                onClick={handleCopyPhone}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedPhone ? "Copied" : "Copy"}</span>
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block">Payee: <strong>{upiPayee}</strong></span>
                          </div>

                          {/* Card 2: UPI ID */}
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-emerald-600" /> Pay to UPI ID / VPA
                              </span>
                              <span className="text-emerald-700">Any Bank</span>
                            </div>
                            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                              <span className="font-mono text-xs font-bold text-slate-900 truncate mr-1">{upiId}</span>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedUpi ? "Copied" : "Copy"}</span>
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block">Payee: <strong>{upiPayee}</strong></span>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Enter 12-Digit UTR */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>Enter 12-Digit UPI Reference (UTR) Number *</span>
                          </label>
                          {utrNumber.length === 12 ? (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> 12 / 12 Digits Verified
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {utrNumber.length} / 12 Digits
                            </span>
                          )}
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            required
                            maxLength={12}
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                            placeholder="e.g. 429810294812"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition tracking-wider"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Found under &quot;Transaction Details&quot; or &quot;UPI Ref No.&quot;</span>
                          <button
                            type="button"
                            onClick={() => setShowUtrHelp(!showUtrHelp)}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline flex items-center gap-0.5"
                          >
                            <span>Where is my UTR?</span>
                            {showUtrHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Interactive UTR Help Guide */}
                        {showUtrHelp && (
                          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-[11px] animate-fadeIn">
                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-indigo-100">
                              {(["phonepe", "gpay", "paytm"] as const).map((app) => (
                                <button
                                  key={app}
                                  type="button"
                                  onClick={() => setSelectedAppHelp(app)}
                                  className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                    selectedAppHelp === app
                                      ? "bg-indigo-600 text-white shadow-xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  {app === "phonepe" ? "PhonePe" : app === "gpay" ? "Google Pay" : "Paytm"}
                                </button>
                              ))}
                            </div>

                            {selectedAppHelp === "phonepe" && (
                              <p className="text-slate-600 leading-tight">
                                👉 PhonePe &rarr; <strong>History</strong> &rarr; Tap ₹{currentPlan.price.toLocaleString("en-IN")} payment to {upiPayee} &rarr; Copy the 12-digit <strong>UTR</strong>.
                              </p>
                            )}

                            {selectedAppHelp === "gpay" && (
                              <p className="text-slate-600 leading-tight">
                                👉 Google Pay &rarr; Scroll down &rarr; <strong>See transaction history</strong> &rarr; Tap ₹{currentPlan.price.toLocaleString("en-IN")} payment &rarr; Copy <strong>UPI transaction ID</strong>.
                              </p>
                            )}

                            {selectedAppHelp === "paytm" && (
                              <p className="text-slate-600 leading-tight">
                                👉 Paytm &rarr; <strong>Balance &amp; History</strong> &rarr; Tap ₹{currentPlan.price.toLocaleString("en-IN")} payment &rarr; Copy 12-digit <strong>UPI Ref No.</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-600/35 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Activating Card &amp; Placing Order...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                          <span>CONFIRM &amp; ORDER NOW (₹{currentPlan.price.toLocaleString("en-IN")}) &rarr;</span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>Zero-Risk Guarantee &bull; 100% Secure Peer-to-Bank UPI Payment &bull; Instant Support</span>
                    </p>
                  </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
