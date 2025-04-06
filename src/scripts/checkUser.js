// Script to check if a user exists in the Supabase database
// Run with: node src/scripts/checkUser.js <user_id>

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

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID as a command line argument');
  console.error('Usage: node src/scripts/checkUser.js <user_id>');
  process.exit(1);
}

async function checkUser(userId) {
  try {
    console.log(`Checking if user '${userId}' exists in the database...`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error:', error.message);
      return false;
    }
    
    if (!data) {
      console.log(`User '${userId}' not found in the database`);
      return false;
    }
    
    console.log('User found:');
    console.log('--------------------------------------------------');
    console.log(`User ID: ${data.user_id}`);
    console.log(`Role: ${data.user_role}`);
    console.log(`Department: ${data.department || 'Not specified'}`);
    console.log(`Status: ${data.employee_status || 'Not specified'}`);
    console.log(`Region: ${data.region || 'Not specified'}`);
    console.log('--------------------------------------------------');
    
    console.log(`This user ${data.user_role === 'Admin' ? 'IS' : 'is NOT'} an admin`);
    console.log(`They will be redirected to: ${data.user_role === 'Admin' ? '/admin/dashboard' : '/employee/dashboard'}`);
    
    return true;
  } catch (error) {
    console.error('Error checking user:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Check if the user exists
    const exists = await checkUser(userId);
    
    if (!exists) {
      console.log('\nThis user will NOT be able to log in.');
    } else {
      console.log('\nThis user will be able to log in successfully.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main(); 