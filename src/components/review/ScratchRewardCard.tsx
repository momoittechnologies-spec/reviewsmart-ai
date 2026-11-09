"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Gift, Sparkles, Copy, Check, X, Tag, ArrowRight, MessageCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";

interface ScratchRewardCardProps {
  businessName: string;
  businessSlug?: string;
  whatsappNumber?: string | null;
  onClose: () => void;
  customOffer?: {
    title?: string;
    benefit?: string;
    discountPct?: number;
    voucherCode?: string;
    terms?: string;
  };
}

interface StoredReward {
  discount: number;
  voucherCode: string;
  title: string;
  benefit: string;
  terms: string;
  isRevealed?: boolean;
}

export default function ScratchRewardCard({
  businessName,
  businessSlug,
  whatsappNumber,
  onClose,
  customOffer,
}: ScratchRewardCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCityGrafix =
    businessSlug === "citygrafix" ||
    businessName.toLowerCase().includes("city grafix");

  const storageKey = `rs_scratch_${businessSlug || "default"}`;

  // Initialize reward details (with persistence to prevent changing values on reload)
  const [rewardData] = useState<StoredReward>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved =
          sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.voucherCode) {
            return parsed;
          }
        }
      } catch {}
    }

    if (customOffer) {
      return {
        discount: customOffer.discountPct || 5,
        voucherCode: customOffer.voucherCode || `OFFER-${Math.floor(1000 + Math.random() * 9000)}`,
        title: customOffer.title || "Special Reward Voucher!",
        benefit: customOffer.benefit || "Exclusive Customer Discount",
        terms: customOffer.terms || "Show to staff on your visit",
        isRevealed: false,
      };
    }

    if (isCityGrafix) {
      // Up to 5% random discount: 2%, 3%, 4%, or 5%
      // Weighted so 4% and 5% have generous win frequency for maximum customer delight
      const discountPool = [3, 4, 5, 2, 4, 5, 3, 5];
      const discount =
        discountPool[Math.floor(Math.random() * discountPool.length)];
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const voucherCode = `CITY${discount}-${randomNum}`;
      const data: StoredReward = {
        discount,
        voucherCode,
        title: "City Grafix Lucky Reward!",
        benefit: `Flat ${discount}% OFF on Printing & Sign Boards`,
        terms:
          "Valid on Flex Printing, Banners, Visiting Cards, Glow Signs & Sign Boards · Present code at billing counter",
        isRevealed: false,
      };

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(data));
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch {}
      }
      return data;
    }

    // Default reward for other merchants
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const voucherCode = `REVIEW-${randomNum}`;
    const data: StoredReward = {
      discount: 5,
      voucherCode,
      title: "Special Thank You Voucher!",
      benefit: "Flat 5% Off / ₹50 Cashback on Next Visit",
      terms: "Valid for next 7 days · Show to staff",
      isRevealed: false,
    };
    return data;
  });

  const [isRevealed, setIsRevealed] = useState(() => Boolean(rewardData.isRevealed));
  const [copiedCode, setCopiedCode] = useState(false);

  // Scratch card canvas setup
  useEffect(() => {
    if (isRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // High DPI support
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Draw scratchable silver-gold metallic background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#94a3b8");
    grad.addColorStop(0.2, "#f8fafc");
    grad.addColorStop(0.45, "#fbbf24");
    grad.addColorStop(0.55, "#f59e0b");
    grad.addColorStop(0.8, "#f8fafc");
    grad.addColorStop(1, "#64748b");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative inner border
    ctx.strokeStyle = "rgba(180, 83, 9, 0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // Scratch instructions
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      isCityGrafix
        ? "✨ Scratch to Reveal Your Discount! ✨"
        : "✨ Scratch Here to Reveal Your Reward! ✨",
      width / 2,
      height / 2 - 14
    );

    ctx.fillStyle = "#b45309";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(
      isCityGrafix
        ? "🎁 Up to 5% OFF on Flex & Printing 🎁"
        : "🎁 Exclusive Customer Voucher 🎁",
      width / 2,
      height / 2 + 8
    );

    ctx.fillStyle = "#475569";
    ctx.font = "9px sans-serif";
    ctx.fillText("Rub with your finger or mouse", width / 2, height / 2 + 26);

    let isDrawing = false;
    let scratchedPixels = 0;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e && e.touches.length > 0) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
      const me = e as MouseEvent;
      return {
        x: me.clientX - rect.left,
        y: me.clientY - rect.top,
      };
    };

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();

      // Check percentage scratched periodically
      scratchedPixels++;
      if (scratchedPixels % 10 === 0) {
        checkPercentage();
      }
    };

    const checkPercentage = () => {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let transparent = 0;
        const total = pixels.length / 4;
        // Sample every 16th pixel for performance
        for (let i = 3; i < pixels.length; i += 64) {
          if (pixels[i] === 0) transparent++;
        }
        const pct = (transparent / (total / 16)) * 100;
        if (pct > 32) {
          revealCard();
        }
      } catch {}
    };

    const revealCard = () => {
      setIsRevealed(true);
      ctx.clearRect(0, 0, width, height);

      // Persist revealed status
      try {
        const updated = { ...rewardData, isRevealed: true };
        sessionStorage.setItem(storageKey, JSON.stringify(updated));
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 30, 60]);
      }
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#fbbf24", "#10b981", "#6366f1", "#ec4899"],
        });
      } catch {}
    };

    const handleStart = (e: any) => {
      isDrawing = true;
      const { x, y } = getPos(e);
      scratch(x, y);
    };

    const handleMove = (e: any) => {
      if (!isDrawing) return;
      if (e.cancelable) e.preventDefault();
      const { x, y } = getPos(e);
      scratch(x, y);
    };

    const handleEnd = () => {
      isDrawing = false;
    };

    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    canvas.addEventListener("touchstart", handleStart, { passive: false });
    canvas.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isRevealed, isCityGrafix, rewardData, storageKey]);

  const handleCopyCode = async () => {
    await copyToClipboard(rewardData.voucherCode);
    setCopiedCode(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30);
    }
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const getWaClaimUrl = () => {
    const rawNumber = whatsappNumber || (isCityGrafix ? "7287867584" : null);
    if (!rawNumber) return null;
    const clean = rawNumber.replace(/\D/g, "");
    const full = clean.length === 10 ? `91${clean}` : clean;

    const message = isCityGrafix
      ? `Hi City Grafix, I just gave a 5-star review on Google and unlocked my lucky ${rewardData.discount}% discount voucher code: ${rewardData.voucherCode}! Please apply this discount to my flex printing / sign board order.`
      : `Hi ${businessName}, I just gave a 5-star review on Google and unlocked reward coupon code ${rewardData.voucherCode}! Please apply this for my next order/visit.`;

    return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
  };

  const waUrl = getWaClaimUrl();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border-t-2 sm:border-2 border-amber-400 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl relative text-center max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
          aria-label="Close reward modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
          <Gift className="w-7 h-7 animate-bounce" />
        </div>

        {/* Header Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isCityGrafix ? "City Grafix Special Offer" : "Customer Appreciation Reward"}</span>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-white">
          {isCityGrafix ? "🎉 You Unlocked a Lucky Discount!" : "🎉 Customer Reward Unlocked!"}
        </h3>
        <p className="text-xs text-slate-300 mt-0.5">
          Thank you for rating <strong className="text-white">{businessName}</strong> on Google!
        </p>

        {/* Scratch Card Container */}
        <div className="my-4 relative w-full h-36 rounded-2xl overflow-hidden border-2 border-amber-400/70 bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-950 p-3 flex flex-col items-center justify-center shadow-inner">
          {/* Revealed Reward Underneath */}
          <div className="space-y-1 py-1 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              {rewardData.title}
            </span>

            <div className="flex items-center justify-center gap-1 my-0.5">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight drop-shadow">
                {rewardData.discount}% OFF
              </span>
            </div>

            <p className="text-xs sm:text-sm font-black text-white leading-tight">
              {rewardData.benefit}
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-mono font-black text-xs shadow mt-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{rewardData.voucherCode}</span>
            </div>

            <p className="text-[9.5px] text-slate-400 max-w-xs mx-auto leading-tight pt-0.5">
              {rewardData.terms}
            </p>
          </div>

          {/* Canvas Scratch Foil Layer */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full cursor-pointer touch-none transition-opacity duration-500 ${
              isRevealed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Copy Voucher Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition active:scale-98"
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Voucher Code Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Coupon Code ({rewardData.voucherCode})</span>
              </>
            )}
          </button>

          {/* Claim on WhatsApp Button */}
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>
                {isCityGrafix ? "Claim Discount on WhatsApp" : "Claim on WhatsApp with Store"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Close Voucher Button */}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 pt-1.5 transition"
          >
            Done / Close Voucher
          </button>

          {/* Technology Partner Footer */}
          <div className="pt-2.5 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[9.5px] text-slate-500">
            <span>Powered by -</span>
            <a
              href="https://www.momoittechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 font-bold transition"
            >
              <img
                src="https://www.momoittechnologies.com/logo.svg"
                alt="MOMO IT Technologies"
                className="w-3 h-3 rounded object-contain"
              />
              <span>MOMO IT TECHNOLOGIES | KADAPA</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
