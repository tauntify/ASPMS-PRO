import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/i18n/en.json";
import ur from "@/i18n/ur.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ur"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "ofivio-language",
    },
  });

export default i18n;
