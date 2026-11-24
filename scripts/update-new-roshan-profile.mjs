import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "new-roshan-tours-and-travels";
  console.log(`Updating profile for: ${slug}`);

  const updated = await prisma.business.update({
    where: { slug },
    data: {
      category: "Umrah & Hajj Pilgrimage Agency · Direct Saudia Flights & Guided Ziyarath",
      tagline: "Kadapa's Premier Umrah & Ziyarat Pilgrimage Partner · Direct Saudia Flights & 5-Star Walking Distance Hotels",
      website: "https://new-roshan-tours-and-travels.vercel.app/",
      tagChips: "Deluxe Saudia Umrah,5-Star Walking Hotels near Haram,Direct Saudia Flights,Guided Holy Ziyarath,Authentic Indian Buffet Meals,Fast Saudi e-Visa,Senior Citizen Care,Complimentary Luggage Kit,Experienced Muallim Guide,100% Price Transparency",
      keywords: "new roshan tours travels kadapa umrah packages 2026 hajj pilgrimage guided ziyarath direct saudia airlines flights hyderabad jeddah walking distance hotels haram sharif diyar alnada hotel indian hyderabadi buffet food free pilgrim kit luggage saudi evisa processing muallim guide kadapa travel agency",
      reviewPromptTone: "spiritually blessed, deeply grateful, peaceful, honest, elderly care, highly recommended",
    },
  });

  console.log("Successfully updated business profile:", {
    slug: updated.slug,
    category: updated.category,
    tagline: updated.tagline,
    website: updated.website,
    tagChips: updated.tagChips,
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
