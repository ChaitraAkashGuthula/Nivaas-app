import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type LanguageCode = "en" | "te" | "hi";

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    te: string;
    hi: string;
  };
}

export const translations: TranslationDictionary = {
  // Navigation
  "nav.home": {
    en: "Home",
    te: "హోమ్",
    hi: "होम",
  },
  "nav.savedProperties": {
    en: "Saved Properties",
    te: "భద్రపరిచిన ఆస్తులు",
    hi: "सहेजे गए गुण",
  },
  "nav.savedSearches": {
    en: "Saved Searches",
    te: "భద్రపరిచిన శోధనలు",
    hi: "सहेजी गई खोजें",
  },
  "nav.yourProperties": {
    en: "Your Properties",
    te: "మీ ఆస్తులు",
    hi: "आपकी संपत्तियां",
  },
  "nav.profile": {
    en: "Profile",
    te: "ప్రొఫైల్",
    hi: "प्रोफ़ाइल",
  },
  "nav.settings": {
    en: "Settings",
    te: "సెట్టింగులు",
    hi: "सेटिंग्स",
  },
  "nav.buyRent": {
    en: "Buy & Rent",
    te: "కొనండి & అద్దెకు",
    hi: "खरीदें और किराए पर लें",
  },
  "nav.sell": {
    en: "Sell",
    te: "అమ్మకం",
    hi: "बेचें",
  },
  "nav.explore": {
    en: "Explore",
    te: "అన్వేషించండి",
    hi: "एक्सप्लोर करें",
  },
  "nav.reviews": {
    en: "Reviews",
    te: "సమీక్షలు",
    hi: "समीक्षाएं",
  },

  // Main Actions
  "action.search": {
    en: "Search",
    te: "శోధించండి",
    hi: "खोजें",
  },
  "action.buy": {
    en: "Buy",
    te: "కొనండి",
    hi: "खरीदें",
  },
  "action.rent": {
    en: "Rent",
    te: "అద్దెకు",
    hi: "किराए पर",
  },
  "action.sell": {
    en: "Sell",
    te: "అమ్మండి",
    hi: "बेचें",
  },
  "action.save": {
    en: "Save property",
    te: "ఆస్తిని భద్రపరచండి",
    hi: "संपत्ति सहेजें",
  },
  "action.saved": {
    en: "Saved",
    te: "భద్రపరచబడింది",
    hi: "सहेजा गया",
  },
  "action.removeFromSaved": {
    en: "Remove from saved properties",
    te: "భద్రపరిచిన వాటి నుండి తీసివేయండి",
    hi: "सहेजे गए से निकालें",
  },
  "action.edit": {
    en: "Edit",
    te: "సవరించండి",
    hi: "संपादित करें",
  },
  "action.delete": {
    en: "Delete",
    te: "తొలగించండి",
    hi: "हटाएं",
  },
  "action.deleteProperty": {
    en: "Delete Property",
    te: "ఆస్తిని తొలగించండి",
    hi: "संपत्ति हटाएं",
  },
  "action.cancel": {
    en: "Cancel",
    te: "రద్దు చేయండి",
    hi: "रद्द करें",
  },
  "action.confirm": {
    en: "Confirm",
    te: "నిర్ధారించండి",
    hi: "पुष्टि करें",
  },
  "action.backHome": {
    en: "Back Home",
    te: "హోమ్‌కి తిరిగి వెళ్లండి",
    hi: "वापस होम",
  },
  "action.listProperty": {
    en: "List Your Property",
    te: "మీ ఆస్తిని జాబితా చేయండి",
    hi: "अपनी संपत्ति सूचीबद्ध करें",
  },
  "action.signOut": {
    en: "Sign Out",
    te: "లాగ్ అవుట్",
    hi: "साइन आउट",
  },

  // Settings
  "settings.title": {
    en: "Settings",
    te: "సెట్టింగులు",
    hi: "सेटिंग्स",
  },
  "settings.subtitle": {
    en: "Manage your account preferences, appearance, and privacy.",
    te: "మీ ఖాతా ప్రాధాన్యతలు, రూపం మరియు గోప్యతను నిర్వహించండి.",
    hi: "अपनी खाता प्राथमिकताएं, उपस्थिति और गोपनीयता प्रबंधित करें।",
  },
  "settings.account": {
    en: "Account",
    te: "ఖాతా",
    hi: "खाता",
  },
  "settings.appearance": {
    en: "Appearance",
    te: "రూపం",
    hi: "दिखावट",
  },
  "settings.language": {
    en: "Language",
    te: "భాష",
    hi: "भाषा",
  },
  "settings.notifications": {
    en: "Notifications",
    te: "నోటిఫికేషన్‌లు",
    hi: "सूचनाएं",
  },
  "settings.privacy": {
    en: "Privacy",
    te: "గోప్యత",
    hi: "गोपनीयता",
  },
  "settings.accountActions": {
    en: "Account Actions",
    te: "ఖాతా చర్యలు",
    hi: "खाता क्रियाएं",
  },
  "settings.deleteAccount": {
    en: "Delete Account",
    te: "ఖాతాను తొలగించండి",
    hi: "खाता हटाएं",
  },

  // Empty States
  "empty.noSavedProperties": {
    en: "No saved properties yet",
    te: "ఇంకా భద్రపరిచిన ఆస్తులు లేవు",
    hi: "अभी तक कोई सहेजी गई संपत्ति नहीं",
  },
  "empty.noSavedSearches": {
    en: "No saved searches yet",
    te: "ఇంకా భద్రపరిచిన శోధనలు లేవు",
    hi: "अभी तक कोई सहेजी गई खोज नहीं",
  },
  "empty.noProperties": {
    en: "No properties listed yet",
    te: "ఇంకా ఆస్తులు జాబితా చేయబడలేదు",
    hi: "अभी तक कोई संपत्ति सूचीबद्ध नहीं है",
  },
  "empty.beTheFirst": {
    en: "Be the first to list a property on NIVAAS.",
    te: "నివాస్‌లో ఆస్తిని జాబితా చేసే మొదటి వ్యక్తి అవ్వండి.",
    hi: "निवास पर संपत्ति सूचीबद्ध करने वाले पहले व्यक्ति बनें।",
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem("nivaas_language");
      if (stored === "en" || stored === "te" || stored === "hi") {
        return stored;
      }
    } catch (e) {
      // ignore
    }
    return "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem("nivaas_language", language);
      document.documentElement.lang = language;
    } catch (e) {
      // ignore
    }
  }, [language]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      let entry = translations[key];
      if (!entry && key.startsWith("actions.")) {
        entry = translations[key.replace("actions.", "action.")];
      }
      if (!entry && key.startsWith("action.")) {
        entry = translations[key.replace("action.", "actions.")];
      }
      if (!entry && key === "settings.signOut") {
        entry = translations["action.signOut"];
      }
      if (entry && entry[language]) {
        return entry[language];
      }
      if (entry && entry.en) {
        return entry.en;
      }
      return fallback || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
}
