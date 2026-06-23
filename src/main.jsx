import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';
// i18next init — side-effect import: registers locales + creates the
// singleton instance that react-i18next + LanguageProvider use. Must
// run before any component that calls useTranslation() / <Trans>.
// Same setup as the merchant dashboard so a customer switching
// language on pay.gbitx.com sees doc.gbitx.com in the same language
// (LanguageContext persists the choice to localStorage('language')
// scoped to .gbitx.com).
import './i18n';
import { LanguageProvider } from './contexts/LanguageContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
