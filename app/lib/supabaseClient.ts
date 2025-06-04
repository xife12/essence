import { createClient } from '@supabase/supabase-js';

// Supabase-Konfiguration mit dem neuen API-Key
const supabaseUrl = 'https://rrrxgayeiyehnhcphltb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnhnYXllaXllaG5oY3BobHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDI0NDMsImV4cCI6MjA2NDYxODQ0M30.SNLJCUzLwaI-akxfDsj_Ze7AQwh0mRvnHiBx2BANYWU';

// Minimale Client-Initialisierung
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, options);

// Vereinfachte Authentifizierungsfunktionen
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
  }
};

export default supabase; 