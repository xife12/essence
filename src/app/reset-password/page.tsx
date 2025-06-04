'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { auth } from '../../lib/supabaseClient';
import { ArrowLeft, Shield } from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await auth.resetPassword(email);
      
      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Passwort-Reset fehlgeschlagen:', err);
      setError(err.message || 'Passwort-Reset fehlgeschlagen. Bitte versuche es später erneut.');
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
            Passwort zurücksetzen
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Gib deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen des Passworts zu erhalten.
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  E-Mail versendet
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir einen Link zum Zurücksetzen des Passworts gesendet.
                  </p>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Zurück zur Anmeldung
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">E-Mail-Adresse</label>
              <div className="mt-1">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-center text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Zurück zur Anmeldung
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Wird gesendet...' : 'Link senden'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 