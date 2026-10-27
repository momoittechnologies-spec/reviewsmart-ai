import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await prisma.platformSetting.findUnique({
      where: { id: "default" },
    });
    // Auto-migrate legacy UPI ID to official YesBank/PhonePe native handle
    if (settings && (settings.upiId === "momopedeals@oksbi" || !settings.upiId)) {
      try {
        settings = await prisma.platformSetting.update({
          where: { id: "default" },
          data: {
            upiId: "8639831132-2@ybl",
            supportWhatsapp: settings.supportWhatsapp || "+918639831132",
            upiPayeeName: settings.upiPayeeName || "Damerla Mohan",
          },
        });
      } catch (e) {
        console.warn("Auto-migrate legacy UPI ID in DB:", e);
      }
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings get error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updated = await prisma.platformSetting.upsert({
      where: { id: "default" },
      update: {
        platformName: body.platformName || "ReviewSmart AI",
        supportEmail: body.supportEmail || "momopedeals@gmail.com",
        supportWhatsapp: body.supportWhatsapp || "+918639831132",
        currencySymbol: body.currencySymbol || "₹",
        upiId: body.upiId || "8639831132-2@ybl",
        upiPayeeName: body.upiPayeeName || "Damerla Mohan",
        minNegotiatedPrice: Number(body.minNegotiatedPrice) || 1999,
        commissionRate: Number(body.commissionRate) || 0.40,
      },
      create: {
        id: "default",
        platformName: body.platformName || "ReviewSmart AI",
        supportEmail: body.supportEmail || "momopedeals@gmail.com",
        supportWhatsapp: body.supportWhatsapp || "+918639831132",
        currencySymbol: body.currencySymbol || "₹",
        upiId: body.upiId || "8639831132-2@ybl",
        upiPayeeName: body.upiPayeeName || "Damerla Mohan",
        minNegotiatedPrice: Number(body.minNegotiatedPrice) || 1999,
        commissionRate: Number(body.commissionRate) || 0.40,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
