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
  mobile?: string;
  rating?: number | string;
  reviews?: number | string;
  reviewCount?: number | string;
  reviews_count?: number | string;
  address?: string;
  full_address?: string;
  locality?: string;
  city?: string;
  category?: string;
  type?: string;
  url?: string;
  link?: string;
  place_url?: string;
  providerListingId?: string;
  place_id?: string;
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
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MARKETING_AGENT")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const isDryRun = Boolean(body.dryRun);
    const defaultCity = String(body.city || "Kadapa").trim();
    const defaultCategory = String(body.category || "Local Business").trim();
    const maxReviewsFilter = Number(body.maxReviews) || 100;
    const sourceTag = String(body.source || "CSV_IMPORT").trim();

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
            locality: rowObj.locality || rowObj.area || rowObj.sublocality,
            city: rowObj.city || defaultCity,
            category: rowObj.category || rowObj.type || defaultCategory,
            url: rowObj.url || rowObj.link || rowObj.placeurl || rowObj.googlemapsurl,
            providerListingId: rowObj.placeid || rowObj.providerlistingid || rowObj.id,
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

    // Fetch existing leads for deduplication
    const existingLeads = await prisma.leadCapture.findMany({
      select: {
        id: true,
        businessName: true,
        locality: true,
        city: true,
        phone: true,
        providerListingId: true,
      },
    });

    let newCount = 0;
    let matchedCount = 0;
    let ambiguousCount = 0;
    let invalidCount = 0;
    let skippedCount = 0;

    const previewItems: any[] = [];
    const leadsToInsert: any[] = [];

    for (const item of itemsToProcess) {
      const name = (item.name || item.businessName || "").trim();
      if (!name || name.length < 2) {
        invalidCount++;
        continue;
      }

      // Skip national corporate chains
      if (isCorporateChain(name)) {
        skippedCount++;
        continue;
      }

      // Parse review count (preserve genuine 0)
      let revCount: number | null = null;
      const rawRev = item.reviewCount ?? item.reviews ?? item.reviews_count;
      if (rawRev !== undefined && rawRev !== null && rawRev !== "") {
        const cleanRev = String(rawRev).replace(/[^0-9]/g, "");
        if (cleanRev !== "") {
          revCount = parseInt(cleanRev, 10);
        }
      }

      // Parse rating
      let ratingNum: number | null = null;
      if (item.rating !== undefined && item.rating !== null && item.rating !== "") {
        const parsed = parseFloat(String(item.rating));
        if (!isNaN(parsed)) ratingNum = parsed;
      }

      // Clean & normalize Indian phone
      let cleanPhone: string | null = null;
      const rawPhone = String(item.phone || item.phoneNumber || item.telephone || item.mobile || "").trim();
      const digits = rawPhone.replace(/\D/g, "");
      if (digits.length >= 10) {
        cleanPhone = digits.slice(-10); // Standardize to 10-digit Indian mobile
      }

      const city = (item.city || defaultCity).trim();
      const category = (item.category || item.type || defaultCategory).trim();
      const address = (item.address || item.full_address || "").trim();
      const locality = (item.locality || address.split(",")[0] || city).trim();
      const mapsUrl = item.url || item.link || item.place_url || null;
      const providerListingId = item.providerListingId || item.place_id || null;

      // Smart Branch-Aware Deduplication:
      // Preserves separate branches with the same business name (e.g. "Golden Hair Wig Studio - Proddatur" vs "Golden Hair Wig Studio - Kadapa")
      const exactMatch = existingLeads.find((ex) => {
        if (providerListingId && ex.providerListingId) {
          return ex.providerListingId === providerListingId;
        }
        if (cleanPhone && ex.phone) {
          return ex.phone === cleanPhone;
        }
        // If names match, check if localities are also the same
        const nameMatches = ex.businessName.toLowerCase() === name.toLowerCase();
        if (nameMatches) {
          if (locality && ex.locality) {
            return ex.locality.toLowerCase() === locality.toLowerCase();
          }
          if (city && ex.city) {
            return ex.city.toLowerCase() === city.toLowerCase();
          }
        }
        return false;
      });

      // Ambiguous check: same name but conflicting or missing branch locality
      const sameNameDifferentBranch = existingLeads.some(
        (ex) => ex.businessName.toLowerCase() === name.toLowerCase() &&
          locality && ex.locality &&
          ex.locality.toLowerCase() !== locality.toLowerCase()
      );

      let itemStatus: "NEW" | "MATCHED" | "AMBIGUOUS" = "NEW";
      if (exactMatch) {
        itemStatus = "MATCHED";
        matchedCount++;
      } else if (sameNameDifferentBranch) {
        // Distinct branch identified! Keep as NEW branch
        itemStatus = "NEW";
        newCount++;
      } else {
        newCount++;
      }

      // Structured Priority & Reason
      let priority = "NEEDS_VERIFICATION";
      let priorityReason = "Imported listing";
      if (!cleanPhone) {
        priority = "NEEDS_VERIFICATION";
        priorityReason = "Missing verified contact phone number";
      } else if (revCount !== null && revCount < maxReviewsFilter) {
        priority = "BELOW_THRESHOLD";
        priorityReason = `Verified Google reviews (${revCount}) below ${maxReviewsFilter} target`;
      } else if (revCount === null) {
        priority = "NEEDS_VERIFICATION";
        priorityReason = "Unverified Google review metrics";
      } else {
        priority = "NORMAL";
        priorityReason = "Verified active listing";
      }

      const verificationMethod = revCount !== null ? "API_VERIFIED" : mapsUrl ? "MAPS_LINK_ONLY" : "UNVERIFIED";
      const notes = address ? `Address: ${address}` : null;

      const preparedLead = {
        businessName: name,
        city,
        locality,
        category,
        phone: cleanPhone,
        source: sourceTag,
        provider: sourceTag,
        providerListingId,
        listingUrl: mapsUrl,
        rating: ratingNum,
        reviewCount: revCount,
        observedDate: new Date(),
        verificationMethod,
        priority,
        priorityReason,
        notes,
        status: "NEW",
        doNotContact: false,
      };

      previewItems.push({
        ...preparedLead,
        matchStatus: itemStatus,
      });

      if (!exactMatch) {
        leadsToInsert.push(preparedLead);
      }
    }

    if (isDryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        summary: {
          total: itemsToProcess.length,
          newCount,
          matchedCount,
          ambiguousCount,
          invalidCount,
          skippedCount,
        },
        previewItems: previewItems.slice(0, 50),
      });
    }

    // Execute insertion for non-dry-run
    let importedCount = 0;
    for (const leadData of leadsToInsert) {
      try {
        await prisma.leadCapture.create({
          data: leadData,
        });
        importedCount++;
      } catch (err) {
        console.error("Lead insert error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      importedCount,
      matchedCount,
      skippedCount,
      invalidCount,
    });
  } catch (error: any) {
    console.error("Lead import error:", error);
    return NextResponse.json(
      { error: "Failed to process lead import", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
