"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  User,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface NavbarProps {
  /** "light" = white frosted glass bar (marketing/public pages)
   *  "dark" = dark slate bar (dashboard/admin) */
  variant?: "light" | "dark";
}

export default function Navbar({ variant = "light" }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isDark = variant === "dark";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  /* ── Computed class tokens based on variant & scroll state ── */
  const headerCls = isDark
    ? `sticky top-0 z-40 w-full border-b transition-all duration-300 no-print ${
        scrolled
          ? "border-slate-800/90 bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-transparent bg-slate-950/70 backdrop-blur-md"
      }`
    : `sticky top-0 z-40 w-full border-b transition-all duration-300 no-print ${
        scrolled
          ? "border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-sm shadow-slate-200/50"
          : "border-transparent bg-white/70 backdrop-blur-md"
      }`;

  const navLinkCls = isDark
    ? "text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-all duration-200"
    : "text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-full hover:bg-slate-100/70 transition-all duration-200";

  return (
    <header className={headerCls}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <BrandLogo href="/" size="md" theme={isDark ? "dark" : "light"} />
        </div>

        {/* Desktop Navigation Links */}
        <nav
          className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border ${
            isDark
              ? "bg-slate-900/60 border-slate-800 text-slate-300"
              : "bg-slate-100/60 border-slate-200/70 text-slate-600"
          }`}
        >
          <Link href="/#features" className={navLinkCls}>
            Features
          </Link>
          <Link href="/#how-it-works" className={navLinkCls}>
            How it Works
          </Link>
          <Link href="/#pricing" className={navLinkCls}>
            Pricing (₹2,999)
          </Link>
          <Link
            href="/r/mana-tours-travels"
            target="_blank"
            className={`flex items-center gap-1.5 font-bold text-[11px] px-3 py-1.5 rounded-full transition-all ${
              isDark
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                : "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Demo</span>
          </Link>
        </nav>

        {/* Right CTA / User State */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "SUPER_ADMIN" && (
                <Link
                  href="/admin"
                  className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
                    isDark
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25"
                      : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Owner Panel
                </Link>
              )}
              {user.role !== "SUPER_ADMIN" && (
                <Link
                  href="/dashboard"
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5 active:scale-95"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Store Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                title="Log Out"
                className={`p-2 rounded-xl transition ${
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center gap-1.5 ${
                  isDark
                    ? "text-slate-300 hover:text-white hover:bg-slate-800"
                    : "text-slate-700 hover:text-indigo-600 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin Login</span>
              </Link>
              <Link
                href="/#customizer"
                className="text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-md shadow-emerald-600/25 active:scale-95 flex items-center gap-1.5 shimmer-sweep"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>BUY NOW &bull; ₹2,999</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-xl transition ${
            isDark
              ? "text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
              : "text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200"
          }`}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-4 pt-3 pb-5 space-y-3 shadow-2xl border-b animate-slideUp ${
            isDark
              ? "bg-slate-950/95 backdrop-blur-2xl border-slate-800 text-slate-200"
              : "bg-white/95 backdrop-blur-2xl border-slate-200 text-slate-800"
          }`}
        >
          <div className="flex flex-col space-y-1">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-500/10 transition flex items-center justify-between"
            >
              <span>Features</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-500/10 transition flex items-center justify-between"
            >
              <span>How it Works</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-500/10 transition flex items-center justify-between"
            >
              <span>Lifetime Pass (₹2,999)</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </Link>
            <Link
              href="/r/mana-tours-travels"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between text-xs font-bold px-3 py-2.5 rounded-xl border ${
                isDark
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Demo (Mana Tours)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className={`pt-3 border-t flex flex-col gap-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
            {user ? (
              <>
                {user.role === "SUPER_ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md"
                  >
                    Admin Console
                  </Link>
                )}
                {user.role !== "SUPER_ADMIN" && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                  >
                    Go to Store Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-red-400 hover:text-red-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-center py-2.5 rounded-xl font-bold text-xs border transition ${
                    isDark
                      ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                  }`}
                >
                  Admin Command Center
                </Link>
                <Link
                  href="/#customizer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>BUY NOW &bull; ₹2,999 (LIFETIME PASS)</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
