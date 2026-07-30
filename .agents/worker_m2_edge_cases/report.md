# GainTracker E2E Audit — Edge Case & Boundary Testing Report

**Target Environment**: `https://new-tracker-orpin.vercel.app`  
**Tester Agent**: Agent 2 (Edge Case Tester)  
**Date**: 2026-07-30  
**Status**: Audit Complete  

---

## Executive Summary

A comprehensive boundary condition and invalid input security/functionality audit was conducted on the GainTracker production API (`https://new-tracker-orpin.vercel.app`). Five target edge cases were executed and analyzed against system handlers located in `server.js`.

### Audit Overview Table

| # | Edge Case | Target Endpoint | HTTP Status | Response Format | Categorization | Key Findings / Root Cause |
|---|---|---|---|---|---|---|
| 1 | Empty `userId` | `GET /api/meals?userId=` | `500 Internal Server Error` | `text/html` | ❌ **Сломано** | Uncaught `TypeError: Cannot read properties of undefined (reading 'userId')` in `requireAuth` middleware due to accessing `req.body.userId` on GET requests where `req.body` is `undefined`. |
| 2 | Non-existent `userId` | `GET /api/meals?userId=999999999` | `200 OK` | `application/json` | ✅ **Работает корректно** | Returns `{"meals":null,"profile":null}`. Gracefully handles unknown user accounts for Telegram WebApp onboarding flow. |
| 3 | Invalid profile payload | `POST /api/profile` (`age: -5, weight: 0`) | `400 Bad Request` | `application/json` | ⚠️ **Работает с замечаниями** | Rejects `weight: 0` with 400 Bad Request, but error message says `"Missing profile parameters"` because of truthiness check `!weight`. Negative non-zero inputs bypass truthiness check, causing negative calorie calculation and Groq AI refusal. |
| 4 | Empty chat message | `POST /api/npc/chat` (`message: ""`) | `400 Bad Request` | `application/json` | ✅ **Работает корректно** | Correctly validates empty message & missing image, returning 400 Bad Request with JSON error payload. |
| 5 | Overlong chat message | `POST /api/npc/chat` (`5,000` & `50,000` chars) | `200 OK` | `application/json` | ⚠️ **Работает с замечаниями** | AI processes large prompt gracefully with valid response, but no server-side max length validation exists, exposing endpoint to token depletion / high API cost risk. |

---

## Detailed Test Case Findings

---

### Test Case 1: Empty `userId` Query Parameter
- **Endpoint**: `GET /api/meals?userId=`
- **HTTP Method**: `GET`
- **Expected Result**: `401 Unauthorized` with JSON error payload `{"error": "Unauthorized: Missing telegram_id (userId)"}`
- **Actual Status Code**: `500 Internal Server Error`
- **Response Content-Type**: `text/html; charset=utf-8`
- **Raw Response Body**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Internal Server Error</pre>
</body>
</html>
```

#### Code Analysis & Root Cause (`server.js:157-166`)
```javascript
const requireAuth = (req, res, next) => {
  const rawUserId = req.query.userId || req.body.userId || req.headers['x-user-id'];
  if (!rawUserId || rawUserId === 'undefined' || rawUserId === 'null') {
    console.warn(`[SECURITY] Blocked anonymous request to ${req.originalUrl}`);
    return res.status(401).json({ error: 'Unauthorized: Missing telegram_id (userId)' });
  }
  req.user = { id: String(rawUserId).trim() };
  next();
};
```
- **Vulnerability**: Unsafe property access on `req.body`. On GET requests, Express does not parse a body, so `req.body` is `undefined`.
- When `req.query.userId` is `""` (empty string, falsy), JavaScript evaluates the second expression operand: `req.body.userId`.
- Evaluating `undefined.userId` throws an uncaught JavaScript runtime exception: `TypeError: Cannot read properties of undefined (reading 'userId')`.
- This unhandled exception crashes the request pipeline and causes Vercel / Express to return a 500 Internal Server Error HTML page.
- **Categorization**: ❌ **Сломано**

---

### Test Case 2: Non-Existent `userId` Query Parameter
- **Endpoint**: `GET /api/meals?userId=999999999`
- **HTTP Method**: `GET`
- **Expected Result**: `200 OK` with null data structures or `404 Not Found`
- **Actual Status Code**: `200 OK`
- **Response Content-Type**: `application/json; charset=utf-8`
- **Raw Response Body**:
```json
{
  "meals": null,
  "profile": null
}
```

#### Code Analysis & Server Behavior (`server.js:1158-1175`)
- `requireAuth` passes because `"999999999"` is a valid string.
- Supabase query `supabase.from('profiles').select('*').eq('telegram_id', '999999999').maybeSingle()` executes and returns `pData = null`.
- The handler cleanly handles the absent database row and returns a 200 OK status with empty JSON schema (`{"meals":null,"profile":null}`).
- This design choice enables Telegram WebApp frontend to seamlessly detect new/unregistered users and render the profile wizard without triggering frontend error boundaries.
- **Categorization**: ✅ **Работает корректно**

---

### Test Case 3: Invalid Profile Payload
- **Endpoint**: `POST /api/profile`
- **HTTP Method**: `POST`
- **Payload Tested**: `{ "userId": "8319427555", "age": -5, "weight": 0 }`
- **Actual Status Code**: `400 Bad Request`
- **Response Content-Type**: `application/json; charset=utf-8`
- **Raw Response Body**:
```json
{
  "error": "Bad Request: Missing profile parameters"
}
```

#### Code Analysis & Secondary Boundary Flaw (`server.js:1048-1070`)
```javascript
app.post('/api/profile', requireAuth, async (req, res) => {
  const { gender, age, height, weight, activity, goal, lang } = req.body;
  
  if (!gender || !age || !height || !weight || !activity || !goal) {
    return res.status(400).json({ error: 'Bad Request: Missing profile parameters' });
  }
```
1. **Flaw 1 (Truthiness Misclassification)**: `weight: 0` evaluates `!0` as `true`. The server rejects `weight: 0`, but classifies it as a missing parameter (`Missing profile parameters`) rather than performing numeric range validation.
2. **Flaw 2 (Bypass with Negative Non-Zero Values)**:
   When tested with negative non-zero values (`{ "gender": "M", "age": -5, "height": -180, "weight": -70, "activity": 1.2, "goal": "gain" }`), `!age` and `!weight` evaluate to `false`.
   The server bypasses validation, calculates a negative target calorie count (`-1654 kcal`), and sends the request to Groq LLM API. Groq detects the invalid numerical context and returns an anti-jailbreak refusal: `{"error":"Invalid context. Only German dietary assistance allowed."}`.
- **Categorization**: ⚠️ **Работает с замечаниями**

---

### Test Case 4: Empty Chat Message
- **Endpoint**: `POST /api/npc/chat`
- **HTTP Method**: `POST`
- **Payload Tested**: `{ "userId": "8319427555", "message": "" }`
- **Actual Status Code**: `400 Bad Request`
- **Response Content-Type**: `application/json; charset=utf-8`
- **Raw Response Body**:
```json
{
  "error": "Bad Request: Missing userId, message or image"
}
```

#### Code Analysis & Server Behavior (`server.js:939-941`)
```javascript
if (!userId || (!message && !image)) {
  return res.status(400).json({ error: 'Bad Request: Missing userId, message or image' });
}
```
- When `message: ""` and `image` is omitted, `(!message && !image)` evaluates to `true`.
- The server halts execution prior to making any external LLM API calls and responds immediately with `400 Bad Request` and structured JSON error details.
- **Categorization**: ✅ **Работает корректно**

---

### Test Case 5: Overlong Chat Message
- **Endpoint**: `POST /api/npc/chat`
- **HTTP Method**: `POST`
- **Payload Tested**: 5,000 characters and 50,000 characters payload (`message: "a".repeat(50000)`)
- **Actual Status Code**: `200 OK`
- **Response Content-Type**: `application/json; charset=utf-8`
- **Raw Response Body**:
```json
{
  "text": "Ох, отлично. Ты просто перехвалил меня своим бессмысленным текстом. Теперь, если ты согласен, давай поговорим о том, что тебя действительно интересует - фитнесе или питании?",
  "food_log": null
}
```

#### Code Analysis & Resource Impact (`server.js:950-975`)
- Server has no input length check or character limit validation (e.g. `if (message.length > 2000)`).
- Large payloads (50,000 chars) are constructed directly into `textPrompt` and dispatched to Groq AI (`llama-3.3-70b-versatile`).
- While Groq AI handled the input without crashing and returned a valid, witty response, forwarding unlimited string lengths to third-party paid AI models exposes the system to token quota exhaustion, high latency (2.6 seconds per request), and denial-of-wallet / cost amplification risks.
- **Categorization**: ⚠️ **Работает с замечаниями**

---

## Actionable Remediation Recommendations

1. **Fix `requireAuth` Optional Chaining (High Priority / Fixes Bug #1)**:
   Update `server.js:158`:
   ```javascript
   // Recommended fix:
   const rawUserId = req.query?.userId || req.body?.userId || req.headers['x-user-id'];
   ```
2. **Implement Explicit Numeric Schema Validation (Medium Priority / Fixes Bug #3)**:
   Replace truthiness checks with explicit range and type checks:
   ```javascript
   if (!gender || typeof age !== 'number' || age <= 0 || typeof height !== 'number' || height <= 0 || typeof weight !== 'number' || weight <= 0) {
     return res.status(400).json({ error: 'Bad Request: age, height, and weight must be positive numbers' });
   }
   ```
3. **Add Input Truncation / Max Length Guards for Chat API (Medium Priority / Fixes Bug #5)**:
   Truncate or reject oversized chat messages before invoking Groq LLM:
   ```javascript
   if (message && message.length > 2000) {
     return res.status(400).json({ error: 'Bad Request: Message exceeds max length of 2000 characters' });
   }
   ```
