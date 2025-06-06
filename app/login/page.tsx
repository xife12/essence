'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@membercore.de');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectedFrom') || '/dashboard';

  // Auto-Login für Development
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(redirectTo);
      }
    };
    checkExistingSession();
  }, [router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Anmeldung versuchen mit:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        throw error;
      }

      if (data?.session) {
        console.log('Login erfolgreich, Session erhalten');
        router.push(redirectTo);
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

  const handleQuickLogin = async () => {
    setEmail('admin@membercore.de');
    setPassword('admin123');
    // Trigger login automatically
    setTimeout(() => {
      document.getElementById('login-form')?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            MemberCore Login
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Fitness-Studio Verwaltungssystem
          </p>
        </div>
        
        <form id="login-form" className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail-Adresse
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="E-Mail-Adresse"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Passwort"
            />
          </div>

          {error && (
            <div className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </div>
        </form>

        {/* Development Helper */}
        <div className="text-center">
          <button
            onClick={handleQuickLogin}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            🚀 Quick-Login (Development)
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Test-Account: admin@membercore.de / admin123
          </p>
        </div>
      </div>
    </div>
  );
} 