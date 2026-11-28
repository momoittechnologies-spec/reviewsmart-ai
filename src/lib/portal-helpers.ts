import { parsePhoneNumbers } from "@/lib/utils";

export interface IndustryPortalMeta {
  type: string;
  label: string;
  shortEntity: string;
  hubToggleLabel: string;
  hubCompactLabel: string;
  placeholder: string;
  defaultTags: string[];
}

export interface PortalBusinessData {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  googleReviewUrl: string | null;
  googlePlaceId: string | null;
  googleAddress?: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  category?: string | null;
  minRatingForGoogle: number;
  tagChips: string;
  keywords: string;
  reviewPromptTone: string;
  menuUrl?: string | null;
  customUpiId?: string | null;
  enableUpiPayments?: boolean | null;
  enableScratchCard?: boolean | null;
  scratchCardMaxDiscount?: number | null;
  enableSocialLinks?: boolean | null;
  enableDigitalMenu?: boolean | null;
  visitingCardOwnerName?: string | null;
  visitingCardPhone?: string | null;
  googleMapsUrl?: string | null;
  industryMeta: IndustryPortalMeta;
}

const SLUG_PLACE_OVERRIDES: Record<string, string> = {
  "as-refrigeration": "ChIJuX7dAX5zszsROYSpGZLNNfw",
  "sushmas-fashion-beauty": "ChIJbzsJc9NzszsRtBUfS0gXCHk",
  vrgold: "ChIJHUVe5u5zszsR-sspZhPvhms",
  citygrafix: "ChIJx7MuneJzszsRhKHkYyndOs4",
  "anand-fashion-studio-bf84": "ChIJs4-kUhJzszsRAk8ObSZuam4",
  "sri-guru-fashions-393a": "ChIJ-_3HayRzszsRhE95URiMOqc",
  "mana-tours-travels": "ChIJz-6hOcbQVaYRELARxZjPbrE",
  "evania-luxury-salon": "ChIJY8WhWVmTyzsRUz83m4gzT_0",
  "her-choice-kadapa": "ChIJmd0QeABtszsR2ygj6nHEsDg",
  "golden-hair-wig-studio": "ChIJHQ87W85zszsRbNs55NHT6E8",
  "golden-hair-wig-studio-nandyal": "ChIJYaVlsaittTsRr6ueXjEty4w",
  "golden-hair-wig-studio-madanapalle": "ChIJi9aO_IhlsjsRi9Ab1pTMaaM",
  "golden-hair-wig-studio-proddatur": "ChIJa-uPQACHszsR2qmIIq8hVK4",
  "new-roshan-tours-and-travels": "ChIJgUHgPjpzszsRTYUDNrgZtC4",
  "her-heaven-fitness-gym": "ChIJn2Z4EABzszsRC22fMdYdK-0",
  "being-fitness-ladies-gym": "ChIJ54Nga3xzszsRyEy044kAng4",
  "kakatiya-family-restaurant": "ChIJMyUXB-hzszsRqE-rIoqcPmw",
};

const SLUG_MAPS_OVERRIDES: Record<string, string> = {
  "evania-luxury-salon": "https://share.google/kOhlZAitT8HfL51yo",
  "her-choice-kadapa": "https://www.google.com/maps?cid=4084980855563561179",
  "golden-hair-wig-studio": "https://share.google/2Nccb0ELL3iwhq0lK",
  "golden-hair-wig-studio-nandyal": "https://share.google/IL4ROXJQTqePzWtGY",
  "golden-hair-wig-studio-madanapalle": "https://share.google/W4IkEga1ChNP4EQuB",
  "golden-hair-wig-studio-proddatur": "https://share.google/k4nRUBOWRP3xQWPmq",
  "new-roshan-tours-and-travels": "https://share.google/odil5WTbGmas4G1dr",
  "her-heaven-fitness-gym": "https://share.google/g95pofDYtJgydCwm6",
  "being-fitness-ladies-gym": "https://share.google/kuMBhq984GhP8QvXV",
  "kakatiya-family-restaurant": "https://share.google/sXCXcRIrXK1PyGD1F",
};

const INVALID_PLACE_IDS = new Set([
  "ChIJfx1E9GgPujkRcPNEzcyHcJI",
  "ChIJd5iV_xdzszsRMOGZeUo3C8A",
  "ChIJd5iV_xdzszsRkhqTVfZl_iY",
]);

export function resolvePlaceId(business: Pick<PortalBusinessData, "slug" | "googlePlaceId" | "googleReviewUrl">): string {
  let placeId = (business.googlePlaceId || "").trim();
  if (!placeId && SLUG_PLACE_OVERRIDES[business.slug]) {
    placeId = SLUG_PLACE_OVERRIDES[business.slug];
  }
  if (!placeId && business.googleReviewUrl) {
    const match =
      business.googleReviewUrl.match(/[?&](?:place(?:_)?id|query_place_id)=([^&#]+)/i) ||
      business.googleReviewUrl.match(/(ChIJ[A-Za-z0-9_-]{20,})/);
    if (match?.[1]) {
      placeId = match[1];
    }
  }
  return INVALID_PLACE_IDS.has(placeId) ? "" : placeId;
}

export function resolveGoogleReviewTarget(
  business: Pick<PortalBusinessData, "slug" | "name" | "googlePlaceId" | "googleReviewUrl">
): string {
  const rawUrl = (business.googleReviewUrl || "").trim();
  const placeId = resolvePlaceId(business);

  if (business.slug.includes("vijaya")) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Vijaya's Yummy Food Kadugodi Bengaluru")}`;
  }
  if (SLUG_PLACE_OVERRIDES[business.slug]) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(SLUG_PLACE_OVERRIDES[business.slug])}`;
  }
  if (rawUrl && rawUrl.includes("g.page/r/")) {
    return rawUrl.endsWith("/review") || rawUrl.endsWith("/review/")
      ? rawUrl
      : `${rawUrl.replace(/\/+$/, "")}/review`;
  }
  if (rawUrl && rawUrl.includes("share.google/")) {
    return rawUrl;
  }
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  }
  if (rawUrl && rawUrl.includes("search.google.com/local/writereview")) {
    return rawUrl;
  }
  if (rawUrl) {
    const cidMatch = rawUrl.match(/[?&]cid=([0-9]+)/i);
    if (cidMatch?.[1]) {
      return `https://search.google.com/local/writereview?cid=${encodeURIComponent(cidMatch[1])}`;
    }
    if (!rawUrl.includes("query_place_id=")) {
      return rawUrl;
    }
    return rawUrl.replace(/([?&])query_place_id=[^&]+(&|$)/, "$1").replace(/[?&]$/, "");
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}`;
}

export function resolveMapsDirectionsTarget(
  business: Pick<PortalBusinessData, "slug" | "name" | "googleAddress" | "googleMapsUrl" | "googlePlaceId" | "googleReviewUrl">
): string {
  if (business.googleMapsUrl && business.googleMapsUrl.trim()) {
    return business.googleMapsUrl.trim();
  }
  if (SLUG_MAPS_OVERRIDES[business.slug]) {
    return SLUG_MAPS_OVERRIDES[business.slug];
  }
  const placeId = resolvePlaceId(business);
  if (placeId) {
    const query = encodeURIComponent(business.googleAddress ? `${business.name} ${business.googleAddress}` : business.name);
    return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${encodeURIComponent(placeId)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}`;
}

export function ensureExternalUrl(raw?: string | null): string | null {
  const cleaned = (raw || "").trim();
  if (!cleaned) return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (cleaned.includes(".") || cleaned.includes("/")) {
    return `https://${cleaned.replace(/^\/+/, "")}`;
  }
  return null;
}

export function normalizeSocialUrl(raw: string | null | undefined, platform: "instagram" | "facebook"): string | null {
  const cleaned = (raw || "").trim();
  if (!cleaned) return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  const handle = cleaned.replace(/^@+/, "").trim();
  if (!handle) return null;
  return platform === "instagram" ? `https://www.instagram.com/${handle}/` : `https://www.facebook.com/${handle}`;
}

export function extractWhatsAppNumber(
  whatsapp?: string | null,
  fallbackPhones?: Array<{ clean10: string }>
): string | null {
  const raw = (whatsapp || "").trim();
  if (raw) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= 10) {
      return digits.length === 10 ? `91${digits}` : digits;
    }
  }
  const fallback = fallbackPhones?.[0]?.clean10;
  return fallback ? `91${fallback}` : null;
}

export function buildWhatsAppUrl(waFullNumber: string | null, message: string): string | null {
  if (!waFullNumber) return null;
  return `https://wa.me/${waFullNumber}?text=${encodeURIComponent(message)}`;
}

export function getShortEntityLabel(industryType: string): string {
  switch (industryType) {
    case "RESTAURANT_FOOD":
      return "restaurant";
    case "FITNESS_GYM":
      return "gym";
    case "SALON_BEAUTY":
      return "salon";
    case "HEALTHCARE_CLINIC":
      return "clinic";
    case "HOTEL_HOSPITALITY":
      return "hotel";
    case "AUTO_GARAGE":
      return "garage";
    case "PHOTOGRAPHY_STUDIO":
    case "TATTOO_STUDIO":
      return "studio";
    case "RETAIL_SHOP":
    case "GOLD_BUYERS":
      return "store";
    case "TOURS_TRAVELS":
    case "PILGRIMAGE_UMRAH":
      return "travels";
    case "STUDY_HALL_EDUCATION":
      return "study hall";
    default:
      return "business";
  }
}

export function getHubToggleLabel(industryType: string): string {
  if (industryType === "RESTAURANT_FOOD") return "Menu & restaurant info";
  if (industryType === "SALON_BEAUTY") return "Services & salon info";
  if (industryType === "FITNESS_GYM") return "Gym info & contact";
  if (industryType === "HEALTHCARE_CLINIC") return "Clinic info & contact";
  return "Business info & links";
}

export function getHubCompactLabel(industryType: string): string {
  if (industryType === "RESTAURANT_FOOD") return "Menu & info";
  if (industryType === "SALON_BEAUTY") return "Salon & info";
  if (industryType === "FITNESS_GYM") return "Gym & info";
  if (industryType === "HEALTHCARE_CLINIC") return "Clinic & info";
  return "Info & links";
}

export interface MenuDestination {
  href: string;
  label: string;
  subtitle: string;
}

export function resolveMenuDestination(
  business: Pick<PortalBusinessData, "menuUrl" | "enableDigitalMenu" | "industryMeta">
): MenuDestination | null {
  if (business.enableDigitalMenu === false) return null;
  const href = ensureExternalUrl(business.menuUrl);
  if (!href) return null;
  const lower = href.toLowerCase();
  if (lower.includes("swiggy.com")) {
    return {
      href,
      label: "View menu on Swiggy",
      subtitle: "Browse dishes & order online",
    };
  }
  if (lower.includes("zomato.com")) {
    return {
      href,
      label: "View menu on Zomato",
      subtitle: "Browse dishes & order online",
    };
  }
  if (business.industryMeta.type === "RESTAURANT_FOOD") {
    return {
      href,
      label: "View digital menu",
      subtitle: "Browse dishes & specials",
    };
  }
  return {
    href,
    label: "View digital catalog",
    subtitle: "Browse services & details",
  };
}

export function getParsedBusinessPhones(phone?: string | null, visitingCardPhone?: string | null) {
  const combined = [phone, visitingCardPhone].filter(Boolean).join(" / ");
  return parsePhoneNumbers(combined);
}

/**
 * Deterministic, zero-dependency fallback formatter for "Help me phrase this"
 * so review phrasing still works immediately even if the AI endpoint is offline/slow.
 * Strictly preserves the guest's rating sentiment and actual words/selected chips.
 */
export function buildGroundedFallbackDraft(params: {
  businessName: string;
  rating: number;
  selectedTags: string[];
  customNote: string;
}): string {
  const { businessName, rating, selectedTags, customNote } = params;
  const note = customNote.trim();
  const cleanTags = selectedTags.map((t) => t.trim()).filter(Boolean);
  const effectiveRating = rating > 0 ? rating : 5;

  if (note) {
    const ended = /[.!?]$/.test(note) ? note : `${note}.`;
    if (effectiveRating >= 4) {
      return `Visited ${businessName}. ${ended}`;
    }
    if (effectiveRating === 3) {
      return `Shared feedback about my visit to ${businessName}: ${ended}`;
    }
    return `My experience at ${businessName}: ${ended}`;
  }

  if (cleanTags.length > 0) {
    const joined = cleanTags.map((t) => t.toLowerCase()).join(", ");
    if (effectiveRating >= 4) {
      return `Good visit to ${businessName} — appreciated the ${joined}.`;
    }
    if (effectiveRating === 3) {
      return `Mixed visit to ${businessName} regarding ${joined}.`;
    }
    return `Visited ${businessName}; areas to improve: ${joined}.`;
  }

  return "";
}
