import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminMobileBottomNav from "@/components/navigation/AdminMobileBottomNav";
import AdminDesktopNav from "@/components/navigation/AdminDesktopNav";
import AdminSidebarFooter from "@/components/navigation/AdminSidebarFooter";
import AdminLogoutButton from "@/components/navigation/AdminLogoutButton";
import BrandLogo from "@/components/brand/BrandLogo";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28 lg:pb-8">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between no-print shadow-sm shadow-black/20">
        <div className="flex items-center gap-2">
          <BrandLogo href="/admin" size="sm" theme="dark" />
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/80 transition"
          >
            Store View
          </Link>
          <AdminLogoutButton variant="compact" />
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Admin Sidebar (Desktop only) */}
          <aside className="hidden lg:flex lg:col-span-1 flex-col gap-3 no-print bg-slate-900 border border-slate-800/90 p-4 rounded-3xl h-fit sticky top-6 shadow-xl shadow-black/30">
            {/* Brand Header */}
            <div className="mb-2">
              <div className="mb-2.5">
                <BrandLogo href="/admin" size="sm" theme="dark" />
              </div>
              <h2 className="text-xs font-bold text-slate-300">Admin Console</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Manage merchants, agents &amp; platform revenue
              </p>
            </div>

            {/* Navigation (with live active link highlighting) */}
            <AdminDesktopNav />

            {/* Admin Profile & Logout Footer */}
            <AdminSidebarFooter user={user} />
          </aside>

          {/* Admin Main View */}
          <main className="lg:col-span-4 pb-6">{children}</main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminMobileBottomNav />
    </div>
  );
}
