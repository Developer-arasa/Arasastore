import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  const isTourSubdomain = hostname.startsWith('tour.');

  if (isTourSubdomain) {
    url.pathname = `/tour-portal${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (url.pathname.startsWith('/tour-portal')) {
    const newPath = url.pathname.replace('/tour-portal', '');
    const redirectUrl = new URL(`https://tour.arasa.co.id${newPath}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};