import type { LanguageMode } from "./review-synthesizer";

export interface RestaurantStyleEntry {
  structure: string;
  style: string;
  lang: LanguageMode;
  generator: () => string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Normalizes a merchant compliment chip into natural dining phrase without
 * turning qualities ("Quick Table Service", "Family Dining Ambience") into awkward objects.
 */
function formatDiningHighlight(tag: string): string {
  const clean = (tag || "").trim();
  if (!clean) return "tasty food";
  return clean.toLowerCase();
}

/**
 * Generates high-entropy, domain-authentic family restaurant & food reviews
 * across 7 Indian languages using culinary flavor, freshness, hygiene, hospitality,
 * seating comfort, and dish variety — with zero generic B2B/agency/output phrasing.
 */
export function buildRestaurantFoodStyles(params: {
  businessName: string;
  selectedTags: string[];
  customNote?: string;
  tagline?: string | null;
  category?: string;
  location?: string | null;
}): RestaurantStyleEntry[] {
  const { businessName, selectedTags, customNote, tagline, category, location } = params;
  const combined = `${businessName} ${tagline || ""} ${category || ""} ${location || ""} ${selectedTags.join(" ")}`.toLowerCase();
  const isFamily = /family/.test(combined);
  const mentionsBiryani = /biryani|dum|tandoori|kebab/.test(combined);
  const localityHint = /mariapuram|maria puram/.test(combined)
    ? "Maria Puram"
    : /new bus|busstand|bus stand/.test(combined)
    ? "near New Bus Stand"
    : /kadapa/.test(combined)
    ? "Kadapa"
    : "";

  const tags =
    selectedTags.length > 0
      ? selectedTags
      : [
          mentionsBiryani ? "Delicious Biryani" : "Authentic Flavors",
          isFamily ? "Family Dining Ambience" : "Fresh & Hot Food",
          "Quick Table Service",
        ];

  const primaryHighlight = formatDiningHighlight(tags[0] || "delicious food");
  const secondaryHighlight = formatDiningHighlight(tags[1] || "friendly hospitality");
  const tertiaryHighlight = formatDiningHighlight(tags[2] || "clean seating");
  const note = customNote?.trim();
  const areaSuffix = localityHint ? ` in ${localityHint}` : "";

  return [
    // ── ENGLISH (7 combinatorial culinary/dining generators) ─────────────────
    {
      structure: "FOOD_FLAVOR_HOSPITALITY",
      style: "Superb Flavors",
      lang: "ENGLISH",
      generator: () => {
        const op = pick([
          `Had a delicious meal at ${businessName}${areaSuffix} and everything tasted freshly prepared.`,
          `Stopped by ${businessName} for dinner and really enjoyed their ${primaryHighlight}.`,
          `Visited ${businessName}${areaSuffix} with family and loved the taste from the very first bite.`,
          `Truly enjoyed dining at ${businessName} — the food aroma and spice balance were spot on.`,
        ]);
        const mid = pick([
          `Every dish arrived piping hot at the table with ${secondaryHighlight} and polite staff.`,
          `${isFamily ? "The calm family dining hall" : "The clean, comfortable dining space"} and ${secondaryHighlight} made our meal relaxed and enjoyable.`,
          `Portions were generous, the kitchen felt hygienic, and our server checked on us thoughtfully without hovering.`,
        ]);
        const cl = pick([
          `Definitely coming back soon with friends!`,
          `Easily one of our favorite dining spots${localityHint ? ` around ${localityHint}` : ""}.`,
          `Great taste and warm hospitality all around.`,
        ]);
        return `${op} ${mid}${note ? ` Especially loved ${note}.` : ""} ${cl}`;
      },
    },
    {
      structure: "FOOD_FAMILY_DINING",
      style: "Family Dining",
      lang: "ENGLISH",
      generator: () => {
        const op = pick([
          `${isFamily ? "Brought the whole family" : "Came with family and kids"} to ${businessName} for a weekend meal.`,
          `Really glad we picked ${businessName} for our family get-together dinner.`,
          `A comfortable, welcoming spot for family lunch or dinner${areaSuffix}.`,
        ]);
        const mid = pick([
          `Starters were crisp, curries were rich without excess oil, and the ${primaryHighlight} pleased both elders and youngsters.`,
          `Seating was spacious and tidy, and the staff served every course warm and right on time at the table.`,
          `We appreciated the ${secondaryHighlight}, ${tertiaryHighlight}, and balanced flavors across every dish we ordered.`,
        ]);
        const cl = pick([
          `Everyone left full and smiling — worth every rupee!`,
          `Will happily bring relatives here next time too.`,
          `Memorable flavors and genuinely warm table service.`,
        ]);
        return `${op} ${mid}${note ? ` Must-try highlight: ${note}.` : ""} ${cl}`;
      },
    },
    {
      structure: "FOOD_BIRYANI_SPICE",
      style: "Authentic Taste",
      lang: "ENGLISH",
      generator: () => {
        const dishFocus = mentionsBiryani
          ? pick(["dum biryani", "aromatic biryani and starters", "chicken biryani and flavorful gravies"])
          : pick(["signature dishes", "authentic homestyle meals", "freshly cooked specials"]);
        const op = pick([
          `If you crave ${dishFocus}, ${businessName} hits the mark effortlessly.`,
          `Ordered ${dishFocus} at ${businessName} and the taste felt genuinely homemade yet rich.`,
          `So satisfied with the ${primaryHighlight} at ${businessName} today.`,
        ]);
        const mid = pick([
          `The masala blend, fresh ingredients, and tender texture showed real care in the kitchen.`,
          `Zero artificial heaviness — just clean, flavorful cooking served hot with ${secondaryHighlight}.`,
          `Service at the table was attentive and brisk, even with other families dining nearby.`,
        ]);
        const cl = pick([
          `Great value for the portion size and taste!`,
          `Already looking forward to our next meal here.`,
          `Hands down a top choice when eating out${areaSuffix}.`,
        ]);
        return `${op} ${mid}${note ? ` Our order of ${note} tasted fantastic.` : ""} ${cl}`;
      },
    },
    {
      structure: "FOOD_HYGIENE_SERVICE",
      style: "Clean & Fresh",
      lang: "ENGLISH",
      generator: () => {
        const op = pick([
          `What stood out immediately at ${businessName} was how clean the tables and dining area looked.`,
          `Clean kitchen standards and fresh, steaming dishes make ${businessName} stand out.`,
          `Impressed by the hygiene, welcoming atmosphere, and quick table service at ${businessName}.`,
        ]);
        const mid = pick([
          `Our order came out fresh from the kitchen with zero long wait, paired with ${primaryHighlight}.`,
          `Waitstaff were polite, attentive with water and extra plates, and made everyone feel cared for.`,
          `Prices on the menu are very reasonable for such generous servings and consistent taste.`,
        ]);
        return `${op} ${mid}${note ? ` Loved how ${note} was prepared.` : ""}`;
      },
    },
    {
      structure: "FOOD_LOCAL_FAVORITE",
      style: "Local Favorite",
      lang: "ENGLISH",
      generator: () => {
        const op = pick([
          `Friends recommended ${businessName}${areaSuffix} for ${primaryHighlight}, and they were completely right.`,
          `Hands down one of the tastiest food spots nearby${areaSuffix}.`,
          `Dined at ${businessName} for the first time and walked out a regular customer.`,
        ]);
        const mid = pick([
          `Delicious food, courteous servers, and comfortable seating make it a stress-free dining choice.`,
          `Every plate tasted fresh, spicy enough without overpowering, and well portioned.`,
          `From starters to main course, the consistency and ${secondaryHighlight} are impressive.`,
        ]);
        return `${op} ${mid}${note ? ` Special mention for ${note}.` : ""}`;
      },
    },
    {
      structure: "FOOD_SHORT_PUNCHY",
      style: "Simple & Direct",
      lang: "ENGLISH",
      generator: () =>
        pick([
          `Delicious food, generous portions, and warm hospitality at ${businessName}${note ? ` — loved ${note}!` : "!"}`,
          `Clean family dining hall with fresh, flavorful dishes and quick table service at ${businessName}.`,
          `Loved the ${primaryHighlight} and ${secondaryHighlight} at ${businessName} — great value meal!`,
          `Hot, hygienic, and genuinely tasty food at ${businessName}. Happy to dine here again!`,
        ]),
    },
    {
      structure: "FOOD_EVENING_BITE",
      style: "Great Value Meals",
      lang: "ENGLISH",
      generator: () => {
        const op = pick([
          `Enjoyed a relaxed evening meal at ${businessName} without burning a hole in the pocket.`,
          `Fair menu pricing, hearty portions, and spotless taste at ${businessName}.`,
        ]);
        const mid = pick([
          `The ${primaryHighlight} and ${secondaryHighlight} felt worth every rupee, and staff kept service smooth throughout dinner.`,
          `Food arrived hot, flavors were rich and balanced, and the ambience suited families comfortably.`,
        ]);
        return `${op} ${mid}${note ? ` Especially enjoyed ${note}.` : ""}`;
      },
    },

    // ── TELUGU SCRIPT (4 combinatorial generators) ───────────────────────────
    {
      structure: "FOOD_TELUGU_1",
      style: "రుచికరమైన భోజనం",
      lang: "TELUGU_SCRIPT",
      generator: () => {
        const op = pick([
          `${businessName} లో భోజనం చాలా రుచిగా మరియు తాజాగా ఉంది.`,
          `కుటుంబంతో కలిసి ${businessName} లో డిన్నర్ చేశాము, రుచి అద్భుతంగా ఉంది.`,
          `${localityHint ? `${localityHint} దగ్గర ` : ""}కుటుంబ భోజనానికి ${businessName} చాలా మంచి రెస్టారెంట్.`,
        ]);
        const mid = pick([
          `బిర్యానీ మరియు స్టార్టర్స్ వేడివేడిగా, మంచి మసాలా రుచితో వడ్డించారు.`,
          `డైనింగ్ హాల్ చాలా శుభ్రంగా ఉంది మరియు సిబ్బంది ఎంతో మర్యాదగా సర్వ్ చేశారు.`,
          `ధరలు రీజనబుల్ గా ఉండి, క్వాంటిటీ మరియు క్వాలిటీ చాలా బాగున్నాయి.`,
        ]);
        return `${op} ${mid}`;
      },
    },
    {
      structure: "FOOD_TELUGU_2",
      style: "ఫ్యామిలీ డైనింగ్",
      lang: "TELUGU_SCRIPT",
      generator: () => {
        const op = pick([
          `ఫ్యామిలీతో కలిసి ప్రశాంతంగా భోజనం చేయడానికి ${businessName} బెస్ట్ ప్లేస్.`,
          `మంచి హైజీన్, రుచికరమైన వంటకాలు మరియు త్వరగా సర్వ్ చేసే స్టాఫ్ ఇక్కడి ప్రత్యేకత.`,
          `${businessName} లో ఆహారం నాణ్యత మరియు రుచి మొదటి నుంచీ చివరి వరకు ఒకేలా బాగున్నాయి.`,
        ]);
        const cl = pick([
          `తప్పకుండా మళ్ళీ కుటుంబంతో వస్తాము.`,
          `కడపలో రుచికరమైన ఫుడ్ కోసం బెస్ట్ ఎంపిక!`,
          `ప్రతి ఒక్కరికీ సిఫార్సు చేస్తున్నాను.`,
        ]);
        return `${op} ${cl}`;
      },
    },
    {
      structure: "FOOD_TELUGU_3",
      style: "బిర్యానీ & రుచులు",
      lang: "TELUGU_SCRIPT",
      generator: () =>
        pick([
          `${businessName} లో బిర్యానీ సువాసన మరియు రుచి చాలా బాగున్నాయి! వేడిగా, ఫ్రెష్ గా వడ్డించారు.`,
          `చాలా క్లీన్ రెస్టారెంట్, ఫాస్ట్ టేబుల్ సర్వీస్ మరియు కుటుంబమంతా ఎంజాయ్ చేసే రుచులు ${businessName} లో ఉన్నాయి.`,
          `మంచి అంబియన్స్, మర్యాదగా మాట్లాడే సిబ్బంది మరియు సరసమైన ధరల్లో కడుపునిండా రుచికరమైన భోజనం!`,
        ]),
    },

    // ── TANGLISH (4 combinatorial generators) ────────────────────────────────
    {
      structure: "FOOD_TANGLISH_1",
      style: "Tanglish Dining",
      lang: "TELUGU_ROMAN",
      generator: () =>
        pick([
          `${businessName} lo food chala bagundi! Biryani and starters super fresh ga, hot ga serve chesaru.`,
          `Family tho dinner kosam ${businessName} vellamu, taste and hospitality rendoo chala nachayi.`,
          `Clean dining hall, quick table service, and authentic flavors at ${businessName} — full paisa vasool!`,
        ]),
    },
    {
      structure: "FOOD_TANGLISH_2",
      style: "Tanglish Biryani",
      lang: "TELUGU_ROMAN",
      generator: () =>
        pick([
          `Friends tho kalisi lunch ki ${businessName} visit chesamu, spice balance and aroma awesome ga unnai.`,
          `Food hygiene and staff politeness at ${businessName} chala bagundi. Portions kuda generous ga icharu.`,
          `Kadapa lo family meal ki peaceful ambiance & tasty food kavali ante ${businessName} best choice!`,
        ]),
    },
    {
      structure: "FOOD_TANGLISH_3",
      style: "Tanglish Short",
      lang: "TELUGU_ROMAN",
      generator: () =>
        `Hot and fresh food with welcoming service at ${businessName}. Family andhalaki chala baga nachindi!`,
    },

    // ── HINDI (4 distinct culinary generators) ───────────────────────────────
    {
      structure: "FOOD_HINDI_1",
      style: "हिंदी समीक्षा",
      lang: "HINDI",
      generator: () => {
        const op = pick([
          `${businessName} में खाना बहुत ही स्वादिष्ट और ताज़ा मिला।`,
          `परिवार के साथ डिनर के लिए ${businessName} एक बेहद बढ़िया रेस्टोरेंट है।`,
          `${businessName} की बिरयानी और स्टार्टर्स का स्वाद वाकई लाजवाब था।`,
        ]);
        const mid = pick([
          `हर डिश गरमा-गरम परोसी गई और टेबल सर्विस भी काफी तेज़ और विनम्र रही।`,
          `साफ-सुथरा डाइनिंग हॉल और किचन की स्वच्छता देखकर बहुत अच्छा लगा।`,
          `दाम बिल्कुल वाजिब हैं और खाने की मात्रा व गुणवत्ता दोनों शानदार हैं।`,
        ]);
        return `${op} ${mid}`;
      },
    },
    {
      structure: "FOOD_HINDI_2",
      style: "फैमिली डाइनिंग",
      lang: "HINDI",
      generator: () => {
        const op = pick([
          `बच्चों और परिवार के साथ आराम से बैठकर भोजन करने के लिए ${businessName} बेहतरीन जगह है।`,
          `${businessName} में मसालों का संतुलन और घर जैसा ताज़ा स्वाद दिल खुश कर देता है।`,
        ]);
        const cl = pick([
          `स्टाफ का व्यवहार बहुत अपनापन भरा था, अगली बार फिर जरूर आएंगे।`,
          `स्वाद, साफ-सफाई और आतिथ्य के लिए पूरे 5 स्टार!`,
        ]);
        return `${op} ${cl}`;
      },
    },
    {
      structure: "FOOD_HINDI_3",
      style: "सरल हिंदी",
      lang: "HINDI",
      generator: () =>
        pick([
          `${businessName} में स्वादिष्ट खाना, साफ-सफाई और अच्छी सर्विस सब कुछ बेहतरीन है।`,
          `गरमा-गरम बिरयानी, बढ़िया माहौल और विनम्र स्टाफ — ${businessName} में खाना खाकर मज़ा आ गया!`,
        ]),
    },

    // ── TAMIL (3 distinct culinary generators) ───────────────────────────────
    {
      structure: "FOOD_TAMIL_1",
      style: "தமிழ் விமர்சனம்",
      lang: "TAMIL",
      generator: () =>
        `${businessName} உணவகத்தில் உணவு மிகவும் சுவையாகவும் சூடாகவும் பரிமாறப்பட்டது. குடும்பத்துடன் அமர்ந்து சாப்பிட சுத்தமான இடம்.`,
    },
    {
      structure: "FOOD_TAMIL_2",
      style: "உணவு அனுபவம்",
      lang: "TAMIL",
      generator: () =>
        `பிரியாணி மற்றும் உணவு வகைகளின் தரம் ${businessName}-ல் அருமையாக உள்ளது. ஊழியர்களின் அன்பான உபசரிப்பு மிகவும் பிடித்தது.`,
    },
    {
      structure: "FOOD_TAMIL_3",
      style: "எளிய தமிழ்",
      lang: "TAMIL",
      generator: () =>
        `நியாயமான விலையில் சுவையான, சுகாதாரமான உணவு கிடைக்கும் சிறந்த குடும்ப உணவகம் ${businessName}.`,
    },

    // ── KANNADA (3 distinct culinary generators) ─────────────────────────────
    {
      structure: "FOOD_KANNADA_1",
      style: "ಕನ್ನಡ ವಿಮರ್ಶೆ",
      lang: "KANNADA",
      generator: () =>
        `${businessName} ರೆಸ್ಟೋರೆಂಟ್‌ನಲ್ಲಿ ಊಟ ತುಂಬಾ ರುಚಿಕರವಾಗಿ ಮತ್ತು ಬಿಸಿಯಾಗಿತ್ತು. ಕುಟುಂಬದೊಂದಿಗೆ ಊಟ ಮಾಡಲು ಸ್ವಚ್ಛವಾದ ವಾತಾವರಣ ಇದೆ.`,
    },
    {
      structure: "FOOD_KANNADA_2",
      style: "ಊಟದ ಅನುಭವ",
      lang: "KANNADA",
      generator: () =>
        `ಬಿರಿಯಾನಿ ಹಾಗೂ ಇತರ ಖಾದ್ಯಗಳ ಸ್ವಾದ ಮತ್ತು ಸಿಬ್ಬಂದಿಯ ವಿನಯಶೀಲ ಸೇವೆ ${businessName} ನಲ್ಲಿ ತುಂಬಾ ಇಷ್ಟವಾಯಿತು.`,
    },
    {
      structure: "FOOD_KANNADA_3",
      style: "ಸರಳ ಕನ್ನಡ",
      lang: "KANNADA",
      generator: () =>
        `ಉತ್ತಮ ಗುಣಮಟ್ಟದ ರುಚಿಕರ ಊಟ ಮತ್ತು ಶುದ್ಧತೆಗೆ ${businessName} ಅತ್ಯುತ್ತಮ ಕುಟುಂಬ ರೆಸ್ಟೋರೆಂಟ್ ಆಗಿದೆ.`,
    },

    // ── MALAYALAM (3 distinct culinary generators) ───────────────────────────
    {
      structure: "FOOD_MALAYALAM_1",
      style: "മലയാളം അവലോകനം",
      lang: "MALAYALAM",
      generator: () =>
        `${businessName} റെസ്റ്റോറന്റിലെ ഭക്ഷണം വളരെ രുചികരവും ചൂടുള്ളതുമായിരുന്നു. കുടുംബത്തോടൊപ്പം ഭക്ഷണം കഴിക്കാൻ വൃത്തിയുള്ള അന്തരീക്ഷമുണ്ട്.`,
    },
    {
      structure: "FOOD_MALAYALAM_2",
      style: "ഭക്ഷണ അനുഭവം",
      lang: "MALAYALAM",
      generator: () =>
        `ബിരിയാണിയും വിഭവങ്ങളും നല്ല ഗുണമേന്മയുള്ളതായിരുന്നു. ${businessName}-ലെ ജീവനക്കാരുടെ മാന്യമായ സേവനം ഏറെ ഇഷ്ടപ്പെട്ടു.`,
    },
    {
      structure: "FOOD_MALAYALAM_3",
      style: "ലളിതമായ മലയാളം",
      lang: "MALAYALAM",
      generator: () =>
        `മിതമായ നിരക്കിൽ രുചികരവും ശുചിത്വവുമുള്ള ഭക്ഷണം ലഭിക്കുന്ന മികച്ച ഫാമിലി റെസ്റ്റോറന്റാണ് ${businessName}.`,
    },
  ];
}
