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
  
  // If token exists and trying to access login/register, redirect to dashboard
  if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    try {
      const decoded = jwtDecode<{ id: string }>(token);
      return NextResponse.redirect(new URL(`/dashboard/service/${decoded.id}`, request.url));
    } catch (error) {
      // Invalid token, clear it and allow access to auth pages
      const response = NextResponse.next();
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
