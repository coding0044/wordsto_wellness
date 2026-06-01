import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { ApiRoutes, Routes } from '@/lib/urls';

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes (accessible without authentication)
  const publicRoutes = [
    Routes.auth.login,
    Routes.auth.signup,
    Routes.auth.forgotPassword,
    Routes.auth.resetPassword,
  ];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // API public routes
  const publicApiRoutes = [
    ApiRoutes.auth.login,
    ApiRoutes.auth.signup,
    ApiRoutes.auth.forgotPassword,
    ApiRoutes.auth.resetPassword(''),
  ];
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route.replace('?token=', '')));

  if (isPublicRoute || isPublicApiRoute) {
    // If user is already logged in, redirect to dashboard
    if (token && isPublicRoute) {
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          const dashboardPath = decoded.role === 'admin' ? Routes.adminDashboard : Routes.dashboard;
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
    const loginUrl = new URL(Routes.auth.login, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      const loginUrl = new URL(Routes.auth.login, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Admin route protection
    if (pathname.startsWith(Routes.adminDashboard) && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL(Routes.dashboard, request.url));
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
    `${Routes.dashboard}/:path*`,
    `${Routes.adminDashboard}/:path*`,
    Routes.auth.login,
    Routes.auth.signup,
    Routes.auth.forgotPassword,
    Routes.auth.resetPassword,
    ApiRoutes.auth.me,
    '/api/admin/:path*',
  ],
};