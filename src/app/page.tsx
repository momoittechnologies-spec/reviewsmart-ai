"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Star,
  Shield,
  Smartphone,
  QrCode,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Zap,
  Store,
  Users,
  ChevronRight,
  Play,
  Globe,
  Lock,
  BarChart2,
  Package,
  Truck,
  Flame,
  Award,
  CreditCard,
  Camera,
  Shirt,
  UtensilsCrossed,
  Laptop,
  Check,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Printer,
  FileText,
  Palette,
  Coins,
  Stethoscope,
  Scissors,
  HelpCircle,
  ChevronDown,
  Search,
  CheckCircle,
  Clock,
  ThumbsUp,
  Volume2,
  VolumeX,
  Mic,
  Menu,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import BrandLogo, { BrandIcon } from "@/components/brand/BrandLogo";
import HeroCustomizer from "@/components/landing/HeroCustomizer";
import ReviewGapCalculator from "@/components/landing/ReviewGapCalculator";
import MobileAppDock from "@/components/landing/MobileAppDock";

// ─── 6 INDIAN LANGUAGES DEFINITION ──────────────────────────────────────────
type LanguageKey = "ALL" | "ENGLISH" | "HINDI" | "TELUGU" | "TAMIL" | "KANNADA" | "MALAYALAM";

interface LanguageOption {
  key: LanguageKey;
  label: string;
  native: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { key: "ENGLISH", label: "English", native: "English", flag: "🇬🇧" },
  { key: "HINDI", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { key: "TELUGU", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { key: "TAMIL", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { key: "KANNADA", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { key: "MALAYALAM", label: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
];

// ─── MULTI-INDUSTRY DEMO PRESETS WITH 6 LANGUAGES ───────────────────────────
interface DemoPreset {
  id: string;
  name: string;
  category: string;
  location: string;
  icon: any;
  color: string;
  slug: string;
  chips: string[];
  reviews: Record<LanguageKey, string>;
  author: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "tech",
    name: "MOMO IT Technologies",
    category: "Software, Cloud & AI Solutions",
    location: "Krishnapuram, Kadapa, AP",
    icon: Laptop,
    color: "#4f46e5",
    slug: "momo-it-technologies",
    chips: [
      "Web & SaaS Products",
      "Mobile App Development",
      "QA & Automation Testing",
      "Business ERP Systems",
      "Custom AI Solutions",
      "UI/UX Design",
    ],
    reviews: {
      ALL: "Outstanding software engineering and AI solutions by MOMO IT Technologies! They built our custom web platform and mobile app with rock-solid quality, seamless UI, and timely delivery. Highly recommended!",
      ENGLISH: "Outstanding software engineering and AI solutions by MOMO IT Technologies! They built our custom web platform and mobile app with rock-solid quality, seamless UI, and timely delivery. Highly recommended!",
      HINDI: "मोमो आईटी टेक्नोलॉजीज की कस्टम वेब, मोबाइल ऐप और QA ऑटोमेशन सेवाएं वास्तव में बेहतरीन हैं! समय पर हाई-क्वालिटी सॉफ्टवेयर डिलीवरी और शानदार टेक्निकल सपोर्ट।",
      TELUGU: "మోమో ఐటీ టెక్నాలజీస్ అందించిన సాఫ్ట్‌వేర్, వెబ్ & మొబైల్ యాప్ డెవలప్‌మెంట్ మరియు క్యూఏ ఆటోమేషన్ సేవలు అత్యుత్తమం! ఆధునిక టెక్నాలజీతో సూపర్ క్వాలిటీ ప్రాజెక్ట్ అందించారు. హైలీ రికమెండెడ్!",
      TAMIL: "மோமோ ஐடி டெக்னாலஜிஸின் மென்பொருள், செயலி வடிவமைப்பு மற்றும் ஏஐ தொழில்நுட்ப சேவைகள் மிகச் சிறப்பானது! தரமான மற்றும் விரைவான சேவை.",
      KANNADA: "ಮೊಮೊ ಐಟಿ ಟೆಕ್ನಾಲಜೀಸ್ ಅತ್ಯುತ್ತಮ ಸಾಫ್ಟ್‌ವೇರ್, ವೆಬ್ ಮತ್ತು ಮೊಬೈಲ್ ಆಪ್‌ಗಳನ್ನು ಅಭಿವೃದ್ಧಿಪಡಿಸಿದೆ! ಅತ್ಯುತ್ತಮ ಗುಣಮಟ್ಟ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಸೇವೆ.",
      MALAYALAM: "മോമോ ഐടി ടെക്നോളജീസിന്റെ സോഫ്റ്റ്‌വെയർ, മൊബൈൽ ആപ്പ് ഡെവലപ്‌മെന്റും കസ്റ്റമർ സപ്പോർട്ടും അതിശയകരമാണ്! മികച്ച നിലവാരമുള്ള സേവനങ്ങൾ.",
    },
    author: "Rajesh K.",
  },
  {
    id: "travel",
    name: "MANA TOURS & TRAVELS",
    category: "Tours, Travels & Taxi Service",
    location: "Kadapa, Andhra Pradesh",
    icon: Truck,
    color: "#0284c7",
    slug: "mana-tours-travels",
    chips: ["Safe Drivers", "Clean AC Cabs", "On-Time Pickup", "Affordable Rates", "24/7 Service"],
    reviews: {
      ALL: "Booked an outstation trip with MANA Tours & Travels in Kadapa! Brand new clean AC cab, extremely professional driver, and completely transparent billing. Best travel agency in town!",
      ENGLISH: "Booked an outstation trip with MANA Tours & Travels in Kadapa! Brand new clean AC cab, extremely professional driver, and completely transparent billing. Best travel agency in town!",
      HINDI: "माना टूर्स एंड ट्रैवल्स के साथ बहुत ही सुरक्षित और आरामदायक सफर रहा! साफ-सुथरी गाड़ी, समय के पाबंद ड्राइवर और बहुत ही किफायती किराया। कड़पा में बेस्ट सर्विस!",
      TELUGU: "మానా టూర్స్ & ట్రావెల్స్ లో ప్రయాణం చాలా సేఫ్ మరియు కంఫర్టబుల్ గా జరిగింది! డ్రైవర్ సమయపాలన పాటించారు, క్లీన్ వెహికల్ మరియు సరసమైన ఛార్జీలు. సూపర్ ట్రావెల్స్!",
      TAMIL: "மானா டூர்ஸ் & டிராவல்ஸ் மூலம் அருமையான பயணம்! சுத்தமான வாகனம், சரியான நேரத்திற்கு வந்தார்கள், நியாயமான கட்டணம். மிகச் சிறந்த சேவை!",
      KANNADA: "ಮಾನಾ ಟೂರ್ಸ್ & ಟ್ರಾವೆಲ್ಸ್‌ನೊಂದಿಗೆ ಅತ್ಯುತ್ತಮ ಪ್ರಯಾಣದ ಅನುಭವ! ಸ್ವಚ್ಛವಾದ ವಾಹನ ಮತ್ತು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಬಂದ ಚಾಲಕರು. ಸಮಂಜಸವಾದ ದರಗಳು!",
      MALAYALAM: "മാന ടൂർസ് & ട്രാവൽസ് വഴി മികച്ച യാത്രാനുഭവം! വൃത്തിയുള്ള വാഹനം, കൃത്യസമയത്ത് ഡ്രൈവർ എത്തി, ന്യായമായ നിരക്ക്. തികച്ചും ശുപാർശ ചെയ്യുന്നു!",
    },
    author: "Venkat S.",
  },
  {
    id: "gold",
    name: "VR GOLD - Kadapa",
    category: "Gold & Jewellery Evaluation",
    location: "Kadapa, Andhra Pradesh",
    icon: Coins,
    color: "#d97706",
    slug: "vrgold",
    chips: ["Sell Gold for Cash", "Computerized Purity Test", "Live Market Bullion Rate", "Zero Deduction", "Instant 2-Min Transfer"],
    reviews: {
      ALL: "Evaluated and sold old gold at VR GOLD! German computerized purity testing with live bullion rates and instant bank transfer in 2 minutes. Completely transparent and trustworthy!",
      ENGLISH: "Evaluated and sold old gold at VR GOLD! German computerized purity testing with live bullion rates and instant bank transfer in 2 minutes. Completely transparent and trustworthy!",
      HINDI: "कंप्यूटराइज्ड जर्मन मशीन पर पारदर्शी गोल्ड टेस्टिंग और लाइव मार्केट रेट! सिर्फ 2 मिनट में बिना किसी कटौती के तुरंत पेमेंट। पूरी तरह से भरोसेमंद!",
      TELUGU: "జర్మన్ కంప్యూటరైజ్డ్ మిషన్ ద్వారా పారదర్శకమైన గోల్డ్ టెస్టింగ్ మరియు లైవ్ మార్కెట్ రేట్! ఎలాంటి కోతలు లేకుండా కేవలం 2 నిమిషాల్లో ఇన్స్టంట్ పేమెంట్!",
      TAMIL: "ஜெர்மன் மெஷின் மூலம் துல்லியமான தங்கம் பரிசோதனை மற்றும் நேரடி சந்தை விலை! 2 நிமிடத்தில் உடனடி பணம். நம்பகமான சேவை!",
      KANNADA: "ಜರ್ಮನ್ ಕಂಪ್ಯೂಟರೈಸ್ಡ್ ಯಂತ್ರದ ಮೂಲಕ ನಿಖರವಾದ ಚಿನ್ನದ ಪರೀಕ್ಷೆ ಮತ್ತು ಲೈವ್ ದರ! ಕೇವಲ 2 ನಿಮಿಷದಲ್ಲಿ ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕ ಹಣ ಸಂದಾಯ!",
      MALAYALAM: "കമ്പ്യൂട്ടറൈസ്ഡ് മെഷീൻ വഴി കൃത്യമായ സ്വർണ്ണ പരിശോധനയും തത്സമയ മാർക്കറ്റ് വിലയും! 2 മിനിറ്റിനുള്ളിൽ തുക അക്കൗണ്ടിൽ ലഭിച്ചു. വിശ്വസനീയം!",
    },
    author: "Prasad R.",
  },
  {
    id: "hvac",
    name: "AS Refrigeration",
    category: "AC Repair & HVAC Services",
    location: "Kadapa, Andhra Pradesh",
    icon: ShieldCheck,
    color: "#059669",
    slug: "as-refrigeration",
    chips: ["Quick AC Repair", "Expert Technicians", "Genuine Spare Parts", "Gas Leak Fix", "Reasonable Charges"],
    reviews: {
      ALL: "Prompt and reliable AC servicing by AS Refrigeration! The technician arrived within 30 minutes, identified the gas leak quickly, and fixed the cooling perfectly at very honest charges.",
      ENGLISH: "Prompt and reliable AC servicing by AS Refrigeration! The technician arrived within 30 minutes, identified the gas leak quickly, and fixed the cooling perfectly at very honest charges.",
      HINDI: "ए.एस. रेफ्रिजरेशन की एसी सर्विस सच में बहुत तेज और बेहतरीन है! टेक्नीशियन तुरंत आए, बहुत ईमानदारी से काम किया और कूलिंग की समस्या पूरी तरह ठीक कर दी।",
      TELUGU: "ఏఎస్ రిఫ్రిజిరేషన్ వారు కేవలం 30 నిమిషాల్లో వచ్చి ఏసీ కూలింగ్ సమస్యను పూర్తిగా పరిష్కరించారు! అనుభవజ్ఞులైన టెక్నీషియన్స్ మరియు సరసమైన ఛార్జీలు.",
      TAMIL: "ஏஎஸ் ரெஃப்ரிஜிரேஷன் அவர்களின் ஏசி பழுதுபார்க்கும் சேவை மிக அருமை! உடனே வந்து திறமையாக சரிசெய்தார்கள். நியாயமான கட்டணம்!",
      KANNADA: "ಎಎಸ್ ರೆಫ್ರಿಜರೇಷನ್ ಅವರ ಎಸಿ ಸರ್ವಿಸ್ ತುಂಬಾ ತೃಪ್ತಿಕರವಾಗಿದೆ! ತಕ್ಷಣವೇ ಬಂದು ಸಮಸ್ಯೆಯನ್ನು ಸರಿಪಡಿಸಿದರು. ಅತ್ಯುತ್ತಮ ಸೇವೆ!",
      MALAYALAM: "എ.എസ് റെഫ്രിജറേഷന്റെ എസി സർവീസ് വളരെ മികച്ചതാണ്! കൃത്യസമയത്ത് എത്തി തകരാറുകൾ പരിഹരിച്ചു. ന്യായമായ നിരക്കുകൾ!",
    },
    author: "Syed M.",
  },
  {
    id: "fashion",
    name: "Sri Guru Fashions",
    category: "Clothing & Menswear",
    location: "Kadapa, Andhra Pradesh",
    icon: Shirt,
    color: "#db2777",
    slug: "sri-guru-fashions-393a",
    chips: ["Exclusive Menswear", "Latest Trends", "Premium Fabric", "Reasonable Prices", "Polite Staff"],
    reviews: {
      ALL: "Sri Guru Fashions has the best menswear collection in Kadapa! Found stylish shirts, trousers, and festive menswear at great prices. The fabric quality is top-notch and staff is very polite. Highly recommended!",
      ENGLISH: "Sri Guru Fashions has the best menswear collection in Kadapa! Found stylish shirts, trousers, and festive menswear at great prices. The fabric quality is top-notch and staff is very polite. Highly recommended!",
      HINDI: "श्री गुरु फैशन्स में पुरुषों के कपड़ों का बहुत ही शानदार और लेटेस्ट कलेक्शन है! कपड़े की क्वालिटी बहुत बढ़िया है और दाम भी एकदम सही हैं। स्टाफ का व्यवहार बहुत विनम्र है। बहुत अच्छा अनुभव!",
      TELUGU: "శ్రీ గురు ఫ్యాషన్స్‌లో బట్టల క్వాలిటీ అద్భుతంగా ఉంది! లేటెస్ట్ ట్రెండ్స్, బెస్ట్ రేట్స్ మరియు స్టాఫ్ చాలా మర్యాదగా మాట్లాడారు. కడపలో షాపింగ్ చేయడానికి బెస్ట్ మెన్స్‌వేర్ షాప్!",
      TAMIL: "ஸ்ரீ குரு ஃபேஷன்ஸில் ஆடைகளின் தரம் மிக அருமையாக உள்ளது! சிறந்த கலெக்ஷன் மற்றும் நியாயமான விலை. ஊழியர்களின் உபசரிப்பு மிக நன்று! அனைவரும் கண்டிப்பாக சென்று பாருங்கள்.",
      KANNADA: "ಶ್ರೀ ಗುರು ಫ್ಯಾಷನ್ಸ್‌ನಲ್ಲಿ ಬಟ್ಟೆಗಳ ಕ್ವಾಲಿಟಿ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ! ಲೇಟೆಸ್ಟ್ ಡಿಸೈನ್ಸ್ ಮತ್ತು ಸಮಂಜಸವಾದ ಬೆಲೆಗಳು. ಸಿಬ್ಬಂದಿಯ ನಡವಳಿಕೆ ತುಂಬಾ ವಿನಮ್ರವಾಗಿದೆ. ಶಾಪಿಂಗ್‌ಗೆ ಉತ್ತಮ ತಾಣ!",
      MALAYALAM: "ശ്രീ ഗുരു ഫാഷൻസിൽ മികച്ച തുണിത്തരങ്ങളും ട്രെൻഡി കളക്ഷനുകളും ലഭ്യമാണ്! ന്യായമായ വിലയും ജീവനക്കാരുടെ മികച്ച പെരുമാറ്റവും. ഷോപ്പിംഗിനായി തീർച്ചയായും ശുപാർಶ ചെയ്യുന്നു!",
    },
    author: "Karthik R.",
  },
  {
    id: "print",
    name: "City Grafix",
    category: "Digital Printing & Signage",
    location: "Kadapa, Andhra Pradesh",
    icon: Printer,
    color: "#8b5cf6",
    slug: "citygrafix",
    chips: ["High Quality Printing", "Fast Delivery", "Creative Graphic Design", "Reasonable Cost", "Polite Staff"],
    reviews: {
      ALL: "City Grafix delivered our store vinyl banners and visiting cards in record time with stunning print resolution and color vibrancy. The design team was patient and very creative!",
      ENGLISH: "City Grafix delivered our store vinyl banners and visiting cards in record time with stunning print resolution and color vibrancy. The design team was patient and very creative!",
      HINDI: "सिटी ग्राफिक्स से हमने बैनर्स और कार्ड्स प्रिंट करवाए। बहुत ही शानदार प्रिंट क्वालिटी, तुरंत डिलीवरी और बहुत ही वाजिब दाम। डिजाइनिंग टीम भी बहुत हुनरमंद है।",
      TELUGU: "సిటీ గ్రాఫిక్స్ లో ప్రింటింగ్ క్వాలిటీ మరియు కలర్స్ ఎంతో అద్భుతంగా వచ్చాయి! చాలా తక్కువ సమయంలో మా బ్యానర్స్ రెడీ చేసి ఇచ్చారు. కడపలో బెస్ట్ ప్రింటింగ్ షాప్!",
      TAMIL: "சிட்டி கிராபிக்ஸ் அவர்களின் பிரிண்டிங் தரம் மிகவும் உயர்தரமாக உள்ளது! குறித்த நேரத்தில் செய்து தந்தார்கள். சிறந்த சேவை!",
      KANNADA: "ಸಿಟಿ ಗ್ರಾಫಿಕ್ಸ್‌ನಲ್ಲಿ ಮುದ್ರಣ ಗುಣಮಟ್ಟ ಮತ್ತು ವಿನ್ಯಾಸ ಅದ್ಭುತವಾಗಿದೆ! ಕಡಿಮೆ ಸಮಯದಲ್ಲಿ ಕೆಲಸ ಮುಗಿಸಿಕೊಟ್ಟಿದ್ದಾರೆ. ಧನ್ಯವಾದಗಳು!",
      MALAYALAM: "സിറ്റി ഗ്രാഫിക്സിന്റെ പ്രിന്റിംഗ് ക്വാളിറ്റിയും ഡിസൈനിംഗും വളരെ മികച്ചതാണ്! സമയബന്ധിതമായ ഡെലിവറിയും ന്യായമായ നിരക്കും!",
    },
    author: "Obul Reddy C.",
  },
];

// ─── 3D HARDWARE THEMES ──────────────────────────────────────────────────────
const DISPLAY_THEMES = {
  "royal-gold": {
    name: "Royal Gold",
    badge: "bg-amber-400 text-slate-950 font-black",
    border: "border-amber-400/80 shadow-amber-400/20",
    cardBg: "from-slate-950 via-slate-900 to-black",
    dot: "#f59e0b",
  },
  "emerald-luxe": {
    name: "Emerald Luxe",
    badge: "bg-emerald-400 text-slate-950 font-black",
    border: "border-emerald-500/80 shadow-emerald-500/20",
    cardBg: "from-emerald-950 via-slate-950 to-black",
    dot: "#10b981",
  },
  "midnight-sapphire": {
    name: "Midnight Sapphire",
    badge: "bg-cyan-400 text-slate-950 font-black",
    border: "border-cyan-400/80 shadow-cyan-400/20",
    cardBg: "from-blue-950 via-slate-950 to-black",
    dot: "#06b6d4",
  },
  "rose-platinum": {
    name: "Rose Platinum",
    badge: "bg-rose-400 text-slate-950 font-black",
    border: "border-rose-400/80 shadow-rose-400/20",
    cardBg: "from-rose-950 via-slate-950 to-black",
    dot: "#f43f5e",
  },
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(1);
  const [selectedLang, setSelectedLang] = useState<LanguageKey>("ENGLISH");
  const [demoStars, setDemoStars] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [dailyCustomers, setDailyCustomers] = useState(50);
  const [mockupFormat, setMockupFormat] = useState<"stand" | "pvc-vertical" | "poster-a4">("stand");
  const [mockupTheme, setMockupTheme] = useState<keyof typeof DISPLAY_THEMES>("royal-gold");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [referralPartner, setReferralPartner] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingLang, setSpeakingLang] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingLang(null);
    }
  }, [selectedLang, selectedDemoIndex]);

  const handleToggleSpeakReview = (text: string, lang: LanguageKey) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Voice playback is not supported on your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingLang(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const langTagMap: Record<LanguageKey, string> = {
      ALL: "en-IN",
      ENGLISH: "en-IN",
      HINDI: "hi-IN",
      TELUGU: "te-IN",
      TAMIL: "ta-IN",
      KANNADA: "kn-IN",
      MALAYALAM: "ml-IN",
    };

    utterance.lang = langTagMap[lang] || "en-IN";
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.startsWith(utterance.lang) || v.lang.includes("IN")
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingLang(lang);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingLang(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingLang(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref") || params.get("agent") || localStorage.getItem("reviewsmart_ref");
      if (ref) {
        const clean = ref.trim().toUpperCase();
        setReferralPartner(clean);
        localStorage.setItem("reviewsmart_ref", clean);
        document.cookie = `reviewsmart_ref=${encodeURIComponent(clean)}; path=/; max-age=2592000; SameSite=Lax`;
      }
    }
  }, []);

  const activeDemo = DEMO_PRESETS[selectedDemoIndex];
  const activeReviewText = activeDemo.reviews[selectedLang] || activeDemo.reviews.ENGLISH;

  const whatsappInquiryUrl =
    "https://wa.me/918639831132?text=" +
    encodeURIComponent("Hi ReviewSmart AI, I saw your ad and want to get the ₹2,999 Lifetime Pass for my business across India.");

  const whatsappDirectBuyUrl =
    "https://wa.me/918639831132?text=" +
    encodeURIComponent("Hi ReviewSmart AI! I want to activate the ₹2,999 One-Time Lifetime Pass for my business. Please send me the instant activation link.");

  const whatsappGmbSetupUrl =
    "https://wa.me/918639831132?text=" +
    encodeURIComponent("Hi ReviewSmart AI team! I don't have a Google Business Profile yet. Please help me create, verify and set up my shop on Google Maps for free with the ₹2,999 Lifetime Pass.");

    const handleCopyReview = (text: string, slug?: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedDraft(true);
      try {
        confetti({ particleCount: 60, spread: 65, origin: { y: 0.7 } });
      } catch {}
      setTimeout(() => setCopiedDraft(false), 2400);

      // If user clicked Copy & Post, open the verified Google review destination
      if (slug === "momo-it-technologies") {
        setTimeout(() => {
          window.open(
            "https://share.google/K9uqux6IBsMG2AeeZ",
            "_blank",
            "noopener,noreferrer"
          );
        }, 550);
      } else if (slug === "mana-tours-travels") {
        setTimeout(() => {
          window.open(
            "https://search.google.com/local/writereview?placeid=ChIJz-6hOcbQVaYRELARxZjPbrE",
            "_blank",
            "noopener,noreferrer"
          );
        }, 550);
      } else if (slug === "vrgold") {
        setTimeout(() => {
          window.open(
            "https://search.google.com/local/writereview?placeid=ChIJHUVe5u5zszsR-sspZhPvhms",
            "_blank",
            "noopener,noreferrer"
          );
        }, 550);
      } else if (slug === "as-refrigeration") {
        setTimeout(() => {
          window.open(
            "https://search.google.com/local/writereview?placeid=ChIJuX7dAX5zszsROYSpGZLNNfw",
            "_blank",
            "noopener,noreferrer"
          );
        }, 550);
      } else if (slug === "sri-guru-fashions-393a") {
        setTimeout(() => {
          window.open(
            "https://search.google.com/local/writereview?placeid=ChIJ-_3HayRzszsRhE95URiMOqc",
            "_blank",
            "noopener,noreferrer"
          );
        }, 550);
      } else if (slug === "citygrafix") {
        setTimeout(() => {
          window.open(
            "https://search.google.com/local/writereview?placeid=ChIJx7MuneJzszsRhKHkYyndOs4",
            "_blank",
            "noopener,noreferrer"
          );
        }, 550);
      } else if (slug) {
        setTimeout(() => {
          window.open("/r/" + slug, "_blank", "noopener,noreferrer");
        }, 550);
      }
    }
  };

  // ROI Calculator formula
  const monthlyWalkins = dailyCustomers * 30;
  const estimatedReviewsWithout = Math.max(1, Math.round(monthlyWalkins * 0.005));
  const estimatedReviewsWith = Math.round(monthlyWalkins * 0.12);
  const shieldedComplaints = Math.max(1, Math.round(monthlyWalkins * 0.018));
  const estimatedRevenueGain = Math.round(estimatedReviewsWith * 520);

  const faqs = [
    {
      q: "Is ₹2,999 really a one-time payment for lifetime? Are there any hidden monthly charges?",
      a: "Yes! 100% Guaranteed. For our online customers, ₹2,999 is a strictly one-time fee. There are ZERO monthly fees, ZERO yearly renewal charges, and NO transaction cuts. All upcoming features, AI improvements, and future updates are included forever at no additional cost.",
    },
    {
      q: "What if I don't have a Google Business Profile (Google Maps listing) yet?",
      a: "No problem at all! As part of your ₹2,999 Lifetime Pass, our dedicated verification team will create, claim, verify, and SEO-optimize your Google Business Profile completely FREE. We set up your categories, address pin, opening hours, photos, and direct review shortlink so you can start getting reviews from day one.",
    },
    {
      q: "How does the AI generate reviews in Hindi, Telugu, Tamil, Kannada, and Malayalam?",
      a: "Our smart multi-lingual engine is powered by Google Gemini AI with fine-tuned conversational prompt engineering for Indian regional dialects. When customers tap 2 or 3 quick tags about your service, the system synthesizes natural, native-phrased 5-star reviews that sound genuine and relatable.",
    },
    {
      q: "Does ReviewSmart AI violate Google review policies?",
      a: "No! ReviewSmart AI is 100% compliant with Google's policies. We do NOT use bots or fake reviews. Real walk-in customers scan the QR code and publish the reviews directly from their own verified personal Google accounts on the official Google Maps app.",
    },
    {
      q: "How does the Negative Feedback Shield protect my business reputation?",
      a: "When a customer rates 4 or 5 stars, they are seamlessly guided to post on Google Maps with an AI draft. If a customer rates 1, 2, or 3 stars, our intelligent shield intercepts the feedback privately to your WhatsApp desk or email. You resolve the issue with the customer immediately, while Google Maps remains 100% shielded from public negative damage.",
    },
    {
      q: "How do I get the physical Acrylic Standee or PVC Cards for my counter?",
      a: "Your merchant dashboard includes our Standee Studio with instant high-resolution 300 DPI vector PDF downloads ready for 4\"×6\" Acrylic Standees, CR80 PVC Cards, and A4 Wall Posters. You can print them locally anywhere, or contact our support team on WhatsApp to order our physical luxury crystal acrylic kits delivered straight to your doorstep.",
    },
    {
      q: "What is the difference between Online and Offline pricing?",
      a: "Online customers purchasing directly via our website / Meta Ads get instant digital access, the complete 6-language AI review platform, free GMB setup, and full Standee Studio PDF exports for ₹2,999 Lifetime. Offline agent customers work with regional sales partners who provide in-person onboarding, store visits, and custom physical hardware packages with flexible local pricing.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfe] text-slate-900 overflow-x-hidden selection:bg-indigo-600 selection:text-white relative">
      {/* ─── 3D AMBIENT LIGHT MESH BACKGROUND ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-indigo-100/70 via-purple-50/50 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -left-32 w-[500px] h-[500px] bg-blue-100/40 blur-[130px] rounded-full" />
        <div className="absolute top-[60%] -right-32 w-[550px] h-[550px] bg-emerald-100/40 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[400px] bg-indigo-50/60 blur-[120px] rounded-full" />
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000000 1px, transparent 1px), linear-gradient(to bottom, #000000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ─── TOP NOTIFICATION BANNER (META ADS EXCLUSIVE) ─────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-xs py-2.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
        <span>
          PAN-INDIA LAUNCH OFFER: ₹2,999 One-Time Lifetime Pass &bull; 100% Free For Lifetime &bull; 🆓 Free Google Business Profile Setup Included!
        </span>
        <a
          href="#pricing"
          className="underline underline-offset-2 ml-1 text-emerald-200 hover:text-white hidden sm:inline"
        >
          Claim ₹2,999 Pass &rarr;
        </a>
      </div>

      {/* ─── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandLogo href="/" size="md" theme="light" />

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a
              href="#demo"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-3 py-1.5 rounded-full transition"
            >
              6-Language Demo
            </a>
            <a
              href="#gmb-setup"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200/80 bg-emerald-50/50 px-3 py-1.5 rounded-full transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Free GMB Setup</span>
            </a>
            <a
              href="#ranking-boost"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-3 py-1.5 rounded-full transition"
            >
              Ranking Booster
            </a>
            <a
              href="#hardware"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-3 py-1.5 rounded-full transition"
            >
              3D Standee Studio
            </a>
            <a
              href="#pricing"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-3 py-1.5 rounded-full transition"
            >
              Lifetime Pricing
            </a>
            <a
              href="#faq"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-3 py-1.5 rounded-full transition"
            >
              FAQ
            </a>
            <Link
              href="/r/mana-tours-travels"
              target="_blank"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full transition hover:bg-indigo-100/80"
            >
              <Play className="w-3 h-3 text-indigo-600" /> Live Customer Card
            </Link>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xs:inline">Login</span>
            </Link>

            <a
              href="#customizer"
              className="px-3.5 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition shadow-lg shadow-emerald-600/25 active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Order Now &bull; ₹2,999</span>
            </a>

            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition active:scale-95"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-2xl px-4 py-4 space-y-1.5 shadow-2xl animate-fadeIn">
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>6-Language Simulator</span>
            </a>
            <a
              href="#gmb-setup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition border border-emerald-100 bg-emerald-50/40"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Free Google Business Profile Setup</span>
            </a>
            <a
              href="#ranking-boost"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Google Maps Ranking Booster</span>
            </a>
            <a
              href="#hardware"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              <Printer className="w-4 h-4 text-amber-600" />
              <span>3D Standee Studio &amp; PDF Exports</span>
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>₹2,999 Lifetime Pricing</span>
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>Frequently Asked Questions</span>
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/r/mana-tours-travels"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition"
              >
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test Live Customer Review Portal</span>
              </Link>
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Instant Demo &amp; Support</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      <HeroCustomizer />

      {/* ─── NEW KILLER FEATURE: 100% FREE GOOGLE BUSINESS PROFILE SETUP ──── */}
      <section id="gmb-setup" className="py-20 px-4 sm:px-6 relative scroll-mt-16 bg-gradient-to-b from-white via-emerald-50/40 to-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>SPECIAL INCLUDED SERVICE &bull; VALUE: ₹2,500 &bull; YOUR COST: ₹0</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Don&apos;t Have a Google Business Profile?
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                We&apos;ll Create, Verify &amp; Optimize It 100% FREE!
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Never listed your shop on Google Maps before? Don&apos;t worry! Our expert team handles the entire Google verification, category setup, and pin placement at zero extra charge with your ₹2,999 Lifetime Pass.
            </p>
          </div>

          {/* 4-Step Illustrated Roadmap Grid (Swipeable on Mobile) */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
            {/* Step 1 */}
            <div className="w-[260px] xs:w-[280px] shrink-0 snap-center sm:w-auto p-6 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 hover:shadow-md transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-200">
                    01
                  </span>
                  <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Send Shop Details on WhatsApp</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Simply share your store name, category, shop address, and 2-3 storefront photos over WhatsApp. That&apos;s all we need from you!
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Takes 2 minutes
              </div>
            </div>

            {/* Step 2 */}
            <div className="w-[260px] xs:w-[280px] shrink-0 snap-center sm:w-auto p-6 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 hover:shadow-md transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-200">
                    02
                  </span>
                  <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Google Verification Handled</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our verification specialists coordinate directly with Google Maps to verify your business location and claim ownership without paperwork hassles.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Official Google verification
              </div>
            </div>

            {/* Step 3 */}
            <div className="w-[260px] xs:w-[280px] shrink-0 snap-center sm:w-auto p-6 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 hover:shadow-md transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-200">
                    03
                  </span>
                  <Search className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Local SEO Category Setup</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We configure high-volume &quot;near me&quot; search categories, opening hours, business tags, and generate your direct 1-tap review shortlink.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Search optimized profile
              </div>
            </div>

            {/* Step 4 */}
            <div className="w-[260px] xs:w-[280px] shrink-0 snap-center sm:w-auto p-6 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm flex flex-col justify-between group hover:border-emerald-500/50 hover:shadow-md transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-200">
                    04
                  </span>
                  <Zap className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Standee Goes Live on Counter</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your review QR stands and PVC passes are connected. From day 1, walk-in customers tap &amp; post genuine 5-star reviews effortlessly!
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ready for 5-star reviews
              </div>
            </div>
          </div>

          {/* Direct CTA for Free GMB Setup */}
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-lg font-black text-slate-900">
                Ready to Put Your Shop on Google Maps for Free?
              </h4>
              <p className="text-xs text-slate-600">
                Claim your ₹2,999 Lifetime Pass now, and our team will start your Google Business Profile setup immediately!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={whatsappGmbSetupUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Request Free GMB Setup on WhatsApp</span>
              </a>
              <Link
                href="/dashboard/billing?plan=ONLINE_LIFETIME"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 shadow-sm transition"
              >
                <span>Get Lifetime Pass (₹2,999)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BEFORE VS AFTER GOOGLE MAPS RANKING BOOSTER ───────────────────── */}
      <section id="ranking-boost" className="py-20 px-4 sm:px-6 relative scroll-mt-16 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Google Maps Local Pack Impact
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              From Invisible to #1 on Google Maps in 30 Days
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              See what happens when your business switches from asking customers manually to automated AI review collection:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Before Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rose-200 space-y-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    ❌ BEFORE REVIEWSMART AI
                  </span>
                  <span className="text-xs text-rose-600 font-bold">Ranking #9 Local Search</span>
                </div>

                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Struggling for Organic Walk-ins
                </h4>

                <div className="space-y-3 text-xs text-slate-600 pt-2">
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Only 10-15 reviews collected after 3 years in business</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Customers say &quot;I will post later&quot; but forget once they leave</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>A single 1-star complaint drops your public rating drastically</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Competitors higher on Google Maps steal nearby customers</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-medium">Monthly Google Maps Views:</span>
                <div className="text-2xl font-black text-slate-400 mt-0.5">~350 Views / Mo</div>
              </div>
            </div>

            {/* After Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white via-emerald-50/30 to-white border-2 border-emerald-500/80 space-y-5 shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                ★ 3.5× REVENUE GROWTH
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    ✅ WITH REVIEWSMART AI
                  </span>
                  <span className="text-xs text-emerald-700 font-bold">🏆 Ranking #1 Local Pack</span>
                </div>

                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Dominate Search &bull; Daily New Walk-ins
                </h4>

                <div className="space-y-3 text-xs text-slate-700 pt-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">100+ new 5-star reviews</strong> added every single month</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Gemini AI drafts reviews in <strong className="text-slate-900">6 native Indian languages</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">100% Negative Shield</strong>: 1-3 star grievances routed to private WhatsApp</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">#1 on Google Maps</strong>: Nearby tourists and locals choose you first</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-medium">Monthly Google Maps Views:</span>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">3,200+ Views / Mo 🚀</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE 6-LANGUAGE INTERACTIVE DEMO ─────────────────────────────── */}
      <section id="demo" className="py-20 px-4 sm:px-6 relative scroll-mt-16 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-indigo-600" /> Pan-India Multi-Language Simulator
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900">
              Try the 6-Language Review Generator
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Select your store industry and any of the 6 Indian languages below to experience how your customers will draft authentic, local-keyword reviews in 10 seconds.
            </p>
          </div>

          {/* 1. Language Tabs Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-6">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Globe className="w-3.5 h-3.5 text-indigo-600" /> Select Language:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.key;
                return (
                  <button
                    key={lang.key}
                    type="button"
                    onClick={() => setSelectedLang(lang.key)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500 scale-105"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                    <span className="text-[10px] opacity-75 hidden sm:inline">({lang.label})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Industry Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {DEMO_PRESETS.map((p, idx) => {
              const IconComp = p.icon;
              const isSelected = selectedDemoIndex === idx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedDemoIndex(idx);
                    setDemoStars(5);
                  }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-md font-extrabold scale-105"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Interactive Split Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 3D Smartphone View (lg:col-span-6) */}
            <div className="lg:col-span-6 flex justify-center" style={{ perspective: "1000px" }}>
              <div
                className="w-full max-w-sm rounded-[2.5rem] bg-slate-900 border-4 border-slate-800 p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_30px_rgba(99,102,241,0.15)] text-center relative overflow-hidden transition-all duration-300 [transform:none] lg:[transform:rotateY(-4deg)]"
              >
                {/* Phone Speaker pill */}
                <div className="w-20 h-3.5 bg-slate-800 rounded-full mx-auto mb-4 border border-slate-700 flex items-center justify-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </div>

                {/* Business Profile */}
                <div className="mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xl mx-auto mb-2 shadow-inner">
                    {activeDemo.name.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-extrabold text-white text-base leading-tight">
                    {activeDemo.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-semibold mt-0.5">
                    <span>★ 4.9</span>
                    <span className="text-slate-400">&bull; {activeDemo.category}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {activeDemo.location}
                  </p>
                </div>

                {/* Star Rating Picker */}
                <div className="mb-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <p className="text-[11px] font-bold text-slate-300 mb-2">
                    How was your experience today?
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setHoveredStar(s)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setDemoStars(s)}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-7 h-7 transition ${
                            s <= (hoveredStar || demoStars)
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                              : "text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1-3 Stars Negative Shield Alert */}
                {demoStars > 0 && demoStars < 4 && (
                  <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-left space-y-1 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Private Feedback Shield Active</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      This customer grievance is redirected directly to your private WhatsApp desk. Google Maps remains 100% clean and protected from public rating drop!
                    </p>
                  </div>
                )}

                {/* 4-5 Stars AI Review Card */}
                {demoStars >= 4 && (
                  <div className="space-y-3 animate-fadeIn text-left">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {activeDemo.chips.map((chip) => (
                        <span
                          key={chip}
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                        >
                          ✓ {chip}
                        </span>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-850 border border-indigo-500/30 space-y-2.5 shadow-lg">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-indigo-300">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>AI Review ({selectedLang})</span>
                        </span>
                        <span className="text-amber-400 text-xs">★★★★★</span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-normal italic bg-black/40 p-3 rounded-xl border border-white/5">
                        &quot;{activeReviewText}&quot;
                      </p>

                      {/* Interactive Voice AI Speaker Demonstration */}
                      <button
                        type="button"
                        onClick={() => handleToggleSpeakReview(activeReviewText, selectedLang)}
                        className={`w-full py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 ${
                          isSpeaking && speakingLang === selectedLang
                            ? "bg-amber-500/20 border-amber-400/50 text-amber-300 ring-2 ring-amber-400/30 animate-pulse shadow-lg shadow-amber-950/40"
                            : "bg-slate-800/80 hover:bg-slate-750 border-indigo-500/30 text-indigo-200 hover:text-white"
                        }`}
                      >
                        {isSpeaking && speakingLang === selectedLang ? (
                          <>
                            <VolumeX className="w-4 h-4 text-amber-400 animate-bounce" />
                            <span>🔊 Playing Natural Voice AI • Tap to Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 text-amber-400" />
                            <span>
                              🎙️ Listen to AI Speak in{" "}
                              {selectedLang === "TELUGU"
                                ? "Telugu (తెలుగు)"
                                : selectedLang === "HINDI"
                                ? "Hindi (हिंदी)"
                                : selectedLang === "TAMIL"
                                ? "Tamil (தமிழ்)"
                                : selectedLang === "KANNADA"
                                ? "Kannada (ಕನ್ನಡ)"
                                : selectedLang === "MALAYALAM"
                                ? "Malayalam (മലയാളം)"
                                : "English"}
                            </span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyReview(activeReviewText, activeDemo.slug)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                        >
                          {copiedDraft ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-300" />
                              <span>
                                {activeDemo.slug === "momo-it-technologies"
                                  ? "Copied! Opening Google Review..."
                                  : "Copied to Clipboard!"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>
                                {activeDemo.slug === "momo-it-technologies"
                                  ? "Copy & Post Review on Google"
                                  : "Copy & Post Review"}
                              </span>
                            </>
                          )}
                        </button>

                        <a
                          href={`/r/${activeDemo.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition flex items-center justify-center gap-1.5 text-xs font-semibold"
                          title="Open full interactive customer review portal"
                        >
                          <span>Live Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Explanation */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" /> High-Converting Pan-India Meta Strategy
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  Why Regional Language Reviews Rank You #1 on Google Maps
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  In India, over 70% of local Google Maps and voice searches happen in native regional languages or Hinglish/Tanglish terms. When customers post reviews in Hindi, Telugu, Tamil, Kannada, or Malayalam:
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Dominates Local Voice Search Keywords</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Google Maps indexes phrases like &quot;బెస్ట్ షాప్&quot; or &quot;शानदार स्वाद&quot; directly to your Google Business Profile, bringing high-intent nearby customers to your door.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Zero Typing Friction for Customers</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Customers are shy or uncomfortable typing long English paragraphs. With 1 tap, our AI generates authentic, warm reviews in their native language effortlessly.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">100% Genuine Human Profiles</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Zero fake bots. Real walk-in customers submit from their own smartphones, passing Google&apos;s spam filters with zero penalty risk.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Get Started for ₹2,999 Lifetime</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3D HARDWARE & STANDEE STUDIO SHOWCASE ─────────────────────────── */}
      <section id="hardware" className="py-20 px-4 sm:px-6 relative scroll-mt-16 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm">
              <Printer className="w-3.5 h-3.5 text-amber-600" /> Physical Counter Display Formats
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Luxury Counter Displays &bull; Print Instantly
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Download high-resolution 300 DPI vector PDFs directly from your dashboard for 4&quot;×6&quot; Acrylic Standees, CR80 PVC Cards, or A4 Posters.
            </p>

            {/* Display Format Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMockupFormat("stand")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  mockupFormat === "stand"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>4&quot;×6&quot; Acrylic Standee</span>
              </button>

              <button
                type="button"
                onClick={() => setMockupFormat("pvc-vertical")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  mockupFormat === "pvc-vertical"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Dual-Sided PVC Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMockupFormat("poster-a4")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  mockupFormat === "poster-a4"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>A4 Wall Poster</span>
              </button>
            </div>

            {/* Theme switcher */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Palette className="w-3 h-3 text-indigo-600" /> Luxury Theme:
              </span>
              {(Object.keys(DISPLAY_THEMES) as Array<keyof typeof DISPLAY_THEMES>).map((tKey) => {
                const item = DISPLAY_THEMES[tKey];
                const isActive = mockupTheme === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setMockupTheme(tKey)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition ${
                      isActive ? "bg-slate-900 text-white font-black shadow-sm" : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 3D Realistic Render Mockup (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-100/80 via-white to-slate-100/60 border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg">
              {(() => {
                const currentTheme = DISPLAY_THEMES[mockupTheme];

                if (mockupFormat === "stand") {
                  return (
                    <div
                      className="relative flex flex-col items-center justify-center p-2 py-6 w-full max-w-sm"
                      style={{ perspective: "1200px" }}
                    >
                      <div
                        className={`relative w-64 sm:w-72 rounded-3xl bg-gradient-to-b ${currentTheme.cardBg} p-5 border-2 ${currentTheme.border} text-center transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] [transform:none] sm:[transform:rotateY(-7deg)_rotateX(4deg)]`}
                        style={{
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-3xl pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 40%, transparent 60%)",
                          }}
                        />

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                            SMARTREVIEW AI
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] ${currentTheme.badge}`}>
                            ★ 5.0 GOOGLE
                          </span>
                        </div>

                        <div className="w-14 h-14 rounded-full bg-white border-2 border-amber-400 p-3 mx-auto mb-2 flex items-center justify-center shadow-lg">
                          <svg className="w-full h-full" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.665-5.2 3.665-9.12z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.43 7.37 24 12 24z" />
                            <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.28 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                          </svg>
                        </div>

                        <h4 className="text-sm font-black text-white truncate px-2">{activeDemo.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate mb-3">{activeDemo.category}</p>

                        <div className="w-36 h-36 bg-white p-2.5 rounded-2xl mx-auto shadow-2xl flex items-center justify-center relative border border-white/20 mb-3">
                          <QrCode className="w-full h-full text-slate-950" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 border-2 border-white flex items-center justify-center shadow-lg">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-black mb-1">
                          <span>★ ★ ★ ★ ★</span>
                        </div>
                        <p className="text-[11px] font-black text-white tracking-wide">
                          POINT CAMERA TO REVIEW
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          FAST GOOGLE MAPS REDIRECT &bull; ZERO APP INSTALL
                        </p>
                      </div>

                      <div
                        className="w-56 sm:w-64 h-5 rounded-b-2xl bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 backdrop-blur-md border border-slate-300 shadow-md -mt-2.5 [transform:none] sm:[transform:rotateY(-7deg)_rotateX(28deg)]"
                      />
                    </div>
                  );
                }

                if (mockupFormat === "pvc-vertical") {
                  return (
                    <div
                      className="relative flex flex-col items-center justify-center p-2 py-6 w-full max-w-sm"
                      style={{ perspective: "1200px" }}
                    >
                      <div
                        className={`relative w-56 sm:w-60 rounded-2xl bg-gradient-to-b ${currentTheme.cardBg} p-5 border-2 ${currentTheme.border} text-center transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] [transform:none] sm:[transform:rotateY(7deg)_rotateX(4deg)]`}
                        style={{
                          aspectRatio: "54 / 85.6",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                            CR80 PVC
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] ${currentTheme.badge}`}>
                            REVIEW PASS
                          </span>
                        </div>

                        <div className="w-12 h-12 rounded-full bg-white border-2 border-amber-400 p-2.5 mx-auto mb-2 flex items-center justify-center shadow-md">
                          <svg className="w-full h-full" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.665-5.2 3.665-9.12z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.43 7.37 24 12 24z" />
                            <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.28 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                          </svg>
                        </div>

                        <h4 className="text-xs font-black text-white truncate px-1">{activeDemo.name}</h4>
                        <p className="text-[9px] text-slate-400 truncate mb-2.5">Official Customer Review Pass</p>

                        <div className="w-28 h-28 bg-white p-2 rounded-xl mx-auto shadow-xl flex items-center justify-center border border-white/20 mb-2.5">
                          <QrCode className="w-full h-full text-slate-950" />
                        </div>

                        <p className="text-[10px] font-black text-white tracking-wider uppercase">
                          POINT CAMERA &amp; REVIEW
                        </p>
                        <p className="text-[8px] text-slate-400 mt-0.5 font-mono">
                          PAN CARD SIZE &bull; 54×85.6 MM
                        </p>
                      </div>
                    </div>
                  );
                }

                // Poster
                return (
                  <div
                    className="relative flex flex-col items-center justify-center p-2 py-6 w-full max-w-sm"
                    style={{ perspective: "1200px" }}
                  >
                    <div
                      className={`relative w-64 sm:w-72 rounded-2xl bg-gradient-to-b ${currentTheme.cardBg} p-5 border-4 border-slate-700/80 text-center transition-all duration-500 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] ring-1 ${currentTheme.border} [transform:none] sm:[transform:rotateY(-4deg)_rotateX(2deg)]`}
                      style={{
                        aspectRatio: "210 / 297",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                        OFFICIAL CUSTOMER NOTICE
                      </span>
                      <h4 className="text-sm font-black text-white leading-tight mb-2">WE VALUE YOUR FEEDBACK</h4>

                      <div className="w-12 h-12 rounded-full bg-white border-2 border-amber-400 p-2.5 mx-auto mb-2 flex items-center justify-center shadow-md">
                        <svg className="w-full h-full" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.665-5.2 3.665-9.12z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.43 7.37 24 12 24z" />
                          <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.28 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                        </svg>
                      </div>

                      <div className="text-xs font-black text-white truncate">{activeDemo.name}</div>
                      <div className="text-amber-400 text-xs my-1">★ ★ ★ ★ ★</div>

                      <div className="w-32 h-32 bg-white p-2.5 rounded-2xl mx-auto shadow-2xl flex items-center justify-center border border-white/20 my-2">
                        <QrCode className="w-full h-full text-slate-950" />
                      </div>

                      <p className="text-[8px] text-slate-400 mt-2 font-mono">
                        A4 PRINTABLE &bull; 210×297 MM &bull; 300 DPI VECTOR PDF
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Specifications & Features */}
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Instant Vector PDF Exports
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  Ready to Print at Any Local Xerox or Photo Studio
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Every ReviewSmart merchant receives lifetime access to our digital Standee Studio. You can generate custom PDF templates with your store brand colors, high-density QR code, and logo anytime with zero reprint costs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>Instant Camera Scan</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Works on iPhone &amp; Android cameras, plus Google Lens and PhonePe/GPay scanner.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-500" />
                    <span>Dynamic QR Guarantee</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Change your Google review link anytime from dashboard without changing physical standee!
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>100% Ad-Free Experience</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Zero popups or third-party ads. A high-speed, luxury experience that elevates your brand.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>Doorstep Acrylic Delivery</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Prefer physical pre-printed acrylic standees? Order directly on WhatsApp anytime!
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Order Physical Standees on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReviewGapCalculator />

      {/* ─── PRICING SECTION (FLAGSHIP ₹2,999 LIFETIME PASS) ──────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 relative scroll-mt-16 bg-gradient-to-b from-white via-indigo-50/30 to-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>SPECIAL ONLINE PROMOTION &bull; PAN-INDIA META ADS EXCLUSIVE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900">
              One Price. Zero Subscriptions.
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                100% Free For Lifetime.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Say goodbye to greedy software subscriptions. Pay once today, and use ReviewSmart AI forever with all upcoming updates and free Google Business Profile setup.
            </p>
          </div>

          {/* Hero Lifetime Pricing Card */}
          <div className="relative rounded-3xl bg-white border-2 border-emerald-500/80 p-6 sm:p-10 shadow-[0_20px_70px_rgba(16,185,129,0.12)] max-w-3xl mx-auto overflow-hidden">
            {/* Top Banner Tag */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-xs font-black uppercase tracking-wider py-1.5 px-6 rounded-bl-2xl shadow-md">
              ★ Lifetime Free Pass
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  All-Inclusive Online License
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                  Online Direct Lifetime Access
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Complete Google Review Engine + 6-Language AI + Standee Studio + Free GMB
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900">₹2,999</span>
                  <span className="text-xs text-slate-400 font-semibold line-through">₹7,999</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 block mt-1">
                  100% One-Time &bull; Lifetime Free
                </span>
              </div>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 mb-8">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Lifetime Free Access</strong> (Zero monthly or annual subscriptions)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">🆓 Free GMB Setup &amp; Verification</strong> (If you don&apos;t have one yet)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">All Future Updates Free</strong> (All AI upgrades included at no extra cost)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">6 Indian Languages</strong> (Hindi, Telugu, Tamil, Kannada, Malayalam, English)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Private WhatsApp Feedback Shield</strong> (100% bad review damage control)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Standee Studio PDF Generator</strong> (300 DPI vector PDFs for 4x6, PVC &amp; A4)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">AI Review Reply Copilot</strong> (Instant polite review replies in 6 languages)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">100% Ad-Free Experience</strong> (Zero third-party ads or spam trackers)</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#customizer"
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>BUY NOW — ₹2,999 (LIFETIME PASS)</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={whatsappDirectBuyUrl}
                target="_blank"
                rel="noreferrer"
                className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 transition active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Activate via WhatsApp</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-4">
              🔒 Instant UPI Payment (GPay, PhonePe, Paytm, BHIM) &bull; Activated in 2 minutes &bull; Instant Invoice
            </p>
          </div>

          {/* Honest Comparison Table */}
          <div className="mt-14 overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 text-center sm:text-left">
                Honest Comparison: ReviewSmart AI vs Monthly Subscription Tools
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full lg:hidden shrink-0">
                Swipe horizontally &rarr;
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/80">
                    <th className="py-3.5 px-4 font-bold">Feature / Cost</th>
                    <th className="py-3.5 px-4 font-black text-emerald-700 bg-emerald-50/60 border-x border-emerald-200">
                      ReviewSmart AI
                    </th>
                    <th className="py-3.5 px-4 font-bold text-slate-500">Typical SaaS Agencies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3.5 px-4 font-medium">Software Cost</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 bg-emerald-50/30 border-x border-emerald-100">
                      ₹2,999 One-Time (Lifetime)
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">₹2,000 - ₹4,500 / Month</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium">1-Year Cost</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 bg-emerald-50/30 border-x border-emerald-100">
                      ₹2,999 Total
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">₹24,000 - ₹54,000+</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium">Free GMB Creation &amp; Verification</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 bg-emerald-50/30 border-x border-emerald-100">
                      Included 100% Free
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">₹2,500 - ₹5,000 Extra Charge</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium">Regional Indian Languages</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 bg-emerald-50/30 border-x border-emerald-100">
                      6 Native Languages
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">English Only</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium">Private Negative Shield</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 bg-emerald-50/30 border-x border-emerald-100">
                      Included 100%
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">Rarely Included</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-medium">Future AI Upgrades</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 bg-emerald-50/30 border-x border-emerald-100">
                      Free for Life
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 font-semibold">Extra Upgrade Fees</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Offline Deals Clarification Note */}
          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <p>
                <strong className="text-slate-900">Note for Offline Agent Deals:</strong> Offline clients working with our certified marketing partners in their cities receive on-site store setup and physical hardware standee packs at localized agent pricing. Online customers receive instant full-platform lifetime software access at ₹2,999!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── REAL VERIFIED MERCHANTS SHOWCASE ─────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 relative bg-slate-50/60 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> Real Verified Stores
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Trusted by Merchants Across South &amp; North India
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center justify-center gap-2">
              <span>Click any store below to experience their live public review portal:</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full sm:hidden">
                Swipe &rarr;
              </span>
            </p>
          </div>

          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
            {DEMO_PRESETS.map((m) => (
              <div
                key={m.id}
                className="w-[270px] xs:w-[290px] shrink-0 snap-center sm:w-auto p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {m.category}
                    </span>
                    <span className="text-amber-500 text-xs font-bold">★ 4.9</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{m.name}</h4>
                  <p className="text-xs text-slate-500 mb-3">{m.location}</p>
                </div>

                <a
                  href={`/r/${m.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
                >
                  <span>Open Live Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE ROI CALCULATOR ───────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 relative border-t border-slate-200/80 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> ROI Revenue Projection
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              See How Fast You Recover ₹2,999
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Drag the slider to match your estimated daily walk-in customers:
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/80 border border-slate-200/90 shadow-sm">
            {/* Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700">Daily Walk-in Footfall:</span>
                <span className="text-base font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-1 rounded-xl">
                  {dailyCustomers} Walk-ins / Day
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={dailyCustomers}
                onChange={(e) => setDailyCustomers(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>10 (Clinic / Boutique)</span>
                <span>50 (Busy Store / Salon)</span>
                <span>250+ (High Footfall Restaurant)</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 mb-1">Without ReviewSmart</div>
                <div className="text-2xl font-black text-slate-400">~{estimatedReviewsWithout} reviews</div>
                <p className="text-[10px] text-slate-400 mt-1">Per month organic</p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/80 via-white to-purple-50/60 border-2 border-indigo-200 shadow-sm">
                <div className="text-xs font-bold text-indigo-700 mb-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> With ReviewSmart AI
                </div>
                <div className="text-3xl font-black text-emerald-600">+{estimatedReviewsWith} Reviews!</div>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">5-Star Google Reviews / Month 🚀</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 mb-1">Shielded Complaints</div>
                <div className="text-2xl font-black text-emerald-600">{shieldedComplaints} Alerts</div>
                <p className="text-[10px] text-slate-400 mt-1">Saved from public Google damage</p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-xs font-bold text-emerald-800 flex items-center justify-center sm:justify-start gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Estimated Monthly Revenue Gain:
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Ranking #1 on Google Maps drives fresh high-value walk-ins each week.
                </p>
              </div>
              <div className="text-2xl font-black text-emerald-700 whitespace-nowrap">
                +₹{estimatedRevenueGain.toLocaleString("en-IN")}/mo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FREQUENTLY ASKED QUESTIONS (FAQ) ─────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 relative border-t border-slate-200/80 bg-slate-50/60 scroll-mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-sm">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Common Questions
            </div>
            <h2 className="text-3xl font-black text-slate-900">
              Everything You Need to Know
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear, transparent answers about our pan-India ₹2,999 Lifetime Pass:
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-indigo-600" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA BANNER (OPTION A: HIGH-CONVERSION RETAIL CLOSER) ───── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-t border-slate-800 text-center text-white">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>🏪 48-Hour Doorstep Delivery Across India</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Want ReviewSmart AI For Your Business?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Get your custom 3D acrylic NFC + QR standee delivered straight to your counter. Turn walk-in customers into authentic 5-star Google reviews. Zero monthly subscriptions &bull; Flat ₹2,999 Lifetime Pass.
          </p>

          {/* Value Highlights Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 font-semibold">
              ⚡ 1-Tap Google Reviews
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 font-semibold">
              🇮🇳 6 Regional Languages
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 font-semibold">
              🛡️ Private Feedback Shield
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold">
              ✨ ₹2,999 Lifetime Pass
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <a
              href="https://wa.me/918639831132?text=Hi%20ReviewSmart%20AI!%20I%20want%20to%20order%20the%20ReviewSmart%20AI%203D%20NFC%20%2B%20QR%20Standee%20for%20my%20business%20(%E2%82%B92%2C999%20Lifetime%20Pass).%20Please%20guide%20me%20with%20the%20next%20steps."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-2xl shadow-emerald-500/30 transition transform active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950" />
              <span>👉 Order Your Standee on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/r/mana-tours-travels"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/20 transition transform active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>▶ Test Live Demo First</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 pt-8 pb-28 sm:pb-8 px-4 sm:px-6 bg-slate-100 text-xs text-slate-600">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
            <BrandLogo href="/" size="sm" theme="light" />

            {/* Official Technology Partner Pill */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Technology Partner:
              </span>
              <a
                href="https://www.momoittechnologies.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 shadow-sm hover:shadow-md transition-all group"
                title="MOMO IT Technologies"
              >
                <img
                  src="https://www.momoittechnologies.com/logo.svg"
                  alt="MOMO IT Technologies Logo"
                  className="w-5 h-5 rounded-md object-contain group-hover:scale-110 transition-transform"
                />
                <span className="font-black text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                  MOMO IT TECHNOLOGIES
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
              </a>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/918639831132"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition flex items-center gap-1 font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
              </a>
              <Link href="/login" className="hover:text-slate-900 transition flex items-center gap-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-indigo-600" /> Merchant Login
              </Link>
            </div>
          </div>

          <div className="text-center text-slate-500 text-[11px]">
            <p>
              &copy; {new Date().getFullYear()} ReviewSmart AI &bull; Pan-India Google Review Engine &bull; All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      <MobileAppDock />
    </div>
  );
}
