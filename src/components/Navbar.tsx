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
  ChevronRight,
  Store,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface NavbarProps {
  /** "light" = warm ivory showroom bar (marketing/public pages)
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

  const scrollToCustomizer = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("customizer") || document.getElementById("hero-preview");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const headerCls = isDark
    ? `sticky top-0 z-40 w-full border-b transition-all duration-300 no-print ${
        scrolled
          ? "border-slate-800/90 bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-transparent bg-slate-950/70 backdrop-blur-md"
      }`
    : `sticky top-0 z-40 w-full border-b transition-all duration-300 no-print ${
        scrolled
          ? "border-[#e3ded6] bg-[#f7f6f2]/90 backdrop-blur-xl shadow-xs"
          : "border-transparent bg-[#f7f6f2]/75 backdrop-blur-md"
      }`;

  const navLinkCls = isDark
    ? "text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/5 transition font-medium"
    : "text-[#172033]/80 hover:text-[#4338ca] px-3.5 py-1.5 rounded-full hover:bg-white/60 transition font-medium";

  return (
    <header className={headerCls}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <BrandLogo href="/" size="md" theme={isDark ? "dark" : "light"} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
          <Link href="/#how-it-works" className={navLinkCls}>
            How it works
          </Link>
          <Link href="/#pricing" className={navLinkCls}>
            Pricing
          </Link>
          <Link href="/login" className={navLinkCls}>
            Sign in
          </Link>
        </nav>

        {/* Right Action */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "SUPER_ADMIN" ? (
                <Link
                  href="/admin"
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-900 border border-amber-300 hover:bg-amber-500/25 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-[#4338ca] text-white hover:bg-[#3730a3] transition shadow-xs flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/60 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs font-bold px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#4338ca] transition"
              >
                Sign in
              </Link>
              <Link
                href="/#customizer"
                onClick={scrollToCustomizer}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white transition shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Preview my standee</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-700 bg-white border border-[#e3ded6] shadow-xs"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-5 space-y-3 bg-[#f7f6f2] border-b border-[#e3ded6] shadow-xl text-[#172033]">
          <div className="flex flex-col space-y-1">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-white transition flex items-center justify-between"
            >
              <span>How it works</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-white transition flex items-center justify-between"
            >
              <span>Pricing (From ₹1,999)</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-white transition flex items-center justify-between"
            >
              <span>Merchant &amp; Admin Sign In</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </Link>
            <Link
              href="/agent"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-white transition flex items-center justify-between text-indigo-700"
            >
              <span>Field Agent Demonstration Tool</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </Link>
          </div>

          <div className="pt-2 border-t border-[#e3ded6]">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === "SUPER_ADMIN" ? "/admin" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#4338ca] text-white text-xs font-bold text-center"
                >
                  {user.role === "SUPER_ADMIN" ? "Admin Panel" : "Store Dashboard"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl border border-[#e3ded6] bg-white text-slate-600"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/#customizer"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  scrollToCustomizer(e);
                }}
                className="w-full py-2.5 rounded-xl bg-[#4338ca] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Preview my standee</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
