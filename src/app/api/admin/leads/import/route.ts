import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { isCorporateChain } from "@/lib/gmbDataFetcher";

export const dynamic = "force-dynamic";

interface LeadInput {
  name?: string;
  businessName?: string;
  phone?: string;
  phoneNumber?: string;
  telephone?: string;
  rating?: number | string;
  reviews?: number | string;
  reviewCount?: number | string;
  reviews_count?: number | string;
  address?: string;
  full_address?: string;
  city?: string;
  category?: string;
  type?: string;
  url?: string;
  link?: string;
  place_url?: string;
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const defaultCity = String(body.city || "Kadapa").trim();
    const defaultCategory = String(body.category || "Local Business").trim();
    const maxReviewsFilter = Number(body.maxReviews) || 50;
    const sourceTag = String(body.source || "OPEN_SOURCE_IMPORT").trim();

    let itemsToProcess: LeadInput[] = [];

    // Case 1: Raw JSON array
    if (Array.isArray(body.leads)) {
      itemsToProcess = body.leads;
    }
    // Case 2: CSV text upload / paste
    else if (typeof body.csvText === "string" && body.csvText.trim().length > 0) {
      const lines = body.csvText
        .split(/\r?\n/)
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      if (lines.length > 1) {
        const rawHeaders = parseCSVLine(lines[0]).map((h) =>
          h.toLowerCase().replace(/[^a-z0-9_]/g, "")
        );

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          const rowObj: Record<string, string> = {};
          rawHeaders.forEach((header, idx) => {
            if (cols[idx] !== undefined) {
              rowObj[header] = cols[idx];
            }
          });

          itemsToProcess.push({
            name: rowObj.name || rowObj.title || rowObj.businessname || rowObj.placename,
            phone: rowObj.phone || rowObj.phonenumber || rowObj.telephone || rowObj.mobile,
            rating: rowObj.rating || rowObj.stars || rowObj.totalscore,
            reviewCount: rowObj.reviews || rowObj.reviewcount || rowObj.reviewscount || rowObj.userreviewscount,
            address: rowObj.address || rowObj.fulladdress || rowObj.formattedaddress || rowObj.street,
            city: rowObj.city || defaultCity,
            category: rowObj.category || rowObj.type || defaultCategory,
            url: rowObj.url || rowObj.link || rowObj.placeurl || rowObj.googlemapsurl,
          });
        }
      }
    }

    if (itemsToProcess.length === 0) {
      return NextResponse.json(
        { error: "No leads data provided. Please provide an array of leads or CSV text." },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let skippedChains = 0;
    let skippedHighReviews = 0;
    let skippedMissingName = 0;

    for (const item of itemsToProcess) {
      const name = (item.name || item.businessName || "").trim();
      if (!name || name.length < 2) {
        skippedMissingName++;
        continue;
      }

      // 1. Skip national corporate chains
      if (isCorporateChain(name)) {
        skippedChains++;
        continue;
      }

      // 2. Parse review count & rating
      let revCount: number | null = null;
      const rawRev = item.reviewCount || item.reviews || item.reviews_count;
      if (rawRev !== undefined && rawRev !== null && rawRev !== "") {
        const cleanRev = String(rawRev).replace(/[^0-9]/g, "");
        if (cleanRev) revCount = parseInt(cleanRev, 10);
      }

      // Filter out businesses with high reviews if threshold is set
      if (revCount !== null && revCount >= maxReviewsFilter) {
        skippedHighReviews++;
        continue;
      }

      let ratingNum: number | null = null;
      if (item.rating !== undefined && item.rating !== null && item.rating !== "") {
        const parsed = parseFloat(String(item.rating));
        if (!isNaN(parsed)) ratingNum = parsed;
      }

      // 3. Clean phone
      const rawPhone = String(item.phone || item.phoneNumber || item.telephone || "").trim();
      const phoneDigits = rawPhone.replace(/[^0-9]/g, "");
      const cleanPhone = phoneDigits.length >= 10
        ? phoneDigits.slice(-10)
        : `000${Math.floor(1000000 + Math.random() * 9000000)}`;

      const city = (item.city || defaultCity).trim();
      const category = (item.category || item.type || defaultCategory).trim();
      const address = (item.address || item.full_address || `${name}, ${city}`).trim();
      const mapsUrl = item.url || item.link || item.place_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + city)}`;

      const deficit = revCount !== null ? Math.max(0, 100 - revCount) : 85;
      const notes = `Rating: ${ratingNum !== null ? ratingNum : "N/A"}★ | Google Reviews: ${revCount !== null ? revCount : "N/A"} (Needs ${deficit} to reach 100). Address: ${address}. Maps: ${mapsUrl}`;

      try {
        await prisma.leadCapture.create({
          data: {
            businessName: name,
            city,
            category,
            phone: cleanPhone,
            source: sourceTag,
            notes,
            status: "NEW",
          },
        });
        importedCount++;
      } catch (dbErr) {
        // Skip duplicate or constraint error
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedChains,
      skippedHighReviews,
      skippedMissingName,
      totalReceived: itemsToProcess.length,
      message: `Successfully imported ${importedCount} qualified low-review leads (< ${maxReviewsFilter} reviews). Skipped ${skippedHighReviews} high-review businesses and ${skippedChains} chains.`,
    });
  } catch (err: any) {
    console.error("[leads/import] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to import leads" },
      { status: 500 }
    );
  }
}
