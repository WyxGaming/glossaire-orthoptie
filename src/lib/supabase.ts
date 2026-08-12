import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://qbucwgppwtlnjdajflcn.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidWN3Z3Bwd3RsbmpkYWpmbGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDE5NDMsImV4cCI6MjEwMjExNzk0M30.A7FYbI1JqXHv_2KWPW0IBdsnqvWkLVK1Ovo_LbV_peo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
