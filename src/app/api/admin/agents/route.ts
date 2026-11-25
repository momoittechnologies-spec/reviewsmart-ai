import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, hashPin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone10 } from "@/lib/merchantActivation";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/agents
 * List all MARKETING_AGENT team members with lead, confirmed sale, and activation counts.
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agents = await prisma.user.findMany({
      where: { role: "MARKETING_AGENT" },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        agentCode: true,
        userIdTag: true,
        commissionRate: true,
        isActive: true,
        createdAt: true,
      },
    });

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const agentIds = agents.map((a) => a.id);
    const [leadCounts, overdueCounts, approvedPayments] = await Promise.all([
      prisma.leadCapture.groupBy({
        by: ["assignedAgentId"],
        where: { assignedAgentId: { in: agentIds }, status: { not: "LOST" } },
        _count: { _all: true },
      }),
      prisma.leadCapture.groupBy({
        by: ["assignedAgentId"],
        where: {
          assignedAgentId: { in: agentIds },
          status: { notIn: ["CONVERTED", "LOST"] },
          nextActionDue: { lt: new Date() },
        },
        _count: { _all: true },
      }),
      prisma.upiPayment.groupBy({
        by: ["agentId"],
        where: { agentId: { in: agentIds }, status: "APPROVED" },
        _count: { _all: true },
        _sum: { amount: true },
      }),
    ]);

    const leadsMap = new Map(leadCounts.map((r) => [r.assignedAgentId, r._count._all]));
    const overdueMap = new Map(overdueCounts.map((r) => [r.assignedAgentId, r._count._all]));
    const salesMap = new Map(
      approvedPayments.map((r) => [
        r.agentId,
        { count: r._count._all, value: r._sum.amount || 0 },
      ])
    );

    const enriched = agents.map((agent) => {
      const sales = salesMap.get(agent.id) || { count: 0, value: 0 };
      return {
        ...agent,
        activeLeads: leadsMap.get(agent.id) || 0,
        overdueLeads: overdueMap.get(agent.id) || 0,
        confirmedSalesCount: sales.count,
        confirmedSalesValue: sales.value,
      };
    });

    return NextResponse.json({ agents: enriched });
  } catch (error) {
    console.error("GET /api/admin/agents error:", error);
    return NextResponse.json({ error: "Failed to load agents" }, { status: 500 });
  }
}

/**
 * POST /api/admin/agents
 * Create a new MARKETING_AGENT with an Agent Code (e.g. MKT-02) and 4-digit PIN.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const rawCode = String(body.agentCode || "").trim().toUpperCase();
    const pin = String(body.pin || "").trim();
    const cleanPhone = normalizePhone10(body.phone);
    const commissionRate =
      body.commissionRate !== undefined ? Number(body.commissionRate) : 0.3;

    if (!name || !rawCode) {
      return NextResponse.json(
        { error: "Agent name and agent code are required." },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must be exactly 4 digits." },
        { status: 400 }
      );
    }

    const slugCode = rawCode.toLowerCase().replace(/[^a-z0-9]/g, "");
    const email = body.email
      ? String(body.email).trim().toLowerCase()
      : `${slugCode}@agent.reviewsmart.local`;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ agentCode: rawCode }, { userIdTag: rawCode }, { email }],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: `An account already exists for ${rawCode} or ${email}.` },
        { status: 409 }
      );
    }

    const hashedPin = await hashPin(pin);
    const created = await prisma.user.create({
      data: {
        name,
        email,
        phone: cleanPhone,
        agentCode: rawCode,
        userIdTag: rawCode,
        pinCode: hashedPin,
        password: hashedPin,
        role: "MARKETING_AGENT",
        commissionRate: Number.isFinite(commissionRate) ? commissionRate : 0.3,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        agentCode: true,
        userIdTag: true,
        commissionRate: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, agent: created });
  } catch (error) {
    console.error("POST /api/admin/agents error:", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/agents
 * Update agent name, phone, active status, or reset 4-digit PIN.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, phone, isActive, newPin, commissionRate } = body;
    if (!id) {
      return NextResponse.json({ error: "Agent ID is required." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "MARKETING_AGENT" },
    });
    if (!existing) {
      return NextResponse.json({ error: "Marketing agent not found." }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined && String(name).trim()) data.name = String(name).trim();
    if (phone !== undefined) data.phone = normalizePhone10(phone);
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (commissionRate !== undefined && Number.isFinite(Number(commissionRate))) {
      data.commissionRate = Number(commissionRate);
    }
    if (newPin !== undefined && String(newPin).trim().length > 0) {
      const cleanPin = String(newPin).trim();
      if (!/^\d{4}$/.test(cleanPin)) {
        return NextResponse.json(
          { error: "Reset PIN must be exactly 4 digits." },
          { status: 400 }
        );
      }
      const hashed = await hashPin(cleanPin);
      data.pinCode = hashed;
      data.password = hashed;
    }

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        agentCode: true,
        userIdTag: true,
        commissionRate: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, agent: updated });
  } catch (error) {
    console.error("PATCH /api/admin/agents error:", error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/agents?id=...
 * Permanently remove a MARKETING_AGENT after returning assigned leads to the unassigned pool.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Agent ID is required." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "MARKETING_AGENT" },
      select: { id: true, name: true, agentCode: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Marketing agent not found." }, { status: 404 });
    }

    await Promise.all([
      prisma.leadCapture.updateMany({
        where: { assignedAgentId: existing.id },
        data: { assignedAgentId: null, assignedAgentName: null },
      }),
      prisma.user.updateMany({
        where: { referredBy: existing.id },
        data: { referredBy: null },
      }),
    ]);

    await prisma.user.delete({ where: { id: existing.id } });

    return NextResponse.json({
      success: true,
      message: `Removed field agent ${existing.name} (${existing.agentCode}).`,
    });
  } catch (error) {
    console.error("DELETE /api/admin/agents error:", error);
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 });
  }
}
