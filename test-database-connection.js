// Simple database connection test
// Run this in your browser console to test the database setup

console.log('🧪 Testing Database Connection...');

// Test 1: Check if we can connect to Supabase
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic products table access
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (productsError) {
      console.error('❌ Products table error:', productsError);
      return false;
    }
    
    console.log('✅ Products table accessible, found:', products?.length || 0, 'products');
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

// Test 2: Check if specific product exists
async function testProductExists(productId) {
  try {
    console.log(`Testing if product ${productId} exists...`);
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (productError) {
      console.error('❌ Product fetch error:', productError);
      return false;
    }
    
    if (!product) {
      console.error('❌ Product not found');
      return false;
    }
    
    console.log('✅ Product found:', product.name);
    return true;
  } catch (err) {
    console.error('❌ Product test failed:', err);
    return false;
  }
}

// Test 3: Check product_translations table
async function testTranslationsTable() {
  try {
    console.log('Testing product_translations table...');
    
    const { data: translations, error: translationsError } = await supabase
      .from('product_translations')
      .select('*')
      .limit(1);
    
    if (translationsError) {
      console.error('❌ Translations table error:', translationsError);
      return false;
    }
    
    console.log('✅ Translations table accessible, found:', translations?.length || 0, 'translations');
    return true;
  } catch (err) {
    console.error('❌ Translations test failed:', err);
    return false;
  }
}

// Test 4: Check RPC function
async function testRPCFunction() {
  try {
    console.log('Testing RPC function...');
    
    const { data: result, error: rpcError } = await supabase.rpc('get_products_with_translations', { 
      target_language: 'zh-Hant' 
    });
    
    if (rpcError) {
      console.error('❌ RPC function error:', rpcError);
      return false;
    }
    
    console.log('✅ RPC function working, returned:', result?.length || 0, 'products');
    return true;
  } catch (err) {
    console.error('❌ RPC test failed:', err);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running all tests...\n');
  
  const test1 = await testConnection();
  const test2 = await testProductExists('e0516503-cacc-4a2a-a9a8-49bcaa3a8e82'); // XOO11 product
  const test3 = await testTranslationsTable();
  const test4 = await testRPCFunction();
  
  console.log('\n📊 Test Results:');
  console.log('Connection:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('Product Exists:', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('Translations Table:', test3 ? '✅ PASS' : '❌ FAIL');
  console.log('RPC Function:', test4 ? '✅ PASS' : '❌ FAIL');
  
  if (test1 && test2 && test3 && test4) {
    console.log('\n🎉 All tests passed! Your database setup is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

// Export for manual testing
window.testDatabaseConnection = runAllTests;

console.log('💡 Run testDatabaseConnection() to test your database setup');
