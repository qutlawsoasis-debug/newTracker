const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'C:/Users/magne/Documents/GitHub/newTracker/.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_USER_ID = 'test_new_user_001';

console.log('=== Supabase Data Integrity & Cleanup Tool ===');
console.log('Target URL:', SUPABASE_URL);
console.log('Key length:', SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.length : 0);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const TABLES_TO_CHECK = [
  { table: 'profiles', userCol: 'telegram_id' },
  { table: 'daily_plans', userCol: 'telegram_id' },
  { table: 'food_logs', userCol: 'telegram_id' },
  { table: 'weight_history', userCol: 'telegram_id' },
  { table: 'app_logs', userCol: 'user_id' },
  { table: 'app_system_logs', userCol: 'telegram_id' }
];

async function directFetchQuery(tableName, userCol) {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}?${userCol}=eq.${TEST_USER_ID}`;
  console.log(`[REST FETCH] GET ${url}`);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const status = res.status;
    const ok = res.ok;
    let text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch(e){}
    return { ok, status, json, raw: text, error: ok ? null : text };
  } catch (err) {
    return { ok: false, status: null, json: null, raw: null, error: err.message, cause: err.cause };
  }
}

async function directFetchDelete(tableName, userCol) {
  const url = `${SUPABASE_URL}/rest/v1/${tableName}?${userCol}=eq.${TEST_USER_ID}`;
  console.log(`[REST FETCH DELETE] DELETE ${url}`);
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    const status = res.status;
    const ok = res.ok;
    let text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch(e){}
    return { ok, status, json, raw: text, error: ok ? null : text };
  } catch (err) {
    return { ok: false, status: null, json: null, raw: null, error: err.message };
  }
}

async function runAudit() {
  const auditResults = {
    timestamp: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    testUser: TEST_USER_ID,
    tables: {}
  };

  console.log('\n--- PHASE 1: Querying Supabase Tables via @supabase/supabase-js and Direct REST ---');

  for (const item of TABLES_TO_CHECK) {
    const { table, userCol } = item;
    console.log(`\nChecking table: ${table} (user column: ${userCol})...`);
    
    // 1. JS Client query
    let jsData = null;
    let jsError = null;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(userCol, TEST_USER_ID);
      jsData = data;
      jsError = error;
    } catch (e) {
      jsError = { message: e.message };
    }

    // 2. Direct REST query
    const restRes = await directFetchQuery(table, userCol);

    auditResults.tables[table] = {
      userColumn: userCol,
      jsClient: {
        success: !jsError && Array.isArray(jsData),
        recordCount: jsData ? jsData.length : 0,
        records: jsData,
        error: jsError ? jsError.message : null
      },
      restApi: {
        status: restRes.status,
        ok: restRes.ok,
        recordCount: Array.isArray(restRes.json) ? restRes.json.length : 0,
        records: restRes.json,
        error: restRes.error
      }
    };

    console.log(`[${table}] JS Client: count=${auditResults.tables[table].jsClient.recordCount}, error=${auditResults.tables[table].jsClient.error}`);
    console.log(`[${table}] REST API: status=${restRes.status}, count=${auditResults.tables[table].restApi.recordCount}, error=${restRes.error}`);
  }

  // Also query app_logs for overall logging (any recent logs)
  console.log('\nChecking overall app_logs table (recent entries)...');
  let appLogsAll = null;
  let appLogsAllError = null;
  try {
    const { data, error } = await supabase
      .from('app_logs')
      .select('*')
      .order('id', { ascending: false })
      .limit(10);
    appLogsAll = data;
    appLogsAllError = error;
  } catch (e) {
    appLogsAllError = { message: e.message };
  }

  auditResults.overallLogs = {
    jsClient: {
      success: !appLogsAllError && Array.isArray(appLogsAll),
      recordCount: appLogsAll ? appLogsAll.length : 0,
      records: appLogsAll,
      error: appLogsAllError ? appLogsAllError.message : null
    }
  };

  console.log(`[app_logs OVERALL] count=${auditResults.overallLogs.jsClient.recordCount}, error=${auditResults.overallLogs.jsClient.error}`);

  console.log('\n--- PHASE 2: Deleting test_new_user_001 records from all tables ---');
  const cleanupResults = {};

  for (const item of TABLES_TO_CHECK) {
    const { table, userCol } = item;
    console.log(`\nCleaning up table: ${table}...`);

    // JS Client delete
    let jsDeleteData = null;
    let jsDeleteErr = null;
    try {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq(userCol, TEST_USER_ID)
        .select();
      jsDeleteData = data;
      jsDeleteErr = error;
    } catch (e) {
      jsDeleteErr = { message: e.message };
    }

    // Direct REST delete
    const restDelete = await directFetchDelete(table, userCol);

    cleanupResults[table] = {
      jsClient: {
        success: !jsDeleteErr,
        deletedCount: jsDeleteData ? jsDeleteData.length : 0,
        deletedRecords: jsDeleteData,
        error: jsDeleteErr ? jsDeleteErr.message : null
      },
      restApi: {
        status: restDelete.status,
        ok: restDelete.ok,
        deletedCount: Array.isArray(restDelete.json) ? restDelete.json.length : 0,
        deletedRecords: restDelete.json,
        error: restDelete.error
      }
    };

    console.log(`[CLEANUP ${table}] JS delete count: ${cleanupResults[table].jsClient.deletedCount}, error: ${cleanupResults[table].jsClient.error}`);
    console.log(`[CLEANUP ${table}] REST delete status: ${restDelete.status}, error: ${restDelete.error}`);
  }

  auditResults.cleanup = cleanupResults;

  // Save audit findings to JSON file
  const outPath = path.join(__dirname, 'audit_results.json');
  fs.writeFileSync(outPath, JSON.stringify(auditResults, null, 2));
  console.log(`\nAudit results written to: ${outPath}`);
}

runAudit();
