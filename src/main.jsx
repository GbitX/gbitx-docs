import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';
// i18next init — side-effect import: registers locales + creates the
// singleton instance that react-i18next + LanguageProvider use. Must
// run before any component that calls useTranslation() / <Trans>.
// Same setup and locale keys as the merchant dashboard. LanguageContext
// persists the reader's choice to localStorage('language') on this origin.
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
