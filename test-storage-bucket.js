// Quick test script to verify scan-reports bucket exists
// Run with: node test-storage-bucket.js

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function testStorageBucket() {
  console.log('🧪 Testing Supabase storage bucket...');
  
  try {
    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
      return;
    }
    
    console.log('📦 Available buckets:', buckets.map(b => b.name));
    
    // Test 2: Check if scan-reports exists
    const scanReportsBucket = buckets.find(b => b.name === 'scan-reports');
    
    if (!scanReportsBucket) {
      console.error('❌ scan-reports bucket not found!');
      console.log('💡 Create it via Supabase Dashboard: Storage > Buckets > New Bucket');
      console.log('   - Name: scan-reports');
      console.log('   - Public: YES');
      console.log('   - File size limit: 10MB');
      return;
    }
    
    console.log('✅ scan-reports bucket found!');
    console.log('📋 Bucket config:', {
      name: scanReportsBucket.name,
      public: scanReportsBucket.public,
      file_size_limit: scanReportsBucket.file_size_limit
    });
    
    // Test 3: Try to upload a test file
    const testContent = Buffer.from('PDF test file');
    const testPath = `test-${Date.now()}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('scan-reports')
      .upload(testPath, testContent, {
        contentType: 'application/pdf'
      });
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      return;
    }
    
    console.log('✅ Test upload successful!');
    
    // Test 4: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('scan-reports')
      .getPublicUrl(testPath);
      
    console.log('🔗 Public URL:', publicUrl);
    
    // Cleanup: Remove test file
    await supabase.storage.from('scan-reports').remove([testPath]);
    console.log('🧹 Test file cleaned up');
    
    console.log('\n🎉 All storage tests passed! PDF pipeline should work now.');
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

testStorageBucket();