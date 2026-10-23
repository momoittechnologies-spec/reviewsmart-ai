"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Eye,
  EyeOff,
  AlertCircle,
  MessageCircle,
  X,
} from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"pin" | "admin">("pin");

  // PIN Login State (Merchants & Marketing Agents)
  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  // 4-Box PIN Input Refs
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handlePinDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const pinArr = pin.padEnd(4, " ").split("");
      pinArr[index] = " ";
      setPin(pinArr.join("").trimEnd());
      return;
    }

    if (cleaned.length > 1) {
      const newPin = cleaned.slice(0, 4);
      setPin(newPin);
      const nextIdx = Math.min(newPin.length, 3);
      pinInputRefs[nextIdx]?.current?.focus();
      return;
    }

    const pinArr = pin.padEnd(4, " ").split("");
    pinArr[index] = cleaned[0];
    const newPin = pinArr.join("").trimEnd();
    setPin(newPin);

    if (index < 3 && cleaned[0]) {
      pinInputRefs[index + 1]?.current?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      const pinArr = pin.padEnd(4, " ").split("");
      if (!pinArr[index] || pinArr[index] === " ") {
        if (index > 0) {
          pinInputRefs[index - 1]?.current?.focus();
        }
      } else {
        pinArr[index] = " ";
        setPin(pinArr.join("").trimEnd());
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      pinInputRefs[index - 1]?.current?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      pinInputRefs[index + 1]?.current?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasteData) {
      setPin(pasteData);
      const nextIdx = Math.min(pasteData.length - 1, 3);
      pinInputRefs[nextIdx]?.current?.focus();
    }
  };

  // Admin Login State (Super Admin)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim(), pin: pin.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please verify your Mobile Number and PIN.");
        setLoading(false);
        return;
      }

      const targetPath =
        data.user?.role === "SUPER_ADMIN"
          ? "/admin"
          : data.user?.role === "MARKETING_AGENT"
          ? "/agent"
          : "/dashboard";
      window.location.href = targetPath;
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid administrator credentials.");
        setLoading(false);
        return;
      }

      window.location.href =
        data.user?.role === "SUPER_ADMIN" ? "/admin" : "/dashboard";
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fafbfe] text-slate-900 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-100/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-100/60 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-50/80 blur-2xl" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <BrandIcon size="xl" className="mb-3.5 scale-110 drop-shadow-md" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
            Review
            <span className="text-indigo-600 font-black">
              Smart
            </span>
            <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-sm">
              AI
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium tracking-wide">
            Invite-only merchant &amp; partner platform
          </p>
        </div>

        {/* Glass Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] backdrop-blur-xl">

          {/* Auth Mode Pill Toggle */}
          <div className="bg-slate-100 border border-slate-200/80 p-1 rounded-2xl mb-6 flex items-center gap-1">
            <button
              type="button"
              onClick={() => { setAuthMode("pin"); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                authMode === "pin"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>User ID &amp; PIN</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode("admin"); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                authMode === "admin"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* ── TAB 1: User ID & PIN ── */}
          {authMode === "pin" && (
            <form onSubmit={handlePinSubmit} className="space-y-5">
              {/* Mobile Number or Agent Code Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Your Mobile Number or Agent Code
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-indigo-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. 9014960900 or MKT-01"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="text"
                    className="w-full text-base sm:text-sm pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-semibold tracking-wide transition"
                  />
                  {userId.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUserId("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"
                      aria-label="Clear user ID"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 4-Box PIN Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Your 4-Digit Security PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 font-medium"
                  >
                    {showPin ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide PIN</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show PIN</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 xs:gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const digit = pin[idx] || "";
                    return (
                      <input
                        key={idx}
                        ref={pinInputRefs[idx]}
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(idx, e)}
                        onPaste={handlePinPaste}
                        className={`w-12 h-12 xs:w-14 xs:h-14 text-center text-xl xs:text-2xl font-black rounded-2xl border-2 transition-all duration-150 focus:outline-none focus:scale-105 ${
                          digit
                            ? "border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-sm ring-2 ring-indigo-100"
                            : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                        }`}
                        placeholder="•"
                      />
                    );
                  })}
                </div>
                <input
                  type="hidden"
                  name="pin"
                  value={pin}
                  required
                />
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Merchant Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* WhatsApp CTA */}
              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">
                  Need a ReviewSmart Card?{" "}
                  <a
                    href="https://wa.me/918639831132"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-bold hover:text-emerald-700 transition inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp support
                  </a>
                </p>
              </div>
            </form>
          )}

          {/* ── TAB 2: Super Admin ── */}
          {authMode === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              {/* Warning Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Restricted master console. Access is monitored and logged.
                  Authorised personnel only.
                </span>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-amber-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@reviewsmart.ai"
                    autoComplete="email"
                    className="w-full text-base sm:text-sm pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 font-medium transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-amber-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full text-base sm:text-sm pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 font-medium transition"
                  />
                </div>
              </div>

              {/* Admin Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-slate-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Access Super Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer & Back link */}
        <div className="text-center mt-6 space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            &larr; Return to Homepage
          </Link>
          <p className="text-slate-400 text-[11px]">
            &copy; {new Date().getFullYear()} ReviewSmart AI &bull; MOMO IT Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
