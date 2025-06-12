import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/beratung/:path*',
    '/mitglieder/:path*',
    '/kampagnen/:path*',
    '/passwoerter/:path*',
    '/mitarbeiter/:path*',
    '/vertragsarten/:path*',
    '/stunden/:path*',
  ],
}; 