import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ error: "Cron endpoint decommissioned." }, { status: 410 });
}
