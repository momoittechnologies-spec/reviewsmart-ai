import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl } from "@/lib/qr";
import { getAppUrl } from "@/lib/utils";
import DashboardClientView from "@/components/dashboard/DashboardClientView";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams?: { branchId?: string; businessId?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let business: any = null;
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  try {
    if (isSuperAdmin) {
      const targetId = searchParams?.businessId || searchParams?.branchId;
      business = targetId
        ? await prisma.business.findFirst({
            where: {
              OR: [{ id: targetId }, { slug: targetId }],
            },
            include: {
              user: true,
              feedbacks: {
                orderBy: { createdAt: "desc" },
                take: 10,
              },
              analytics: {
                orderBy: { createdAt: "desc" },
                take: 30,
              },
            },
          })
        : await prisma.business.findFirst({
            orderBy: { createdAt: "desc" },
            include: {
              user: true,
              feedbacks: {
                orderBy: { createdAt: "desc" },
                take: 10,
              },
              analytics: {
                orderBy: { createdAt: "desc" },
                take: 30,
              },
            },
          });
    } else {
      business = searchParams?.branchId
        ? await prisma.business.findFirst({
            where: { id: searchParams.branchId, userId: user.id },
            include: {
              user: true,
              feedbacks: {
                orderBy: { createdAt: "desc" },
                take: 10,
              },
              analytics: {
                orderBy: { createdAt: "desc" },
                take: 30,
              },
            },
          })
        : await prisma.business.findFirst({
            where: { userId: user.id },
            include: {
              user: true,
              feedbacks: {
                orderBy: { createdAt: "desc" },
                take: 10,
              },
              analytics: {
                orderBy: { createdAt: "desc" },
                take: 30,
              },
            },
          });
    }
  } catch (err) {
    console.error("DashboardOverviewPage business fetch error:", err);
  }

  if (!business) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800">No Business Profile Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {isSuperAdmin
            ? "No client businesses exist in the system yet. Onboard your first client store."
            : "Please configure your first business profile in settings."}
        </p>
        <Link
          href={isSuperAdmin ? "/admin/merchants" : "/dashboard/settings"}
          className="inline-block mt-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          {isSuperAdmin ? "Go to Admin Onboarding" : "Setup Profile"}
        </Link>
      </div>
    );
  }

  const appUrl = getAppUrl();
  const reviewUrl = `${appUrl}/r/${business.slug}`;
  const qrDataUrl = await generateQrDataUrl(reviewUrl);

  // Compute metrics from analytics events
  const totalViews = business.analytics?.filter((a: any) => a.eventType === "VIEW").length || 0;
  const aiGenerations = business.analytics?.filter((a: any) => a.eventType === "AI_GENERATE").length || 0;
  const shieldSaves = business.analytics?.filter((a: any) => a.eventType === "SHIELD_INTERCEPT").length || 0;
  const googleRedirects = business.analytics?.filter((a: any) => a.eventType === "GOOGLE_REDIRECT").length || 0;

  const merchantOwnerName = business.user?.name || user.name || "Store Owner";
  const merchantPhone = business.user?.phone || user.phone || business.phone || "Not set";
  const channelBadge =
    business.customerType === "ONLINE" ? "Online Customer" : "Offline Merchant";

  const waActivationText = encodeURIComponent(
    `Hi ReviewSmart AI Support, I am requesting activation for my ReviewSmart AI Card.\n\n` +
      `🏪 Store Name: ${business.name}\n` +
      `👤 Owner: ${merchantOwnerName}\n` +
      `📱 Merchant Mobile / User ID: ${merchantPhone}\n` +
      `🔗 Review Link: ${reviewUrl}\n` +
      `💼 Channel: ${channelBadge}\n\n` +
      `Payment Pending: This review card is not yet active. Please verify my payment and activate it.`
  );
  const waActivationUrl = `https://wa.me/918639831132?text=${waActivationText}`;

  return (
    <div className="space-y-4">
      {isSuperAdmin && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-300 no-print animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span>👑 Super Admin View Mode:</span>
            <span className="text-white font-black">{business.name}</span>
            <span className="text-amber-200/80 font-mono text-[11px]">(/r/{business.slug})</span>
          </div>
          <Link
            href="/admin/merchants"
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition active:scale-95 text-xs shadow"
          >
            ← Return to Admin Panel
          </Link>
        </div>
      )}

      <DashboardClientView
        user={{
          name: business.user?.name ?? user.name ?? null,
          phone: business.user?.phone ?? user.phone ?? null,
          userIdTag: business.user?.userIdTag ?? user.userIdTag ?? null,
          customerType: business.customerType ?? "ONLINE",
        }}
        business={{
          id: business.id,
          name: business.name,
          slug: business.slug,
          category: business.category,
          tagline: business.tagline,
          logoUrl: business.logoUrl,
          primaryColor: business.primaryColor,
          googleAddress: business.googleAddress,
          googleReviewUrl: business.googleReviewUrl,
          minRatingForGoogle: business.minRatingForGoogle,
          customerType: business.customerType,
          isPaid: business.isPaid,
          feedbacks: business.feedbacks,
        }}
        metrics={{
          totalViews,
          aiGenerations,
          shieldSaves,
          googleRedirects,
        }}
        reviewUrl={reviewUrl}
        qrDataUrl={qrDataUrl}
        waActivationUrl={waActivationUrl}
      />
    </div>
  );
}
