const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://new-tracker-orpin.vercel.app';
const USER_ID = 'test_new_user_001';

async function runStep(stepName, fn) {
  console.log(`\n=== Running ${stepName} ===`);
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    console.log(`[${stepName}] Status: ${result.status}, Time: ${duration}ms`);
    return {
      step: stepName,
      status: result.status,
      durationMs: duration,
      ok: result.ok,
      headers: result.headers,
      data: result.data,
      rawText: result.rawText,
      error: null
    };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    console.error(`[${stepName}] Failed in ${duration}ms:`, err.message);
    return {
      step: stepName,
      status: err.status || 0,
      durationMs: duration,
      ok: false,
      headers: null,
      data: null,
      rawText: null,
      error: err.message
    };
  }
}

async function doFetch(url, options = {}) {
  const res = await fetch(url, options);
  const rawText = await res.text();
  let data = null;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    // raw text remains non-null
  }
  const headers = {};
  res.headers.forEach((val, key) => { headers[key] = val; });
  return {
    status: res.status,
    ok: res.ok,
    headers,
    data,
    rawText
  };
}

async function main() {
  const results = {};

  // Step 1: POST /api/profile
  results.step1 = await runStep('1. POST /api/profile', async () => {
    const payload = {
      userId: USER_ID,
      gender: "M",
      age: 22,
      height: 180,
      weight: 65,
      activity: 1.375,
      goal: "gain"
    };
    return await doFetch(`${BASE_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  });

  // Step 2: GET /api/meals?userId=test_new_user_001
  results.step2 = await runStep('2. GET /api/meals', async () => {
    return await doFetch(`${BASE_URL}/api/meals?userId=${USER_ID}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
  });

  // Step 3a: POST /api/meals with minimal payload: { userId, eatenMeals }
  results.step3_minimal = await runStep('3a. POST /api/meals (minimal eatenMeals payload)', async () => {
    const payload = {
      userId: USER_ID,
      eatenMeals: ["breakfast"]
    };
    return await doFetch(`${BASE_URL}/api/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  });

  // Step 3b: POST /api/meals with full context payload
  results.step3_full = await runStep('3b. POST /api/meals (full payload context)', async () => {
    const mealsData = results.step2.data;
    const payload = {
      userId: USER_ID,
      meals: mealsData?.meals || {},
      date: mealsData?.date || new Date().toDateString(),
      version: mealsData?.version || "1.3.7",
      eatenMeals: ["breakfast"]
    };
    return await doFetch(`${BASE_URL}/api/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  });

  // Step 4: POST /api/npc/chat
  results.step4 = await runStep('4. POST /api/npc/chat', async () => {
    const payload = {
      userId: USER_ID,
      message: "съел овсянку 200г"
    };
    return await doFetch(`${BASE_URL}/api/npc/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  });

  // Step 5: GET /api/meals (post-chat state verification)
  results.step5_post_chat = await runStep('5. GET /api/meals (post-chat state verification)', async () => {
    return await doFetch(`${BASE_URL}/api/meals?userId=${USER_ID}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
  });

  const outputPath = path.join(__dirname, 'test_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nResults written to ${outputPath}`);
}

main();
