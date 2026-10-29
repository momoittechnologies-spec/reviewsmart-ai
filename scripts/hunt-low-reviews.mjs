import puppeteer from 'puppeteer-core';
import { PrismaClient } from '@prisma/client';

const SUPABASE_POOLER_URL =
  'postgresql://postgres.vjatoeqdlnjsjkkezxob:NFq6EOKBbjdOOBVY@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
process.env.DATABASE_URL = process.env.DATABASE_URL || SUPABASE_POOLER_URL;

const prisma = new PrismaClient();

// Parse command line arguments: e.g. --city Kadapa --category "dental clinics" --maxReviews 40
const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return defaultValue;
}

const targetCity = getArg('city', 'Kadapa');
const targetCategory = getArg('category', 'dental clinics');
const maxReviews = parseInt(getArg('maxReviews', '50'), 10);

async function huntLowReviewLeads() {
  console.log('====================================================');
  console.log(`🎯 ReviewSmart AI — Zero-Cost Low-Review Lead Hunter`);
  console.log(`   City: ${targetCity}`);
  console.log(`   Category: ${targetCategory}`);
  console.log(`   Filter: Businesses with < ${maxReviews} Google reviews`);
  console.log('====================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--lang=en-US,en']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const query = `${targetCategory} in ${targetCity}`;
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  console.log(`🔍 Searching Google Maps: ${searchUrl}`);

  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 35000 });

  try {
    await page.waitForSelector('div[role="feed"]', { timeout: 8000 });
  } catch (e) {}

  // Scroll down feed 4 times to uncover more businesses
  for (let s = 0; s < 4; s++) {
    await page.evaluate(() => {
      const feed = document.querySelector('div[role="feed"]');
      if (feed) feed.scrollTop += 2200;
    });
    await new Promise((r) => setTimeout(r, 1200));
  }

  // Extract places
  const rawResults = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll('div[role="article"], div.Nv2PK');
    elements.forEach((el) => {
      const name = el.querySelector('div.qBF1Pd, div.fontHeadlineSmall')?.innerText?.trim();
      const ratingText = el.querySelector('span.MW4etd')?.innerText?.trim();
      const reviewText = el.querySelector('span.UY7F9')?.innerText?.trim();
      const address = el.querySelector('div.W4Efsd:last-child')?.innerText?.trim();
      const link = el.querySelector('a.hfpxzc')?.getAttribute('href');

      if (name) {
        const rating = ratingText ? parseFloat(ratingText) : null;
        let reviewCount = null;
        if (reviewText) {
          const clean = reviewText.replace(/[^0-9]/g, '');
          if (clean) reviewCount = parseInt(clean, 10);
        }

        // Phone number regex from address text (Indian mobile & landline)
        const phoneMatch = address ? address.match(/(?:\+91[\-\s]?)?[0]?[6-9]\d{9}|08562\d{5,6}/) : null;

        items.push({
          name,
          rating,
          reviewCount,
          address: address || '',
          phone: phoneMatch ? phoneMatch[0].replace(/[^0-9]/g, '').slice(-10) : null,
          url: link || ''
        });
      }
    });
    return items;
  });

  await browser.close();

  // Filter for genuine low-review targets (< maxReviews)
  const qualifiedLeads = rawResults.filter((r) => r.reviewCount !== null && r.reviewCount < maxReviews);

  console.log(`\nFound ${rawResults.length} total listings on Google Maps.`);
  console.log(`🎯 ${qualifiedLeads.length} listings qualify as LOW-REVIEW TARGETS (< ${maxReviews} reviews)!\n`);

  let savedCount = 0;
  for (const lead of qualifiedLeads) {
    const deficit = 100 - (lead.reviewCount || 0);
    const notes = `Rating: ${lead.rating || 5.0}★ | Google Reviews: ${lead.reviewCount || 0} (Needs ${deficit} to reach 100). Address: ${lead.address}. Maps: ${lead.url}`;

    // Upsert into LeadCapture table so it instantly shows in the Admin Inbound CRM
    try {
      const cleanPhone = lead.phone || `000${Math.floor(1000000 + Math.random() * 9000000)}`;
      await prisma.leadCapture.create({
        data: {
          businessName: lead.name,
          city: targetCity,
          category: targetCategory,
          phone: cleanPhone,
          source: 'GOOGLE_MAPS_HUNTER',
          notes,
          status: 'NEW',
        },
      });
      savedCount++;
      console.log(`✅ [SAVED TO CRM] ${lead.name} (${lead.reviewCount} revs, ${lead.rating}★) ${lead.phone ? `📞 ${lead.phone}` : ''}`);
    } catch (dbErr) {
      // If duplicate or table issue, skip
    }
  }

  console.log(`\n🎉 DONE! Saved ${savedCount} low-review target leads to your ReviewSmart AI Inbound Leads CRM.`);
  console.log(`👉 Open: https://www.reviewsmart.online/admin/growth (Inbound Leads CRM tab) to start pitching on WhatsApp!`);
}

huntLowReviewLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
