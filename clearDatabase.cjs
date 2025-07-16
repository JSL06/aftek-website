// Simple script to clear problematic products from database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tshbmqoilldqarngngma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaGJtcW9pbGxkcWFybmduZ21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzAzOTksImV4cCI6MjA0NzE0NjM5OX0.fF2e_5TUCgYlNZPKrJcvGdvwHqGTzSHrq3rY5Fqk19M';

const supabase = createClient(supabaseUrl, supabaseKey);

// List of problematic product names/IDs to remove
const PROBLEMATIC_PRODUCTS = [
  'flexrpo-pu-001',
  'FlexPro PU Sealant',
  'AquaShield Waterproofing'
];

async function clearProblematicProducts() {
  console.log('🧹 CLEARING PROBLEMATIC PRODUCTS...\n');

  for (const identifier of PROBLEMATIC_PRODUCTS) {
    console.log(`🗑️ Attempting to delete: ${identifier}`);
    
    try {
      // Try deleting by ID first
      const { error: idError } = await supabase
        .from('products')
        .delete()
        .eq('id', identifier);

      if (!idError) {
        console.log(`  ✅ Deleted by ID: ${identifier}`);
        continue;
      }

      // Try deleting by name
      const { error: nameError } = await supabase
        .from('products')
        .delete()
        .eq('name', identifier);

      if (!nameError) {
        console.log(`  ✅ Deleted by name: ${identifier}`);
        continue;
      }

      // Try partial name match
      const { error: likeError } = await supabase
        .from('products')
        .delete()
        .like('name', `%${identifier}%`);

      if (!likeError) {
        console.log(`  ✅ Deleted by pattern match: ${identifier}`);
      } else {
        console.log(`  ❌ Could not delete: ${identifier}`);
      }

    } catch (error) {
      console.log(`  ❌ Error deleting ${identifier}: ${error.message}`);
    }
  }

  // List remaining products
  console.log('\n📋 Remaining products in database:');
  try {
    const { data: remaining, error } = await supabase
      .from('products')
      .select('id, name')
      .order('name');

    if (!error && remaining) {
      console.log(`Found ${remaining.length} products:`);
      remaining.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (${p.id})`);
      });
    } else {
      console.log('No products found or error occurred');
    }
  } catch (error) {
    console.log('Error listing products:', error.message);
  }

  console.log('\n✨ Database cleanup complete!');
}

clearProblematicProducts(); 