const fetch = globalThis.fetch;

const BASE_URL = 'https://new-tracker-orpin.vercel.app';
const FRESH_USER_ID = '8319427555_flow6_fresh_' + Date.now();

async function testFreshUserFlow6() {
  console.log(`=== TESTING FLOW 6 WITH FRESH USER ID: ${FRESH_USER_ID} ===\n`);

  // 0. Create profile for fresh user first so chat won't fail on missing user
  await fetch(`${BASE_URL}/api/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': FRESH_USER_ID },
    body: JSON.stringify({
      userId: FRESH_USER_ID,
      gender: 'M',
      age: 25,
      height: 180,
      weight: 75,
      activity: '1.5',
      goal: 'gain',
      lang: 'ru'
    })
  });

  // 1. Initial limit check
  const initLimitRes = await fetch(`${BASE_URL}/api/npc/chat-limit?userId=${FRESH_USER_ID}`);
  const initLimitData = await initLimitRes.json();
  console.log('Initial limit check (expect 0 count, false limitReached):', initLimitData);

  const messagesLog = [];

  for (let i = 1; i <= 4; i++) {
    console.log(`\nSending Message #${i}...`);
    const chatRes = await fetch(`${BASE_URL}/api/npc/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': FRESH_USER_ID
      },
      body: JSON.stringify({
        userId: FRESH_USER_ID,
        message: `Привет, съел 100 грамм овсянки (тест #${i})`
      })
    });

    const status = chatRes.status;
    const data = await chatRes.json();
    console.log(`Message #${i} -> HTTP ${status}:`, data);

    messagesLog.push({
      messageIndex: i,
      status: status,
      payload: data
    });

    // Check limit after each message
    const checkRes = await fetch(`${BASE_URL}/api/npc/chat-limit?userId=${FRESH_USER_ID}`);
    const checkData = await checkRes.json();
    console.log(`Limit after message #${i}:`, checkData);
  }

  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.join(__dirname, 'flow6_fresh_results.json'),
    JSON.stringify({ freshUserId: FRESH_USER_ID, messagesLog }, null, 2)
  );
  console.log('\nFresh user Flow 6 results saved to flow6_fresh_results.json');
}

testFreshUserFlow6();
