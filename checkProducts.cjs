const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://txjhhwootljiqavnnghm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4amhod29vdGxqaXFhdm5uZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODc5MDQsImV4cCI6MjA2NzE2MzkwNH0.fJHzXibofO5jhnWp1COLbcHkamLf1l6hzwGdLpbt7YM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductsDatabase() {
  console.log('🔍 Checking products database...');
  
  try {
    // Get count
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting count:', countError);
      return;
    }
    
    console.log(`📊 Total products in database: ${count}`);
    
    // Get actual products
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('📭 Products table is empty');
      return;
    }
    
    console.log('📦 Products found:');
    data.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.category}) - ID: ${product.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkProductsDatabase(); 