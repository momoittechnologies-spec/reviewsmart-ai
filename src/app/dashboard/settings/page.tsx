import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/settings/SettingsClient";
import { Sparkles, Globe, ShieldCheck, ArrowLeft } from "lucide-react";

export default async function SettingsPage({
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

  const isOnline = business?.customerType === "ONLINE";

  return (
    <div className="space-y-6">
      {/* Super Admin Banner */}
      {isSuperAdmin && business && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-amber-500/10 border border-amber-500/40 text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">👑</span>
            <div>
              <span className="font-extrabold text-white">Super Admin Settings Mode:</span>{" "}
              Configuring profile for <strong className="text-amber-300 font-bold">{business.name}</strong>
            </div>
          </div>
          <Link
            href="/admin/merchants"
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-amber-300 hover:text-white font-bold text-[11px] border border-amber-500/40 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin</span>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                isOnline
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {isOnline ? "💻 Online Digital Card" : "🤝 Offline Merchant"}
            </span>
            {business && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  business.isPaid
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {business.isPaid ? "✓ Live & Active" : "⏳ Payment Pending (Watermark Active)"}
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Store &amp; Review Configuration</h1>
          <p className="text-xs text-slate-500">
            {isOnline
              ? "Manage your Google Place ID, direct review link, and business details."
              : "Field merchant settings, Google Business profile, and custom branding."}
          </p>
        </div>
      </div>

      <SettingsClient business={business} />
    </div>
  );
}
