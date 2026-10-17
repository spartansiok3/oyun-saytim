import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'admin_session';

const getSecret = (): string => {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'fallback_secret_key_intellectual_game';
};

/**
 * Timing-safe password comparison
 */
export function verifyAdminPassword(provided: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(adminPassword);

  if (providedBuf.length !== expectedBuf.length) {
    // Constant time check against itself to avoid timing leak
    crypto.timingSafeEqual(providedBuf, providedBuf);
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Creates a signed session token valid for 7 days
 */
export function createSessionToken(): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', exp: expiresAt })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verifies HMAC signature and expiration
 */
export function verifySessionToken(token?: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expSigBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expSigBuf.length) {
    crypto.timingSafeEqual(sigBuf, sigBuf);
    return false;
  }

  if (!crypto.timingSafeEqual(sigBuf, expSigBuf)) {
    return false;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.role !== 'admin' || typeof data.exp !== 'number' || Date.now() > data.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check authentication in Server Actions and Route Handlers
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Strict auth guard: throws error if unauthenticated
 */
export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error('İcazəsiz giriş: Zəhmət olmasa daxil olun.');
  }
}

/**
 * Sets the httpOnly, secure, sameSite=lax 7-day cookie
 */
export async function setAdminSession(): Promise<void> {
  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Clears the session cookie
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
