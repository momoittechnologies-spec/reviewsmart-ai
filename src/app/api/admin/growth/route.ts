import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { PanIndiaLead, generatePanIndiaPitches } from "@/lib/growthEngine";

export const dynamic = "force-dynamic";

// ─── REGIONAL PAN-INDIA INTELLIGENCE PRESETS ─────────────────────────────────
const PAN_INDIA_REGIONS: Record<
  string,
  {
    state: string;
    cities: string[];
    localities: string[];
  }
> = {
  // Andhra Pradesh & Telangana
  Kadapa: {
    state: "Andhra Pradesh",
    cities: ["Kadapa"],
    localities: ["Seven Roads Circle", "Nagarajupeta", "Yerramukkapalli", "RTC Bus Stand Road", "Madras Road", "RIMS Road", "Chinna Chowk", "Apsara Circle"],
  },
  Tirupati: {
    state: "Andhra Pradesh",
    cities: ["Tirupati"],
    localities: ["KT Road", "Bhavani Nagar", "Korlagunta", "Tilak Road", "Air Bypass Road", "Gandhi Road", "Balaji Colony", "Alipiri Bypass"],
  },
  Vijayawada: {
    state: "Andhra Pradesh",
    cities: ["Vijayawada"],
    localities: ["MG Road", "Governorpet", "Benz Circle", "Bhavanipuram", "Suryaraopet", "Moghalrajpuram", "Labbipet", "Patamata"],
  },
  Visakhapatnam: {
    state: "Andhra Pradesh",
    cities: ["Visakhapatnam"],
    localities: ["Dwaraka Nagar", "Jagadamba Centre", "Siripuram", "MVP Colony", "Gajuwaka", "Maddilapalem", "Asilmetta"],
  },
  Hyderabad: {
    state: "Telangana",
    cities: ["Hyderabad"],
    localities: ["Madhapur", "Kondapur", "Kukatpally", "Banjara Hills", "Jubilee Hills", "Ameerpet", "Dilsukhnagar", "Gachibowli", "Secunderabad"],
  },
  Bengaluru: {
    state: "Karnataka",
    cities: ["Bengaluru"],
    localities: ["Indiranagar", "Koramangala", "Jayanagar", "Whitefield", "HSR Layout", "Malleshwaram", "JP Nagar", "Marathahalli", "MG Road"],
  },
  Chennai: {
    state: "Tamil Nadu",
    cities: ["Chennai"],
    localities: ["T. Nagar", "Anna Nagar", "Adyar", "Velachery", "Nungambakkam", "Mylapore", "Alwarpet", "OMR Kandanchavadi"],
  },
  Kochi: {
    state: "Kerala",
    cities: ["Kochi"],
    localities: ["MG Road", "Panampilly Nagar", "Kakkanad", "Edappally", "Fort Kochi", "Marine Drive", "Kaloor", "Palarivattom"],
  },
  Mumbai: {
    state: "Maharashtra",
    cities: ["Mumbai"],
    localities: ["Bandra West", "Andheri West", "Juhu", "Colaba", "Dadar", "Powai", "Thane West", "Borivali West", "Goregaon"],
  },
  Pune: {
    state: "Maharashtra",
    cities: ["Pune"],
    localities: ["Koregaon Park", "Kothrud", "FC Road", "Viman Nagar", "Baner", "Aundh", "Hinjawadi", "Wakad", "Shivaji Nagar"],
  },
  Ahmedabad: {
    state: "Gujarat",
    cities: ["Ahmedabad"],
    localities: ["SG Highway", "Navrangpura", "Satellite", "Prahlad Nagar", "Bodakdev", "C.G. Road", "Maninagar", "Vastrapur"],
  },
  "Delhi NCR": {
    state: "Delhi",
    cities: ["Delhi NCR", "Noida", "Gurgaon"],
    localities: ["Connaught Place", "South Extension", "Lajpat Nagar", "Karol Bagh", "Rajouri Garden", "Cyber Hub Gurgaon", "Sector 18 Noida", "Hauz Khas"],
  },
  Jaipur: {
    state: "Rajasthan",
    cities: ["Jaipur"],
    localities: ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Raja Park", "Mansarovar", "MI Road", "Tonk Road", "Bapu Bazaar"],
  },
  Lucknow: {
    state: "Uttar Pradesh",
    cities: ["Lucknow"],
    localities: ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar", "Aminabad", "Alambagh", "Mahanagar", "Jankipuram"],
  },
  Kolkata: {
    state: "West Bengal",
    cities: ["Kolkata"],
    localities: ["Park Street", "Salt Lake Sector 1", "Ballygunge", "New Town", "Gariahat", "Behala", "Shyambazar", "Bhowanipore"],
  },
};

// High-converting Pan-India category profiles
const PAN_INDIA_CATEGORY_INTELLIGENCE: Record<
  string,
  {
    targetAudience: string;
    painPointTemplate: string;
    opportunityTemplate: string;
    hardware: string;
    competitorPrefix: string;
    sampleNames: string[];
  }
> = {
  "Restaurants & Cafes": {
    targetAudience: "Weekend families, foodies, youth, corporate lunch diners seeking top-rated local food.",
    painPointTemplate: "Losing evening dining footfall because rival restaurant has 5x more Google ratings.",
    opportunityTemplate: "Place 3D NFC standee at bill presentation desk. 1 tap while customer pays bill converts 150 daily diners into 30+ 5-star reviews every week.",
    hardware: "3D Acrylic NFC + QR Standee on Cashier Counter & Table Tents",
    competitorPrefix: "Grand Spice Royale",
    sampleNames: ["Spice Symphony Diner", "Saffron Aroma Family Restaurant", "Biryani Darbar Point", "The Urban Fork Cafe", "Royal Rayalaseema Ruchulu", "Green Leaf Pure Veg"],
  },
  "Dental Clinics & Healthcare": {
    targetAudience: "Local residents, parents with children, seniors seeking implants, young adults wanting cosmetic aligners.",
    painPointTemplate: "High patient satisfaction, but patients forget to leave reviews. 1 old negative review drags down the overall Google rating.",
    opportunityTemplate: "Receptionist prompts patient during medicine handover. ReviewSmart Private Feedback Shield stops 1-star complaints from going public.",
    hardware: "3D Acrylic Medical Shield Standee at Reception Desk",
    competitorPrefix: "Apollo Dental & Healthcare Hub",
    sampleNames: ["Dr. Rao Multispeciality Dental", "Smile Craft Oral Health Centre", "Seven Hills Laser Dental Clinic", "Care & Cure Dental Hospital", "Advanced Implant & Dental Lounge"],
  },
  "Hair Salons & Beauty Spas": {
    targetAudience: "Brides, working professionals, grooming-conscious youth, women booking high-ticket treatments.",
    painPointTemplate: "Clients leave looking amazing, but Instagram posts don't translate to Google Maps SEO rankings.",
    opportunityTemplate: "Stylist taps customer phone right after mirror reveal. 10-second review captures beauty praise with instant Google photo uploads.",
    hardware: "Compact Glamour Gold NFC Mirror Standee",
    competitorPrefix: "Naturals Luxury Salon & Spa",
    sampleNames: ["Luxe Glow Hair & Beauty Lounge", "Style Icon Family Salon", "Aura Wellness Spa & Studio", "Elegance Hair Studio", "The Velvet Touch Salon"],
  },
  "Jewellery & Gold Showrooms": {
    targetAudience: "Wedding families, gold investors, festive shoppers, bridal ornament buyers seeking total trust.",
    painPointTemplate: "Customer trust is 100% determined by Google ratings. Lack of recent 5-star reviews makes prospective brides hesitate.",
    opportunityTemplate: "Store manager taps review standee upon bill settlement and gift bag delivery. Deep trust builds viral regional word of mouth.",
    hardware: "Heavyweight Metallic Gold 3D Counter Standee",
    competitorPrefix: "Kalyan & Tanishq Jewellery Hub",
    sampleNames: ["Sri Balaji Gold & Diamonds", "Royal Heritage Jewellers", "Navratna Gold Palace", "Mahalaxmi Jewellers", "Shree Rathna Diamond Studio"],
  },
  "Clothing Boutiques & Menswear": {
    targetAudience: "Festive shoppers, college students, wedding guests, grooms shopping for bespoke suits and ethnic wear.",
    painPointTemplate: "Trail room excitement is lost once the customer exits the door without a review.",
    opportunityTemplate: "NFC counter prompt at packaging counter. AI automatically suggests tags like 'Great Fabric Quality' and 'Perfect Fitting'.",
    hardware: "3D Acrylic Standee at Billing Counter",
    competitorPrefix: "Raymond & Manyavar Fashion Hub",
    sampleNames: ["Urban Threads Menswear", "Sri Guru Designer Studio", "The Royal Stitch Boutique", "Classy Fit Menswear", "Vogue Aura Ethnic Store"],
  },
  "Automobile & Car Care Services": {
    targetAudience: "Car and bike owners, road trippers, fleet managers needing reliable, honest mechanics.",
    painPointTemplate: "Mechanic honesty is hard to prove. Potential customers only call workshops with 4.5+ star ratings on Google Maps.",
    opportunityTemplate: "Customer collects key upon vehicle delivery. 1-tap review builds a dominant 4.8-star local profile that corners local towing/service calls.",
    hardware: "Industrial Acrylic Tough Standee at Service Counter",
    competitorPrefix: "Bosch Car Care & Detailing Hub",
    sampleNames: ["Apex Auto Garage & Detailing", "Speed Wheels Tyre & Service Hub", "Elite Car Spa & Ceramic Studio", "Sri Venkateswara Motors", "City Auto Works"],
  },
  "Hotels & Travel Agencies": {
    targetAudience: "Outstation tourists, corporate travelers, pilgrims, wedding parties booking luxury cabs or rooms.",
    painPointTemplate: "Losing direct bookings to Makemytrip/Goibibo commissions because Google Business profile review volume is low.",
    opportunityTemplate: "Driver or front desk prompts guest upon checkout. AI crafts glowing reviews in Telugu, Tamil, Hindi, or English instantly.",
    hardware: "Reception Desk 3D Standee & Vehicle Dashboard NFC Badges",
    competitorPrefix: "Southern Grand Travels & Hotel",
    sampleNames: ["Mana Tours & Travels", "Seven Hills Luxury Cabs & Travel", "Green View Residency", "Sri Balaji Heritage Inn", "Royal Orchid Express"],
  },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 401 });
    }

    const body = await req.json();
    const { city = "Kadapa", category = "Restaurants & Cafes", customBusinessName, mode = "scan" } = body;

    const targetCity = city.trim();
    const targetCategory = category.trim();

    // 1. Try Live Gemini Generative Intelligence if API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const client = new GoogleGenAI({ apiKey });

        const prompt = mode === "deep_audit" && customBusinessName
          ? `You are an elite Indian B2B retail growth strategist for "ReviewSmart AI" (we sell ₹2,999 3D Acrylic NFC + QR Google review standees with Gemini AI assistance).
Perform a deep 360-degree commercial market research audit for the following business:
Business: "${customBusinessName}" in "${targetCity}", Category: "${targetCategory}".

Analyze:
1. Target demographic & customer persona
2. Exact business pain point and why their Google Maps rating/reviews deficit is costing them walk-in revenue
3. Direct marketing opportunity with ReviewSmart AI
4. Top local competitor in that city
5. Realistic phone number, current reviews (15-60), current rating (3.8-4.2), competitor reviews (250-500)
6. Write a high-converting, personalized sales pitch in 9 Indian languages (telugu, hindi, english, tamil, kannada, malayalam, marathi, gujarati, bengali).

Return STRICT JSON only:
{
  "lead": {
    "name": "${customBusinessName}",
    "locality": "string",
    "city": "${targetCity}",
    "state": "string",
    "phone": "9849123456",
    "category": "${targetCategory}",
    "currentRating": 4.0,
    "currentReviews": 28,
    "competitorName": "string",
    "competitorRating": 4.7,
    "competitorReviews": 380,
    "targetAudience": "string",
    "painPoint": "string",
    "marketingOpportunity": "string",
    "hardwarePlacement": "string"
  }
}`
          : `You are an elite Indian retail growth strategist for "ReviewSmart AI" (selling ₹2,999 3D NFC + QR Google review standees).
Generate 8 to 12 realistic target merchant leads in "${targetCity}", focusing on "${targetCategory}".
Focus on businesses with LOW GOOGLE REVIEWS (< 45 reviews or < 4.2 rating) that are losing customers to top rivals with 300+ reviews.

Return STRICT JSON only without markdown:
{
  "leads": [
    {
      "name": "string",
      "locality": "string",
      "city": "${targetCity}",
      "state": "string",
      "phone": "9849123456",
      "category": "${targetCategory}",
      "currentRating": 3.9,
      "currentReviews": 24,
      "competitorName": "string",
      "competitorRating": 4.6,
      "competitorReviews": 350,
      "targetAudience": "string",
      "painPoint": "string",
      "marketingOpportunity": "string",
      "hardwarePlacement": "string"
    }
  ]
}`;

        const response = await client.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });

        const text = response.text || "";
        const cleaned = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
        const parsed = JSON.parse(cleaned);

        const rawList = mode === "deep_audit" && parsed.lead ? [parsed.lead] : parsed.leads || [];

        if (Array.isArray(rawList) && rawList.length > 0) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.reviewsmart.online";
          const formattedLeads: PanIndiaLead[] = rawList.map((item, idx) => {
            const slug = slugify(item.name);
            const demoUrl = `${appUrl}/r/${slug}`;
            const gap = Math.max(0, (item.competitorReviews || 300) - (item.currentReviews || 25));
            const pitches = generatePanIndiaPitches(
              item.name,
              item.category || targetCategory,
              item.currentReviews || 25,
              item.competitorName || "Leading Rival",
              item.competitorReviews || 350,
              demoUrl
            );

            return {
              id: `gemini-${idx}-${Date.now()}`,
              name: item.name,
              locality: item.locality || "City Center",
              city: item.city || targetCity,
              state: item.state || "India",
              phone: item.phone || "9849123456",
              category: item.category || targetCategory,
              currentRating: Number(item.currentRating) || 4.0,
              currentReviews: Number(item.currentReviews) || 25,
              competitorName: item.competitorName || "Top Competitor",
              competitorRating: Number(item.competitorRating) || 4.7,
              competitorReviews: Number(item.competitorReviews) || 350,
              reviewDeficit: gap,
              isHotLead: gap >= 100 || (item.currentReviews || 25) < 40,
              targetAudience: item.targetAudience || "Local families, shoppers and footfall visitors.",
              painPoint: item.painPoint || "Losing walk-ins to competitor who has 5x more Google ratings.",
              marketingOpportunity: item.marketingOpportunity || "Place 3D NFC standee at cashier counter for 1-tap Google reviews.",
              hardwarePlacement: item.hardwarePlacement || "3D Acrylic NFC + QR Standee on Billing Counter",
              demoSlug: slug,
              demoUrl,
              pitches,
            };
          });

          return NextResponse.json({
            success: true,
            source: "gemini-intelligence",
            city: targetCity,
            category: targetCategory,
            leads: formattedLeads,
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini generation fallback triggered:", geminiErr);
      }
    }

    // 2. High-Fidelity Curated Pan-India Fallback Engine (Zero-failure, instant response)
    const regionData = PAN_INDIA_REGIONS[targetCity] || {
      state: "India",
      cities: [targetCity],
      localities: ["Main Road", "Market Circle", "Commercial Street", "Bus Stand Area", "Station Road"],
    };

    const categoryData = PAN_INDIA_CATEGORY_INTELLIGENCE[targetCategory] || PAN_INDIA_CATEGORY_INTELLIGENCE["Restaurants & Cafes"];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.reviewsmart.online";

    const baseNames = mode === "deep_audit" && customBusinessName
      ? [customBusinessName]
      : categoryData.sampleNames;

    const leads: PanIndiaLead[] = baseNames.map((name, idx) => {
      const locality = regionData.localities[idx % regionData.localities.length];
      const slug = slugify(name);
      const demoUrl = `${appUrl}/r/${slug}`;

      // Realistic metrics
      const currentReviews = 14 + (idx * 5) % 35;
      const currentRating = +(3.8 + ((idx * 0.1) % 0.4)).toFixed(1);
      const competitorName = `${categoryData.competitorPrefix} ${targetCity}`;
      const competitorReviews = 280 + (idx * 45) % 300;
      const competitorRating = 4.7;
      const reviewDeficit = competitorReviews - currentReviews;

      const pitches = generatePanIndiaPitches(
        name,
        targetCategory,
        currentReviews,
        competitorName,
        competitorReviews,
        demoUrl
      );

      // Realistic phone generator for Indian mobile networks
      const phonePrefixes = ["9849", "9440", "9885", "8639", "7093", "9014", "9949"];
      const phone = `${phonePrefixes[idx % phonePrefixes.length]}${String(100000 + idx * 837).slice(0, 6)}`;

      return {
        id: `curated-${idx}-${slug}`,
        name,
        locality,
        city: targetCity,
        state: regionData.state,
        phone,
        category: targetCategory,
        currentRating,
        currentReviews,
        competitorName,
        competitorRating,
        competitorReviews,
        reviewDeficit,
        isHotLead: reviewDeficit >= 150 || currentReviews < 40,
        targetAudience: categoryData.targetAudience,
        painPoint: categoryData.painPointTemplate,
        marketingOpportunity: categoryData.opportunityTemplate,
        hardwarePlacement: categoryData.hardware,
        demoSlug: slug,
        demoUrl,
        pitches,
      };
    });

    return NextResponse.json({
      success: true,
      source: "pan-india-intelligence-engine",
      city: targetCity,
      category: targetCategory,
      leads,
    });
  } catch (err: any) {
    console.error("Pan-India Growth Engine error:", err);
    return NextResponse.json({ error: err?.message || "Failed to run Growth Engine" }, { status: 500 });
  }
}
