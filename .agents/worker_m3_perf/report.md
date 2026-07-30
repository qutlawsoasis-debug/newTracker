# GainTracker E2E Audit — Performance Testing Report (Agent 3)

**Target Environment**: `https://new-tracker-orpin.vercel.app`  
**Date & Time**: 2026-07-30T22:16:00+02:00  
**Test Suite**: 3 Consecutive Requests per Endpoint (High-Resolution Latency Measurement)

---

## Executive Summary

A automated performance benchmark was executed against 4 target production endpoints of GainTracker. The metrics recorded include HTTP response statuses, high-precision latency (min, max, average response time in milliseconds), content types, and payload verification.

### Performance Overview Table

| # | Endpoint | Method | Params / Payload | Min (ms) | Max (ms) | Avg (ms) | Status Codes | Performance Status |
|---|---|---|---|---|---|---|---|---|
| 1 | `/api/meals` | `GET` | `userId=8319427555` | 2155.32 | 2667.86 | 2343.04 | `200 OK` (3/3) | ⚠️ Работает с замечаниями |
| 2 | `/api/logs` | `GET` | `userId=8319427555` | 257.29 | 1312.58 | 611.93 | `200 OK` (3/3) | ✅ Работает корректно |
| 3 | `/api/changelog` | `GET` | *(none)* | 144.35 | 195.87 | 162.97 | `500 Error` (3/3) | ❌ Сломано |
| 4 | `/api/npc/chat` | `POST` | `userId=8319427555`, `message="привет"` | 622.59 | 755.85 | 708.99 | `200 OK` (3/3) | ✅ Работает корректно |

---

## Detailed Endpoint Breakdown & Metric Analysis

### 1. `GET /api/meals` (userId=8319427555)
- **Status**: ⚠️ Работает с замечаниями
- **Response Status**: `200 OK` (100% success rate)
- **Latencies**:
  - Run 1: `2205.95 ms`
  - Run 2: `2667.86 ms`
  - Run 3: `2155.32 ms`
  - **Min**: `2155.32 ms` | **Max**: `2667.86 ms` | **Avg**: `2343.04 ms`
- **Content-Type**: `application/json; charset=utf-8`
- **Analysis & Bottlenecks**:
  - The endpoint works functional-wise and returns valid meal plan data.
  - **Bottleneck**: Consistently high response latency exceeding 2.1 seconds per request (average 2343 ms). This delay occurs because the backend executes profile database checks, Gemini AI menu generation or validation, and Supabase synchronization on each request. High latency creates a slow initial user experience when loading the meal tracker dashboard.

---

### 2. `GET /api/logs` (userId=8319427555)
- **Status**: ✅ Работает корректно
- **Response Status**: `200 OK` (100% success rate)
- **Latencies**:
  - Run 1: `265.91 ms`
  - Run 2: `1312.58 ms`
  - Run 3: `257.29 ms`
  - **Min**: `257.29 ms` | **Max**: `1312.58 ms` | **Avg**: `611.93 ms`
- **Content-Type**: `application/json; charset=utf-8`
- **Analysis & Bottlenecks**:
  - Baseline response latency is very fast (~257–265 ms).
  - Run 2 experienced a transient spike to 1312.58 ms due to server database query overhead / cold start, bringing the 3-run average to 611.93 ms.
  - Returns structured audit logs (`{"logs": [...]}`) correctly.

---

### 3. `GET /api/changelog` (unauthenticated call without userId)
- **Status**: ❌ Сломано
- **Response Status**: `500 Internal Server Error` (0% success rate)
- **Latencies**:
  - Run 1: `148.68 ms`
  - Run 2: `195.87 ms`
  - Run 3: `144.35 ms`
  - **Min**: `144.35 ms` | **Max**: `195.87 ms` | **Avg**: `162.97 ms`
- **Content-Type**: `text/html; charset=utf-8`
- **Analysis & Bottlenecks**:
  - **Critical Defect**: The endpoint fails consistently with `500 Internal Server Error` on public requests without `userId`.
  - **Root Cause**: The backend attaches strict `requireAuth` middleware to `/api/changelog`. When `userId` parameter is omitted from the request URL, unhandled exceptions or Vercel serverless gateway handling convert the missing parameter check into a 500 Server Error page (`<pre>Internal Server Error</pre>`).
  - *Secondary Probe Verification*: When `userId=8319427555` is explicitly passed (`GET /api/changelog?userId=8319427555`), the endpoint returns `200 OK` with JSON `{"version":"1.3.7", "points":[...]}`. However, as public changelogs should generally be accessible without user identification, enforcing mandatory `userId` and crashing with 500 represents a backend implementation bug.

---

### 4. `POST /api/npc/chat` (userId=8319427555, message: "привет")
- **Status**: ✅ Работает корректно
- **Response Status**: `200 OK` (100% success rate)
- **Latencies**:
  - Run 1: `755.85 ms`
  - Run 2: `622.59 ms`
  - Run 3: `748.52 ms`
  - **Min**: `622.59 ms` | **Max**: `755.85 ms` | **Avg**: `708.99 ms`
- **Content-Type**: `application/json; charset=utf-8`
- **Analysis & Bottlenecks**:
  - High performance for an LLM-backed endpoint. Generates dynamic AI persona responses within ~620–755 ms (average 708.99 ms).
  - Returns clean JSON output format: `{"text": "...", "food_log": null}`.

---

## Performance Recommendations

1. **Optimize `/api/meals` Caching**:
   - Cache daily meal plans aggressively in Redis / Supabase edge cache so that repeated GET requests do not trigger recalculations or external LLM/DB queries. This will bring latency from > 2.3s down to < 200 ms.

2. **Fix `/api/changelog` Auth Requirement**:
   - Remove `requireAuth` from `/api/changelog` or provide a graceful fallback so that public users can view app update notes without requiring a valid `userId`. Ensure proper error handling to prevent 500 Internal Server Error crashes.
