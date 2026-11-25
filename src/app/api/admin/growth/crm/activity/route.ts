import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/growth/crm/activity
 * Logs a dated visit / call / demo / WhatsApp outcome while preserving full LeadActivity history.
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
      type,
      outcome,
      notes,
      nextAction,
      nextActionDue,
      status,
      lostReason,
    } = body;

    if (!leadId || !type) {
      return NextResponse.json(
        { error: "leadId and activity type are required." },
        { status: 400 }
      );
    }

    const lead = await prisma.leadCapture.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    if (user.role === "MARKETING_AGENT" && lead.assignedAgentId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only log activity for leads assigned to you." },
        { status: 403 }
      );
    }

    if (status === "LOST" && !lostReason?.trim() && !notes?.trim()) {
      return NextResponse.json(
        { error: "Please select or enter a reason for closing this lead as Lost." },
        { status: 400 }
      );
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        type,
        outcome: outcome || null,
        notes: notes || null,
        performedBy: user.agentCode
          ? `${user.name || "Agent"} (${user.agentCode})`
          : user.name || user.email,
      },
    });

    const leadUpdates: Record<string, unknown> = {};
    if (outcome) leadUpdates.lastOutcome = outcome;
    if (nextAction !== undefined) leadUpdates.nextAction = nextAction;
    if (nextActionDue !== undefined) {
      leadUpdates.nextActionDue = nextActionDue ? new Date(nextActionDue) : null;
    }

    if (status === "LOST" || outcome === "NOT_INTERESTED" || outcome === "DO_NOT_CONTACT") {
      if (status === "LOST") {
        leadUpdates.status = "LOST";
        leadUpdates.lostReason = String(lostReason || notes || "Closed by field agent").trim();
        leadUpdates.nextActionDue = null;
      }
      if (outcome === "DO_NOT_CONTACT") {
        leadUpdates.doNotContact = true;
        leadUpdates.status = "LOST";
        leadUpdates.lostReason = leadUpdates.lostReason || "Requested Do Not Contact";
      }
    } else if (status) {
      leadUpdates.status = status;
    } else if (
      lead.status === "NEW" &&
      (outcome === "SPOKE_TO_OWNER" ||
        outcome === "VISITED_STORE" ||
        outcome === "DEMO_SHOWN" ||
        outcome === "SENT_CONFIRMED" ||
        outcome === "CALLBACK_REQUESTED")
    ) {
      leadUpdates.status = "CONTACTED";
    }

    if (nextActionDue) {
      const due = new Date(nextActionDue);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      if (due <= todayEnd) {
        leadUpdates.priority = "FOLLOW_UP_TODAY";
        leadUpdates.priorityReason = "Follow-up due today";
      } else {
        leadUpdates.priority = "NORMAL";
        leadUpdates.priorityReason = `Scheduled for ${due.toLocaleDateString("en-IN")}`;
      }
    }

    const updatedLead = await prisma.leadCapture.update({
      where: { id: leadId },
      data: leadUpdates,
      include: {
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    return NextResponse.json({
      success: true,
      activity,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("CRM Activity POST Error:", error);
    return NextResponse.json(
      { error: "Failed to log lead activity." },
      { status: 500 }
    );
  }
}
