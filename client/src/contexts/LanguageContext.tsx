import { createContext, useContext, useMemo, useState } from "react";

export type Language = "en" | "am";

type Copy = { en: string; am: string };

const content = {
  nav: { home: { en: "Discover", am: "ያግኙ" }, rooms: { en: "Rooms", am: "ክፍሎች" }, reserve: { en: "Reserve", am: "ያስይዙ" }, developer: { en: "Developer", am: "ገንቢ" }, dashboard: { en: "My stay", am: "ቆይታዬ" } },
  home: {
    eyebrow: { en: "A stay, woven with intention", am: "በዓላማ የተሸመነ ቆይታ" },
    title: { en: "A more considered way to stay in Ethiopia.", am: "በኢትዮጵያ የሚደረግ ቆይታ በበለጠ አስተዋይ መንገድ።" },
    body: { en: "Discover places shaped by Ethiopian warmth, contemporary calm, and the small details that make a welcome memorable.", am: "በኢትዮጵያዊ መስተንግዶ፣ በዘመናዊ ጸጥታ እና አቀባበልን የማይረሱ በሚያደርጉ ትናንሽ ዝርዝሮች የተቀረጹ ቦታዎችን ያግኙ።" },
    primary: { en: "Find your stay", am: "ቆይታዎን ያግኙ" },
    secondary: { en: "Explore rooms", am: "ክፍሎችን ይመልከቱ" },
  },
  search: { checkIn: { en: "Check in", am: "መግቢያ" }, checkOut: { en: "Check out", am: "መውጫ" }, guests: { en: "Guests", am: "እንግዶች" }, search: { en: "Check availability", am: "ተገኝነትን ያረጋግጡ" } },
  common: { perNight: { en: "per night", am: "በአዳር" }, from: { en: "From", am: "ከ" }, reserve: { en: "Reserve", am: "ያስይዙ" }, viewRoom: { en: "View room", am: "ክፍሉን ይመልከቱ" }, available: { en: "Available", am: "ዝግጁ" }, signIn: { en: "Sign in", am: "ይግቡ" }, backHome: { en: "Back to discovery", am: "ወደ ማግኘት ይመለሱ" } },
} as const;

type ContentPath = keyof typeof content;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (copy: Copy) => string;
  isAmharic: boolean;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("habesha-language") as Language) || "en");
  const value = useMemo(() => ({
    language,
    setLanguage: (next: Language) => { localStorage.setItem("habesha-language", next); setLanguage(next); },
    t: (copy: Copy) => copy[language],
    isAmharic: language === "am",
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}

export { content };
