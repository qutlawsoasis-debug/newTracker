const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:/Users/magne/Documents/GitHub/newTracker/.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY length:', SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.length : 0);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    // 1. Fetch OpenAPI schema to discover all tables
    const res = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_SERVICE_ROLE_KEY}`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch OpenAPI schema:', res.status, res.statusText);
      return;
    }
    
    const spec = await res.json();
    console.log('OpenAPI Spec Title:', spec.info?.title);
    const definitions = spec.definitions ? Object.keys(spec.definitions) : [];
    console.log('Discovered tables from OpenAPI spec:', definitions);

    // 2. Query each table for test_new_user_001
    const testUserId = 'test_new_user_001';
    console.log(`\n--- Inspecting tables for user '${testUserId}' ---`);

    for (const table of definitions) {
      // Check column names for table from spec.definitions[table].properties
      const props = spec.definitions[table]?.properties || {};
      const colNames = Object.keys(props);
      
      // Determine user id column (telegram_id, user_id, id)
      let queryCol = null;
      if (colNames.includes('telegram_id')) queryCol = 'telegram_id';
      else if (colNames.includes('user_id')) queryCol = 'user_id';
      else if (colNames.includes('id')) queryCol = 'id';
      
      let queryResults = null;
      let count = 0;
      
      if (queryCol) {
        const { data, error } = await supabase.from(table).select('*').eq(queryCol, testUserId);
        if (error) {
          console.log(`Table '${table}' query by '${queryCol}' error:`, error.message);
        } else {
          queryResults = data;
          count = data ? data.length : 0;
        }
      } else {
        // Just fetch count of all rows in table
        const { data, error } = await supabase.from(table).select('*').limit(5);
        if (!error) count = data.length;
      }
      
      console.log(`Table: ${table} | User Query Column: ${queryCol || 'N/A'} | Records found for '${testUserId}': ${count}`);
      if (queryResults && queryResults.length > 0) {
        console.log(`Payload sample for ${table}:`, JSON.stringify(queryResults, null, 2));
      }
    }

  } catch (err) {
    console.error('Error running check:', err);
  }
}

run();
