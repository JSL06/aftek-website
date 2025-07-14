require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://txjhhwootljiqavnnghm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4amhod29vdGxqaXFhdm5uZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODc5MDQsImV4cCI6MjA2NzE2MzkwNH0.fJHzXibofO5jhnWp1COLbcHkamLf1l6hzwGdLpbt7YM';

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Key length:', SUPABASE_SERVICE_ROLE_KEY.length);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
  try {
    console.log('Attempting to connect to Supabase...');
    
    // Test a simple query
    const { data, error } = await supabase
      .from('website_texts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
    } else {
      console.log('✅ Connection successful!');
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

testConnection(); 