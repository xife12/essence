'use client';

import { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Check, Facebook } from 'lucide-react';

export default function FacebookAuthButton() {
  const [authStatus, setAuthStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Supabase-Client initialisieren
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    // Status-Parameter aus URL auslesen
    const success = searchParams?.get('success');
    const error = searchParams?.get('error');

    if (success === 'true') {
      setAuthStatus('connected');
      // Parameter aus URL entfernen
      router.replace('/kampagnen');
    } else if (error) {
      setAuthStatus('error');
      // Parameter aus URL entfernen
      router.replace('/kampagnen');
    }

    // Prüfen, ob bereits eine Verbindung besteht
    async function checkConnection() {
      try {
        const { data, error } = await supabase
          .from('api_credentials')
          .select('*')
          .eq('provider', 'facebook')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          // Prüfen, ob der Token noch gültig ist
          const expiresAt = new Date(data.expires_at);
          if (expiresAt > new Date()) {
            setAuthStatus('connected');
          }
        }
      } catch (error) {
        console.error('Fehler beim Prüfen der Verbindung:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkConnection();
  }, [searchParams, router]);

  const startAuth = () => {
    // OAuth-Flow starten
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/callback/facebook'
    );
    const scope = encodeURIComponent('ads_management,ads_read,business_management');
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1245629613728659';
    
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = authUrl;
  };

  const disconnectFacebook = async () => {
    try {
      // Token aus der Datenbank entfernen
      const { error } = await supabase
        .from('api_credentials')
        .delete()
        .eq('provider', 'facebook');
      
      if (!error) {
        setAuthStatus('idle');
      } else {
        console.error('Fehler beim Trennen der Verbindung:', error);
      }
    } catch (error) {
      console.error('Unerwarteter Fehler:', error);
    }
  };

  if (isLoading) {
    return <Button disabled>Lädt...</Button>;
  }

  if (authStatus === 'connected') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-green-600">
          <Check size={16} />
          <span>Mit Facebook verbunden</span>
        </div>
        <Button 
          variant="outline"
          onClick={disconnectFacebook}
        >
          Verbindung trennen
        </Button>
      </div>
    );
  }

  if (authStatus === 'error') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={16} />
          <span>Fehler bei der Verbindung</span>
        </div>
        <Button 
          onClick={startAuth}
        >
          <Facebook className="mr-2 h-4 w-4" />
          Erneut mit Facebook verbinden
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={startAuth}
    >
      <Facebook className="mr-2 h-4 w-4" />
      Mit Facebook verbinden
    </Button>
  );
} 