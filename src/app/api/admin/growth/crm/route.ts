import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMerchantMissingItems } from "@/lib/merchantActivation";

export const dynamic = "force-dynamic";

function resolveDateBounds(dateRange: string, fromParam?: string | null, toParam?: string | null) {
  const now = new Date();
  if (fromParam || toParam) {
    const gte = fromParam ? new Date(fromParam) : undefined;
    const lte = toParam ? new Date(toParam) : undefined;
    if (gte) gte.setHours(0, 0, 0, 0);
    if (lte) lte.setHours(23, 59, 59, 999);
    return { gte, lte };
  }
  if (dateRange === "TODAY") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  if (dateRange === "7D") {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: now };
  }
  if (dateRange === "30D") {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: now };
  }
  return null;
}

/**
 * GET /api/admin/growth/crm
 * Enforces strict server-side RBAC:
 * - MARKETING_AGENT can ONLY inspect leads assigned to their own user ID.
 * - SUPER_ADMIN sees full team pipeline, manager KPI metrics, date/agent filters, and cross-agent conflicts.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "ALL"; // "TODAYS_FOLLOWUPS" | "ALL"
    const source = searchParams.get("source") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = (searchParams.get("search") || "").trim();
    const agentFilter = searchParams.get("agentId") || "ALL";
    const dateRange = searchParams.get("dateRange") || "30D"; // "TODAY" | "7D" | "30D" | "ALL"
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const now = new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const andConditions: Prisma.LeadCaptureWhereInput[] = [];

    if (!isSuperAdmin) {
      andConditions.push({ assignedAgentId: user.id });
    } else if (agentFilter === "UNASSIGNED") {
      andConditions.push({ assignedAgentId: null });
    } else if (agentFilter !== "ALL") {
      andConditions.push({ assignedAgentId: agentFilter });
    }

    if (source !== "ALL") {
      andConditions.push({ source });
    }
    if (status !== "ALL") {
      andConditions.push({ status });
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

    if (view === "TODAYS_FOLLOWUPS") {
      andConditions.push({
        status: { notIn: ["CONVERTED", "LOST"] },
        doNotContact: false,
        OR: [
          { nextActionDue: { lte: endOfToday } },
          { priority: { in: ["DEMO_REQUESTED", "FOLLOW_UP_TODAY"] } },
          { source: "WEBSITE_ENQUIRY", status: "NEW" },
        ],
      });
    }

    const where: Prisma.LeadCaptureWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const leads = await prisma.leadCapture.findMany({
      where,
      orderBy:
        view === "TODAYS_FOLLOWUPS"
          ? [{ nextActionDue: "asc" }, { priority: "asc" }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    const filteredTotal = await prisma.leadCapture.count({ where });

    // ── Metrics & Manager Dashboard Scorecard ──────────────────────────────────
    const scopeLeadFilter: Prisma.LeadCaptureWhereInput = !isSuperAdmin
      ? { assignedAgentId: user.id }
      : agentFilter === "UNASSIGNED"
      ? { assignedAgentId: null }
      : agentFilter !== "ALL"
      ? { assignedAgentId: agentFilter }
      : {};

    const bounds = resolveDateBounds(dateRange, fromParam, toParam);
    const createdAtFilter = bounds ? { gte: bounds.gte, lte: bounds.lte } : undefined;

    const [
      totalLeads,
      todaysFollowUpsCount,
      websiteEnquiriesCount,
      radarDiscoveredCount,
      fieldContactsCount,
      agentReportedConversions,
      confirmedPaidSales,
      newLeadsInPeriod,
      overdueFollowUpsCount,
      conflictLeadsCount,
    ] = await Promise.all([
      prisma.leadCapture.count({ where: scopeLeadFilter }),
      prisma.leadCapture.count({
        where: {
          ...scopeLeadFilter,
          status: { notIn: ["CONVERTED", "LOST"] },
          doNotContact: false,
          OR: [
            { nextActionDue: { lte: endOfToday } },
            { priority: { in: ["DEMO_REQUESTED", "FOLLOW_UP_TODAY"] } },
            { source: "WEBSITE_ENQUIRY", status: "NEW" },
          ],
        },
      }),
      prisma.leadCapture.count({ where: { ...scopeLeadFilter, source: "WEBSITE_ENQUIRY" } }),
      prisma.leadCapture.count({ where: { ...scopeLeadFilter, source: "RADAR_DISCOVERY" } }),
      prisma.leadCapture.count({ where: { ...scopeLeadFilter, lastOutcome: { not: null } } }),
      prisma.leadCapture.count({ where: { ...scopeLeadFilter, status: "CONVERTED" } }),
      prisma.leadCapture.count({ where: { ...scopeLeadFilter, confirmedPaidAt: { not: null } } }),
      prisma.leadCapture.count({
        where: {
          ...scopeLeadFilter,
          ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
        },
      }),
      prisma.leadCapture.count({
        where: {
          ...scopeLeadFilter,
          status: { notIn: ["CONVERTED", "LOST"] },
          doNotContact: false,
          nextActionDue: { lt: now },
        },
      }),
      isSuperAdmin
        ? prisma.leadCapture.count({ where: { conflictFlag: true } })
        : Promise.resolve(0),
    ]);

    let managerScorecard: Record<string, unknown> | null = null;

    if (isSuperAdmin) {
      const paymentAgentWhere: Prisma.UpiPaymentWhereInput =
        agentFilter !== "ALL" && agentFilter !== "UNASSIGNED" ? { agentId: agentFilter } : {};

      const approvedPayments = await prisma.upiPayment.findMany({
        where: {
          status: "APPROVED",
          ...paymentAgentWhere,
          ...(bounds
            ? {
                OR: [
                  { confirmedAt: { gte: bounds.gte, lte: bounds.lte } },
                  { confirmedAt: null, updatedAt: { gte: bounds.gte, lte: bounds.lte } },
                ],
              }
            : {}),
        },
        orderBy: [{ confirmedAt: "desc" }, { updatedAt: "desc" }],
        take: 100,
        select: {
          id: true,
          businessId: true,
          agentId: true,
          agentCode: true,
          amount: true,
          utrNumber: true,
          packageTier: true,
          confirmedAt: true,
          updatedAt: true,
          user: { select: { name: true, phone: true } },
        },
      });

      const confirmedSalesValue = approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const activatedBusinesses = await prisma.business.findMany({
        where: {
          activatedAt: bounds ? { gte: bounds.gte, lte: bounds.lte } : { not: null },
        },
        orderBy: { activatedAt: "desc" },
        take: 100,
        select: {
          id: true,
          name: true,
          slug: true,
          packageTier: true,
          activatedAt: true,
          isPaid: true,
          user: { select: { name: true, phone: true, referredBy: true } },
        },
      });

      const paidAwaitingActivationRaw = await prisma.business.findMany({
        where: {
          isPaid: true,
          activatedAt: null,
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          googleReviewUrl: true,
          isPaid: true,
          packageTier: true,
          createdAt: true,
          user: { select: { name: true, phone: true, referredBy: true } },
        },
      });

      const paidAwaitingActivation = paidAwaitingActivationRaw.map((b) => ({
        ...b,
        missingItems: getMerchantMissingItems(b),
      }));

      const [conflictLeads, teamAgents] = await Promise.all([
        prisma.leadCapture.findMany({
          where: { conflictFlag: true },
          orderBy: { updatedAt: "desc" },
          take: 25,
          select: {
            id: true,
            businessName: true,
            phone: true,
            city: true,
            locality: true,
            assignedAgentId: true,
            assignedAgentName: true,
            conflictLeadId: true,
            conflictNote: true,
          },
        }),
        prisma.user.findMany({
          where: { role: "MARKETING_AGENT" },
          orderBy: { name: "asc" },
          select: { id: true, name: true, agentCode: true, isActive: true },
        }),
      ]);

      managerScorecard = {
        newLeadsCount: newLeadsInPeriod,
        overdueFollowUpsCount,
        confirmedSalesCount: approvedPayments.length,
        confirmedSalesValue,
        activatedMerchantsCount: activatedBusinesses.length,
        paidAwaitingActivationCount: paidAwaitingActivation.length,
        conflictLeadsCount,
        drilldowns: {
          confirmedSales: approvedPayments,
          activatedMerchants: activatedBusinesses,
          paidAwaitingActivation,
          conflictLeads,
        },
        teamAgents,
      };
    }

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
      },
      metrics: {
        totalLeads,
        filteredTotal,
        todaysFollowUpsCount,
        websiteEnquiriesCount,
        radarDiscoveredCount,
        fieldContactsCount,
        agentReportedConversions,
        confirmedPaidSales,
        newLeadsInPeriod,
        overdueFollowUpsCount,
        conflictLeadsCount,
      },
      managerScorecard,
    });
  } catch (error) {
    console.error("CRM GET Error:", error);
    return NextResponse.json(
      { error: "Failed to load Growth CRM data." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/growth/crm
 * Update lead status, schedule follow-up, or (SUPER_ADMIN only) assign/reassign agent & resolve conflicts.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      status,
      priority,
      priorityReason,
      assignedAgentId,
      assignedAgentName,
      nextAction,
      nextActionDue,
      notes,
      doNotContact,
      confirmPaidConversion,
      lostReason,
      resolveConflict,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required." }, { status: 400 });
    }

    const existing = await prisma.leadCapture.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    // Strict ownership enforcement for MARKETING_AGENT
    if (user.role === "MARKETING_AGENT") {
      if (existing.assignedAgentId !== user.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only update leads assigned to you." },
          { status: 403 }
        );
      }
      if (
        assignedAgentId !== undefined ||
        confirmPaidConversion ||
        resolveConflict !== undefined
      ) {
        return NextResponse.json(
          { error: "Forbidden: Only managers can reassign leads, confirm payments, or resolve conflicts." },
          { status: 403 }
        );
      }
    }

    if (status === "LOST" && !lostReason?.trim() && !existing.lostReason) {
      return NextResponse.json(
        { error: "Please provide a reason when closing a lead as Lost." },
        { status: 400 }
      );
    }

    const updateData: Prisma.LeadCaptureUpdateInput = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (priorityReason !== undefined) updateData.priorityReason = priorityReason;
    if (nextAction !== undefined) updateData.nextAction = nextAction;
    if (nextActionDue !== undefined) {
      updateData.nextActionDue = nextActionDue ? new Date(nextActionDue) : null;
    }
    if (notes !== undefined) updateData.notes = notes;
    if (lostReason !== undefined) updateData.lostReason = lostReason ? String(lostReason).trim() : null;
    if (typeof doNotContact === "boolean") {
      updateData.doNotContact = doNotContact;
      if (doNotContact) updateData.status = "LOST";
    }

    // SUPER_ADMIN actions only
    if (user.role === "SUPER_ADMIN") {
      if (assignedAgentId !== undefined) {
        if (!assignedAgentId) {
          updateData.assignedAgentId = null;
          updateData.assignedAgentName = null;
        } else {
          const targetAgent = await prisma.user.findUnique({
            where: { id: assignedAgentId },
            select: { id: true, name: true, agentCode: true },
          });
          updateData.assignedAgentId = assignedAgentId;
          updateData.assignedAgentName =
            assignedAgentName ||
            (targetAgent ? `${targetAgent.name} (${targetAgent.agentCode})` : null);
        }
      }
      if (confirmPaidConversion) {
        updateData.confirmedPaidAt = new Date();
        updateData.status = "CONVERTED";
      }
      if (resolveConflict) {
        updateData.conflictFlag = false;
        updateData.conflictNote = body.conflictNote
          ? String(body.conflictNote).trim()
          : `Resolved by ${user.name || user.email}`;
      }
    }

    const updated = await prisma.leadCapture.update({
      where: { id },
      data: updateData,
    });

    if (assignedAgentId !== undefined && user.role === "SUPER_ADMIN") {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "ASSIGNMENT",
          notes: `Lead assigned to ${updateData.assignedAgentName || "Unassigned pool"}`,
          performedBy: user.name || user.email,
        },
      });
    } else if (status === "LOST") {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "STATUS_CHANGE",
          outcome: "LOST",
          notes: `Closed as Lost — Reason: ${updateData.lostReason || lostReason}`,
          performedBy: user.name || user.agentCode || user.email,
        },
      });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("CRM PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update lead." }, { status: 500 });
  }
}
