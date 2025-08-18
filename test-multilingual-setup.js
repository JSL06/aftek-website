// Test script to verify multilingual database setup
// Run this in your browser console after setting up the database

console.log('🧪 Testing Multilingual Database Setup...');

// Test 1: Check if product_translations table exists
async function testTranslationsTable() {
  try {
    const { data, error } = await supabase
      .from('product_translations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ product_translations table error:', error);
      return false;
    }
    
    console.log('✅ product_translations table accessible');
    return true;
  } catch (err) {
    console.error('❌ product_translations table exception:', err);
    return false;
  }
}

// Test 2: Check if RPC function exists
async function testRPCFunction() {
  try {
    const { data, error } = await supabase.rpc('get_products_with_translations', { 
      target_language: 'zh-Hant' 
    });
    
    if (error) {
      console.error('❌ RPC function error:', error);
      return false;
    }
    
    console.log('✅ RPC function working, returned:', data?.length || 0, 'products');
    return true;
  } catch (err) {
    console.error('❌ RPC function exception:', err);
    return false;
  }
}

// Test 3: Check sample translations
async function testSampleTranslations() {
  try {
    const { data, error } = await supabase
      .from('product_translations')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Sample translations error:', error);
      return false;
    }
    
    console.log('✅ Sample translations found:', data?.length || 0, 'records');
    if (data && data.length > 0) {
      console.log('📝 Sample translation:', data[0]);
    }
    return true;
  } catch (err) {
    console.error('❌ Sample translations exception:', err);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running all tests...\n');
  
  const test1 = await testTranslationsTable();
  const test2 = await testRPCFunction();
  const test3 = await testSampleTranslations();
  
  console.log('\n📊 Test Results:');
  console.log('Translations Table:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('RPC Function:', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('Sample Data:', test3 ? '✅ PASS' : '❌ FAIL');
  
  if (test1 && test2 && test3) {
    console.log('\n🎉 All tests passed! Your multilingual setup is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

// Export for manual testing
window.testMultilingualSetup = runAllTests;

console.log('💡 Run testMultilingualSetup() to test your setup');
