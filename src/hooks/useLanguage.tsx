import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "al" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  isAl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "al",
  setLang: () => {},
  isAl: true,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("site_lang");
      if (saved === "en" || saved === "al") return saved;
    } catch {}
    return "al";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("site_lang", l);
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, isAl: lang === "al" }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
