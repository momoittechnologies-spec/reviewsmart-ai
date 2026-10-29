import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { fetchRealBusinessLeads } from "@/lib/gmbDataFetcher";

export const dynamic = "force-dynamic";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const city = String(body.city || "Kadapa").trim();
    const category = String(body.category || "Restaurants & Cafes").trim();

    const cacheKey = `leads|${city}|${category}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.data, fromCache: true });
    }

    const result = await fetchRealBusinessLeads(city, category);

    const responseData = {
      success: true,
      city,
      category,
      dataSource: result.dataSource,
      note: result.note,
      leads: result.leads,
    };

    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("[leads/search] Error:", err);
    return NextResponse.json({ error: err?.message || "Failed to search leads" }, { status: 500 });
  }
}
