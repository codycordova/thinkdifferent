import { NextRequest, NextResponse } from 'next/server';
import {
  UNLOCK_COOKIE_NAME,
  UNLOCK_COOKIE_MAX_AGE_SECONDS,
  passwordsMatch,
  signToken,
} from '@/lib/unlock';

export const runtime = 'nodejs';

// TODO: add brute-force rate limiting (Upstash Redis + @upstash/ratelimit) before
// the gate is exposed to high traffic. Single-owner low-volume use is acceptable for now.
export async function POST(request: NextRequest) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: 'Server is not configured for unlock.' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const password =
    body && typeof body === 'object' && 'password' in body
      ? (body as { password: unknown }).password
      : undefined;

  if (typeof password !== 'string' || password.length === 0) {
    return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
  }
  if (password.length > 200) {
    return NextResponse.json({ error: 'Password too long.' }, { status: 400 });
  }

  if (!passwordsMatch(password, expected)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const token = await signToken();

  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set({
    name: UNLOCK_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: UNLOCK_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}
