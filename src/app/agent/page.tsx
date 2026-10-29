"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (data.user?.role === "SUPER_ADMIN") {
          router.replace("/admin/merchants");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      <p className="text-xs font-semibold">Redirecting to Platform Portal...</p>
    </div>
  );
}
