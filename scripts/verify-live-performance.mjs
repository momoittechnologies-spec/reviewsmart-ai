async function testMerchant(slug) {
  const url = `https://www.reviewsmart.online/r/${slug}`;
  const start = Date.now();
  try {
    const res = await fetch(url, { headers: { "User-Agent": "PerformanceTest/1.0" } });
    const elapsed = Date.now() - start;
    const text = await res.text();
    const sizeKB = (Buffer.byteLength(text, "utf8") / 1024).toFixed(1);

    console.log(`\n--- [${slug}] ---`);
    console.log(`Status: ${res.status}`);
    console.log(`Time to load: ${elapsed}ms`);
    console.log(`HTML Payload Size: ${sizeKB} KB (${Buffer.byteLength(text, "utf8").toLocaleString()} bytes)`);

    const hasBase64Logo = text.includes("data:image/png;base64") || text.includes("data:image/jpeg;base64");
    console.log(`Has raw base64 logo in HTML: ${hasBase64Logo ? "YES (Old version)" : "NO (Optimized!)"}`);

    const hasCleanLogoEndpoint = text.includes(`/api/business/`) || text.includes(`/api/logo/`);
    console.log(`Uses dedicated logo endpoint: ${hasCleanLogoEndpoint ? "YES" : "NO"}`);
    return { status: res.status, sizeKB, elapsed, hasBase64Logo };
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
    return null;
  }
}

async function testLogoEndpoint(slug) {
  const url = `https://www.reviewsmart.online/api/business/${slug}/logo`;
  const start = Date.now();
  try {
    const res = await fetch(url);
    const elapsed = Date.now() - start;
    console.log(`\n--- Logo Endpoint [${slug}] ---`);
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.status}`);
    console.log(`Time: ${elapsed}ms`);
    console.log(`Content-Type: ${res.headers.get("content-type")}`);
    console.log(`Content-Length: ${res.headers.get("content-length")} bytes`);
    console.log(`Cache-Control: ${res.headers.get("cache-control")}`);
  } catch (err) {
    console.error(`Error fetching logo ${url}:`, err.message);
  }
}

async function run() {
  console.log("Checking live deployment status...");
  await testMerchant("new-roshan-tours-and-travels");
  await testLogoEndpoint("new-roshan-tours-and-travels");
  await testMerchant("sushmas-fashion-beauty");
}

run();
