'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase, { auth } from '../lib/supabaseClient';
import DebugComponent from './debug';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debug, setDebug] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectedFrom') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDebug(null);

    try {
      console.log('Anmeldung versuchen mit:', email);
      
      const { data, error } = await auth.signIn(email, password);
      
      setDebug({ loginAttempt: { data, error: error?.message } });
      
      if (error) {
        throw error;
      }

      if (data?.session) {
        console.log('Login erfolgreich, Session erhalten:', data.session);
        
        // Setze explizit Cookie mit der Session
        document.cookie = `supabase-auth-token=${JSON.stringify(data.session)}; path=/; max-age=604800`;
        
        // Warte kurz, damit Cookies gesetzt werden können
        setTimeout(() => {
          // Direkt zum Dashboard navigieren
          console.log('Weiterleitung zu:', redirectTo);
          window.location.href = redirectTo; // Verwende window.location für vollständigen Seitenneuladen
        }, 1000);
      } else {
        throw new Error('Keine Session nach Login erhalten');
      }
    } catch (err: any) {
      console.error('Login fehlgeschlagen:', err);
      setError(err.message || 'Login fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <DebugComponent />
        
        {debug && (
          <div className="bg-yellow-50 p-4 rounded-md mb-4 text-sm">
            <h3 className="font-semibold">Login-Debug:</h3>
            <pre className="overflow-auto">{JSON.stringify(debug, null, 2)}</pre>
          </div>
        )}
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            MemberCore Login
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Fitness-Studio Verwaltungssystem
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email-address">E-Mail-Adresse</label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="E-Mail-Adresse"
            />
          </div>
          <div>
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Passwort"
            />
          </div>

          {error && (
            <div className="text-sm text-center text-red-600">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 