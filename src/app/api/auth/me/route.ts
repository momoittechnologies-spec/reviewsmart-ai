import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          userIdTag: true,
          phone: true,
          customerType: true,
          isActive: true,
          businesses: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              primaryColor: true,
              isPaid: true,
              customerType: true,
            },
          },
        },
      });

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: fullUser?.name || user.name,
          role: fullUser?.role || user.role,
          phone: fullUser?.phone,
          userIdTag: fullUser?.userIdTag,
          customerType: fullUser?.customerType,
          isActive: fullUser?.isActive ?? true,
          businesses: fullUser?.businesses || [],
        },
      });
    } catch {
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 500 }
    );
  }
}
