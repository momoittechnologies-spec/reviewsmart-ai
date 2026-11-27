import type { LanguageMode } from "./review-synthesizer";

export interface FitnessStyleEntry {
  structure: string;
  style: string;
  lang: LanguageMode;
  generator: () => string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates high-entropy, domain-authentic gym & fitness center review drafts
 * across 7 Indian languages using combinatorial workout, trainer, A/C, hygiene,
 * cardio/strength, and (when applicable) ladies-only safety structures.
 */
export function buildFitnessGymStyles(params: {
  businessName: string;
  selectedTags: string[];
  customNote?: string;
  tagline?: string | null;
  category?: string;
}): FitnessStyleEntry[] {
  const { businessName, selectedTags, customNote, tagline, category } = params;
  const combinedContext = `${businessName} ${tagline || ""} ${category || ""} ${selectedTags.join(" ")}`.toLowerCase();
  const isLadiesGym = /ladies|women|her heaven|female/.test(combinedContext);
  const isAC = /a\/c|air condition|ac gym/.test(combinedContext);

  const tags =
    selectedTags.length > 0
      ? selectedTags
      : [
          isLadiesGym ? "Exclusive Ladies Gym" : "Modern Equipment",
          "Certified Trainers",
          isAC ? "Fully Air Conditioned" : "Cardio & Strength",
        ];

  const primaryTag = tags[0] || (isLadiesGym ? "Exclusive Ladies Gym" : "Modern Equipment");
  const secondaryTag = tags[1] || "Certified Trainers";
  const note = customNote?.trim();

  return [
    // ── ENGLISH (6 combinatorial generators) ─────────────────────────────────
    {
      structure: "GYM_TRAINER_FOCUS",
      style: "Gym Experience",
      lang: "ENGLISH",
      generator: () => {
        const op = pick([
          `Love working out at ${businessName}!`,
          `Joined ${businessName} for my daily fitness routine.`,
          `Been training regularly at ${businessName} for the past few weeks.`,
          `Really glad I chose ${businessName} for my workouts.`,
        ]);
        const mid = pick([
          `Their ${primaryTag.toLowerCase()} and ${secondaryTag.toLowerCase()} keep every workout productive and motivating.`,
          `Coaches watch posture closely during strength and cardio sessions without rushing anyone.`,
          `${isLadiesGym ? "The safe, comfortable ladies-only gym floor" : "The spacious workout floor"} and modern machines make exercising effortless.`,
          `${isAC ? "Chilled A/C keeps heavy cardio and functional sessions comfortable" : "Clean ventilation keeps the gym energetic"} throughout the workout.`,
        ]);
        const cl = pick([
          `Definitely one of the best gyms around.`,
          `Feeling stronger and much more energetic every week.`,
          `Highly welcoming trainers and spotless maintenance.`,
        ]);
        return `${op} ${mid}${note ? ` Especially liked ${note}.` : ""} ${cl}`;
      },
    },
    {
      structure: "GYM_EQUIPMENT_AC",
      style: "Equipment & Comfort",
      lang: "ENGLISH",
      generator: () => {
        const op = pick([
          `Clean machines and zero clutter on the floor at ${businessName}.`,
          `Impressive treadmill, cycle, and dumbbell setup at ${businessName}.`,
          `The gym equipment hygiene and cooling comfort at ${businessName} stand out immediately.`,
        ]);
        const mid = pick([
          `Even during busy hours there is plenty of space to finish cardio and strength sets comfortably.`,
          `Trainers customize weight-loss and toning plans smoothly around beginner stamina.`,
          `${isAC ? "Full air conditioning makes afternoon and evening workouts super pleasant." : "Everything is kept sanitized and ready to use."}`,
        ]);
        return `${op} ${mid}${note ? ` Highlighted experience: ${note}.` : ""}`;
      },
    },
    {
      structure: "GYM_SAFETY_VIBE",
      style: "Comfort & Guidance",
      lang: "ENGLISH",
      generator: () => {
        const op = pick([
          `${isLadiesGym ? "Finding a trustworthy, comfortable ladies-only A/C gym" : "Finding a well-guided A/C gym"} like ${businessName} is a big relief.`,
          `Supportive atmosphere from day one at ${businessName}.`,
          `Great personal training focus at ${businessName}.`,
        ]);
        const mid = pick([
          `Instructors explain warm-ups, reps, and recovery clearly for every fitness level.`,
          `No awkwardness or crowding — just focused workouts and encouraging guidance.`,
          `Balanced focus on stamina building, Zumba flexibility, and steady weight management.`,
        ]);
        return `${op} ${mid}${note ? ` Appreciated ${note}.` : ""}`;
      },
    },
    {
      structure: "GYM_RESULTS_SHORT",
      style: "Short & Natural",
      lang: "ENGLISH",
      generator: () =>
        pick([
          `Evening workouts at ${businessName} feel super refreshing — great trainers and clean equipment.`,
          `Consistent fitness guidance and ${primaryTag.toLowerCase()} keep me coming back to ${businessName}.`,
          `Cleanest gym floor in town with ${secondaryTag.toLowerCase()} and proper A/C comfort.`,
        ]),
    },

    // ── TELUGU SCRIPT (4 combinatorial generators) ───────────────────────────
    {
      structure: "GYM_TELUGU_1",
      style: "తెలుగు రివ్యూ",
      lang: "TELUGU_SCRIPT",
      generator: () => {
        const op = pick([
          `${businessName} లో వర్కౌట్ వాతావరణం చాలా బాగుంది.`,
          `కడపలో ${isLadiesGym ? "మహిళల కోసం" : "ఫిట్‌నెస్ కోసం"} ${businessName} బెస్ట్ ఏసీ జిమ్.`,
          `రెగ్యులర్‌గా ${businessName} లో వ్యాయామం చేయడం చాలా కంఫర్టబుల్ గా ఉంది.`,
        ]);
        const mid = pick([
          `ట్రైనర్లు ప్రతి ఎక్సర్‌సైజ్ పోశ్చర్‌ను జాగ్రత్తగా చూపిస్తూ ప్రోత్సహిస్తారు.`,
          `ఆధునిక కార్డియో, స్ట్రెంగ్త్ మెషీన్లు మరియు చల్లని ఏసీ ఫెసిలిటీ ఉన్నాయి.`,
          `${isLadiesGym ? "లేడీస్ కోసం చాలా సేఫ్, క్లీన్ మరియు ఫ్రెండ్లీ జిమ్." : "వెయిట్ లాస్ మరియు ఫిట్‌నెస్ ప్రోగ్రామ్స్ చాలా బాగా ఉన్నాయి."}`,
        ]);
        return `${op} ${mid}`;
      },
    },
    {
      structure: "GYM_TELUGU_2",
      style: "ఫిట్‌నెస్ అనుభవం",
      lang: "TELUGU_SCRIPT",
      generator: () => {
        const op = pick([
          `వెయిట్ లాస్ మరియు స్టామినా పెంచుకోవడానికి ${businessName} చాలా మంచి చోటు.`,
          `జిమ్ క్లీన్లీనెస్, కొత్త మెషీన్లు మరియు కోచ్‌ల సహకారం ఎంతో నచ్చాయి.`,
          `మొదటి సారి జిమ్ లో జాయిన్ అయినా ఇక్కడ ట్రైనర్లు చాలా సులువుగా నేర్పిస్తారు.`,
        ]);
        const cl = pick([
          `రోజూ వర్కౌట్ చేయాలనిపించే ఎనర్జిటిక్ వాతావరణం ఉంది.`,
          `హైజీన్ మరియు ఏసీ కూలింగ్ చాలా బాగా మెయింటెయిన్ చేస్తున్నారు.`,
          `ఫిట్‌నెస్ జర్నీకి పర్ఫెక్ట్ ప్లేస్!`,
        ]);
        return `${op} ${cl}`;
      },
    },
    {
      structure: "GYM_TELUGU_3",
      style: "సింపుల్ తెలుగు",
      lang: "TELUGU_SCRIPT",
      generator: () =>
        pick([
          `చల్లని ఏసీ, ఆధునిక జిమ్ ఎక్విప్‌మెంట్ మరియు కేరింగ్ ట్రైనర్లు ఉన్న ${businessName} సూపర్!`,
          `రోజువారీ కార్డియో, జుంబా మరియు స్ట్రెంగ్త్ ట్రైనింగ్ కోసం ${businessName} లో మంచి ఫలితాలు వస్తున్నాయి.`,
          `ప్రతి ఒక్కరి మీద వ్యక్తిగత శ్రద్ధ తీసుకుంటూ ${businessName} లో ట్రైనింగ్ ఇస్తున్నారు.`,
        ]),
    },

    // ── TANGLISH (3 combinatorial generators) ────────────────────────────────
    {
      structure: "GYM_TANGLISH_1",
      style: "Tanglish",
      lang: "TELUGU_ROMAN",
      generator: () =>
        pick([
          `${businessName} lo workout vibe chala bagundi! Trainers daily routine ni baga follow cheyistaru.`,
          `Cardio and strength workouts kosam ${businessName} chala clean A/C gym.`,
          `Beginners ki kuda postures correct ga cheppistu step-by-step guide chestaru at ${businessName}.`,
        ]),
    },
    {
      structure: "GYM_TANGLISH_2",
      style: "Tanglish Workout",
      lang: "TELUGU_ROMAN",
      generator: () =>
        pick([
          `Weight loss and stamina kosam ${businessName} in Kadapa chala helpful ga undi.`,
          `${isLadiesGym ? "Ladies ki chala comfortable & safe gym," : "Daily fitness routine kosam best gym,"} A/C cooling and hygiene top class lo unayi.`,
          `Modern gym equipment and supportive coaches make everyday workout easy at ${businessName}.`,
        ]),
    },
    {
      structure: "GYM_TANGLISH_3",
      style: "Tanglish Short",
      lang: "TELUGU_ROMAN",
      generator: () =>
        `${businessName} lo personal training and clean workout floor chala baga nachindi!${
          isLadiesGym ? " Only for ladies kavadam valla stress-free ga workout cheyochu." : ""
        }`,
    },

    // ── HINDI (4 distinct combinatorial generators) ──────────────────────────
    {
      structure: "GYM_HINDI_1",
      style: "हिंदी समीक्षा",
      lang: "HINDI",
      generator: () => {
        const op = pick([
          `${businessName} में वर्कआउट करने का अनुभव बेहद शानदार रहा।`,
          `कडपा में फिटनेस और रोजाना एक्सरसाइज के लिए ${businessName} एक बेहतरीन जगह है।`,
          `आधुनिक फिटनेस मशीनें और शांत माहौल ${businessName} की सबसे बड़ी खासियत हैं।`,
        ]);
        const mid = pick([
          `यहां के ट्रेनर्स हर एक्सरसाइज का सही पोस्चर सिखाते हैं।`,
          `साफ-सुथरा एसी हॉल गर्मी में भी वर्कआउट को आरामदायक बनाता है।`,
          `${isLadiesGym ? "महिलाओं के लिए पूरी तरह सुरक्षित और सहज जिम माहौल है।" : "कार्डियो और स्ट्रेंथ ट्रेनिंग दोनों की बेहतरीन व्यवस्था है।"}`,
        ]);
        return `${op} ${mid}`;
      },
    },
    {
      structure: "GYM_HINDI_2",
      style: "फिटनेस अनुभव",
      lang: "HINDI",
      generator: () => {
        const op = pick([
          `वजन घटाने और स्टेमिना बढ़ाने के लिए ${businessName} में बहुत अच्छी ट्रेनिंग मिलती है।`,
          `पहली बार जिम ज्वाइन करने वालों के लिए भी ${businessName} के कोच काफी सहयोगी हैं।`,
        ]);
        const cl = pick([
          `नियमित वर्कआउट रूटीन से मुझे अपनी ऊर्जा में साफ फर्क महसूस हो रहा है।`,
          `डम्बल से लेकर ट्रेडमिल तक सारे उपकरण साफ और अच्छी स्थिति में रहते हैं।`,
        ]);
        return `${op} ${cl}`;
      },
    },
    {
      structure: "GYM_HINDI_3",
      style: "सरल हिंदी",
      lang: "HINDI",
      generator: () =>
        pick([
          `${businessName} में ट्रेनर्स का मार्गदर्शन, एसी सुविधा और सफाई सब कुछ बहुत बढ़िया है।`,
          `${isLadiesGym ? "लेडीज के लिए कडपा में सबसे आरामदायक और भरोसेमंद फिटनेस सेंटर!" : "रोजाना फिटनेस और कार्डियो के लिए शानदार जिम!"} बहुत अच्छा लगा।`,
          `जुम्बा, कार्डियो और स्ट्रेंथ वर्कआउट के लिए ${businessName} एक बढ़िया विकल्प है।`,
        ]),
    },

    // ── TAMIL (3 distinct generators) ────────────────────────────────────────
    {
      structure: "GYM_TAMIL_1",
      style: "தமிழ் விமர்சனம்",
      lang: "TAMIL",
      generator: () =>
        `${businessName} ஜிம்மில் பயிற்சி சூழல் மற்றும் ஏசி வசதி மிகச் சிறப்பாக உள்ளது. நவீன உடற்பயிற்சி கருவிகள் தினசரி உடற்பயிற்சிக்கு உதவுகின்றன.`,
    },
    {
      structure: "GYM_TAMIL_2",
      style: "உடற்பயிற்சி அனுபவம்",
      lang: "TAMIL",
      generator: () =>
        `கார்டியோ மற்றும் வலிமை பயிற்சிகளுக்கு ${businessName} சிறந்த இடம். பயிற்சியாளர்கள் ஒவ்வொரு பயிற்சியையும் பொறுமையாகக் கற்றுக் கொடுக்கிறார்கள்.`,
    },
    {
      structure: "GYM_TAMIL_3",
      style: "எளிய தமிழ்",
      lang: "TAMIL",
      generator: () =>
        `${isLadiesGym ? "பெண்களுக்கு பாதுகாப்பான மற்றும் சுத்தமான" : "தினசரி உடற்பயிற்சிக்கு ஏற்ற"} ஏசி ஜிம் ${businessName}. தூய்மையும் வழிகாட்டுதலும் மிகவும் அருமை.`,
    },

    // ── KANNADA (3 distinct generators) ──────────────────────────────────────
    {
      structure: "GYM_KANNADA_1",
      style: "ಕನ್ನಡ ವಿಮರ್ಶೆ",
      lang: "KANNADA",
      generator: () =>
        `${businessName} ಜಿಮ್‌ನಲ್ಲಿ ವರ್ಕೌಟ್ ವಾತಾವರಣ ಮತ್ತು ತರಬೇತುದಾರರ ಮಾರ್ಗದರ್ಶನ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ. ಆಧುನಿಕ ಉಪಕರಣಗಳು ಇವೆ.`,
    },
    {
      structure: "GYM_KANNADA_2",
      style: "ಫಿಟ್‌ನೆಸ್ ಅನುಭವ",
      lang: "KANNADA",
      generator: () =>
        `ಕಾರ್ಡಿಯೋ ಮತ್ತು ವೇಟ್ ಟ್ರೈನಿಂಗ್‌ಗೆ ${businessName} ಉತ್ತಮ ಜಿಮ್. ತಂಪಾದ ಎಸಿ ವ್ಯವಸ್ಥೆ ಹಾಗೂ ಶುದ್ಧತೆ ಇಷ್ಟವಾಯಿತು.`,
    },
    {
      structure: "GYM_KANNADA_3",
      style: "ಸರಳ ಕನ್ನಡ",
      lang: "KANNADA",
      generator: () =>
        `ದೈನಂದಿನ ಫಿಟ್‌ನೆಸ್ ಅಭ್ಯಾಸಕ್ಕೆ ${businessName} ಬಹಳ ಸಹಕಾರಿ ಹಾಗೂ ಸುರಕ್ಷಿತ ಜಿಮ್ ಆಗಿದೆ.`,
    },

    // ── MALAYALAM (3 distinct generators) ────────────────────────────────────
    {
      structure: "GYM_MALAYALAM_1",
      style: "മലയാളം അവലോകനം",
      lang: "MALAYALAM",
      generator: () =>
        `${businessName} ജിമ്മിലെ വർക്കൗട്ട് അന്തരീക്ഷം വളരെ മികച്ചതാണ്. ആധുനിക ഉപകരണങ്ങളും വൃത്തിയുള്ള എസി സൗകര്യവും ഉണ്ട്.`,
    },
    {
      structure: "GYM_MALAYALAM_2",
      style: "ഫിറ്റ്നസ് അനുഭവം",
      lang: "MALAYALAM",
      generator: () =>
        `കാർഡിയോ, സ്ട്രെങ്ത് ട്രെയിനിംഗ് എന്നിവയ്ക്ക് ${businessName} മികച്ച തിരഞ്ഞെടുപ്പാണ്. പരിശീലകർ കൃത്യമായി വഴികാട്ടുന്നു.`,
    },
    {
      structure: "GYM_MALAYALAM_3",
      style: "ലളിതമായ മലയാളം",
      lang: "MALAYALAM",
      generator: () =>
        `${businessName} ലെ വൃത്തിയും എസി സൗകര്യവും ദിവസേനയുള്ള ഫിറ്റ്നസ് പരിശീലനത്തിന് ഏറെ അനുയോജ്യമാണ്.`,
    },
  ];
}
