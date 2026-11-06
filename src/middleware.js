import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Melindungi halaman /pelanggan dan /admin berdasarkan peran pengguna.
export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/arah', req.url));
    }
    if (path.startsWith('/pelanggan') && role !== 'PELANGGAN') {
      return NextResponse.redirect(new URL('/arah', req.url));
    }
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = { matcher: ['/pelanggan/:path*', '/admin/:path*'] };
