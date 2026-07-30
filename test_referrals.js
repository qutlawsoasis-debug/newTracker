async function testReferralFlow() {
  const baseUrl = "https://new-tracker-orpin.vercel.app";
  const referrerId = "8319427555";
  const inviteeId = "test_ref_new";

  console.log("1. Testing POST /api/referral/register...");
  const res1 = await fetch(`${baseUrl}/api/referral/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: inviteeId, referrerId })
  });
  console.log("Status 1:", res1.status);
  const data1 = await res1.json();
  console.log("Response 1:", data1);

  console.log("\n2. Testing GET /api/referral/stats...");
  const res2 = await fetch(`${baseUrl}/api/referral/stats?userId=${referrerId}`);
  console.log("Status 2:", res2.status);
  const data2 = await res2.json();
  console.log("Response 2 (Stats):", data2);
}

testReferralFlow();
