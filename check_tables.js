const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Supabase credentials not configured in local env.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("Checking Supabase tables...");
  
  // Test referrals table
  const { data: refData, error: refError } = await supabase.from('referrals').select('*').limit(1);
  console.log("referrals check:", refError ? refError.message : "Table exists OK");

  // Test user_points table
  const { data: ptsData, error: ptsError } = await supabase.from('user_points').select('*').limit(1);
  console.log("user_points check:", ptsError ? ptsError.message : "Table exists OK");
}

checkTables();
