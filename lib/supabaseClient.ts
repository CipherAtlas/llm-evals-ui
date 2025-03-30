// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ""
const supabaseAnonKey = ""

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key must be set in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
