// DEPRECATED - use gmbDataFetcher.ts instead. This file is kept for reference only.
// No code imports from this module anymore.

export interface PanIndiaLead {
  id: string;
  name: string;
  locality: string;
  city: string;
  state: string;
  phone: string;
  category: string;
  currentRating: number;
  currentReviews: number;
  competitorName: string;
  competitorRating: number;
  competitorReviews: number;
  reviewDeficit: number;
  isHotLead: boolean;
  targetAudience: string;
  painPoint: string;
  marketingOpportunity: string;
  hardwarePlacement: string;
  demoSlug: string;
  demoUrl: string;
  pitches: Record<string, string>;
}

// ─── 9 PAN-INDIA LANGUAGE PITCH GENERATOR HELPER ─────────────────────────────
export function generatePanIndiaPitches(
  leadName: string,
  category: string,
  currentReviews: number,
  competitorName: string,
  competitorReviews: number,
  demoUrl: string
): Record<string, string> {
  const gap = Math.max(0, competitorReviews - currentReviews);

  return {
    telugu: `నమస్కారం ${leadName} మేనేజ్‌మెంట్ వారికి 🙏\n\nమేము Google Maps లో చూశాము, మీ ${leadName} కి ప్రస్తుతం ${currentReviews} రివ్యూలు మాత్రమే ఉన్నాయి. కానీ మీ సమీపంలోని ${competitorName} కి ఏకంగా ${competitorReviews} రివ్యూలు ఉన్నాయి (దాదాపు ${gap}+ రివ్యూల తేడా!).\n\nదీనివల్ల చాలామంది కొత్త కస్టమర్లు గూగుల్ మ్యాప్స్ సెర్చ్ చేసి మీ కాంపిటీటర్ వద్దకు వెళ్ళిపోతున్నారు.\n\nమేము మీ షాప్ కోసం ఒక స్పెషల్ 3D NFC + QR రివ్యూ స్టాండీ డెమో తయారు చేశాము:\n👉 లైవ్ డెమో చూడండి: ${demoUrl}\n\nకస్టమర్లు మీ కౌంటర్ వద్ద కేవలం తమ ఫోన్‌ను టచ్ చేస్తే చాలు—జెమిని AI 10 సెకన్లలో 5-స్టార్ గూగుల్ రివ్యూ టైప్ చేస్తుంది.\n\n₹2,999 కి లైఫ్‌టైమ్ పాస్ (ఎలాంటి నెలవారీ ఫీజులు లేవు) తో ఈ 3D స్టాండీని మీ కౌంటర్‌కు డెలివరీ చేయమంటారా?`,

    hindi: `नमस्ते ${leadName} जी! 🙏\n\nहमने Google Maps पर देखा कि आपके ${leadName} के केवल ${currentReviews} रिव्यूज हैं, जबकि पास के ${competitorName} के पास ${competitorReviews} से ज्यादा रिव्यूज हैं (पूरे ${gap}+ रिव्यूज का बड़ा अंतर!).\n\nइसकी वजह से बहुत से नए ग्राहक गूगल सर्च करके आपके प्रतिस्पर्धी के पास चले जाते हैं।\n\nहमने विशेष रूप से आपके बिजनेस के लिए एक 3D NFC + QR रिव्यू स्टैंडी का लाइव प्रीव्यू तैयार किया है:\n👉 लाइव डेमो देखें: ${demoUrl}\n\nकाउंटर पर ग्राहक सिर्फ फोन टैप करेंगे और AI केवल 10 सेकंड में 5-स्टार गूगल रिव्यू टाइप कर देगा।\n\nकेवल ₹2,999 लाइफटाइम पास (कोई मासिक शुल्क नहीं) के साथ यह स्टैंडी आपके पते पर भेजें?`,

    english: `Hello Team ${leadName}! 👋\n\nWe noticed on Google Maps that ${leadName} currently has ${currentReviews} reviews, while nearby ${competitorName} has ${competitorReviews}+ reviews—a deficit of over ${gap} reviews.\n\nBecause of this gap, dozens of high-intent local customers searching on Google Maps are walking into your competitor's store every week.\n\nWe created a free working 3D NFC + QR Review Card demo tailored specifically for your store:\n👉 Test Your Live Demo: ${demoUrl}\n\nWhen walk-in customers tap their phone on your counter standee, Gemini AI drafts and posts an authentic 5-star Google review in just 10 seconds.\n\nWould you like us to ship this custom 3D acrylic standee to your counter for ₹2,999 (One-time Lifetime Pass • Zero monthly subscriptions)?`,

    tamil: `வணக்கம் ${leadName} அன்பான நிர்வாகத்திற்கு! 🙏\n\nகூகுள் மேப்ஸில் உங்கள் ${leadName}-க்கு ${currentReviews} மதிப்புரைகள் மட்டுமே உள்ளன, ஆனால் அருகிலுள்ள ${competitorName}-க்கு ${competitorReviews} மதிப்புரைகள் உள்ளன (${gap}+ மதிப்புரைகள் முன்னிலை!).\n\nஇதனால் கூகுளில் தேடும் வாடிக்கையாளர்கள் உங்கள் போட்டியாளரை நோக்கிச் செல்கிறார்கள்.\n\nஉங்கள் கடைக்காகவே நாங்கள் பிரத்யேகமாக உருவாக்கிய 3D NFC + QR ரிவியூ கார்டு நேரடி டெமோ இதோ:\n👉 நேரடி டெமோவை பார்க்க: ${demoUrl}\n\nவாடிக்கையாளர்கள் தங்கள் மொபைலை உங்கள் கவுண்டரில் வைத்தால் போதும்—10 வினாடிகளில் AI 5-நட்சத்திர கூகுள் ரிவியூ பதிவு செய்யும்.\n\n₹2,999 ஒருமுறை கட்டணத்தில் (மாதாந்திர சந்தா இல்லை) இந்த 3D அக்ரிலிக் ஸ்டாண்டியை உங்கள் கடைக்கு அனுப்பவா?`,

    kannada: `ನಮಸ್ಕಾರ ${leadName} ಆಡಳಿತ ಮಂಡಳಿಗೆ! 🙏\n\nಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ನಿಮ್ಮ ${leadName} ಕೇವಲ ${currentReviews} ವಿಮರ್ಶೆಗಳನ್ನು ಹೊಂದಿದೆ, ಆದರೆ ಹತ್ತಿರದ ${competitorName} ${competitorReviews}+ ವಿಮರ್ಶೆಗಳನ್ನು ಹೊಂದಿದೆ (${gap}+ ವಿಮರ್ಶೆಗಳ ಅಂತರ!).\n\nಇದರಿಂದಾಗಿ ಅನೇಕ ಗ್ರಾಹಕರು ಗೂಗಲ್‌ನಲ್ಲಿ ಹುಡುಕಿ ನಿಮ್ಮ ಪ್ರತಿಸ್ಪರ್ಧಿಯ ಬಳಿ ಹೋಗುತ್ತಿದ್ದಾರೆ.\n\nನಿಮ್ಮ ವ್ಯಾಪಾರಕ್ಕಾಗಿ ನಾವು ವಿಶೇಷವಾಗಿ ತಯಾರಿಸಿದ 3D NFC + QR ರಿವ್ಯೂ ಸ್ಟ್ಯಾಂಡಿ ಲೈವ್ ಡೆಮೊ ಇಲ್ಲಿದೆ:\n👉 ಲೈವ್ ಡೆಮೊ ಪರೀಕ್ಷಿಸಿ: ${demoUrl}\n\nಗ್ರಾಹಕರು ತಮ್ಮ ಫೋನ್ ಅನ್ನು ನಿಮ್ಮ ಕೌಂಟರ್‌ನಲ್ಲಿ ಟ್ಯಾಪ್ ಮಾಡಿದರೆ ಸಾಕು—AI 10 ಸೆಕೆಂಡುಗಳಲ್ಲಿ 5-ಸ್ಟಾರ್ ಗೂಗಲ್ ವಿಮರ್ಶೆಯನ್ನು ಬರೆಯುತ್ತದೆ.\n\n₹2,999 ಲೈಫ್‌ಟೈಮ್ ಪಾಸ್ (ಯಾವುದೇ ಮಾಸಿಕ ಶುಲ್ಕವಿಲ್ಲದೆ) ಈ 3D ಸ್ಟ್ಯಾಂಡಿಯನ್ನು ನಿಮ್ಮ ವಿಳಾಸಕ್ಕೆ ತಲುಪಿಸಬೇಕೇ?`,

    malayalam: `നമസ്കാരം ${leadName} മാനേജ്‌മെന്റിന്! 🙏\n\nGoogle Maps-ൽ നിങ്ങളുടെ ${leadName}-ന് ഇപ്പോൾ ${currentReviews} അവലോകനങ്ങൾ മാത്രമാണുള്ളത്, എന്നാൽ സമീപത്തെ ${competitorName}-ന് ${competitorReviews}+ അവലോകനങ്ങളുണ്ട് (${gap}+ അവലോകനങ്ങളുടെ വലിയ വ്യത്യാസം!).\n\nഇതുമൂലം ഗൂഗിളിൽ തിരയുന്ന ഉപഭോക്താക്കൾ എതിരാളിയുടെ അടുത്തേക്ക് പോകുന്നു.\n\nനിങ്ങളുടെ സ്ഥാപനത്തിനായി ഞങ്ങൾ തയാറാക്കിയ 3D NFC + QR ലൈവ് ഡെമോ ഇതാ:\n👉 ലൈവ് ഡെമോ കാണുക: ${demoUrl}\n\nകൗണ്ടറിൽ ഫോൺ ഒന്ന് ടാപ്പ് ചെയ്താൽ മാത്രം മതി—10 സെക്കൻഡിൽ AI 5-സ്റ്റാർ ഗൂഗിൾ റിവ്യൂ നൽകും.\n\n₹2,999 ഒറ്റത്തവണ ലൈഫ് ടൈം പാസ്സിൽ ഈ 3D സ്റ്റാൻഡി ഓർഡർ ചെയ്യാൻ താല്പര്യമുണ്ടോ?`,

    marathi: `नमस्कार ${leadName} व्यवस्थापनास! 🙏\n\nआम्ही Google Maps वर पाहिले की आपल्या ${leadName} ला फक्त ${currentReviews} रिव्ह्यू आहेत, तर प्रतिस्पर्धी ${competitorName} कडे तब्बल ${competitorReviews}+ रिव्ह्यू आहेत (${gap}+ रिव्ह्यूचा मोठा फरक!).\n\nयामुळे Google वर सर्च करणारे अनेक ग्राहक आपल्या प्रतिस्पर्ध्याकडे जात आहेत.\n\nआम्ही आपल्या व्यवसायासाठी एक खास 3D NFC + QR रिव्ह्यू स्टँडीचा लाइव्ह डेमो तयार केला आहे:\n👉 लाइव्ह डेमो पहा: ${demoUrl}\n\nग्राहक काउंटरवर फक्त फोन टॅप करतील आणि AI अवघ्या १० सेकंदात 5-स्टार गुगल रिव्ह्यू टाईप करेल.\n\nफक्त ₹२,९९९ लाइफटाईम पाससह (कोणतेही मासिक शुल्क नाही) ही स्टँडी आपल्या पत्त्यावर पाठवायची का?`,

    gujarati: `નમસ્તે ${leadName} મેનેજમેન્ટ! 🙏\n\nઅમે Google Maps પર જોયું કે તમારા ${leadName} પાસે ફક્ત ${currentReviews} રિવ્યુ છે, જ્યારે નજીકના ${competitorName} પાસે ${competitorReviews}+ રિવ્યુ છે (${gap}+ રિવ્યુનો મોટો તફાવત!).\n\nઆના કારણે ગૂગલ પર સર્ચ કરતા ઘણા ગ્રાહકો તમારા હરીફ પાસે જાય છે.\n\nઅમે તમારા વ્યવસાય માટે એક ખાસ 3D NFC + QR રિવ્યુ સ્ટેન્ડીનું લાઈવ પ્રિવ્યુ બનાવ્યું છે:\n👉 લાઈવ ડેમો જુઓ: ${demoUrl}\n\nગ્રાહકો કાઉન્ટર પર ફક્ત ફોન ટેપ કરશે અને AI માત્ર ૧૦ સેકન્ડમાં 5-સ્ટાર ગૂગલ રિવ્યુ ટાઈપ કરશે.\n\nફક્ત ₹૨,૯૯૯ લાઈફટાઈમ પાસ (કોઈ માસિક ચાર્જ નહીં) સાથે આ સ્ટેન્ડી મોકલીએ?`,

    bengali: `নমস্কার ${leadName} ম্যানেজমেন্ট! 🙏\n\nআমরা Google Maps-এ দেখেছি যে আপনার ${leadName}-এর বর্তমানে মাত্র ${currentReviews}টি রিভিউ রয়েছে, যেখানে নিকটবর্তী ${competitorName}-এর ${competitorReviews}+ রিভিউ রয়েছে (${gap}+ রিভিউ-এর বিশাল ব্যবধান!).\n\nএর ফলে গুগল সার্চ করা বহু সম্ভাব্য গ্রাহক আপনার প্রতিদ্বন্দীর দোকানে চলে যাচ্ছেন।\n\nআমরা আপনার ব্যবসার জন্য একটি বিশেষ 3D NFC + QR রিভিউ স্ট্যান্ডি লাইভ ডেমো তৈরি করেছি:\n👉 লাইভ ডেমো দেখুন: ${demoUrl}\n\nকাউন্টারে গ্রাহক শুধু ফোন স্পর্শ করলেই AI মাত্র ১০ সেকেন্ডে ৫-স্টার গুগল রিভিউ তৈরি করবে।\n\nমাত্র ₹২,৯৯৯ লাইফটাইম পাস (কোনো মাসিক চার্জ নেই) সহ এই স্ট্যান্ডিটি আপনার ঠিকানায় পাঠাব কি?`,
  };
}
