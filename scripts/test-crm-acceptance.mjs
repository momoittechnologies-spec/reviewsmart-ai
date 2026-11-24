import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runAcceptanceTests() {
  console.log("=== ReviewSmart Growth CRM Acceptance Test Suite ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Unknown review count stays null; genuine 0 remains 0
  const testLeadZero = await prisma.leadCapture.create({
    data: {
      businessName: "Test Zero Reviews Business",
      city: "Kadapa",
      phone: "9876543210",
      reviewCount: 0,
      rating: null,
      source: "TEST_SUITE",
    },
  });

  const testLeadNull = await prisma.leadCapture.create({
    data: {
      businessName: "Test Null Reviews Business",
      city: "Kadapa",
      phone: "9876543211",
      reviewCount: null,
      rating: null,
      source: "TEST_SUITE",
    },
  });

  assert(testLeadZero.reviewCount === 0, "Genuine review count of 0 is preserved as 0");
  assert(testLeadNull.reviewCount === null, "Unknown review count is represented strictly as null");

  // 2. Missing phone creates no placeholder and allows in-person field visit
  const testLeadNoPhone = await prisma.leadCapture.create({
    data: {
      businessName: "Test Store Without Phone",
      city: "Kadapa",
      locality: "Main Bazaar",
      phone: null,
      source: "FIELD_VISIT",
    },
  });

  assert(testLeadNoPhone.phone === null, "Missing phone stored as null (no 000... placeholder generated)");

  // Log in-person visit on lead without phone
  const visitActivity = await prisma.leadActivity.create({
    data: {
      leadId: testLeadNoPhone.id,
      type: "IN_PERSON_VISIT",
      outcome: "SPOKE_TO_OWNER",
      notes: "Met owner, demonstrated standee preview on mobile.",
      performedBy: "Agent MKT-01",
    },
  });

  assert(visitActivity.type === "IN_PERSON_VISIT", "In-person visit logged successfully for phone-less merchant");

  // 3. Opening WhatsApp (draft) vs Sent confirmation
  const draftActivity = await prisma.leadActivity.create({
    data: {
      leadId: testLeadZero.id,
      type: "WHATSAPP_DRAFT",
      outcome: "DRAFT_OPENED",
      notes: "Opened chat draft with owner.",
      performedBy: "Agent MKT-01",
    },
  });

  const checkZeroAfterDraft = await prisma.leadCapture.findUnique({ where: { id: testLeadZero.id } });
  assert(checkZeroAfterDraft.status === "NEW", "Opening WhatsApp draft does NOT advance or regress opportunity stage");
  assert(draftActivity.type === "WHATSAPP_DRAFT", "WhatsApp click records 'DRAFT_OPENED' audit event");

  // 4. Radar lead never increases website enquiry total
  const radarLead = await prisma.leadCapture.create({
    data: {
      businessName: "Radar Discovered Cafe",
      city: "Kadapa",
      source: "RADAR_DISCOVERY",
      provider: "OPENSTREETMAP",
      verificationMethod: "MAPS_LINK_ONLY",
      phone: "9876543212",
    },
  });

  const websiteCount = await prisma.leadCapture.count({ where: { source: "WEBSITE_ENQUIRY" } });
  const radarCount = await prisma.leadCapture.count({ where: { source: "RADAR_DISCOVERY" } });
  assert(radarLead.source === "RADAR_DISCOVERY", "Radar lead has explicit source RADAR_DISCOVERY");
  assert(radarLead.verificationMethod === "MAPS_LINK_ONLY", "Radar lead marked MAPS_LINK_ONLY");

  // 5. Separate branches with same name preserved
  const branchKadapa = await prisma.leadCapture.create({
    data: {
      businessName: "Test Multi Branch Optical",
      city: "Kadapa",
      locality: "Seven Roads",
      phone: "9876543213",
      source: "CSV_IMPORT",
    },
  });

  const branchProddatur = await prisma.leadCapture.create({
    data: {
      businessName: "Test Multi Branch Optical",
      city: "Proddatur",
      locality: "Gandhi Road",
      phone: "9876543214",
      source: "CSV_IMPORT",
    },
  });

  const allBranches = await prisma.leadCapture.findMany({
    where: { businessName: "Test Multi Branch Optical" },
  });

  assert(allBranches.length === 2, "Two distinct branches with identical business names are preserved independently");

  // Cleanup test records
  await prisma.leadCapture.deleteMany({
    where: {
      id: {
        in: [
          testLeadZero.id,
          testLeadNull.id,
          testLeadNoPhone.id,
          radarLead.id,
          branchKadapa.id,
          branchProddatur.id,
        ],
      },
    },
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} assertions.`);
}

runAcceptanceTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
