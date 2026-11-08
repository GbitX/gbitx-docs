// src/contexts/LanguageContext.jsx
//
// Ported from gbitx.com — same 3-state pattern (system / explicit /
// persisted), same backbone (react-i18next + bundled locale JSONs).
// The merchant dashboard (www.gbitxpay.com) shares the same locale
// files so the cross-property experience is consistent.
//
// Resolution priority (highest first):
//   1. Explicit user choice persisted to localStorage ('language')
//   2. Browser/OS detection via navigator.languages
//   3. DEFAULT_LANGUAGE ('en')
//
// No backend sync: the docs site has no login, so the choice lives in
// this origin's localStorage only. A merchant's account language (which
// their GbitXPay emails follow) is saved from the dashboard. The old sync
// sent a credentialed request to the exchange API on every page load and
// could rewrite a GbitX customer's exchange language from here.

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import i18n, {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  isSupportedLanguage,
} from '../i18n';

const STORAGE_KEY = 'language';

const LanguageContext = createContext(null);

const resolveLanguage = (preference) => {
  if (preference === 'system' || !preference) return detectBrowserLanguage();
  if (isSupportedLanguage(preference)) return preference;
  return DEFAULT_LANGUAGE;
};

const applyLanguage = (preference) => {
  const resolved = resolveLanguage(preference);
  if (i18n.language !== resolved) i18n.changeLanguage(resolved);
  if (typeof document !== 'undefined') document.documentElement.setAttribute('lang', resolved);
  return resolved;
};

export const LanguageProvider = ({ children }) => {
  const [preference, setPreference] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'system'; }
    catch { return 'system'; }
  });

  const [resolvedLanguage, setResolvedLanguage] = useState(() => applyLanguage(preference));

  const setLanguage = useCallback((next) => {
    if (next !== 'system' && !isSupportedLanguage(next)) return;
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode */ }
    setPreference(next);
    const resolved = applyLanguage(next);
    setResolvedLanguage(resolved);
  }, []);

  useEffect(() => {
    if (preference !== 'system') return;
    const onChange = () => {
      const resolved = applyLanguage('system');
      setResolvedLanguage(resolved);
    };
    window.addEventListener('languagechange', onChange);
    return () => window.removeEventListener('languagechange', onChange);
  }, [preference]);

  const value = useMemo(() => ({
    preference, resolvedLanguage, setLanguage,
    languages: SUPPORTED_LANGUAGES,
  }), [preference, resolvedLanguage, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
