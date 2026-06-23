// src/contexts/LanguageContext.jsx
//
// Ported from gbitx.com — same 3-state pattern (system / explicit /
// persisted), same backbone (react-i18next + bundled locale JSONs).
// The merchant frontend (pay.gbitx.com) shares the gbitx.com locale
// files exactly so the cross-property experience is consistent.
//
// Resolution priority (highest first):
//   1. Explicit user choice persisted to localStorage ('language')
//   2. Browser/OS detection via navigator.languages
//   3. DEFAULT_LANGUAGE ('en')
//
// Optional backend sync: PUT /api/user/language on backendOnly so the
// language follows the merchant across devices. The endpoint may or
// may not exist on the merchant-auth surface — 401 / 404 are swallowed
// silently, the picker still works locally.

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import i18n, {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  isSupportedLanguage,
} from '../i18n';
import { backendClient } from '../api/backendClient.js';

const STORAGE_KEY = 'language';
let lastSyncedLang = null;

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

  const syncToBackend = useCallback((resolved) => {
    if (!resolved || resolved === lastSyncedLang) return;
    lastSyncedLang = resolved;
    backendClient.put('/api/user/language', { language: resolved }).catch(() => {
      if (lastSyncedLang === resolved) lastSyncedLang = null;
    });
  }, []);

  const setLanguage = useCallback((next) => {
    if (next !== 'system' && !isSupportedLanguage(next)) return;
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode */ }
    setPreference(next);
    const resolved = applyLanguage(next);
    setResolvedLanguage(resolved);
    syncToBackend(resolved);
  }, [syncToBackend]);

  const didInitialSync = useRef(false);
  useEffect(() => {
    if (didInitialSync.current) return;
    didInitialSync.current = true;
    syncToBackend(resolvedLanguage);
  }, [resolvedLanguage, syncToBackend]);

  useEffect(() => {
    if (preference !== 'system') return;
    const onChange = () => {
      const resolved = applyLanguage('system');
      setResolvedLanguage(resolved);
      syncToBackend(resolved);
    };
    window.addEventListener('languagechange', onChange);
    return () => window.removeEventListener('languagechange', onChange);
  }, [preference, syncToBackend]);

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
