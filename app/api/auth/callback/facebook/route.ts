import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/kampagnen?error=auth_fehlgeschlagen', request.url));
  }

  try {
    // Token vom Facebook erhalten
    const tokenResponse = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        code,
        redirect_uri: process.env.FACEBOOK_CALLBACK_URL,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Facebook Token Fehler:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/kampagnen?error=token_fehler', request.url));
    }

    const { access_token, expires_in } = await tokenResponse.json();

    // Supabase-Client erstellen
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Basisdaten des Nutzers über Graph API abrufen
    const userResponse = await fetch('https://graph.facebook.com/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Facebook User Fehler:', await userResponse.text());
      return NextResponse.redirect(new URL('/kampagnen?error=user_fehler', request.url));
    }

    const userData = await userResponse.json();

    // Token in Supabase speichern
    const { error } = await supabase
      .from('api_credentials')
      .upsert({
        provider: 'facebook',
        access_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        metadata: {
          user_id: userData.id,
          provider_user_id: userData.id,
        },
      });

    if (error) {
      console.error('Fehler beim Speichern des Tokens:', error);
      return NextResponse.redirect(new URL('/kampagnen?error=db_fehler', request.url));
    }

    // Erfolgreiche Authentifizierung
    return NextResponse.redirect(new URL('/kampagnen?success=true', request.url));
  } catch (error) {
    console.error('Unerwarteter Fehler:', error);
    return NextResponse.redirect(new URL('/kampagnen?error=unbekannt', request.url));
  }
} 