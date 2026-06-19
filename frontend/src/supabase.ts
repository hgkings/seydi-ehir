import { createClient } from '@supabase/supabase-js';

// Anon key is public by design — safe to embed in client bundles.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
  ?? 'https://bdldfjygwomihhvttjvt.supabase.co';

const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbGRmanlnd29taWhodnR0anZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4OTc1ODcsImV4cCI6MjA5NDQ3MzU4N30.9tDCwhcsM57KXWsDIy5mIHb9m8sixQNakATqCUNoO-s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
