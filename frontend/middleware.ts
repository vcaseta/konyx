// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('konyx_token')?.value;
  const { pathname } = req.nextUrl;

  // Proteger dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Si ya tienes token y vas al login (/ o /login), manda a /dashboard
  if ((pathname === '/' || pathname === '/login') && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Aplica a estas rutas
export const config = {
  matcher: ['/dashboard/:path*', '/', '/login'],
};
