import { IndustryType } from "./industry";
import { LanguageMode } from "./review-synthesizer";

export function detectScriptLanguage(text: string, spokenLang?: string): LanguageMode | null {
  if (!text) return null;
  if (/[\u0C00-\u0C7F]/.test(text) || spokenLang === "te-IN") return "TELUGU_SCRIPT";
  if (/[\u0900-\u097F]/.test(text) || spokenLang === "hi-IN") return "HINDI";
  if (/[\u0B80-\u0BFF]/.test(text) || spokenLang === "ta-IN") return "TAMIL";
  if (/[\u0C80-\u0CFF]/.test(text) || spokenLang === "kn-IN") return "KANNADA";
  if (/[\u0D00-\u0D7F]/.test(text) || spokenLang === "ml-IN") return "MALAYALAM";

  const lower = text.toLowerCase();
  if (/\b(chala|bagundi|baga|chesaru|vacharu|super ga|manchi|tvaraga)\b/.test(lower)) {
    return "TELUGU_SCRIPT";
  }
  if (/\b(bahut|accha|badhiya|kaam|shandar|sahi|waqt)\b/.test(lower)) {
    return "HINDI";
  }
  if (/\b(romba|nalla|supera|seithanga|nerathuku)\b/.test(lower)) {
    return "TAMIL";
  }
  if (/\b(thumba|chennagide|olle|sariyagi)\b/.test(lower)) {
    return "KANNADA";
  }
  if (/\b(valare|nalla|sevanam|adipoli)\b/.test(lower)) {
    return "MALAYALAM";
  }
  return null;
}

export function hasNonLatinScript(text: string): boolean {
  return /[\u0900-\u0D7F]/.test(text);
}

/**
 * Translates common spoken Telugu, Hindi, Tamil, Kannada, Malayalam, and Tanglish/Hinglish
 * customer expressions into natural, grammatical English for instant 0ms preview and fallback synthesis.
 */
export function translateSpokenRegionalToEnglish(text: string, spokenLang?: string): string {
  if (!text || !text.trim()) return "";
  const trimmed = text.trim();

  // If pure Latin without regional colloquialisms, return as-is
  if (
    !hasNonLatinScript(trimmed) &&
    !/\b(chala|bagundi|baga|chesaru|vacharu|manchi|tvaraga|bahut|accha|badhiya|kaam|shandar|romba|nalla|thumba|chennagide|valare|adipoli)\b/i.test(
      trimmed
    )
  ) {
    return trimmed;
  }

  const traits: string[] = [];
  const lower = trimmed.toLowerCase();

  // Quality / Good work
  if (
    /చాలా బాగుంది|బాగా చేశారు|సూపర్|మంచి|अच्छा|बढ़िया|शानदार|நல்ல|அருமை|ಚೆನ್ನಾಗಿದೆ|ಉತ್ತಮ|നല്ല|അടിപൊളി|\b(chala baga|bagundi|bahut accha|badhiya|romba nalla|thumba chennagide|valare nalla|adipoli)\b/i.test(
      trimmed
    )
  ) {
    traits.push("the work quality was neat and genuinely impressive");
  }

  // Punctuality / Fast service
  if (
    /టైమ్|సమయానికి|త్వరగా|ఫాస్ట్|समय|जल्दी|फास्ट|நேரத்திற்கு|வேகமாக|ಸಮಯಕ್ಕೆ|വേഗത്തിൽ|കൃത്യസമയത്ത്|\b(time ki|tvaraga|fast ga|jaldi|waqt par|nerathuku)\b/i.test(
      trimmed
    )
  ) {
    traits.push("they completed the service right on time without any delay");
  }

  // Staff / Politeness
  if (
    /మర్యాద|స్టాఫ్|టెక్నీషియన్|স্টാफ|स्टाफ|विनम्र|ஊழியர்கள்|ಸಿಬ್ಬಂದಿ|സ്റ്റാഫ്|\b(staff|technician|polite|friendly|maryada)\b/i.test(
      trimmed
    )
  ) {
    traits.push("the staff were polite, patient, and cooperative");
  }

  // Pricing / Reasonable cost
  if (
    /రేట్|ధర|తక్కువ|రీజనబుల్|दाम|कीमत|उचित|விலை|ಬೆಲೆ|വില|\b(rate|price|reasonable|takkuva|sahi daam)\b/i.test(
      trimmed
    )
  ) {
    traits.push("the pricing was transparent and very reasonable");
  }

  // Cooling / AC / Repair specific
  if (/కూలింగ్|ఏసీ|ఫ్రిజ్|वाशिंग|एसी|कूलिंग|\b(cooling|ac|fridge|jet wash|gas)\b/i.test(lower)) {
    traits.push("the cooling performance is restored to brand-new condition");
  }

  if (traits.length > 0) {
    const joined = traits.join(", and ");
    return joined.charAt(0).toUpperCase() + joined.slice(1);
  }

  return "The overall service quality, prompt execution, and attention to detail stood out";
}
