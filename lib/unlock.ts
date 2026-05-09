/**
 * Edge-compatible HMAC-SHA256 sign / verify helpers for the pre-launch gate cookie.
 *
 * Token format: `${issuedAtMs}.${hex(HMAC_SHA256(issuedAtMs, secret))}`
 *
 * Uses Web Crypto (globalThis.crypto.subtle) so the same code runs in
 * Edge middleware AND in Node API routes.
 */

const COOKIE_NAME = 'td_unlock';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const UNLOCK_COOKIE_NAME = COOKIE_NAME;
export const UNLOCK_COOKIE_MAX_AGE_SECONDS = MAX_AGE_SECONDS;

function getSecret(): string {
  const s = process.env.SITE_UNLOCK_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      'SITE_UNLOCK_SECRET is missing or too short (min 16 chars). Generate one with: openssl rand -hex 32'
    );
  }
  return s;
}

const encoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let out = '';
  for (let i = 0; i < view.length; i++) {
    out += view[i]!.toString(16).padStart(2, '0');
  }
  return out;
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return bytesToHex(sig);
}

/** Constant-time string compare. Returns false if lengths differ. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Mint a fresh signed token for "now". */
export async function signToken(): Promise<string> {
  const secret = getSecret();
  const issued = Date.now().toString();
  const sig = await hmacHex(issued, secret);
  return `${issued}.${sig}`;
}

/** Verify token signature AND that it's not older than maxAgeSeconds. */
export async function verifyToken(
  token: string | undefined | null,
  maxAgeSeconds: number = MAX_AGE_SECONDS
): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return false;

  const issuedStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const issued = Number(issuedStr);
  if (!Number.isFinite(issued) || issued <= 0) return false;

  const ageMs = Date.now() - issued;
  if (ageMs < 0 || ageMs > maxAgeSeconds * 1000) return false;

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }

  const expected = await hmacHex(issuedStr, secret);
  return timingSafeEqual(sig, expected);
}

/** Constant-time password compare exposed for the unlock route. */
export function passwordsMatch(input: string, expected: string): boolean {
  return timingSafeEqual(input, expected);
}

/** True when the gate is enabled. Defaults to true (fail-safe locked) unless explicitly "false". */
export function isGateEnabled(): boolean {
  const raw = process.env.SITE_GATE_ENABLED;
  if (raw === undefined) return true;
  return raw.toLowerCase() !== 'false';
}
