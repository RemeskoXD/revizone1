import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['ADMIN', 'SUPPORT', 'CONTRACTOR'],
  '/company': ['COMPANY_ADMIN'],
  '/technician': ['TECHNICIAN'],
  '/realty': ['REALTY'],
  '/svj': ['SVJ'],
  '/dashboard': ['CUSTOMER', 'TECHNICIAN', 'COMPANY_ADMIN', 'REALTY', 'SVJ', 'ADMIN', 'SUPPORT', 'CONTRACTOR'],
};

const PUBLIC_ROUTES = ['/login', '/register', '/success', '/new-order', '/claim-property', '/share', '/api/public', '/api/auth', '/api/banner', '/api/revisions'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'super-secret-key-for-dev' });

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
