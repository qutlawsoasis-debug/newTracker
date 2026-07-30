const fs = require('fs');

const BASE_URL = 'https://new-tracker-orpin.vercel.app';

async function runTests() {
  const results = [];

  // Case 1: Empty userId
  console.log('Running Test 1: Empty userId GET /api/meals?userId=');
  try {
    const res1 = await fetch(`${BASE_URL}/api/meals?userId=`);
    const status1 = res1.status;
    const contentType1 = res1.headers.get('content-type');
    const text1 = await res1.text();
    let json1 = null;
    try { json1 = JSON.parse(text1); } catch (e) {}

    results.push({
      id: 1,
      name: 'Empty userId',
      request: { method: 'GET', url: '/api/meals?userId=' },
      response: {
        status: status1,
        contentType: contentType1,
        bodyText: text1,
        bodyJson: json1
      }
    });
  } catch (err) {
    results.push({
      id: 1,
      name: 'Empty userId',
      request: { method: 'GET', url: '/api/meals?userId=' },
      error: err.message
    });
  }

  // Case 2: Non-existent userId
  console.log('Running Test 2: Non-existent userId GET /api/meals?userId=999999999');
  try {
    const res2 = await fetch(`${BASE_URL}/api/meals?userId=999999999`);
    const status2 = res2.status;
    const contentType2 = res2.headers.get('content-type');
    const text2 = await res2.text();
    let json2 = null;
    try { json2 = JSON.parse(text2); } catch (e) {}

    results.push({
      id: 2,
      name: 'Non-existent userId',
      request: { method: 'GET', url: '/api/meals?userId=999999999' },
      response: {
        status: status2,
        contentType: contentType2,
        bodyText: text2,
        bodyJson: json2
      }
    });
  } catch (err) {
    results.push({
      id: 2,
      name: 'Non-existent userId',
      request: { method: 'GET', url: '/api/meals?userId=999999999' },
      error: err.message
    });
  }

  // Case 3: Invalid profile payload
  console.log('Running Test 3: Invalid profile payload POST /api/profile');
  try {
    const payload3 = {
      userId: "8319427555",
      age: -5,
      weight: 0,
      height: -100
    };
    const res3 = await fetch(`${BASE_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload3)
    });
    const status3 = res3.status;
    const contentType3 = res3.headers.get('content-type');
    const text3 = await res3.text();
    let json3 = null;
    try { json3 = JSON.parse(text3); } catch (e) {}

    results.push({
      id: 3,
      name: 'Invalid profile payload',
      request: { method: 'POST', url: '/api/profile', body: payload3 },
      response: {
        status: status3,
        contentType: contentType3,
        bodyText: text3,
        bodyJson: json3
      }
    });
  } catch (err) {
    results.push({
      id: 3,
      name: 'Invalid profile payload',
      request: { method: 'POST', url: '/api/profile' },
      error: err.message
    });
  }

  // Case 4: Empty chat message
  console.log('Running Test 4: Empty chat message POST /api/npc/chat');
  try {
    const payload4 = { message: "", userId: "8319427555" };
    const res4 = await fetch(`${BASE_URL}/api/npc/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload4)
    });
    const status4 = res4.status;
    const contentType4 = res4.headers.get('content-type');
    const text4 = await res4.text();
    let json4 = null;
    try { json4 = JSON.parse(text4); } catch (e) {}

    results.push({
      id: 4,
      name: 'Empty chat message',
      request: { method: 'POST', url: '/api/npc/chat', body: payload4 },
      response: {
        status: status4,
        contentType: contentType4,
        bodyText: text4,
        bodyJson: json4
      }
    });
  } catch (err) {
    results.push({
      id: 4,
      name: 'Empty chat message',
      request: { method: 'POST', url: '/api/npc/chat' },
      error: err.message
    });
  }

  // Case 5: Overlong chat message
  console.log('Running Test 5: Overlong chat message POST /api/npc/chat (5000 chars)');
  try {
    const payload5 = { message: "a".repeat(5000), userId: "8319427555" };
    const res5 = await fetch(`${BASE_URL}/api/npc/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload5)
    });
    const status5 = res5.status;
    const contentType5 = res5.headers.get('content-type');
    const text5 = await res5.text();
    let json5 = null;
    try { json5 = JSON.parse(text5); } catch (e) {}

    results.push({
      id: 5,
      name: 'Overlong chat message',
      request: { method: 'POST', url: '/api/npc/chat', bodySummary: 'message of length 5000' },
      response: {
        status: status5,
        contentType: contentType5,
        bodyText: text5.length > 1000 ? text5.substring(0, 1000) + '... (truncated)' : text5,
        bodyJson: json5
      }
    });
  } catch (err) {
    results.push({
      id: 5,
      name: 'Overlong chat message',
      request: { method: 'POST', url: '/api/npc/chat' },
      error: err.message
    });
  }

  fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
  console.log('Test execution complete. Results saved to test_results.json.');
}

runTests();
