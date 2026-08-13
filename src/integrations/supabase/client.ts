import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!import.meta.env.VITE_SUPABASE_URL || (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.error("Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables are set in the build environment.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

