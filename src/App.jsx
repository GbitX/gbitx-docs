import { Routes, Route } from 'react-router-dom';
import ApiDocs from './pages/ApiDocs.jsx';

// Single-route docs app. doc.gbitx.com/ renders the gateway reference
// directly — same component shown inside the merchant dashboard at
// pay.gbitx.com/dashboard/docs, no chrome wrap, no auth gate.
//
// The ApiDocs component carries its own sticky left sidebar nav +
// language switcher in-page (top right), so nothing else is needed
// to make this a complete docs site. Anchor links like
// doc.gbitx.com/#payments resolve via the in-page scrollTo handler.

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ApiDocs />} />
      {/* Anything else falls through to the docs home. /docs, /reference,
          /api, future bookmarks all still resolve. */}
      <Route path="*" element={<ApiDocs />} />
    </Routes>
  );
}
