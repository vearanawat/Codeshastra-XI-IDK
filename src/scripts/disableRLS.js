// Script to disable Row Level Security on Supabase tables
// Run with: node src/scripts/disableRLS.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Supabase credentials not found in .env.local file');
  console.error('Please create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// This function will execute raw SQL to disable RLS
async function disableRLS() {
  try {
    console.log('Attempting to disable Row Level Security...');
    
    // Note: This requires a service role key or admin access
    // The anon key might not have sufficient permissions to disable RLS
    // In production, you should use proper SQL migrations or the Supabase UI
    
    const { data: disableUsersRLS, error: usersError } = await supabase.rpc(
      'execute_sql',
      { sql_query: 'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;' }
    );
    
    if (usersError) {
      console.error('Error disabling RLS on users table:', usersError.message);
      console.log('Please log in to the Supabase UI and run this SQL command manually:');
      console.log('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log('Successfully disabled RLS on users table');
    }
    
    const { data: disableRequestsRLS, error: requestsError } = await supabase.rpc(
      'execute_sql',
      { sql_query: 'ALTER TABLE public.access_requests DISABLE ROW LEVEL SECURITY;' }
    );
    
    if (requestsError) {
      console.error('Error disabling RLS on access_requests table:', requestsError.message);
      console.log('Please log in to the Supabase UI and run this SQL command manually:');
      console.log('ALTER TABLE public.access_requests DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log('Successfully disabled RLS on access_requests table');
    }
    
    console.log('\nIMPORTANT: If the above commands failed, please:');
    console.log('1. Log in to the Supabase UI');
    console.log('2. Go to the SQL Editor');
    console.log('3. Run the following commands:');
    console.log('   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
    console.log('   ALTER TABLE public.access_requests DISABLE ROW LEVEL SECURITY;');
    
  } catch (error) {
    console.error('Error disabling RLS:', error.message);
  }
}

// Main function
async function main() {
  try {
    await disableRLS();
    console.log('Operation completed');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main(); 