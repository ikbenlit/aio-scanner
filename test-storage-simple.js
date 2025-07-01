import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ipyucglfdqhtpinntooi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweXVjZ2xmZHFodHBpbm50b29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMDQyMzQsImV4cCI6MjA2NDc4MDIzNH0.OqQA4JNPSToYvFenoiICc1YAu8gMFuZv4LmEkgKoEAw'
);

async function testStorage() {
  console.log('🧪 Testing storage bucket directly...');
  
  try {
    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Buckets error:', bucketsError);
      return;
    }
    
    console.log('📦 Buckets found:', buckets.map(b => b.name));
    
    const scanReportsBucket = buckets.find(b => b.name === 'scan-reports');
    if (!scanReportsBucket) {
      console.error('❌ scan-reports bucket not found!');
      return;
    }
    
    console.log('✅ scan-reports bucket exists!');
    
    // Test 2: Upload test
    const testBuffer = Buffer.from('PDF test content');
    const testPath = `test-${Date.now()}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('scan-reports')
      .upload(testPath, testBuffer, {
        contentType: 'application/pdf'
      });
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return;
    }
    
    console.log('✅ Upload successful:', uploadData.path);
    
    // Test 3: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('scan-reports')
      .getPublicUrl(testPath);
      
    console.log('🔗 Public URL:', publicUrl);
    
    // Cleanup
    await supabase.storage.from('scan-reports').remove([testPath]);
    console.log('🧹 Cleanup complete');
    
    console.log('\n🎉 Storage test PASSED! PDF upload should work now.');
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

testStorage(); 