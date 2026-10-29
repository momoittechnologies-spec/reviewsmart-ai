import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      utrNumber,
      amount,
      planType,
      packageTier,
      customerPhone,
      screenshotUrl,
    } = await req.json();

    let cleanUtr = String(utrNumber || "").trim();
    const cleanScreenshot = screenshotUrl ? String(screenshotUrl).trim() : null;

    if (!cleanUtr && !cleanScreenshot) {
      return NextResponse.json(
        { error: "Please enter your 12-digit UPI UTR number or upload a screenshot of your payment receipt." },
        { status: 400 }
      );
    }

    if (!cleanUtr && cleanScreenshot) {
      // Auto-assign a traceable provisional reference for screenshot-first verification
      cleanUtr = `SCREENSHOT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    } else if (cleanUtr && cleanUtr.length < 6) {
      return NextResponse.json(
        { error: "Please enter a valid 12-digit UPI Reference / UTR Number" },
        { status: 400 }
      );
    }

    // Guard against duplicate UTR submission
    const existingPayment = await prisma.upiPayment.findFirst({
      where: { utrNumber: cleanUtr },
    });

    if (existingPayment) {
      if (existingPayment.status === "APPROVED") {
        return NextResponse.json(
          { error: "This UTR Number has already been verified and used. If you made a new payment, please submit the new UTR or screenshot." },
          { status: 400 }
        );
      }
      if (existingPayment.status === "PENDING") {
        return NextResponse.json(
          { error: "This UTR Number is already under verification. Our team is reviewing it." },
          { status: 400 }
        );
      }
    }

    const business = await prisma.business.findFirst({
      where: { userId: user.id },
    });

    const paymentAmount = Number(amount) || 2999;
    const resolvedTier =
      packageTier ||
      (paymentAmount >= 2800
        ? "ALL_IN_ONE_HUB"
        : paymentAmount >= 2200
        ? "EXECUTIVE_STANDEE"
        : "STARTER_PVC");

    const payment = await prisma.upiPayment.create({
      data: {
        userId: user.id,
        businessId: business?.id,
        agentId: null,
        agentCode: null,
        commission: null,
        planType: planType || "ONLINE_DIRECT",
        packageTier: resolvedTier,
        amount: paymentAmount,
        utrNumber: cleanUtr,
        customerPhone: customerPhone || null,
        screenshotUrl: cleanScreenshot,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      message: "Payment submitted successfully! Your account will be verified shortly.",
    });
  } catch (error) {
    console.error("Payment submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment details" },
      { status: 500 }
    );
  }
}
