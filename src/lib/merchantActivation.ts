import { prisma } from "@/lib/prisma";

export const AGENT_DAILY_POOL_LIMIT = 5;

/**
 * Normalize an Indian/international phone string to its canonical last-10-digit form when possible.
 */
export function normalizePhone10(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits.length >= 7 ? digits : null;
}

/**
 * Compute plain-language missing onboarding items for an agent/manager merchant setup.
 */
export function getMerchantMissingItems(biz: {
  isPaid?: boolean | null;
  logoUrl?: string | null;
  googleReviewUrl?: string | null;
  name?: string | null;
}): string[] {
  const missing: string[] = [];
  if (!biz.name || !biz.name.trim()) {
    missing.push("Waiting for business name");
  }
  if (!biz.googleReviewUrl || !biz.googleReviewUrl.trim()) {
    missing.push("Waiting for Google review link");
  }
  if (!biz.logoUrl || !biz.logoUrl.trim()) {
    missing.push("Waiting for logo");
  }
  if (!biz.isPaid) {
    missing.push("Awaiting payment confirmation");
  }
  return missing;
}

/**
 * Check whether a merchant satisfies all activation requirements (paid + Google review link + logo).
 */
export function isMerchantActivationReady(biz: {
  isPaid?: boolean | null;
  logoUrl?: string | null;
  googleReviewUrl?: string | null;
}): boolean {
  return Boolean(
    biz.isPaid &&
      biz.logoUrl &&
      biz.logoUrl.trim().length > 0 &&
      biz.googleReviewUrl &&
      biz.googleReviewUrl.trim().length > 0
  );
}

/**
 * Stamp `activatedAt` on a Business once payment is approved AND logo + Google review URL exist.
 * Leaves `activatedAt` untouched if already set, so historical activation dates never drift.
 */
export async function syncBusinessActivation(businessId: string): Promise<{
  isActivated: boolean;
  activatedAt: Date | null;
  missingItems: string[];
}> {
  const biz = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      isPaid: true,
      logoUrl: true,
      googleReviewUrl: true,
      activatedAt: true,
    },
  });

  if (!biz) {
    return { isActivated: false, activatedAt: null, missingItems: ["Business not found"] };
  }

  const missingItems = getMerchantMissingItems(biz);
  if (isMerchantActivationReady(biz) && !biz.activatedAt) {
    const now = new Date();
    await prisma.business.update({
      where: { id: biz.id },
      data: { activatedAt: now },
    });
    return { isActivated: true, activatedAt: now, missingItems: [] };
  }

  return {
    isActivated: Boolean(biz.activatedAt),
    activatedAt: biz.activatedAt,
    missingItems,
  };
}
