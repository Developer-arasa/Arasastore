import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // 1. Cek apakah ini subdomain tour
  const isTourSubdomain = hostname.startsWith('tour.');

  // 2. Handle Subdomain (Rewrite)
  if (isTourSubdomain) {
    // GUARD: Biar gak double pathing (misal jadi /tour-portal/tour-portal/manage)
    if (!url.pathname.startsWith('/tour-portal')) {
      url.pathname = `/tour-portal${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // 3. Handle Main Domain kalau ada yang iseng akses /tour-portal langsung (Redirect)
  // Berjalan hanya jika BUKAN subdomain tour (karena isTourSubdomain udah ke-return di atas)
  if (url.pathname.startsWith('/tour-portal')) {
    const newPath = url.pathname.replace('/tour-portal', '') || '/';
    const redirectUrl = new URL(`https://tour.arasa.co.id${newPath}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Gue tambahin _next/data biar aman kalau lu pake Pages Router / navigasi client-side
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
