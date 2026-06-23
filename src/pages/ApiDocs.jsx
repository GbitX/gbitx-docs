import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

// Inline-code marker for prose embedded in <Trans defaults>. react-i18next
// clones this element with the inner text taken from the `<code>...</code>`
// substring in the defaults string, so the visible chip needs no children
// here — react-i18next injects them at render time.
const INLINE_CODE_STYLE = {
  background: 'var(--bg-elevated)',
  color: 'var(--text)',
  padding: '2px 6px',
  borderRadius: 3,
  fontSize: 12,
  fontFamily: 'monospace',
  border: '1px solid var(--border)',
};
const CODE_COMPONENT   = <code style={INLINE_CODE_STYLE} />;
const STRONG_COMPONENT = <strong style={{ color: 'var(--text)' }} />;

const BASE_URL = 'https://gateway.gbitx.com';

// ── Sections ─────────────────────────────────────────────────────────────────
//
// Each section has a stable English `fallback` plus an i18n `key`. The
// fallback is what shows on missing translations — we deliberately keep
// well-known dev-doc anchor phrases ("Authentication", "Webhooks") in
// English by default since the industry convention is English-first for
// API references (Stripe, Paystack, etc. all do this).
const SECTIONS = [
  { id: 'getting-started',  key: 'developer.docs.nav.gettingStarted', fallback: 'Getting Started' },
  { id: 'authentication',   key: 'developer.docs.nav.authentication', fallback: 'Authentication' },
  { id: 'payments',         key: 'developer.docs.nav.payments',       fallback: 'Payments' },
  { id: 'payment-links',    key: 'developer.docs.nav.paymentLinks',   fallback: 'Payment Links' },
  { id: 'pricing',          key: 'developer.docs.nav.pricing',        fallback: 'Pricing & Fees' },
  { id: 'inline-checkout',  key: 'developer.docs.nav.inlineCheckout', fallback: 'Inline Checkout (iframe)' },
  { id: 'js-sdk',           key: 'developer.docs.nav.jsSdk',          fallback: 'JavaScript SDK' },
  { id: 'mobile-webview',   key: 'developer.docs.nav.mobileWebview',  fallback: 'Mobile (WebView)' },
  { id: 'webhooks',         key: 'developer.docs.nav.webhooks',       fallback: 'Webhooks' },
  { id: 'webhook-verify',   key: 'developer.docs.nav.webhookVerify',  fallback: 'Verify Webhooks' },
  { id: 'coins-rates',      key: 'developer.docs.nav.coinsRates',     fallback: 'Coins & Rates' },
  { id: 'errors',           key: 'developer.docs.nav.errors',         fallback: 'Errors' },
  { id: 'rate-limits',      key: 'developer.docs.nav.rateLimits',     fallback: 'Rate Limits' },
  { id: 'postman',          key: 'developer.docs.nav.postman',        fallback: 'Postman Collection' },
];

const SDK_URL = `${BASE_URL}/v1/checkout.js`;
const PAYMENT_PAGE_URL = 'https://pay.gbitx.com';

// ── Code block component ─────────────────────────────────────────────────────

function Code({ lang, children }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={s.codeWrap}>
      <div style={s.codeHeader}>
        <span style={s.codeLang}>{lang}</span>
        <button onClick={copy} style={s.copyBtn}>{copied ? t('developer.copiedShort', 'Copied') : t('developer.copy', 'Copy')}</button>
      </div>
      <pre style={s.pre}><code>{children}</code></pre>
    </div>
  );
}

function Endpoint({ method, path, auth, description }) {
  // POST is the platform green; PUT can't share that color so it becomes amber
  // — still visually distinct from GET (blue), PATCH (purple), DELETE (red).
  const color = { POST: '#07811F', GET: '#3B82F6', PUT: '#F59E0B', PATCH: '#8B5CF6', DELETE: '#EF4444' }[method] || '#6B7280';
  return (
    <div style={s.endpoint}>
      <div style={s.endpointRow}>
        <span style={{ ...s.methodBadge, background: color }}>{method}</span>
        <code style={s.pathCode}>{path}</code>
        {auth && <span style={s.authBadge}>{auth}</span>}
      </div>
      <p style={s.endpointDesc}>{description}</p>
    </div>
  );
}

function Param({ name, type, required, children }) {
  return (
    <div style={s.param}>
      <div>
        <code style={s.paramName}>{name}</code>
        <span style={s.paramType}>{type}</span>
        {required && <span style={s.paramReq}>required</span>}
      </div>
      <p style={s.paramDesc}>{children}</p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ApiDocs() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [activeSection, setActiveSection] = useState('getting-started');

  // ApiDocs is mounted on two routes:
  //   /docs              — standalone public page, no dashboard chrome
  //   /developers/docs   — inside DeveloperDashboard, which has its own
  //                        topbar language switcher
  // We render an in-page switcher only on the standalone route so the
  // dashboard route doesn't end up with two duplicated switchers.
  const standalone = !pathname.startsWith('/developers');

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={s.container} className="api-docs">
      {/* Sidebar nav */}
      <nav style={s.sidebar}>
        <div style={s.sidebarTitle}>{t('developer.docs.apiReference', 'API Reference')}</div>
        {SECTIONS.map(sec => (
          <button
            key={sec.id}
            onClick={() => scrollTo(sec.id)}
            style={activeSection === sec.id ? { ...s.navItem, ...s.navItemActive } : s.navItem}
          >
            {t(sec.key, sec.fallback)}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div style={s.content}>
        {standalone && (
          <div style={s.standaloneTopbar}>
            <LanguageSwitcher />
          </div>
        )}
        {/* ── Getting Started ─────────────────────────────────────────── */}
        <section id="getting-started" style={s.section}>
          <h1 style={s.h1}>{t('developer.docs.title', 'GbitX Pay API')}</h1>
          <p style={s.intro}>
            {t('developer.docs.intro', 'Accept crypto payments from customers worldwide. Three ways to integrate: redirect to our hosted page, embed with the JavaScript SDK for an inline modal, or open the payment page in a WebView from your mobile app. All three deliver the same signed webhook to your backend on confirmation.')}
          </p>

          <div style={s.stepsGrid}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <h3 style={s.stepTitle}>{t('developer.docs.step1.title', 'Get API keys')}</h3>
              <p style={s.stepText}>{t('developer.docs.step1.text', 'Create sandbox and live API keys from the API Keys tab in your dashboard.')}</p>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <h3 style={s.stepTitle}>{t('developer.docs.step2.title', 'Create a payment')}</h3>
              <p style={s.stepText}>{t('developer.docs.step2.text', 'POST to /v1/payments with the amount and currency. You get back a payment URL.')}</p>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <h3 style={s.stepTitle}>{t('developer.docs.step3.title', 'Redirect customer')}</h3>
              <p style={s.stepText}>{t('developer.docs.step3.text', 'Send the customer to the payment URL. They select a coin and pay.')}</p>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>4</div>
              <h3 style={s.stepTitle}>{t('developer.docs.step4.title', 'Receive webhook')}</h3>
              <p style={s.stepText}>{t('developer.docs.step4.text', 'We notify your server when the payment is confirmed, expired, or underpaid.')}</p>
            </div>
          </div>

          <h3 style={s.h3}>{t('developer.docs.baseUrl', 'Base URL')}</h3>
          <Code lang="text">{BASE_URL}</Code>

          <h3 style={s.h3}>{t('developer.docs.quickExample', 'Quick example')}</h3>
          <Code lang="bash">{`curl -X POST ${BASE_URL}/v1/payments \\
  -H "Authorization: Bearer gk_test_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 25.00,
    "currency": "USD",
    "description": "Order #1234",
    "redirectUrl": "https://yoursite.com/success",
    "cancelUrl": "https://yoursite.com/cancel"
  }'`}</Code>
        </section>

        {/* ── Authentication ──────────────────────────────────────────── */}
        <section id="authentication" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.authentication', 'Authentication')}</h2>
          <p style={s.text}>
            <Trans
              i18nKey="developer.docs.authIntro"
              defaults="All API requests require an API key sent in the <code>Authorization</code> header. Create keys from the API Keys tab in your developer dashboard."
              components={{ code: CODE_COMPONENT }}
            />
          </p>

          <Code lang="http">{`Authorization: Bearer gk_live_your_api_key_here`}</Code>

          <div style={s.callout}>
            <strong>{t('developer.docs.apiKeyFormats', 'API key formats')}</strong>
            <ul style={s.list}>
              <li>
                <Trans
                  i18nKey="developer.docs.gkTest"
                  defaults="<code>gk_test_*</code> — Sandbox mode. No real crypto involved. Use for development and testing."
                  components={{ code: CODE_COMPONENT }}
                />
              </li>
              <li>
                <Trans
                  i18nKey="developer.docs.gkLive"
                  defaults="<code>gk_live_*</code> — Live mode. Real blockchain transactions. Use in production."
                  components={{ code: CODE_COMPONENT }}
                />
              </li>
            </ul>
          </div>

          <div style={s.warnCallout}>
            <Trans
              i18nKey="developer.docs.keepKeysSecret"
              defaults="<strong>Keep your keys secret.</strong> Never expose API keys in client-side code, public repositories, or browser requests. If a key is compromised, revoke it immediately from the dashboard and create a new one."
              components={{ strong: STRONG_COMPONENT }}
            />
          </div>

          <h3 style={s.h3}>{t('developer.docs.keyLimits', 'Key limits')}</h3>
          <p style={s.text}>{t('developer.docs.keyLimitsBody', 'Maximum 10 active API keys per merchant account. Sandbox and live keys are counted together.')}</p>
        </section>

        {/* ── Payments ────────────────────────────────────────────────── */}
        <section id="payments" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.payments', 'Payments')}</h2>

          {/* Create */}
          <Endpoint method="POST" path="/v1/payments" auth="API Key" description={t('developer.docs.ep.createPayment', 'Create a new payment request.')} />

          <h4 style={s.h4}>{t('developer.docs.optionalHeaders', 'Optional headers')}</h4>
          <Param name="Idempotency-Key" type="string">
            {t('developer.docs.params.idempotencyKey', 'Set this to a unique value (e.g., your order ID) to make the request safely retryable. If a payment with the same key has already been created for your account, we return that payment instead of creating a new one — even if the original response was lost in transit. Recommended for any client that automatically retries POST on connection errors. Max 255 printable ASCII characters, no whitespace. Scoped per-merchant.')}
          </Param>
          <div style={s.callout}>
            <Trans
              i18nKey="developer.docs.whyIdempotency"
              defaults="<strong>Why use it:</strong> if your HTTP client retries a POST after a network blip, without an idempotency key you get two payment rows for one logical order. With the key, the retry returns the original payment."
              components={{ strong: STRONG_COMPONENT }}
            />
          </div>

          <h4 style={s.h4}>{t('developer.docs.requestBody', 'Request body')}</h4>
          <Param name="amount" type="number" required>
            {t('developer.docs.params.amount', 'Payment amount in the specified currency. Maximum 1,000,000.')}
          </Param>
          <Param name="currency" type="string">
            <Trans
              i18nKey="developer.docs.params.currency"
              defaults="Three-letter ISO currency code. Defaults to <code>USD</code>. Supported: USD, EUR, GBP, GHS, NGN, KES, ZAR, and 60+ more."
              components={{ code: CODE_COMPONENT }}
            />
          </Param>
          <Param name="description" type="string">
            {t('developer.docs.params.description', 'Description shown to the customer on the payment page. Max 255 characters.')}
          </Param>
          <Param name="redirectUrl" type="string">
            <Trans
              i18nKey="developer.docs.params.redirectUrl"
              defaults="URL to redirect the customer after successful payment. Must use <code>https://</code> in production. <code>http://localhost</code> and <code>http://127.0.0.1</code> are accepted for local development. <code>javascript:</code>, <code>data:</code>, and other browser-special schemes are rejected."
              components={{ code: CODE_COMPONENT }}
            />
          </Param>
          <Param name="cancelUrl" type="string">
            <Trans
              i18nKey="developer.docs.params.cancelUrl"
              defaults="URL to redirect the customer if they cancel. Same scheme restrictions as <code>redirectUrl</code>."
              components={{ code: CODE_COMPONENT }}
            />
          </Param>
          <Param name="externalRef" type="string">
            {t('developer.docs.params.externalRef', 'Your internal reference ID (e.g., order ID). Max 100 characters.')}
          </Param>
          <Param name="metadata" type="object">
            {t('developer.docs.params.metadata', 'Arbitrary key-value pairs stored with the payment. Returned in webhooks and API responses. Total JSON-serialized size limit: 4096 bytes.')}
          </Param>

          <h4 style={s.h4}>{t('developer.docs.response', 'Response')}</h4>
          <Code lang="json">{`{
  "success": true,
  "payment": {
    "id": "cmo2g79yg000511jh2mmck6im",
    "paymentUrl": "https://pay.gbitx.com/p/cmo2g79yg000511jh2mmck6im",
    "status": "PENDING",
    "amount": "25.00",
    "currency": "USD",
    "mode": "SANDBOX",
    "expiresAt": "2026-04-17T06:00:00.000Z",
    "createdAt": "2026-04-17T05:00:00.000Z"
  }
}`}</Code>

          <div style={s.callout}>
            <Trans
              i18nKey="developer.docs.whatToDoResponse"
              defaults="<strong>What to do with the response:</strong> Redirect your customer to <code>paymentUrl</code>. They will select a cryptocurrency, see the deposit address, and send the payment. The payment expires after 60 minutes."
              components={{ strong: STRONG_COMPONENT, code: CODE_COMPONENT }}
            />
          </div>

          {/* Get */}
          <div style={s.divider} />
          <Endpoint method="GET" path="/v1/payments/:id" auth="API Key" description={t('developer.docs.ep.getPayment', 'Retrieve a single payment by ID.')} />

          <Code lang="json">{`{
  "success": true,
  "payment": {
    "id": "cmo2g79yg000511jh2mmck6im",
    "externalRef": "order_1234",
    "amount": "25.00",
    "currency": "USD",
    "crypto": "USDT",
    "network": "tron",
    "address": "TXqZ3...",
    "amountCrypto": "25.00000000",
    "amountPaid": "25.00000000",
    "status": "CONFIRMED",
    "mode": "SANDBOX",
    "txHash": "abc123...",
    "description": "Order #1234",
    "metadata": { "orderId": "1234" },
    "redirectUrl": "https://yoursite.com/success",
    "cancelUrl": "https://yoursite.com/cancel",
    "expiresAt": "2026-04-17T06:00:00.000Z",
    "confirmedAt": "2026-04-17T05:15:00.000Z",
    "createdAt": "2026-04-17T05:00:00.000Z",
    "paymentUrl": "https://pay.gbitx.com/p/cmo2g79yg000511jh2mmck6im"
  }
}`}</Code>

          {/* List */}
          <div style={s.divider} />
          <Endpoint method="GET" path="/v1/payments" auth="API Key" description={t('developer.docs.ep.listPayments', 'List your payments with optional filters.')} />

          <h4 style={s.h4}>{t('developer.docs.queryParams', 'Query parameters')}</h4>
          <Param name="status" type="string">{t('developer.docs.params.filterStatus', 'Filter by status: PENDING, AWAITING_PAYMENT, CONFIRMING, CONFIRMED, UNDERPAID, EXPIRED, CANCELLED, FAILED.')}</Param>
          <Param name="mode" type="string">{t('developer.docs.params.filterMode', 'Filter by mode: SANDBOX or LIVE.')}</Param>
          <Param name="limit" type="number">{t('developer.docs.params.limit', 'Results per page. Default 20, max 100.')}</Param>
          <Param name="offset" type="number">{t('developer.docs.params.offset', 'Number of results to skip. Default 0.')}</Param>

          <Code lang="json">{`{
  "success": true,
  "payments": [ ... ],
  "total": 142,
  "limit": 20,
  "offset": 0
}`}</Code>

          {/* Status lifecycle */}
          <div style={s.divider} />
          <h3 style={s.h3}>{t('developer.docs.paymentLifecycle', 'Payment lifecycle')}</h3>
          <div style={s.lifecycle}>
            <div style={s.statusFlow}>
              <span style={{ ...s.statusPill, background: '#6B7280' }}>PENDING</span>
              <span style={s.arrow}>→</span>
              <span style={{ ...s.statusPill, background: '#F59E0B' }}>AWAITING_PAYMENT</span>
              <span style={s.arrow}>→</span>
              <span style={{ ...s.statusPill, background: '#3B82F6' }}>CONFIRMING</span>
              <span style={s.arrow}>→</span>
              <span style={{ ...s.statusPill, background: '#07811F' }}>CONFIRMED</span>
            </div>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t('developer.docs.col.status', 'Status')}</th>
                <th style={s.th}>{t('developer.docs.col.meaning', 'Meaning')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={s.td}><code style={s.inlineCode}>PENDING</code></td><td style={s.td}>{t('developer.docs.lifecycle.pending', "Payment created. Customer hasn't selected a coin yet.")}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>AWAITING_PAYMENT</code></td><td style={s.td}>{t('developer.docs.lifecycle.awaiting', 'Coin selected. Deposit address assigned. Waiting for customer to send crypto.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>UNDERPAID</code></td><td style={s.td}>{t('developer.docs.lifecycle.underpaid', 'Customer sent less than the required amount.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>CONFIRMING</code></td><td style={s.td}>{t('developer.docs.lifecycle.confirming', 'Correct amount received. Waiting for blockchain confirmations.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>CONFIRMED</code></td><td style={s.td}>{t('developer.docs.lifecycle.confirmed', 'Payment confirmed on-chain. Funds credited to your merchant wallet.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>EXPIRED</code></td><td style={s.td}>{t('developer.docs.lifecycle.expired', 'Payment expired before the customer paid (60-minute window).')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>CANCELLED</code></td><td style={s.td}>{t('developer.docs.lifecycle.cancelled', 'Customer cancelled the payment.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>FAILED</code></td><td style={s.td}>{t('developer.docs.lifecycle.failed', 'Payment failed due to a system error.')}</td></tr>
            </tbody>
          </table>
        </section>

        {/* ── Payment Links ─────────────────────────────────────────────
            Sandwiched between Payments (the "I'm writing code" path)
            and Pricing (the "what does it cost" answer) so a reader
            sees the no-code alternative right next to the developer
            integration. */}
        <section id="payment-links" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.paymentLinks', 'Payment Links')}</h2>
          <p style={s.intro}>
            {t(
              'developer.docs.paymentLinks.intro',
              'Payment Links let you accept crypto from customers without writing any code. Create a link in the dashboard, share the URL — by email, on social media, in an invoice PDF, or as a QR code — and the customer pays at pay.gbitx.com. Every link is backed by the same hosted checkout, the same webhook stack, and the same fee schedule as a direct API payment.',
            )}
          </p>

          <h3 style={s.h3}>{t('developer.docs.paymentLinks.flavorsTitle', 'Two flavors')}</h3>
          <p style={s.text}>
            <strong>{t('developer.docs.paymentLinks.singleUseTitle', 'Single-use')}</strong>
            {' — '}
            {t(
              'developer.docs.paymentLinks.singleUseBody',
              "Set maxUses to 1. The link works once; after a customer pays (or even just opens the checkout) it stops accepting new sessions. Use these for invoices addressed to a specific customer, or any payment you don't want shared.",
            )}
          </p>
          <p style={s.text}>
            <strong>{t('developer.docs.paymentLinks.reusableTitle', 'Reusable')}</strong>
            {' — '}
            {t(
              'developer.docs.paymentLinks.reusableBody',
              'Leave maxUses unset (or set a higher cap like 100). The link can be paid any number of times. Each click mints a fresh Payment row. Ideal for product pages, donation buttons, and tip jars.',
            )}
          </p>

          <h3 style={s.h3}>{t('developer.docs.paymentLinks.modesTitle', 'Fixed amount vs. customer enters')}</h3>
          <p style={s.text}>
            {t(
              'developer.docs.paymentLinks.modesBody',
              "Set amountMode to FIXED when you know exactly what to charge (a $29.99 subscription, a 0.05 BTC invoice). Set it to CUSTOMER_ENTERS when you don't — the landing page shows a number input with optional min/max bounds. Useful for donations, top-ups, and pay-what-you-want.",
            )}
          </p>

          <h3 style={s.h3}>{t('developer.docs.paymentLinks.urlShape', 'The share URL')}</h3>
          <p style={s.text}>
            {t(
              'developer.docs.paymentLinks.urlBody',
              'Every link is identified by a cryptographically random 16-character code. The URL you share with customers looks like:',
            )}
          </p>
          <Code lang="text">{`${PAYMENT_PAGE_URL}/l/Y7M034CB2WYFG5KW`}</Code>
          <p style={s.text}>
            {t(
              'developer.docs.paymentLinks.urlSecurity',
              "The code carries 80 bits of entropy — enumeration by guessing is computationally infeasible. We additionally rate-limit lookups by IP and 404 every non-live state (inactive / expired / over-cap / merchant suspended) with the same response so an attacker can't distinguish a real-but-disabled link from a non-existent one.",
            )}
          </p>

          {/* ── Endpoints ──────────────────────────────────────────────── */}
          <h3 style={s.h3}>{t('developer.docs.paymentLinks.api', 'API reference')}</h3>
          <p style={s.text}>
            {t(
              'developer.docs.paymentLinks.apiBody',
              'You can manage links from the dashboard OR via the merchant API. The dashboard UI is just a thin wrapper around these endpoints. Auth is the same as every other merchant-side endpoint — your session cookie.',
            )}
          </p>

          <Endpoint method="POST" path="/v1/payment-links" auth="Session"
            description={t('developer.docs.paymentLinks.ep.create', 'Create a new payment link. Returns the link + a shareUrl ready to copy.')} />

          <h4 style={s.h4}>{t('developer.docs.paymentLinks.requestBody', 'Request body')}</h4>
          <Param name="title" type="string" required>
            {t('developer.docs.paymentLinks.params.title', 'Up to 120 chars. Shown at the top of the public landing page (e.g. "Pro plan — monthly").')}
          </Param>
          <Param name="description" type="string">
            {t('developer.docs.paymentLinks.params.description', 'Optional. Up to 500 chars. Shown under the title.')}
          </Param>
          <Param name="imageUrl" type="string">
            {t('developer.docs.paymentLinks.params.imageUrl', 'Optional. https:// only. Renders above the title on the landing page (max 200 px tall).')}
          </Param>
          <Param name="mode" type="string" required>
            {t('developer.docs.paymentLinks.params.mode', "'SANDBOX' or 'LIVE'. LIVE requires your merchant account to be APPROVED.")}
          </Param>
          <Param name="amountMode" type="string" required>
            {t('developer.docs.paymentLinks.params.amountMode', "'FIXED' (you set the amount) or 'CUSTOMER_ENTERS' (customer types it on the landing).")}
          </Param>
          <Param name="fixedAmount" type="number">
            {t('developer.docs.paymentLinks.params.fixedAmount', 'Required when amountMode = FIXED. 0.01 to 1,000,000.')}
          </Param>
          <Param name="currency" type="string">
            {t('developer.docs.paymentLinks.params.currency', 'ISO 4217 code (e.g. USD, EUR). Required when amountMode = FIXED. Optional restriction when CUSTOMER_ENTERS — null lets the customer pick.')}
          </Param>
          <Param name="minAmount" type="number">
            {t('developer.docs.paymentLinks.params.minAmount', 'Optional bound for amountMode = CUSTOMER_ENTERS. Enforced server-side at checkout.')}
          </Param>
          <Param name="maxAmount" type="number">
            {t('developer.docs.paymentLinks.params.maxAmount', 'Optional bound for amountMode = CUSTOMER_ENTERS. Enforced server-side at checkout.')}
          </Param>
          <Param name="maxUses" type="integer">
            {t('developer.docs.paymentLinks.params.maxUses', 'Optional. Caps how many payments the link can mint. Leave null for unlimited. Set to 1 for a single-use invoice link.')}
          </Param>
          <Param name="expiresAt" type="ISO 8601 string">
            {t('developer.docs.paymentLinks.params.expiresAt', 'Optional. Link returns 404 to customers after this timestamp regardless of usedCount.')}
          </Param>
          <Param name="successUrl" type="string">
            {t('developer.docs.paymentLinks.params.successUrl', 'Optional. Where to send the customer after a confirmed payment. https:// only.')}
          </Param>
          <Param name="cancelUrl" type="string">
            {t('developer.docs.paymentLinks.params.cancelUrl', 'Optional. Where to send the customer if they cancel on the checkout.')}
          </Param>
          <Param name="metadata" type="object">
            {t('developer.docs.paymentLinks.params.metadata', 'Optional JSON object. Copied into every Payment row + every webhook payload as paymentLinkCode + your fields, so you can correlate confirmations back to the source link. Max 4 KB.')}
          </Param>

          <h4 style={s.h4}>{t('developer.docs.paymentLinks.example', 'Example request')}</h4>
          <Code lang="bash">{`curl -X POST ${BASE_URL}/v1/payment-links \\
  -H "Cookie: gw_token=<your session>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Pro plan — monthly",
    "description": "Recurring subscription",
    "mode": "LIVE",
    "amountMode": "FIXED",
    "fixedAmount": 29.99,
    "currency": "USD",
    "maxUses": null,
    "successUrl": "https://yourstore.com/welcome",
    "metadata": { "plan": "pro" }
  }'`}</Code>

          <h4 style={s.h4}>{t('developer.docs.paymentLinks.response', 'Response')}</h4>
          <Code lang="json">{`{
  "success": true,
  "link": {
    "id": "ckxyz...",
    "code": "Y7M034CB2WYFG5KW",
    "title": "Pro plan — monthly",
    "mode": "LIVE",
    "amountMode": "FIXED",
    "fixedAmount": "29.99",
    "currency": "USD",
    "active": true,
    "usedCount": 0,
    "createdAt": "2026-06-23T07:00:00.000Z"
  },
  "shareUrl": "${PAYMENT_PAGE_URL}/l/Y7M034CB2WYFG5KW"
}`}</Code>

          <Endpoint method="GET" path="/v1/payment-links" auth="Session"
            description={t('developer.docs.paymentLinks.ep.list', 'List your links. Cursor-paginated; filter by ?mode= and ?active=.')} />
          <Endpoint method="GET" path="/v1/payment-links/:id" auth="Session"
            description={t('developer.docs.paymentLinks.ep.detail', 'Link detail + usage stats (total, confirmed, in-flight, USD volume) + 10 most-recent payments minted from this link.')} />
          <Endpoint method="PATCH" path="/v1/payment-links/:id" auth="Session"
            description={t('developer.docs.paymentLinks.ep.patch', 'Edit non-immutable fields: title, description, active, maxUses, expiresAt, success/cancelUrl, amount bounds, metadata. amountMode and mode cannot be changed — create a new link instead.')} />
          <Endpoint method="DELETE" path="/v1/payment-links/:id" auth="Session"
            description={t('developer.docs.paymentLinks.ep.delete', 'Soft-delete. The link 404s for customers immediately; historical payments minted from it remain intact in your dashboard.')} />

          {/* ── Customer flow ─────────────────────────────────────────── */}
          <h3 style={s.h3}>{t('developer.docs.paymentLinks.customerFlow', 'Customer flow')}</h3>
          <p style={s.text}>
            {t(
              'developer.docs.paymentLinks.flowBody',
              'A customer clicks your share URL. The public landing renders the link title, description, image, and either the fixed amount or an input. They press Pay — that mints a Payment row (with a paymentLinkId pointing back to your link) and bounces them to the standard hosted checkout. From there the existing payment lifecycle takes over: coin selection, deposit address + QR, confirmations, and the same set of webhook events you see on direct-API payments. The customer never knows they came in through a link.',
            )}
          </p>

          <div style={s.callout}>
            <strong>{t('developer.docs.paymentLinks.calloutTitle', 'Webhook tip')}</strong>
            {' — '}
            {t(
              'developer.docs.paymentLinks.calloutBody',
              'Every Payment created from a link carries paymentLinkId on the row + paymentLinkCode in metadata. Both surface in the webhook payload so you can split confirmations by source link without making an extra API call.',
            )}
          </div>
        </section>

        {/* ── Pricing & Fees ──────────────────────────────────────────── */}
        <section id="pricing" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.pricing', 'Pricing & Fees')}</h2>
          <p style={s.text}>
            {t(
              'developer.docs.pricing.intro',
              'GbitX charges a single, flat gateway fee on every CONFIRMED payment and the standard on-chain network fee when you withdraw crypto. There are no setup fees, monthly minimums, or hidden charges.',
            )}
          </p>

          <h3 style={s.h3}>{t('developer.docs.pricing.gatewayFeeTitle', 'Gateway fee')}</h3>
          <p style={s.text}>
            {t(
              'developer.docs.pricing.gatewayFeeBody',
              "The default rate is 1% of the crypto value of every CONFIRMED payment. The fee is automatically stamped on the Payment row the moment it confirms — no manual claim step, no separate sweep, no on-chain transaction. Your effective merchant balance reflects the post-fee amount instantly. It applies only to confirmed payments: PENDING, UNDERPAID, EXPIRED, CANCELLED and FAILED payments are free.",
            )}
          </p>
          <p style={s.text}>
            {t(
              'developer.docs.pricing.gatewayFeeCustom',
              "Your effective rate is shown on the Pricing page in your dashboard. High-volume partners can be on a custom rate — if so, the Pricing page will surface it explicitly.",
            )}
          </p>

          <h3 style={s.h3}>{t('developer.docs.pricing.withdrawalFeeTitle', 'Withdrawal fees')}</h3>
          <p style={s.text}>
            {t(
              'developer.docs.pricing.withdrawalFeeBody',
              "When you withdraw crypto from your gateway wallet, the standard on-chain network fee for the selected (network, coin) is deducted. These match the GbitX user wallet fee schedule exactly — see your Pricing page for the live table.",
            )}
          </p>
        </section>

        {/* ── Inline Checkout (iframe) ────────────────────────────────── */}
        <section id="inline-checkout" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.inlineCheckout', 'Inline Checkout (iframe)')}</h2>
          <p style={s.text}>
            {t('developer.docs.inlineIntro', 'Embed the GbitX payment page directly into your site as a modal or panel — no full-page redirect required. The customer never leaves your domain.')}
          </p>

          <h3 style={s.h3}>{t('developer.docs.quickStartRawIframe', 'Quick start (raw iframe)')}</h3>
          <p style={s.text}>
            <Trans
              i18nKey="developer.docs.rawIframeIntro"
              defaults="After creating a payment, drop the <code>paymentUrl</code> into an iframe. Add <code>?embed=1</code> to enable postMessage mode and <code>?parentOrigin=&lt;your-site-origin&gt;</code> to tell the page where to deliver events."
              components={{ code: CODE_COMPONENT }}
            />
          </p>
          <Code lang="html">{`<iframe
  src="${PAYMENT_PAGE_URL}/p/PAYMENT_ID?embed=1&parentOrigin=https%3A%2F%2Fyoursite.com#t=CANCEL_TOKEN"
  width="460"
  height="720"
  style="border:none;border-radius:16px;"
  allow="clipboard-write"
></iframe>`}</Code>

          <div style={s.warnCallout}>
            <Trans
              i18nKey="developer.docs.parentOriginRequired"
              defaults="<strong><code>parentOrigin</code> is required.</strong> Without it the page silently emits no postMessage events. This prevents random third parties from iframing arbitrary payment IDs to harvest event telemetry. The value must be the URL-encoded origin of the page hosting the iframe (https only — except <code>http://localhost</code> for development)."
              components={{ strong: STRONG_COMPONENT, code: CODE_COMPONENT }}
            />
          </div>

          <div style={s.callout}>
            <Trans
              i18nKey="developer.docs.useSdkInstead"
              defaults="<strong>For most merchants, use the JavaScript SDK below instead.</strong> It handles the iframe modal, the parentOrigin parameter, focus management, escape-to-close, and postMessage origin verification so you don't have to. The raw iframe approach is for advanced integrations only."
              components={{ strong: STRONG_COMPONENT }}
            />
          </div>

          <h3 style={s.h3}>{t('developer.docs.embedChangesPrefix', 'What')} <code style={s.inlineCode}>?embed=1</code> {t('developer.docs.embedChangesSuffix', 'changes')}</h3>
          <ul style={s.list}>
            <li>
              <Trans
                i18nKey="developer.docs.embedChange1"
                defaults="The page <strong>does not auto-redirect</strong> on confirmed/cancelled — you control next steps."
                components={{ strong: STRONG_COMPONENT }}
              />
            </li>
            <li>
              <Trans
                i18nKey="developer.docs.embedChange2"
                defaults="It emits <code>postMessage</code> events on terminal status changes (only when <code>parentOrigin</code> is also set)."
                components={{ code: CODE_COMPONENT }}
              />
            </li>
            <li>
              <Trans
                i18nKey="developer.docs.embedChange3"
                defaults='"Return to merchant" links become a "Close" button that emits a <code>gbitx:payment:closed</code> event.'
                components={{ code: CODE_COMPONENT }}
              />
            </li>
          </ul>

          <h3 style={s.h3}>{t('developer.docs.embedEvents', 'Embed events')}</h3>
          <p style={s.text}>
            <Trans
              i18nKey="developer.docs.embedEventsIntro"
              defaults="The iframe emits messages to <code>window.parent</code> via <code>postMessage</code>. <strong>Always verify the event origin equals <code>{{origin}}</code></strong> before trusting any event — otherwise a malicious script in your page could fake them."
              values={{ origin: PAYMENT_PAGE_URL }}
              components={{ strong: STRONG_COMPONENT, code: CODE_COMPONENT }}
            />
          </p>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t('developer.docs.col.eventType', 'Event type')}</th>
                <th style={s.th}>{t('developer.docs.col.whenFires', 'When it fires')}</th>
                <th style={s.th}>{t('developer.docs.col.payload', 'Payload')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={s.td}><code style={s.inlineCode}>gbitx:payment:loaded</code></td>
                <td style={s.td}>{t('developer.docs.event.loaded', 'Page mounted and ready (use to dismiss your loader).')}</td>
                <td style={s.td}>—</td>
              </tr>
              <tr>
                <td style={s.td}><code style={s.inlineCode}>gbitx:payment:confirmed</code></td>
                <td style={s.td}>{t('developer.docs.event.confirmed', 'Payment fully confirmed on-chain.')}</td>
                <td style={s.td}><code style={s.inlineCode}>{`{ payment }`}</code></td>
              </tr>
              <tr>
                <td style={s.td}><code style={s.inlineCode}>gbitx:payment:cancelled</code></td>
                <td style={s.td}>{t('developer.docs.event.cancelled', 'Customer cancelled the payment.')}</td>
                <td style={s.td}><code style={s.inlineCode}>{`{ payment }`}</code></td>
              </tr>
              <tr>
                <td style={s.td}><code style={s.inlineCode}>gbitx:payment:expired</code></td>
                <td style={s.td}>{t('developer.docs.event.expired', '60-minute window elapsed without confirmation.')}</td>
                <td style={s.td}><code style={s.inlineCode}>{`{ payment }`}</code></td>
              </tr>
              <tr>
                <td style={s.td}><code style={s.inlineCode}>gbitx:payment:failed</code></td>
                <td style={s.td}>{t('developer.docs.event.failed', 'Payment failed due to a system error.')}</td>
                <td style={s.td}><code style={s.inlineCode}>{`{ payment }`}</code></td>
              </tr>
              <tr>
                <td style={s.td}><code style={s.inlineCode}>gbitx:payment:closed</code></td>
                <td style={s.td}>{t('developer.docs.event.closed', 'Customer clicked the in-iframe "Close" button.')}</td>
                <td style={s.td}><code style={s.inlineCode}>{`{ payment }`}</code></td>
              </tr>
            </tbody>
          </table>

          <h3 style={s.h3}>{t('developer.docs.payloadShape', 'Payload shape')}</h3>
          <p style={s.text}>
            <Trans
              i18nKey="developer.docs.payloadShapeIntro"
              defaults="The <code>payment</code> object on each event omits sensitive fields: the deposit <code>address</code>, the <code>cancelToken</code>, your private <code>externalRef</code>, and the on-chain <code>txHash</code>. Those are intentionally not exposed to the parent window. Read them from the signed webhook your backend receives."
              components={{ code: CODE_COMPONENT }}
            />
          </p>
          <Code lang="json">{`{
  "id": "cmo2g79yg000511jh2mmck6im",
  "status": "CONFIRMED",
  "amount": "25.00",
  "currency": "USD",
  "crypto": "USDT",
  "network": "tron",
  "amountCrypto": "25.00000000",
  "amountPaid": "25.00000000",
  "mode": "LIVE",
  "confirmedAt": "2026-04-17T05:15:00.000Z",
  "expiresAt":   "2026-04-17T06:00:00.000Z"
}`}</Code>

          <div style={s.warnCallout}>
            <Trans
              i18nKey="developer.docs.webhooksSourceTruthEmbed"
              defaults="<strong>Webhooks remain the source of truth.</strong> Use <code>onSuccess</code> / postMessage events to update your UI, but <em>never</em> mark an order as paid in your database based on the JS event alone — a malicious customer can fake it from devtools. Mark orders paid only after verifying the signed webhook on your backend."
              components={{ strong: STRONG_COMPONENT, code: CODE_COMPONENT, em: <em /> }}
            />
          </div>
        </section>

        {/* ── JavaScript SDK ──────────────────────────────────────────── */}
        <section id="js-sdk" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.jsSdk', 'JavaScript SDK')}</h2>
          <p style={s.intro}>
            {t('developer.docs.sdkIntro', "The drop-in checkout. Six lines on the merchant's page = a fully-styled, mobile-responsive payment modal with focus trap, escape-to-close, and event callbacks.")}
          </p>

          <h3 style={s.h3}>{t('developer.docs.install', 'Install')}</h3>
          <Code lang="html">{`<script src="${SDK_URL}"></script>`}</Code>

          <h3 style={s.h3}>{t('developer.docs.quickExample', 'Quick example')}</h3>
          <Code lang="html">{`<button id="pay">Pay with Crypto</button>

<script>
  document.getElementById('pay').onclick = async () => {
    // 1. Your backend creates the payment and returns paymentUrl
    const res = await fetch('/api/create-payment', { method: 'POST' });
    const { paymentUrl } = await res.json();

    // 2. Open the SDK
    Gbitx.checkout.open({
      paymentUrl,
      onSuccess: (payment) => {
        window.location.href = '/order/success?id=' + payment.id;
      },
      onCancel: () => console.log('cancelled'),
      onClose:  () => console.log('modal closed'),
    });
  };
</script>`}</Code>

          <h3 style={s.h3}>API: <code style={s.inlineCode}>Gbitx.checkout.open(options)</code></h3>
          <p style={s.text}>
            <Trans
              i18nKey="developer.docs.sdkReturnsHandle"
              defaults="Returns a handle <code>{{handle}}</code> for programmatically dismissing the modal."
              values={{ handle: '{ close(reason?) }' }}
              components={{ code: CODE_COMPONENT }}
            />
          </p>

          <h4 style={s.h4}>{t('developer.docs.options', 'Options')}</h4>
          <Param name="paymentUrl" type="string">
            <Trans
              i18nKey="developer.docs.opt.paymentUrl"
              defaults="The full <code>paymentUrl</code> from the response of <code>POST /v1/payments</code>. Includes the cancel token. Either this <em>or</em> <code>paymentId</code> must be provided."
              components={{ code: CODE_COMPONENT, em: <em /> }}
            />
          </Param>
          <Param name="paymentId" type="string">
            <Trans
              i18nKey="developer.docs.opt.paymentId"
              defaults="Alternative to <code>paymentUrl</code>. Pair with <code>cancelToken</code> if you want the in-modal cancel button to work."
              components={{ code: CODE_COMPONENT }}
            />
          </Param>
          <Param name="cancelToken" type="string">
            <Trans
              i18nKey="developer.docs.opt.cancelToken"
              defaults="Used with <code>paymentId</code>. Without it, the customer cannot cancel from inside the modal."
              components={{ code: CODE_COMPONENT }}
            />
          </Param>
          <Param name="onLoaded" type="function">
            {t('developer.docs.opt.onLoaded', 'Fires once when the iframe is ready. Use it to hide your loading spinner.')}
          </Param>
          <Param name="onSuccess" type="function(payment)">
            <Trans
              i18nKey="developer.docs.opt.onSuccess"
              defaults="Fires on <code>CONFIRMED</code>. Receives the public payment object (no address, no cancel token)."
              components={{ code: CODE_COMPONENT }}
            />
          </Param>
          <Param name="onCancel" type="function(payment)">
            <Trans
              i18nKey="developer.docs.opt.onCancel"
              defaults="Fires on <code>CANCELLED</code>."
              components={{ code: CODE_COMPONENT }}
            />
          </Param>
          <Param name="onExpire" type="function(payment)">
            <Trans
              i18nKey="developer.docs.opt.onExpire"
              defaults="Fires on <code>EXPIRED</code>."
              components={{ code: CODE_COMPONENT }}
            />
          </Param>
          <Param name="onClose" type="function({ reason })">
            <Trans
              i18nKey="developer.docs.opt.onClose"
              defaults="Fires whenever the modal goes away. <code>reason</code> is one of: <code>'closed'</code> (in-iframe Close button), <code>'escape'</code> (Esc key), <code>'backdrop'</code> (clicked outside), <code>'programmatic'</code> (you called <code>handle.close()</code>)."
              components={{ code: CODE_COMPONENT }}
            />
          </Param>

          <h3 style={s.h3}>{t('developer.docs.programmaticClose', 'Programmatic close')}</h3>
          <Code lang="js">{`const handle = Gbitx.checkout.open({ paymentUrl, ... });

// Later, e.g., on a timeout:
handle.close();`}</Code>

          <h3 style={s.h3}>{t('developer.docs.versioningCaching', 'Versioning & caching')}</h3>
          <p style={s.text}>
            <Trans
              i18nKey="developer.docs.versioningBody"
              defaults="The SDK is served from <code>{{url}}</code> with a 5-minute browser cache and 24-hour CDN cache. Bug fixes and non-breaking improvements roll out automatically. Future breaking changes will ship at <code>/v2/checkout.js</code> and the v1 URL will continue to work indefinitely."
              values={{ url: SDK_URL }}
              components={{ code: CODE_COMPONENT }}
            />
          </p>

          <div style={s.warnCallout}>
            <Trans
              i18nKey="developer.docs.webhooksSourceTruthSdk"
              defaults="<strong>Webhooks are the source of truth.</strong> The <code>onSuccess</code> callback is for UX — closing the modal, updating the cart, navigating to a thank-you page. <em>Never</em> mark an order as paid in your database based on it alone. A malicious customer can fake this event from their browser console. Verify the signed webhook on your backend before fulfilling."
              components={{ strong: STRONG_COMPONENT, code: CODE_COMPONENT, em: <em /> }}
            />
          </div>
        </section>

        {/* ── Mobile (WebView) ────────────────────────────────────────── */}
        <section id="mobile-webview" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.mobileWebview', 'Mobile (WebView)')}</h2>
          <p style={s.text}>
            {t('developer.docs.mobileIntro', 'Native mobile apps integrate by embedding the payment page in a WebView and intercepting the redirect URL on completion. No native SDK is required — works on iOS, Android, React Native, and Flutter.')}
          </p>

          <h3 style={s.h3}>{t('developer.docs.pattern', 'Pattern')}</h3>
          <ol style={s.list}>
            <li>
              <Trans
                i18nKey="developer.docs.mobileStep1"
                defaults="Your app's backend calls <code>POST /v1/payments</code> and returns the <code>paymentUrl</code> to the app."
                components={{ code: CODE_COMPONENT }}
              />
            </li>
            <li>
              <Trans
                i18nKey="developer.docs.mobileStep2"
                defaults="The app opens the URL in a WebView (full screen, no <code>?embed=1</code> needed)."
                components={{ code: CODE_COMPONENT }}
              />
            </li>
            <li>
              <Trans
                i18nKey="developer.docs.mobileStep3"
                defaults="The WebView intercepts navigation. When the URL matches your <code>redirectUrl</code> or <code>cancelUrl</code>, dismiss the WebView and route in-app."
                components={{ code: CODE_COMPONENT }}
              />
            </li>
            <li>{t('developer.docs.mobileStep4', "Your backend receives the signed webhook independently — it's the source of truth for fulfilment.")}</li>
          </ol>

          <h3 style={s.h3}>{t('developer.docs.reactNative', 'React Native')}</h3>
          <Code lang="jsx">{`import { WebView } from 'react-native-webview';

function PaymentScreen({ paymentUrl, onDone, onCancel }) {
  return (
    <WebView
      source={{ uri: paymentUrl }}
      onShouldStartLoadWithRequest={(req) => {
        if (req.url.startsWith('https://yourapp.com/payment/success')) {
          onDone();
          return false;       // stop the WebView from loading it
        }
        if (req.url.startsWith('https://yourapp.com/payment/cancel')) {
          onCancel();
          return false;
        }
        return true;
      }}
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}`}</Code>

          <h3 style={s.h3}>{t('developer.docs.nativeIos', 'Native iOS (Swift / WKWebView)')}</h3>
          <Code lang="swift">{`import WebKit

class PaymentVC: UIViewController, WKNavigationDelegate {
  func webView(_ webView: WKWebView,
               decidePolicyFor navigationAction: WKNavigationAction,
               decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    let url = navigationAction.request.url?.absoluteString ?? ""
    if url.hasPrefix("https://yourapp.com/payment/success") {
      dismiss(animated: true); decisionHandler(.cancel); return
    }
    if url.hasPrefix("https://yourapp.com/payment/cancel") {
      dismiss(animated: true); decisionHandler(.cancel); return
    }
    decisionHandler(.allow)
  }
}`}</Code>

          <h3 style={s.h3}>{t('developer.docs.nativeAndroid', 'Native Android (Kotlin / WebView)')}</h3>
          <Code lang="kotlin">{`webView.webViewClient = object : WebViewClient() {
  override fun shouldOverrideUrlLoading(view: WebView, req: WebResourceRequest): Boolean {
    val url = req.url.toString()
    if (url.startsWith("https://yourapp.com/payment/success")) {
      finish(); return true
    }
    if (url.startsWith("https://yourapp.com/payment/cancel")) {
      finish(); return true
    }
    return false
  }
}
webView.settings.javaScriptEnabled = true
webView.settings.domStorageEnabled = true`}</Code>

          <div style={s.callout}>
            <Trans
              i18nKey="developer.docs.mobileTip"
              defaults="<strong>Tip:</strong> Use unique <code>redirectUrl</code> / <code>cancelUrl</code> values per app version (e.g., <code>https://yourapp.com/payment/success?v=1</code>) so old app versions don't accidentally intercept newer flows."
              components={{ strong: STRONG_COMPONENT, code: CODE_COMPONENT }}
            />
          </div>

          <div style={s.warnCallout}>
            <Trans
              i18nKey="developer.docs.webhooksSourceTruthMobile"
              defaults="<strong>Webhooks are the source of truth.</strong> The redirect URL fires from the customer's device — it can be tampered with. Always confirm payment status on your backend via the signed webhook before fulfilling the order."
              components={{ strong: STRONG_COMPONENT }}
            />
          </div>
        </section>

        {/* ── Webhooks ────────────────────────────────────────────────── */}
        <section id="webhooks" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.webhooks', 'Webhooks')}</h2>

          <div style={s.warnCallout}>
            <Trans
              i18nKey="developer.docs.webhooksSourceTruthMain"
              defaults="<strong>Webhooks are your source of truth.</strong> No matter which integration you use — REST, inline checkout, JavaScript SDK, or WebView — your backend should mark orders as paid only after verifying a signed webhook from us. Browser callbacks and redirect URLs run on the customer's device and can be tampered with."
              components={{ strong: STRONG_COMPONENT }}
            />
          </div>

          <p style={s.text}>
            {t('developer.docs.webhooksConfigure', "Webhooks notify your server in real-time when a payment status changes. Configure your webhook URL in the Webhooks tab of your dashboard. You'll receive a secret — save it to verify webhook signatures.")}
          </p>

          <h3 style={s.h3}>{t('developer.docs.webhookEvents', 'Webhook events')}</h3>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t('developer.docs.col.event', 'Event')}</th>
                <th style={s.th}>{t('developer.docs.col.description', 'Description')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={s.td}><code style={s.inlineCode}>PAYMENT_CREATED</code></td><td style={s.td}>{t('developer.docs.wh.created', 'Payment request created.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>PAYMENT_PENDING</code></td><td style={s.td}>{t('developer.docs.wh.pending', 'Customer selected a coin. Address assigned.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>PAYMENT_UNDERPAID</code></td><td style={s.td}>{t('developer.docs.wh.underpaid', 'Amount received is less than required.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>PAYMENT_CONFIRMING</code></td><td style={s.td}>{t('developer.docs.wh.confirming', 'Correct amount received. Awaiting confirmations.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>PAYMENT_CONFIRMED</code></td><td style={s.td}>{t('developer.docs.wh.confirmed', 'Payment fully confirmed on-chain.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>PAYMENT_EXPIRED</code></td><td style={s.td}>{t('developer.docs.wh.expired', 'Payment expired with no payment received.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>PAYMENT_EXPIRED_UNDERPAID</code></td><td style={s.td}>{t('developer.docs.wh.expiredUnderpaid', 'Payment expired but partial funds were received.')}</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>PAYMENT_CANCELLED</code></td><td style={s.td}>{t('developer.docs.wh.cancelled', 'Customer cancelled the payment.')}</td></tr>
            </tbody>
          </table>

          <h3 style={s.h3}>{t('developer.docs.webhookPayload', 'Webhook payload')}</h3>
          <Code lang="json">{`{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "cmo2g79yg000511jh2mmck6im",
    "externalRef": "order_1234",
    "amount": "25.00",
    "currency": "USD",
    "crypto": "USDT",
    "network": "tron",
    "address": "TXqZ3...",
    "amountCrypto": "25.00000000",
    "amountPaid": "25.00000000",
    "status": "CONFIRMED",
    "txHash": "abc123...",
    "mode": "SANDBOX",
    "expiresAt": "2026-04-17T06:00:00.000Z",
    "confirmedAt": "2026-04-17T05:15:00.000Z",
    "createdAt": "2026-04-17T05:00:00.000Z"
  },
  "timestamp": "2026-04-17T05:15:01.000Z"
}`}</Code>

          <h3 style={s.h3}>{t('developer.docs.webhookHeaders', 'Webhook headers')}</h3>
          <table style={s.table}>
            <thead>
              <tr><th style={s.th}>{t('developer.docs.col.header', 'Header')}</th><th style={s.th}>{t('developer.docs.col.value', 'Value')}</th></tr>
            </thead>
            <tbody>
              <tr><td style={s.td}><code style={s.inlineCode}>Content-Type</code></td><td style={s.td}>application/json</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>X-GbitX-Signature</code></td><td style={s.td}>t=&lt;unix_ts&gt;,v1=&lt;hmac_hex&gt;</td></tr>
              <tr><td style={s.td}><code style={s.inlineCode}>User-Agent</code></td><td style={s.td}>GbitX-Gateway/1.0</td></tr>
            </tbody>
          </table>
          <p style={s.text}>
            <Trans
              i18nKey="developer.docs.tValueExplain"
              defaults="The <code>t</code> value is the unix timestamp (in seconds) at which we sent this delivery attempt — every retry generates a fresh timestamp, so legitimate retries hours later still pass verification. <code>v1</code> is the HMAC-SHA256 of <code>{{tpl}}</code> using your webhook secret."
              values={{ tpl: '{timestamp}.{body}' }}
              components={{ code: CODE_COMPONENT }}
            />
          </p>

          <h3 style={s.h3}>{t('developer.docs.retryPolicy', 'Retry policy')}</h3>
          <p style={s.text}>
            {t('developer.docs.retryIntro', "If your server doesn't respond with a 2xx status, we retry up to 5 times with increasing delays:")}
          </p>
          <table style={s.table}>
            <thead>
              <tr><th style={s.th}>{t('developer.docs.col.attempt', 'Attempt')}</th><th style={s.th}>{t('developer.docs.col.delay', 'Delay')}</th></tr>
            </thead>
            <tbody>
              <tr><td style={s.td}>1</td><td style={s.td}>{t('developer.docs.delay.1min', '1 minute')}</td></tr>
              <tr><td style={s.td}>2</td><td style={s.td}>{t('developer.docs.delay.5min', '5 minutes')}</td></tr>
              <tr><td style={s.td}>3</td><td style={s.td}>{t('developer.docs.delay.30min', '30 minutes')}</td></tr>
              <tr><td style={s.td}>4</td><td style={s.td}>{t('developer.docs.delay.2h', '2 hours')}</td></tr>
              <tr><td style={s.td}>5</td><td style={s.td}>{t('developer.docs.delay.24h', '24 hours')}</td></tr>
            </tbody>
          </table>

          <div style={s.callout}>
            <strong>{t('developer.docs.requirements', 'Requirements:')}</strong>
            <ul style={s.list}>
              <li>{t('developer.docs.req.https', 'Your webhook URL must use HTTPS.')}</li>
              <li>{t('developer.docs.req.respond10', 'Must respond within 10 seconds.')}</li>
              <li>{t('developer.docs.req.return2xx', 'Must return a 2xx status code.')}</li>
              <li>{t('developer.docs.req.deliveryLogs', 'You can view delivery logs in the Webhooks tab of your dashboard.')}</li>
            </ul>
          </div>
        </section>

        {/* ── Verify Webhooks ─────────────────────────────────────────── */}
        <section id="webhook-verify" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.verifyWebhookSignatures', 'Verify Webhook Signatures')}</h2>
          <p style={s.text}>
            <Trans
              i18nKey="developer.docs.verifyIntro"
              defaults="Always verify the <code>X-GbitX-Signature</code> header before trusting a webhook. The header has the format <code>t=&lt;unix_ts&gt;,v1=&lt;hmac_hex&gt;</code>. Verification has <strong>two independent checks</strong>, and both must pass:"
              components={{ strong: STRONG_COMPONENT, code: CODE_COMPONENT }}
            />
          </p>
          <ol style={s.list}>
            <li>
              <Trans
                i18nKey="developer.docs.verifyCheck1"
                defaults="<strong>Signature</strong>: <code>v1</code> is the HMAC-SHA256 of <code>{{tpl}}</code> using your webhook secret as the key — this proves the request came from GbitX and the body wasn't tampered with."
                values={{ tpl: '${t}.${rawBody}' }}
                components={{ strong: STRONG_COMPONENT, code: CODE_COMPONENT }}
              />
            </li>
            <li>
              <Trans
                i18nKey="developer.docs.verifyCheck2"
                defaults="<strong>Freshness</strong>: <code>t</code> must be within <strong>±5 minutes</strong> of your server's current time — this defeats replay attacks where an attacker captures a webhook and tries to re-send it later."
                components={{ strong: STRONG_COMPONENT, code: CODE_COMPONENT }}
              />
            </li>
          </ol>
          <p style={s.text}>
            {t('developer.docs.clockSync', "Make sure your server's clock is synchronized via NTP. If your server's clock drifts by more than a few minutes, legitimate webhooks will be rejected as stale.")}
          </p>

          <h3 style={s.h3}>{t('developer.docs.nodejs', 'Node.js')}</h3>
          <Code lang="javascript">{`const crypto = require('crypto');

const TOLERANCE_SECONDS = 300; // ±5 minutes

function verifyWebhook(rawBody, signatureHeader, secret) {
  // Header format: "t=1714316400,v1=abc123..."
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => {
      const i = p.indexOf('=');
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    })
  );
  const timestamp = parseInt(parts.t, 10);
  const received = parts.v1;
  if (!timestamp || !received) return false;

  // 1. Freshness — reject anything more than 5 minutes old
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) return false;

  // 2. Signature — HMAC-SHA256 of "{timestamp}.{rawBody}"
  const expected = crypto
    .createHmac('sha256', secret)
    .update(\`\${timestamp}.\${rawBody}\`)
    .digest('hex');

  // Constant-time comparison
  const a = Buffer.from(received, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Express example
app.post('/webhooks/gbitx', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-gbitx-signature'];
  const isValid = verifyWebhook(req.body, signature, 'whsec_your_secret');

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body);
  console.log('Payment event:', event.event, event.payment.id);

  // Handle the event
  if (event.event === 'PAYMENT_CONFIRMED') {
    // Fulfill the order
  }

  res.status(200).send('OK');
});`}</Code>

          <h3 style={s.h3}>{t('developer.docs.python', 'Python')}</h3>
          <Code lang="python">{`import hmac
import hashlib
import time
from flask import Flask, request

app = Flask(__name__)
WEBHOOK_SECRET = 'whsec_your_secret'
TOLERANCE_SECONDS = 300  # ±5 minutes

def verify_webhook(raw_body, signature_header, secret):
    # Header format: "t=1714316400,v1=abc123..."
    parts = {}
    for segment in signature_header.split(','):
        key, _, value = segment.partition('=')
        parts[key.strip()] = value.strip()

    try:
        timestamp = int(parts.get('t', ''))
    except ValueError:
        return False
    received = parts.get('v1', '')
    if not timestamp or not received:
        return False

    # 1. Freshness
    if abs(int(time.time()) - timestamp) > TOLERANCE_SECONDS:
        return False

    # 2. Signature — HMAC-SHA256 of "{timestamp}.{raw_body}"
    signed = f"{timestamp}.".encode() + raw_body
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    return hmac.compare_digest(received, expected)

@app.route('/webhooks/gbitx', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-GbitX-Signature', '')

    if not verify_webhook(request.data, signature, WEBHOOK_SECRET):
        return 'Invalid signature', 401

    event = request.json
    print(f"Payment event: {event['event']} {event['payment']['id']}")

    if event['event'] == 'PAYMENT_CONFIRMED':
        # Fulfill the order
        pass

    return 'OK', 200`}</Code>

          <h3 style={s.h3}>{t('developer.docs.php', 'PHP')}</h3>
          <Code lang="php">{`<?php

$webhookSecret = 'whsec_your_secret';
$tolerance = 300; // ±5 minutes
$rawBody = file_get_contents('php://input');
$signatureHeader = $_SERVER['HTTP_X_GBITX_SIGNATURE'] ?? '';

// Header format: "t=1714316400,v1=abc123..."
$parts = [];
foreach (explode(',', $signatureHeader) as $segment) {
    $kv = explode('=', $segment, 2);
    if (count($kv) === 2) {
        $parts[trim($kv[0])] = trim($kv[1]);
    }
}

$timestamp = isset($parts['t']) ? (int) $parts['t'] : 0;
$received = $parts['v1'] ?? '';
if (!$timestamp || !$received) {
    http_response_code(401);
    echo 'Invalid signature';
    exit;
}

// 1. Freshness
if (abs(time() - $timestamp) > $tolerance) {
    http_response_code(401);
    echo 'Signature timestamp out of range';
    exit;
}

// 2. Signature — HMAC-SHA256 of "{timestamp}.{rawBody}"
$expected = hash_hmac('sha256', $timestamp . '.' . $rawBody, $webhookSecret);
if (!hash_equals($expected, $received)) {
    http_response_code(401);
    echo 'Invalid signature';
    exit;
}

$event = json_decode($rawBody, true);
error_log("Payment event: " . $event['event'] . " " . $event['payment']['id']);

if ($event['event'] === 'PAYMENT_CONFIRMED') {
    // Fulfill the order
}

http_response_code(200);
echo 'OK';`}</Code>

          <div style={s.warnCallout}>
            <Trans
              i18nKey="developer.docs.rawBodyImportant"
              defaults="<strong>Important:</strong> Use the raw request body for signature verification, not a parsed/re-serialized version. JSON re-serialization can change whitespace or key order, breaking the signature."
              components={{ strong: STRONG_COMPONENT }}
            />
          </div>
        </section>

        {/* ── Coins & Rates ───────────────────────────────────────────── */}
        <section id="coins-rates" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.coinsRates', 'Coins & Rates')}</h2>
          <p style={s.text}>{t('developer.docs.publicEndpointsIntro', "These public endpoints don't require authentication.")}</p>

          <Endpoint method="GET" path="/v1/coins" description={t('developer.docs.ep.getCoins', 'Get all supported cryptocurrencies and their networks.')} />
          <Code lang="json">{`{
  "success": true,
  "coins": [
    {
      "symbol": "BTC",
      "networks": [{ "network": "bitcoin", "label": "Bitcoin", "symbol": "BTC" }]
    },
    {
      "symbol": "USDT",
      "networks": [
        { "network": "tron", "label": "TRC20 (Tron)", "symbol": "USDT" },
        { "network": "ethereum", "label": "ERC20 (Ethereum)", "symbol": "USDT" },
        { "network": "solana", "label": "SPL (Solana)", "symbol": "USDT" }
      ]
    }
  ]
}`}</Code>

          <div style={s.divider} />

          <Endpoint method="GET" path="/v1/rates?currency=USD" description={t('developer.docs.ep.getRates', 'Get live crypto prices in any supported fiat currency.')} />
          <Code lang="json">{`{
  "success": true,
  "currency": "USD",
  "prices": {
    "BTC": 84250.00,
    "ETH": 3420.50,
    "USDT": 1.00,
    "USDC": 1.00,
    "BNB": 610.30,
    "SOL": 178.90,
    "LTC": 85.40,
    "TRX": 0.125
  }
}`}</Code>

          <div style={s.divider} />

          <Endpoint method="GET" path="/v1/currencies" description={t('developer.docs.ep.getCurrencies', 'List all supported fiat currencies.')} />
          <Code lang="json">{`{
  "success": true,
  "currencies": ["USD", "EUR", "GBP", "GHS", "NGN", "KES", "ZAR", ...]
}`}</Code>

          <h3 style={s.h3}>{t('developer.docs.supportedCryptos', 'Supported cryptocurrencies')}</h3>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t('developer.docs.col.coin', 'Coin')}</th>
                <th style={s.th}>{t('developer.docs.col.networks', 'Networks')}</th>
                <th style={s.th}>{t('developer.docs.col.confirmations', 'Confirmations')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={s.td}>BTC</td><td style={s.td}>Bitcoin</td><td style={s.td}>2</td></tr>
              <tr><td style={s.td}>ETH</td><td style={s.td}>Ethereum</td><td style={s.td}>12</td></tr>
              <tr><td style={s.td}>BNB</td><td style={s.td}>BNB Smart Chain</td><td style={s.td}>12</td></tr>
              <tr><td style={s.td}>USDT</td><td style={s.td}>Tron, Ethereum, Solana</td><td style={s.td}>5</td></tr>
              <tr><td style={s.td}>USDC</td><td style={s.td}>Ethereum, Solana</td><td style={s.td}>5</td></tr>
              <tr><td style={s.td}>SOL</td><td style={s.td}>Solana</td><td style={s.td}>5</td></tr>
              <tr><td style={s.td}>LTC</td><td style={s.td}>Litecoin</td><td style={s.td}>6</td></tr>
              <tr><td style={s.td}>TRX</td><td style={s.td}>Tron</td><td style={s.td}>5</td></tr>
            </tbody>
          </table>
        </section>

        {/* ── Errors ──────────────────────────────────────────────────── */}
        <section id="errors" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.errors', 'Errors')}</h2>
          <p style={s.text}>
            {t('developer.docs.errorsIntro', 'All error responses follow a consistent format:')}
          </p>
          <Code lang="json">{`{
  "success": false,
  "message": "Description of what went wrong"
}`}</Code>

          <h3 style={s.h3}>{t('developer.docs.httpStatusCodes', 'HTTP status codes')}</h3>
          <table style={s.table}>
            <thead>
              <tr><th style={s.th}>{t('developer.docs.col.code', 'Code')}</th><th style={s.th}>{t('developer.docs.col.meaning', 'Meaning')}</th></tr>
            </thead>
            <tbody>
              <tr><td style={s.td}>200</td><td style={s.td}>{t('developer.docs.http.200', 'Success')}</td></tr>
              <tr><td style={s.td}>201</td><td style={s.td}>{t('developer.docs.http.201', 'Created (new payment or API key)')}</td></tr>
              <tr><td style={s.td}>400</td><td style={s.td}>{t('developer.docs.http.400', 'Bad request — check your request body or parameters')}</td></tr>
              <tr><td style={s.td}>401</td><td style={s.td}>{t('developer.docs.http.401', 'Unauthorized — missing or invalid API key')}</td></tr>
              <tr><td style={s.td}>403</td><td style={s.td}>{t('developer.docs.http.403', 'Forbidden — your account is suspended or key is revoked')}</td></tr>
              <tr><td style={s.td}>404</td><td style={s.td}>{t('developer.docs.http.404', 'Resource not found')}</td></tr>
              <tr><td style={s.td}>429</td><td style={s.td}>{t('developer.docs.http.429', 'Rate limited — slow down')}</td></tr>
              <tr><td style={s.td}>500</td><td style={s.td}>{t('developer.docs.http.500', 'Server error — try again or contact support')}</td></tr>
            </tbody>
          </table>
        </section>

        {/* ── Rate Limits ─────────────────────────────────────────────── */}
        <section id="rate-limits" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.rateLimits', 'Rate Limits')}</h2>
          <p style={s.text}>
            {t('developer.docs.rateLimitsIntro', "Rate limits protect the API from abuse. Limits are applied per merchant or per IP address. When rate limited, you'll receive a 429 response.")}
          </p>

          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>{t('developer.docs.col.endpoint', 'Endpoint')}</th>
                <th style={s.th}>{t('developer.docs.col.limit', 'Limit')}</th>
                <th style={s.th}>{t('developer.docs.col.window', 'Window')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={s.td}>POST /v1/payments</td><td style={s.td}>{t('developer.docs.rl.60req', '60 requests')}</td><td style={s.td}>{t('developer.docs.rl.1min', '1 minute')}</td></tr>
              <tr><td style={s.td}>GET /v1/payments</td><td style={s.td}>{t('developer.docs.rl.60req', '60 requests')}</td><td style={s.td}>{t('developer.docs.rl.1min', '1 minute')}</td></tr>
              <tr><td style={s.td}>{t('developer.docs.rl.publicLabel', 'Public endpoints (/v1/coins, /v1/rates)')}</td><td style={s.td}>{t('developer.docs.rl.120req', '120 requests')}</td><td style={s.td}>{t('developer.docs.rl.1min', '1 minute')}</td></tr>
              <tr><td style={s.td}>{t('developer.docs.rl.apiKeyMgmt', 'API key management')}</td><td style={s.td}>{t('developer.docs.rl.20req', '20 requests')}</td><td style={s.td}>{t('developer.docs.rl.15min', '15 minutes')}</td></tr>
              <tr><td style={s.td}>{t('developer.docs.rl.webhookMgmt', 'Webhook management')}</td><td style={s.td}>{t('developer.docs.rl.20req', '20 requests')}</td><td style={s.td}>{t('developer.docs.rl.15min', '15 minutes')}</td></tr>
            </tbody>
          </table>

          <div style={s.callout}>
            {t('developer.docs.rlHeadersIntro', 'Rate limit headers are included in every response:')}
            <ul style={s.list}>
              <li>
                <Trans
                  i18nKey="developer.docs.rl.limitHdr"
                  defaults="<code>RateLimit-Limit</code> — Maximum requests in the window"
                  components={{ code: CODE_COMPONENT }}
                />
              </li>
              <li>
                <Trans
                  i18nKey="developer.docs.rl.remainingHdr"
                  defaults="<code>RateLimit-Remaining</code> — Requests remaining"
                  components={{ code: CODE_COMPONENT }}
                />
              </li>
              <li>
                <Trans
                  i18nKey="developer.docs.rl.resetHdr"
                  defaults="<code>RateLimit-Reset</code> — Seconds until the window resets"
                  components={{ code: CODE_COMPONENT }}
                />
              </li>
            </ul>
          </div>
        </section>

        {/* ── Postman Collection ──────────────────────────────────────── */}
        <section id="postman" style={s.section}>
          <h2 style={s.h2}>{t('developer.docs.nav.postman', 'Postman Collection')}</h2>
          <p style={s.text}>
            {t('developer.docs.postmanIntro', 'Import this collection into Postman or Thunder Client to test all API endpoints instantly.')}
          </p>

          <div style={s.stepsGrid}>
            <div style={s.step}>
              <div style={s.stepNum}>1</div>
              <h3 style={s.stepTitle}>{t('developer.docs.postman1Title', 'Copy the JSON')}</h3>
              <p style={s.stepText}>{t('developer.docs.postman1Text', 'Click "Copy" on the collection below.')}</p>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>2</div>
              <h3 style={s.stepTitle}>{t('developer.docs.postman2Title', 'Open Postman')}</h3>
              <p style={s.stepText}>{t('developer.docs.postman2Text', 'Go to File → Import → Raw Text, paste and import.')}</p>
            </div>
            <div style={s.step}>
              <div style={s.stepNum}>3</div>
              <h3 style={s.stepTitle}>{t('developer.docs.postman3Title', 'Set your API key')}</h3>
              <p style={s.stepText}>{t('developer.docs.postman3Text', 'Edit the collection variables and add your test API key.')}</p>
            </div>
          </div>

          <Code lang="json">{JSON.stringify({
  info: {
    name: "GbitX Pay API",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "baseUrl", value: BASE_URL },
    { key: "apiKey", value: "gk_test_your_api_key_here" }
  ],
  auth: {
    type: "bearer",
    bearer: [{ key: "token", value: "{{apiKey}}" }]
  },
  item: [
    {
      name: "Create Payment",
      request: {
        method: "POST",
        url: "{{baseUrl}}/v1/payments",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            amount: 25.00,
            currency: "USD",
            description: "Test payment",
            redirectUrl: "https://example.com/success",
            cancelUrl: "https://example.com/cancel",
            externalRef: "order_001"
          }, null, 2)
        }
      }
    },
    {
      name: "Get Payment",
      request: {
        method: "GET",
        url: "{{baseUrl}}/v1/payments/PAYMENT_ID_HERE"
      }
    },
    {
      name: "List Payments",
      request: {
        method: "GET",
        url: {
          raw: "{{baseUrl}}/v1/payments?limit=20&offset=0",
          query: [
            { key: "limit", value: "20" },
            { key: "offset", value: "0" },
            { key: "status", value: "", disabled: true },
            { key: "mode", value: "", disabled: true }
          ]
        }
      }
    },
    {
      name: "Get Supported Coins",
      request: {
        method: "GET",
        url: "{{baseUrl}}/v1/coins",
        auth: { type: "noauth" }
      }
    },
    {
      name: "Get Live Rates",
      request: {
        method: "GET",
        url: {
          raw: "{{baseUrl}}/v1/rates?currency=USD",
          query: [{ key: "currency", value: "USD" }]
        },
        auth: { type: "noauth" }
      }
    },
    {
      name: "Get Supported Currencies",
      request: {
        method: "GET",
        url: "{{baseUrl}}/v1/currencies",
        auth: { type: "noauth" }
      }
    }
  ]
}, null, 2)}</Code>
        </section>

        {/* Footer */}
        <div style={s.footer}>
          <p>{t('developer.docs.needHelpPrefix', 'Need help? Contact us at')} <strong>support@gbitx.com</strong></p>
        </div>
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = {
  // Standalone topbar (kept for the public /docs route — unused inside
  // the gbitxpay dashboard shell but harmless to keep around).
  standaloneTopbar: { display: 'flex', justifyContent: 'flex-end', padding: '14px 32px 0' },

  // Two-column layout that lives INSIDE the dashboard's scrolling
  // <main>. The sidebar sticks to top:0 of that scroll container
  // (top:0 is fine — main's visible region starts below the page
  // header, so the sidebar visually anchors there). Content scrolls
  // naturally with the dashboard's main. No nested overflow needed.
  container: {
    display: 'flex',
    gap: 0,
    // Standalone (doc.gbitx.com): no parent padding to cancel. The
    // legacy in-dashboard build used margin:-32px here to reach the
    // dashboard <main>'s edges; that negative margin yanked content
    // off the left edge once we lifted the page into its own app.
    // Full-viewport-width is now intrinsic — no margin trick needed.
    width: '100%',
    minHeight: '100vh',
  },
  sidebar: {
    width: 220,
    flexShrink: 0,
    borderRight: '1px solid var(--border)',
    padding: '24px 0',
    background: 'var(--surface)',
    // Sticky to the scrolling ancestor (dashboard main). alignSelf
    // flex-start keeps it from stretching when content is shorter
    // than the sidebar. maxHeight + overflow let the sidebar scroll
    // independently if SECTIONS grows past one viewport.
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
    maxHeight: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  sidebarTitle: {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-faint)', padding: '0 16px 12px',
  },
  navItem: {
    display: 'block', width: '100%', padding: '8px 16px', fontSize: 13,
    color: 'var(--text-muted)', background: 'none', border: 'none',
    textAlign: 'left', cursor: 'pointer',
    borderLeft: '2px solid transparent', transition: 'all 0.15s',
  },
  navItemActive: {
    color: 'var(--brand)', borderLeftColor: 'var(--brand)',
    background: 'var(--brand-soft)', fontWeight: 600,
  },

  // Right column — content scrolls with the dashboard <main>; no
  // overflow here so sticky in the sibling sidebar can reach the
  // outer scroll container. minWidth:0 lets the flex child shrink
  // below its intrinsic content width — required for long code
  // lines (which scroll internally on .pre) not to push the
  // entire row wider than the dashboard's padding box.
  content: {
    flex: 1,
    minWidth: 0,
    padding: '24px 32px',
    maxWidth: 900,
  },
  section: {
    paddingBottom: 48,
    marginBottom: 48,
    borderBottom: '1px solid var(--border-soft)',
  },
  h1:  { fontSize: 28, fontWeight: 700, color: 'var(--text)',     margin: '0 0 12px' },
  h2:  { fontSize: 22, fontWeight: 700, color: 'var(--text)',     margin: '0 0 12px' },
  h3:  { fontSize: 16, fontWeight: 600, color: 'var(--text)',     margin: '24px 0 8px' },
  h4:  { fontSize: 14, fontWeight: 600, color: 'var(--text)',     margin: '20px 0 8px' },
  intro: { fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 24px' },
  text:  { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 16px' },

  // Steps grid — light cards
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, margin: '20px 0 28px' },
  step: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 },
  stepNum: {
    width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)',
    color: '#FFFFFF', fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  stepTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)',       margin: '0 0 4px' },
  stepText:  { fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 },

  // Code blocks — INTENTIONALLY dark even on a light theme. Industry
  // convention (Stripe, Twilio, AWS) — syntax-highlighted code reads
  // better against a dark background and gives the page rhythm.
  codeWrap: {
    background: '#0F172A', border: '1px solid #0F172A', borderRadius: 8,
    margin: '12px 0 16px', overflow: 'hidden',
  },
  codeHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 12px', borderBottom: '1px solid #1E293B', background: '#0B1220',
  },
  codeLang: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  copyBtn:  {
    fontSize: 11, color: '#CBD5E1', background: 'rgba(255,255,255,0.06)',
    border: '1px solid #334155', borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
  },
  pre: { margin: 0, padding: 16, overflow: 'auto', fontSize: 13, lineHeight: 1.6, color: '#E2E8F0', fontFamily: 'monospace' },

  // Endpoint blocks — light card with a tiny mono-styled path
  endpoint: { margin: '20px 0 16px', padding: 16, background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 8 },
  endpointRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  methodBadge: { color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.03em' },
  pathCode: { fontSize: 14, color: 'var(--text)', fontFamily: 'monospace' },
  authBadge: { fontSize: 10, color: 'var(--brand)', border: '1px solid var(--brand)', borderRadius: 4, padding: '2px 6px' },
  endpointDesc: { fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0' },

  // Params
  param: { padding: '10px 0', borderBottom: '1px solid var(--border-soft)' },
  paramName: { fontSize: 13, color: 'var(--text)',       fontFamily: 'monospace', fontWeight: 600 },
  paramType: { fontSize: 11, color: 'var(--text-faint)', marginLeft: 8 },
  paramReq:  { fontSize: 10, color: 'var(--danger)',     marginLeft: 8, fontWeight: 600, textTransform: 'uppercase' },
  paramDesc: { fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 },

  // Tables
  table: { width: '100%', borderCollapse: 'collapse', margin: '12px 0 16px', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid var(--border)',      color: 'var(--text-faint)', fontWeight: 600, fontSize: 12 },
  td: { padding: '10px 12px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)' },

  // Callouts (light cards with coloured accent borders)
  callout:     { background: 'var(--info-soft)',    border: '1px solid var(--border)', borderLeft: '3px solid var(--info)',    borderRadius: 6, padding: 16, margin: '16px 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 },
  warnCallout: { background: 'var(--danger-soft)',  border: '1px solid var(--border)', borderLeft: '3px solid var(--danger)',  borderRadius: 6, padding: 16, margin: '16px 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 },
  inlineCode:  { background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 3, fontSize: 12, fontFamily: 'monospace', color: 'var(--text)' },
  list: { margin: '8px 0 0', paddingLeft: 20 },

  // Status pills + lifecycle arrows
  lifecycle:  { margin: '12px 0 20px', overflow: 'auto' },
  statusFlow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  statusPill: { color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12 },
  arrow:      { color: 'var(--text-faint)', fontSize: 16 },

  divider: { borderTop: '1px solid var(--border-soft)', margin: '28px 0' },
  footer:  { padding: '32px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 },
};
