"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Store,
  Sparkles,
  QrCode,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Phone,
  Copy,
  Check,
  RotateCw,
} from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandLogo";
import QRCode from "qrcode";
import { copyToClipboard } from "@/lib/clipboard";

interface MerchantItem {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
  city?: string | null;
  isPaid?: boolean;
  phone?: string | null;
  logoUrl?: string | null;
}

const FEATURED_MERCHANTS: MerchantItem[] = [
  {
    id: "cmw7q123city",
    name: "City Grafix Flex & Printing",
    slug: "citygrafix",
    category: "Flex & Digital Printing",
    city: "Kadapa, Andhra Pradesh",
    isPaid: true,
    phone: "9849202528",
    logoUrl: "/api/business/citygrafix/logo",
  },
  {
    id: "cmw7q123roshan",
    name: "New Roshan Tours & Travels",
    slug: "new-roshan-tours-and-travels",
    category: "Umrah, Ziyarat & Flights",
    city: "Kadapa, Andhra Pradesh",
    isPaid: true,
    phone: "9959578900",
    logoUrl: "/api/business/new-roshan-tours-and-travels/logo",
  },
  {
    id: "cmw7q123golden",
    name: "Golden Hair Wig Studio (Kadapa)",
    slug: "golden-hair-wig-studio",
    category: "Hair Wigs & Replacement",
    city: "Kadapa, Andhra Pradesh",
    isPaid: true,
    phone: "8617264887",
    logoUrl: "/logos/golden-hair-wig-studio-logo.png",
  },
  {
    id: "cmw7q123nandyal",
    name: "Golden Hair Wig Studio (Nandyal)",
    slug: "golden-hair-wig-studio-nandyal",
    category: "Hair Wigs & Replacement",
    city: "Nandyal, Andhra Pradesh",
    isPaid: true,
    phone: "8617264887",
    logoUrl: "/logos/golden-hair-wig-studio-logo.png",
  },
  {
    id: "cmw7q123madan",
    name: "Golden Hair Wig Studio (Madanapalle)",
    slug: "golden-hair-wig-studio-madanapalle",
    category: "Hair Wigs & Replacement",
    city: "Madanapalle, Andhra Pradesh",
    isPaid: true,
    phone: "8617264887",
    logoUrl: "/logos/golden-hair-wig-studio-logo.png",
  },
  {
    id: "cmw7q123prodd",
    name: "Golden Hair Wig Studio (Proddatur)",
    slug: "golden-hair-wig-studio-proddatur",
    category: "Hair Wigs & Replacement",
    city: "Proddatur, Andhra Pradesh",
    isPaid: true,
    phone: "8617264887",
    logoUrl: "/logos/golden-hair-wig-studio-logo.png",
  },
  {
    id: "cmw7q123herchoice",
    name: "Her Choice Boutique",
    slug: "her-choice-kadapa",
    category: "Jewellery & Boutique",
    city: "Kadapa, Andhra Pradesh",
    isPaid: true,
    phone: "9000000000",
    logoUrl: "/logos/her-choice-logo.png",
  },
  {
    id: "cmw7q123evania",
    name: "Evania Luxury Salon",
    slug: "evania-luxury-salon",
    category: "Salon & Aesthetics",
    city: "Madhapur, Hyderabad",
    isPaid: true,
    phone: "9123456789",
    logoUrl: "/logos/evania-logo.png",
  },
];

export default function FieldAgentPage() {
  const [searchQuery, setSearchQuery] = useState("City Grafix");
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantItem>(FEATURED_MERCHANTS[0]);
  const [customShopName, setCustomShopName] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter merchants based on search query
  const filteredMerchants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return FEATURED_MERCHANTS;
    return FEATURED_MERCHANTS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        (m.city && m.city.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Active target slug & URL
  const activeSlug = selectedMerchant?.slug || customShopName.toLowerCase().replace(/[^\w-]/g, "-") || "citygrafix";
  const activeReviewUrl = `https://www.reviewsmart.online/r/${activeSlug}`;

  // Generate QR code for demonstration
  useEffect(() => {
    QRCode.toDataURL(activeReviewUrl, {
      width: 260,
      margin: 1,
      color: {
        dark: "#172033",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Error", err));
  }, [activeReviewUrl]);

  const handleCopyLink = async () => {
    await copyToClipboard(activeReviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#172033] font-sans pb-16">
      {/* Top Mobile-Optimized Field Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e3ded6] px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandIcon size="sm" />
            <div>
              <span className="text-sm font-black tracking-tight block">Field Agent Companion</span>
              <span className="text-[10px] text-slate-500 font-medium">1-Handed Demo &amp; Lookup</span>
            </div>
          </div>
          <Link
            href="/login"
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#f0eee8] text-slate-700 hover:text-[#4338ca] transition"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Fast Merchant Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#e3ded6] shadow-xs space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Find Merchant or Enter Shop Name
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. City Grafix, Golden Hair..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-[#e3ded6] text-sm font-medium text-[#172033] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca]/15 transition"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {FEATURED_MERCHANTS.slice(0, 4).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMerchant(m);
                  setSearchQuery(m.name);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition ${
                  selectedMerchant.id === m.id
                    ? "bg-[#4338ca] text-white"
                    : "bg-[#f0eee8] text-slate-700 hover:bg-slate-200"
                }`}
              >
                {m.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Standee Demo Card (What the field agent shows the shop owner) */}
        <div className="bg-white rounded-3xl p-5 border border-[#e3ded6] shadow-md space-y-4 text-center">
          <div className="flex items-center justify-between pb-2 border-b border-[#e3ded6]/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Branded Standee Preview
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live Onboarded
            </span>
          </div>

          {/* Standee Body Preview */}
          <div className="acrylic-card-preview p-5 border-2 border-amber-400/80 bg-gradient-to-b from-slate-950 via-zinc-900 to-black text-white rounded-2xl relative shadow-xl">
            <div className="acrylic-edge-highlight" />
            <div className="flex items-center justify-between mb-3 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              <span>Smart QR Standee</span>
              <span>★★★★★ 5.0</span>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight line-clamp-1">
              {selectedMerchant.name}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 truncate">
              {selectedMerchant.city || "Official Google Review Standee"}
            </p>

            {/* QR Card */}
            <div className="my-3 p-3 bg-white rounded-xl mx-auto w-36 h-36 flex flex-col items-center justify-center border border-slate-100 shadow-md">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Review QR"
                  className="w-28 h-28 object-contain"
                />
              ) : (
                <div className="w-28 h-28 bg-slate-100 animate-pulse rounded" />
              )}
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-wider mt-1">
                Scan for 5★ Review
              </span>
            </div>

            <div className="text-[10px] text-slate-300 font-medium">
              Point camera or UPI app to review
            </div>
          </div>

          {/* Concrete Moment 1: Dual Action Buttons for Field Agent */}
          <div className="space-y-2 pt-1">
            <a
              href={`/r/${selectedMerchant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open customer demo on this phone</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl border border-[#e3ded6] hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied" : "Copy Link"}</span>
              </button>

              <Link
                href={`/agent/manage/${selectedMerchant.id}`}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Manage Store</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Merchant Directory List */}
        <div className="bg-white rounded-2xl p-4 border border-[#e3ded6] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Matching Merchants ({filteredMerchants.length})</span>
            <span className="text-[11px] text-slate-500 font-normal">Tap to inspect</span>
          </h4>

          <div className="divide-y divide-[#e3ded6]/60">
            {filteredMerchants.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMerchant(m)}
                className={`w-full py-2.5 text-left flex items-center justify-between transition ${
                  selectedMerchant.id === m.id ? "text-[#4338ca] font-bold" : "text-slate-800"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold truncate">{m.name}</div>
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{m.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
