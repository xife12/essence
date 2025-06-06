import { createClient } from '@supabase/supabase-js';

// Supabase-Konfiguration mit dem neuen API-Key
const supabaseUrl = 'https://rrrxgayeiyehnhcphltb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnhnYXllaXllaG5oY3BobHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDI0NDMsImV4cCI6MjA2NDYxODQ0M30.SNLJCUzLwaI-akxfDsj_Ze7AQwh0mRvnHiBx2BANYWU';

// KORRIGIERTE Client-Initialisierung mit Session-Persistierung
const options = {
  auth: {
    autoRefreshToken: true,   // ✅ Auto-Refresh aktivieren
    persistSession: true,     // ✅ Session speichern
    detectSessionInUrl: true  // ✅ Session aus URL erkennen
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, options);

// Vereinfachte Authentifizierungsfunktionen
export const auth = {
  signIn: async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('Login erfolgreich:', result.data.user?.email);
      return result;
    } catch (error) {
      console.error('Fehler beim Anmelden:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const result = await supabase.auth.signOut();
      console.log('Logout erfolgreich');
      return result;
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
      throw error;
    }
  },

  getSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Fehler beim Laden der Session:', error);
      return null;
    }
  }
};

export default supabase; 