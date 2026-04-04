import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://yvkwkrumopgspyohrgio.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2a3drcnVtb3Bnc3B5b2hyZ2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTU1NzMsImV4cCI6MjA4ODU3MTU3M30.xjSZ7U-Fqdg_lf66YaEem1Wi5W5h4kO1ab1vezV8XIc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
});
