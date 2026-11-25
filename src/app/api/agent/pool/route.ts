import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AGENT_DAILY_POOL_LIMIT } from "@/lib/merchantActivation";

export const dynamic = "force-dynamic";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * GET /api/agent/pool
 * Lists unassigned Growth Engine prospects prioritized by verified low-review opportunity (< 100 reviews).
 * Also returns the signed-in agent's daily claim count (capped at 5/day).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const city = (searchParams.get("city") || "").trim();
    const search = (searchParams.get("search") || "").trim();

    const claimsToday = await prisma.leadCapture.count({
      where: {
        assignedAgentId: user.id,
        claimedAt: { gte: startOfToday() },
      },
    });

    const poolLeads = await prisma.leadCapture.findMany({
      where: {
        assignedAgentId: null,
        doNotContact: false,
        status: { notIn: ["CONVERTED", "LOST"] },
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(search
          ? {
              OR: [
                { businessName: { contains: search, mode: "insensitive" } },
                { locality: { contains: search, mode: "insensitive" } },
                { category: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ reviewCount: "asc" }, { createdAt: "desc" }],
      take: 40,
      select: {
        id: true,
        businessName: true,
        city: true,
        locality: true,
        category: true,
        phone: true,
        rating: true,
        reviewCount: true,
        verificationMethod: true,
        source: true,
        listingUrl: true,
        createdAt: true,
      },
    });

    // Put <100 verified review prospects cleanly at the top
    const sorted = [...poolLeads].sort((a, b) => {
      const aHot = a.reviewCount !== null && a.reviewCount < 100 ? 0 : 1;
      const bHot = b.reviewCount !== null && b.reviewCount < 100 ? 0 : 1;
      if (aHot !== bHot) return aHot - bHot;
      return (a.reviewCount ?? 9999) - (b.reviewCount ?? 9999);
    });

    return NextResponse.json({
      dailyLimit: AGENT_DAILY_POOL_LIMIT,
      claimsToday,
      remainingToday: Math.max(0, AGENT_DAILY_POOL_LIMIT - claimsToday),
      pool: sorted,
    });
  } catch (error) {
    console.error("GET /api/agent/pool error:", error);
    return NextResponse.json({ error: "Failed to load Growth Pool" }, { status: 500 });
  }
}

/**
 * POST /api/agent/pool
 * Claims up to 5 unassigned Growth Pool leads per day into the field agent's Today queue.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const leadIds: string[] = Array.isArray(body.leadIds)
      ? body.leadIds.map((x: unknown) => String(x)).filter(Boolean)
      : body.leadId
      ? [String(body.leadId)]
      : [];

    if (leadIds.length === 0) {
      return NextResponse.json({ error: "Select at least one lead to claim." }, { status: 400 });
    }

    const targetAgentId =
      user.role === "SUPER_ADMIN" && body.targetAgentId
        ? String(body.targetAgentId)
        : user.id;

    let agentLabel = user.agentCode
      ? `${user.name || "Agent"} (${user.agentCode})`
      : user.name || user.email;

    if (targetAgentId !== user.id) {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetAgentId },
        select: { name: true, agentCode: true },
      });
      if (!targetUser) {
        return NextResponse.json({ error: "Target agent not found." }, { status: 404 });
      }
      agentLabel = targetUser.agentCode
        ? `${targetUser.name} (${targetUser.agentCode})`
        : targetUser.name || "Agent";
    }

    // Enforce max 5 self-claims/day for field agents
    if (user.role === "MARKETING_AGENT") {
      const claimsToday = await prisma.leadCapture.count({
        where: {
          assignedAgentId: user.id,
          claimedAt: { gte: startOfToday() },
        },
      });
      if (claimsToday + leadIds.length > AGENT_DAILY_POOL_LIMIT) {
        return NextResponse.json(
          {
            error: `Daily Growth Pool limit is ${AGENT_DAILY_POOL_LIMIT} leads. You have claimed ${claimsToday} today (${Math.max(
              0,
              AGENT_DAILY_POOL_LIMIT - claimsToday
            )} remaining).`,
          },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const claimedIds: string[] = [];

    for (const leadId of leadIds) {
      // Atomic conditional claim ensures two agents can't claim the same unassigned lead
      const res = await prisma.leadCapture.updateMany({
        where: {
          id: leadId,
          assignedAgentId: null,
          doNotContact: false,
        },
        data: {
          assignedAgentId: targetAgentId,
          assignedAgentName: agentLabel,
          claimedAt: now,
          nextAction: "IN_PERSON_VISIT",
          nextActionDue: now,
          priority: "FOLLOW_UP_TODAY",
          priorityReason: "Claimed from Growth Pool",
        },
      });

      if (res.count === 1) {
        claimedIds.push(leadId);
        await prisma.leadActivity.create({
          data: {
            leadId,
            type: "ASSIGNMENT",
            notes: `Added from Growth Pool to ${agentLabel}'s Today queue`,
            performedBy: user.agentCode
              ? `${user.name} (${user.agentCode})`
              : user.name || user.email,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      claimedCount: claimedIds.length,
      claimedIds,
      message:
        claimedIds.length > 0
          ? `Added ${claimedIds.length} prospect${claimedIds.length > 1 ? "s" : ""} to Today's queue.`
          : "Selected leads were already claimed by another agent.",
    });
  } catch (error) {
    console.error("POST /api/agent/pool error:", error);
    return NextResponse.json({ error: "Failed to claim leads from pool" }, { status: 500 });
  }
}
