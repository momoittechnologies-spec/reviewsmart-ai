import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppUrl, getCleanLogoUrl } from "@/lib/utils";
import {
  Store,
  QrCode,
  Smartphone,
  Printer,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandLogo";

export const dynamic = "force-dynamic";

export default async function AgentManageBusinessPage({
  params,
}: {
  params: { businessId: string };
}) {
  const session = await getSessionUser();
  if (!session || (session.role !== "MARKETING_AGENT" && session.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const { businessId } = params;

  const business = await prisma.business.findFirst({
    where: {
      OR: [{ id: businessId }, { slug: businessId }],
    },
    include: {
      user: {
        select: {
          name: true,
          phone: true,
          userIdTag: true,
        },
      },
      feedbacks: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!business) {
    notFound();
  }

  const appUrl = getAppUrl();
  const reviewUrl = `${appUrl}/r/${business.slug}`;
  const ownerPhone = business.user?.phone || business.phone || "";
  const ownerName = business.user?.name || "Business Owner";

  const waShareText = encodeURIComponent(
    `Hello ${ownerName}!\nHere is your official ReviewSmart AI customer review portal for "${business.name}":\n\n${reviewUrl}\n\nKeep this link handy or share it with your walk-in customers to collect 5-star Google reviews in seconds.`
  );
  const waShareUrl = ownerPhone ? `https://wa.me/91${ownerPhone.replace(/\D/g, "").slice(-10)}?text=${waShareText}` : `https://wa.me/?text=${waShareText}`;

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#172033] font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e3ded6] px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/agent"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#4338ca] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Agent Directory</span>
          </Link>
          <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
            {business.name}
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Merchant Summary Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#e3ded6] shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#4338ca] uppercase tracking-wider block">
                {business.category || "Local Business"}
              </span>
              <h1 className="text-xl font-black text-[#172033] tracking-tight mt-0.5">
                {business.name}
              </h1>
              {business.googleAddress && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{business.googleAddress}</span>
                </p>
              )}
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 flex items-center gap-1 ${
                business.isPaid
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {business.isPaid ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Paid Lifetime</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Pending Payment</span>
                </>
              )}
            </span>
          </div>

          {/* Key Actions for Field Visit */}
          <div className="space-y-2 pt-2 border-t border-[#e3ded6]/60">
            {/* 1. Open customer demo on this phone */}
            <a
              href={`/r/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open customer demo on this phone</span>
            </a>

            {/* 2. WhatsApp share link with merchant */}
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share Review Link on WhatsApp with Owner</span>
            </a>

            {/* 3. Open Print Studio */}
            <Link
              href={`/dashboard/studio?businessId=${business.id}`}
              className="w-full py-2.5 px-4 rounded-xl border border-[#e3ded6] hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Open Print Studio (Acrylic &amp; Card PDFs)</span>
            </Link>
          </div>
        </div>

        {/* Merchant Info Details */}
        <div className="bg-white rounded-2xl p-4 border border-[#e3ded6] shadow-xs space-y-2.5 text-xs">
          <h2 className="font-bold text-slate-800 pb-1.5 border-b border-[#e3ded6]/60">
            Account &amp; Branch Credentials
          </h2>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">Owner Name:</span>
            <span className="font-bold text-slate-800">{ownerName}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">Contact Number:</span>
            <span className="font-mono font-bold text-slate-800">{ownerPhone || "Not set"}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">Public Review Slug:</span>
            <span className="font-mono text-[#4338ca]">/r/{business.slug}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">Package Tier:</span>
            <span className="font-bold text-slate-800">{business.packageTier || "EXECUTIVE_STANDEE"}</span>
          </div>
        </div>

        {/* Recent Private Feedback (if any) */}
        {business.feedbacks.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-[#e3ded6] shadow-xs space-y-2.5">
            <h2 className="text-xs font-bold text-slate-800 pb-1.5 border-b border-[#e3ded6]/60 flex items-center justify-between">
              <span>Recent Feedback ({business.feedbacks.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">Private</span>
            </h2>
            <div className="space-y-2">
              {business.feedbacks.map((fb) => (
                <div key={fb.id} className="p-2.5 rounded-xl bg-slate-50 border border-[#e3ded6] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{fb.customerName || "Customer"}</span>
                    <span className="text-[10px] font-bold text-amber-500">★ {fb.rating}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2">{fb.comments}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
