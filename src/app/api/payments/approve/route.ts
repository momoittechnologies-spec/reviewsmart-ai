import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, action } = await req.json(); // action: "APPROVE" | "REJECT"

    if (!paymentId || !action) {
      return NextResponse.json({ error: "Payment ID and action are required." }, { status: 400 });
    }

    const payment = await prisma.upiPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    if (action === "APPROVE") {
      // Update payment status
      await prisma.upiPayment.update({
        where: { id: paymentId },
        data: {
          status: "APPROVED",
          commission: null, // No agent commission — admin-only model
        },
      });

      // Auto-activate the business card & update package tier
      if (payment.businessId) {
        await prisma.business.update({
          where: { id: payment.businessId },
          data: {
            isPaid: true,
            ...(payment.packageTier ? { packageTier: payment.packageTier } : {}),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Payment approved! Business card is now LIVE.",
      });
    } else if (action === "REJECT") {
      await prisma.upiPayment.update({
        where: { id: paymentId },
        data: { status: "REJECTED" },
      });

      // Keep business as isPaid = false (stays inactive)
      return NextResponse.json({ success: true, message: "Payment rejected. Business card remains inactive." });
    } else {
      return NextResponse.json({ error: "Invalid action. Use APPROVE or REJECT." }, { status: 400 });
    }
  } catch (error) {
    console.error("Approve payment error:", error);
    return NextResponse.json(
      { error: "Failed to process payment action." },
      { status: 500 }
    );
  }
}
