import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, city, category, phone, source, notes } = body;

    if (!phone || typeof phone !== "string" || phone.trim().length < 8) {
      return NextResponse.json(
        { error: "A valid mobile / WhatsApp number is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, "").trim();
    const cleanBusiness = (businessName || "Interested Business").trim();

    // Check if recent lead with same phone exists in last 24h to avoid spam duplicates
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.leadCapture.findFirst({
      where: {
        phone: cleanPhone,
        createdAt: { gte: oneDayAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    let lead;
    if (existing) {
      // Update with latest intent
      lead = await prisma.leadCapture.update({
        where: { id: existing.id },
        data: {
          businessName: cleanBusiness,
          city: city?.trim() || existing.city,
          category: category?.trim() || existing.category,
          source: source || existing.source,
          notes: notes ? `${existing.notes || ""}\n[Update]: ${notes}` : existing.notes,
        },
      });
    } else {
      // Create new lead
      lead = await prisma.leadCapture.create({
        data: {
          businessName: cleanBusiness,
          city: city?.trim() || null,
          category: category?.trim() || null,
          phone: cleanPhone,
          source: source || "HERO_CUSTOMIZER",
          notes: notes || null,
          status: "NEW",
        },
      });
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Lead captured successfully. Our team will connect on WhatsApp within 15 minutes.",
    });
  } catch (error: any) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Failed to record lead. Please contact support.", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const leads = await prisma.leadCapture.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    console.error("Lead fetch error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch leads" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id, status, notes } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing lead ID" }, { status: 400 });
    }

    const updated = await prisma.leadCapture.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (err: any) {
    console.error("Lead update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update lead" }, { status: 500 });
  }
}
