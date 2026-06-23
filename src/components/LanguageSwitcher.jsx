import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext.jsx';

// Compact dashboard topbar language picker.
//
// SAME logic as gbitx.com's GatewayLanguageSwitcher: backed by the
// real LanguageContext, which is backed by react-i18next. Pick a
// language and every t() / <Trans> call across the app re-renders
// in that language immediately. Choice persisted to localStorage
// and fire-and-forget synced to backendOnly.
//
// Differences from the legacy component (all cosmetic):
//   - SVG icons instead of FontAwesome (no dep load)
//   - 2-letter code chip instead of country flag (no flag dep load)
// Logic + accessibility are unchanged: outside-click + Escape close,
// aria-haspopup / aria-expanded / role=listbox / role=option.

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { preference, resolvedLanguage, languages, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={s.wrap}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('settings.language', 'Language')}
        title={t('settings.language', 'Language')}
        style={s.trigger}
      >
        <Globe />
        <span style={s.code}>{resolvedLanguage.toUpperCase()}</span>
      </button>

      {open && (
        <ul role="listbox" aria-label={t('settings.language', 'Language')} style={s.menu}>
          <li>
            <button
              type="button"
              role="option"
              aria-selected={preference === 'system'}
              onClick={() => pick('system')}
              style={{ ...s.item, ...(preference === 'system' ? s.itemActive : {}) }}
            >
              <span style={s.itemMain}>
                <Globe />
                <span>{t('settings.system', 'System')}</span>
              </span>
              {preference === 'system' && <Check />}
            </button>
          </li>
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={preference === lang.code}
                onClick={() => pick(lang.code)}
                lang={lang.code}
                style={{ ...s.item, ...(preference === lang.code ? s.itemActive : {}) }}
              >
                <span style={s.itemMain}>
                  <CodeChip code={lang.code} />
                  <span>{lang.nativeLabel}</span>
                </span>
                {preference === lang.code && <Check />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
function Check() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
function CodeChip({ code }) {
  return <span style={s.codeChip}>{code.toUpperCase()}</span>;
}

const s = {
  wrap: { position: 'relative' },
  trigger: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text-muted)', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', lineHeight: 1,
  },
  code: { fontSize: 11, letterSpacing: 0.5 },
  menu: {
    listStyle: 'none', margin: 0, padding: 6,
    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
    minWidth: 180, background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)', zIndex: 50,
  },
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
    fontSize: 13, color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
  },
  itemActive: { background: 'var(--brand-soft)', color: 'var(--brand)', fontWeight: 600 },
  itemMain: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  codeChip: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 28, height: 18, padding: '0 5px', borderRadius: 4,
    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
    fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: 0.5,
  },
};
