import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, type, outcome, notes, nextAction, nextActionDue } = body;

    if (!leadId || !type) {
      return NextResponse.json(
        { error: "leadId and type are required" },
        { status: 400 }
      );
    }

    const lead = await prisma.leadCapture.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const performedBy = user.name || user.email || user.userIdTag || "Sales Agent";

    // 1. Create Immutable Activity Audit Record
    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        type,
        outcome: outcome || null,
        notes: notes || null,
        performedBy,
      },
    });

    // 2. Update Lead Last Outcome & Optional Next Action Schedule
    const leadUpdates: any = {
      lastOutcome: outcome || type,
      updatedAt: new Date(),
    };

    if (nextAction !== undefined) {
      leadUpdates.nextAction = nextAction;
    }
    if (nextActionDue !== undefined) {
      leadUpdates.nextActionDue = nextActionDue ? new Date(nextActionDue) : null;
    }

    // Auto-advance status ONLY if first contact has been made (and not on simple draft open)
    if (lead.status === "NEW" && (type === "CALL" || type === "WHATSAPP_SENT" || type === "IN_PERSON_VISIT")) {
      leadUpdates.status = "CONTACTED";
    }

    const updatedLead = await prisma.leadCapture.update({
      where: { id: leadId },
      data: leadUpdates,
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      activity,
      lead: updatedLead,
    });
  } catch (error: any) {
    console.error("Activity logging error:", error);
    return NextResponse.json(
      { error: "Failed to record activity", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
