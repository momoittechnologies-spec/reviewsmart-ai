/**
 * One-shot onboarding seed: Her Choice (Kadapa, AP)
 * Run: node scripts/create-merchant-her-choice.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Config ──────────────────────────────────────────────────────────────────
const MERCHANT_NAME     = "Her Choice";
const OWNER_NAME        = "Her Choice Kadapa";
const MERCHANT_PHONE    = "9032897676";
const RAW_PIN           = "7676";         // 4-digit PIN for merchant login
const AGENT_CODE        = "DIRECT_ADMIN"; // Offline direct sale
const OFFLINE_PRICE     = 3000;
const PRIMARY_COLOR     = "#E11D48";      // Rose Gold / Luxury Jewelry
const SLUG              = "her-choice-kadapa";
const ADDRESS           = "Near Apollo Pharmacy, Beside NGO Colony, Chinna Chowk, Kadapa, Andhra Pradesh – 516002";
const GOOGLE_PLACE_ID   = "ChIJmd0QeABtszsR2ygj6nHEsDg";
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJmd0QeABtszsR2ygj6nHEsDg";
const GOOGLE_MAPS_URL   = "https://www.google.com/maps?cid=4084980855563561179";
const INSTAGRAM_URL     = "https://www.instagram.com/her.choice.kadapa/";
const TAG_CHIPS         = "1-Gram Gold Jewellery,Korean Accessories,Anti-Tarnish Kadas,Bridal Jewellery,Fancy Chains,Stone Earrings,Finger Rings,Gift Hampers,Affordable Prices,Friendly Staff";
const KEYWORDS          = "her choice kadapa jewellery beauty 1 gram gold korean accessories bridal sets anti tarnish kada ngo colony chinna chowk kadapa earrings gift hampers fashion jewellery";
const CATEGORY          = "Jewellery & Beauty Store · 1-Gram Gold & Korean Accessories";
const TAGLINE           = "Jewellery that makes every moment special! Premium 1-Gram Gold, Bridal Sets & Korean Accessories in Kadapa";
const LOGO_URL          = "/logos/her-choice-logo.jpg";

async function main() {
  console.log("\n🚀 Onboarding Merchant: Her Choice (Kadapa, AP)\n");

  // 1. Hash PIN & password
  const hashedPin = await bcrypt.hash(RAW_PIN, 10);
  const hashedPassword = await bcrypt.hash(RAW_PIN, 10);

  // 2. Upsert merchant user
  let merchantUser = await prisma.user.findFirst({
    where: { OR: [{ userIdTag: MERCHANT_PHONE }, { phone: MERCHANT_PHONE }] },
  });

  if (!merchantUser) {
    merchantUser = await prisma.user.create({
      data: {
        email: `${MERCHANT_PHONE}@merchant.reviewsmart.local`,
        name: OWNER_NAME,
        phone: MERCHANT_PHONE,
        userIdTag: MERCHANT_PHONE,
        pinCode: hashedPin,
        password: hashedPassword,
        role: "BUSINESS_OWNER",
        customerType: "OFFLINE",
        isActive: true,
      },
    });
    console.log("✅ Created merchant user:", merchantUser.id);
  } else {
    merchantUser = await prisma.user.update({
      where: { id: merchantUser.id },
      data: {
        name: OWNER_NAME,
        phone: MERCHANT_PHONE,
        userIdTag: MERCHANT_PHONE,
        pinCode: hashedPin,
        password: hashedPassword,
        isActive: true,
      },
    });
    console.log("ℹ️  Updated merchant user:", merchantUser.id);
  }

  // 3. Upsert business record
  let business = await prisma.business.findFirst({
    where: {
      OR: [
        { slug: SLUG },
        { name: MERCHANT_NAME },
        { phone: MERCHANT_PHONE }
      ]
    }
  });

  const businessData = {
    userId: merchantUser.id,
    name: MERCHANT_NAME,
    slug: SLUG,
    tagline: TAGLINE,
    category: CATEGORY,
    customerType: "OFFLINE",
    primaryColor: PRIMARY_COLOR,
    googlePlaceId: GOOGLE_PLACE_ID,
    googleReviewUrl: GOOGLE_REVIEW_URL,
    googleMapsUrl: GOOGLE_MAPS_URL,
    googleAddress: ADDRESS,
    phone: MERCHANT_PHONE,
    whatsapp: `91${MERCHANT_PHONE}`,
    instagram: INSTAGRAM_URL,
    tagChips: TAG_CHIPS,
    keywords: KEYWORDS,
    minRatingForGoogle: 4,
    reviewPromptTone: "delighted, stylish, elegant, highly satisfied",
    qrMode: "SMART_HUB",
    packageTier: "EXECUTIVE_STANDEE",
    logoUrl: LOGO_URL,
    isPaid: true,
    visitingCardPhone: MERCHANT_PHONE,
    visitingCardOwnerName: OWNER_NAME,
    visitingCardOwnerTitle: "Proprietor",
  };

  if (!business) {
    business = await prisma.business.create({
      data: businessData,
    });
    console.log("✅ Created business:", business.id, "| Slug:", SLUG);
  } else {
    business = await prisma.business.update({
      where: { id: business.id },
      data: businessData,
    });
    console.log("ℹ️  Updated business:", business.id, "| Slug:", SLUG);
  }

  // 4. Create or update UPI payment record (₹3,000 Offline Paid)
  let upiPayment = await prisma.upiPayment.findFirst({
    where: { businessId: business.id }
  });

  if (!upiPayment) {
    upiPayment = await prisma.upiPayment.create({
      data: {
        userId: merchantUser.id,
        businessId: business.id,
        agentCode: AGENT_CODE,
        planType: "NEGOTIATED_DEAL",
        amount: OFFLINE_PRICE,
        utrNumber: `OFFLINE-${Date.now().toString().slice(-8)}`,
        customerPhone: MERCHANT_PHONE,
        status: "APPROVED",
        packageTier: "EXECUTIVE_STANDEE",
        notes: `Offline deal paid ₹${OFFLINE_PRICE}. Business: Her Choice, NGO Colony, Chinna Chowk, Kadapa.`,
      },
    });
    console.log("✅ Created payment record (APPROVED):", upiPayment.id);
  } else {
    upiPayment = await prisma.upiPayment.update({
      where: { id: upiPayment.id },
      data: {
        amount: OFFLINE_PRICE,
        status: "APPROVED",
        customerPhone: MERCHANT_PHONE,
        notes: `Offline deal paid ₹${OFFLINE_PRICE}. Business: Her Choice, NGO Colony, Chinna Chowk, Kadapa.`,
      }
    });
    console.log("ℹ️  Updated payment record (APPROVED):", upiPayment.id);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("🎉 Her Choice (Kadapa) successfully onboarded!");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`📱 Merchant Phone (User ID):  ${MERCHANT_PHONE}`);
  console.log(`🔑 Merchant 4-digit PIN:     ${RAW_PIN}`);
  console.log(`🔗 Review Hub URL:           https://reviewsmart.online/r/${SLUG}`);
  console.log(`📍 Google Place ID:          ${GOOGLE_PLACE_ID}`);
  console.log(`⭐ Google Review URL:        ${GOOGLE_REVIEW_URL}`);
  console.log(`🗺️ Google Maps Profile:      ${GOOGLE_MAPS_URL}`);
  console.log(`📸 Instagram Handle:         ${INSTAGRAM_URL}`);
  console.log(`💰 Paid Status:              ₹${OFFLINE_PRICE} (APPROVED / 100% Active)`);
  console.log(`🎨 Logo URL:                 ${LOGO_URL}`);
  console.log("════════════════════════════════════════════════════════════\n");
}

main()
  .catch((err) => { console.error("❌ Fatal error:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
