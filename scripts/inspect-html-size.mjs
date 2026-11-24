async function inspect() {
  const t = await fetch('https://www.reviewsmart.online/r/new-roshan-tours-and-travels').then(r => r.text());
  console.log("Total length:", t.length);

  // Look for large chunks or base64 or scripts
  const base64Matches = t.match(/data:[^;]+;base64,[A-Za-z0-9+/=]{1000,}/g) || [];
  console.log("Base64 matches count:", base64Matches.length);
  for (const b of base64Matches) {
    console.log("Base64 match length:", b.length, "starts with:", b.slice(0, 50));
  }

  // Look for inline scripts or JSON
  const scriptMatches = t.match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi) || [];
  console.log("Script tags count:", scriptMatches.length);
  for (const s of scriptMatches) {
    if (s.length > 50000) {
      console.log("Large script tag length:", s.length, "starts with:", s.slice(0, 100));
    }
  }
}

inspect();
