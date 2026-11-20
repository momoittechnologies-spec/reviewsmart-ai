/**
 * One-shot onboarding seed: Golden Hair Wig Studio (Proddatur, AP)
 * Run: node scripts/create-merchant-golden-hair-wig-studio-proddatur.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Config ──────────────────────────────────────────────────────────────────
const MERCHANT_NAME     = "Golden Hair Wig Studio - Proddatur";
const OWNER_NAME        = "Swarup Maji";
const MERCHANT_PHONE    = "8617264888";   // Dedicated Proddatur branch login
const PRIMARY_PHONE     = "8617264887";   // Swarup Maji primary WhatsApp & call contact
const MERCHANT_EMAIL    = "swarupmaji888+proddatur@gmail.com";
const RAW_PIN           = "4888";         // 4-digit PIN for Proddatur merchant login
const AGENT_CODE        = "DIRECT_ADMIN"; // Direct admin onboarding
const PAID_AMOUNT       = 2999;
const PRIMARY_COLOR     = "#D97706";      // Luxury Amber Gold
const SLUG              = "golden-hair-wig-studio-proddatur";
const ADDRESS           = "Haji Syed Hussain St, DCSR Colony, Nadimpalli, Proddatur, Andhra Pradesh 516360";
const GOOGLE_PLACE_ID   = "ChIJa-uPQACHszsR2qmIIq8hVK4";
const GOOGLE_CID        = "12561702296725531098";
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJa-uPQACHszsR2qmIIq8hVK4";
const GOOGLE_MAPS_URL   = "https://share.google/k4nRUBOWRP3xQWPmq";
const WEBSITE_URL       = "https://www.goldenhairwigstudio.com";
const INSTAGRAM_URL     = "https://www.instagram.com/goldenhair_studio_kadapa/";
const FACEBOOK_URL      = "https://www.facebook.com/profile.php?id=100094629346808";
const TAG_CHIPS         = "Natural Hair Wigs,Hair Patch Fixing,Non-Surgical Hair Replacement,Ladies Hair Extensions,Gents Hair Wigs,Comfortable & Lightweight,Perfect Color Matching,Experienced Stylists,Affordable Pricing,Private Consultation";
const KEYWORDS          = "golden hair wig studio golden hair studio proddatur hair replacement hair wigs hair patch non surgical hair fixing hair weaving ladies gents hair wigs haji syed hussain street dcsr colony nadimpalli proddatur";
const CATEGORY          = "Hair Replacement & Non-Surgical Hair Fixing · Custom Wigs & Patches";
const TAGLINE           = "Look Younger... Feel Confident! 100% Natural Look Hair Wigs & Patches for Ladies & Gents in Proddatur";
const LOGO_URL          = "/logos/golden-hair-wig-studio-logo.png";

async function main() {
  console.log("\n🚀 Onboarding Merchant: Golden Hair Wig Studio (Proddatur, AP)\n");

  // 1. Hash PIN & password
  const hashedPin = await bcrypt.hash(RAW_PIN, 10);
  const hashedPassword = await bcrypt.hash(RAW_PIN, 10);

  // 2. Upsert merchant user
  let merchantUser = await prisma.user.findFirst({
    where: { OR: [{ userIdTag: MERCHANT_PHONE }, { phone: MERCHANT_PHONE }, { email: MERCHANT_EMAIL }] },
  });

  if (!merchantUser) {
    merchantUser = await prisma.user.create({
      data: {
        email: MERCHANT_EMAIL,
        name: "Golden Hair Wig Studio (Proddatur)",
        phone: MERCHANT_PHONE,
        userIdTag: MERCHANT_PHONE,
        pinCode: hashedPin,
        password: hashedPassword,
        role: "BUSINESS_OWNER",
        customerType: "ONLINE",
        isActive: true,
      },
    });
    console.log("✅ Created merchant user:", merchantUser.id);
  } else {
    merchantUser = await prisma.user.update({
      where: { id: merchantUser.id },
      data: {
        name: "Golden Hair Wig Studio (Proddatur)",
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
      ]
    }
  });

  const businessData = {
    userId: merchantUser.id,
    name: MERCHANT_NAME,
    slug: SLUG,
    tagline: TAGLINE,
    category: CATEGORY,
    customerType: "ONLINE",
    primaryColor: PRIMARY_COLOR,
    googlePlaceId: GOOGLE_PLACE_ID,
    googleReviewUrl: GOOGLE_REVIEW_URL,
    googleMapsUrl: GOOGLE_MAPS_URL,
    googleAddress: ADDRESS,
    phone: PRIMARY_PHONE,
    whatsapp: `91${PRIMARY_PHONE}`,
    instagram: INSTAGRAM_URL,
    facebook: FACEBOOK_URL,
    website: WEBSITE_URL,
    tagChips: TAG_CHIPS,
    keywords: KEYWORDS,
    minRatingForGoogle: 4,
    reviewPromptTone: "confident, delighted, natural look, highly recommended, professional",
    qrMode: "SMART_HUB",
    packageTier: "EXECUTIVE_STANDEE",
    logoUrl: LOGO_URL,
    isPaid: true,
    enableUpiPayments: true,
    enableSocialLinks: true,
    enableDigitalMenu: false,
    enableScratchCard: true,
    scratchCardMaxDiscount: 5,
    visitingCardPhone: `${PRIMARY_PHONE}`,
    visitingCardEmail: "swarupmaji888@gmail.com",
    visitingCardOwnerName: OWNER_NAME,
    visitingCardOwnerTitle: "Founder & Hair Specialist",
    visitingCardAddress: "Haji Syed Hussain St, DCSR Colony, Nadimpalli, Proddatur",
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

  // 4. Create or update UPI payment record (₹2,999 Paid)
  let upiPayment = await prisma.upiPayment.findFirst({
    where: { businessId: business.id }
  });

  if (!upiPayment) {
    upiPayment = await prisma.upiPayment.create({
      data: {
        userId: merchantUser.id,
        businessId: business.id,
        agentCode: AGENT_CODE,
        planType: "ONLINE_DIRECT",
        amount: PAID_AMOUNT,
        utrNumber: `PAID-${Date.now().toString().slice(-8)}`,
        customerPhone: PRIMARY_PHONE,
        status: "APPROVED",
        packageTier: "EXECUTIVE_STANDEE",
        notes: `New merchant onboarded with ₹${PAID_AMOUNT} payment. Business: Golden Hair Wig Studio, Proddatur.`,
      },
    });
    console.log("✅ Created payment record (APPROVED):", upiPayment.id);
  } else {
    upiPayment = await prisma.upiPayment.update({
      where: { id: upiPayment.id },
      data: {
        amount: PAID_AMOUNT,
        status: "APPROVED",
        customerPhone: PRIMARY_PHONE,
        notes: `New merchant onboarded with ₹${PAID_AMOUNT} payment. Business: Golden Hair Wig Studio, Proddatur.`,
      }
    });
    console.log("ℹ️  Updated payment record (APPROVED):", upiPayment.id);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("🎉 Golden Hair Wig Studio (Proddatur) successfully onboarded!");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`📱 Proddatur Login (User ID): ${MERCHANT_PHONE}`);
  console.log(`🔑 Merchant 4-digit PIN:     ${RAW_PIN}`);
  console.log(`📞 Primary Store Phone:      ${PRIMARY_PHONE}`);
  console.log(`✉️ Merchant Email:           ${MERCHANT_EMAIL}`);
  console.log(`🔗 Review Hub URL:           https://www.reviewsmart.online/r/${SLUG}`);
  console.log(`📍 Google Place ID:          ${GOOGLE_PLACE_ID}`);
  console.log(`⭐ Google Review URL:        ${GOOGLE_REVIEW_URL}`);
  console.log(`🗺️ Google Maps Profile:      ${GOOGLE_MAPS_URL}`);
  console.log(`🌐 Official Website:         ${WEBSITE_URL}`);
  console.log(`📸 Instagram Handle:         ${INSTAGRAM_URL}`);
  console.log(`📘 Facebook Page:            ${FACEBOOK_URL}`);
  console.log(`💰 Paid Status:              ₹${PAID_AMOUNT} (APPROVED / 100% Active)`);
  console.log(`🎨 Logo URL:                 ${LOGO_URL}`);
  console.log(`🎁 Scratch Card Reward:      Up to 5% Discount Enabled`);
  console.log("════════════════════════════════════════════════════════════\n");
}

main()
  .catch((err) => { console.error("❌ Fatal error:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
