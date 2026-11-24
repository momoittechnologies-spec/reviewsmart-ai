/**
 * One-shot onboarding seed: New Roshan Tours & Travels (Kadapa, AP)
 * Run: node scripts/create-merchant-new-roshan-tours-and-travels.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Config ──────────────────────────────────────────────────────────────────
const MERCHANT_NAME     = "New Roshan Tours & Travels";
const OWNER_NAME        = "Shafi Shaik";
const USER_PHONE        = "9959578900";   // Primary merchant account user login
const MERCHANT_PHONE    = "9059057239 / 9959578900";   // Dual calling & WhatsApp contacts
const MERCHANT_EMAIL    = "9959578900@merchant.reviewsmart.local";
const RAW_PIN           = "8900";         // 4-digit PIN for merchant login
const AGENT_CODE        = "DIRECT_ADMIN"; // Direct admin onboarding
const PAID_AMOUNT       = 2999;
const PRIMARY_COLOR     = "#059669";      // Emerald Green (Pilgrimage & Travel)
const SLUG              = "new-roshan-tours-and-travels";
const ADDRESS           = "13/403-1, Rahmatullah Street, YV Street, Ganagapeta, Kadapa, Andhra Pradesh 516001";
const GOOGLE_PLACE_ID   = "ChIJgUHgPjpzszsRTYUDNrgZtC4";
const GOOGLE_CID        = "3365343100523480397";
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJgUHgPjpzszsRTYUDNrgZtC4";
const GOOGLE_MAPS_URL   = "https://share.google/odil5WTbGmas4G1dr";
const WEBSITE_URL       = "https://new-roshan-tours-and-travels.vercel.app/";
const INSTAGRAM_URL     = "https://www.instagram.com/newroshantoursandtravels/";
const FACEBOOK_URL      = null;
const TAG_CHIPS         = "Deluxe Saudia Umrah,5-Star Walking Hotels near Haram,Direct Saudia Flights,Guided Holy Ziyarath,Authentic Indian Buffet Meals,Fast Saudi e-Visa,Senior Citizen Care,Complimentary Luggage Kit,Experienced Muallim Guide,100% Price Transparency";
const KEYWORDS          = "new roshan tours travels kadapa umrah packages 2026 hajj pilgrimage guided ziyarath direct saudia airlines flights hyderabad jeddah walking distance hotels haram sharif diyar alnada hotel indian hyderabadi buffet food free pilgrim kit luggage saudi evisa processing muallim guide kadapa travel agency";
const CATEGORY          = "Umrah & Hajj Pilgrimage Agency · Direct Saudia Flights & Guided Ziyarath";
const TAGLINE           = "Kadapa's Premier Umrah & Ziyarat Pilgrimage Partner · Direct Saudia Flights & 5-Star Walking Distance Hotels";
const LOGO_URL          = null;

async function main() {
  console.log("\n🚀 Onboarding Merchant: New Roshan Tours & Travels (Kadapa, AP)\n");

  // 1. Hash PIN & password
  const hashedPin = await bcrypt.hash(RAW_PIN, 10);
  const hashedPassword = await bcrypt.hash(RAW_PIN, 10);

  // 2. Upsert merchant user
  let merchantUser = await prisma.user.findFirst({
    where: { OR: [{ userIdTag: USER_PHONE }, { phone: USER_PHONE }, { email: MERCHANT_EMAIL }] },
  });

  if (!merchantUser) {
    merchantUser = await prisma.user.create({
      data: {
        email: MERCHANT_EMAIL,
        name: "Shafi Shaik",
        phone: USER_PHONE,
        userIdTag: USER_PHONE,
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
        name: "Shafi Shaik",
        phone: USER_PHONE,
        userIdTag: USER_PHONE,
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
    facebook: FACEBOOK_URL,
    website: WEBSITE_URL,
    tagChips: TAG_CHIPS,
    keywords: KEYWORDS,
    minRatingForGoogle: 4,
    reviewPromptTone: "blessed, spiritual, peaceful journey, highly recommended, honest guidance, professional",
    qrMode: "SMART_HUB",
    packageTier: "EXECUTIVE_STANDEE",
    logoUrl: LOGO_URL,
    isPaid: true,
    enableUpiPayments: true,
    enableSocialLinks: true,
    enableDigitalMenu: false,
    enableScratchCard: true,
    scratchCardMaxDiscount: 5,
    visitingCardPhone: MERCHANT_PHONE,
    visitingCardEmail: "newroshantours@gmail.com",
    visitingCardOwnerName: OWNER_NAME,
    visitingCardOwnerTitle: "Managing Director & Pilgrimage Specialist",
    visitingCardAddress: "13/403-1, Rahmatullah St, YV St, Ganagapeta, Kadapa",
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
        notes: `New merchant onboarded with ₹${PAID_AMOUNT} payment. Business: New Roshan Tours & Travels, Kadapa.`,
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
        notes: `New merchant onboarded with ₹${PAID_AMOUNT} payment. Business: New Roshan Tours & Travels, Kadapa.`,
      }
    });
    console.log("ℹ️  Updated payment record (APPROVED):", upiPayment.id);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("🎉 New Roshan Tours & Travels (Kadapa) successfully onboarded!");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`📱 Merchant Phone (User ID):  ${MERCHANT_PHONE}`);
  console.log(`🔑 Merchant 4-digit PIN:     ${RAW_PIN}`);
  console.log(`👤 Owner Name:               ${OWNER_NAME}`);
  console.log(`✉️ Merchant Email:           ${MERCHANT_EMAIL}`);
  console.log(`🔗 Review Hub URL:           https://www.reviewsmart.online/r/${SLUG}`);
  console.log(`📍 Google Place ID:          ${GOOGLE_PLACE_ID}`);
  console.log(`⭐ Google Review URL:        ${GOOGLE_REVIEW_URL}`);
  console.log(`🗺️ Google Maps Profile:      ${GOOGLE_MAPS_URL}`);
  console.log(`📸 Instagram Handle:         ${INSTAGRAM_URL}`);
  console.log(`💰 Paid Status:              ₹${PAID_AMOUNT} (APPROVED / 100% Active)`);
  console.log(`🎁 Scratch Card Reward:      Up to 5% Discount Enabled`);
  console.log("════════════════════════════════════════════════════════════\n");
}

main()
  .catch((err) => { console.error("❌ Fatal error:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
