import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, hashPin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { resolveGoogleMapsUrl } from "@/lib/googleMapsResolver";
import { getPackageById } from "@/lib/packages";
import {
  getMerchantMissingItems,
  normalizePhone10,
  syncBusinessActivation,
} from "@/lib/merchantActivation";

export const dynamic = "force-dynamic";

/**
 * POST /api/agent/convert
 * Idempotent Lead -> Merchant & Order conversion endpoint.
 * - Reuses `LeadCapture.convertedBusinessId` & `LeadCapture.convertedOrderId` on retries or resume.
 * - Supports saving partial setup (e.g. missing logo or Google link) and surfaces plain-language checklist items.
 * - Locks sales attribution (`UpiPayment.agentId` / `agentCode`) on order creation.
 * - Uses existing admin payment verification flow (`PENDING` until manager confirms, or confirmed immediately by SUPER_ADMIN with reference).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      leadId,
      businessName,
      category,
      phone,
      googleAddress,
      googleReviewUrl,
      logoUrl,
      packageTier = "STARTER_PVC",
      utrNumber,
      paymentAmount,
      paymentNotes,
      managerConfirmPayment,
    } = body;

    if (!leadId) {
      return NextResponse.json({ error: "leadId is required." }, { status: 400 });
    }

    const lead = await prisma.leadCapture.findUnique({ where: { id: String(leadId) } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    if (user.role === "MARKETING_AGENT" && lead.assignedAgentId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only convert leads assigned to you." },
        { status: 403 }
      );
    }

    const pkg = getPackageById(String(packageTier || "STARTER_PVC"));
    const finalName = String(businessName || lead.businessName || "").trim();
    const cleanPhone = normalizePhone10(phone || lead.phone) || lead.phone || "";

    if (!finalName) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }

    // Resolve Google review URL into Place ID if provided
    let resolvedPlaceId: string | undefined;
    let resolvedReviewUrl: string | null | undefined =
      googleReviewUrl !== undefined
        ? googleReviewUrl
          ? String(googleReviewUrl).trim()
          : null
        : undefined;

    if (resolvedReviewUrl && !resolvedReviewUrl.includes("writereview?placeid=")) {
      try {
        const resolved = await resolveGoogleMapsUrl(resolvedReviewUrl);
        if (resolved.placeId) {
          resolvedPlaceId = resolved.placeId;
          resolvedReviewUrl = resolved.googleReviewUrl;
        }
      } catch (err) {
        console.warn("Google review URL resolve failed during agent convert:", err);
      }
    }

    // Determine credited agent (locked at order creation so future lead reassignment preserves attribution)
    let creditAgentId = lead.assignedAgentId || user.id;
    let creditAgentCode: string | null = user.agentCode || user.userIdTag || null;
    if (creditAgentId !== user.id) {
      const creditAgent = await prisma.user.findUnique({
        where: { id: creditAgentId },
        select: { id: true, agentCode: true, userIdTag: true },
      });
      if (creditAgent) {
        creditAgentCode = creditAgent.agentCode || creditAgent.userIdTag || null;
      } else {
        creditAgentId = user.id;
      }
    }

    // 1) Find or reuse Business via stable `lead.convertedBusinessId`
    let business = lead.convertedBusinessId
      ? await prisma.business.findUnique({ where: { id: lead.convertedBusinessId } })
      : null;

    if (business) {
      business = await prisma.business.update({
        where: { id: business.id },
        data: {
          name: finalName,
          packageTier: pkg.id,
          ...(category !== undefined && { category: category ? String(category).trim() : null }),
          ...(googleAddress !== undefined && {
            googleAddress: googleAddress ? String(googleAddress).trim() : null,
          }),
          ...(cleanPhone && { phone: cleanPhone, whatsapp: cleanPhone }),
          ...(resolvedReviewUrl !== undefined && { googleReviewUrl: resolvedReviewUrl }),
          ...(resolvedPlaceId !== undefined && { googlePlaceId: resolvedPlaceId }),
          ...(logoUrl !== undefined && { logoUrl: logoUrl ? String(logoUrl).trim() : null }),
        },
      });
    } else {
      // Find existing merchant user by phone or create one cleanly
      const merchantEmail = cleanPhone
        ? `${cleanPhone}@merchant.reviewsmart.local`
        : `merchant_${lead.id}@merchant.reviewsmart.local`;

      let merchantUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(cleanPhone ? [{ phone: cleanPhone }, { userIdTag: cleanPhone }] : []),
            { email: merchantEmail },
          ],
        },
      });

      if (!merchantUser) {
        const defaultPinHash = await hashPin("1234");
        merchantUser = await prisma.user.create({
          data: {
            email: merchantEmail,
            name: finalName,
            phone: cleanPhone || null,
            userIdTag: cleanPhone || `BIZ-${lead.id.slice(-6).toUpperCase()}`,
            pinCode: defaultPinHash,
            password: defaultPinHash,
            role: "BUSINESS_OWNER",
            referredBy: creditAgentId,
            agentCode: creditAgentCode,
            isActive: true,
          },
        });
      }

      const baseSlug = slugify(finalName) || `merchant-${Date.now()}`;
      const existingSlug = await prisma.business.findUnique({ where: { slug: baseSlug } });
      const uniqueSlug = existingSlug
        ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
        : baseSlug;

      business = await prisma.business.create({
        data: {
          userId: merchantUser.id,
          name: finalName,
          slug: uniqueSlug,
          category: String(category || lead.category || "Local Business").trim(),
          googleAddress:
            String(
              googleAddress ||
                [lead.locality, lead.city].filter(Boolean).join(", ") ||
                ""
            ).trim() || null,
          phone: cleanPhone || null,
          whatsapp: cleanPhone || null,
          packageTier: pkg.id,
          logoUrl: logoUrl ? String(logoUrl).trim() : null,
          googleReviewUrl: resolvedReviewUrl || null,
          googlePlaceId: resolvedPlaceId || null,
          isPaid: false,
          activatedAt: null,
          customerType: "FIELD_ONBOARDED",
        },
      });
    }

    // 2) Idempotent Order (`UpiPayment`) creation / resume
    let order = lead.convertedOrderId
      ? await prisma.upiPayment.findUnique({ where: { id: lead.convertedOrderId } })
      : null;

    const cleanUtr = utrNumber ? String(utrNumber).trim() : "";
    const normalizedAmount = Math.max(
      2999,
      Number(paymentAmount) || pkg.price || 2999
    );

    if (!order && cleanUtr) {
      // Check if retry already submitted this UTR for the same business
      const existingByUtr = await prisma.upiPayment.findFirst({
        where: { businessId: business.id, utrNumber: cleanUtr },
      });

      if (existingByUtr) {
        order = existingByUtr;
      } else {
        const shouldAutoConfirm =
          user.role === "SUPER_ADMIN" && Boolean(managerConfirmPayment);
        const now = new Date();

        order = await prisma.upiPayment.create({
          data: {
            userId: business.userId,
            businessId: business.id,
            agentId: creditAgentId,
            agentCode: creditAgentCode,
            planType: "NEGOTIATED_DEAL",
            amount: normalizedAmount,
            utrNumber: cleanUtr,
            customerPhone: cleanPhone || null,
            packageTier: pkg.id,
            status: shouldAutoConfirm ? "APPROVED" : "PENDING",
            confirmedAt: shouldAutoConfirm ? now : null,
            verifiedBy: shouldAutoConfirm ? user.id : null,
            notes: paymentNotes
              ? String(paymentNotes).trim()
              : `Captured via Agent Portal (${creditAgentCode || user.name || "Staff"})`,
          },
        });

        if (shouldAutoConfirm) {
          business = await prisma.business.update({
            where: { id: business.id },
            data: { isPaid: true, packageTier: pkg.id },
          });
        }
      }
    } else if (order && cleanUtr && order.status === "PENDING") {
      // Allow updating UTR/notes cleanly if still pending confirmation
      order = await prisma.upiPayment.update({
        where: { id: order.id },
        data: {
          utrNumber: cleanUtr,
          packageTier: pkg.id,
          amount: normalizedAmount,
          ...(paymentNotes ? { notes: String(paymentNotes).trim() } : {}),
        },
      });
    }

    // 3) Sync Business activation timestamp cleanly
    const activation = await syncBusinessActivation(business.id);
    const refreshedBiz = await prisma.business.findUnique({
      where: { id: business.id },
      select: {
        id: true,
        name: true,
        slug: true,
        packageTier: true,
        logoUrl: true,
        googleReviewUrl: true,
        googleAddress: true,
        category: true,
        phone: true,
        isPaid: true,
        activatedAt: true,
      },
    });

    const missingItems = refreshedBiz
      ? getMerchantMissingItems(refreshedBiz)
      : activation.missingItems;

    // 4) Persist stable conversion IDs back onto LeadCapture
    const updatedLead = await prisma.leadCapture.update({
      where: { id: lead.id },
      data: {
        convertedBusinessId: business.id,
        ...(order ? { convertedOrderId: order.id } : {}),
        status: order ? "CONVERTED" : lead.status === "NEW" ? "DEMO_REQUESTED" : lead.status,
        ...(order?.status === "APPROVED" ? { confirmedPaidAt: order.confirmedAt || new Date() } : {}),
        priority: missingItems.length > 0 ? "FOLLOW_UP_TODAY" : "NORMAL",
        priorityReason:
          missingItems.length > 0
            ? missingItems[0]
            : "Merchant onboarding complete",
      },
    });

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "STATUS_CHANGE",
        outcome: order ? "ORDER_RECORDED" : "ONBOARDING_SAVED",
        notes: order
          ? `Merchant "${business.name}" (${business.slug}) linked with ${pkg.name} order (UTR/Ref: ${order.utrNumber}, Status: ${order.status}).${
              missingItems.length > 0 ? ` Next needed: ${missingItems.join(", ")}.` : " All setup items complete!"
            }`
          : `Saved partial merchant setup for "${business.name}" (/r/${business.slug}). Next: ${
              missingItems.join(", ") || "Ready"
            }.`,
        performedBy: user.agentCode
          ? `${user.name} (${user.agentCode})`
          : user.name || user.email,
      },
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      business: refreshedBiz,
      order,
      missingItems,
      isActivated: activation.isActivated,
      qrUrl: `/r/${business.slug}`,
      message:
        missingItems.length === 0
          ? `Merchant ${business.name} is LIVE at /r/${business.slug}!`
          : `Saved progress for ${business.name}. Next needed: ${missingItems[0]}.`,
    });
  } catch (error) {
    console.error("POST /api/agent/convert error:", error);
    return NextResponse.json(
      { error: "Failed to save merchant onboarding conversion." },
      { status: 500 }
    );
  }
}
