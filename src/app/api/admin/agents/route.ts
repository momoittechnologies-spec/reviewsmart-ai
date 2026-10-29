import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ error: "This endpoint has been decommissioned." }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ error: "This endpoint has been decommissioned." }, { status: 410 });
}
export async function DELETE() {
  return NextResponse.json({ error: "This endpoint has been decommissioned." }, { status: 410 });
}
