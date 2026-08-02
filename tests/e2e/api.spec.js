import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
const TEST_USER_ID = 'e2e_test_user_playwright';

test.describe('API — базовые сценарии', () => {

  test('GET /api/meals без userId возвращает 401', async ({ request }) => {
    const res = await request.get(`${BASE}/api/meals`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/meals с несуществующим userId возвращает isNewUser', async ({ request }) => {
    const res = await request.get(`${BASE}/api/meals?userId=nonexistent_99999`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.isNewUser).toBe(true);
  });

  test('POST /api/profile — невалидный возраст отклоняется', async ({ request }) => {
    const res = await request.post(`${BASE}/api/profile`, {
      data: { userId: TEST_USER_ID, gender: 'M', age: -5, height: 180, weight: 70, activity: 1.375, goal: 'gain' }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/age/i);
  });

  test('POST /api/profile — невалидный вес отклоняется', async ({ request }) => {
    const res = await request.post(`${BASE}/api/profile`, {
      data: { userId: TEST_USER_ID, gender: 'M', age: 22, height: 180, weight: -10, activity: 1.375, goal: 'gain' }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/weight/i);
  });

  test('POST /api/npc/chat — сообщение длиннее 2000 символов отклоняется', async ({ request }) => {
    const res = await request.post(`${BASE}/api/npc/chat`, {
      data: { userId: TEST_USER_ID, message: 'а'.repeat(2001) }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/too long/i);
  });

  test('GET /api/changelog доступен без авторизации', async ({ request }) => {
    const res = await request.get(`${BASE}/api/changelog`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.version).toBeDefined();
    expect(body.points).toBeInstanceOf(Array);
  });

  test('GET /api/referral/raw-tables больше не существует', async ({ request }) => {
    const res = await request.get(`${BASE}/api/referral/raw-tables`);
    const body = await res.json().catch(() => ({}));
    expect(body.referrals).toBeUndefined();
  });

  test('POST /api/referral/redeem без авторизации возвращает 401', async ({ request }) => {
    const res = await request.post(`${BASE}/api/referral/redeem`, {
      data: {}
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/logs без авторизации возвращает 401', async ({ request }) => {
    const res = await request.get(`${BASE}/api/logs`);
    expect(res.status()).toBe(401);
  });

});
