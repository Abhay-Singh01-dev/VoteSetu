export type Source = {
  label: string;
  href: string;
  /** Short context shown in the citation tooltip. */
  description?: string;
};

export type GlossaryItem = {
  term: string;
  definition: string;
  sources?: Source[];
};

export type TimelinePhase = {
  id: string;
  title: string;
  duration: string;
  icon: string;
  summary: string;
  details: string[];
  checklist: { for: "voter" | "candidate" | "official"; item: string }[];
  keyDates: { label: string; when: string }[];
  glossary: GlossaryItem[];
};

export const timelinePhases: TimelinePhase[] = [
  {
    id: "announcement",
    title: "Announcement of Elections",
    duration: "Day 0",
    icon: "📢",
    summary:
      "The Election Commission of India (ECI) announces the schedule and the Model Code of Conduct comes into effect.",
    details: [
      "Press conference by the Chief Election Commissioner",
      "Schedule covers all phases, polling dates and counting day",
      "Model Code of Conduct (MCC) becomes binding on parties & governments",
      "No new policy announcements or transfers of officials without ECI approval",
    ],
    checklist: [
      { for: "voter", item: "Note the polling date(s) for your constituency" },
      { for: "voter", item: "Verify your name on the electoral roll at voters.eci.gov.in" },
      { for: "voter", item: "If missing, prepare to file Form 6 immediately" },
      { for: "candidate", item: "Audit assets, liabilities & criminal record disclosures" },
      { for: "candidate", item: "Open a separate bank account for election expenses" },
      { for: "official", item: "Freeze new schemes; halt non-essential transfers" },
    ],
    keyDates: [
      { label: "Schedule announced", when: "Day 0" },
      { label: "MCC in force from", when: "Day 0 — until results" },
    ],
    glossary: [
      {
        term: "MCC",
        definition: "Model Code of Conduct — guidelines for parties, candidates and governments during elections.",
        sources: [
          { label: "ECI · Model Code of Conduct", href: "https://www.eci.gov.in/mcc" },
        ],
      },
      {
        term: "ECI",
        definition: "Election Commission of India — the constitutional body conducting elections.",
        sources: [
          { label: "Constitution of India · Article 324", href: "https://www.eci.gov.in/about" },
        ],
      },
    ],
  },
  {
    id: "notification",
    title: "Election Notification",
    duration: "Day 1 – 7",
    icon: "📜",
    summary:
      "Official gazette notification is issued for each constituency, opening the door for nominations.",
    details: [
      "Returning Officer issues the formal notification under RP Act, 1951",
      "Filing of nominations begins the same day",
      "Last date for nominations is usually 7 days from notification",
      "Each candidate must submit Form 26 affidavit (assets, criminal record)",
    ],
    checklist: [
      { for: "voter", item: "Track which candidates are filing in your constituency" },
      { for: "voter", item: "Read Form 26 affidavits on the ECI / myneta sites" },
      { for: "candidate", item: "File nomination paper in person before the Returning Officer" },
      { for: "candidate", item: "Deposit security amount (₹25,000 LS / ₹10,000 Assembly; halved for SC/ST)" },
      { for: "candidate", item: "Submit Form 26 affidavit, fully filled — no blank fields" },
    ],
    keyDates: [
      { label: "Notification issued", when: "Day 1" },
      { label: "Last date for nominations", when: "~Day 7" },
    ],
    glossary: [
      {
        term: "Returning Officer (RO)",
        definition: "The officer in charge of conducting the election in a constituency.",
        sources: [
          { label: "ECI · Handbook for Returning Officers", href: "https://www.eci.gov.in/handbooks-of-election-officers" },
        ],
      },
      {
        term: "Form 26",
        definition: "Mandatory affidavit on assets, liabilities, education and criminal cases.",
        sources: [
          { label: "ECI · Affidavit (Form 26)", href: "https://www.eci.gov.in/affidavit" },
        ],
      },
      {
        term: "RP Act 1951",
        definition: "Representation of the People Act — the law governing elections in India.",
        sources: [
          { label: "India Code · RP Act 1951", href: "https://www.indiacode.nic.in/handle/123456789/1676" },
        ],
      },
    ],
  },
  {
    id: "scrutiny",
    title: "Scrutiny & Withdrawal",
    duration: "Day 8 – 10",
    icon: "🔍",
    summary: "Nominations are scrutinised; candidates may withdraw within the prescribed window.",
    details: [
      "Returning Officer scrutinises every nomination paper",
      "Invalid nominations are rejected with reasons recorded",
      "Withdrawal of candidature: usually 2 days after scrutiny",
      "Final list of contesting candidates is published with allotted symbols",
    ],
    checklist: [
      { for: "voter", item: "Check the final list of candidates and their symbols" },
      { for: "candidate", item: "Be present (or via authorised agent) at scrutiny" },
      { for: "candidate", item: "Decide on withdrawal before the deadline" },
      { for: "candidate", item: "Confirm allotted symbol after final list is published" },
    ],
    keyDates: [
      { label: "Scrutiny day", when: "Day after nominations close" },
      { label: "Last date to withdraw", when: "2 days after scrutiny" },
    ],
    glossary: [
      {
        term: "Scrutiny",
        definition: "Verification of nomination papers for validity by the Returning Officer.",
        sources: [
          { label: "RP Act 1951 · Section 36", href: "https://www.indiacode.nic.in/handle/123456789/1676" },
        ],
      },
      {
        term: "Symbol allotment",
        definition: "Assignment of an election symbol to each candidate from a free or reserved list.",
        sources: [
          { label: "ECI · Symbols Order 1968", href: "https://www.eci.gov.in/political-parties" },
        ],
      },
    ],
  },
  {
    id: "campaign",
    title: "Campaign Period",
    duration: "Up to 14 days",
    icon: "🎤",
    summary: "Candidates and parties campaign within strict expenditure and conduct rules.",
    details: [
      "Expenditure cap: ₹95 lakh (Lok Sabha, larger states) / ₹40 lakh (Assembly)",
      "Daily expenditure register must be maintained",
      "Campaigning ends 48 hours before polling — the 'silence period'",
      "Surveys, exit polls and loudspeaker use are tightly regulated",
    ],
    checklist: [
      { for: "voter", item: "Attend rallies / read manifestos to make an informed choice" },
      { for: "voter", item: "Report MCC violations via the cVIGIL app" },
      { for: "candidate", item: "Maintain a day-wise expenditure register" },
      { for: "candidate", item: "Get prior permission for rallies, vehicles, posters" },
      { for: "candidate", item: "Stop all public campaigning 48 hours before polling" },
    ],
    keyDates: [
      { label: "Campaigning ends", when: "48 hours before poll" },
      { label: "Silence period begins", when: "Poll-day minus 48h" },
    ],
    glossary: [
      {
        term: "Silence period",
        definition: "The 48-hour quiet window before polling when public campaigning is banned.",
        sources: [
          { label: "RP Act 1951 · Section 126", href: "https://www.indiacode.nic.in/handle/123456789/1676" },
        ],
      },
      {
        term: "cVIGIL",
        definition: "ECI's citizen app to report MCC and expenditure violations with photo / video proof.",
        sources: [
          { label: "ECI · cVIGIL", href: "https://www.eci.gov.in/cvigil" },
        ],
      },
    ],
  },
  {
    id: "polling",
    title: "Polling Day",
    duration: "Phase-wise",
    icon: "🗳️",
    summary: "Voters cast their vote on EVMs across one of several phases.",
    details: [
      "Polling typically 7 AM – 6 PM (varies by constituency)",
      "EVMs with VVPAT (Voter Verifiable Paper Audit Trail) are used",
      "Indelible ink applied on the left index finger",
      "NOTA (None of the Above) option is available on every machine",
    ],
    checklist: [
      { for: "voter", item: "Carry your EPIC or one accepted alternative ID" },
      { for: "voter", item: "Reach the polling booth before 6 PM (you can vote if in queue)" },
      { for: "voter", item: "Verify the VVPAT slip for 7 seconds after pressing the button" },
      { for: "voter", item: "Do not click photos inside the polling booth (illegal)" },
      { for: "official", item: "Conduct mock poll at 6 AM in presence of polling agents" },
    ],
    keyDates: [
      { label: "Polling hours", when: "7 AM – 6 PM (typical)" },
      { label: "Mock poll", when: "06:00 (poll day)" },
    ],
    glossary: [
      {
        term: "EVM",
        definition: "Electronic Voting Machine — replaces paper ballots in Indian elections.",
        sources: [
          { label: "ECI · EVM FAQs", href: "https://www.eci.gov.in/evm" },
        ],
      },
      {
        term: "VVPAT",
        definition: "Voter Verifiable Paper Audit Trail — prints a slip you can verify for 7 seconds.",
        sources: [
          { label: "ECI · VVPAT", href: "https://www.eci.gov.in/evm" },
        ],
      },
      {
        term: "NOTA",
        definition: "None Of The Above — option to formally reject all candidates.",
        sources: [
          { label: "Supreme Court · PUCL v UoI (2013)", href: "https://main.sci.gov.in/judgment/judis/40912.pdf" },
        ],
      },
    ],
  },
  {
    id: "counting",
    title: "Counting & Results",
    duration: "Counting Day",
    icon: "📊",
    summary: "Votes are counted under strict supervision and results declared.",
    details: [
      "Postal ballots counted first, then EVM votes round-by-round",
      "Mandatory VVPAT slip count for 5 random booths per Assembly segment",
      "Returning Officer issues Form 21C / 21E with the winning candidate",
      "Election petitions can be filed in High Court within 45 days",
    ],
    checklist: [
      { for: "voter", item: "Follow live counting on the ECI Voter Turnout / Results portal" },
      { for: "candidate", item: "Authorise counting agents for each table" },
      { for: "candidate", item: "Be present for VVPAT slip verification" },
      { for: "official", item: "Seal EVMs and VVPATs after counting; store in strong room" },
    ],
    keyDates: [
      { label: "Counting begins", when: "08:00 on counting day" },
      { label: "Election petition window", when: "Within 45 days of result" },
    ],
    glossary: [
      {
        term: "Form 21C",
        definition: "Certificate issued by the RO declaring the elected candidate.",
        sources: [
          { label: "Conduct of Elections Rules 1961", href: "https://www.indiacode.nic.in/handle/123456789/15410" },
        ],
      },
      {
        term: "Strong room",
        definition: "Secure, sealed room where EVMs are stored under multi-layer security between poll and counting.",
        sources: [
          { label: "ECI · Strong room SOP", href: "https://www.eci.gov.in/instructions" },
        ],
      },
      {
        term: "Election petition",
        definition: "Legal challenge to an election result, filed in the High Court of the state.",
        sources: [
          { label: "RP Act 1951 · Part VI", href: "https://www.indiacode.nic.in/handle/123456789/1676" },
        ],
      },
    ],
  },
];

export type VoterStep = {
  id: number;
  title: string;
  description: string;
  advanced?: string;
  action: string;
  link?: { label: string; href: string };
};

export const voterJourney: (VoterStep & { advanced?: string })[] = [
  {
    id: 1,
    title: "✅ Eligibility",
    description: "You must be 18+ and an Indian citizen.",
    advanced: "According to the ECI, you must be an Indian citizen, 18+ on the qualifying date (1st January of the year), and a resident of the constituency.",
    action: "Check age",
  },
  {
    id: 2,
    title: "📝 Register",
    description: "Fill online Form 6 to add your name.",
    advanced: "Fill Form 6 online to be added to the electoral roll. First-time voters and people who shifted constituencies need this.",
    action: "Apply now",
    link: { label: "voters.eci.gov.in", href: "https://voters.eci.gov.in" },
  },
  {
    id: 3,
    title: "🪪 Voter ID",
    description: "Get your ID card after your form is approved.",
    advanced: "After verification by the Booth Level Officer, you receive your EPIC card. You can also download the e-EPIC PDF.",
    action: "Get ID",
  },
  {
    id: 4,
    title: "📍 Polling Booth",
    description: "Find out exactly where to go on voting day.",
    advanced: "Search using your EPIC number or mobile number to locate your assigned booth and Part Number on the roll.",
    action: "Find booth",
  },
  {
    id: 5,
    title: "🎒 Carry ID",
    description: "Take your Voter ID or Aadhaar card with you.",
    advanced: "Bring your EPIC or any one of the 12 alternative IDs accepted by ECI (Aadhaar, passport, PAN, driving licence, etc.).",
    action: "Pack ID",
  },
  {
    id: 6,
    title: "🗳️ Vote",
    description: "Press the button, check the slip, cast your vote.",
    advanced: "Verify name on the roll, get finger inked, sign the register, then press the EVM button next to your candidate. Check the VVPAT slip for 7 seconds.",
    action: "Vote",
  },
];

export const faqs = [
  {
    q: "What is the Model Code of Conduct?",
    a: "A set of guidelines issued by the Election Commission of India that governs the conduct of political parties, candidates and governments from the day of election announcement until results are declared. It restricts new policy announcements, transfers, and ensures a level playing field.",
  },
  {
    q: "What is NOTA and does my NOTA vote count?",
    a: "NOTA (None of the Above) lets you reject all candidates. While NOTA votes are counted and announced, even if NOTA gets the most votes, the candidate with the next highest votes still wins. It is a symbolic protest tool.",
  },
  {
    q: "What is VVPAT?",
    a: "VVPAT stands for Voter Verifiable Paper Audit Trail. After you press the button on the EVM, a paper slip showing the candidate's name, serial number and symbol is visible for 7 seconds in a sealed window, then drops into a sealed box. It is used for audits.",
  },
  {
    q: "Can I vote if I'm not in my home constituency on polling day?",
    a: "Generally no — you must vote in the constituency where you are registered. Service voters, NRIs and certain notified categories (senior citizens 85+, PwD, essential service workers) can opt for postal ballots or home voting.",
  },
  {
    q: "How long does the Lok Sabha election take?",
    a: "A general election is typically conducted in 5 to 7 phases over 6 to 8 weeks across the country, depending on security, geography and logistics. Counting happens on a single day after the last phase.",
  },
  {
    q: "What documents can I use as ID at the polling booth?",
    a: "Your EPIC (Voter ID) is preferred. Alternatives include Aadhaar, passport, driving licence, PAN card, service ID, MGNREGA job card, bank/post-office passbook with photo, health insurance smart card, pension document with photo, and a few others notified by the ECI.",
  },
];

// EPIC helper data — each step now carries a verifiable source
export type EpicStep = {
  title: string;
  body: string;
  sources?: Source[];
};

export const epicSteps: EpicStep[] = [
  {
    title: "Visit the Voter Services Portal",
    body: "Go to voters.eci.gov.in or open the Voter Helpline app on Android / iOS.",
    sources: [
      { label: "voters.eci.gov.in", href: "https://voters.eci.gov.in" },
      { label: "Voter Helpline App", href: "https://voters.eci.gov.in/download-app" },
    ],
  },
  {
    title: "Sign in or register",
    body: "Create an account using your mobile number and verify with the OTP.",
    sources: [
      { label: "ECI · Sign-up help", href: "https://voters.eci.gov.in/login" },
    ],
  },
  {
    title: "Search the electoral roll",
    body: "Use 'Search in Electoral Roll' — enter your name, date of birth and state, or simply your EPIC number.",
    sources: [
      { label: "Search in Electoral Roll", href: "https://electoralsearch.eci.gov.in" },
    ],
  },
  {
    title: "Download your e-EPIC",
    body: "Once your record appears, click 'Download e-EPIC'. It's a digital, PDF version of your Voter ID — fully valid as proof.",
    sources: [
      { label: "ECI · e-EPIC FAQs", href: "https://voters.eci.gov.in/download-eepic" },
    ],
  },
  {
    title: "Track your application",
    body: "If you applied with Form 6, use the reference number to track status under 'Track Application Status'.",
    sources: [
      { label: "Track Application Status", href: "https://voters.eci.gov.in/track-status" },
    ],
  },
];

export const epicMissingActions: EpicStep[] = [
  {
    title: "I never had an EPIC",
    body: "File Form 6 on voters.eci.gov.in. After Booth Level Officer verification, your EPIC will be issued — usually within 2–4 weeks.",
    sources: [{ label: "Form 6 · ECI", href: "https://voters.eci.gov.in/form/Form6" }],
  },
  {
    title: "I lost my EPIC card",
    body: "Apply for a duplicate using Form EPIC-002 at your local Electoral Registration Office, or download the e-EPIC online for free.",
    sources: [{ label: "Duplicate EPIC · ECI", href: "https://voters.eci.gov.in/download-eepic" }],
  },
  {
    title: "Details on my EPIC are wrong",
    body: "Use Form 8 to correct name, age, photo, address or relation details on the existing card.",
    sources: [{ label: "Form 8 · ECI", href: "https://voters.eci.gov.in/form/Form8" }],
  },
  {
    title: "I shifted to a new address",
    body: "File Form 8 (shifting within or across constituencies). Your name moves to the new roll and a fresh EPIC is issued.",
    sources: [{ label: "Form 8 · ECI", href: "https://voters.eci.gov.in/form/Form8" }],
  },
  {
    title: "I don't have my EPIC on polling day",
    body: "You can still vote! Carry any one of the 12 ECI-approved alternative IDs (Aadhaar, passport, PAN, driving licence, MGNREGA card, etc.) — provided your name is on the electoral roll.",
    sources: [{ label: "ECI Order · Alt IDs", href: "https://www.eci.gov.in/eci-backend/public/api/download?url=LMAhAK6sOPBp%2FNFF0iRfXbEB1EVSLT41NNLRjYNJJP1KivrUxbfqkDatmHy12e%2FzBiU51zPFZI5qMtjV1qgjFQ%3D%3D" }],
  },
];

// EPIC validation rules.
// Standard format: 3 alphabetic letters + 7 digits (10 chars total). Some older series differ.
export type EpicValidation = {
  status: "valid" | "warning" | "invalid" | "empty";
  title: string;
  checklist: { ok: boolean; label: string; sources?: Source[] }[];
  guidance: string;
  sources?: Source[];
};

// Canonical references for EPIC format & verification rules.
const EPIC_REF_FUNCTIONAL: Source = {
  label: "ECI · Functional EPIC Series",
  href: "https://www.eci.gov.in/files/file/9396-handbook-for-electoral-registration-officers-2023/",
  description:
    "Handbook for Electoral Registration Officers (2023) — Chapter 11 defines the 3-letter Functional Series code prefixed to every EPIC, allotted state- and AC-wise.",
};
const EPIC_REF_FORMAT: Source = {
  label: "ECI · EPIC Format Guidelines",
  href: "https://ecisveep.nic.in/voter/about-epic/",
  description:
    "ECI's SVEEP guide on the EPIC card explains the standard format: a 3-letter alphabetic prefix followed by a 7-digit serial, totalling 10 alphanumeric characters.",
};
const EPIC_REF_SEARCH: Source = {
  label: "Electoral Search · ECI",
  href: "https://electoralsearch.eci.gov.in",
  description:
    "Official ECI tool to look up your EPIC, polling part and serial number on the live electoral roll.",
};
const EPIC_REF_FORM6: Source = {
  label: "Form 6 · ECI",
  href: "https://voters.eci.gov.in/form/Form6",
  description: "Application form to be added to the electoral roll if you don't yet have an EPIC.",
};
const EPIC_REF_FORM8: Source = {
  label: "Form 8 · ECI",
  href: "https://voters.eci.gov.in/form/Form8",
  description:
    "Use Form 8 to correct details (name, photo, address) on an existing EPIC or shift to a new constituency.",
};

export function validateEpic(raw: string): EpicValidation {
  const v = (raw || "").trim().toUpperCase();
  const baseSources: Source[] = [EPIC_REF_FORMAT, EPIC_REF_FUNCTIONAL, EPIC_REF_SEARCH];

  if (!v) {
    return {
      status: "empty",
      title: "Enter your EPIC number to check",
      checklist: [],
      guidance:
        "Your EPIC is printed on your Voter ID card — usually 10 characters: 3 letters followed by 7 digits.",
      sources: baseSources,
    };
  }
  const len10 = v.length === 10;
  const startsLetters = /^[A-Z]{3}/.test(v);
  const endsDigits = /[0-9]{7}$/.test(v);
  const onlyAlnum = /^[A-Z0-9]+$/.test(v);
  const standard = /^[A-Z]{3}[0-9]{7}$/.test(v);

  const checklist = [
    {
      ok: onlyAlnum,
      label: "Only letters and digits (no spaces or symbols)",
      sources: [EPIC_REF_FORMAT],
    },
    {
      ok: len10,
      label: "Exactly 10 characters long",
      sources: [EPIC_REF_FORMAT],
    },
    {
      ok: startsLetters,
      label: "Starts with a 3-letter Functional Series code (e.g. ABC)",
      sources: [EPIC_REF_FUNCTIONAL],
    },
    {
      ok: endsDigits,
      label: "Ends with a 7-digit serial number",
      sources: [EPIC_REF_FORMAT],
    },
  ];

  if (standard) {
    return {
      status: "valid",
      title: "Looks like a valid EPIC format ✓",
      checklist,
      guidance:
        "Format check passed. To confirm it is active, search this number on the ECI Electoral Roll.",
      sources: [EPIC_REF_SEARCH, EPIC_REF_FORMAT],
    };
  }

  // Some legacy / older cards: alphanumeric of 7-20, not strictly 3+7. Mark as warning.
  const lengthOk = v.length >= 7 && v.length <= 20;
  if (onlyAlnum && lengthOk && !standard) {
    return {
      status: "warning",
      title: "Format is unusual — could be a legacy series",
      checklist,
      guidance:
        "Most modern EPICs follow 3 letters + 7 digits. Older / state-specific cards can differ. Verify on the ECI Electoral Roll search to be sure.",
      sources: [EPIC_REF_SEARCH, EPIC_REF_FUNCTIONAL],
    };
  }

  return {
    status: "invalid",
    title: "This doesn't look like a valid EPIC",
    checklist,
    guidance:
      "Re-check your card. EPICs are alphanumeric, no spaces. Need a fresh one? Use Form 6 (new) or Form 8 (correction).",
    sources: [EPIC_REF_FORM6, EPIC_REF_FORM8, EPIC_REF_SEARCH],
  };
}
