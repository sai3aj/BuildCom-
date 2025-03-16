import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Add detailed error checking
if (!supabaseUrl) {
  console.error('REACT_APP_SUPABASE_URL is missing');
  throw new Error('Supabase URL is required');
}

if (!supabaseAnonKey) {
  console.error('REACT_APP_SUPABASE_ANON_KEY is missing');
  throw new Error('Supabase Anon Key is required');
}

// Log the URL (but not the key for security)
console.log('Supabase URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);