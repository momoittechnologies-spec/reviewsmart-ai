import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateLeads() {
  console.log("=== ReviewSmart Growth CRM Lead Migration ===");
  const allLeads = await prisma.leadCapture.findMany();
  console.log(`Found ${allLeads.length} total leads to inspect.`);

  let updatedCount = 0;
  let placeholderPhonesCleared = 0;
  let realPhonesExtracted = 0;
  let normalizedPhones = 0;
  let structuredMetricsExtracted = 0;

  const preview = [];

  for (const lead of allLeads) {
    let newPhone = lead.phone ? lead.phone.trim() : null;
    let newLocality = lead.locality;
    let newRating = lead.rating;
    let newReviewCount = lead.reviewCount;
    let newListingUrl = lead.listingUrl;
    let newProvider = lead.provider || "MANUAL";
    let newVerificationMethod = lead.verificationMethod || "UNVERIFIED";
    let newPriority = lead.priority || "NEEDS_VERIFICATION";
    let newPriorityReason = lead.priorityReason;

    // 1. Detect and handle phone
    if (newPhone && newPhone.startsWith("000")) {
      // Check notes for a genuine Indian mobile/phone number
      // Patterns: 082478 51644, 093937 79009, 90009 56508, 08562 245678, etc.
      let recoveredPhone = null;
      if (lead.notes) {
        const phoneMatch = lead.notes.match(/(?:·|\s)(0?[6-9]\d{4}\s?\d{5})(?:\.|\s|$)/);
        if (phoneMatch) {
          const rawFound = phoneMatch[1].replace(/\D/g, "");
          recoveredPhone = rawFound.slice(-10);
        }
      }

      if (recoveredPhone && recoveredPhone.length === 10) {
        newPhone = recoveredPhone;
        realPhonesExtracted++;
      } else {
        newPhone = null;
        placeholderPhonesCleared++;
      }
    } else if (newPhone) {
      // Normalize genuine phone numbers (prevent duplicate +91)
      const digits = newPhone.replace(/\D/g, "");
      if (digits.length >= 10) {
        newPhone = digits.slice(-10);
        normalizedPhones++;
      }
    }

    // 2. Parse structured ratings and reviews from notes if available
    if (lead.notes) {
      // Rating: 5★ or 4.8★
      const ratingMatch = lead.notes.match(/Rating:\s*([0-9.]+)(?:★)?/i);
      if (ratingMatch && newRating === null) {
        const r = parseFloat(ratingMatch[1]);
        if (!isNaN(r)) newRating = r;
      }

      // Google Reviews: 16
      const revMatch = lead.notes.match(/Google Reviews:\s*(\d+)/i);
      if (revMatch && newReviewCount === null) {
        newReviewCount = parseInt(revMatch[1], 10);
        structuredMetricsExtracted++;
      }

      // Maps URL: https://www.google.com/maps/...
      const mapsMatch = lead.notes.match(/Maps:\s*(https?:\/\/[^\s]+)/i);
      if (mapsMatch && !newListingUrl) {
        newListingUrl = mapsMatch[1];
      }

      // Address / Locality
      const addrMatch = lead.notes.match(/Address:\s*([^.\n]+)/i);
      if (addrMatch && !newLocality) {
        newLocality = addrMatch[1].replace(/^Dental clinic\s*·\s*/i, "").trim().slice(0, 100);
      }
    }

    // 3. Classify Provider and Verification Method
    if (lead.source === "GOOGLE_MAPS_HUNTER") {
      newProvider = "GOOGLE_MAPS";
      newVerificationMethod = "MAPS_LINK_ONLY";
    } else if (lead.source === "HERO_CUSTOMIZER" || lead.source === "HERO_3D_CUSTOMIZER" || lead.source === "LIVE_TEST") {
      newProvider = "WEBSITE_ENQUIRY";
      newVerificationMethod = "USER_SUBMITTED";
    }

    // 4. Classify Priority & Reason
    if (lead.status === "CONVERTED") {
      newPriority = "NORMAL";
      newPriorityReason = "Customer already converted";
    } else if (!newPhone) {
      newPriority = "NEEDS_VERIFICATION";
      newPriorityReason = "Missing verified contact phone number";
    } else if (newReviewCount !== null && newReviewCount < 30) {
      newPriority = "BELOW_THRESHOLD";
      newPriorityReason = `Observed Google reviews (${newReviewCount}) below 30 target`;
    } else if (newVerificationMethod === "UNVERIFIED" || newVerificationMethod === "MAPS_LINK_ONLY") {
      newPriority = "NEEDS_VERIFICATION";
      newPriorityReason = "Unverified Maps listing match";
    }

    preview.push({
      id: lead.id,
      name: lead.businessName,
      oldPhone: lead.phone,
      newPhone,
      newRating,
      newReviewCount,
      newPriority,
      newPriorityReason,
    });

    await prisma.leadCapture.update({
      where: { id: lead.id },
      data: {
        phone: newPhone,
        locality: newLocality,
        rating: newRating,
        reviewCount: newReviewCount,
        listingUrl: newListingUrl,
        provider: newProvider,
        verificationMethod: newVerificationMethod,
        priority: newPriority,
        priorityReason: newPriorityReason,
        observedDate: lead.createdAt,
      },
    });
    updatedCount++;
  }

  console.log("\nMigration Summary:");
  console.log(`- Total Leads Updated: ${updatedCount}`);
  console.log(`- Fake '000...' Placeholders Cleared to Null: ${placeholderPhonesCleared}`);
  console.log(`- Real Phones Extracted from Listing Notes: ${realPhonesExtracted}`);
  console.log(`- Existing Phone Numbers Normalized: ${normalizedPhones}`);
  console.log(`- Structured Review Counts Extracted: ${structuredMetricsExtracted}`);
  console.log("\nSample Migrated Leads Preview:");
  console.log(JSON.stringify(preview.slice(0, 5), null, 2));
}

migrateLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
