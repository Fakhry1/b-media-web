"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Lang, type Translations } from "./i18n";

type AnyTranslations = typeof translations[Lang];

interface LangContextValue {
  lang: Lang;
  t: AnyTranslations;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: "ar",
  t: translations.ar as AnyTranslations,
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("bmedia-lang") as Lang | null;
    if (saved === "ar" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("bmedia-lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  };

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
