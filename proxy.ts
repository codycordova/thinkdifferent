import { NextRequest, NextResponse } from 'next/server';
import { UNLOCK_COOKIE_NAME, isGateEnabled, verifyToken } from '@/lib/unlock';

const GATE_PATH = '/launching';
const LOCKED_HEADER = 'x-td-locked';

const ALLOWED_PATHS = new Set<string>([
  GATE_PATH,
  '/api/leads',
  '/api/unlock',
  '/api/lock',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

function isAllowedPath(pathname: string): boolean {
  if (ALLOWED_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/api/leads')) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  if (!isGateEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (isAllowedPath(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(UNLOCK_COOKIE_NAME)?.value;
  const ok = await verifyToken(cookie);
  if (ok) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = GATE_PATH;

  const reqHeaders = new Headers(request.headers);
  reqHeaders.set(LOCKED_HEADER, '1');

  return NextResponse.rewrite(url, {
    request: { headers: reqHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match every request except:
     *   - Static asset folders served by Next (_next/static, _next/image)
     *   - Common static files at /public root (images, fonts, etc.)
     * Everything else (pages + API) hits proxy so we can decide.
     */
    '/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf|eot|css|js|map|txt|xml|webmanifest)$).*)',
  ],
};
