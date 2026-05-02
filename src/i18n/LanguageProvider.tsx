import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANGUAGES, type Language, type LanguageCode } from "./languages";
import { translate, type TKey } from "./translations";

type Ctx = {
  lang: LanguageCode;
  language: Language;
  setLang: (c: LanguageCode) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  languages: Language[];
};

const LanguageContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "votesetu.lang";

function detectInitial(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
  if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  const nav = window.navigator.language?.split("-")[0]?.toLowerCase();
  const match = LANGUAGES.find((l) => l.code === nav);
  return (match?.code as LanguageCode) ?? "en";
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<LanguageCode>("en");

  useEffect(() => {
    setLangState(detectInitial());
  }, []);

  useEffect(() => {
    const language = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
    document.documentElement.lang = language.code;
    document.documentElement.dir = language.dir ?? "ltr";
  }, [lang]);

  const setLang = (c: LanguageCode) => {
    setLangState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<Ctx>(() => {
    const language = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
    return {
      lang,
      language,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      languages: LANGUAGES,
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useT() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useT must be used inside <LanguageProvider>");
  return ctx;
}
