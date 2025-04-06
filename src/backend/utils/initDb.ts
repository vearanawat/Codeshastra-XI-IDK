import path from 'path';
import supabase from '../supabase/client';
import { importUsersFromCSV, importAccessRequestsFromCSV } from './csvImport';

async function createTables() {
  console.log('Creating necessary tables in Supabase...');
  
  // For a real implementation, you would use Supabase migrations
  // For this demo, we assume the database tables are created through the Supabase UI
  // or via migrations, and we're just importing data
  
  console.log('Tables should be created via Supabase UI or migrations');
}

async function importData() {
  try {
    console.log('Importing user data from CSV...');
    
    const csvPath = path.resolve(process.cwd(), 'synthetic_access_data_10000.csv');
    
    // Import users
    const usersResult = await importUsersFromCSV(csvPath) as { success: boolean; count: number };
    console.log(`Imported ${usersResult.count} users`);
    
    // Import access requests
    const accessRequestsResult = await importAccessRequestsFromCSV(csvPath) as { success: boolean; count: number };
    console.log(`Imported ${accessRequestsResult.count} access requests`);
    
    console.log('Data import complete!');
  } catch (error: any) {
    console.error('Error importing data:', error.message);
  }
}

async function run() {
  try {
    await createTables();
    await importData();
    
    console.log('Database initialization complete!');
  } catch (error: any) {
    console.error('Error initializing database:', error.message);
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  run();
}

export { createTables, importData, run }; 