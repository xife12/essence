import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Öffentliche URLs definieren (keine Auth erforderlich)
const publicPaths = ['/login', '/register', '/reset-password'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicPath = publicPaths.includes(pathname);
  
  // Verbesserte Cookie-Überprüfung
  const supabaseAuthCookie = req.cookies.get('supabase-auth-token');
  const hasSession = !!supabaseAuthCookie?.value;
  
  console.log('Middleware check: Path:', pathname, 'hasSession:', hasSession);
  
  // Wenn nicht eingeloggt und nicht auf öffentlichem Pfad, redirect zu Login
  if (!hasSession && !isPublicPath) {
    console.log('Kein Auth-Cookie gefunden, Weiterleitung zu /login');
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Wenn eingeloggt und auf öffentlichem Pfad, redirect zu Dashboard
  if (hasSession && isPublicPath) {
    console.log('Auth-Cookie gefunden auf public path, Weiterleitung zu /dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return NextResponse.next();
}

// Auf welchen Pfaden soll Middleware ausgeführt werden
export const config = {
  matcher: [
    /*
     * Match all request paths außer:
     * - _next/static (statische Dateien)
     * - _next/image (Optimierte Bilder)
     * - favicon.ico (Browser Icon)
     * - public-Dateien (.svg, .jpg, etc.)
     * - API-Routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.svg$|.*\\.jpg$|.*\\.png$).*)',
  ],
}; 