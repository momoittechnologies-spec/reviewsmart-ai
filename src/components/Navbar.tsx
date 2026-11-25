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
  ArrowRight,
  Globe,
  Zap,
  Award,
  Layers,
  HelpCircle,
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

const DESKTOP_NAV_ITEMS = [
  { id: "demo", label: "6-Lang Demo", shortLabel: "Demo", href: "/#demo", icon: Globe, hideOnMd: false },
  { id: "how-it-works", label: "How it works", shortLabel: "How it works", href: "/#how-it-works", icon: Layers, hideOnMd: false },
  { id: "merchants", label: "Merchants", shortLabel: "Merchants", href: "/#merchants", icon: Award, hideOnMd: true },
  { id: "pricing", label: "Pricing", shortLabel: "Pricing", href: "/#pricing", icon: Zap, badge: "₹2,999", hideOnMd: false },
  { id: "faq", label: "FAQ", shortLabel: "FAQ", href: "/#faq", icon: HelpCircle, hideOnMd: true },
];

export default function Navbar({ variant = "light" }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const isDark = variant === "dark";

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 15);

      if (pathname === "/") {
        const probe = y + 180;
        let current = "";
        for (const item of DESKTOP_NAV_ITEMS) {
          const el = document.getElementById(item.id);
          if (el && probe >= el.offsetTop) {
            current = item.id;
          }
        }
        setActiveSection(current);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

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

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const scrollToHeroShowcase = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("hero-showcase") || document.getElementById("pricing");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const headerCls = isDark
    ? `sticky top-0 z-40 w-full border-b transition-all duration-300 no-print ${
        scrolled
          ? "border-slate-800/90 bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/25"
          : "border-slate-800/40 bg-slate-950/75 backdrop-blur-md"
      }`
    : `sticky top-0 z-40 w-full border-b transition-all duration-300 no-print ${
        scrolled
          ? "border-[#e3ded6]/90 bg-[#f7f6f2]/88 backdrop-blur-2xl shadow-[0_8px_30px_-12px_rgba(23,32,51,0.12)]"
          : "border-transparent bg-[#f7f6f2]/75 backdrop-blur-md"
      }`;

  return (
    <header className={headerCls}>
      <div className="max-w-[1380px] 2xl:max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-2 lg:gap-4">
        {/* Brand */}
        <div className="flex items-center shrink-0">
          <BrandLogo href="/" size="md" theme={isDark ? "dark" : "light"} priority />
        </div>

        {/* Desktop Glassmorphic Floating Pill Navigation */}
        <nav
          aria-label="Primary Navigation"
          className={`hidden md:flex items-center gap-0.5 lg:gap-1 p-1 rounded-full border backdrop-blur-xl transition-all shrink-0 ${
            isDark
              ? "bg-slate-900/80 border-slate-800 shadow-inner"
              : "bg-white/85 border-[#e3ded6]/90 shadow-[0_2px_14px_-4px_rgba(23,32,51,0.08)]"
          }`}
        >
          {DESKTOP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`${item.hideOnMd ? "hidden lg:inline-flex" : "inline-flex"} items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? isDark
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-[#172033] text-white shadow-[0_3px_10px_-2px_rgba(23,32,51,0.35)]"
                    : isDark
                    ? "text-slate-300 hover:text-white hover:bg-white/10"
                    : "text-[#172033]/75 hover:text-[#4338ca] hover:bg-indigo-50/70"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive
                      ? "text-amber-300"
                      : item.id === "pricing"
                      ? "text-amber-500"
                      : isDark
                      ? "text-slate-400"
                      : "text-slate-400"
                  }`}
                />
                <span className="hidden xl:inline">{item.label}</span>
                <span className="xl:hidden">{item.shortLabel}</span>
                {item.badge && (
                  <span
                    className={`hidden xl:inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-black tracking-tight ${
                      isActive
                        ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Cluster */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-1.5 lg:gap-2">
              {user.role === "SUPER_ADMIN" ? (
                <Link
                  href="/admin"
                  className="text-xs font-bold px-3.5 py-2 rounded-full bg-amber-500/15 text-amber-900 border border-amber-300 hover:bg-amber-500/25 transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="text-xs font-bold px-4 py-2 rounded-full bg-gradient-to-r from-[#4338ca] to-[#3730a3] text-white hover:from-[#4f46e5] hover:to-[#4338ca] transition shadow-[0_6px_18px_-6px_rgba(67,56,202,0.55)] flex items-center gap-1.5 whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span>Dashboard</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-white/80 border border-transparent hover:border-[#e3ded6] transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`text-xs font-bold px-3.5 py-2 rounded-full border transition whitespace-nowrap ${
                  isDark
                    ? "text-slate-200 border-slate-700 hover:bg-white/10"
                    : "text-[#172033] bg-white/80 border-[#e3ded6] hover:bg-white hover:border-indigo-300 hover:text-[#4338ca] shadow-2xs"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/#hero-showcase"
                onClick={scrollToHeroShowcase}
                className="group relative text-xs font-extrabold px-4 lg:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#4338ca] via-[#4f46e5] to-[#3730a3] hover:from-[#4f46e5] hover:to-[#4338ca] text-white transition-all shadow-[0_8px_22px_-6px_rgba(67,56,202,0.55)] ring-1 ring-white/25 hover:shadow-[0_12px_26px_-6px_rgba(67,56,202,0.7)] hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap overflow-hidden"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Get your standee</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-0.5 transition-transform shrink-0 hidden lg:inline" />
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
              <span>Pricing (From ₹2,999)</span>
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
                href="/#hero-showcase"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  scrollToHeroShowcase(e);
                }}
                className="w-full py-2.5 rounded-xl bg-[#4338ca] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Get your standee</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
