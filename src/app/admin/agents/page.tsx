"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAgentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/merchants");
  }, [router]);

  return (
    <div className="p-12 text-center text-slate-400">
      <p className="text-xs">Redirecting to Client Stores &amp; Onboarding...</p>
    </div>
  );
}
