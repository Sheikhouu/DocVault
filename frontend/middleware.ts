import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // MVP: Simplified middleware with cookie support
  const token = request.cookies.get('auth_token')?.value;
  
  const { pathname } = request.nextUrl;

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/',
    '/signin',
    '/signup',
    '/reset-password',
    '/auth/update-password'
  ];

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = [
    '/dashboard',
    '/documents',
    '/settings'
  ];

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Si c'est une route protégée et que l'utilisateur n'est pas authentifié
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Si l'utilisateur est authentifié et essaie d'accéder aux pages d'auth
  if (token && (pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};