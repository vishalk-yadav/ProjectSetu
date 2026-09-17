import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';
import ta from '../locales/ta.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const savedLang =
  (typeof localStorage !== 'undefined' &&
    (localStorage.getItem('projectsetu_lang') || localStorage.getItem('projectsetu_dashboard_lang'))) ||
  'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      te: { translation: te },
      ta: { translation: ta },
    },
    lng: savedLang,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'te', 'ta'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

i18n.on('languageChanged', (lng) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('projectsetu_lang', lng);
    localStorage.setItem('projectsetu_dashboard_lang', lng);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
