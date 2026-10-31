"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  Star,
  Sparkles,
  MessageCircle,
  ExternalLink,
  Phone,
  Instagram,
  Facebook,
  Globe,
  UtensilsCrossed,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  QrCode,
  Share2,
  CreditCard,
  Copy,
  X,
  ArrowRight,
  IndianRupee,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import ReviewExperience from "./ReviewExperience";
import { copyToClipboard } from "@/lib/clipboard";
import { buildUpiLinks } from "@/lib/upi-engine";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  googleReviewUrl: string | null;
  googlePlaceId: string | null;
  googleAddress?: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  category?: string | null;
  minRatingForGoogle: number;
  tagChips: string;
  keywords: string;
  reviewPromptTone: string;
  qrMode?: string | null;
  menuUrl?: string | null;
  customUpiId?: string | null;
  visitingCardOwnerName?: string | null;
  googleMapsUrl?: string | null;
}

export default function SmartHubExperience({
  business,
  staff,
  customerName,
  serviceName,
}: {
  business: BusinessData;
  staff?: string | null;
  customerName?: string | null;
  serviceName?: string | null;
}) {
  const [showReviewBooster, setShowReviewBooster] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>("");
  const [upiCopied, setUpiCopied] = useState(false);

  // Clean UPI ID and deep link bundle with NPCI Merchant Category compliance
  const customUpi = (business.customUpiId || "").trim();
  const payeeOwnerName = (business.visitingCardOwnerName || business.name || "").trim();

  const upiBundle = useMemo(() => {
    if (!customUpi) return null;
    return buildUpiLinks({
      upiId: customUpi,
      payeeName: business.name,
      category: business.category,
    });
  }, [customUpi, business.name, business.category]);

  const upiPayUrl = upiBundle?.standardUrl || "";
  const phonepeUrl = upiBundle?.phonepeUrl || "";
  const gpayUrl = upiBundle?.gpayUrl || "";
  const paytmUrl = upiBundle?.paytmUrl || "";
  const qrPayload = upiBundle?.qrPayload || "";

  useEffect(() => {
    if (qrPayload) {
      QRCode.toDataURL(qrPayload, {
        margin: 1,
        width: 340,
        errorCorrectionLevel: "M",
        color: {
          dark: "#020617",
          light: "#ffffff",
        },
      })
        .then((url) => setUpiQrDataUrl(url))
        .catch((err) => console.error("UPI QR Generation Error:", err));
    }
  }, [qrPayload]);

  // Clean WhatsApp number
  const rawWa = business.whatsapp || business.phone || "";
  const cleanWaNumber = rawWa.replace(/[^0-9]/g, "");
  const waFullNumber = cleanWaNumber.startsWith("91")
    ? cleanWaNumber
    : cleanWaNumber.length === 10
    ? `91${cleanWaNumber}`
    : cleanWaNumber;
  const waText = encodeURIComponent(
    `Hello ${business.name}, I found your Smart Hub through your counter QR code! I have an enquiry.`
  );
  const waUrl = waFullNumber ? `https://wa.me/${waFullNumber}?text=${waText}` : null;

  // Clean Instagram URL
  let instaUrl = business.instagram || null;
  if (instaUrl && !instaUrl.startsWith("http")) {
    const handle = instaUrl.replace("@", "").trim();
    instaUrl = `https://instagram.com/${handle}`;
  }

  // Clean Facebook URL
  let fbUrl = business.facebook || null;
  if (fbUrl && !fbUrl.startsWith("http")) {
    fbUrl = `https://facebook.com/${fbUrl.trim()}`;
  }

  // Clean Website URL
  let siteUrl = business.website || null;
  if (siteUrl && !siteUrl.startsWith("http")) {
    siteUrl = `https://${siteUrl}`;
  }

  // Google Maps directions / profile URL
  const mapsUrl =
    business.googleMapsUrl ||
    (business.googlePlaceId
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}&query_place_id=${business.googlePlaceId}`
      : business.googleAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.googleAddress)}`
      : null);

  const handleShareHub = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: `Check out ${business.name}'s official digital card`,
          url,
        });
      } catch {
        // Fallback to copy
        copyToClipboard(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } else {
      copyToClipboard(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center overflow-x-hidden">
      {/* ─── HUB HEADER CARD ─────────────────────────────────────────────────── */}
      <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: business.primaryColor || "#6366f1" }}
        />

        {/* Share Button (Top Right) */}
        <button
          onClick={handleShareHub}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
          title="Share Hub"
        >
          {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>

        {/* Logo Container with Adaptive Display */}
        <div className="relative mb-3.5 mt-1">
          {business.logoUrl ? (
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-white/90 p-2 shadow-2xl flex items-center justify-center overflow-hidden">
              <img
                src={business.logoUrl}
                alt={business.name}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl border-2 border-white/20"
              style={{ backgroundColor: business.primaryColor || "#6366f1" }}
            >
              {business.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-full shadow-md">
            <ShieldCheck className="w-3.5 h-3.5 fill-slate-950 text-amber-500" />
          </div>
        </div>

        {/* Business Name */}
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5 flex-wrap">
          <span>{business.name}</span>
        </h1>

        {/* Tagline */}
        {business.tagline && (
          <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed font-medium">
            {business.tagline}
          </p>
        )}

        {/* Badges / Location */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
          {business.category && (
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
              {business.category}
            </span>
          )}
          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Verified Smart Hub
          </span>
        </div>

        {business.googleAddress && (
          <a
            href={mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.googleAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-slate-200 transition mt-2 flex items-center justify-center gap-1 max-w-xs truncate group"
            title="Open in Google Maps"
          >
            <MapPin className="w-3 h-3 text-red-400 shrink-0 group-hover:scale-110 transition" />
            <span className="truncate underline decoration-dotted underline-offset-2">{business.googleAddress}</span>
          </a>
        )}
      </div>

      {/* ─── PRIMARY HERO ACTION: GOOGLE AI REVIEW BOOSTER ───────────────────── */}
      <div className="w-full mt-4">
        <div
          className={`w-full rounded-3xl transition-all duration-300 relative overflow-hidden border ${
            showReviewBooster
              ? "bg-slate-900 border-amber-500/40 shadow-2xl shadow-amber-500/10 p-4"
              : "bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-500/20 border-amber-500/30 hover:border-amber-400/60 shadow-xl p-4 cursor-pointer transform active:scale-99"
          }`}
          onClick={() => {
            if (!showReviewBooster) setShowReviewBooster(true);
          }}
        >
          {/* Animated top shimmer badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Star className="w-3 h-3 fill-slate-950" />
              <span>Google Maps Official Review</span>
            </div>
            <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              Gemini AI Assisted
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>Leave a 5-Star Review</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Takes only 10 seconds. AI crafts your review instantly with 1-tap copy!
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowReviewBooster(!showReviewBooster);
              }}
              className="w-10 h-10 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 transition"
              aria-label="Toggle Review Experience"
            >
              {showReviewBooster ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Embedded Full Review Experience */}
          {showReviewBooster && (
            <div className="mt-3 pt-3 border-t border-white/10 animate-fadeIn">
              <ReviewExperience
                business={business}
                staff={staff}
                customerName={customerName}
                serviceName={serviceName}
                embedded={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── QUICK ACTION BUTTONS GRID ───────────────────────────────────────── */}
      <div className="w-full mt-3.5 space-y-2.5">
        {/* 0. Instant Counter UPI Payment Acceptance */}
        {customUpi && (
          <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/70 border border-emerald-500/40 hover:border-emerald-400 shadow-xl shadow-emerald-950/30 transition group">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-105 transition shadow-sm">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      Pay at Counter via UPI
                    </span>
                    <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-950 border border-emerald-800/80 px-1.5 py-0.5 rounded-full tracking-wider">
                      0% FEE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono font-medium mt-0.5">
                    {customUpi}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowUpiModal(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  title="Show Payment QR Code"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QR</span>
                </button>
                <a
                  href={upiPayUrl}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-emerald-950/50 transition active:scale-95"
                >
                  <span>Pay Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Supported Apps Strip */}
            <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                Direct Merchant Transfer
              </span>
              <span className="font-mono text-slate-400 truncate max-w-[170px] sm:max-w-none text-right">
                GPay • PhonePe • Paytm • CUB • BHIM
              </span>
            </div>
          </div>
        )}

        {/* 1. WhatsApp Instant Chat / Orders */}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-500/60 shadow-lg flex items-center justify-between gap-3 transition group transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-105 transition">
                <MessageCircle className="w-5 h-5 fill-emerald-500/20" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition block">
                  Chat on WhatsApp
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Instant enquiries, orders &amp; support
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition shrink-0" />
          </a>
        )}

        {/* 2. Digital Menu / Catalog Link (if configured) */}
        {business.menuUrl && (
          <a
            href={business.menuUrl.startsWith("http") ? business.menuUrl : `https://${business.menuUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-orange-500/30 hover:border-orange-500/60 shadow-lg flex items-center justify-between gap-3 transition group transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30 group-hover:scale-105 transition">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white group-hover:text-orange-300 transition block">
                  View Digital Menu / Catalog
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Browse products, items &amp; price list
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transition shrink-0" />
          </a>
        )}

        {/* 3. Locate on Google Maps / Directions */}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-blue-500/30 hover:border-blue-500/60 shadow-lg flex items-center justify-between gap-3 transition group transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-105 transition">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white group-hover:text-blue-300 transition block">
                  Find us on Google Maps
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Get live directions &amp; office location
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition shrink-0" />
          </a>
        )}

        {/* 4. Instagram Profile */}
        {instaUrl && (
          <a
            href={instaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-pink-500/30 hover:border-pink-500/60 shadow-lg flex items-center justify-between gap-3 transition group transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/30 group-hover:scale-105 transition">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white group-hover:text-pink-300 transition block">
                  Follow on Instagram
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Latest updates, reels &amp; new arrivals
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition shrink-0" />
          </a>
        )}

        {/* 5. Facebook Page */}
        {fbUrl && (
          <a
            href={fbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-blue-500/30 hover:border-blue-500/60 shadow-lg flex items-center justify-between gap-3 transition group transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-105 transition">
                <Facebook className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white group-hover:text-blue-300 transition block">
                  Follow on Facebook
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Official page, photos &amp; announcements
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition shrink-0" />
          </a>
        )}

        {/* 6. Official Website */}
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-teal-500/30 hover:border-teal-500/60 shadow-lg flex items-center justify-between gap-3 transition group transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30 group-hover:scale-105 transition">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white group-hover:text-teal-300 transition block">
                  Visit Official Website
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Explore full catalog &amp; services
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition shrink-0" />
          </a>
        )}

        {/* 6. Direct Phone Call */}
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-slate-500 shadow-lg flex items-center justify-between gap-3 transition group transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700 group-hover:scale-105 transition">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white group-hover:text-slate-200 transition block">
                  Call {business.phone}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Direct phone connection
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition shrink-0" />
          </a>
        )}
      </div>

      {/* ─── UPI PAYMENT ACCEPTANCE MODAL ───────────────────────────────────── */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-center my-6 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowUpiModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              aria-label="Close Payment Modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2 shadow-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-800/70 px-2.5 py-0.5 rounded-full mb-1">
                ⚡ Direct Merchant Payment
              </span>
              <h3 className="text-lg font-black text-white">{business.name}</h3>
              {payeeOwnerName && (
                <p className="text-xs text-slate-300 font-medium">
                  Payee: <span className="text-white font-bold">{payeeOwnerName}</span>
                </p>
              )}
            </div>

            {/* Scannable Dynamic QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/30">
              {upiQrDataUrl ? (
                <img
                  src={upiQrDataUrl}
                  alt={`UPI QR code for ${business.name}`}
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-500 text-xs font-medium">
                  Generating UPI QR...
                </div>
              )}
              <span className="text-[11px] font-mono font-bold text-slate-800 mt-2">
                Scan with CUB mBank Plus or Any UPI App
              </span>
            </div>

            {/* UPI ID with 1-Click Copy */}
            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="text-left truncate">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  UPI VPA ID
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 select-all truncate block">
                  {customUpi}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(customUpi);
                  setUpiCopied(true);
                  setTimeout(() => setUpiCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 shrink-0 border border-slate-700 transition active:scale-95"
              >
                {upiCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct App Launch Intent Grid */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ⚡ Instant 1-Tap App Checkout
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* PhonePe Direct */}
                <a
                  href={phonepeUrl}
                  className="py-3 px-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition transform active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5 text-purple-300" />
                  <span>PhonePe</span>
                </a>

                {/* Google Pay Direct */}
                <a
                  href={gpayUrl}
                  className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-blue-500/50 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition transform active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Pay</span>
                </a>

                {/* Paytm Direct */}
                <a
                  href={paytmUrl}
                  className="py-3 px-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition transform active:scale-95"
                >
                  <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Paytm</span>
                </a>

                {/* Any UPI / CUB App */}
                <a
                  href={upiPayUrl}
                  className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition transform active:scale-95"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>All UPI Apps</span>
                </a>
              </div>
            </div>

            {/* High-Value / PhonePe Limit Guidance */}
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Paying over ₹2,000 on PhonePe?</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                NPCI limits gallery screenshot uploads to ₹2,000. To pay amounts above ₹2,000:
              </p>
              <ul className="text-[10px] text-amber-200/90 list-disc list-inside space-y-0.5">
                <li>Tap <strong>PhonePe</strong> button above directly, or</li>
                <li>Copy UPI ID &amp; pay via PhonePe &rarr; <em>To UPI ID</em> (up to ₹1 Lakh limit).</li>
              </ul>
            </div>

            {/* Supported Apps Badges */}
            <div className="pt-1 text-[11px] text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-300">Accepted on all UPI Apps</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
                {["CUB mBank Plus", "PhonePe", "Google Pay", "Paytm", "BHIM", "CRED", "Amazon Pay"].map((app) => (
                  <span
                    key={app}
                    className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-medium"
                  >
                    {app}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-emerald-400/80 pt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Zero surcharge • 100% Direct instant credit to merchant
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── FOOTER WITH ZERO ADS GUARANTEE ─────────────────────────────────── */}
      <footer className="w-full mt-8 pt-4 border-t border-white/5 text-center flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Ad-Free • Zero Distractions • Verified Card</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          Powered by ReviewSmart AI · Smart Business Hub
        </p>
        <a
          href="https://www.momoittechnologies.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200 transition mt-0.5"
        >
          <img
            src="https://www.momoittechnologies.com/logo.svg"
            alt="MOMO IT Technologies"
            className="w-3.5 h-3.5 rounded object-contain"
          />
          <span>Technology Partner: MOMO IT TECHNOLOGIES</span>
        </a>
      </footer>
    </div>
  );
}
