import {
  epicMissingActions,
  epicSteps,
  faqs,
  timelinePhases,
  voterJourney,
  type EpicStep,
  type EpicValidation,
  type TimelinePhase,
  type VoterStep,
} from "@/data/electionData";
import type { LanguageCode } from "./languages";

type PhaseCopy = {
  title: string;
  duration: string;
  summary: string;
  details: string[];
  checklist: string[];
  keyDates: { label: string; when: string }[];
  glossary: { term: string; definition: string }[];
};

type JourneyCopy = Pick<VoterStep, "title" | "description" | "action">;
type EpicCopy = Pick<EpicStep, "title" | "body">;
type FaqCopy = { q: string; a: string };

type ContentCopy = {
  phases: Record<string, PhaseCopy>;
  journey: Record<number, JourneyCopy>;
  epicSteps: Record<number, EpicCopy>;
  epicMissingActions: Record<number, EpicCopy>;
  faqs: Record<number, FaqCopy>;
  epicValidation: {
    checklist: string[];
    titles: Partial<Record<EpicValidation["status"], string>>;
    guidance: Partial<Record<EpicValidation["status"], string>>;
  };
  suggestedQuestions: string[];
};

const hi: ContentCopy = {
  phases: {
    announcement: {
      title: "चुनाव की घोषणा",
      duration: "दिन 0",
      summary:
        "भारत निर्वाचन आयोग चुनाव कार्यक्रम घोषित करता है और आदर्श आचार संहिता लागू हो जाती है।",
      details: [
        "मुख्य निर्वाचन आयुक्त प्रेस कॉन्फ्रेंस में कार्यक्रम बताते हैं",
        "कार्यक्रम में सभी चरण, मतदान तिथियां और मतगणना दिवस शामिल होते हैं",
        "आदर्श आचार संहिता दलों और सरकारों पर लागू हो जाती है",
        "ECI की मंजूरी के बिना नई नीतियों या अधिकारियों के तबादलों पर रोक रहती है",
      ],
      checklist: [
        "अपने निर्वाचन क्षेत्र की मतदान तिथि नोट करें",
        "voters.eci.gov.in पर मतदाता सूची में अपना नाम सत्यापित करें",
        "नाम न मिले तो तुरंत Form 6 भरने की तैयारी करें",
        "संपत्ति, देनदारियों और आपराधिक मामलों के खुलासों की जांच करें",
        "चुनावी खर्च के लिए अलग बैंक खाता खोलें",
        "नई योजनाएं रोकें और अनावश्यक तबादले स्थगित करें",
      ],
      keyDates: [
        { label: "कार्यक्रम घोषित", when: "दिन 0" },
        { label: "आचार संहिता लागू", when: "दिन 0 से परिणाम तक" },
      ],
      glossary: [
        {
          term: "MCC",
          definition: "Model Code of Conduct, यानी चुनाव के दौरान दलों, उम्मीदवारों और सरकारों के लिए आचार नियम।",
        },
        {
          term: "ECI",
          definition: "Election Commission of India, यानी भारत में चुनाव कराने वाली संवैधानिक संस्था।",
        },
      ],
    },
    notification: {
      title: "चुनाव अधिसूचना",
      duration: "दिन 1-7",
      summary:
        "हर निर्वाचन क्षेत्र के लिए आधिकारिक अधिसूचना जारी होती है और नामांकन शुरू होते हैं।",
      details: [
        "Returning Officer RP Act, 1951 के तहत औपचारिक अधिसूचना जारी करता है",
        "नामांकन दाखिल करना उसी दिन शुरू हो जाता है",
        "नामांकन की अंतिम तिथि आम तौर पर अधिसूचना से 7 दिन बाद होती है",
        "हर उम्मीदवार को Form 26 affidavit जमा करना होता है",
      ],
      checklist: [
        "अपने क्षेत्र में कौन उम्मीदवार नामांकन कर रहा है, यह देखें",
        "ECI या myneta साइटों पर Form 26 affidavits पढ़ें",
        "Returning Officer के सामने स्वयं नामांकन पत्र दाखिल करें",
        "सुरक्षा जमा राशि जमा करें",
        "Form 26 affidavit पूरी तरह भरें, कोई कॉलम खाली न छोड़ें",
      ],
      keyDates: [
        { label: "अधिसूचना जारी", when: "दिन 1" },
        { label: "नामांकन की अंतिम तिथि", when: "लगभग दिन 7" },
      ],
      glossary: [
        {
          term: "Returning Officer (RO)",
          definition: "निर्वाचन क्षेत्र में चुनाव कराने का जिम्मेदार अधिकारी।",
        },
        {
          term: "Form 26",
          definition: "संपत्ति, देनदारियों, शिक्षा और आपराधिक मामलों का अनिवार्य affidavit।",
        },
        {
          term: "RP Act 1951",
          definition: "Representation of the People Act, भारत में चुनावों को नियंत्रित करने वाला कानून।",
        },
      ],
    },
    scrutiny: {
      title: "जांच और नाम वापसी",
      duration: "दिन 8-10",
      summary:
        "नामांकन पत्रों की जांच होती है और तय समय में उम्मीदवार नाम वापस ले सकते हैं।",
      details: [
        "Returning Officer हर नामांकन पत्र की वैधता जांचता है",
        "अवैध नामांकन कारण दर्ज कर अस्वीकार किए जाते हैं",
        "नाम वापसी आम तौर पर जांच के 2 दिन बाद तक हो सकती है",
        "अंतिम उम्मीदवार सूची प्रतीकों के साथ प्रकाशित होती है",
      ],
      checklist: [
        "उम्मीदवारों और उनके प्रतीकों की अंतिम सूची देखें",
        "जांच के समय स्वयं या अधिकृत एजेंट के माध्यम से उपस्थित रहें",
        "समय सीमा से पहले नाम वापसी पर निर्णय लें",
        "अंतिम सूची के बाद आवंटित प्रतीक की पुष्टि करें",
      ],
      keyDates: [
        { label: "जांच का दिन", when: "नामांकन बंद होने के अगले दिन" },
        { label: "नाम वापसी की अंतिम तिथि", when: "जांच के 2 दिन बाद" },
      ],
      glossary: [
        {
          term: "Scrutiny",
          definition: "Returning Officer द्वारा नामांकन पत्रों की वैधता जांचने की प्रक्रिया।",
        },
        {
          term: "Symbol allotment",
          definition: "उम्मीदवारों को आरक्षित या मुक्त सूची से चुनाव प्रतीक आवंटित करना।",
        },
      ],
    },
    campaign: {
      title: "प्रचार अवधि",
      duration: "14 दिन तक",
      summary:
        "उम्मीदवार और दल खर्च और आचार नियमों के भीतर प्रचार करते हैं।",
      details: [
        "खर्च सीमा Lok Sabha के लिए बड़े राज्यों में 95 लाख और Assembly के लिए 40 लाख रुपये तक हो सकती है",
        "दैनिक खर्च रजिस्टर रखना आवश्यक है",
        "मतदान से 48 घंटे पहले प्रचार बंद हो जाता है",
        "सर्वे, exit poll और loudspeaker उपयोग नियमन के अधीन होते हैं",
      ],
      checklist: [
        "रैलियां सुनें और manifesto पढ़कर सूचित निर्णय लें",
        "MCC उल्लंघन cVIGIL app से रिपोर्ट करें",
        "दिन-वार खर्च रजिस्टर बनाए रखें",
        "रैलियों, वाहनों और posters के लिए पूर्व अनुमति लें",
        "मतदान से 48 घंटे पहले सार्वजनिक प्रचार बंद करें",
      ],
      keyDates: [
        { label: "प्रचार समाप्त", when: "मतदान से 48 घंटे पहले" },
        { label: "Silence period शुरू", when: "Poll-day minus 48h" },
      ],
      glossary: [
        {
          term: "Silence period",
          definition: "मतदान से पहले 48 घंटे की अवधि जब सार्वजनिक प्रचार प्रतिबंधित रहता है।",
        },
        {
          term: "cVIGIL",
          definition: "MCC और खर्च उल्लंघन photo/video proof के साथ रिपोर्ट करने का ECI नागरिक app।",
        },
      ],
    },
    polling: {
      title: "मतदान दिवस",
      duration: "चरणों के अनुसार",
      summary:
        "मतदाता अलग-अलग चरणों में EVM पर अपना वोट डालते हैं।",
      details: [
        "मतदान सामान्यतः सुबह 7 बजे से शाम 6 बजे तक होता है",
        "EVM के साथ VVPAT का उपयोग होता है",
        "बाएं हाथ की तर्जनी पर अमिट स्याही लगती है",
        "हर मशीन में NOTA विकल्प उपलब्ध रहता है",
      ],
      checklist: [
        "अपना EPIC या स्वीकृत वैकल्पिक पहचान पत्र साथ रखें",
        "शाम 6 बजे से पहले बूथ पहुंचें",
        "बटन दबाने के बाद VVPAT पर्ची 7 सेकंड तक सत्यापित करें",
        "मतदान केंद्र के भीतर फोटो न लें",
        "Polling agents की उपस्थिति में सुबह 6 बजे mock poll कराएं",
      ],
      keyDates: [
        { label: "मतदान समय", when: "7 AM-6 PM (सामान्य)" },
        { label: "Mock poll", when: "06:00 (मतदान दिवस)" },
      ],
      glossary: [
        {
          term: "EVM",
          definition: "Electronic Voting Machine, कागजी मतपत्रों की जगह इस्तेमाल होने वाली इलेक्ट्रॉनिक मशीन।",
        },
        {
          term: "VVPAT",
          definition: "Voter Verifiable Paper Audit Trail, वोट की पर्ची 7 सेकंड दिखाने वाली व्यवस्था।",
        },
        {
          term: "NOTA",
          definition: "None Of The Above, सभी उम्मीदवारों को औपचारिक रूप से अस्वीकार करने का विकल्प।",
        },
      ],
    },
    counting: {
      title: "मतगणना और परिणाम",
      duration: "मतगणना दिवस",
      summary:
        "कड़ी निगरानी में वोट गिने जाते हैं और परिणाम घोषित होते हैं।",
      details: [
        "पहले postal ballots, फिर EVM votes round-by-round गिने जाते हैं",
        "हर Assembly segment में 5 random booths की VVPAT slip count अनिवार्य है",
        "Returning Officer विजेता उम्मीदवार को Form 21C/21E जारी करता है",
        "परिणाम के 45 दिनों के भीतर High Court में election petition दायर की जा सकती है",
      ],
      checklist: [
        "ECI Voter Turnout / Results portal पर live counting देखें",
        "हर table के लिए counting agents अधिकृत करें",
        "VVPAT slip verification के समय उपस्थित रहें",
        "Counting के बाद EVM और VVPAT seal कर strong room में रखें",
      ],
      keyDates: [
        { label: "मतगणना शुरू", when: "08:00 on counting day" },
        { label: "Election petition window", when: "परिणाम से 45 दिन के भीतर" },
      ],
      glossary: [
        {
          term: "Form 21C",
          definition: "RO द्वारा निर्वाचित उम्मीदवार घोषित करने का प्रमाणपत्र।",
        },
        {
          term: "Strong room",
          definition: "Poll और counting के बीच EVM रखने का सुरक्षित, sealed room।",
        },
        {
          term: "Election petition",
          definition: "चुनाव परिणाम को High Court में चुनौती देने की कानूनी प्रक्रिया।",
        },
      ],
    },
  },
  journey: {
    1: {
      title: "अपनी पात्रता जांचें",
      description:
        "आप भारतीय नागरिक हों, वर्ष की qualifying date 1 January को 18+ हों और constituency के निवासी हों।",
      action: "उम्र, नागरिकता और पता पुष्टि करें",
    },
    2: {
      title: "मतदाता के रूप में पंजीकरण करें",
      description:
        "Electoral roll में नाम जुड़वाने के लिए Form 6 online भरें। First-time voters और constituency बदलने वालों को इसकी जरूरत होती है।",
      action: "Voter Services Portal पर Form 6 जमा करें",
    },
    3: {
      title: "अपना Voter ID (EPIC) लें",
      description:
        "Booth Level Officer verification के बाद EPIC card मिलता है। आप e-EPIC PDF भी download कर सकते हैं।",
      action: "e-EPIC download करें या physical card लें",
    },
    4: {
      title: "अपना polling booth खोजें",
      description:
        "EPIC number या mobile number से अपना booth और roll पर Part Number खोजें।",
      action: "Know Your Polling Station खोजें",
    },
    5: {
      title: "Polling day पर valid ID ले जाएं",
      description:
        "अपना EPIC या ECI द्वारा स्वीकृत 12 alternative IDs में से कोई एक साथ रखें।",
      action: "EPIC और backup ID साथ रखें",
    },
    6: {
      title: "अपना वोट डालें",
      description:
        "Roll पर नाम सत्यापित करें, ink लगवाएं, register पर sign करें, फिर EVM पर candidate button दबाएं और VVPAT slip देखें।",
      action: "Vote करें और VVPAT slip verify करें",
    },
  },
  epicSteps: {
    1: {
      title: "Voter Services Portal खोलें",
      body: "voters.eci.gov.in पर जाएं या Android/iOS पर Voter Helpline app खोलें।",
    },
    2: {
      title: "Sign in या register करें",
      body: "Mobile number से account बनाएं और OTP से verify करें।",
    },
    3: {
      title: "Electoral roll search करें",
      body: "Search in Electoral Roll में नाम, date of birth और state डालें, या EPIC number से खोजें।",
    },
    4: {
      title: "अपना e-EPIC download करें",
      body: "Record मिलने पर Download e-EPIC चुनें। यह Voter ID का valid digital PDF version है।",
    },
    5: {
      title: "Application status track करें",
      body: "Form 6 भरने पर reference number से Track Application Status में स्थिति देखें।",
    },
  },
  epicMissingActions: {
    1: {
      title: "मेरे पास EPIC कभी नहीं था",
      body: "voters.eci.gov.in पर Form 6 भरें। BLO verification के बाद आपका EPIC जारी होगा।",
    },
    2: {
      title: "मेरा EPIC card खो गया",
      body: "Local Electoral Registration Office में duplicate के लिए apply करें या e-EPIC online download करें।",
    },
    3: {
      title: "मेरे EPIC में details गलत हैं",
      body: "Name, age, photo, address या relation details सुधारने के लिए Form 8 इस्तेमाल करें।",
    },
    4: {
      title: "मैं नए address पर shift हुआ हूं",
      body: "Constituency के भीतर या बाहर shifting के लिए Form 8 भरें।",
    },
    5: {
      title: "Polling day पर EPIC नहीं है",
      body: "यदि आपका नाम electoral roll में है तो Aadhaar, passport, PAN, driving licence जैसे approved alternate IDs से वोट कर सकते हैं।",
    },
  },
  faqs: {
    1: {
      q: "Model Code of Conduct क्या है?",
      a: "Election Commission of India द्वारा जारी दिशा-निर्देश, जो घोषणा से परिणाम तक दलों, उम्मीदवारों और सरकारों के आचरण को नियंत्रित करते हैं।",
    },
    2: {
      q: "NOTA क्या है और क्या मेरा NOTA vote count होता है?",
      a: "NOTA सभी उम्मीदवारों को अस्वीकार करने का विकल्प है। NOTA votes गिने और घोषित होते हैं, लेकिन सबसे ज्यादा NOTA आने पर भी अगला सबसे ज्यादा vote पाने वाला उम्मीदवार जीतता है।",
    },
    3: {
      q: "VVPAT क्या है?",
      a: "VVPAT में vote डालने के बाद candidate name, serial number और symbol वाली पर्ची 7 सेकंड दिखाई देती है और sealed box में गिर जाती है।",
    },
    4: {
      q: "क्या polling day पर home constituency से बाहर होने पर vote कर सकता हूं?",
      a: "आम तौर पर नहीं। आपको उसी constituency में vote करना होता है जहां आप registered हैं। कुछ notified categories postal ballot या home voting चुन सकती हैं।",
    },
    5: {
      q: "Lok Sabha election में कितना समय लगता है?",
      a: "General election आम तौर पर 5 से 7 phases में 6 से 8 weeks तक होता है। आखिरी phase के बाद एक ही दिन counting होती है।",
    },
    6: {
      q: "Polling booth पर कौन से ID documents ले जा सकता हूं?",
      a: "EPIC preferred है। Alternatives में Aadhaar, passport, driving licence, PAN card, service ID, MGNREGA job card, photo passbook, smart card, pension document और अन्य ECI-notified IDs शामिल हैं।",
    },
  },
  epicValidation: {
    checklist: [
      "केवल letters और digits, spaces या symbols नहीं",
      "ठीक 10 characters लंबा",
      "3-letter Functional Series code से शुरू",
      "7-digit serial number पर समाप्त",
    ],
    titles: {
      empty: "Check करने के लिए अपना EPIC number दर्ज करें",
      valid: "EPIC format valid दिख रहा है",
      warning: "Format असामान्य है, legacy series हो सकती है",
      invalid: "यह valid EPIC जैसा नहीं दिखता",
    },
    guidance: {
      empty:
        "आपका EPIC Voter ID card पर छपा होता है, आम तौर पर 10 characters: 3 letters और 7 digits।",
      valid:
        "Format check pass है। Active होने की पुष्टि के लिए इस number को ECI Electoral Roll पर search करें।",
      warning:
        "Modern EPIC प्रायः 3 letters + 7 digits होता है। पुराने cards अलग हो सकते हैं, इसलिए ECI Electoral Roll search पर verify करें।",
      invalid:
        "Card दोबारा जांचें। EPIC alphanumeric होता है, spaces नहीं। Fresh या corrected EPIC के लिए Form 6 या Form 8 इस्तेमाल करें।",
    },
  },
  suggestedQuestions: [
    "Vote register कैसे करूं?",
    "VVPAT क्या है?",
    "Polling booth कहां मिलेगा?",
    "क्या NRIs vote कर सकते हैं?",
    "Model Code of Conduct क्या है?",
    "Vote देने के लिए कौन सा ID ले जाऊं?",
  ],
};

const CONTENT: Partial<Record<LanguageCode, ContentCopy>> = {
  hi,
};

const copyFor = (lang: LanguageCode) => CONTENT[lang];

export function getLocalizedTimelinePhases(lang: LanguageCode): TimelinePhase[] {
  const copy = copyFor(lang);
  if (!copy) return timelinePhases;

  return timelinePhases.map((phase) => {
    const localized = copy.phases[phase.id];
    if (!localized) return phase;

    return {
      ...phase,
      title: localized.title,
      duration: localized.duration,
      summary: localized.summary,
      details: phase.details.map((detail, index) => localized.details[index] ?? detail),
      checklist: phase.checklist.map((item, index) => ({
        ...item,
        item: localized.checklist[index] ?? item.item,
      })),
      keyDates: phase.keyDates.map((date, index) => localized.keyDates[index] ?? date),
      glossary: phase.glossary.map((item, index) => ({
        ...item,
        term: localized.glossary[index]?.term ?? item.term,
        definition: localized.glossary[index]?.definition ?? item.definition,
      })),
    };
  });
}

export function getLocalizedVoterJourney(lang: LanguageCode): VoterStep[] {
  const copy = copyFor(lang);
  if (!copy) return voterJourney;

  return voterJourney.map((step) => ({
    ...step,
    ...(copy.journey[step.id] ?? {}),
  }));
}

export function getLocalizedEpicSteps(lang: LanguageCode): EpicStep[] {
  const copy = copyFor(lang);
  if (!copy) return epicSteps;

  return epicSteps.map((step, index) => ({
    ...step,
    ...(copy.epicSteps[index + 1] ?? {}),
  }));
}

export function getLocalizedEpicMissingActions(lang: LanguageCode): EpicStep[] {
  const copy = copyFor(lang);
  if (!copy) return epicMissingActions;

  return epicMissingActions.map((step, index) => ({
    ...step,
    ...(copy.epicMissingActions[index + 1] ?? {}),
  }));
}

export function getLocalizedFaqs(lang: LanguageCode): FaqCopy[] {
  const copy = copyFor(lang);
  if (!copy) return faqs;

  return faqs.map((faq, index) => copy.faqs[index + 1] ?? faq);
}

export function localizeEpicValidation(result: EpicValidation, lang: LanguageCode): EpicValidation {
  const copy = copyFor(lang);
  if (!copy) return result;

  return {
    ...result,
    title: copy.epicValidation.titles[result.status] ?? result.title,
    guidance: copy.epicValidation.guidance[result.status] ?? result.guidance,
    checklist: result.checklist.map((item, index) => ({
      ...item,
      label: copy.epicValidation.checklist[index] ?? item.label,
    })),
  };
}

export function getLocalizedSuggestedQuestions(lang: LanguageCode): string[] {
  return copyFor(lang)?.suggestedQuestions ?? [
    "How do I register to vote?",
    "What is VVPAT?",
    "Where do I find my polling booth?",
    "Can NRIs vote in Indian elections?",
    "What is the Model Code of Conduct?",
    "What documents can I carry to vote?",
  ];
}
