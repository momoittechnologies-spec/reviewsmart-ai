/**
 * GMB Data Fetcher — Multi-source real business data pipeline
 * Sources: Google Places API → OpenStreetMap/Overpass API (fallback)
 * All data is from real public directories. No synthetic data is generated.
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
  dataSource: "google_places" | "openstreetmap";
  // Computed fields
  reviewGapScore: number; // higher = bigger opportunity (low reviews = high score)
  isHotLead: boolean;
}

// OSM category tag mappings for Indian business categories
const OSM_CATEGORY_TAGS: Record<string, { key: string; value: string }[]> = {
  "Restaurants & Cafes": [
    { key: "amenity", value: "restaurant" },
    { key: "amenity", value: "cafe" },
    { key: "amenity", value: "fast_food" },
  ],
  "Dental Clinics & Healthcare": [
    { key: "amenity", value: "dentist" },
    { key: "amenity", value: "clinic" },
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
  ],
  "Jewellery & Gold Shops": [
    { key: "shop", value: "jewelry" },
    { key: "shop", value: "goldsmith" },
  ],
  "Pharmacies & Medical Stores": [
    { key: "amenity", value: "pharmacy" },
    { key: "shop", value: "medical_supply" },
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

// Known city bounding boxes for India (lat_min, lat_max, lon_min, lon_max)
const CITY_BBOX: Record<string, [number, number, number, number]> = {
  Kadapa:         [14.35, 14.55, 78.72, 78.90],
  Tirupati:       [13.55, 13.72, 79.32, 79.52],
  Vijayawada:     [16.42, 16.58, 80.55, 80.75],
  Visakhapatnam:  [17.60, 17.80, 83.15, 83.35],
  Guntur:         [16.25, 16.40, 80.30, 80.50],
  Hyderabad:      [17.28, 17.55, 78.38, 78.65],
  Bengaluru:      [12.85, 13.10, 77.50, 77.75],
  Chennai:        [12.95, 13.20, 80.15, 80.35],
  Mumbai:         [18.90, 19.20, 72.75, 73.00],
  Pune:           [18.45, 18.65, 73.78, 74.00],
  "Delhi NCR":    [28.45, 28.80, 76.95, 77.35],
  Kolkata:        [22.45, 22.65, 88.28, 88.45],
  Kochi:          [9.90,  10.10, 76.20, 76.45],
  Jaipur:         [26.80, 27.00, 75.70, 75.95],
  Lucknow:        [26.78, 26.98, 80.85, 81.10],
};

function computeReviewGapScore(reviewCount: number | null, rating: number | null): number {
  const reviews = reviewCount ?? 0;
  const stars = rating ?? 3.5;
  // Low reviews + low rating = high opportunity score (0-100)
  const reviewScore = Math.max(0, 100 - reviews * 1.5);
  const ratingScore = Math.max(0, (4.5 - stars) * 40);
  return Math.min(100, Math.round(reviewScore * 0.7 + ratingScore * 0.3));
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 1: Google Places API (Text Search New)
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
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google Places API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const places = (data.places || []) as any[];

  return places
    .filter((p: any) => p.businessStatus === "OPERATIONAL" || !p.businessStatus)
    .map((p: any, idx: number) => {
      const name: string = p.displayName?.text || "Unknown Business";
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
          ? `https://maps.google.com/?cid=${placeId}`
          : `https://www.google.com/maps/search/${encodeURIComponent(name + " " + city)}`,
        lat,
        lng,
        dataSource: "google_places" as const,
        reviewGapScore: gapScore,
        isHotLead: gapScore >= 60 || (reviewCount !== null && reviewCount < 40),
      };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE 2: OpenStreetMap / Overpass API (Free fallback)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchFromOpenStreetMap(
  city: string,
  category: string
): Promise<RealBusinessLead[]> {
  const tags = OSM_CATEGORY_TAGS[category] || [{ key: "amenity", value: "restaurant" }];
  const bbox = CITY_BBOX[city] || [8.0, 37.0, 68.0, 97.0];
  const [latMin, latMax, lonMin, lonMax] = bbox;

  // Build Overpass QL query — union of all matching tags
  const tagQueries = tags
    .map((t) => `node["${t.key}"="${t.value}"](${latMin},${lonMin},${latMax},${lonMax});`)
    .join("\n");

  const query = `
[out:json][timeout:25];
(
${tagQueries}
);
out body 30;
`;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  const elements = (data.elements || []) as any[];

  return elements
    .filter((el: any) => el.tags?.name)
    .slice(0, 20)
    .map((el: any, idx: number) => {
      const osmTags = el.tags || {};
      const name: string = osmTags.name || "Business";
      const street = osmTags["addr:street"] || "";
      const housenumber = osmTags["addr:housenumber"] || "";
      const address = [housenumber, street, city].filter(Boolean).join(", ");
      const locality = street || city;
      const phone: string | null = osmTags.phone || osmTags["contact:phone"] || null;
      const website: string | null = osmTags.website || osmTags["contact:website"] || null;
      const lat: number | null = el.lat ?? null;
      const lng: number | null = el.lon ?? null;
      const gapScore = computeReviewGapScore(null, null); // OSM has no review data

      return {
        id: `osm-${el.id || idx}`,
        name,
        address,
        locality,
        city,
        phone,
        website,
        rating: null,      // OSM does not have ratings
        reviewCount: null, // OSM does not have review counts
        googlePlaceId: null,
        googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(name + " " + city)}`,
        lat,
        lng,
        dataSource: "openstreetmap" as const,
        reviewGapScore: gapScore,
        isHotLead: true, // Unknown = potential lead
      };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export: Fetch real business leads with automatic source selection
// ─────────────────────────────────────────────────────────────────────────────
export interface FetchLeadsResult {
  leads: RealBusinessLead[];
  dataSource: "google_places" | "openstreetmap" | "mixed";
  totalFound: number;
  note: string;
}

export async function fetchRealBusinessLeads(
  city: string,
  category: string
): Promise<FetchLeadsResult> {
  const googleApiKey =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    "";

  // Try Google Places first
  if (googleApiKey && googleApiKey.length > 10) {
    try {
      const leads = await fetchFromGooglePlaces(city, category, googleApiKey);
      if (leads.length > 0) {
        // Sort by review gap score (highest opportunity first)
        leads.sort((a, b) => b.reviewGapScore - a.reviewGapScore);
        return {
          leads,
          dataSource: "google_places",
          totalFound: leads.length,
          note: `Live data from Google Places API. Showing ${leads.length} businesses in ${city} matching "${category}".`,
        };
      }
    } catch (err) {
      console.warn("[gmbDataFetcher] Google Places failed, falling back to OSM:", err);
    }
  }

  // Fallback: OpenStreetMap
  try {
    const leads = await fetchFromOpenStreetMap(city, category);
    leads.sort((a, b) => b.reviewGapScore - a.reviewGapScore);
    return {
      leads,
      dataSource: "openstreetmap",
      totalFound: leads.length,
      note: `Data from OpenStreetMap (Google Places API key not configured or no results). Review counts unavailable — search Google Maps for live ratings.`,
    };
  } catch (err) {
    console.warn("[gmbDataFetcher] OSM also failed:", err);
    return {
      leads: [],
      dataSource: "openstreetmap",
      totalFound: 0,
      note: "Could not fetch business data. Please check your internet connection or API configuration.",
    };
  }
}
