import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getNextAuthJwtSecret, isProductionAuthMisconfigured } from '@/lib/jwt-secret';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

/** POST z NextAuth při přihlášení heslem (Credentials provider). */
function isCredentialsSignInPost(request: NextRequest): boolean {
  if (request.method !== 'POST') return false;
  const p = request.nextUrl.pathname;
  return (
    p === '/api/auth/callback/credentials' ||
    p.startsWith('/api/auth/callback/credentials/') ||
    p === '/api/auth/signin/credentials' ||
    p.startsWith('/api/auth/signin/credentials/')
  );
}

const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['ADMIN', 'SUPPORT', 'CONTRACTOR'],
  '/company': ['COMPANY_ADMIN'],
  '/technician': ['TECHNICIAN'],
  '/realty': ['REALTY'],
  '/svj': ['SVJ'],
  '/dashboard': ['CUSTOMER', 'TECHNICIAN', 'COMPANY_ADMIN', 'REALTY', 'SVJ', 'ADMIN', 'SUPPORT', 'CONTRACTOR'],
};

const PUBLIC_ROUTES = ['/login', '/register', '/registertest', '/success', '/new-order', '/claim-property', '/share', '/test', '/obchodnipodminky', '/api/public', '/api/auth', '/api/banner', '/api/revisions', '/api/health'];

/** Only real static assets — never use `pathname.includes('.')` (that bypassed auth for arbitrary URLs). */
const STATIC_FILE = /\.(?:ico|png|jpg|jpeg|gif|webp|avif|svg|css|js|map|txt|xml|woff2?|ttf|eot|webmanifest)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow framework assets (needed even when returning 503 for misconfiguration).
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || STATIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  if (isProductionAuthMisconfigured()) {
    return new NextResponse(
      'Server configuration error: NEXTAUTH_SECRET must be set in production (min. 24 znaků, lépe 32+ náhodných).',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  if (isCredentialsSignInPost(request)) {
    const ip = getClientIp(request);
    const limited = rateLimit(`auth-cred:${ip}`, 25, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: 'Příliš mnoho pokusů o přihlášení. Zkuste to později.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limited.retryAfterSec) },
        }
      );
    }
  }

  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/') {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: getNextAuthJwtSecret() });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as string;

  for (const [routePrefix, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        const homeMap: Record<string, string> = {
          'CUSTOMER': '/dashboard',
          'TECHNICIAN': '/technician',
          'COMPANY_ADMIN': '/company',
          'REALTY': '/realty',
          'SVJ': '/svj',
          'ADMIN': '/admin',
          'SUPPORT': '/admin',
          'CONTRACTOR': '/admin',
        };
        const redirectTo = homeMap[userRole] || '/dashboard';
        if (redirectTo !== pathname) {
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
