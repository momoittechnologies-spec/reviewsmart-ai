import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EVENTS = new Set([
  "product_view",
  "sample_language_toggle",
  "order_button_tap",
  "checkout_start",
  "purchase_confirmed",
  "demo_open",
  "whatsapp_tap",
]);

/**
 * Lightweight homepage conversion funnel measurement endpoint.
 * Kept isolated from merchant `ReviewAnalytics` so marketing traffic never skews merchant stats.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const event = typeof body?.event === "string" ? body.event : "";
    if (!ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ error: "Invalid funnel event" }, { status: 400 });
    }

    const payload = {
      event,
      planId: typeof body?.planId === "string" ? body.planId : undefined,
      price: typeof body?.price === "number" ? body.price : undefined,
      language: typeof body?.language === "string" ? body.language : undefined,
      source: typeof body?.source === "string" ? body.source : "homepage",
      ts: new Date().toISOString(),
    };

    console.info("[FUNNEL]", JSON.stringify(payload));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
