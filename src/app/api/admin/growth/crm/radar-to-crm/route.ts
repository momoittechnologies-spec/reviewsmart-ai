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
    const {
      name,
      city,
      locality,
      category,
      phone,
      rating,
      reviewCount,
      googlePlaceId,
      googleMapsUrl,
      dataSource,
      id: rawId,
    } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    const digits = phone ? String(phone).replace(/\D/g, "") : "";
    const cleanPhone = digits.length >= 10 ? digits.slice(-10) : null;
    const providerListingId = googlePlaceId || rawId || null;

    // Check if already in CRM
    const existing = await prisma.leadCapture.findFirst({
      where: {
        OR: [
          ...(providerListingId ? [{ providerListingId }] : []),
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
          {
            businessName: { equals: name.trim(), mode: "insensitive" as const },
            city: { equals: (city || "").trim(), mode: "insensitive" as const },
          },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        lead: existing,
        message: "Business is already in your CRM pipeline.",
      });
    }

    const revNum = reviewCount !== undefined && reviewCount !== null ? parseInt(String(reviewCount), 10) : null;
    const rateNum = rating !== undefined && rating !== null ? parseFloat(String(rating)) : null;

    let priority = "NEEDS_VERIFICATION";
    let priorityReason = "Radar discovery";
    if (!cleanPhone) {
      priority = "NEEDS_VERIFICATION";
      priorityReason = "Missing verified contact phone number";
    } else if (revNum !== null && revNum < 50) {
      priority = "BELOW_THRESHOLD";
      priorityReason = `Verified Google reviews (${revNum}) below 50 target`;
    } else if (revNum === null) {
      priority = "NEEDS_VERIFICATION";
      priorityReason = "Unverified Google review metrics";
    }

    const verificationMethod = revNum !== null ? "API_VERIFIED" : "MAPS_LINK_ONLY";

    const newLead = await prisma.leadCapture.create({
      data: {
        businessName: name.trim(),
        city: (city || "Kadapa").trim(),
        locality: locality ? locality.trim() : null,
        category: category ? category.trim() : "Local Business",
        phone: cleanPhone,
        source: "RADAR_DISCOVERY",
        provider: dataSource === "google_places" ? "GOOGLE_PLACES" : "OPENSTREETMAP",
        providerListingId,
        listingUrl: googleMapsUrl || null,
        rating: rateNum,
        reviewCount: revNum,
        observedDate: new Date(),
        verificationMethod,
        priority,
        priorityReason,
        status: "NEW",
        assignedAgentId: user.role === "MARKETING_AGENT" ? user.id : null,
        assignedAgentName: user.role === "MARKETING_AGENT" ? user.name : null,
      },
    });

    // Record activity
    await prisma.leadActivity.create({
      data: {
        leadId: newLead.id,
        type: "NOTE",
        outcome: "DISCOVERED_VIA_RADAR",
        notes: `Discovered in Radar search (${dataSource || "OpenStreetMap"})`,
        performedBy: user.name || user.email,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      lead: newLead,
      message: "Lead added to CRM successfully.",
    });
  } catch (error: any) {
    console.error("Radar to CRM error:", error);
    return NextResponse.json(
      { error: "Failed to add lead to CRM", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
