import { NextRequest, NextResponse } from "next/server";
import { GET as getLogoHandler } from "@/app/api/business/[id]/logo/route";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  return getLogoHandler(req, { params: { id: params.slug } });
}
