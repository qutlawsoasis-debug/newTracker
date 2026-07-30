async function testVercel() {
  try {
    const res = await fetch('https://new-tracker-orpin.vercel.app/api/meals?userId=test_new_user_001');
    console.log('Vercel status:', res.status);
    const text = await res.text();
    console.log('Vercel response snippet:', text.slice(0, 300));
  } catch (err) {
    console.error('Vercel fetch error:', err);
  }
}
testVercel();
