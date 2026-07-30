# Original User Request

## Initial Request — 2026-07-30T20:14:10Z

Run a complete end-to-end audit and integration test suite of GainTracker on Vercel.

Working directory: C:\Users\magne\Documents\GitHub\newTracker
Base URL: https://new-tracker-orpin.vercel.app
Test User ID: 8319427555
Integrity mode: development

ROLES AND TASKS:

Agent 1 — New User Simulator:
Simulate a full new user journey from scratch using HTTP requests:
1. POST /api/profile with userId: "test_new_user_001", body: {"userId":"test_new_user_001","gender":"M","age":22,"height":180,"weight":65,"activity":1.375,"goal":"gain"}
2. GET /api/meals?userId=test_new_user_001 (verify menu generation)
3. POST /api/meals marking breakfast eaten (eatenMeals: ["breakfast"])
4. POST /api/npc/chat (message: "съел овсянку 200г")
Record: step status, response time, response payload validity.

Agent 2 — Edge Case Tester:
Test system boundary conditions:
1. Empty userId: GET /api/meals?userId=
2. Non-existent userId: GET /api/meals?userId=999999999
3. Invalid profile payload: POST /api/profile (age: -5, weight: 0)
4. Empty chat message: POST /api/npc/chat (message: "")
5. Overlong chat message: POST /api/npc/chat (message: "a".repeat(5000))
Determine for each case whether server response is correct behavior or a bug.

Agent 3 — Performance Tester:
Execute 3 consecutive requests per endpoint and measure min, max, average response time:
- GET /api/meals
- GET /api/logs
- GET /api/changelog
- POST /api/npc/chat
Identify performance bottlenecks.

Agent 4 — Data Integrity Checker:
Verify database persistence and cleanup in Supabase:
1. Was test_new_user_001 profile created?
2. Was daily_plan for test_new_user_001 created?
3. Were logs recorded in app_logs?
4. Clean up test_new_user_001 test records after verification.

DELIVERABLE:
Deliver an E2E Audit Report consolidating findings from all 4 agents categorized into:
✅ Работает корректно
⚠️ Работает с замечаниями
❌ Сломано
