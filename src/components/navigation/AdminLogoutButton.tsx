"use client";

import React, { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

interface AdminLogoutButtonProps {
  variant?: "default" | "compact" | "icon";
  className?: string;
}

export default function AdminLogoutButton({
  variant = "default",
  className = "",
}: AdminLogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Force a full page reload to clear server and client state
      window.location.href = "/login";
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        title="Sign Out of Admin Console"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/30 text-xs font-semibold transition-all duration-150 disabled:opacity-50 active:scale-95 ${className}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
        ) : (
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
        )}
        <span>{loading ? "Exiting..." : "Logout"}</span>
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        title="Sign Out of Admin Console"
        className={`p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/30 transition-all duration-150 disabled:opacity-50 active:scale-95 ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
        ) : (
          <LogOut className="w-4 h-4 text-rose-400" />
        )}
      </button>
    );
  }

  // default: full-width sidebar button
  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`group w-full py-2.5 px-3 rounded-xl bg-slate-800/70 hover:bg-rose-950/30 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm disabled:opacity-50 active:scale-[0.98] ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
          <span>Signing Out...</span>
        </>
      ) : (
        <>
          <LogOut className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 text-slate-400 group-hover:text-rose-400" />
          <span>Sign Out</span>
        </>
      )}
    </button>
  );
}
