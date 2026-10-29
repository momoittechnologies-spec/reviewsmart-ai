/**
 * GMB Data Fetcher — 100% Free Open-Source Business & GMB Intelligence Engine
 * Sourced directly from OpenStreetMap & Nominatim.
 * ZERO API fees • ZERO credit card required • 100% Free forever.
 */

export interface RealBusinessLead {
  id: string;
  name: string;
  address: string;
  locality: string;
  city: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  googlePlaceId: string | null;
  googleMapsUrl: string | null;
  lat: number | null;
  lng: number | null;
  dataSource: "openstreetmap" | "google_places";
  reviewGapScore: number;
  isHotLead: boolean;
}

// Blacklist of corporate franchises & national chains that should NEVER be pitched NFC standees
const CORPORATE_CHAINS_BLACKLIST = [
  "kfc",
  "domino",
  "pizza hut",
  "subway",
  "mcdonald",
  "burger king",
  "starbucks",
  "cafe coffee day",
  "barbeque nation",
  "haldiram",
  "bikanervala",
  "reliance",
  "dmart",
  "d-mart",
  "apollo pharmacy",
  "medplus",
  "lenskart",
  "trends",
  "max fashion",
  "pantaloons",
  "zudio",
  "westside",
  "titan",
  "tanishq",
  "kalyan jewellers",
  "malabar gold",
  "joyalukkas",
  "bhima",
  "lalitha jewellery",
  "grt jewellers",
];

export function isCorporateChain(name: string): boolean {
  const lower = name.toLowerCase();
  return CORPORATE_CHAINS_BLACKLIST.some((chain) => lower.includes(chain));
}

// Category keyword mappings for Nominatim & Overpass
const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  "Restaurants & Cafes": ["restaurant", "cafe", "biryani", "dhaba", "food"],
  "Dental Clinics & Healthcare": ["dentist", "dental clinic", "hospital", "clinic", "healthcare"],
  "Hair Salons & Beauty": ["salon", "beauty parlour", "hairdresser", "spa"],
  "Automobile Services & Garages": ["car repair", "garage", "tyres", "car wash", "motorcycle repair"],
  "Jewellery & Gold Shops": ["jewellery", "gold", "goldsmith", "jeweler"],
  "Pharmacies & Medical Stores": ["pharmacy", "medical store", "chemist"],
  "Hotels & Lodges": ["hotel", "lodge", "guest house", "resort"],
  "Gyms & Fitness Centers": ["gym", "fitness centre", "yoga"],
  "Supermarkets & Grocery Stores": ["supermarket", "grocery", "provision store", "mart"],
  "Clothing & Textiles": ["clothing", "textiles", "sarees", "menswear", "fashion"],
};

// OSM category tag mappings for Overpass QL
const OSM_CATEGORY_TAGS: Record<string, { key: string; value: string }[]> = {
  "Restaurants & Cafes": [
    { key: "amenity", value: "restaurant" },
    { key: "amenity", value: "cafe" },
    { key: "amenity", value: "fast_food" },
  ],
  "Dental Clinics & Healthcare": [
    { key: "amenity", value: "dentist" },
    { key: "amenity", value: "clinic" },
    { key: "amenity", value: "hospital" },
    { key: "healthcare", value: "clinic" },
  ],
  "Hair Salons & Beauty": [
    { key: "shop", value: "hairdresser" },
    { key: "shop", value: "beauty" },
    { key: "amenity", value: "beauty_salon" },
  ],
  "Automobile Services & Garages": [
    { key: "shop", value: "car_repair" },
    { key: "amenity", value: "car_wash" },
    { key: "shop", value: "tyres" },
    { key: "shop", value: "motorcycle_repair" },
  ],
  "Jewellery & Gold Shops": [
    { key: "shop", value: "jewelry" },
    { key: "shop", value: "goldsmith" },
  ],
  "Pharmacies & Medical Stores": [
    { key: "amenity", value: "pharmacy" },
    { key: "shop", value: "medical_supply" },
    { key: "shop", value: "chemist" },
  ],
  "Hotels & Lodges": [
    { key: "tourism", value: "hotel" },
    { key: "tourism", value: "guest_house" },
    { key: "amenity", value: "hotel" },
  ],
  "Gyms & Fitness Centers": [
    { key: "leisure", value: "fitness_centre" },
    { key: "leisure", value: "sports_centre" },
  ],
  "Supermarkets & Grocery Stores": [
    { key: "shop", value: "supermarket" },
    { key: "shop", value: "grocery" },
    { key: "shop", value: "convenience" },
  ],
  "Clothing & Textiles": [
    { key: "shop", value: "clothes" },
    { key: "shop", value: "fabric" },
    { key: "shop", value: "tailor" },
  ],
};

// Known city bounding boxes (lat_min, lon_min, lat_max, lon_max)
const CITY_BBOX: Record<string, [number, number, number, number]> = {
  Kadapa:         [14.35, 78.72, 14.55, 78.90],
  Tirupati:       [13.55, 79.32, 13.72, 79.52],
  Vijayawada:     [16.42, 80.55, 16.58, 80.75],
  Visakhapatnam:  [17.60, 83.15, 17.80, 83.35],
  Guntur:         [16.25, 80.30, 16.40, 80.50],
  Hyderabad:      [17.28, 78.38, 17.55, 78.65],
  Bengaluru:      [12.85, 77.50, 13.10, 77.75],
  Chennai:        [12.95, 80.15, 13.20, 80.35],
  Mumbai:         [18.90, 72.75, 19.20, 73.00],
  Pune:           [18.45, 73.78, 18.65, 74.00],
  "Delhi NCR":    [28.45, 76.95, 28.80, 77.35],
  Kolkata:        [22.45, 88.28, 22.65, 88.45],
  Kochi:          [9.90,  76.20, 10.10, 76.45],
  Jaipur:         [26.80, 75.70, 27.00, 75.95],
  Lucknow:        [26.78, 80.85, 26.98, 81.10],
};

function computeReviewGapScore(reviewCount: number | null, rating: number | null): number {
  if (reviewCount === null) {
    // Unclaimed / newly mapped business = very high review collection opportunity
    return 85;
  }
  const reviews = reviewCount;
  const stars = rating ?? 3.5;
  const reviewScore = Math.max(0, 100 - reviews * 1.5);
  const ratingScore = Math.max(0, (4.5 - stars) * 40);
  return Math.min(100, Math.round(reviewScore * 0.7 + ratingScore * 0.3));
}

// ─────────────────────────────────────────────────────────────────────────────
// 100% FREE ENGINE 1: OpenStreetMap Nominatim Search (Fast keyword lookups)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchFromNominatim(
  city: string,
  category: string
): Promise<RealBusinessLead[]> {
  const terms = CATEGORY_SEARCH_TERMS[category] || [category.toLowerCase()];
  const leads: RealBusinessLead[] = [];

  for (const term of terms.slice(0, 2)) {
    try {
      const q = `${term} in ${city}`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&limit=15&addressdetails=1`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "ReviewSmartAI-FreeGMBCollector/1.0 (contact@reviewsmart.online)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;

      const items = (await res.json()) as any[];
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        const parts = (item.display_name || "").split(",");
        const name = parts[0]?.trim();
        const street = parts[1]?.trim() || city;
        const address = parts.slice(0, 4).join(",").trim() || `${name}, ${city}`;

        if (!name || name.length < 2 || isCorporateChain(name)) continue;
        if (leads.some((l) => l.name.toLowerCase() === name.toLowerCase())) continue;

        const lat = item.lat ? Number(item.lat) : null;
        const lng = item.lon ? Number(item.lon) : null;

        leads.push({
          id: `osm-nom-${item.place_id || leads.length}`,
          name,
          address,
          locality: street,
          city,
          phone: null,
          website: null,
          rating: null,
          reviewCount: null,
          googlePlaceId: null,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            name + " " + address
          )}`,
          lat,
          lng,
          dataSource: "openstreetmap",
          reviewGapScore: 88,
          isHotLead: true,
        });
      }
    } catch (err) {
      console.warn("[Nominatim] Search failed for term:", term, err);
    }
  }

  return leads;
}

// ─────────────────────────────────────────────────────────────────────────────
// 100% FREE ENGINE 2: Overpass API (Deep spatial POI coordinates & details)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchFromOverpass(
  city: string,
  category: string
): Promise<RealBusinessLead[]> {
  const tags = OSM_CATEGORY_TAGS[category] || [{ key: "amenity", value: "restaurant" }];
  const bbox = CITY_BBOX[city] || [14.35, 78.72, 14.55, 78.90];
  const [latMin, lonMin, latMax, lonMax] = bbox;

  // Query both nodes and building ways
  const tagQueries = tags
    .map(
      (t) =>
        `node["${t.key}"="${t.value}"](${latMin},${lonMin},${latMax},${lonMax});\nway["${t.key}"="${t.value}"](${latMin},${lonMin},${latMax},${lonMax});`
    )
    .join("\n");

  const query = `
[out:json][timeout:20];
(
${tagQueries}
);
out center 25;
`;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "ReviewSmartAI-GMBCollector/1.0 (contact@reviewsmart.online)",
      Accept: "application/json",
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  const elements = (data.elements || []) as any[];

  return elements
    .filter((el: any) => el.tags?.name && !isCorporateChain(el.tags.name))
    .slice(0, 25)
    .map((el: any, idx: number) => {
      const osmTags = el.tags || {};
      const name: string = osmTags.name || "Business";
      const street = osmTags["addr:street"] || "";
      const housenumber = osmTags["addr:housenumber"] || "";
      const address = [housenumber, street, city].filter(Boolean).join(", ") || `${name}, ${city}`;
      const locality = street || city;
      const phone: string | null = osmTags.phone || osmTags["contact:phone"] || null;
      const website: string | null = osmTags.website || osmTags["contact:website"] || null;
      const lat: number | null = el.lat ?? el.center?.lat ?? null;
      const lng: number | null = el.lon ?? el.center?.lon ?? null;

      return {
        id: `osm-ovp-${el.id || idx}`,
        name,
        address,
        locality,
        city,
        phone,
        website,
        rating: null,
        reviewCount: null,
        googlePlaceId: null,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          name + " " + city
        )}`,
        lat,
        lng,
        dataSource: "openstreetmap" as const,
        reviewGapScore: phone ? 90 : 85,
        isHotLead: true,
      };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Optional Google Places API (Only used if user explicitly provided a key)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchFromGooglePlaces(
  city: string,
  category: string,
  apiKey: string
): Promise<RealBusinessLead[]> {
  const query = `${category} in ${city}`;

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.nationalPhoneNumber",
          "places.websiteUri",
          "places.rating",
          "places.userRatingCount",
          "places.location",
          "places.businessStatus",
        ].join(","),
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "en",
        maxResultCount: 20,
      }),
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Places status ${response.status}`);
  }

  const data = await response.json();
  const places = (data.places || []) as any[];

  return places
    .filter((p: any) => p.businessStatus === "OPERATIONAL" || !p.businessStatus)
    .map((p: any, idx: number) => {
      const name: string = p.displayName?.text || "Business";
      const address: string = p.formattedAddress || "";
      const locality = address.split(",")[0] || city;
      const rating = p.rating ? Number(p.rating) : null;
      const reviewCount = p.userRatingCount ? Number(p.userRatingCount) : null;
      const placeId: string = p.id || "";
      const lat = p.location?.latitude ?? null;
      const lng = p.location?.longitude ?? null;
      const gapScore = computeReviewGapScore(reviewCount, rating);

      return {
        id: `gp-${placeId || idx}`,
        name,
        address,
        locality,
        city,
        phone: p.nationalPhoneNumber || null,
        website: p.websiteUri || null,
        rating,
        reviewCount,
        googlePlaceId: placeId || null,
        googleMapsUrl: placeId
          ? `https://search.google.com/local/writereview?placeid=${placeId}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + city)}`,
        lat,
        lng,
        dataSource: "google_places" as const,
        reviewGapScore: gapScore,
        isHotLead: gapScore >= 60 || (reviewCount !== null && reviewCount < 40),
      };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: 100% Free Dual-Engine Open Data Pipeline
// ─────────────────────────────────────────────────────────────────────────────
export interface FetchLeadsResult {
  leads: RealBusinessLead[];
  dataSource: "openstreetmap" | "google_places";
  totalFound: number;
  note: string;
}

export async function fetchRealBusinessLeads(
  city: string,
  category: string
): Promise<FetchLeadsResult> {
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || "";

  // Optional: Only if user explicitly added a paid key
  if (googleApiKey && googleApiKey.length > 10) {
    try {
      const leads = await fetchFromGooglePlaces(city, category, googleApiKey);
      if (leads.length > 0) {
        leads.sort((a, b) => b.reviewGapScore - a.reviewGapScore);
        return {
          leads,
          dataSource: "google_places",
          totalFound: leads.length,
          note: `Data from Google Places API (${leads.length} listings found).`,
        };
      }
    } catch (err) {
      console.warn("Google Places failed, switching to 100% Free Open Engine:", err);
    }
  }

  // 100% FREE OPEN-SOURCE DUAL ENGINE (Nominatim + Overpass)
  const combinedLeads: RealBusinessLead[] = [];

  // 1. Run Nominatim keyword search
  try {
    const nomLeads = await fetchFromNominatim(city, category);
    combinedLeads.push(...nomLeads);
  } catch (err) {
    console.warn("Nominatim search error:", err);
  }

  // 2. Run Overpass spatial POI search
  try {
    const ovpLeads = await fetchFromOverpass(city, category);
    for (const lead of ovpLeads) {
      if (!combinedLeads.some((l) => l.name.toLowerCase() === lead.name.toLowerCase())) {
        combinedLeads.push(lead);
      }
    }
  } catch (err) {
    console.warn("Overpass search error:", err);
  }

  // Sort by opportunity gap score
  combinedLeads.sort((a, b) => b.reviewGapScore - a.reviewGapScore);

  if (combinedLeads.length > 0) {
    return {
      leads: combinedLeads,
      dataSource: "openstreetmap",
      totalFound: combinedLeads.length,
      note: `100% Free Open-Source Data (OpenStreetMap & Nominatim) • Discovered ${combinedLeads.length} real local businesses in ${city}. Zero API fees.`,
    };
  }

  return {
    leads: [],
    dataSource: "openstreetmap",
    totalFound: 0,
    note: `No listings currently mapped in OpenStreetMap for "${category}" in ${city}. Try searching a nearby major town or general category.`,
  };
}
