import { NextRequest, NextResponse } from "next/server";
import { reconcileYouPiPayment } from "@/lib/youpi-gateway";

const WEBHOOK_SECRET = process.env.YOUPI_WEBHOOK_SECRET || "reviewsmart_youpi_sec_2026";

/**
 * Webhook listener for YouPI-PG Android Observer (com.youpi.observer)
 * or any bank SMS forwarder.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-youpi-secret") || req.headers.get("authorization");
    const body = await req.json().catch(() => ({}));

    // Verify secret if provided
    const providedSecret = authHeader?.replace("Bearer ", "") || body.secret;
    if (WEBHOOK_SECRET && providedSecret && providedSecret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { utr, rrn, amount, orderRef, customerPhone, rawNotification, rawText } = body;
    const resolvedUtr = utr || rrn;

    if (!resolvedUtr && !orderRef) {
      return NextResponse.json(
        { error: "utr or orderRef is required for reconciliation." },
        { status: 400 }
      );
    }

    const result = await reconcileYouPiPayment({
      utr: resolvedUtr || "",
      amount: amount ? Number(amount) : undefined,
      orderRef,
      customerPhone,
      rawNotification: rawNotification || rawText,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully reconciled and approved.",
      paymentId: result.paymentId,
      status: result.status,
    });
  } catch (error: any) {
    console.error("YouPI webhook reconciliation error:", error);
    return NextResponse.json(
      { error: "Internal server error during payment reconciliation." },
      { status: 500 }
    );
  }
}
