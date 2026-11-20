async function search() {
  const initialUrl = "https://www.google.com/maps/search/Golden+Hair+Wig+Studio+Proddatur";
  console.log("Fetching:", initialUrl);
  const res = await fetch(initialUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  const html = await res.text();
  console.log("HTML length:", html.length);
  const match = html.match(/href="(\/search\?tbm=map[^"]+)"/);
  if (match) {
    const nextUrl = "https://www.google.com" + match[1].replace(/&amp;/g, "&");
    console.log("Fetching nextUrl:", nextUrl.slice(0, 100));
    const nextRes = await fetch(nextUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    const nextText = await nextRes.text();
    console.log("NextText length:", nextText.length);
    const hexes = nextText.match(/0x[0-9a-fA-F]{8,}/g) || [];
    console.log("Hexes:", [...new Set(hexes)]);
    const chijs = nextText.match(/ChIJ[0-9a-zA-Z_-]{20,}/g) || [];
    console.log("ChIJ:", [...new Set(chijs)]);
    
    // Also look for business names / addresses in nextText
    const nameMatches = nextText.match(/Golden\s*Hair[^\"]{0,60}/gi) || [];
    console.log("Names:", [...new Set(nameMatches)].slice(0, 5));
    const addressMatches = nextText.match(/Proddatur[^\"]{0,60}/gi) || [];
    console.log("Addresses:", [...new Set(addressMatches)].slice(0, 5));

    import("fs").then(fs => {
      fs.writeFileSync("C:/Users/Mohan/.gemini/antigravity/brain/962ee673-b5ae-48a3-82ab-02f579fd6d72/scratch/proddatur_maps.html", nextText);
    });
  } else {
    console.log("No /search?tbm=map link found!");
  }
}

search();
