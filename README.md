# gbitx-docs

Public documentation site for the GbitX payment gateway. Served at
[doc.gbitx.com](https://doc.gbitx.com).

## What's in here

A standalone Vite + React app that renders the same `ApiDocs.jsx`
component shown inside the merchant dashboard (at
pay.gbitx.com/dashboard/docs), without the dashboard chrome or auth
gate.

```
src/
├── pages/ApiDocs.jsx              ← copied verbatim from gbitxpay-frontend
├── components/LanguageSwitcher.jsx
├── contexts/LanguageContext.jsx   ← persists locale across .gbitx.com
├── i18n/
│   ├── index.js                   ← react-i18next bootstrap
│   └── locales/{en,fr,es,pt}.json
├── api/backendClient.js           ← used by LanguageContext for backend sync
├── styles/global.css
├── App.jsx                        ← single route to ApiDocs
└── main.jsx                       ← BrowserRouter + LanguageProvider
```

## Local dev

```sh
npm install
npm run dev          # vite — http://localhost:5181
npm run build        # static bundle into dist/
npm run preview      # local server on dist/ for smoke-testing the build
```

## Deploy

Deployed via Vercel. New project pointed at this repo, build command
`npm run build`, output `dist`.

1. Push to `GbitX/gbitx-docs` on GitHub.
2. Vercel → New Project → import the repo. Defaults work — Vite preset
   detects everything.
3. Vercel → project → Settings → Domains → add `doc.gbitx.com`.
4. DNS (Cloudflare / whoever owns gbitx.com):
   ```
   doc  CNAME  cname.vercel-dns.com
   ```
5. Verify, force-HTTPS, done.

## Updating content

The docs page itself lives at `src/pages/ApiDocs.jsx`. To keep this
in lock-step with the in-dashboard copy at
`gbitxpay-frontend/src/pages/merchant/tabs/ApiDocs.jsx`, edit one and
copy to the other (or refactor into a shared package later if the
divergence becomes painful).
