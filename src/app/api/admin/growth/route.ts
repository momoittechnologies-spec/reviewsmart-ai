import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { fetchRealBusinessLeads } from "@/lib/gmbDataFetcher";

export const dynamic = "force-dynamic";

// Simple in-memory cache: key = "city|category", value = { data, timestamp }
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const city = String(body.city || "Kadapa").trim();
    const category = String(body.category || "Restaurants & Cafes").trim();

    const cacheKey = `${city}|${category}`;
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
      totalFound: result.totalFound,
      leads: result.leads,
    };

    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("[admin/growth] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch business leads" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Kadapa";
  const category = searchParams.get("category") || "Restaurants & Cafes";

  // Delegate to POST handler logic
  const fakeReq = new NextRequest(req.url, {
    method: "POST",
    body: JSON.stringify({ city, category }),
    headers: { "Content-Type": "application/json", cookie: req.headers.get("cookie") || "" },
  });
  return POST(fakeReq);
}
