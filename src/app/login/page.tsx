"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  Smartphone,
  KeyRound,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Store,
  Shield,
} from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandLogo";

export default function LoginPage() {
  const router = useRouter();

  // Mode: "merchant" | "admin"
  const [roleMode, setRoleMode] = useState<"merchant" | "admin">("merchant");

  // Merchant Credentials (User ID / Phone + 4-digit PIN)
  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");

  // Admin Credentials (Email + Password)
  const [email, setEmail] = useState("momopedeals@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload =
        roleMode === "merchant"
          ? { userId: userId.trim(), pin: pin.trim() }
          : { email: email.trim(), password: password.trim() };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
        return;
      }

      if (roleMode === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f6f2] text-[#172033] flex flex-col items-center justify-center px-4 py-8 relative font-sans">
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="flex items-center gap-2 mb-2 group">
            <BrandIcon size="lg" className="group-hover:scale-105 transition-transform" />
            <span className="text-2xl font-black tracking-tight text-[#172033]">
              Review<span className="text-[#4338ca]">Smart</span> <span className="text-xs bg-[#4338ca] text-white px-2 py-0.5 rounded-full font-bold">AI</span>
            </span>
          </Link>
          <p className="text-sm text-slate-600 font-medium">
            Sign in to access your counter standees and review portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e3ded6] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-15px_rgba(23,32,51,0.08)] space-y-5">
          {/* Role Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#f0eee8] border border-[#e3ded6]">
            <button
              type="button"
              onClick={() => {
                setRoleMode("merchant");
                setError("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                roleMode === "merchant"
                  ? "bg-white text-[#172033] shadow-sm"
                  : "text-slate-600 hover:text-[#172033]"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#4338ca]" />
              <span>Merchant / Shop Owner</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleMode("admin");
                setError("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                roleMode === "admin"
                  ? "bg-white text-[#172033] shadow-sm"
                  : "text-slate-600 hover:text-[#172033]"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#4338ca]" />
              <span>Administrator</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {roleMode === "merchant" ? (
              <>
                {/* Merchant User ID / Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Mobile / User ID
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full text-sm pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-[#e3ded6] text-[#172033] placeholder-slate-400 focus:outline-none focus:border-[#4338ca] focus:bg-white focus:ring-2 focus:ring-[#4338ca]/15 font-medium transition"
                    />
                  </div>
                </div>

                {/* 4-Digit Security PIN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    4-Digit Security PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="w-full text-sm pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-[#e3ded6] text-[#172033] placeholder-slate-400 focus:outline-none focus:border-[#4338ca] focus:bg-white focus:ring-2 focus:ring-[#4338ca]/15 font-mono text-center tracking-widest transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Provided during onboarding or by your field agent.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Admin Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="momopedeals@gmail.com"
                      autoComplete="email"
                      className="w-full text-sm pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-[#e3ded6] text-[#172033] placeholder-slate-400 focus:outline-none focus:border-[#4338ca] focus:bg-white focus:ring-2 focus:ring-[#4338ca]/15 font-medium transition"
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-slate-500 hover:text-[#172033] transition flex items-center gap-1 font-medium"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full text-sm pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-[#e3ded6] text-[#172033] placeholder-slate-400 focus:outline-none focus:border-[#4338ca] focus:bg-white focus:ring-2 focus:ring-[#4338ca]/15 font-medium transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-700/20 transition disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {roleMode === "merchant"
                      ? "Sign In to Merchant Dashboard"
                      : "Sign In to Command Center"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Help */}
          <div className="pt-2 border-t border-[#e3ded6]/60 text-center text-xs text-slate-500">
            {roleMode === "merchant" ? (
              <p>
                Forgot your PIN? Contact WhatsApp support at{" "}
                <a
                  href="https://wa.me/918639831132"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#4338ca] hover:underline"
                >
                  +91 86398 31132
                </a>
              </p>
            ) : (
              <p>Restricted to authorized system administrators only.</p>
            )}
          </div>
        </div>

        {/* Footer & Back Link */}
        <div className="text-center mt-6 space-y-1.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#172033] transition"
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
