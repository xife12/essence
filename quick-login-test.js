// Schneller Login-Test für Browser-Konsole
// Kopiere das in die Browser-Konsole und führe es aus

// 1. Erstelle Supabase Client
const { createClient } = window.supabase || await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
const supabase = createClient(
  'https://rrrxgayeiyehnhcphltb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnhnYXllaXllaG5oY3BobHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDI0NDMsImV4cCI6MjA2NDYxODQ0M30.SNLJCUzLwaI-akxfDsj_Ze7AQwh0mRvnHiBx2BANYWU'
);

// 2. Test-Login
async function testLogin() {
  try {
    // Erstelle Test-User (falls nicht existiert)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123456'
    });
    
    console.log('SignUp Result:', signUpData, signUpError);
    
    // Login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', 
      password: 'test123456'
    });
    
    console.log('SignIn Result:', signInData, signInError);
    
    // Session prüfen
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current Session:', session);
    
    if (session) {
      console.log('✅ Login erfolgreich! User ID:', session.user.id);
      // Seite neu laden für Cookie-Update
      window.location.reload();
    } else {
      console.log('❌ Kein Session gefunden');
    }
    
  } catch (error) {
    console.error('Login-Fehler:', error);
  }
}

// Login ausführen
testLogin(); 