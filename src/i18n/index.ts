import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar }
    },
    fallbackLng: 'en',
    lng: isServer ? 'en' : undefined, // Use 'en' as default on server to prevent hydration mismatch
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      // Only detect on client side
      lookupLocalStorage: isServer ? undefined : 'i18nextLng'
    }
  });

export default i18n;

