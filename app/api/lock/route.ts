import { NextResponse } from 'next/server';
import { UNLOCK_COOKIE_NAME } from '@/lib/unlock';

export const runtime = 'nodejs';

/** Clears the unlock cookie. Owner convenience: hit POST /api/lock to test the gate. */
export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set({
    name: UNLOCK_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
