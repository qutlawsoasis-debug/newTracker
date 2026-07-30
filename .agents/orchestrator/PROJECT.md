# Project Plan: GainTracker End-to-End Audit & Integration Testing

## Overview
GainTracker target URL: https://new-tracker-orpin.vercel.app
Test User ID: 8319427555
New Test User ID: test_new_user_001
Integrity mode: development

## Architecture & Scope
E2E Audit split across 4 dedicated testing tracks:
1. Agent 1: New User Simulator (HTTP user journey for test_new_user_001)
2. Agent 2: Edge Case Tester (Boundary & invalid inputs)
3. Agent 3: Performance Tester (3 consecutive requests per endpoint latency metrics)
4. Agent 4: Data Integrity & Cleanup Checker (Supabase database verification & cleanup)

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: New User Journey | POST /api/profile, GET /api/meals, POST /api/meals, POST /api/npc/chat | None | PLANNED |
| 2 | M2: Edge Case Testing | Empty userId, non-existent userId, invalid profile payload, empty chat, overlong chat | None | PLANNED |
| 3 | M3: Performance Testing | 3 runs each for GET /api/meals, GET /api/logs, GET /api/changelog, POST /api/npc/chat | None | PLANNED |
| 4 | M4: Data Integrity & Cleanup | Verify test_new_user_001 profile, daily_plan, app_logs in Supabase, then delete test records | M1 | PLANNED |
| 5 | M5: Audit Report | Consolidate reports into ✅ Работает корректно, ⚠️ Работает с замечаниями, ❌ Сломано | M1, M2, M3, M4 | PLANNED |

## Code Layout
Test scripts and agent artifacts reside in `.agents/<agent_folder>/`. No source code modifications allowed without subagents.

## Verification Requirements
Workers will execute Node.js HTTP/API scripts or cURL calls against https://new-tracker-orpin.vercel.app and direct Supabase database checks using `@supabase/supabase-js` or fetch calls to Supabase REST API with `SUPABASE_SERVICE_ROLE_KEY`.
