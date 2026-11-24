import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const b = await prisma.business.findUnique({
    where: { slug: "new-roshan-tours-and-travels" }
  });

  for (const [k, v] of Object.entries(b || {})) {
    if (typeof v === "string" && v.length > 500) {
      console.log(k, "length:", v.length, "starts with:", v.slice(0, 50));
    }
  }

  // Also check all other businesses in DB!
  const all = await prisma.business.findMany();
  console.log("\nChecking all businesses for large fields:");
  for (const biz of all) {
    for (const [k, v] of Object.entries(biz)) {
      if (typeof v === "string" && v.length > 1000) {
        console.log(`[${biz.slug}] ${k} length: ${v.length}`);
      }
    }
  }
}

main().finally(() => prisma.$disconnect());
