import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "new-roshan-tours-and-travels";
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, logoUrl: true },
  });

  if (!business || !business.logoUrl) {
    console.log("Business not found or has no logo");
    return;
  }

  const rawLogo = business.logoUrl;
  console.log(`Original raw logo length: ${rawLogo.length.toLocaleString()} characters`);

  const commaIdx = rawLogo.indexOf(",");
  if (commaIdx !== -1) {
    const metaPart = rawLogo.slice(0, commaIdx);
    const mimeMatch = metaPart.match(/^data:([^;]+);base64/i);
    const contentType = mimeMatch ? mimeMatch[1] : "image/png";
    const base64Data = rawLogo.slice(commaIdx + 1).replace(/\s/g, "");
    const buffer = Buffer.from(base64Data, "base64");

    console.log(`Decoded Content-Type: ${contentType}`);
    console.log(`Decoded Binary Buffer size: ${buffer.length.toLocaleString()} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`Optimized logo URL: /api/business/${business.slug}/logo (${`/api/business/${business.slug}/logo`.length} characters)`);
    console.log(`Size reduction in HTML/RSC per instance: from ${rawLogo.length.toLocaleString()} chars down to ${`/api/business/${business.slug}/logo`.length} chars!`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
