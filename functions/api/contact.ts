/**
 * Cloudflare Pages Function: POST /api/contact
 * Sends mail via Resend using server-only secrets (never VITE_*).
 * No database → no SQL; inputs are validated as plain strings before HTTP to Resend.
 */

import { jsonResponse } from '../lib/responseHeaders';

export interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  /** Verified sender in Resend, e.g. "Portfolio <mail@yourdomain.com>" */
  CONTACT_FROM?: string;
  /** If set, `cf-turnstile-response` is required and verified */
  TURNSTILE_SECRET?: string;
  /** If "1" / "true", worker requires TURNSTILE_SECRET + token on every POST (recommended production) */
  CONTACT_REQUIRE_TURNSTILE?: string;
  /**
   * Comma-separated ISO 3166-1 alpha-2 country codes (e.g. US). Empty = skip geo.
   * Set to US for US-only submissions (uses request.cf.country on Cloudflare edge).
   */
  CONTACT_ALLOWED_COUNTRIES?: string;
  /** Comma-separated exact origins, e.g. https://yoursite.pages.dev,https://yoursite.com */
  ALLOWED_ORIGINS?: string;
  /** Optional KV for per-IP rate limits (minute + hour). Strongly recommended for production */
  CONTACT_RATE_LIMIT?: KVNamespace;
}

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
  'cf-turnstile-response'?: unknown;
};

const MAX_BODY_BYTES = 24_576;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 8_000;
const RATE_HOUR_MS = 3_600_000;
const RATE_MINUTE_MS = 60_000;
/** Per IP within KV bindings */
const RL_MAX_PER_MINUTE = 3;
const RL_MAX_PER_HOUR = 6;

/**
 * Disposable / throwaway domains (lowercase); extend as needed.
 * Legit inbox domains must resolve MX via DNS-over-HTTPS below.
 */
const DISPOSABLE_DOMAINS = new Set(
  [
    'mailinator.com',
    'guerrillamail.com',
    'guerrillamail.org',
    'sharklasers.com',
    'yopmail.com',
    'trashmail.com',
    'trashmail.ws',
    'tempmail.com',
    'tempr.email',
    'temp-mail.org',
    'discard.email',
    'getnada.com',
    '10minutemail.com',
    '10minutemail.net',
    'throwaway.email',
    'mintemail.com',
    'fakeinbox.com',
    'dispostable.com',
    'maildrop.cc',
    'mailcatch.com',
    'emailondeck.com',
    'spamgourmet.com',
    'trash-me.com',
    'mailnesia.com',
    'minuteinbox.com',
    'emailfake.com',
    'mail-temporaire.fr',
    'moakt.com',
    'discardmail.com',
  ].map((d) => d.toLowerCase()),
);

function envBool(v: string | undefined): boolean {
  const s = v?.trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes';
}

function parseCountryAllowlist(raw: string | undefined): string[] | null {
  if (!raw?.trim()) return null;
  const codes = raw
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((c) => /^[A-Z]{2}$/.test(c));
  return codes.length ? codes : null;
}

/** Reject if geo allowlist is set and cf.country is not in the list */
function checkGeo(request: Request, allowlist: string[] | null): Response | null {
  if (!allowlist) return null;
  const cf = request.cf as { country?: string } | undefined;
  const country = typeof cf?.country === 'string' ? cf.country : undefined;
  if (!country) {
    return jsonResponse(403, { error: 'geo_unavailable' });
  }
  if (!allowlist.includes(country.toUpperCase())) {
    return jsonResponse(403, { error: 'geo_blocked' });
  }
  return null;
}

function emailDomain(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 1 || at >= email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

async function domainHasMx(domain: string): Promise<boolean> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`;
  const res = await fetch(url, {
    headers: { Accept: 'application/dns-json' },
    signal: AbortSignal.timeout(4500),
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { Status: number; Answer?: Array<{ type: number }> };
  if (json.Status === 3) return false;
  if (json.Status !== 0) return false;
  return (json.Answer ?? []).some((a) => a.type === 15);
}

function stripControl(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c === 9 || c === 10 || c === 13) out += ' ';
    else if (c >= 32 && c !== 127) out += ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}

function isValidEmail(email: string): boolean {
  if (email.length > MAX_EMAIL) return false;
  const basic =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return basic.test(email);
}

function checkOrigin(request: Request, env: Env): Response | null {
  const raw = env.ALLOWED_ORIGINS?.trim();
  if (!raw) return null;
  const allowed = new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const origin = request.headers.get('Origin');
  if (!origin || !allowed.has(origin)) {
    return jsonResponse(403, { error: 'origin_not_allowed' });
  }
  return null;
}

function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Real-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

async function bumpRateWindow(
  kv: KVNamespace,
  ip: string,
  windowLabel: string,
  windowMs: number,
  max: number,
  ttlPaddingSec: number,
): Promise<boolean> {
  const windowIndex = Math.floor(Date.now() / windowMs);
  const key = `contact:${windowLabel}:${ip}:${windowIndex}`;
  const current = parseInt((await kv.get(key)) || '0', 10);
  if (current >= max) return false;
  await kv.put(key, String(current + 1), {
    expirationTtl: Math.ceil(windowMs / 1000) + ttlPaddingSec,
  });
  return true;
}

/** Minute + hour caps per IP when KV is bound */
async function checkRateLimits(env: Env, ip: string): Promise<boolean> {
  const kv = env.CONTACT_RATE_LIMIT;
  if (!kv) return true;
  if (!(await bumpRateWindow(kv, ip, 'm', RATE_MINUTE_MS, RL_MAX_PER_MINUTE, 30))) {
    return false;
  }
  if (!(await bumpRateWindow(kv, ip, 'h', RATE_HOUR_MS, RL_MAX_PER_HOUR, 120))) {
    return false;
  }
  return true;
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (ip && ip !== 'unknown') body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

function disposableEmailDomain(domain: string): boolean {
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  for (const d of DISPOSABLE_DOMAINS) {
    if (domain === d || domain.endsWith(`.${d}`)) return true;
  }
  return false;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  const originBlock = checkOrigin(request, env);
  if (originBlock) return originBlock;

  if (!env.RESEND_API_KEY?.trim() || !env.CONTACT_TO_EMAIL?.trim()) {
    return jsonResponse(503, { error: 'contact_not_configured' });
  }

  const requireTurnstile = envBool(env.CONTACT_REQUIRE_TURNSTILE);
  if (requireTurnstile && !env.TURNSTILE_SECRET?.trim()) {
    return jsonResponse(503, { error: 'turnstile_misconfigured' });
  }

  const countryAllow = parseCountryAllowlist(env.CONTACT_ALLOWED_COUNTRIES);
  const geoBlock = checkGeo(request, countryAllow);
  if (geoBlock) return geoBlock;

  const ip = clientIp(request);

  const ct = request.headers.get('Content-Type') || '';
  if (!ct.toLowerCase().includes('application/json')) {
    return jsonResponse(415, { error: 'unsupported_media_type' });
  }

  const lenHeader = request.headers.get('Content-Length');
  if (lenHeader && parseInt(lenHeader, 10) > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: 'payload_too_large' });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: 'payload_too_large' });
  }

  let parsed: ContactBody;
  try {
    parsed = JSON.parse(text) as ContactBody;
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  if (typeof parsed.website === 'string' && parsed.website.trim() !== '') {
    return jsonResponse(400, { error: 'invalid_request' });
  }

  const nameRaw = typeof parsed.name === 'string' ? stripControl(parsed.name) : '';
  const emailRaw = typeof parsed.email === 'string' ? stripControl(parsed.email).toLowerCase() : '';
  const messageRaw =
    typeof parsed.message === 'string' ? parsed.message.split('\u0000').join('') : '';

  if (!nameRaw || !emailRaw || !messageRaw.trim()) {
    return jsonResponse(400, { error: 'missing_fields' });
  }
  if (nameRaw.length > MAX_NAME || messageRaw.length > MAX_MESSAGE) {
    return jsonResponse(400, { error: 'field_too_long' });
  }
  if (!isValidEmail(emailRaw)) {
    return jsonResponse(400, { error: 'invalid_email' });
  }

  const domain = emailDomain(emailRaw);
  if (!domain) {
    return jsonResponse(400, { error: 'invalid_email' });
  }
  if (disposableEmailDomain(domain)) {
    return jsonResponse(400, { error: 'disposable_email' });
  }

  const token =
    typeof parsed['cf-turnstile-response'] === 'string' ? parsed['cf-turnstile-response'].trim() : '';
  const turnstileSecret = env.TURNSTILE_SECRET?.trim();
  if (requireTurnstile || turnstileSecret) {
    const secret = turnstileSecret;
    if (!secret) {
      return jsonResponse(503, { error: 'turnstile_misconfigured' });
    }
    if (!token) {
      return jsonResponse(400, { error: 'turnstile_required' });
    }
    const ok = await verifyTurnstile(secret, token, ip);
    if (!ok) {
      return jsonResponse(400, { error: 'turnstile_failed' });
    }
  }

  if (!(await domainHasMx(domain))) {
    return jsonResponse(400, { error: 'email_domain_unreachable' });
  }

  if (!(await checkRateLimits(env, ip))) {
    return jsonResponse(429, { error: 'rate_limited' });
  }

  const safeName = nameRaw.replace(/[\r\n]+/g, ' ').slice(0, MAX_NAME);
  const subject = `Portfolio contact: ${safeName}`.slice(0, 998);
  const textBody =
    `Name: ${safeName}\n` +
    `Email: ${emailRaw}\n` +
    `IP: ${ip}\n\n` +
    `${messageRaw.trim().slice(0, MAX_MESSAGE)}`;

  const from =
    env.CONTACT_FROM?.trim() ||
    'Portfolio <onboarding@resend.dev>';

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [env.CONTACT_TO_EMAIL.trim()],
      reply_to: emailRaw,
      subject,
      text: textBody,
    }),
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text().catch(() => '');
    console.error('Resend error', resendRes.status, errText.slice(0, 500));
    return jsonResponse(502, { error: 'send_failed' });
  }

  return jsonResponse(200, { ok: true });
}
