// This script imports user data from CSV into Supabase
// Run with: node src/scripts/importCsvData.js

require('dotenv').config({ path: '.env.local' });
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL defined:', !!supabaseUrl);
console.log('Supabase Key defined:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Supabase credentials not found in .env.local file');
  console.error('Please create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path to CSV file
const csvFilePath = path.resolve(process.cwd(), 'synthetic_access_data_10000.csv');
console.log('Looking for CSV file at:', csvFilePath);

// Check if file exists
if (!fs.existsSync(csvFilePath)) {
  console.error(`ERROR: CSV file not found at ${csvFilePath}`);
  process.exit(1);
}

// Test Supabase connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error.message);
    return false;
  }
}

// Process users
async function processUsers() {
  console.log('Processing users from CSV...');
  
  return new Promise((resolve, reject) => {
    const users = [];
    const uniqueUserIds = new Set();
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Only process each user once (based on user_id)
        if (uniqueUserIds.has(row.user_id)) {
          return;
        }
        
        uniqueUserIds.add(row.user_id);
        
        // Create user object
        const user = {
          user_id: row.user_id,
          user_role: row.user_role,
          department: row.department,
          employee_status: row.employee_status,
          time_in_position: row.time_in_position,
          location: row.location,
          last_security_training: row.last_security_training === 'Never' ? null : row.last_security_training,
          employee_join_date: row.employee_join_date === 'invalid_date' ? null : row.employee_join_date,
          region: row.region,
          past_violations: parseInt(row.past_violations, 10) || 0,
        };
        
        users.push(user);
      })
      .on('end', () => {
        console.log(`Found ${users.length} unique users`);
        resolve(users);
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Import users to Supabase
async function importUsers(users) {
  console.log('Importing users to Supabase...');
  
  // Process in batches to avoid overloading the API
  const batchSize = 50; // Reduced batch size
  const batches = [];
  
  for (let i = 0; i < users.length; i += batchSize) {
    batches.push(users.slice(i, i + batchSize));
  }
  
  console.log(`Processing ${batches.length} batches of users`);
  
  let successCount = 0;
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} users)`);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(batch, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error importing batch:', error);
        console.error('First user in batch:', JSON.stringify(batch[0], null, 2));
      } else {
        successCount += batch.length;
        console.log(`Batch ${i + 1} imported successfully`);
      }
    } catch (error) {
      console.error('Exception during batch import:', error.message);
    }
  }
  
  console.log(`Successfully imported ${successCount} users`);
}

// Main function
async function main() {
  try {
    console.log('Starting CSV import process...');
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to Supabase. Please check your credentials and network connection.');
      process.exit(1);
    }
    
    // Process and import users
    const users = await processUsers();
    
    if (users.length === 0) {
      console.error('No users found in CSV file. Please check the file format.');
      process.exit(1);
    }
    
    await importUsers(users);
    
    console.log('CSV import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error.message);
    process.exit(1);
  }
}

// Run the main function
main(); 