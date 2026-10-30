/**
 * UPI Protocol Engine with NPCI Merchant Compliance & Direct App Intent Links
 * Resolves NPCI Merchant Category Codes (MCC) to bypass ₹2,000 P2P/gallery-upload limits.
 */

export interface UpiIntentOptions {
  upiId: string;
  payeeName: string;
  category?: string | null;
  customMcc?: string | null;
  amount?: number | null;
  transactionNote?: string | null;
  transactionRef?: string | null;
}

export interface UpiLinkBundle {
  standardUrl: string;
  phonepeUrl: string;
  gpayUrl: string;
  paytmUrl: string;
  bhimUrl: string;
  credUrl: string;
  qrPayload: string;
  mcc: string;
}

/**
 * Maps business category to ISO 18245 Merchant Category Codes (MCC)
 * Recognized by NPCI, PhonePe, Google Pay, and major acquiring banks.
 */
export function getMerchantCategoryCode(category?: string | null, customMcc?: string | null): string {
  if (customMcc && /^\d{4}$/.test(customMcc.trim())) {
    return customMcc.trim();
  }

  const cat = (category || "").toLowerCase();

  // Flex printing, graphic design, signage, paper, stationery
  if (
    cat.includes("print") ||
    cat.includes("flex") ||
    cat.includes("sign") ||
    cat.includes("banner") ||
    cat.includes("graphic") ||
    cat.includes("design") ||
    cat.includes("xerox") ||
    cat.includes("station")
  ) {
    return "7338"; // Quick Copy, Reproduction, and Commercial Art Services
  }

  // Restaurants, food, bakeries, cafes
  if (
    cat.includes("restaurant") ||
    cat.includes("food") ||
    cat.includes("dine") ||
    cat.includes("hotel") ||
    cat.includes("cafe") ||
    cat.includes("baker") ||
    cat.includes("sweet") ||
    cat.includes("biryani")
  ) {
    return "5812"; // Eating Places and Restaurants
  }

  // Dental, clinic, hospital, healthcare
  if (cat.includes("dent") || cat.includes("dental")) {
    return "8021"; // Dentists and Orthodontists
  }
  if (cat.includes("clinic") || cat.includes("hospital") || cat.includes("doctor") || cat.includes("health")) {
    return "8099"; // Medical Services and Health Practitioners
  }

  // Salons, barber, beauty, spa, tattoo
  if (cat.includes("salon") || cat.includes("beauty") || cat.includes("spa") || cat.includes("hair") || cat.includes("tattoo")) {
    return "7230"; // Beauty and Barber Shops
  }

  // Automobile, bike, car, garage, service
  if (cat.includes("auto") || cat.includes("motor") || cat.includes("car") || cat.includes("bike") || cat.includes("garage")) {
    return "7538"; // General Automotive Repair Shops
  }

  // Technology, software, IT services
  if (cat.includes("tech") || cat.includes("software") || cat.includes("it ") || cat.includes("computer")) {
    return "7372"; // Computer Programming & Data Processing
  }

  // Retail, clothing, jewellery, grocery
  if (cat.includes("jewel") || cat.includes("gold")) {
    return "5944"; // Jewelry Stores, Watches, Clocks, and Silverware Stores
  }
  if (cat.includes("cloth") || cat.includes("dress") || cat.includes("tailor") || cat.includes("fashion")) {
    return "5651"; // Family Clothing Stores
  }
  if (cat.includes("grocer") || cat.includes("supermarket") || cat.includes("provision")) {
    return "5411"; // Grocery Stores and Supermarkets
  }

  // Default NPCI business service category code
  return "7399"; // Business Services Not Elsewhere Classified
}

/**
 * Builds a bundle of compliant UPI intent links and QR payload
 */
export function buildUpiLinks(options: UpiIntentOptions): UpiLinkBundle {
  const pa = (options.upiId || "").trim();
  const pn = (options.payeeName || "").trim();
  const mcc = getMerchantCategoryCode(options.category, options.customMcc);

  const queryParams = new URLSearchParams();
  queryParams.set("pa", pa);
  queryParams.set("pn", pn);
  queryParams.set("mc", mcc);
  queryParams.set("mode", "01"); // 01 = Live Camera QR Initiation (bypasses mode=02 gallery screenshot restriction)
  queryParams.set("purpose", "00");
  queryParams.set("cu", "INR");

  if (options.amount && options.amount > 0) {
    queryParams.set("am", options.amount.toFixed(2));
  }

  if (options.transactionNote) {
    queryParams.set("tn", options.transactionNote.trim().slice(0, 50));
  }

  if (options.transactionRef) {
    queryParams.set("tr", options.transactionRef.trim());
  }

  const queryString = queryParams.toString();

  return {
    standardUrl: `upi://pay?${queryString}`,
    phonepeUrl: `phonepe://pay?${queryString}`,
    gpayUrl: `tez://upi/pay?${queryString}`,
    paytmUrl: `paytmmp://pay?${queryString}`,
    bhimUrl: `bhim://pay?${queryString}`,
    credUrl: `cred://upi/pay?${queryString}`,
    qrPayload: `upi://pay?${queryString}`,
    mcc,
  };
}
