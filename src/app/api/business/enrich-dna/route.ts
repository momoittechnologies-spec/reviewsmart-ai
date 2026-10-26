import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { detectIndustry } from "@/lib/industry";

export const dynamic = "force-dynamic";

export interface BusinessDnaResult {
  signatureItems: string[];
  keyUSPs: string[];
  tagChips: string[];
  keywords: string;
  tagline: string;
  tone: string;
  category: string;
  summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessId,
      businessName,
      city,
      category,
      instagram,
      googleAddress,
      website,
      autoSave = true,
    } = body;

    let targetName = businessName;
    let targetCategory = category;
    let targetCity = city || "";
    let targetAddress = googleAddress || "";
    let targetInstagram = instagram || "";
    let targetWebsite = website || "";
    let existingBusiness: any = null;

    if (businessId) {
      existingBusiness = await prisma.business.findUnique({
        where: { id: businessId },
      });
      if (existingBusiness) {
        // Enforce authorization: only SUPER_ADMIN or owner can enrich
        if (user.role !== "SUPER_ADMIN" && existingBusiness.userId !== user.id) {
          return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
        }
        targetName = targetName || existingBusiness.name;
        targetCategory = targetCategory || existingBusiness.category;
        targetAddress = targetAddress || existingBusiness.googleAddress || "";
        targetInstagram = targetInstagram || existingBusiness.instagram || "";
        targetWebsite = targetWebsite || existingBusiness.website || "";
      }
    }

    if (!targetName || targetName.trim().length < 2) {
      return NextResponse.json({ error: "Valid business name is required." }, { status: 400 });
    }

    const industry = detectIndustry(targetName, targetCategory || "", "");
    const apiKey = process.env.GEMINI_API_KEY;

    let dnaResult: BusinessDnaResult;

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const client = new GoogleGenAI({ apiKey });
        const prompt = `
You are an expert commercial B2B researcher and local Google Maps SEO specialist in India.
Research and analyze this local business to extract its "Business DNA", signature products/services, and customer sentiment:
- Business Name: "${targetName}"
- Category: "${targetCategory || industry.label}"
- Locality / City / Address: "${targetAddress || targetCity || "India"}"
- Instagram Handle / URL: "${targetInstagram || "None"}"
- Website: "${targetWebsite || "None"}"

Extract and generate realistic, high-converting commercial data:
1. "signatureItems": Array of 4 to 6 specific, recognizable signature dishes, treatments, or services that walk-in customers love (e.g. for a biryani point: ["Gongura Mutton Biryani", "Double Masala Chicken", "Apricot Delight", "Mirchi Ka Salan"]; for a dental clinic: ["Painless Root Canal", "Laser Teeth Whitening", "Ceramic Braces", "Dental Implants"]; for a salon: ["Keratin Hair Spa", "Hydra Facial", "Beard Sculpting", "Bridal Glow"]).
2. "keyUSPs": Array of 3 to 4 distinct business strengths (e.g. ["Hygienic Preparation", "Zero Waiting Time", "Family AC Section", "Reasonable Pricing"]).
3. "tagChips": Array of exactly 5 crisp, punchy compliment chips (1-3 words each) that customers will tap to review on their phone (must include at least 1 signature item + 1 service trait).
4. "keywords": Comma-separated high-volume Google Maps search keywords (under 120 chars) that will skyrocket their local search rank.
5. "tagline": A catchy 6-10 word customer-facing tagline for their NFC review card.
6. "tone": Best review prompt tone ("friendly" | "professional" | "enthusiastic").
7. "summary": A 1-sentence summary of why customers choose this business.

Return STRICT JSON only without markdown formatting:
{
  "signatureItems": ["item1", "item2", "item3", "item4"],
  "keyUSPs": ["usp1", "usp2", "usp3"],
  "tagChips": ["chip1", "chip2", "chip3", "chip4", "chip5"],
  "keywords": "string of keywords",
  "tagline": "string",
  "tone": "friendly",
  "summary": "string"
}
`;

        const response = await client.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });

        const text = response.text || "";
        const cleaned = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
        const parsed = JSON.parse(cleaned);

        dnaResult = {
          signatureItems: Array.isArray(parsed.signatureItems) ? parsed.signatureItems : industry.tags.slice(0, 4),
          keyUSPs: Array.isArray(parsed.keyUSPs) ? parsed.keyUSPs : ["Fast Service", "Fair Pricing", "Hygienic"],
          tagChips: Array.isArray(parsed.tagChips) ? parsed.tagChips.slice(0, 5) : industry.tags.slice(0, 5),
          keywords: typeof parsed.keywords === "string" ? parsed.keywords : `${targetName}, best in ${targetCity || "town"}, quality service, highly recommended`,
          tagline: typeof parsed.tagline === "string" ? parsed.tagline : `Review ${targetName} & Share Your Experience!`,
          tone: ["friendly", "professional", "enthusiastic"].includes(parsed.tone) ? parsed.tone : "friendly",
          category: targetCategory || industry.label,
          summary: parsed.summary || `Top-rated ${targetCategory || industry.label} in ${targetCity || "town"}.`,
        };
      } catch (geminiError) {
        console.warn("Gemini DNA scan failed, falling back to heuristic engine:", geminiError);
        dnaResult = getFallbackDna(targetName, targetCategory || industry.label, targetCity);
      }
    } else {
      dnaResult = getFallbackDna(targetName, targetCategory || industry.label, targetCity);
    }

    // Auto-save to database if requested and businessId exists
    if (autoSave && businessId && existingBusiness) {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          tagChips: dnaResult.tagChips.join(","),
          keywords: dnaResult.keywords,
          tagline: dnaResult.tagline,
          reviewPromptTone: dnaResult.tone,
        },
      });
    }

    return NextResponse.json({
      success: true,
      businessName: targetName,
      dna: dnaResult,
      saved: Boolean(autoSave && businessId),
    });
  } catch (error: any) {
    console.error("Enrich DNA API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to auto-enrich business DNA" },
      { status: 500 }
    );
  }
}

function getFallbackDna(name: string, category: string, city: string): BusinessDnaResult {
  const isRestaurant = /restaurant|cafe|biryani|kitchen|dhaba|baker|dine|food/i.test(category + name);
  const isMedical = /dental|clinic|hospital|doctor|care|health|eye/i.test(category + name);
  const isSalon = /salon|spa|beauty|hair|parlour|grooming/i.test(category + name);
  const isAuto = /auto|car|motor|bike|tyre|service|wash/i.test(category + name);

  if (isRestaurant) {
    return {
      signatureItems: ["Special Biryani", "Tandoori Platters", "Chef Special Curries", "Fresh Fruit Desserts"],
      keyUSPs: ["Authentic Taste", "Quick Table Service", "Hygienic Ambiance", "Family Section"],
      tagChips: ["Delicious Taste", "Fast Service", "Family Friendly", "Clean Ambiance", "Fair Pricing"],
      keywords: `${name}, best restaurant in ${city || "town"}, delicious food, quick service, family dining`,
      tagline: `Tasted something delicious? Rate ${name} in 10 seconds!`,
      tone: "friendly",
      category,
      summary: `Popular dining destination serving authentic flavors and quick service.`,
    };
  }

  if (isMedical) {
    return {
      signatureItems: ["Consultation Care", "Painless Treatment", "Preventive Health Check", "Modern Equipment"],
      keyUSPs: ["Experienced Doctors", "Painless Care", "Sterile & Hygienic", "Clear Explanations"],
      tagChips: ["Painless Treatment", "Caring Staff", "Clean Clinic", "Clear Advice", "Zero Waiting"],
      keywords: `${name}, best clinic in ${city || "town"}, experienced doctor, painless treatment, trusted clinic`,
      tagline: `Your health is our priority. Share your feedback with ${name}!`,
      tone: "professional",
      category,
      summary: `Trusted healthcare provider offering gentle, patient-centric treatments.`,
    };
  }

  if (isSalon) {
    return {
      signatureItems: ["Styling & Cut", "Hair Spa Treatment", "Skin Glow Facial", "Beard Grooming"],
      keyUSPs: ["Expert Stylists", "Premium Products", "Relaxing Atmosphere", "Hygienic Tools"],
      tagChips: ["Great Styling", "Friendly Staff", "Clean Studio", "Relaxing Vibe", "Value For Money"],
      keywords: `${name}, top salon in ${city || "town"}, hair styling, glowing facial, professional spa`,
      tagline: `Loving your new look? Leave a 5-star review for ${name}!`,
      tone: "enthusiastic",
      category,
      summary: `Premier grooming lounge dedicated to personalized beauty and relaxation.`,
    };
  }

  return {
    signatureItems: ["Signature Service", "Quality Products", "Custom Solutions", "On-Time Delivery"],
    keyUSPs: ["Verified Quality", "Friendly Assistance", "Transparent Pricing", "Prompt Support"],
    tagChips: ["Exceptional Quality", "Friendly Staff", "Prompt Service", "Fair Pricing", "Highly Recommended"],
    keywords: `${name}, trusted service in ${city || "town"}, best quality, highly recommended`,
    tagline: `Happy with our service? Rate ${name} on Google!`,
    tone: "friendly",
    category,
    summary: `Reliable local business committed to superior service and customer satisfaction.`,
  };
}
