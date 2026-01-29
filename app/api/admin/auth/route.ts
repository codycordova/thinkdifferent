import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD environment variable is not set');
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = getAdminPassword();

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const cookieStore = await cookies();

    // Set httpOnly cookie
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return NextResponse.json(
      { success: true, message: 'Authenticated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Authentication failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json(
      { success: true, message: 'Logged out' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: true, message: 'Logged out' },
      { status: 200 }
    );
  }
}
