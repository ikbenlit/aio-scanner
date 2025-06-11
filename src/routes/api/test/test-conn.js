import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ipyucglfdqhtpinntooi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlweXVjZ2xmZHFodHBpbm50b29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMDQyMzQsImV4cCI6MjA2NDc4MDIzNH0.OqQA4JNPSToYvFenoiICc1YAu8gMFuZv4LmEkgKoEAw'
);

async function test() {
  const { data, error } = await supabase.from('users').select('*');
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
