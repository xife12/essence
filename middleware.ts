import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

// Öffentliche URLs definieren (keine Auth erforderlich)
const publicPaths = ['/login', '/register', '/reset-password', '/dateimanager']; // TEMPORÄR: Dateimanager hinzugefügt

export async function middleware(req: NextRequest) {
  // 🚫 MIDDLEWARE KOMPLETT DEAKTIVIERT FÜR DEVELOPMENT
  console.log('🔓 Development: Middleware übersprungen für:', req.nextUrl.pathname);
  return NextResponse.next();
  
  // Der Rest wird in Development nie erreicht...
  const res = NextResponse.next()
  const url = req.nextUrl.clone()
  
  // 📝 Normaler Auth-Flow (nur für Production)
  const supabase = createMiddlewareClient({ req, res })
  
  console.log('Middleware check: Path:', url.pathname, 'hasSession:', !!req.cookies.get('sb-access-token'));
  
  // Prüfe auf Auth-Cookies
  const accessToken = req.cookies.get('sb-access-token')
  const refreshToken = req.cookies.get('sb-refresh-token')
  
  console.log('Auth cookies found:', !!accessToken, !!refreshToken);
  
  try {
    // Versuche Session zu laden
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('Session-Fehler:', error.message);
    }
    
    // Schutz für protected Routes
    if (url.pathname.startsWith('/dashboard') || 
        url.pathname.startsWith('/leads') || 
        url.pathname.startsWith('/mitglieder') ||
        url.pathname.startsWith('/kampagnen') ||
        url.pathname.startsWith('/landingpages') ||
        url.pathname.startsWith('/dateimanager') ||
        url.pathname.startsWith('/stunden') ||
        url.pathname.startsWith('/mitarbeiter') ||
        url.pathname.startsWith('/passwoerter') ||
        url.pathname.startsWith('/vertragsarten')) {
      
      if (!session) {
        console.log('Keine Auth-Cookies gefunden, Weiterleitung zu /login');
        url.pathname = '/login'
        url.searchParams.set('redirectedFrom', req.nextUrl.pathname)
        return NextResponse.redirect(url)
      }
    }
    
    // Redirect von Login wenn bereits angemeldet
    if (url.pathname === '/login' && session) {
      console.log('Bereits angemeldet, Weiterleitung zu /dashboard');
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    
    // Redirect von Root zu Dashboard wenn angemeldet
    if (url.pathname === '/' && session) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    
    // Redirect von Root zu Login wenn nicht angemeldet
    if (url.pathname === '/' && !session) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
  } catch (error) {
    console.error('Middleware-Fehler:', error);
    // Bei Fehlern zur Login-Seite umleiten
    if (url.pathname !== '/login') {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }
  
  return res
}

// Auf welchen Pfaden soll Middleware ausgeführt werden
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 