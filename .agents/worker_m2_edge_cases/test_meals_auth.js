const BASE_URL = 'https://new-tracker-orpin.vercel.app';

async function testMealsAuth() {
  const tests = [
    { name: "GET /api/meals?userId=", url: "/api/meals?userId=" },
    { name: "GET /api/meals?userId=null", url: "/api/meals?userId=null" },
    { name: "GET /api/meals?userId=undefined", url: "/api/meals?userId=undefined" },
    { name: "GET /api/meals (no query)", url: "/api/meals" },
    { name: "GET /api/meals (x-user-id header)", url: "/api/meals", headers: { "x-user-id": "8319427555" } },
    { name: "GET /api/meals?userId=8319427555", url: "/api/meals?userId=8319427555" }
  ];

  for (const t of tests) {
    const res = await fetch(`${BASE_URL}${t.url}`, { headers: t.headers });
    const text = await res.text();
    console.log(`=== ${t.name} ===`);
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`ContentType: ${res.headers.get('content-type')}`);
    console.log(`Body: ${text.substring(0, 200)}\n`);
  }
}

testMealsAuth();
