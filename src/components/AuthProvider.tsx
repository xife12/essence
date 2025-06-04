'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import supabase, { getCurrentUser } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialer Ladevorgang und Auth-Listener
  useEffect(() => {
    // Cookie-Status direkt checken
    const hasCookie = document.cookie.includes('supabase-auth-token');
    
    if (!hasCookie) {
      setLoading(false);
      return;
    }
    
    // Initiales Laden des Benutzers
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Fehler beim Laden des Benutzers:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Ereignisüberwachung für Authentifizierungsänderungen
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth-Ereignis:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/login');
        } else if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user);
        }
        
        setLoading(false);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router]);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzers:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Manuelles Löschen des Cookies
      document.cookie = 'supabase-auth-token=; Max-Age=0; path=/;';
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 