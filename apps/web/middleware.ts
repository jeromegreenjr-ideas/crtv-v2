import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Simple guard: prevent accessing certain routes if not authenticated (based on presence of Supabase cookie)
const protectedPrefixes = ['/projects', '/tasks', '/notifications', '/reports', '/communication'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;
  if (protectedPrefixes.some(p => path.startsWith(p))) {
    // If Supabase cookie not present, redirect to signin with next param
    const hasAuthCookie = req.cookies.has('sb-access-token') || req.cookies.has('sb:token');
    if (!hasAuthCookie) {
      url.pathname = '/signin';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/projects/:path*', '/tasks/:path*', '/notifications', '/reports', '/communication'],
};


