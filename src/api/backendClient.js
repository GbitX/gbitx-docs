import axios from 'axios';

// Axios client for api.gbitx.com (backendOnly).
//
// Used ONLY for auth flows (signup, login, email verify, forgot password,
// /gateway-token exchange). Backend session is set as an httpOnly cookie
// on the api.gbitx.com origin via the existing auth endpoints — we never
// see or store the cookie value.
//
// All endpoints called here are pre-existing on backendOnly. This client
// does not add, modify, or remove any backend endpoint.

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.gbitx.com';

export const backendClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // include cookies — required for /gateway-token after login
  timeout: 15000,
});

// ── STRICT AUDIENCE BOUNDARY ──
// Every auth-related request from pay.gbitx.com flags itself as
// audience='merchant'. backendOnly's /auth/login, /auth/register-init,
// /auth/verify-code, /auth/verify-registration, /auth/refresh, and
// /auth/logout all branch on this to set DIFFERENT cookies
// (merchantAccessToken / merchantRefreshToken) instead of the
// consumer pair (accessToken / refreshToken).
//
// Consequence: a user logged into the consumer side at gbitx.com
// who visits pay.gbitx.com does NOT auto-bridge into a merchant
// session. /gateway-token requires the merchant cookie — which
// they don't have — so they 401 and see the landing page.
//
// Done as an interceptor (not at each call site) so the boundary
// is enforced uniformly: any future auth call we add to this
// codebase automatically inherits the flag. No "we forgot to add
// audience on the new endpoint" footguns.
backendClient.interceptors.request.use((config) => {
  // Only inject on /auth/* paths — language sync, gateway-token, etc.
  // don't need or read the audience field. Keep noise off other
  // requests so we don't risk colliding with a future field name.
  const url = config.url || '';
  if (!url.startsWith('/auth/')) return config;

  // Only inject if there's a body shape that can carry it (POST/PUT/PATCH).
  // GET requests aren't currently audience-aware.
  const method = (config.method || 'get').toLowerCase();
  if (!['post', 'put', 'patch'].includes(method)) return config;

  // Don't overwrite if a caller explicitly passed audience (future-proof
  // for, e.g., an account-switcher that flips audience deliberately).
  const body = config.data || {};
  if (typeof body === 'object' && !('audience' in body)) {
    config.data = { ...body, audience: 'merchant' };
  }
  return config;
});

export { BACKEND_URL };
