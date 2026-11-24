import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\Mohan\\.gemini\\antigravity\\brain\\962ee673-b5ae-48a3-82ab-02f579fd6d72\\screenshots";

const TARGETS = [
  { name: "baseline_home_desktop", url: "http://localhost:3000", width: 1440, height: 900 },
  { name: "baseline_home_mobile", url: "http://localhost:3000", width: 390, height: 844 },
  { name: "baseline_customer_mobile", url: "http://localhost:3000/r/new-roshan-tours-and-travels", width: 390, height: 844 },
  { name: "baseline_customer_golden_mobile", url: "http://localhost:3000/r/golden-hair-wig-studio", width: 390, height: 844 },
  { name: "baseline_login_desktop", url: "http://localhost:3000/login", width: 1440, height: 900 },
];

async function capture() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const t of TARGETS) {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: t.width, height: t.height, deviceScaleFactor: 2 });
      await page.goto(t.url, { waitUntil: "networkidle2", timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1000));
      const filePath = path.join(OUTPUT_DIR, `${t.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Captured: ${t.name} -> ${filePath}`);
      await page.close();
    } catch (err) {
      console.error(`Failed ${t.name}:`, err.message);
    }
  }

  await browser.close();
}

capture().catch(console.error);
