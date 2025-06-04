'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../lib/supabaseClient';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Überprüfe, ob der Benutzer bereits angemeldet ist
  useEffect(() => {
    const hasCookie = document.cookie.includes('supabase-auth-token');
    if (hasCookie) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        throw error;
      }

      if (data?.session) {
        // Stellen Sie sicher, dass die Cookies gesetzt werden
        console.log('Login erfolgreich', data.session);
        
        // Warte kurz, damit Cookies gesetzt werden können
        setTimeout(() => {
          // Erfolgreich eingeloggt, zur Dashboard-Seite weiterleiten
          router.push('/dashboard');
        }, 500);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MemberCore
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Fitness-Studio Verwaltungssystem
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">E-Mail-Adresse</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="E-Mail-Adresse"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Passwort"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-center text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Angemeldet bleiben
              </label>
            </div>

            <div className="text-sm">
              <Link href="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                Passwort vergessen?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 