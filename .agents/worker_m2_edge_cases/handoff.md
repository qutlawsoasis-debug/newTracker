# 5-Component Handoff Report

## 1. Observation

### Test Execution Commands & Outputs
Executed Node.js automated test suites (`test_edge_cases.js` and `test_expanded.js`) targeting live production deployment at `https://new-tracker-orpin.vercel.app`.

#### Case 1: `GET /api/meals?userId=`
- **Command**: `fetch('https://new-tracker-orpin.vercel.app/api/meals?userId=')`
- **HTTP Status**: `500 Internal Server Error`
- **Content-Type**: `text/html; charset=utf-8`
- **Body**: `<pre>Internal Server Error</pre>`

#### Case 2: `GET /api/meals?userId=999999999`
- **Command**: `fetch('https://new-tracker-orpin.vercel.app/api/meals?userId=999999999')`
- **HTTP Status**: `200 OK`
- **Content-Type**: `application/json; charset=utf-8`
- **Body**: `{"meals":null,"profile":null}`

#### Case 3: `POST /api/profile` (invalid payload)
- **Command**: `fetch('https://new-tracker-orpin.vercel.app/api/profile', { method: 'POST', body: JSON.stringify({ userId: "8319427555", age: -5, weight: 0 }) })`
- **HTTP Status**: `400 Bad Request`
- **Content-Type**: `application/json; charset=utf-8`
- **Body**: `{"error":"Bad Request: Missing profile parameters"}`
- **Negative Values Payload**: `{ userId: "8319427555", gender: "M", age: -5, height: -180, weight: -70, activity: 1.2, goal: "gain" }`
- **HTTP Status**: `400 Bad Request`
- **Body**: `{"error":"Invalid context. Only German dietary assistance allowed."}`

#### Case 4: `POST /api/npc/chat` (empty message)
- **Command**: `fetch('https://new-tracker-orpin.vercel.app/api/npc/chat', { method: 'POST', body: JSON.stringify({ userId: "8319427555", message: "" }) })`
- **HTTP Status**: `400 Bad Request`
- **Content-Type**: `application/json; charset=utf-8`
- **Body**: `{"error":"Bad Request: Missing userId, message or image"}`

#### Case 5: `POST /api/npc/chat` (overlong message)
- **Command**: `fetch('https://new-tracker-orpin.vercel.app/api/npc/chat', { method: 'POST', body: JSON.stringify({ userId: "8319427555", message: "a".repeat(50000) }) })`
- **HTTP Status**: `200 OK`
- **Content-Type**: `application/json; charset=utf-8`
- **Body**: `{"text":"Ох, отлично. Ты просто перехвалил меня своим бессмысленным текстом...","food_log":null}`

### Source Code Findings (`server.js`)
- `server.js:158`: `const rawUserId = req.query.userId || req.body.userId || req.headers['x-user-id'];`
- `server.js:939`: `if (!userId || (!message && !image))`
- `server.js:1048`: `if (!gender || !age || !height || !weight || !activity || !goal)`
- `server.js:1158`: `app.get('/api/meals', requireAuth, async (req, res) => {`

---

## 2. Logic Chain

1. **Step 1**: On `GET /api/meals?userId=`, `req.query.userId` evaluates to `""` (empty string, which is falsy in JavaScript).
2. **Step 2**: The expression `req.query.userId || req.body.userId` attempts to evaluate the second operand (`req.body.userId`) because the first operand is falsy.
3. **Step 3**: On HTTP GET requests, Express does not parse a body payload, making `req.body` equal to `undefined`.
4. **Step 4**: Evaluating `undefined.userId` throws an unhandled JavaScript runtime `TypeError: Cannot read properties of undefined (reading 'userId')`, crashing the handler and causing Express / Vercel to return a `500 Internal Server Error` HTML page.
5. **Step 5**: On `GET /api/meals?userId=999999999`, `rawUserId` is truthy, `requireAuth` passes, Supabase returns `null` for unknown `telegram_id`, and server returns 200 OK with `{"meals":null,"profile":null}`. This is clean behavior for frontend user onboarding.
6. **Step 6**: On `POST /api/profile` with `weight: 0`, `!weight` evaluates to `true` (since `0` is falsy), triggering `if (!gender || !age || !height || !weight || !activity || !goal)` and returning `400 Bad Request: Missing profile parameters`. When negative non-zero values are supplied (`weight: -70`), truthiness check passes, calculating negative calories and triggering Groq LLM refusal `{"error":"Invalid context. Only German dietary assistance allowed."}`.
7. **Step 7**: On `POST /api/npc/chat` with `message: ""`, `!message && !image` evaluates to `true`, returning `400 Bad Request: Missing userId, message or image`.
8. **Step 8**: On `POST /api/npc/chat` with 50,000 characters, no length validation exists in `server.js:935-975`, so the entire string is dispatched to Groq LLM, which succeeds with 200 OK but wastes tokens and increases latency (2.6s).

---

## 3. Caveats

- Tests were run against the live production deployment (`https://new-tracker-orpin.vercel.app`) using Node.js `fetch`.
- Rate limits on Groq API were not triggered during test execution, but sending larger payloads (e.g. megabyte strings) may trigger Vercel body size limit (4.5MB) or Groq context length limit.
- Database state in Supabase was not directly modified or inspected beyond response payloads returned by the API.

---

## 4. Conclusion

- **Case 1 (`GET /api/meals?userId=`)**: ❌ **Сломано** — Critical server crash (500 Error HTML) caused by unhandled `TypeError` in `requireAuth` (`req.body.userId`).
- **Case 2 (`GET /api/meals?userId=999999999`)**: ✅ **Работает корректно** — Returns 200 OK with `{"meals":null,"profile":null}`.
- **Case 3 (`POST /api/profile`)**: ⚠️ **Работает с замечаниями** — Rejects invalid payloads with 400 Bad Request, but relies on truthiness `!param` rather than type/range validation, leading to misleading error text and bypass on negative numbers.
- **Case 4 (`POST /api/npc/chat`)**: ✅ **Работает корректно** — Rejects empty message with 400 Bad Request JSON error.
- **Case 5 (`POST /api/npc/chat`)**: ⚠️ **Работает с замечаниями** — Handles 50,000 chars gracefully with 200 OK, but lacks max length truncation, exposing system to LLM cost risks.

---

## 5. Verification Method

To independently verify these findings:

1. **Run Expanded Edge Case Test Suite**:
   ```bash
   cd C:\Users\magne\Documents\GitHub\newTracker\.agents\worker_m2_edge_cases
   node test_expanded.js
   ```
2. **Inspect Raw Response File**:
   View `C:\Users\magne\Documents\GitHub\newTracker\.agents\worker_m2_edge_cases\test_expanded_results.json` to verify recorded status codes, response headers, durations, and body contents.
3. **Verify Middleware TypeError locally**:
   ```bash
   node -e "const req = { query: { userId: '' }, headers: {} }; const raw = req.query.userId || req.body.userId;"
   ```
   Output: `TypeError: Cannot read properties of undefined (reading 'userId')`
