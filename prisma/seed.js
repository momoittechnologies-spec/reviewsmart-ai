const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Platform Settings
  await prisma.platformSetting.upsert({
    where: { id: "default" },
    update: {
      upiId: "9036909110@apl",
      upiPayeeName: "Damerla Mohan",
      supportEmail: "support@reviewsmart.online",
      minNegotiatedPrice: 2999,
    },
    create: {
      id: "default",
      platformName: "ReviewSmart AI",
      supportEmail: "support@reviewsmart.online",
      currencySymbol: "₹",
      upiId: "9036909110@apl",
      upiPayeeName: "Damerla Mohan",
      minNegotiatedPrice: 2999,
    },
  });

  // 2. Subscription Plans (INR with Launch Offers)
  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "plan_starter" },
    update: {
      name: "1 Month Digital Pass",
      price: 299.0,
      currency: "INR",
      durationDays: 30,
      maxCards: 1,
      features: JSON.stringify([
        "1 Smart AI QR Review Card",
        "Gemini AI Review Generator",
        "Negative Review Shield (1-3 stars)",
        "Print Studio (PDF/SVG Stand & Card)",
        "Direct UPI Activation (0% fee)",
      ]),
      isActive: true,
    },
    create: {
      id: "plan_starter",
      name: "1 Month Digital Pass",
      price: 299.0,
      currency: "INR",
      durationDays: 30,
      maxCards: 1,
      features: JSON.stringify([
        "1 Smart AI QR Review Card",
        "Gemini AI Review Generator",
        "Negative Review Shield (1-3 stars)",
        "Print Studio (PDF/SVG Stand & Card)",
        "Direct UPI Activation (0% fee)",
      ]),
      isActive: true,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "plan_pro" },
    update: {
      name: "1 Year / Lifetime Pass",
      price: 1999.0,
      currency: "INR",
      durationDays: 3650,
      maxCards: 1,
      features: JSON.stringify([
        "Special Launch Offer: was ₹3,999 (Save ₹2,000!)",
        "Full 1 Year / Lifetime Uninterrupted Access",
        "1 Business Location License (1 Card)",
        "Gemini AI Unlimited Review Generations",
        "Print Studio: Unlimited Acrylic Stands & Cards",
        "AI Review Reply Assistant for Google Maps",
        "0% Fee Direct UPI Payment",
      ]),
      isActive: true,
    },
    create: {
      id: "plan_pro",
      name: "1 Year / Lifetime Pass",
      price: 1999.0,
      currency: "INR",
      durationDays: 3650,
      maxCards: 1,
      features: JSON.stringify([
        "Special Launch Offer: was ₹3,999 (Save ₹2,000!)",
        "Full 1 Year / Lifetime Uninterrupted Access",
        "1 Business Location License (1 Card)",
        "Gemini AI Unlimited Review Generations",
        "Print Studio: Unlimited Acrylic Stands & Cards",
        "AI Review Reply Assistant for Google Maps",
        "0% Fee Direct UPI Payment",
      ]),
      isActive: true,
    },
  });

  // Additional Branch / Multi-Location Pass (Only ₹99 per Extra Branch, Unlimited Branches)
  const addonPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "plan_addon" },
    update: {
      name: "Additional Branch Location Pass (₹99/branch)",
      price: 99.0,
      currency: "INR",
      durationDays: 3650,
      maxCards: 999,
      features: JSON.stringify([
        "1 Additional Store / Branch Review Card (Only ₹99)",
        "No Limit: Add as many branches as you operate",
        "Separate Google Place ID & Review Funnel",
        "Unlimited AI Review Generations for Branch",
        "Print Studio Access for Branch Stand (PDF & 300 DPI)",
        "Direct UPI Activation (0% Fee)",
      ]),
      isActive: true,
    },
    create: {
      id: "plan_addon",
      name: "Additional Branch Location Pass (₹99/branch)",
      price: 99.0,
      currency: "INR",
      durationDays: 3650,
      maxCards: 999,
      features: JSON.stringify([
        "1 Additional Store / Branch Review Card (Only ₹99)",
        "No Limit: Add as many branches as you operate",
        "Separate Google Place ID & Review Funnel",
        "Unlimited AI Review Generations for Branch",
        "Print Studio Access for Branch Stand (PDF & 300 DPI)",
        "Direct UPI Activation (0% Fee)",
      ]),
      isActive: true,
    },
  });

  // Deactivate old agency reseller plan if present
  try {
    await prisma.subscriptionPlan.updateMany({
      where: { id: "plan_agency" },
      data: { isActive: false },
    });
  } catch (e) {}

  // 3. Super Admin (Email & Password Only) - Main Owner: momoit.technologies@gmail.com
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminPin = await bcrypt.hash("1234", 10);

  // Revoke and remove access for legacy admin@reviewsmart.ai if present
  try {
    await prisma.user.deleteMany({
      where: { email: "admin@reviewsmart.ai" },
    });
  } catch (e) {
    await prisma.user.updateMany({
      where: { email: "admin@reviewsmart.ai" },
      data: { isActive: false, role: "REVOKED" },
    });
  }

  const mainAdmin = await prisma.user.upsert({
    where: { email: "momoit.technologies@gmail.com" },
    update: {
      name: "MOMO IT Technologies",
      password: adminPassword,
      pinCode: adminPin,
      userIdTag: "momoit",
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      email: "momoit.technologies@gmail.com",
      name: "MOMO IT Technologies",
      password: adminPassword,
      pinCode: adminPin,
      userIdTag: "momoit",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  // 4. Marketing Agent (Field Sales Rep: Subrahmanyam, MKT-01, PIN: 1234)
  const agentPin = await bcrypt.hash("1234", 10);
  const agentUser = await prisma.user.upsert({
    where: { userIdTag: "MKT-01" },
    update: {
      name: "Subrahmanyam",
      agentCode: "MKT-01",
      phone: "6305053832",
      pinCode: agentPin,
      role: "MARKETING_AGENT",
      isActive: true,
    },
    create: {
      email: "mkt01@agent.reviewsmart.local",
      name: "Subrahmanyam",
      agentCode: "MKT-01",
      userIdTag: "MKT-01",
      phone: "6305053832",
      pinCode: agentPin,
      password: agentPin,
      role: "MARKETING_AGENT",
      isActive: true,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
