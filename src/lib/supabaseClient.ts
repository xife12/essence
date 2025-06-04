import { createClient } from '@supabase/supabase-js';

// Supabase-Konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Überprüfe, ob die Umgebungsvariablen gesetzt sind
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL oder Anon Key fehlt. Überprüfe deine .env.local Datei.');
}

// Client-Initialisierung mit minimalen Einstellungen
export const supabase = createClient(supabaseUrl, supabaseKey);

// Hilfsfunktion zum Prüfen der Authentifizierung
export async function checkAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Fehler bei der Authentifizierungsprüfung:', error);
    return null;
  }
}

// Hilfsfunktion zum Abrufen des aktuellen Benutzers
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Fehler beim Abrufen des aktuellen Benutzers:', error);
    return null;
  }
}

// Authentifizierungsfunktionen mit besserer Fehlerbehandlung
export const auth = {
  signIn: async (email: string, password: string) => {
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      console.error('Fehler beim Anmelden:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
      throw error;
    }
  },
  
  resetPassword: async (email: string) => {
    try {
      return await supabase.auth.resetPasswordForEmail(email);
    } catch (error) {
      console.error('Fehler beim Zurücksetzen des Passworts:', error);
      throw error;
    }
  },
  
  updatePassword: async (password: string) => {
    try {
      return await supabase.auth.updateUser({ password });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Passworts:', error);
      throw error;
    }
  }
};

// Exportiere den Client als Standard
export default supabase; 