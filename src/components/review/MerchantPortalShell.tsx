"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Gift,
  Globe,
  Instagram,
  Loader2,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import {
  buildGroundedFallbackDraft,
  buildWhatsAppUrl,
  ensureExternalUrl,
  extractWhatsAppNumber,
  getParsedBusinessPhones,
  normalizeSocialUrl,
  PortalBusinessData,
  resolveGoogleReviewTarget,
  resolveMapsDirectionsTarget,
  resolveMenuDestination,
} from "@/lib/portal-helpers";

const UpiPaymentModal = dynamic(() => import("./UpiPaymentModal"), { ssr: false });
const ScratchRewardCard = dynamic(() => import("./ScratchRewardCard"), { ssr: false });

export type PortalViewMode = "review" | "hub";

const LANGUAGE_OPTIONS = [
  { id: "ENGLISH", label: "English" },
  { id: "TELUGU_SCRIPT", label: "తెలుగు" },
  { id: "HINDI", label: "हिंदी" },
  { id: "TAMIL", label: "தமிழ்" },
  { id: "KANNADA", label: "ಕನ್ನಡ" },
  { id: "MALAYALAM", label: "മലയാളം" },
] as const;

export default function MerchantPortalShell({
  business,
  initialView = "review",
  serviceName,
  customerName: incomingCustomerName,
  isDemo = false,
}: {
  business: PortalBusinessData;
  initialView?: PortalViewMode;
  serviceName?: string | null;
  customerName?: string | null;
  isDemo?: boolean;
}) {
  const [view, setView] = useState<PortalViewMode>(initialView);
  const [logoError, setLogoError] = useState(false);

  // Review state — intentionally preserved across Hub <-> Review switches & Browser Back
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draftText, setDraftText] = useState<string>("");
  const [languageMode, setLanguageMode] = useState<string>("ENGLISH");
  const [isPhrasing, setIsPhrasing] = useState(false);
  const [phraseFeedback, setPhraseFeedback] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechRec, setHasSpeechRec] = useState(false);

  // Outbound & private feedback state
  const [googleStatusNote, setGoogleStatusNote] = useState<string | null>(null);
  const [showPrivatePanel, setShowPrivatePanel] = useState(false);
  const [privateMessage, setPrivateMessage] = useState("");
  const [guestName, setGuestName] = useState(incomingCustomerName || "");
  const [guestContact, setGuestContact] = useState("");
  const [privateSubmitting, setPrivateSubmitting] = useState(false);
  const [privateSaved, setPrivateSaved] = useState(false);
  const [privateError, setPrivateError] = useState<string | null>(null);
  const [whatsAppOpenedNote, setWhatsAppOpenedNote] = useState(false);

  // Optional Hub modals
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showRewardCard, setShowRewardCard] = useState(false);

  const recognitionRef = useRef<any>(null);
  const starButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasLoggedInitialView = useRef(false);

  const trackEvent = useCallback(
    (eventType: string, extraRating?: number) => {
      if (isDemo) return;
      const deviceType =
        typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
          ? "mobile"
          : "desktop";
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          slug: business.slug,
          businessId: business.id,
          eventType,
          rating: extraRating ?? (rating || undefined),
          deviceType,
        }),
      }).catch(() => {});
    },
    [business.id, business.slug, isDemo, rating]
  );

  // Log lightweight initial page & screen view once
  useEffect(() => {
    setHasSpeechRec(Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    if (hasLoggedInitialView.current) return;
    hasLoggedInitialView.current = true;
    trackEvent(initialView === "hub" ? "HUB_VIEW" : "REVIEW_VIEW");
  }, [initialView, trackEvent]);

  // Pre-fill optional service tag only when explicitly provided via query string (?service=...)
  useEffect(() => {
    if (!serviceName) return;
    const rawTags = (business.tagChips || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const matched = rawTags.find((t) => t.toLowerCase().includes(serviceName.toLowerCase()));
    setSelectedTags([matched || serviceName]);
  }, [serviceName, business.tagChips]);

  // Synchronize view transitions cleanly with browser history & Back button
  const buildViewUrl = useCallback(
    (targetView: PortalViewMode): string => {
      if (typeof window === "undefined") {
        return targetView === "hub" ? `/r/${business.slug}?view=hub` : `/r/${business.slug}`;
      }
      const url = new URL(window.location.href);
      if (targetView === "hub") {
        url.searchParams.set("view", "hub");
      } else {
        url.searchParams.delete("view");
      }
      return `${url.pathname}${url.search}${url.hash}`;
    },
    [business.slug]
  );

  const navigateView = useCallback(
    (nextView: PortalViewMode) => {
      if (nextView === view) return;
      setView(nextView);
      trackEvent(nextView === "hub" ? "HUB_VIEW" : "REVIEW_VIEW");
      if (typeof window !== "undefined") {
        const nextHref = buildViewUrl(nextView);
        window.history.pushState({ portalView: nextView }, "", nextHref);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [view, buildViewUrl, trackEvent]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlView: PortalViewMode = params.get("view") === "hub" ? "hub" : "review";
      setView(urlView);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Destinations resolved strictly from verified merchant config
  const phoneList = useMemo(
    () => getParsedBusinessPhones(business.phone, business.visitingCardPhone),
    [business.phone, business.visitingCardPhone]
  );
  const waFullNumber = useMemo(
    () => extractWhatsAppNumber(business.whatsapp, phoneList),
    [business.whatsapp, phoneList]
  );
  const cleanMobile = waFullNumber ? waFullNumber.slice(-10) : phoneList[0]?.clean10 || "";

  const googleReviewUrl = useMemo(() => resolveGoogleReviewTarget(business), [business]);
  const directionsUrl = useMemo(() => resolveMapsDirectionsTarget(business), [business]);
  const menuDestination = useMemo(() => resolveMenuDestination(business), [business]);
  const instaUrl = useMemo(
    () => (business.enableSocialLinks !== false ? normalizeSocialUrl(business.instagram, "instagram") : null),
    [business.instagram, business.enableSocialLinks]
  );
  const fbUrl = useMemo(
    () => (business.enableSocialLinks !== false ? normalizeSocialUrl(business.facebook, "facebook") : null),
    [business.facebook, business.enableSocialLinks]
  );
  const siteUrl = useMemo(
    () => (business.enableSocialLinks !== false ? ensureExternalUrl(business.website) : null),
    [business.website, business.enableSocialLinks]
  );

  const waChatUrl = useMemo(
    () => buildWhatsAppUrl(waFullNumber, `Hello ${business.name}, I found your page and have a question.`),
    [waFullNumber, business.name]
  );

  const waFeedbackUrl = useMemo(() => {
    if (!waFullNumber) return null;
    const activeNote = (privateMessage.trim() || draftText.trim()).trim();
    const ratingLine = rating > 0 ? `Rating: ${rating}/5` : "Feedback from recent visit";
    const lines = [
      `Hello ${business.name} team,`,
      `I would like to share private feedback from my visit (${ratingLine}).`,
    ];
    if (activeNote) lines.push("", activeNote);
    if (guestName.trim()) lines.push("", `From: ${guestName.trim()}`);
    return buildWhatsAppUrl(waFullNumber, lines.join("\n"));
  }, [waFullNumber, business.name, privateMessage, draftText, rating, guestName]);

  const customUpi = (business.customUpiId || "").trim();
  const hasUpi = Boolean(customUpi && business.enableUpiPayments !== false);

  const tagsList = useMemo(() => {
    const raw = (business.tagChips || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return raw.length > 0 ? raw.slice(0, 8) : business.industryMeta.defaultTags.slice(0, 6);
  }, [business.tagChips, business.industryMeta.defaultTags]);

  // Accessible star selection — NEVER auto-redirects
  const handleSelectStar = (star: number) => {
    setRating(star);
    setGoogleStatusNote(null);
    trackEvent("STAR_SELECTED", star);
  };

  const handleStarKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(5, idx + 2);
      handleSelectStar(next);
      starButtonRefs.current[next - 1]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, idx);
      handleSelectStar(prev);
      starButtonRefs.current[prev - 1]?.focus();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // Optional voice dictation into the comment box
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.lang = languageMode === "TELUGU_SCRIPT" ? "te-IN" : languageMode === "HINDI" ? "hi-IN" : "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setDraftText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
      }
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    setIsListening(true);
    rec.start();
  };

  // Optional "Help me phrase this" — works from guest's own words or chosen tags, falls back cleanly if offline
  const handleHelpMePhrase = async () => {
    if (!draftText.trim() && selectedTags.length === 0) return;
    setIsPhrasing(true);
    setPhraseFeedback(null);

    const localFallback = buildGroundedFallbackDraft({
      businessName: business.name,
      rating: rating || 5,
      selectedTags,
      customNote: draftText,
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch("/api/ai/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          slug: business.slug,
          businessId: business.id,
          rating: rating || 5,
          selectedTags,
          customNote: draftText.trim(),
          languageMode,
          strictGrounded: true,
        }),
      });
      clearTimeout(timeout);
      const data = await res.json();
      const suggested = data?.reviews?.[0]?.text || data?.review;
      if (res.ok && suggested && typeof suggested === "string") {
        setDraftText(suggested.trim());
        setPhraseFeedback("Draft updated — feel free to edit before posting.");
      } else if (localFallback) {
        setDraftText(localFallback);
        setPhraseFeedback("Formatted your notes — feel free to edit.");
      }
    } catch {
      if (localFallback) {
        setDraftText(localFallback);
        setPhraseFeedback("Formatted your notes locally — feel free to edit.");
      }
    } finally {
      setIsPhrasing(false);
    }
  };

  // Outbound Google click — copies optional draft and clarifies review completes on Google
  const handleGoogleOutboundClick = () => {
    const clean = draftText.trim();
    if (clean) {
      copyToClipboard(clean).catch(() => {});
      setGoogleStatusNote("Draft copied. Complete and submit your review on Google.");
    } else {
      setGoogleStatusNote("Opening Google — write and submit your review directly there.");
    }
    trackEvent("GOOGLE_OUTBOUND_CLICK", rating || undefined);
  };

  // Open inline private feedback panel on the same screen
  const handleOpenPrivateFeedback = () => {
    if (!privateMessage.trim() && draftText.trim()) {
      setPrivateMessage(draftText.trim());
    }
    setPrivateSaved(false);
    setPrivateError(null);
    setWhatsAppOpenedNote(false);
    setShowPrivatePanel((prev) => !prev);
  };

  const handlePrivateDbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateMessage.trim()) return;
    setPrivateSubmitting(true);
    setPrivateError(null);

    if (isDemo) {
      setTimeout(() => {
        setPrivateSubmitting(false);
        setPrivateSaved(true);
      }, 250);
      return;
    }

    try {
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: business.slug,
          businessId: business.id,
          rating: rating || 3,
          customerName: guestName.trim() || null,
          customerPhone: guestContact.trim() || null,
          comments: privateMessage.trim(),
        }),
      });
      if (!res.ok) {
        setPrivateError("Could not save note right now. Please try again or use WhatsApp.");
      } else {
        setPrivateSaved(true);
      }
    } catch {
      setPrivateError("Network error while saving note. Please try again.");
    } finally {
      setPrivateSubmitting(false);
    }
  };

  const handleWhatsAppFeedbackTap = () => {
    trackEvent("WHATSAPP_OUTBOUND_CLICK", rating || undefined);
    setWhatsAppOpenedNote(true);
  };

  const canPhrase = draftText.trim().length > 0 || selectedTags.length > 0;
  const hubHref = buildViewUrl("hub");
  const reviewHref = buildViewUrl("review");

  const primaryCallPhone = phoneList[0];
  const shortEntity = business.industryMeta.shortEntity;
  const callLabel = `Call ${shortEntity}`;

  return (
    <div className="w-full max-w-md mx-auto px-3 sm:px-4 py-3 sm:py-6 flex flex-col gap-3.5 text-slate-100">
      {/* ─── COMPACT PERSISTENT MERCHANT HEADER ─────────────────────────────── */}
      <header className="w-full bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <div className="flex items-start gap-3">
          {/* Crisp Logo Badge */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-white/80 p-1 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
            {business.logoUrl && !logoError ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="w-full h-full object-contain"
                loading="eager"
                decoding="async"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span
                className="text-base font-black"
                style={{ color: business.primaryColor || "#d97706" }}
              >
                {business.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name & Location — wraps cleanly for long business names */}
          <div className="min-w-0 flex-1 text-left">
            <h1 className="text-base sm:text-lg font-extrabold text-white leading-snug break-words">
              {business.name}
            </h1>
            {business.googleAddress ? (
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2 flex items-start gap-1">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <span>{business.googleAddress}</span>
              </p>
            ) : business.category ? (
              <p className="text-[11px] text-slate-300 mt-0.5 truncate">{business.category}</p>
            ) : null}
          </div>
        </div>

        {/* Clean View Switcher Strip */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
          {view === "review" ? (
            <>
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Verified page
              </span>
              <a
                href={hubHref}
                onClick={(e) => {
                  e.preventDefault();
                  navigateView("hub");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 px-2.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span>{business.industryMeta.hubToggleLabel}</span>
              </a>
            </>
          ) : (
            <>
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Verified info &amp; links
              </span>
              <a
                href={reviewHref}
                onClick={(e) => {
                  e.preventDefault();
                  navigateView("review");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Back to review</span>
              </a>
            </>
          )}
        </div>
      </header>

      {/* ─── SCREEN 1: FOCUSED REVIEW EXPERIENCE ───────────────────────────── */}
      {view === "review" ? (
        <section
          aria-label="Share your visit review"
          className="w-full bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"
        >
          {/* Prompt + Large Accessible Stars */}
          <div className="text-center space-y-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              How was your visit?
            </h2>
            <p className="text-xs text-slate-300">
              Tap a star to rate your experience
            </p>

            <div
              role="radiogroup"
              aria-label={`Rate ${business.name} from 1 to 5 stars`}
              className="flex items-center justify-center gap-1.5 sm:gap-2.5 pt-1"
            >
              {[1, 2, 3, 4, 5].map((star, idx) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    ref={(el) => {
                      starButtonRefs.current[idx] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`Rate ${star} out of 5 stars`}
                    onClick={() => handleSelectStar(star)}
                    onKeyDown={(e) => handleStarKeyDown(e, idx)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="min-w-[48px] min-h-[48px] p-1.5 rounded-xl flex items-center justify-center transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <Star
                      className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                        active ? "text-amber-400 fill-amber-400" : "text-slate-600 hover:text-amber-300/60"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div aria-live="polite" className="min-h-[18px] text-xs font-medium text-amber-300">
              {rating > 0
                ? `Selected ${rating} out of 5 stars — you can change your rating anytime.`
                : ""}
            </div>
          </div>

          {/* Single-Screen Comment, Optional AI Help & Consistent Actions */}
          {rating > 0 && (
            <div className="space-y-4 pt-2 border-t border-white/10 animate-fadeIn">
              {/* Optional comment box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="visit-comment-input" className="text-xs font-semibold text-slate-200">
                    Add a comment (optional)
                  </label>
                  {hasSpeechRec && (
                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          isListening ? "bg-red-500 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        <Mic className="w-3 h-3" />
                        <span>{isListening ? "Listening..." : "Speak"}</span>
                      </button>
                    )}
                </div>

                <textarea
                  id="visit-comment-input"
                  rows={3}
                  value={draftText}
                  onChange={(e) => {
                    setDraftText(e.target.value);
                    setPhraseFeedback(null);
                  }}
                  placeholder={business.industryMeta.placeholder || "Share what stood out in your own words..."}
                  className="w-full text-sm p-3 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Optional experience tags (all start unselected) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-400 block">
                  Tap points you want to mention (optional):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tagsList.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleTag(tag)}
                        className={`min-h-[34px] text-xs px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 font-bold"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                        }`}
                      >
                        <span>{isSelected ? "✓" : "+"}</span>
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional "Help me phrase this" — shown when guest supplies words or picks aspects */}
              {canPhrase && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLanguageMode(opt.id)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                            languageMode === opt.id
                              ? "bg-slate-700 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleHelpMePhrase}
                      disabled={isPhrasing}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-200 text-xs font-bold inline-flex items-center gap-1.5 transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      {isPhrasing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Help me phrase this</span>
                    </button>
                  </div>
                  {phraseFeedback ? (
                    <p className="text-[11px] text-emerald-400">{phraseFeedback}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Optional: rewrites your own points cleanly without changing your meaning.
                    </p>
                  )}
                </div>
              )}

              {/* Consistent Two Choices Across ALL Ratings 1–5 */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleGoogleOutboundClick}
                  className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {draftText.trim() && <Copy className="w-4 h-4 shrink-0" />}
                  <span>Continue to Google Reviews</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>

                <p className="text-[11px] text-center text-slate-400">
                  {googleStatusNote || "You complete and submit your public review directly on Google."}
                </p>

                <button
                  type="button"
                  onClick={handleOpenPrivateFeedback}
                  aria-expanded={showPrivatePanel}
                  className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-sm flex items-center justify-center gap-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Send private feedback</span>
                </button>
              </div>

              {/* Inline Private Feedback Drawer (In-app DB + WhatsApp draft option) */}
              {showPrivatePanel && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/90 border border-slate-700 space-y-3 animate-fadeIn">
                  {privateSaved ? (
                    <div className="text-center py-2 space-y-2">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-white">
                        Private note saved for management
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Shared privately with {business.name} (not posted on Google).
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePrivateDbSubmit} className="space-y-2.5">
                      <label htmlFor="private-feedback-msg" className="block text-xs font-semibold text-slate-200">
                        Send a private note to management (not posted publicly):
                      </label>
                      <textarea
                        id="private-feedback-msg"
                        rows={3}
                        value={privateMessage}
                        onChange={(e) => setPrivateMessage(e.target.value)}
                        placeholder="Share what happened or what could be better..."
                        className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Your name (optional)"
                          className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                        />
                        <input
                          type="text"
                          value={guestContact}
                          onChange={(e) => setGuestContact(e.target.value)}
                          placeholder="Phone for callback (optional)"
                          className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                        />
                      </div>
                      {privateError && <p className="text-[11px] text-red-400">{privateError}</p>}
                      <button
                        type="submit"
                        disabled={privateSubmitting || !privateMessage.trim()}
                        className="w-full min-h-[42px] py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        {privateSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Submit private note</span>
                      </button>
                    </form>
                  )}

                  {waFeedbackUrl && (
                    <div className="pt-2.5 border-t border-slate-800 space-y-1.5">
                      <a
                        href={waFeedbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleWhatsAppFeedbackTap}
                        className="w-full min-h-[42px] py-2.5 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" />
                        <span>Open WhatsApp to send feedback</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                      <p className="text-[11px] text-center text-slate-400">
                        {whatsAppOpenedNote
                          ? "WhatsApp opened with your draft — tap Send inside WhatsApp to deliver."
                          : "Prepares a draft in WhatsApp; nothing is sent until you tap Send."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Optional visitor reward or quick hub shortcut */}
          {business.enableScratchCard && (
            <button
              type="button"
              onClick={() => setShowRewardCard(true)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-between text-left transition"
            >
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Visitor Appreciation Offer</span>
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </section>
      ) : (
        /* ─── SCREEN 2: COMPACT BUSINESS / RESTAURANT HUB ─────────────────── */
        <section aria-label="Business hub actions" className="w-full space-y-2.5">
          {/* Primary Emphasis CTAs (Visible immediately on mobile above the fold) */}
          <div className="grid grid-cols-1 gap-2.5">
            {menuDestination ? (
              <>
                <a
                  href={menuDestination.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("MENU_OUTBOUND_CLICK")}
                  className="w-full min-h-[54px] p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-extrabold shadow-lg flex items-center justify-between gap-3 transition active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950/15 flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-extrabold block leading-tight">
                        {menuDestination.label}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-900/80 block">
                        {menuDestination.subtitle}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>

                <a
                  href={reviewHref}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateView("review");
                  }}
                  className="w-full min-h-[54px] p-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shadow-lg flex items-center justify-between gap-3 transition active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950/15 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 fill-slate-950" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-extrabold block leading-tight">Leave a review</span>
                      <span className="text-[11px] font-semibold text-slate-900/80 block">
                        Share feedback or rate on Google
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </a>
              </>
            ) : (
              <>
                <a
                  href={reviewHref}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateView("review");
                  }}
                  className="w-full min-h-[54px] p-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shadow-lg flex items-center justify-between gap-3 transition active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950/15 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 fill-slate-950" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-extrabold block leading-tight">Leave a review</span>
                      <span className="text-[11px] font-semibold text-slate-900/80 block">
                        Rate your visit or share feedback
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </a>

                {hasUpi && (
                  <button
                    type="button"
                    onClick={() => setShowUpiModal(true)}
                    className="w-full min-h-[52px] p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg flex items-center justify-between gap-3 transition active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-950/15 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-extrabold block leading-tight">Pay via UPI</span>
                        <span className="text-[11px] font-semibold text-slate-900/80 block font-mono">
                          {customUpi}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Direct Utility Links: WhatsApp, Directions, Call */}
          <div className="space-y-2 pt-0.5">
            {waChatUrl && (
              <a
                href={waChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("WHATSAPP_OUTBOUND_CLICK")}
                className="w-full min-h-[50px] p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 flex items-center justify-between gap-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-white block leading-tight">Chat on WhatsApp</span>
                    <span className="text-[11px] text-slate-400 block">Quick enquiries &amp; support</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            )}

            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("DIRECTIONS_CLICK")}
                className="w-full min-h-[50px] p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-blue-500/30 flex items-center justify-between gap-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-white block leading-tight">Get directions</span>
                    <span className="text-[11px] text-slate-400 block">Open Google Maps route</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            )}

            {primaryCallPhone && (
              <a
                href={primaryCallPhone.tel}
                onClick={() => trackEvent("CALL_CLICK")}
                className="w-full min-h-[50px] p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 flex items-center justify-between gap-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-white block leading-tight">{callLabel}</span>
                    <span className="text-[11px] text-slate-400 block">{primaryCallPhone.display}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            )}

            {menuDestination && hasUpi && (
              <button
                type="button"
                onClick={() => setShowUpiModal(true)}
                className="w-full min-h-[48px] p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-white block">Pay via UPI</span>
                    <span className="text-[11px] text-slate-400 font-mono block">{customUpi}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            )}
          </div>

          {/* Smaller Secondary Social / Website Links */}
          {(instaUrl || fbUrl || siteUrl) && (
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
              {instaUrl && (
                <a
                  href={instaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("INSTAGRAM_CLICK")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-pink-500/30 text-xs font-semibold text-pink-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Follow on Instagram</span>
                </a>
              )}
              {fbUrl && (
                <a
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-blue-500/30 text-xs font-semibold text-blue-200 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Facebook</span>
                </a>
              )}
              {siteUrl && (
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Website</span>
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {/* Lazy Modals */}
      {showUpiModal && hasUpi && (
        <UpiPaymentModal
          businessName={business.name}
          category={business.category}
          customUpi={customUpi}
          payeeOwnerName={(business.visitingCardOwnerName || business.name).trim()}
          cleanMobile={cleanMobile}
          onClose={() => setShowUpiModal(false)}
        />
      )}

      {showRewardCard && (
        <ScratchRewardCard
          businessName={business.name}
          businessSlug={business.slug}
          whatsappNumber={waFullNumber}
          maxDiscountPct={business.scratchCardMaxDiscount || 5}
          onClose={() => setShowRewardCard(false)}
        />
      )}

      {/* Quiet Footer */}
      <footer className="pt-2 pb-2 text-center">
        <p className="text-[11px] text-slate-500">Powered by ReviewSmart AI</p>
      </footer>
    </div>
  );
}
