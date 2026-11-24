import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "TODAYS_FOLLOWUPS";
    const search = searchParams.get("search")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const stage = searchParams.get("stage")?.trim() || "";
    const priority = searchParams.get("priority")?.trim() || "";
    const agentId = searchParams.get("agentId")?.trim() || "";
    const source = searchParams.get("source")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(searchParams.get("pageSize") || "25", 10)));

    // Build Prisma Where Clause
    const where: any = {};

    // Search filter across business name, phone, locality, city
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { locality: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (stage) {
      where.status = stage;
    }

    if (priority) {
      where.priority = priority;
    }

    if (source) {
      where.source = source;
    }

    if (agentId) {
      where.assignedAgentId = agentId;
    }

    // Role-based scoping: marketing agent sees their own assigned leads + unassigned leads
    if (user.role === "MARKETING_AGENT") {
      where.OR = [
        ...(where.OR || []),
        { assignedAgentId: user.id },
        { assignedAgentId: null },
      ];
    }

    // View-specific filtering
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (view === "TODAYS_FOLLOWUPS") {
      where.AND = [
        ...(where.AND || []),
        { doNotContact: false },
        {
          OR: [
            { nextActionDue: { lte: endOfToday } },
            { priority: "DEMO_REQUESTED" },
            { priority: "FOLLOW_UP_TODAY" },
            {
              AND: [
                { nextActionDue: null },
                { status: { in: ["NEW", "CONTACTED", "DEMO_REQUESTED"] } },
              ],
            },
          ],
        },
      ];
    }

    // 1. Calculate Reconciled Metrics Across Full Filtered Dataset
    const [
      totalCount,
      allLeadsForMetrics,
      agents,
    ] = await Promise.all([
      prisma.leadCapture.count({ where }),
      prisma.leadCapture.findMany({
        select: {
          id: true,
          status: true,
          source: true,
          priority: true,
          phone: true,
          confirmedPaidAt: true,
          nextActionDue: true,
          doNotContact: true,
        },
      }),
      prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "MARKETING_AGENT"] }, isActive: true },
        select: { id: true, name: true, role: true, agentCode: true },
      }),
    ]);

    // Server-side Aggregations
    let websiteEnquiriesCount = 0;
    let radarDiscoveredCount = 0;
    let fieldContactsCount = 0;
    let todaysFollowUpsCount = 0;
    let agentReportedConversions = 0;
    let confirmedPaidSales = 0;
    const stageCounts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      DEMO_REQUESTED: 0,
      CONVERTED: 0,
      LOST: 0,
    };

    for (const l of allLeadsForMetrics) {
      if (l.source === "WEBSITE_ENQUIRY") websiteEnquiriesCount++;
      if (l.source === "RADAR_DISCOVERY" || l.source === "GOOGLE_MAPS_HUNTER") radarDiscoveredCount++;
      if (l.source === "FIELD_VISIT" || l.phone) fieldContactsCount++;
      if (l.status === "CONVERTED") agentReportedConversions++;
      if (l.confirmedPaidAt) confirmedPaidSales++;

      if (stageCounts[l.status] !== undefined) {
        stageCounts[l.status]++;
      }

      if (!l.doNotContact) {
        const isDue = l.nextActionDue && new Date(l.nextActionDue) <= endOfToday;
        const isPriorityDue = l.priority === "DEMO_REQUESTED" || l.priority === "FOLLOW_UP_TODAY";
        const isNewUnscheduled = !l.nextActionDue && (l.status === "NEW" || l.status === "CONTACTED");
        if (isDue || isPriorityDue || isNewUnscheduled) {
          todaysFollowUpsCount++;
        }
      }
    }

    // 2. Fetch Paginated Leads for the Active View
    const leads = await prisma.leadCapture.findMany({
      where,
      orderBy: [
        { priority: "asc" }, // e.g. DEMO_REQUESTED / FOLLOW_UP_TODAY first
        { nextActionDue: "asc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      leads,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      metrics: {
        totalLeads: allLeadsForMetrics.length,
        filteredTotal: totalCount,
        todaysFollowUpsCount,
        websiteEnquiriesCount,
        radarDiscoveredCount,
        fieldContactsCount,
        agentReportedConversions,
        confirmedPaidSales,
        stageCounts,
      },
      agents,
    });
  } catch (error: any) {
    console.error("CRM fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load CRM data", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, ...updates } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const existing = await prisma.leadCapture.findUnique({
      where: { id: leadId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const dataToUpdate: any = {};

    if (updates.status !== undefined) dataToUpdate.status = updates.status;
    if (updates.priority !== undefined) dataToUpdate.priority = updates.priority;
    if (updates.priorityReason !== undefined) dataToUpdate.priorityReason = updates.priorityReason;
    if (updates.nextAction !== undefined) dataToUpdate.nextAction = updates.nextAction;
    if (updates.nextActionDue !== undefined) {
      dataToUpdate.nextActionDue = updates.nextActionDue ? new Date(updates.nextActionDue) : null;
    }
    if (updates.assignedAgentId !== undefined) {
      dataToUpdate.assignedAgentId = updates.assignedAgentId || null;
      dataToUpdate.assignedAgentName = updates.assignedAgentName || null;
    }
    if (updates.doNotContact !== undefined) dataToUpdate.doNotContact = Boolean(updates.doNotContact);
    if (updates.phone !== undefined) {
      const digits = String(updates.phone || "").replace(/\D/g, "");
      dataToUpdate.phone = digits.length >= 10 ? digits.slice(-10) : null;
    }
    if (updates.locality !== undefined) dataToUpdate.locality = updates.locality;
    if (updates.notes !== undefined) dataToUpdate.notes = updates.notes;
    if (updates.confirmedPaidAt !== undefined) {
      dataToUpdate.confirmedPaidAt = updates.confirmedPaidAt ? new Date(updates.confirmedPaidAt) : null;
    }

    const updated = await prisma.leadCapture.update({
      where: { id: leadId },
      data: dataToUpdate,
    });

    // If status changed, record an activity audit log
    if (updates.status && updates.status !== existing.status) {
      await prisma.leadActivity.create({
        data: {
          leadId,
          type: "STATUS_CHANGE",
          outcome: `Stage changed: ${existing.status} -> ${updates.status}`,
          notes: updates.stageNote || null,
          performedBy: user.name || user.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      lead: updated,
    });
  } catch (error: any) {
    console.error("CRM lead update error:", error);
    return NextResponse.json(
      { error: "Failed to update lead", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
