import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\Mohan\\.gemini\\antigravity\\brain\\962ee673-b5ae-48a3-82ab-02f579fd6d72\\screenshots";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // 1. Homepage Desktop
  {
    console.log("Capturing after_home_desktop...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, "after_home_desktop.png") });
    await page.close();
  }

  // 2. Homepage Mobile
  {
    console.log("Capturing after_home_mobile...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, "after_home_mobile.png") });
    await page.close();
  }

  // 3. Field Agent Mobile (Moment 1: types City Grafix, previews standee)
  {
    console.log("Capturing after_agent_mobile...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3000/agent", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    // Click on City Grafix preset by looking through buttons
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const cityBtn = btns.find((b) => b.innerText.includes("City Grafix"));
      if (cityBtn) cityBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, "after_agent_mobile.png") });
    await page.close();
  }

  // 4. Customer Mobile for Golden Hair Wig Studio - Nandyal (Image 1 merchant)
  {
    console.log("Capturing after_customer_golden_mobile...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3000/r/golden-hair-wig-studio-nandyal", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    // Click 5th star
    const stars = await page.$$("button[aria-label*='Rate']");
    if (stars.length >= 5) {
      await stars[4].click();
      await new Promise((r) => setTimeout(r, 800));
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, "after_customer_golden_mobile.png") });
    await page.close();
  }

  // 5. Customer Mobile for New Roshan Tours & Travels (Image 2 & 3 merchant)
  {
    console.log("Capturing after_customer_roshan_mobile...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3000/r/new-roshan-tours-and-travels", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    const stars = await page.$$("button[aria-label*='Rate']");
    if (stars.length >= 5) {
      await stars[4].click();
      await new Promise((r) => setTimeout(r, 800));
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, "after_customer_roshan_mobile.png") });
    await page.close();
  }

  // 6. Customer Mobile at 1 Star (Moment 2: verify 1-star draft + explicit Google handoff + private feedback)
  {
    console.log("Capturing after_customer_1star_mobile...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3000/r/golden-hair-wig-studio-nandyal", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    const stars = await page.$$("button[aria-label*='Rate']");
    if (stars.length >= 1) {
      await stars[0].click();
      await new Promise((r) => setTimeout(r, 800));
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, "after_customer_1star_mobile.png") });
    await page.close();
  }

  // 7. Login Page Desktop
  {
    console.log("Capturing after_login_desktop...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUTPUT_DIR, "after_login_desktop.png") });
    await page.close();
  }

  console.log("All screenshots captured successfully!");
  await browser.close();
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
