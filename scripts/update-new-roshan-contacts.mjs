import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "new-roshan-tours-and-travels";
  console.log(`Fetching business record for: ${slug}`);

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    console.error(`Business not found for slug: ${slug}`);
    process.exit(1);
  }

  console.log("Current business data:", {
    name: business.name,
    phone: business.phone,
    whatsapp: business.whatsapp,
    visitingCardPhone: business.visitingCardPhone,
  });

  // Update business phone & visitingCardPhone to include both contacts
  const updated = await prisma.business.update({
    where: { slug },
    data: {
      phone: "9059057239 / 9959578900",
      visitingCardPhone: "9059057239 / 9959578900",
    },
  });

  console.log("Updated business data:", {
    name: updated.name,
    phone: updated.phone,
    whatsapp: updated.whatsapp,
    visitingCardPhone: updated.visitingCardPhone,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
