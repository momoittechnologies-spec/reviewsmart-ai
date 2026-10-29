import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/utils";
import PrintStudioClient from "@/components/studio/PrintStudioClient";
import {
  Printer,
  Sparkles,
  ExternalLink,
  Truck,
  MessageCircle,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

export default async function StudioPage({
  searchParams,
}: {
  searchParams?: { branchId?: string; businessId?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const targetId = searchParams?.businessId || searchParams?.branchId;

  let business: any = null;

  if (isSuperAdmin && targetId) {
    business = await prisma.business.findFirst({
      where: {
        OR: [{ id: targetId }, { slug: targetId }],
      },
    });
  } else if (isSuperAdmin && !targetId) {
    // If Super Admin opens studio without a business specified, fetch the first active one
    business = await prisma.business.findFirst({
      orderBy: { createdAt: "desc" },
    });
  } else if (searchParams?.branchId) {
    business = await prisma.business.findFirst({
      where: { id: searchParams.branchId, userId: user.id },
    });
  } else {
    business = await prisma.business.findFirst({
      where: { userId: user.id },
    });
  }

  if (!business) {
    redirect(isSuperAdmin ? "/admin/merchants" : "/dashboard/settings");
  }

  const appUrl = getAppUrl();
  const reviewUrl = `${appUrl}/r/${business.slug}`;

  const waCourierText = encodeURIComponent(
    `Hi ReviewSmart AI team! I am using ReviewSmart AI for "${business.name}" (Slug: ${business.slug}). I want to order physical pre-printed acrylic standee units shipped to my shop address.`
  );
  const waCourierLink = `https://wa.me/918639831132?text=${waCourierText}`;

  return (
    <div className="space-y-6">
      {/* Super Admin Preview Banner */}
      {isSuperAdmin && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-amber-500/10 border border-amber-500/40 text-amber-200 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-base">👑</span>
            <div>
              <span className="font-extrabold text-white">Super Admin Standee Studio Mode:</span>{" "}
              Generating print assets for <strong className="text-amber-300 font-bold">{business.name}</strong>{" "}
              <span className="font-mono text-slate-400">(/r/{business.slug})</span>
            </div>
          </div>
          <Link
            href="/admin/merchants"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-amber-300 hover:text-white font-bold text-[11px] border border-amber-500/40 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin Clients</span>
          </Link>
        </div>
      )}

      {/* Top Banner: Standee Studio Access + Optional Courier Request */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl no-print">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Full Standee Studio &bull; 300 DPI Vector PDF Generator</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Print &amp; Counter Display Studio 🖨️
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Customize, preview, and download print-ready files for your counter. Download vector PDFs to print at any local xerox or photo shop anytime with zero reprint fees!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={waCourierLink}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition active:scale-95"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-200" />
            <span>Request Acrylic Standee Courier</span>
          </a>
          <a
            href={reviewUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test Live Card</span>
          </a>
        </div>
      </div>

      <PrintStudioClient business={business} reviewUrl={reviewUrl} />
    </div>
  );
}
