// ============================================
// TalentRadar — Supabase Client (Frontend)
// ============================================
// Not: Static export'ta Supabase JS client doğrudan
// browser'da çalışır (anon key ile).
// Service role key asla frontend'de kullanılmaz!

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = typeof window !== "undefined" ? localStorage.getItem("talentRadar_supabaseUrl") : null;
  const key = typeof window !== "undefined" ? localStorage.getItem("talentRadar_supabaseAnonKey") : null;

  if (!url || !key) return null;

  supabase = createClient(url, key);
  return supabase;
}

export function initSupabaseClient(url: string, anonKey: string): SupabaseClient {
  if (typeof window !== "undefined") {
    localStorage.setItem("talentRadar_supabaseUrl", url);
    localStorage.setItem("talentRadar_supabaseAnonKey", anonKey);
  }
  supabase = createClient(url, anonKey);
  return supabase;
}

export function clearSupabaseClient(): void {
  supabase = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("talentRadar_supabaseUrl");
    localStorage.removeItem("talentRadar_supabaseAnonKey");
  }
}

export function isSupabaseConfigured(): boolean {
  if (typeof window === "undefined") return false;
  const url = localStorage.getItem("talentRadar_supabaseUrl");
  const key = localStorage.getItem("talentRadar_supabaseAnonKey");
  return !!(url && key);
}
