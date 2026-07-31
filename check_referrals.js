const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Supabase credentials not configured.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReferrals() {
  console.log("--- SELECT * FROM public.referrals ---");
  const { data, error } = await supabase.from('referrals').select('*');
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Rows count:", data ? data.length : 0);
    console.log("Data:", JSON.stringify(data, null, 2));
  }
}

checkReferrals();
