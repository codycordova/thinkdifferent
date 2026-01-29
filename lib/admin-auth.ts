import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);
    return !!sessionToken;
  } catch {
    return false;
  }
}

export async function requireAuth(): Promise<{ authenticated: true } | { authenticated: false; status: number }> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { authenticated: false, status: 401 };
  }
  return { authenticated: true };
}
