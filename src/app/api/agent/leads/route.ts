import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMerchantMissingItems, normalizePhone10 } from "@/lib/merchantActivation";

export const dynamic = "force-dynamic";

export interface OnboardingSummary {
  businessId: string;
  businessName: string;
  slug: string;
  packageTier: string;
  logoUrl: string | null;
  googleReviewUrl: string | null;
  googleAddress: string | null;
  category: string | null;
  phone: string | null;
  isPaid: boolean;
  activatedAt: string | null;
  orderId: string | null;
  paymentStatus: string | null;
  utrNumber: string | null;
  amount: number | null;
  missingItems: string[];
}

/**
 * GET /api/agent/leads
 * Mobile-first Today queue + searchable My Leads list with strict server-side RBAC.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const agentFilter = searchParams.get("agentId") || "ALL";
    const statusFilter = searchParams.get("status") || "ALL";

    const andConditions: Prisma.LeadCaptureWhereInput[] = [];
    if (!isSuperAdmin) {
      andConditions.push({ assignedAgentId: user.id });
    } else if (agentFilter === "UNASSIGNED") {
      andConditions.push({ assignedAgentId: null });
    } else if (agentFilter !== "ALL") {
      andConditions.push({ assignedAgentId: agentFilter });
    }

    if (statusFilter !== "ALL") {
      andConditions.push({ status: statusFilter });
    }

    if (search) {
      andConditions.push({
        OR: [
          { businessName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { locality: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const leads = await prisma.leadCapture.findMany({
      where: andConditions.length > 0 ? { AND: andConditions } : {},
      orderBy: [{ nextActionDue: "asc" }, { updatedAt: "desc" }],
      take: 250,
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 25,
        },
      },
    });

    // Load linked businesses & orders for onboarding progress badges
    const bizIds = leads
      .map((l) => l.convertedBusinessId)
      .filter((id): id is string => Boolean(id));
    const orderIds = leads
      .map((l) => l.convertedOrderId)
      .filter((id): id is string => Boolean(id));

    const [businesses, orders, teamAgents] = await Promise.all([
      bizIds.length > 0
        ? prisma.business.findMany({
            where: { id: { in: bizIds } },
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
          })
        : Promise.resolve([]),
      orderIds.length > 0
        ? prisma.upiPayment.findMany({
            where: { id: { in: orderIds } },
            select: {
              id: true,
              status: true,
              utrNumber: true,
              amount: true,
            },
          })
        : Promise.resolve([]),
      isSuperAdmin
        ? prisma.user.findMany({
            where: { role: "MARKETING_AGENT", isActive: true },
            orderBy: { name: "asc" },
            select: { id: true, name: true, agentCode: true },
          })
        : Promise.resolve([]),
    ]);

    const bizMap = new Map(businesses.map((b) => [b.id, b]));
    const orderMap = new Map(orders.map((o) => [o.id, o]));

    const now = new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const enriched = leads.map((lead) => {
      const biz = lead.convertedBusinessId ? bizMap.get(lead.convertedBusinessId) : undefined;
      const order = lead.convertedOrderId ? orderMap.get(lead.convertedOrderId) : undefined;
      const missingItems = biz ? getMerchantMissingItems(biz) : [];

      const onboardingSummary: OnboardingSummary | null = biz
        ? {
            businessId: biz.id,
            businessName: biz.name,
            slug: biz.slug,
            packageTier: biz.packageTier,
            logoUrl: biz.logoUrl,
            googleReviewUrl: biz.googleReviewUrl,
            googleAddress: biz.googleAddress,
            category: biz.category,
            phone: biz.phone,
            isPaid: biz.isPaid,
            activatedAt: biz.activatedAt ? biz.activatedAt.toISOString() : null,
            orderId: order?.id || null,
            paymentStatus: order?.status || null,
            utrNumber: order?.utrNumber || null,
            amount: order?.amount ?? null,
            missingItems,
          }
        : null;

      let bucket: "OVERDUE" | "TODAY" | "NEEDS_ONBOARDING" | "UPCOMING" | "DONE" = "UPCOMING";

      if (lead.status === "LOST" || lead.doNotContact) {
        bucket = "DONE";
      } else if (biz && (!biz.activatedAt || missingItems.length > 0)) {
        // Check if there's an even earlier overdue follow-up before conversion, else put in NEEDS_ONBOARDING
        if (
          lead.status !== "CONVERTED" &&
          lead.nextActionDue &&
          new Date(lead.nextActionDue) < now
        ) {
          bucket = "OVERDUE";
        } else {
          bucket = "NEEDS_ONBOARDING";
        }
      } else if (lead.status === "CONVERTED" && (!biz || biz.activatedAt)) {
        bucket = "DONE";
      } else if (lead.nextActionDue && new Date(lead.nextActionDue) < now) {
        bucket = "OVERDUE";
      } else if (
        (lead.nextActionDue && new Date(lead.nextActionDue) <= endOfToday) ||
        lead.priority === "FOLLOW_UP_TODAY" ||
        lead.priority === "DEMO_REQUESTED"
      ) {
        bucket = "TODAY";
      }

      return {
        ...lead,
        bucket,
        onboardingSummary,
      };
    });

    const overdue = enriched
      .filter((l) => l.bucket === "OVERDUE")
      .sort(
        (a, b) =>
          new Date(a.nextActionDue || a.createdAt).getTime() -
          new Date(b.nextActionDue || b.createdAt).getTime()
      );
    const todayDue = enriched.filter((l) => l.bucket === "TODAY");
    const needsOnboarding = enriched.filter((l) => l.bucket === "NEEDS_ONBOARDING");

    const todayQueue = [...overdue, ...todayDue, ...needsOnboarding];

    return NextResponse.json({
      agent: {
        id: user.id,
        name: user.name,
        role: user.role,
        agentCode: user.agentCode || user.userIdTag,
      },
      counts: {
        overdue: overdue.length,
        todayDue: todayDue.length,
        needsOnboarding: needsOnboarding.length,
        totalOpen: enriched.filter((l) => l.bucket !== "DONE").length,
        totalLeads: enriched.length,
      },
      todayQueue,
      myLeads: enriched,
      teamAgents,
    });
  } catch (error) {
    console.error("GET /api/agent/leads error:", error);
    return NextResponse.json({ error: "Failed to load field leads" }, { status: 500 });
  }
}

/**
 * POST /api/agent/leads
 * Quick field capture: businessName, phone, area/locality, city.
 * Checks normalized 10-digit phone & business/locality duplicates while isolating other agents' private data.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const businessName = String(body.businessName || "").trim();
    const rawPhone = String(body.phone || "").trim();
    const locality = String(body.locality || body.area || "").trim();
    const city = String(body.city || "").trim();
    const category = String(body.category || "").trim();
    const mode = body.mode === "ONBOARD_NOW" ? "ONBOARD_NOW" : "FOLLOW_UP";
    const nextAction = String(
      body.nextAction || (mode === "ONBOARD_NOW" ? "DELIVER_MOCKUP" : "IN_PERSON_VISIT")
    );
    const nextActionDue = body.nextActionDue ? new Date(body.nextActionDue) : new Date();
    const notes = body.notes ? String(body.notes).trim() : null;
    const allowSamePhoneBranch = Boolean(body.allowSamePhoneBranch);
    const acknowledgeCrossAgentConflict = Boolean(body.acknowledgeCrossAgentConflict);

    if (!businessName || !rawPhone || !locality) {
      return NextResponse.json(
        { error: "Business name, contact number, and area are required." },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone10(rawPhone);
    if (!cleanPhone || cleanPhone.length < 7) {
      return NextResponse.json(
        { error: "Please enter a valid contact phone number." },
        { status: 400 }
      );
    }

    // Resolve assignment (agents always auto-assign to self)
    let assignedAgentId = user.id;
    let assignedAgentName = user.agentCode
      ? `${user.name || "Agent"} (${user.agentCode})`
      : user.name || user.email;

    if (user.role === "SUPER_ADMIN" && body.assignedAgentId) {
      const target = await prisma.user.findUnique({
        where: { id: String(body.assignedAgentId) },
        select: { id: true, name: true, agentCode: true },
      });
      if (target) {
        assignedAgentId = target.id;
        assignedAgentName = target.agentCode
          ? `${target.name} (${target.agentCode})`
          : target.name || "Field Agent";
      }
    }

    // Duplicate check: normalized phone OR same business name + locality/city
    const candidates = await prisma.leadCapture.findMany({
      where: {
        OR: [
          { phone: { endsWith: cleanPhone } },
          { phone: cleanPhone },
          {
            AND: [
              { businessName: { equals: businessName, mode: "insensitive" as const } },
              ...(locality
                ? [{ locality: { equals: locality, mode: "insensitive" as const } }]
                : []),
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        businessName: true,
        phone: true,
        locality: true,
        city: true,
        status: true,
        assignedAgentId: true,
        assignedAgentName: true,
        nextActionDue: true,
      },
    });

    const exactPhoneMatches = candidates.filter(
      (c) => normalizePhone10(c.phone) === cleanPhone
    );
    const sameBizMatches = candidates.filter(
      (c) =>
        c.businessName.trim().toLowerCase() === businessName.toLowerCase() &&
        (!locality || (c.locality || "").trim().toLowerCase() === locality.toLowerCase())
    );

    const primaryMatch = sameBizMatches[0] || exactPhoneMatches[0] || null;

    if (primaryMatch) {
      const isOwnedByOther =
        Boolean(primaryMatch.assignedAgentId) &&
        primaryMatch.assignedAgentId !== assignedAgentId;

      if (isOwnedByOther && user.role !== "SUPER_ADMIN") {
        if (!acknowledgeCrossAgentConflict && !allowSamePhoneBranch) {
          return NextResponse.json(
            {
              duplicateDetected: true,
              crossAgentConflict: true,
              message:
                "A lead with this phone or business name already exists with another agent. Confirm if this is a separate branch to flag for manager review.",
            },
            { status: 409 }
          );
        }
      } else if (!allowSamePhoneBranch) {
        return NextResponse.json(
          {
            duplicateDetected: true,
            crossAgentConflict: false,
            existingLead: {
              id: primaryMatch.id,
              businessName: primaryMatch.businessName,
              locality: primaryMatch.locality,
              city: primaryMatch.city,
              phone: primaryMatch.phone,
              status: primaryMatch.status,
              nextActionDue: primaryMatch.nextActionDue,
            },
            message:
              primaryMatch.assignedAgentId === assignedAgentId
                ? `You already have "${primaryMatch.businessName}" in your leads.`
                : "A matching lead exists. Save anyway as a separate branch or business?",
          },
          { status: 409 }
        );
      }
    }

    const crossMatch =
      candidates.find(
        (c) => Boolean(c.assignedAgentId) && c.assignedAgentId !== assignedAgentId
      ) || null;

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const isDueToday = nextActionDue <= todayEnd;

    const created = await prisma.leadCapture.create({
      data: {
        businessName,
        phone: cleanPhone,
        locality,
        city: city || null,
        category: category || null,
        source: "FIELD_VISIT",
        verificationMethod: "FIELD_VERIFIED",
        status: mode === "ONBOARD_NOW" ? "DEMO_REQUESTED" : "NEW",
        priority: mode === "ONBOARD_NOW" ? "DEMO_REQUESTED" : isDueToday ? "FOLLOW_UP_TODAY" : "NORMAL",
        priorityReason:
          mode === "ONBOARD_NOW"
            ? "Immediate onboarding started"
            : isDueToday
            ? "Follow-up scheduled for today"
            : "Scheduled follow-up",
        assignedAgentId,
        assignedAgentName,
        nextAction,
        nextActionDue,
        notes,
        conflictFlag: Boolean(crossMatch),
        conflictLeadId: crossMatch?.id || null,
        conflictNote: crossMatch
          ? `Possible shared contact/business with lead ${crossMatch.businessName} (${crossMatch.assignedAgentName || "other agent"}). Saved as branch / escalated by ${assignedAgentName}.`
          : null,
        activities: {
          create: {
            type: "IN_PERSON_VISIT",
            outcome: mode === "ONBOARD_NOW" ? "DEMO_SHOWN" : "VISITED_STORE",
            notes:
              notes ||
              (mode === "ONBOARD_NOW"
                ? `Field capture in ${locality} — started merchant onboarding.`
                : `Field capture in ${locality} — scheduled ${nextAction.toLowerCase()}.`),
            performedBy: assignedAgentName,
          },
        },
      },
      include: {
        activities: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({
      success: true,
      lead: created,
      startOnboarding: mode === "ONBOARD_NOW",
      conflictFlaggedForManager: Boolean(crossMatch),
    });
  } catch (error) {
    console.error("POST /api/agent/leads error:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
