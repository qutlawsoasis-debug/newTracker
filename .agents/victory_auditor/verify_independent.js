const dns = require('dns');

const BASE_URL = 'https://new-tracker-orpin.vercel.app';
const SUPABASE_HOST = 'duajmoeuumbqncoftzpu.supabase.co';

async function runIndependentVerification() {
  console.log('=== VICTORY AUDITOR INDEPENDENT EXECUTION VERIFICATION ===\n');

  const results = {};

  // 1. GET /api/meals?userId= (Empty userId)
  console.log('Testing 1: GET /api/meals?userId=');
  try {
    const res = await fetch(`${BASE_URL}/api/meals?userId=`);
    const status = res.status;
    const contentType = res.headers.get('content-type');
    const text = await res.text();
    results.emptyUserId = { status, contentType, snippet: text.substring(0, 200) };
    console.log(`  -> Status: ${status}, Type: ${contentType}`);
  } catch (e) {
    results.emptyUserId = { error: e.message };
    console.log(`  -> Error: ${e.message}`);
  }

  // 2. GET /api/meals?userId=999999999 (Non-existent user)
  console.log('\nTesting 2: GET /api/meals?userId=999999999');
  try {
    const res = await fetch(`${BASE_URL}/api/meals?userId=999999999`);
    const status = res.status;
    const json = await res.json();
    results.nonExistentUser = { status, json };
    console.log(`  -> Status: ${status}, Body:`, JSON.stringify(json));
  } catch (e) {
    results.nonExistentUser = { error: e.message };
    console.log(`  -> Error: ${e.message}`);
  }

  // 3. POST /api/profile (Valid user creation for test_new_user_001)
  console.log('\nTesting 3: POST /api/profile (test_new_user_001)');
  try {
    const start = performance.now();
    const payload = {
      userId: 'test_new_user_001',
      gender: 'M',
      age: 22,
      height: 180,
      weight: 65,
      activity: 1.375,
      goal: 'gain'
    };
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const duration = Math.round(performance.now() - start);
    const status = res.status;
    const json = await res.json();
    results.profileCreation = { status, durationMs: duration, targetCalories: json?.profile?.targetCalories, json };
    console.log(`  -> Status: ${status}, Latency: ${duration}ms, Calorie Target: ${json?.profile?.targetCalories}`);
  } catch (e) {
    results.profileCreation = { error: e.message };
    console.log(`  -> Error: ${e.message}`);
  }

  // 4. GET /api/meals?userId=test_new_user_001
  console.log('\nTesting 4: GET /api/meals?userId=test_new_user_001');
  try {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/api/meals?userId=test_new_user_001`);
    const duration = Math.round(performance.now() - start);
    const status = res.status;
    const json = await res.json();
    results.getMeals = { status, durationMs: duration, mealsKeysCount: Object.keys(json?.meals || {}).length, json };
    console.log(`  -> Status: ${status}, Latency: ${duration}ms, Meals keys count: ${Object.keys(json?.meals || {}).length}`);
  } catch (e) {
    results.getMeals = { error: e.message };
    console.log(`  -> Error: ${e.message}`);
  }

  // 5a. POST /api/meals (minimal payload)
  console.log('\nTesting 5a: POST /api/meals (minimal payload: eatenMeals)');
  try {
    const res = await fetch(`${BASE_URL}/api/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test_new_user_001', eatenMeals: ['breakfast'] })
    });
    const status = res.status;
    const json = await res.json();
    results.postMealsMinimal = { status, json };
    console.log(`  -> Status: ${status}, Body:`, JSON.stringify(json));
  } catch (e) {
    results.postMealsMinimal = { error: e.message };
    console.log(`  -> Error: ${e.message}`);
  }

  // 5b. POST /api/meals (full payload)
  console.log('\nTesting 5b: POST /api/meals (full payload)');
  try {
    const mealsData = results.getMeals?.json || {};
    const res = await fetch(`${BASE_URL}/api/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test_new_user_001',
        meals: mealsData.meals || {},
        date: mealsData.date || new Date().toDateString(),
        version: mealsData.version || '1.3.7',
        eatenMeals: ['breakfast']
      })
    });
    const status = res.status;
    const json = await res.json();
    results.postMealsFull = { status, json };
    console.log(`  -> Status: ${status}, Body:`, JSON.stringify(json));
  } catch (e) {
    results.postMealsFull = { error: e.message };
    console.log(`  -> Error: ${e.message}`);
  }

  // 6. POST /api/npc/chat ("съел овсянку 200г")
  console.log('\nTesting 6: POST /api/npc/chat ("съел овсянку 200г")');
  try {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/api/npc/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test_new_user_001', message: 'съел овсянку 200г' })
    });
    const duration = Math.round(performance.now() - start);
    const status = res.status;
    const json = await res.json();
    results.npcChat = { status, durationMs: duration, foodLog: json?.food_log, textSnippet: json?.text?.substring(0, 100) };
    console.log(`  -> Status: ${status}, Latency: ${duration}ms, Food Log:`, JSON.stringify(json?.food_log));
  } catch (e) {
    results.npcChat = { error: e.message };
    console.log(`  -> Error: ${e.message}`);
  }

  // 7. GET /api/changelog
  console.log('\nTesting 7: GET /api/changelog');
  try {
    const res = await fetch(`${BASE_URL}/api/changelog`);
    const status = res.status;
    const contentType = res.headers.get('content-type');
    const text = await res.text();
    results.changelog = { status, contentType, snippet: text.substring(0, 200) };
    console.log(`  -> Status: ${status}, Type: ${contentType}`);
  } catch (e) {
    results.changelog = { error: e.message };
    console.log(`  -> Error: ${e.message}`);
  }

  // 8. GET /api/logs?userId=8319427555
  console.log('\nTesting 8: GET /api/logs?userId=8319427555');
  try {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/api/logs?userId=8319427555`);
    const duration = Math.round(performance.now() - start);
    const status = res.status;
    const json = await res.json();
    results.getLogs = { status, durationMs: duration, logCount: Array.isArray(json) ? json.length : null };
    console.log(`  -> Status: ${status}, Latency: ${duration}ms`);
  } catch (e) {
    results.getLogs = { error: e.message };
    console.log(`  -> Error: ${e.message}`);
  }

  // 9. Supabase DNS Resolution Check
  console.log('\nTesting 9: DNS resolution for Supabase host:', SUPABASE_HOST);
  await new Promise((resolve) => {
    dns.lookup(SUPABASE_HOST, (err, address, family) => {
      if (err) {
        results.supabaseDns = { success: false, code: err.code, message: err.message };
        console.log(`  -> DNS Lookup Failed: ${err.code} - ${err.message}`);
      } else {
        results.supabaseDns = { success: true, address, family };
        console.log(`  -> DNS Resolved: ${address}`);
      }
      resolve();
    });
  });

  const fs = require('fs');
  fs.writeFileSync('C:/Users/magne/Documents/GitHub/newTracker/.agents/victory_auditor/independent_results.json', JSON.stringify(results, null, 2));
  console.log('\nIndependent execution results saved to independent_results.json.');
}

runIndependentVerification();
