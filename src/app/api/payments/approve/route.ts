import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncBusinessActivation } from "@/lib/merchantActivation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, action, confirmationNote } = await req.json(); // action: "APPROVE" | "REJECT"

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
      const confirmedAt = new Date();
      const notePrefix = payment.notes ? `${payment.notes} | ` : "";
      const auditSuffix = confirmationNote
        ? `${notePrefix}Verified by ${user.name || user.email}: ${String(confirmationNote).trim()}`
        : payment.notes;

      await prisma.upiPayment.update({
        where: { id: paymentId },
        data: {
          status: "APPROVED",
          confirmedAt,
          verifiedBy: user.id,
          ...(auditSuffix !== undefined && { notes: auditSuffix }),
        },
      });

      // Mark business as paid & check if setup (logo + Google review URL) is already complete
      let activationResult = { isActivated: false, missingItems: [] as string[] };
      if (payment.businessId) {
        await prisma.business.update({
          where: { id: payment.businessId },
          data: {
            isPaid: true,
            ...(payment.packageTier ? { packageTier: payment.packageTier } : {}),
          },
        });
        const synced = await syncBusinessActivation(payment.businessId);
        activationResult = {
          isActivated: synced.isActivated,
          missingItems: synced.missingItems,
        };
      }

      // Update linked LeadCapture record if this order was created from a lead
      const linkedLead = await prisma.leadCapture.findFirst({
        where: {
          OR: [
            { convertedOrderId: payment.id },
            ...(payment.businessId ? [{ convertedBusinessId: payment.businessId }] : []),
          ],
        },
      });

      if (linkedLead) {
        await prisma.leadCapture.update({
          where: { id: linkedLead.id },
          data: {
            confirmedPaidAt: confirmedAt,
            status: "CONVERTED",
          },
        });

        await prisma.leadActivity.create({
          data: {
            leadId: linkedLead.id,
            type: "STATUS_CHANGE",
            outcome: "PAYMENT_CONFIRMED",
            notes: `Payment ₹${payment.amount} (UTR: ${payment.utrNumber}) verified by manager.${
              activationResult.isActivated
                ? " Merchant standee activated."
                : activationResult.missingItems.length > 0
                ? ` Pending setup: ${activationResult.missingItems.join(", ")}.`
                : ""
            }`,
            performedBy: user.name || user.email,
          },
        });
      }

      return NextResponse.json({
        success: true,
        isActivated: activationResult.isActivated,
        missingItems: activationResult.missingItems,
        message: activationResult.isActivated
          ? "Payment approved and merchant standee is now LIVE!"
          : "Payment approved! Merchant is awaiting remaining setup assets before activation.",
      });
    } else if (action === "REJECT") {
      await prisma.upiPayment.update({
        where: { id: paymentId },
        data: {
          status: "REJECTED",
          verifiedBy: user.id,
        },
      });

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
