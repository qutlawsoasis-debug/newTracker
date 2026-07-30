const fs = require('fs');

const BASE_URL = 'https://new-tracker-orpin.vercel.app';

async function runExpandedTests() {
  const testCases = [
    {
      id: "1a",
      name: "Empty userId parameter (GET /api/meals?userId=)",
      method: "GET",
      url: "/api/meals?userId="
    },
    {
      id: "1b",
      name: "Missing userId parameter entirely (GET /api/meals)",
      method: "GET",
      url: "/api/meals"
    },
    {
      id: "2",
      name: "Non-existent userId (GET /api/meals?userId=999999999)",
      method: "GET",
      url: "/api/meals?userId=999999999"
    },
    {
      id: "3a",
      name: "Invalid profile - age -5, weight 0 (POST /api/profile)",
      method: "POST",
      url: "/api/profile",
      headers: { "Content-Type": "application/json" },
      body: { userId: "8319427555", age: -5, weight: 0 }
    },
    {
      id: "3b",
      name: "Invalid profile - negative values all present (POST /api/profile)",
      method: "POST",
      url: "/api/profile",
      headers: { "Content-Type": "application/json" },
      body: { userId: "8319427555", gender: "M", age: -5, height: -180, weight: -70, activity: 1.2, goal: "gain", lang: "ru" }
    },
    {
      id: "4",
      name: "Empty chat message (POST /api/npc/chat)",
      method: "POST",
      url: "/api/npc/chat",
      headers: { "Content-Type": "application/json" },
      body: { userId: "8319427555", message: "" }
    },
    {
      id: "5a",
      name: "Overlong chat message 5000 chars (POST /api/npc/chat)",
      method: "POST",
      url: "/api/npc/chat",
      headers: { "Content-Type": "application/json" },
      body: { userId: "8319427555", message: "a".repeat(5000) }
    },
    {
      id: "5b",
      name: "Extreme chat message 50000 chars (POST /api/npc/chat)",
      method: "POST",
      url: "/api/npc/chat",
      headers: { "Content-Type": "application/json" },
      body: { userId: "8319427555", message: "a".repeat(50000) }
    }
  ];

  const results = [];

  for (const tc of testCases) {
    console.log(`Executing ${tc.id}: ${tc.name}...`);
    const options = { method: tc.method };
    if (tc.headers) options.headers = tc.headers;
    if (tc.body) options.body = JSON.stringify(tc.body);

    try {
      const startTime = Date.now();
      const res = await fetch(`${BASE_URL}${tc.url}`, options);
      const durationMs = Date.now() - startTime;
      const status = res.status;
      const statusText = res.statusText;
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch (e) {}

      results.push({
        id: tc.id,
        name: tc.name,
        request: {
          method: tc.method,
          url: tc.url,
          body: tc.body ? (JSON.stringify(tc.body).length > 200 ? `${JSON.stringify(tc.body).substring(0, 200)}...` : tc.body) : undefined
        },
        response: {
          status,
          statusText,
          contentType,
          durationMs,
          bodyText: text.length > 500 ? `${text.substring(0, 500)}... (truncated, total length ${text.length})` : text,
          bodyJson: json
        }
      });
    } catch (err) {
      results.push({
        id: tc.id,
        name: tc.name,
        request: { method: tc.method, url: tc.url },
        error: err.message
      });
    }
  }

  fs.writeFileSync('test_expanded_results.json', JSON.stringify(results, null, 2));
  console.log('Expanded tests complete. Saved to test_expanded_results.json.');
}

runExpandedTests();
