import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/offline'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for token in cookie (termin-token)
  const token = request.cookies.get('termin-token')?.value;
  
  // If no token and trying to access protected routes
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && pathname.startsWith('/dashboard')) {
    try {
      const decoded = jwtDecode<{ exp?: number }>(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('termin-token');
        return response;
      }
    } catch {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('termin-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
  ],
};
