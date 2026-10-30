"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import AdminLogoutButton from "./AdminLogoutButton";

interface AdminSidebarFooterProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function AdminSidebarFooter({ user }: AdminSidebarFooterProps) {
  const displayName = user.name || "Super Admin";
  const displayEmail = user.email || "admin@reviewsmart.online";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA";

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/90 space-y-2.5">
      {/* Admin Profile Pill */}
      <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-center gap-2.5 shadow-inner">
        {/* Avatar with Status Pulse */}
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-600/30">
            {initials}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-sm"
            title="Active Admin Session"
          />
        </div>

        {/* User Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-slate-200 truncate">
              {displayName}
            </p>
            <span className="shrink-0 text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Admin
            </span>
          </div>
          <p
            className="text-[10px] text-slate-400 truncate mt-0.5 font-mono"
            title={displayEmail}
          >
            {displayEmail}
          </p>
        </div>
      </div>

      {/* Primary Action: Sign Out */}
      <AdminLogoutButton variant="default" />

      {/* Secondary Action: Store Dashboard Link */}
      <div className="pt-0.5 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-medium transition-colors group"
        >
          <span>View Store Dashboard</span>
          <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
