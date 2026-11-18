/**
 * One-shot onboarding seed: JS BROTHER'S GOLD (Kadapa, AP)
 * Run: node scripts/create-merchant-js-brothers-gold.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Config ──────────────────────────────────────────────────────────────────
const MERCHANT_NAME     = "JS BROTHER'S GOLD";
const OWNER_NAME        = "JS Brother's Gold";
const MERCHANT_PHONE    = "7995325224";
const RAW_PIN           = "5224";         // 4-digit PIN for merchant login
const AGENT_CODE        = "DIRECT_ADMIN"; // Direct admin onboarding
const PAID_AMOUNT       = 2999;
const PRIMARY_COLOR     = "#D97706";      // Luxury Amber Gold
const SLUG              = "js-brothers-gold";
const ADDRESS           = "H.No. 39/317-3-1 & 8, 3rd Floor, Y Junction, New Bus Stand Road, Main Road, Opposite Zudio Showroom, Vivekananda Nagar, Kadapa, Andhra Pradesh 516001";
const GOOGLE_PLACE_ID   = "ChIJub7cEKZzszsR1ndu-JYvlbA";
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJub7cEKZzszsR1ndu-JYvlbA";
const GOOGLE_MAPS_URL   = "https://maps.app.goo.gl/X6kq4UnsgiViFQ5T7";
const INSTAGRAM_URL     = "https://www.instagram.com/js_brothers_gold";
const WEBSITE_URL       = "https://jsbrothers-gold-momo-1804.vercel.app/";
const TAG_CHIPS         = "Old Gold Buying,Broken Gold Buying,Pledged Gold Release,Instant Cash Transfer,Accurate Precision Scale,Transparent Valuation,Best Market Rates,Professional Staff,Quick 10-Min Process,Safe & Secure";
const KEYWORDS          = "js brothers gold kadapa gold buyers old gold buying broken gold pledged gold release valuation instant cash y junction opposite zudio new bus stand road simhapuri colony vivekananda nagar";
const CATEGORY          = "Jewelry Buyer & Gold Valuation · Pledged Gold Release Assistance";
const TAGLINE           = "Kadapa's Premier Gold Buyers & Transparent Valuation · Instant Cash for Old & Pledged Gold";
const LOGO_URL          = "/logos/js-brothers-gold-logo.png";

async function main() {
  console.log("\n🚀 Onboarding Merchant: JS BROTHER'S GOLD (Kadapa, AP)\n");

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
        customerType: "ONLINE",
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
    customerType: "ONLINE",
    primaryColor: PRIMARY_COLOR,
    googlePlaceId: GOOGLE_PLACE_ID,
    googleReviewUrl: GOOGLE_REVIEW_URL,
    googleMapsUrl: GOOGLE_MAPS_URL,
    googleAddress: ADDRESS,
    phone: MERCHANT_PHONE,
    whatsapp: `91${MERCHANT_PHONE}`,
    instagram: INSTAGRAM_URL,
    website: WEBSITE_URL,
    tagChips: TAG_CHIPS,
    keywords: KEYWORDS,
    minRatingForGoogle: 4,
    reviewPromptTone: "professional, trusted, transparent, prompt payment, highly satisfied",
    qrMode: "SMART_HUB",
    packageTier: "EXECUTIVE_STANDEE",
    logoUrl: LOGO_URL,
    isPaid: true,
    enableUpiPayments: true,
    enableSocialLinks: true,
    enableDigitalMenu: false,
    enableScratchCard: false,
    visitingCardPhone: MERCHANT_PHONE,
    visitingCardOwnerName: OWNER_NAME,
    visitingCardOwnerTitle: "Proprietor",
    visitingCardAddress: "Y Junction, Opposite Zudio, Main Road, Kadapa",
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
        customerPhone: MERCHANT_PHONE,
        status: "APPROVED",
        packageTier: "EXECUTIVE_STANDEE",
        notes: `New merchant onboarded with ₹${PAID_AMOUNT} payment. Business: JS BROTHER'S GOLD, Kadapa.`,
      },
    });
    console.log("✅ Created payment record (APPROVED):", upiPayment.id);
  } else {
    upiPayment = await prisma.upiPayment.update({
      where: { id: upiPayment.id },
      data: {
        amount: PAID_AMOUNT,
        status: "APPROVED",
        customerPhone: MERCHANT_PHONE,
        notes: `New merchant onboarded with ₹${PAID_AMOUNT} payment. Business: JS BROTHER'S GOLD, Kadapa.`,
      }
    });
    console.log("ℹ️  Updated payment record (APPROVED):", upiPayment.id);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("🎉 JS BROTHER'S GOLD (Kadapa) successfully onboarded!");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`📱 Merchant Phone (User ID):  ${MERCHANT_PHONE}`);
  console.log(`🔑 Merchant 4-digit PIN:     ${RAW_PIN}`);
  console.log(`🔗 Review Hub URL:           https://reviewsmart.online/r/${SLUG}`);
  console.log(`📍 Google Place ID:          ${GOOGLE_PLACE_ID}`);
  console.log(`⭐ Google Review URL:        ${GOOGLE_REVIEW_URL}`);
  console.log(`🗺️ Google Maps Profile:      ${GOOGLE_MAPS_URL}`);
  console.log(`📸 Instagram Handle:         ${INSTAGRAM_URL}`);
  console.log(`🌐 Website URL:              ${WEBSITE_URL}`);
  console.log(`💰 Paid Status:              ₹${PAID_AMOUNT} (APPROVED / 100% Active)`);
  console.log(`🎨 Logo URL:                 ${LOGO_URL}`);
  console.log("════════════════════════════════════════════════════════════\n");
}

main()
  .catch((err) => { console.error("❌ Fatal error:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
