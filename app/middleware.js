import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes (accessible without authentication)
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // API public routes
  const publicApiRoutes = ['/api/auth/login', '/api/auth/signup', '/api/auth/forgot-password', '/api/auth/reset-password'];
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute || isPublicApiRoute) {
    // If user is already logged in, redirect to dashboard
    if (token && isPublicRoute) {
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          const dashboardPath = decoded.role === 'admin' ? '/admin-dashboard' : '/dashboard';
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      } catch (error) {
        // Token invalid, allow access to public route
      }
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Admin route protection
    if (pathname.startsWith('/admin-dashboard') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Protect admin API routes
    if (pathname.startsWith('/api/admin') && decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin-dashboard/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/api/auth/me',
    '/api/admin/:path*',
  ],
};