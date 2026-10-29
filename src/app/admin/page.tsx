import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  IndianRupee,
  Users,
  Receipt,
  Clock,
  Wifi,
  Store,
  ArrowUpRight,
  Building2,
  TrendingUp,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Globe,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default async function AdminOverviewPage() {
  let revenue = 0;
  let totalDeals = 0;
  let pendingDeals = 0;
  let totalMerchants = 0;
  let totalBusinesses = 0;
  let onlineDeals = 0;
  let offlineDeals = 0;
  let recentPayments: any[] = [];
  let todayRevenue = 0;
  let recentBusinesses: any[] = [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  try {
    const [
      totalRevenueResult,
      dealsCount,
      pendingCount,
      merchantsCount,
      businessesCount,
      onlineCount,
      offlineCount,
      payments,
      todayRevenueResult,
      businessesList
    ] = await Promise.all([
      prisma.upiPayment.aggregate({
        where: { status: "APPROVED" },
        _sum: { amount: true },
      }),
      prisma.upiPayment.count(),
      prisma.upiPayment.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { role: "BUSINESS_OWNER" } }),
      prisma.business.count(),
      prisma.upiPayment.count({ where: { planType: "ONLINE_DIRECT" } }),
      prisma.upiPayment.count({ where: { planType: "NEGOTIATED_DEAL" } }),
      prisma.upiPayment.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: {
            select: {
              name: true,
              businesses: { select: { name: true, slug: true, customerType: true }, take: 1 },
            },
          },
        },
      }),
      prisma.upiPayment.aggregate({
        where: { status: "APPROVED", createdAt: { gte: todayStart } },
        _sum: { amount: true },
      }),
      prisma.business.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          user: {
            select: { name: true, phone: true },
          },
        },
      }),
    ]);

    revenue = totalRevenueResult._sum.amount ?? 0;
    totalDeals = dealsCount;
    pendingDeals = pendingCount;
    totalMerchants = merchantsCount;
    totalBusinesses = businessesCount;
    onlineDeals = onlineCount;
    offlineDeals = offlineCount;
    recentPayments = payments;
    todayRevenue = todayRevenueResult._sum.amount ?? 0;
    recentBusinesses = businessesList;
  } catch (err) {
    console.error("AdminOverviewPage data fetch error:", err);
  }

  const conversionRate = totalMerchants > 0 ? ((totalDeals / totalMerchants) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Platform &amp; Client Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin master console for onboarding client businesses, tracking revenue, and managing cards.
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/merchants"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Client Store</span>
        </Link>
        <Link
          href="/admin/businesses"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 shadow-sm border border-slate-700 transition"
        >
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>All Businesses ({totalBusinesses})</span>
        </Link>
        <Link
          href="/admin/payments?status=PENDING"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 shadow-sm border border-slate-700 transition"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Verify Payments ({pendingDeals})</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Link
          href="/admin/payments?status=APPROVED"
          className="bg-gradient-to-br from-slate-800 to-slate-800/60 hover:bg-slate-750 p-5 rounded-2xl border-y border-r border-slate-700 border-l-[3px] border-l-emerald-500 shadow-sm transition-all group block cursor-pointer"
          title="Click to view all approved revenue and payments"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
              Total Revenue
            </span>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IndianRupee className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">
              ₹{revenue.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>Approved collections</span>
            <span className="text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </Link>

        {/* Total Deals */}
        <Link
          href="/admin/payments"
          className="bg-gradient-to-br from-slate-800 to-slate-800/60 hover:bg-slate-750 p-5 rounded-2xl border-y border-r border-slate-700 border-l-[3px] border-l-indigo-500 shadow-sm transition-all group block cursor-pointer"
          title="Click to view all payment transactions"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
              Total Deals
            </span>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl font-black text-white">{totalDeals}</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
              {conversionRate}% Conv.
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>UPI payment transactions</span>
            <span className="text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </Link>

        {/* Total Client Businesses */}
        <Link
          href="/admin/businesses"
          className="bg-gradient-to-br from-slate-800 to-slate-800/60 hover:bg-slate-750 p-5 rounded-2xl border-y border-r border-slate-700 border-l-[3px] border-l-blue-500 shadow-sm transition-all group block cursor-pointer"
          title="Click to manage business directory"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
              Client Businesses
            </span>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl font-black text-white">{totalBusinesses}</span>
            <span className="text-xs text-slate-400">({totalMerchants} owners)</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>Online &amp; Offline stores</span>
            <span className="text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Directory →
            </span>
          </div>
        </Link>

        {/* Today's Revenue */}
        <Link
          href="/admin/payments?status=APPROVED"
          className="bg-gradient-to-br from-slate-800 to-slate-800/60 hover:bg-slate-750 p-5 rounded-2xl border-y border-r border-slate-700 border-l-[3px] border-l-emerald-400 shadow-sm transition-all group block cursor-pointer"
          title="Click to view today's revenue"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
              Today&apos;s Revenue
            </span>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-300 transition-colors" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-300">
              ₹{todayRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>Since midnight</span>
            <span className="text-emerald-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </Link>
      </div>

      {/* Deal Channel Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Online Deals */}
        <Link
          href="/admin/payments?channel=ONLINE"
          className="bg-slate-800 hover:bg-slate-750 p-4 rounded-2xl border border-slate-700 hover:border-sky-500/50 flex items-center justify-between gap-4 transition-all group cursor-pointer"
          title="Click to view online self-serve deals"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider group-hover:text-slate-300 transition-colors">
                Online Website Deals
              </p>
              <p className="text-xl font-black text-sky-400">{onlineDeals}</p>
              <p className="text-[10px] text-slate-500">Website direct checkouts</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
        </Link>

        {/* Offline Deals */}
        <Link
          href="/admin/payments?channel=OFFLINE"
          className="bg-slate-800 hover:bg-slate-750 p-4 rounded-2xl border border-slate-700 hover:border-orange-500/50 flex items-center justify-between gap-4 transition-all group cursor-pointer"
          title="Click to view offline direct client deals"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider group-hover:text-slate-300 transition-colors">
                Offline In-Person Deals
              </p>
              <p className="text-xl font-black text-orange-400">{offlineDeals}</p>
              <p className="text-[10px] text-slate-500">Admin direct onboarded clients</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
        </Link>
      </div>

      {/* Main Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-7 bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Recent Payment Transactions
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time UPI payments from online checkouts and direct client orders.
              </p>
            </div>
            {pendingDeals > 0 && (
              <Link
                href="/admin/payments?status=PENDING"
                className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
              >
                {pendingDeals} Pending
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-700/80">
                <tr>
                  <th className="pb-2.5 font-semibold">Store / Client</th>
                  <th className="pb-2.5 font-semibold">Amount</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((pmt) => {
                    const status = pmt.status;
                    const businessName =
                      pmt.user?.businesses?.[0]?.name ||
                      pmt.user?.name ||
                      pmt.businessName ||
                      "Client Store";

                    return (
                      <tr key={pmt.id} className="hover:bg-slate-700/30 transition">
                        <td className="py-3 font-semibold text-white">
                          <div className="truncate max-w-[150px]">{businessName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {pmt.utrNumber ? `UTR: ${pmt.utrNumber.slice(-6)}` : "UPI QR"}
                          </div>
                        </td>
                        <td className="py-3 font-bold text-emerald-400 whitespace-nowrap">
                          ₹{pmt.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3">
                          {status === "APPROVED" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Approved
                            </span>
                          )}
                          {status === "PENDING" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Pending
                            </span>
                          )}
                          {status === "REJECTED" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-400 whitespace-nowrap">
                          {formatDate(pmt.createdAt)}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          {status === "PENDING" ? (
                            <Link
                              href="/admin/payments?status=PENDING"
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold inline-flex items-center gap-1 transition shadow-sm"
                            >
                              Verify
                            </Link>
                          ) : (
                            <Link
                              href="/admin/payments"
                              className="px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] font-bold inline-flex items-center gap-1 transition"
                            >
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-end">
            <Link
              href="/admin/payments"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 group"
            >
              <span>View All Payments →</span>
            </Link>
          </div>
        </div>

        {/* Recently Onboarded Stores */}
        <div className="lg:col-span-5 bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              Recently Onboarded Stores
            </h2>
            <Link
              href="/admin/merchants"
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
            >
              + Onboard Store
            </Link>
          </div>
          <div className="space-y-3">
            {recentBusinesses.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No stores onboarded yet.
              </div>
            ) : (
              recentBusinesses.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-slate-750/50 border border-slate-700/60 hover:border-slate-600 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: b.primaryColor || "#4f46e5" }}
                    >
                      {b.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{b.name}</span>
                        {b.customerType === "ONLINE" ? (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Online
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            Offline
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Owner: {b.user?.name || "Merchant"} • {b.user?.phone || "Phone"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`/r/${b.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                      title="Open Public Card"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-end">
            <Link
              href="/admin/businesses"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition flex items-center gap-1 group"
            >
              <span>View All Businesses →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
