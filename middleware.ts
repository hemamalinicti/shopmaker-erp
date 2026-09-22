import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'shopmaster_session';

// Allowed path prefixes for CASHIER
const CASHIER_ALLOWED_PATHS = [
  '/dashboard',
  '/billing',
  '/customers',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, _next, favicon, cron APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session: { id: string; email: string; name: string; role: 'OWNER' | 'CASHIER' } | null = null;

  if (token) {
    try {
      const [base64Data] = token.split('.');
      if (base64Data) {
        // Decode base64url payload
        let base64 = base64Data.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        const jsonStr = atob(base64);
        session = JSON.parse(jsonStr);
      }
    } catch {
      session = null;
    }
  }

  // If user is on /login page
  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Root path redirect
  if (pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protected Dashboard Routes Check
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASHIER Role Access Control
  if (session.role === 'CASHIER') {
    const isAllowed = CASHIER_ALLOWED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (!isAllowed) {
      // CASHIER attempting restricted route: redirect to /billing
      return NextResponse.redirect(new URL('/billing', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
