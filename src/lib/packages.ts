export type PackageTierId =
  | "ONLINE_LIFETIME"
  | "STARTER_PVC"
  | "EXECUTIVE_STANDEE"
  | "ALL_IN_ONE_HUB"
  | "ENTERPRISE_CUSTOM";

export interface HardwarePackage {
  id: PackageTierId;
  name: string;
  shortName: string;
  price: number;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  hardwareDeliverables: string[];
  softwareDeliverables: string[];
  bestFor: string;
  salesPitch: string;
}

export const HARDWARE_PACKAGES: Record<PackageTierId, HardwarePackage> = {
  ONLINE_LIFETIME: {
    id: "ONLINE_LIFETIME",
    name: "ReviewSmart AI Lifetime Pass (All India)",
    shortName: "Lifetime Pass",
    price: 2999,
    tagline: "100% Free For Lifetime • Zero Monthly/Yearly Fees • Free GMB Setup Included",
    badge: "🇮🇳 Pan-India Flagship • ₹2,999 Lifetime Pass",
    isPopular: true,
    hardwareDeliverables: [
      "1x 4″×6″ Luxury Crystal Acrylic Counter Standee (Retail Showpiece)",
      "1x Dual-Sided Vertical PVC Smart QR Card (Google Review + Digital Visiting Card)",
      "Official Google 'G' High-Precision Circular QR Badge",
      "Free Doorstep Express Courier Delivery across India",
      "🆓 FREE Google Business Profile (GMB) Setup & Verification (if you don't have one)",
    ],
    softwareDeliverables: [
      "Gemini AI 5-Star Review Generation in 6 Indian Languages (EN, TE, HI, TA, KN, ML)",
      "⚡ Express 1-Tap Sub-3-Second Review Automation",
      "Native Android Google Maps App Intent Deep Linking",
      "🎙️ Voice-to-Review Speech Recognition (6 Languages)",
      "🎁 Interactive Scratch Card & Customer Voucher Rewards",
      "🛡️ Private WhatsApp Negative Feedback Intercept Shield",
      "📲 1-Click WhatsApp Personalized Review Inviter (?cust= & ?service=)",
      "🤖 AI Google Review Reply Copilot (SEO Ranking Booster)",
      "📍 Complete Google Maps Category & Local SEO Keyword Optimization",
      "100% Free for Lifetime — 0 Monthly or Yearly Software Fees Forever",
      "All Future Platform Updates & New AI Features Included at No Extra Cost",
    ],
    bestFor: "Retail stores, restaurants, clinics, boutiques, salons, service businesses across India",
    salesPitch:
      "Pay ₹2,999 once and get complete lifetime access with zero renewals. Free Google Business Profile creation & verification included, plus Standee Studio access.",
  },
  STARTER_PVC: {
    id: "STARTER_PVC",
    name: "Starter Review Booster",
    shortName: "Starter",
    price: 2999,
    tagline: "1 Physical A6 Acrylic Standee + 6-Language AI Portal • Lifetime",
    badge: "Starter • ₹2,999",
    isPopular: false,
    hardwareDeliverables: [
      "1x 4″×6″ (A6) Crystal Acrylic Counter Standee with custom brand artwork",
      "Free Doorstep Express Courier Delivery across India",
    ],
    softwareDeliverables: [
      "6-Language Gemini AI Review Generator (EN, TE, HI, TA, KN, ML)",
      "Private WhatsApp Negative Feedback Shield",
      "Custom Brand Artwork + Lifetime Cloud Hosting (Zero Monthly Fees)",
    ],
    bestFor: "Retail counters, clinics, boutiques, salons, travel offices across India",
    salesPitch:
      "Complete counter standee kit for ₹2,999 one-time with custom branding, Pan-India delivery, and zero recurring fees.",
  },
  EXECUTIVE_STANDEE: {
    id: "EXECUTIVE_STANDEE",
    name: "Smart Business Hub",
    shortName: "Smart Business Hub",
    price: 3999,
    tagline: "Dual-Sided Standee + Direct UPI Pay + Social & Digital Menu Hub",
    badge: "Most Popular • ₹3,999",
    isPopular: true,
    hardwareDeliverables: [
      "1x Dual-Sided 4″×6″ (A6) Crystal Acrylic Standee (Review QR + Direct UPI Pay)",
      "Free Doorstep Express Courier Delivery across India",
    ],
    softwareDeliverables: [
      "Everything in Starter Review Booster included",
      "0% Fee Counter UPI Payment Hub (PhonePe, GPay, Paytm 1-tap)",
      "Instagram Quick-Follow, Facebook & Digital Menu/Catalog Viewer",
      "Zero-Reprint Dynamic QR + Lifetime Portal Access",
    ],
    bestFor: "Salons, cafes, printing studios, clinics, retail showrooms",
    salesPitch:
      "Our most popular Smart Business Hub uniting Google review capture with 0%-fee counter UPI payments and social links.",
  },
  ALL_IN_ONE_HUB: {
    id: "ALL_IN_ONE_HUB",
    name: "360° Growth & Loyalty",
    shortName: "360° Growth",
    price: 4999,
    tagline: "2x Acrylic Standees + Dual-Sided PVC Smart Cards + AI Auto-Pilot",
    badge: "Best Value • ₹4,999",
    isPopular: false,
    hardwareDeliverables: [
      "2x 4″×6″ (A6) Crystal Acrylic Counter Standees for multi-counter placement",
      "Dual-Sided Smart Review PVC Cards with Custom Brand Artwork",
      "Free Express Pan-India Courier Delivery",
    ],
    softwareDeliverables: [
      "Everything in Smart Business Hub included",
      "Interactive Scratch Card Loyalty & Repeat Visit Coupons",
      "WhatsApp Personalized Review Inviter + AI Reply Copilot",
      "Priority Design Support & Lifetime Platform Updates",
    ],
    bestFor: "High-footfall restaurants, multi-counter showrooms, medical centers",
    salesPitch:
      "Complete multi-standee growth and customer retention system for ₹4,999 one-time.",
  },
  ENTERPRISE_CUSTOM: {
    id: "ENTERPRISE_CUSTOM",
    name: "Enterprise Multi-Branch Bundle",
    shortName: "Enterprise Bundle",
    price: 5999,
    tagline: "Tailored multi-branch hardware bundle for chains & franchises",
    badge: "Chains & Multi-Branch",
    isPopular: false,
    hardwareDeliverables: [
      "Custom Acrylic Standees & PVC Cards tailored to branch count",
      "Multi-counter placement for each branch location",
    ],
    softwareDeliverables: [
      "Multi-Branch Central Management Dashboard",
      "Custom Branch-wise UPI Settlement Routing",
      "Consolidated Multi-location Review Analytics",
      "Dedicated Account Manager & Priority Hardware Dispatch",
    ],
    bestFor: "Multi-branch retail chains, medical clinics with branches, hotel franchises",
    salesPitch:
      "Custom multi-branch rollout covering all counters and branches with centralized management.",
  },
};

export const PACKAGE_LIST = [
  HARDWARE_PACKAGES.ONLINE_LIFETIME,
  HARDWARE_PACKAGES.STARTER_PVC,
  HARDWARE_PACKAGES.EXECUTIVE_STANDEE,
  HARDWARE_PACKAGES.ALL_IN_ONE_HUB,
  HARDWARE_PACKAGES.ENTERPRISE_CUSTOM,
];

export function getPackageById(id?: string | null): HardwarePackage {
  if (id && id in HARDWARE_PACKAGES) {
    return HARDWARE_PACKAGES[id as PackageTierId];
  }
  return HARDWARE_PACKAGES.ONLINE_LIFETIME;
}

export function getPackageByPrice(price?: number | null): HardwarePackage {
  if (!price || price <= 3400) {
    return HARDWARE_PACKAGES.STARTER_PVC;
  }
  if (price < 4500) {
    return HARDWARE_PACKAGES.EXECUTIVE_STANDEE;
  }
  if (price < 5500) {
    return HARDWARE_PACKAGES.ALL_IN_ONE_HUB;
  }
  return HARDWARE_PACKAGES.ENTERPRISE_CUSTOM;
}
