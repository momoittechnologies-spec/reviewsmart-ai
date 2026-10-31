/**
 * One-shot onboarding seed: Evania Luxury Unisex Salon & Aesthetics (Madhapur, Hyderabad)
 * Run: node scripts/create-merchant-evania.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Config ──────────────────────────────────────────────────────────────────
const MERCHANT_NAME    = "Evania Luxury Unisex Salon & Aesthetics";
const MERCHANT_PHONE   = "8341017657";
const RAW_PIN          = "1765";         // 4-digit PIN for merchant login
const AGENT_CODE       = "DIRECT_ADMIN"; // Offline direct sale
const OFFLINE_PRICE    = 3000;
const PRIMARY_COLOR    = "#D4AF37";      // Luxury Gold
const SLUG             = "evania-luxury-salon";
const ADDRESS          = "No. 1, PR Heights, Pillar no. C1732, Beside Big C Mobile Store, Megha Hills, Madhapur, Hyderabad, Telangana – 500081";
const GOOGLE_PLACE_ID  = "ChIJY8WhWVmTyzsRUz83m4gzT_0";
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJY8WhWVmTyzsRUz83m4gzT_0";
const GOOGLE_MAPS_URL  = "https://www.google.com/maps?client=safari&hs=4PFW&sca_esv=2d151d6e027febbb&hl=en-in&cs=0&kgmid=/g/11wxkrqx2x&shem=epsd1,ltae,rimspwouoe&shndl=30&kgs=92050d4f8d8d1be9&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KWPFoVlZk8s7MVM_N5uIM0_9&daddr=H+No:+1,+PR+heights,+Pillar+no:+C1732,+98/90/25/k,+beside+Big+C+Mobile+store,+Megha+Hills,+Madhapur,+Hyderabad,+Telangana+500081";
const TAG_CHIPS        = "Hair Styling,Keratin & Botox,HydraFacial,Bridal Makeup,Gel Nails & Extensions,Men's Grooming,Hair Colour & Balayage,Tattoos & Piercing,Luxury Ambiance,Expert Stylists";
const KEYWORDS         = "evania luxury unisex salon aesthetics madhapur hyderabad hair styling keratin treatment hydrafacial bridal makeup nail art extensions balayage haircut pr heights megha hills c1732";
const CATEGORY         = "Luxury Unisex Salon, Hair, Skin, Nails & Aesthetics";
const TAGLINE          = "Premier Luxury Unisex Salon & Aesthetics in Madhapur | Hair · Skin · Nails · Grooming";
const LOGO_URL         = "/logos/evania-logo.png";
const WEBSITE          = "https://evanialuxury.com";
const INSTAGRAM        = "https://www.instagram.com/evania_luxurysalonaesthetics/";

async function main() {
  console.log("\n🚀 Onboarding Merchant: Evania Luxury Unisex Salon & Aesthetics (Madhapur, Hyderabad)\n");

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
        name: MERCHANT_NAME,
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
        name: MERCHANT_NAME,
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
    website: WEBSITE,
    instagram: INSTAGRAM,
    tagChips: TAG_CHIPS,
    keywords: KEYWORDS,
    minRatingForGoogle: 4,
    reviewPromptTone: "luxurious, delighted, professional, premium",
    qrMode: "SMART_HUB",
    menuUrl: WEBSITE,
    packageTier: "EXECUTIVE_STANDEE",
    logoUrl: LOGO_URL,
    isPaid: true,
    visitingCardPhone: MERCHANT_PHONE,
    visitingCardOwnerName: "Evania Luxury Salon",
    visitingCardOwnerTitle: "Salon & Aesthetics Team",
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
        notes: `Offline deal paid ₹${OFFLINE_PRICE}. Business: Evania Luxury Unisex Salon & Aesthetics, Madhapur, Hyderabad.`,
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
        notes: `Offline deal paid ₹${OFFLINE_PRICE}. Business: Evania Luxury Unisex Salon & Aesthetics, Madhapur, Hyderabad.`,
      }
    });
    console.log("ℹ️  Updated payment record (APPROVED):", upiPayment.id);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("🎉 Evania Luxury Unisex Salon successfully onboarded into ReviewSmart AI!");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`📱 Merchant Phone (User ID):  ${MERCHANT_PHONE}`);
  console.log(`🔑 Merchant 4-digit PIN:     ${RAW_PIN}`);
  console.log(`🔗 Review Hub URL:           https://reviewsmart.online/r/${SLUG}`);
  console.log(`📍 Google Place ID:          ${GOOGLE_PLACE_ID}`);
  console.log(`⭐ Google Review URL:        ${GOOGLE_REVIEW_URL}`);
  console.log(`💰 Paid Status:              ₹${OFFLINE_PRICE} (APPROVED / 100% Active)`);
  console.log(`🎨 Logo URL:                 ${LOGO_URL}`);
  console.log(`🏷️  Active Tag Chips:        ${TAG_CHIPS}`);
  console.log("════════════════════════════════════════════════════════════\n");
}

main()
  .catch((err) => { console.error("❌ Fatal error:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
