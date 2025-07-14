import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://txjhhwootljiqavnnghm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4amhod29vdGxqaXFhdm5uZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODc5MDQsImV4cCI6MjA2NzE2MzkwNH0.fJHzXibofO5jhnWp1COLbcHkamLf1l6hzwGdLpbt7YM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);