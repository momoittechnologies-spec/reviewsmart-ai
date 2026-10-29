"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandLogo";

export default function LoginPage() {
  const router = useRouter();

  // Admin Credentials
  const [email, setEmail] = useState("momopedeals@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Always direct Super Admin straight into the Command Center
      window.location.href = "/admin";
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1d] text-slate-100 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <BrandIcon size="xl" className="mb-3.5 scale-110 drop-shadow-md" />
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-1.5">
            Review
            <span className="text-indigo-400 font-black">
              Smart
            </span>
            <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-sm">
              AI
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-medium tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Super Admin Command Center
          </p>
        </div>

        {/* Glass Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Admin Header Badge */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-medium flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              Authorized Administrator Access Only
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Super Admin Form */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Administrator Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="momopedeals@gmail.com"
                  autoComplete="email"
                  className="w-full text-sm pl-11 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1 font-medium"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full text-sm pl-11 pr-10 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium transition"
                />
              </div>
            </div>

            {/* Admin Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer & Back link */}
        <div className="text-center mt-6 space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            &larr; Return to Homepage
          </Link>
          <p className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} ReviewSmart AI &bull; MOMO IT Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
