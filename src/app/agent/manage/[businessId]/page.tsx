"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentManageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/merchants");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      <p className="text-xs font-semibold">Redirecting to Merchant Management...</p>
    </div>
  );
}
