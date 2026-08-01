const fetch = globalThis.fetch;

const BASE_URL = 'https://new-tracker-orpin.vercel.app';
const TEST_USER_ID = '8319427555';
const REFERRER_USER_ID = '8319427555';
const INVITEE_USER_ID = '99988877711'; // Unique test invitee ID for referral register test

async function runApiTests() {
  const results = {
    flow6: {},
    flow7: {},
    flow8: {}
  };

  console.log('=== STARTING E2E API AUDIT FOR MONETIZATION & FREE LIMITS ===\n');

  // --- FLOW 6: AI Chat Free Limits ---
  console.log('--- AUDITING FLOW 6: AI Chat Free limits ---');
  try {
    // 1. Initial chat limit check
    const limitRes = await fetch(`${BASE_URL}/api/npc/chat-limit?userId=${TEST_USER_ID}`);
    const limitStatus = limitRes.status;
    const limitData = await limitRes.json();
    console.log(`[Flow 6] Initial GET /api/npc/chat-limit status: ${limitStatus}`, limitData);
    
    results.flow6.initialLimitCheck = {
      status: limitStatus,
      payload: limitData
    };

    // Send messages and test limit
    const messagesLog = [];
    let blockedOn4th = false;
    let blockResponsePayload = null;

    for (let i = 1; i <= 4; i++) {
      console.log(`[Flow 6] Sending message #${i}...`);
      const chatRes = await fetch(`${BASE_URL}/api/npc/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID
        },
        body: JSON.stringify({
          userId: TEST_USER_ID,
          message: `Тестовое сообщение #${i} для проверки лимита (${Date.now()})`
        })
      });

      const status = chatRes.status;
      const data = await chatRes.json();
      console.log(`[Flow 6] Message #${i} status: ${status}`, data);

      messagesLog.push({
        messageIndex: i,
        status: status,
        payload: data
      });

      if (i === 4 && status === 403 && data.error === 'FREE_LIMIT') {
        blockedOn4th = true;
        blockResponsePayload = data;
      }
    }

    results.flow6.messagesLog = messagesLog;
    results.flow6.blockedOn4th = blockedOn4th;
    results.flow6.blockResponsePayload = blockResponsePayload;

    // 2. Post-chat limit check
    const finalLimitRes = await fetch(`${BASE_URL}/api/npc/chat-limit?userId=${TEST_USER_ID}`);
    const finalLimitData = await finalLimitRes.json();
    console.log(`[Flow 6] Final GET /api/npc/chat-limit:`, finalLimitData);
    results.flow6.finalLimitCheck = {
      status: finalLimitRes.status,
      payload: finalLimitData
    };

  } catch (err) {
    console.error('[Flow 6] Exception:', err);
    results.flow6.error = err.message;
  }

  // --- FLOW 7: Premium Paywall & Payment Button ---
  console.log('\n--- AUDITING FLOW 7: Premium paywall & payment button ---');
  try {
    console.log('[Flow 7] Testing POST /api/profile/subscribe...');
    const subRes = await fetch(`${BASE_URL}/api/profile/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify({ userId: TEST_USER_ID })
    });

    const subStatus = subRes.status;
    const subData = await subRes.json();
    console.log(`[Flow 7] POST /api/profile/subscribe status: ${subStatus}`, subData);

    results.flow7.subscribeEndpoint = {
      status: subStatus,
      payload: subData,
      hasInvoiceLink: Boolean(subData.invoiceLink && subData.invoiceLink.startsWith('https://t.me/$'))
    };
  } catch (err) {
    console.error('[Flow 7] Exception:', err);
    results.flow7.error = err.message;
  }

  // --- FLOW 8: Referral System ---
  console.log('\n--- AUDITING FLOW 8: Referral System ---');
  try {
    // 1. GET /api/referral/stats
    console.log('[Flow 8] Testing GET /api/referral/stats...');
    const statsRes = await fetch(`${BASE_URL}/api/referral/stats?userId=${TEST_USER_ID}`);
    const statsStatus = statsRes.status;
    const statsData = await statsRes.json();
    console.log(`[Flow 8] GET /api/referral/stats status: ${statsStatus}`, statsData);

    results.flow8.statsEndpoint = {
      status: statsStatus,
      payload: statsData,
      linkMatch: statsData.referral_link === `https://t.me/TrackerCPFC_bot?start=ref_${TEST_USER_ID}`
    };

    // 2. POST /api/referral/register (Test referral tracking)
    console.log('[Flow 8] Testing POST /api/referral/register (invitee registering under referrer)...');
    const regRes = await fetch(`${BASE_URL}/api/referral/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': INVITEE_USER_ID
      },
      body: JSON.stringify({
        userId: INVITEE_USER_ID,
        referrerId: REFERRER_USER_ID,
        username: 'test_referral_bot_user'
      })
    });

    const regStatus = regRes.status;
    const regData = await regRes.json();
    console.log(`[Flow 8] POST /api/referral/register status: ${regStatus}`, regData);

    results.flow8.registerEndpoint = {
      status: regStatus,
      payload: regData
    };

    // Re-check stats for referrer after registration
    const statsAfterRes = await fetch(`${BASE_URL}/api/referral/stats?userId=${TEST_USER_ID}`);
    const statsAfterData = await statsAfterRes.json();
    console.log(`[Flow 8] Stats after registration:`, statsAfterData);
    results.flow8.statsAfterRegistration = statsAfterData;

    // 3. POST /api/referral/redeem (Test redeeming when points < 500)
    console.log('[Flow 8] Testing POST /api/referral/redeem...');
    const redeemRes = await fetch(`${BASE_URL}/api/referral/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify({ userId: TEST_USER_ID })
    });

    const redeemStatus = redeemRes.status;
    const redeemData = await redeemRes.json();
    console.log(`[Flow 8] POST /api/referral/redeem status: ${redeemStatus}`, redeemData);

    results.flow8.redeemEndpoint = {
      status: redeemStatus,
      payload: redeemData
    };

  } catch (err) {
    console.error('[Flow 8] Exception:', err);
    results.flow8.error = err.message;
  }

  // Save results to file
  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.join(__dirname, 'api_test_results.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\nSaved API test results to api_test_results.json');
}

runApiTests();
