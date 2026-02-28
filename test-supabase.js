/* eslint-disable */
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Key in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Attempting to connect to Supabase via REST API...');
    console.log('Using URL:', supabaseUrl);
    
    // A simple query to check if we can reach the database
    // We query a system table or just try to select from Event with limit 0
    const { data, error } = await supabase.from('Event').select('id').limit(1);
    
    if (error) {
      // If the table doesn't exist, it means we connected but the schema is empty
      if (error.code === '42P01') {
         console.log('✅ Successfully connected to Supabase!');
         console.log('⚠️ Note: The "Event" table does not exist yet. You need to run the SQL script in the Supabase dashboard.');
      } else {
         throw error;
      }
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('Database is reachable and the "Event" table exists.');
    }
    
  } catch (err) {
    console.error('❌ Failed to connect to Supabase.');
    console.error('Error details:', err.message || err);
  }
}

testConnection();
