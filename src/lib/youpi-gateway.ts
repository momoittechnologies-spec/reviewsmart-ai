/**
 * YouPI-PG Gateway Engine for ReviewSmart AI
 * Self-Hosted 0% Transaction Fee UPI Gateway Architecture
 * Inspired by youpi-pg/YouPI-PG
 */

import { buildUpiLinks, UpiLinkBundle } from "./upi-engine";
import { prisma } from "./prisma";

export interface CreateYouPiOrderInput {
  userId: string;
  businessId?: string;
  amount: number;
  planType?: string;
  customerPhone?: string;
  agentId?: string;
  agentCode?: string;
  packageTier?: string;
  note?: string;
  payeeUpiId?: string;
  payeeName?: string;
  category?: string;
}

export interface YouPiOrderResult {
  orderId: string;
  paymentId: string;
  amount: number;
  utrPlaceholder: string;
  expiresAt: Date;
  upiLinks: UpiLinkBundle;
}

// Default Platform Fallback VPA if not provided
const PLATFORM_UPI_ID = process.env.NEXT_PUBLIC_PLATFORM_UPI_ID || "7287867584@cub";
const PLATFORM_PAYEE_NAME = process.env.NEXT_PUBLIC_PLATFORM_PAYEE_NAME || "ReviewSmart AI";

/**
 * Creates a deterministic, single-session YouPI-PG order
 */
export async function createYouPiOrder(input: CreateYouPiOrderInput): Promise<YouPiOrderResult> {
  const orderRef = `RS${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
  const payeeId = (input.payeeUpiId || PLATFORM_UPI_ID).trim();
  const payeeName = (input.payeeName || PLATFORM_PAYEE_NAME).trim();

  // Create UpiPayment record in PENDING state
  const payment = await prisma.upiPayment.create({
    data: {
      userId: input.userId,
      businessId: input.businessId,
      agentId: input.agentId,
      agentCode: input.agentCode || "DIRECT_ONLINE",
      planType: input.planType || "ONLINE_DIRECT",
      amount: input.amount,
      utrNumber: orderRef, // Temporary reference until real bank UTR is captured
      customerPhone: input.customerPhone,
      status: "PENDING",
      packageTier: input.packageTier || "EXECUTIVE_STANDEE",
      notes: input.note || `YouPI-PG Dynamic Session: ${orderRef}`,
    },
  });

  const upiLinks = buildUpiLinks({
    upiId: payeeId,
    payeeName,
    amount: input.amount,
    category: input.category || "Business Services",
    transactionRef: orderRef,
    transactionNote: `ReviewSmart AI Order ${orderRef}`,
  });

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute validity window

  return {
    orderId: orderRef,
    paymentId: payment.id,
    amount: input.amount,
    utrPlaceholder: orderRef,
    expiresAt,
    upiLinks,
  };
}

/**
 * Verifies and approves a YouPI payment via observed bank UTR / SMS notification
 */
export async function reconcileYouPiPayment({
  utr,
  amount,
  orderRef,
  customerPhone,
  rawNotification,
}: {
  utr: string;
  amount?: number;
  orderRef?: string;
  customerPhone?: string;
  rawNotification?: string;
}) {
  const cleanUtr = utr.trim();

  // 1. Find pending payment by order reference or UTR
  let payment = null;

  if (orderRef) {
    payment = await prisma.upiPayment.findFirst({
      where: {
        utrNumber: orderRef,
        status: "PENDING",
      },
    });
  }

  if (!payment) {
    payment = await prisma.upiPayment.findFirst({
      where: {
        OR: [
          { utrNumber: cleanUtr },
          ...(customerPhone ? [{ customerPhone }] : []),
        ],
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!payment && amount) {
    // Match by amount in last 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    payment = await prisma.upiPayment.findFirst({
      where: {
        amount: { gte: amount - 1, lte: amount + 1 },
        status: "PENDING",
        createdAt: { gte: thirtyMinsAgo },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!payment) {
    return { success: false, error: "No matching pending payment found." };
  }

  // 2. Approve payment and record UTR
  const updated = await prisma.upiPayment.update({
    where: { id: payment.id },
    data: {
      status: "APPROVED",
      utrNumber: cleanUtr || payment.utrNumber,
      notes: `${payment.notes || ""} | Verified via YouPI-PG Observer: ${rawNotification || "Auto-matched"}`,
    },
  });

  // 3. Activate associated business if linked
  if (payment.businessId) {
    await prisma.business.update({
      where: { id: payment.businessId },
      data: { isPaid: true },
    });
  }

  return {
    success: true,
    paymentId: updated.id,
    businessId: payment.businessId,
    status: "APPROVED",
  };
}
