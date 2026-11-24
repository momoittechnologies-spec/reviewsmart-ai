import puppeteer from "puppeteer-core";
import path from "path";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\Mohan\\.gemini\\antigravity\\brain\\962ee673-b5ae-48a3-82ab-02f579fd6d72\\screenshots";
const JWT_SECRET = process.env.JWT_SECRET || "reviewsmart_super_secret_jwt_key_2026_change_in_prod";
const COOKIE_NAME = "review_ai_token";

async function run() {
  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!admin) throw new Error("No super admin user found");

  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      userIdTag: admin.userIdTag,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // 1. Growth CRM Desktop - Today's Follow-ups
  {
    console.log("Capturing after_growth_desktop...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    
    await page.setCookie({
      name: COOKIE_NAME,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
    });

    await page.goto("http://localhost:3000/admin/growth", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, "after_growth_desktop.png") });
    await page.close();
  }

  // 2. Growth CRM Mobile View
  {
    console.log("Capturing after_growth_mobile...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    
    await page.setCookie({
      name: COOKIE_NAME,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
    });

    await page.goto("http://localhost:3000/admin/growth", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, "after_growth_mobile.png") });
    await page.close();
  }

  await browser.close();
  await prisma.$disconnect();
  console.log("Screenshots captured successfully!");
}

run().catch(console.error);
