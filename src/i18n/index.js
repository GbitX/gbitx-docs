// src/i18n/index.js
//
// Bootstrap for react-i18next. Mirrors the three-state pattern used by
// ThemeContext (system / explicit / persisted): the active language is
// resolved via LanguageContext at runtime, and i18next is just the
// translation engine + JSON loader.
//
// Why we bundle all locale JSONs at build time (instead of HTTP-loading
// them lazily): on first paint we need translations available before
// the React tree mounts — otherwise the user sees a flash of English
// before the locale fetch resolves. The 4 locale JSONs are tiny
// (~5-15 KB each gzip), and Vite tree-shakes the unused ones from the
// initial bundle anyway. Switch to lazy http-backend later if the JSONs
// ever exceed ~50 KB each.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

// Languages we ship translations for. Adding a new language: drop a
// JSON file in locales/, add the import + entry here, and the rest of
// the app picks it up automatically (LanguageSwitcher reads from this
// list to render its options).
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',     nativeLabel: 'English' },
  { code: 'fr', label: 'French',      nativeLabel: 'Français' },
  { code: 'es', label: 'Spanish',     nativeLabel: 'Español' },
  { code: 'pt', label: 'Portuguese',  nativeLabel: 'Português' },
];

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(l => l.code);
export const DEFAULT_LANGUAGE = 'en';

export const isSupportedLanguage = (code) =>
  typeof code === 'string' && SUPPORTED_LANGUAGE_CODES.includes(code);

/**
 * Detect the language to use when the user hasn't picked one explicitly.
 * Reads navigator.languages (browser/OS preference list, in priority order)
 * and returns the first match in our supported set.
 *
 * Examples:
 *   French OS, English browser override     → ['en-US', 'fr']    → 'en'
 *   Brazilian Portuguese                    → ['pt-BR', 'pt']    → 'pt'
 *   German (not supported)                  → ['de-DE']          → 'en' (fallback)
 */
export const detectBrowserLanguage = () => {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const candidates = navigator.languages?.length
    ? navigator.languages
    : (navigator.language ? [navigator.language] : []);
  for (const tag of candidates) {
    const base = String(tag).toLowerCase().split('-')[0]; // 'fr-FR' → 'fr'
    if (isSupportedLanguage(base)) return base;
  }
  return DEFAULT_LANGUAGE;
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      pt: { translation: pt },
    },
    lng: DEFAULT_LANGUAGE, // LanguageContext takes over after mount and may switch
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false, // React already escapes JSX — no double-escape
    },
    react: {
      useSuspense: false, // resources are bundled, no async load = no suspense needed
    },
  });

export default i18n;
