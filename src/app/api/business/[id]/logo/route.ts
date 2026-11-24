import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return new NextResponse("Identifier required", { status: 400 });
  }

  try {
    const business = await prisma.business.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
      },
    });

    if (!business || !business.logoUrl) {
      return new NextResponse("Logo not found", { status: 404 });
    }

    const rawLogo = business.logoUrl.trim();

    // 1. Base64 Data URL
    if (rawLogo.startsWith("data:")) {
      const commaIdx = rawLogo.indexOf(",");
      if (commaIdx !== -1) {
        const metaPart = rawLogo.slice(0, commaIdx);
        const mimeMatch = metaPart.match(/^data:([^;]+);base64/i);
        const contentType = mimeMatch ? mimeMatch[1] : "image/png";
        const base64Data = rawLogo.slice(commaIdx + 1).replace(/\s/g, "");
        const buffer = Buffer.from(base64Data, "base64");

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Length": buffer.length.toString(),
            // Cache aggressively across browser and edge CDN
            "Cache-Control": "public, max-age=31536000, immutable",
            "CDN-Cache-Control": "public, max-age=31536000, immutable",
            "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // 2. External HTTP/HTTPS URL
    if (rawLogo.startsWith("http://") || rawLogo.startsWith("https://")) {
      return NextResponse.redirect(rawLogo, 307);
    }

    // 3. Fallback relative URL
    return NextResponse.redirect(new URL(rawLogo, req.url), 307);
  } catch (err: any) {
    console.error("Failed to serve business logo:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
