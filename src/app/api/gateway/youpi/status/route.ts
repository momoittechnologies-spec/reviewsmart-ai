import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const paymentId = searchParams.get("paymentId");

    if (!orderId && !paymentId) {
      return NextResponse.json({ error: "orderId or paymentId is required" }, { status: 400 });
    }

    const payment = await prisma.upiPayment.findFirst({
      where: {
        OR: [
          ...(paymentId ? [{ id: paymentId }] : []),
          ...(orderId ? [{ utrNumber: orderId }] : []),
        ],
      },
      select: {
        id: true,
        utrNumber: true,
        amount: true,
        status: true,
        createdAt: true,
        businessId: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      paymentId: payment.id,
      orderId: payment.utrNumber,
      amount: payment.amount,
      status: payment.status,
      isApproved: payment.status === "APPROVED",
    });
  } catch (error) {
    console.error("YouPI status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
