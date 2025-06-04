import { supabase } from './supabaseClient';

export async function getUserSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function hasRole(user: any, role: string) {
  return user?.role === role;
} 