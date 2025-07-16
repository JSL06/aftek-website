const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tshbmqoilldqarngngma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaGJtcW9pbGxkcWFybmduZ21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NzAzOTksImV4cCI6MjA0NzE0NjM5OX0.fF2e_5TUCgYlNZPKrJcvGdvwHqGTzSHrq3rY5Fqk19M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabase() {
  try {
    console.log('=== DEBUGGING DATABASE DELETE ISSUES ===');
    
    // 1. Check all products and their ID formats
    console.log('\n1. Checking all product IDs...');
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .limit(10);

    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      return;
    }

    console.log(`Found ${products.length} products:`);
    products.forEach(product => {
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id);
      console.log(`  ID: ${product.id} | Name: ${product.name} | Valid UUID: ${isValidUUID}`);
    });

    // 2. Try to find the problematic product
    console.log('\n2. Looking for problematic product "flexrpo-pu-001"...');
    const { data: problematicProduct, error: findError } = await supabase
      .from('products')
      .select('*')
      .eq('id', 'flexrpo-pu-001');

    if (findError) {
      console.error('Error finding problematic product:', findError);
    } else if (problematicProduct && problematicProduct.length > 0) {
      console.log('Found problematic product:', problematicProduct[0]);
      
      // Try to delete it properly
      console.log('\n3. Attempting to delete problematic product...');
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', 'flexrpo-pu-001');

      if (deleteError) {
        console.error('Failed to delete:', deleteError);
      } else {
        console.log('Successfully deleted problematic product!');
      }
    } else {
      console.log('Problematic product not found in database');
    }

    // 3. Check for products with invalid UUIDs and fix them
    console.log('\n4. Looking for products with invalid UUIDs...');
    const invalidProducts = products.filter(p => 
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.id)
    );

    if (invalidProducts.length > 0) {
      console.log(`Found ${invalidProducts.length} products with invalid UUIDs:`);
      for (const product of invalidProducts) {
        console.log(`  - ${product.id} (${product.name})`);
        
        // Generate a new UUID for this product
        const newUUID = crypto.randomUUID();
        console.log(`  Updating to: ${newUUID}`);
        
        // Get the full product data first
        const { data: fullProduct, error: getError } = await supabase
          .from('products')
          .select('*')
          .eq('id', product.id)
          .single();

        if (getError) {
          console.error(`  Error getting full product data:`, getError);
          continue;
        }

        // Delete the old record
        const { error: deleteOldError } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);

        if (deleteOldError) {
          console.error(`  Error deleting old record:`, deleteOldError);
          continue;
        }

        // Insert with new UUID
        const { error: insertNewError } = await supabase
          .from('products')
          .insert([{
            ...fullProduct,
            id: newUUID
          }]);

        if (insertNewError) {
          console.error(`  Error inserting with new UUID:`, insertNewError);
        } else {
          console.log(`  ✓ Successfully updated ${product.name} with new UUID`);
        }
      }
    } else {
      console.log('All products have valid UUIDs');
    }

    console.log('\n=== DEBUG COMPLETE ===');

  } catch (error) {
    console.error('Debug script failed:', error);
  }
}

debugDatabase(); 