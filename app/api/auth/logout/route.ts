import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Benutzer abmelden
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Fehler beim Logout:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // HTML-Antwort mit JavaScript zum Löschen aller Cookies
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>Abmeldung</title>
      <script>
        // Alle Cookies löschen
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        // Zur Login-Seite weiterleiten
        window.location.href = "/login";
      </script>
    </head>
    <body>
      <p>Du wirst abgemeldet...</p>
    </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    }
  );
} 