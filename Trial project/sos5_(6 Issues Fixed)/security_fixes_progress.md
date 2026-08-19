# Security Fixes Progress
## saas_cafe_ordering_v5 — NexOp Café SaaS
**Started:** 2026-08-10  
**Last Updated:** 2026-08-11  

---

## Overall Progress

| Fixed | Remaining | Total |
|---|---|---|
| 6 | 3 | 9 |

---

## ✅ Completed Fixes

---

### Fix #1 — Item Prices Trusted from Client
**Severity:** CRITICAL  
**File:** `backend/controllers/paymentController.js`

**Problem:**  
`calculateTotal(items)` used `item.price` and `item.selectedOptions[].price` directly from the request body. A customer could send `price: 0.01` for a ₹500 item — the Razorpay order would be created at the tampered price, payment would succeed, and the signature verification would pass.

**Fix:**  
For every item in the order, fetch `MenuItem.findOne({ _id: item._id, cafeId })` from the database and use the **DB price**, **DB name**, and **DB option prices** — never the client-supplied values. If any item is not found or doesn't belong to the café, the order is rejected. `verifiedItems` (not the raw `items` array) is passed to `calculateTotal` and stored in the Order document.

**Side effects fixed:**  
- Item names are now taken from DB (client can no longer inject arbitrary names into order records)
- Selected options are validated against the DB option definitions

---

### Fix #2 — `GET /api/cafes/:id` Over-Exposes Cafe Document
**Severity:** CRITICAL  
**File:** `backend/routes/cafeRoutes.js`

**Problem:**  
The public endpoint used by the customer menu called `.select("-password")` which still returned: `secretAnswer` (bcrypt hash), `secretQuestion`, `resetToken` (raw — active takeover vector if reset is in progress), `resetTokenExpiry`, encrypted Razorpay keys, `googleId`, and all business PII.

**Fix:**  
Changed `.select()` to an explicit allowlist of only the 6 fields the customer menu UI actually needs:
```js
.select("name logo themeColor totalTables description category")
```
Added `mongoose.Types.ObjectId.isValid()` guard to return 400 instead of a Mongoose CastError 500 on invalid IDs. Also added `const mongoose = require("mongoose")` import which was missing and causing a crash (returning `[]` instead of café data).

**Side effects fixed:**  
- Invalid cafeId now returns clean 400 instead of 500
- `err.message` no longer leaked in error responses

---

### Fix #3 — `GET /api/orders/:id` Unauthenticated + No Tenant Scope
**Severity:** CRITICAL  
**Files:** `backend/routes/orderRoutes.js`, `backend/controllers/orderController.js`

**Problem:**  
`Order.findById(req.params.id)` with no authentication middleware and no cafeId scope. Anyone who knew or guessed a MongoDB ObjectId could read any order in the entire database across all cafés.

**Fix:**  
Endpoint was removed entirely — it was dead code not used anywhere in the frontend. Removed the route from `orderRoutes.js` and removed `getOrderById` from `orderController.js` and its import.

**Note for future:**  
If a single-order lookup is ever needed (e.g. receipt page), add it back with: `auth` middleware + `Order.findOne({ _id, cafeId: req.cafeId })` compound query + ObjectId validation.

---

### Fix #4 — Socket.IO Rooms Open to Anyone
**Severity:** CRITICAL  
**Files:** `backend/server.js`, `frontend/src/lib/socket.js`

**Problem:**  
The `joinCafe` handler had zero authentication. Any unauthenticated WebSocket client could emit `joinCafe(anyCafeId)` and receive all live order events (full order data — items, prices, table numbers, Razorpay IDs) for any café indefinitely.

**Fix (backend `server.js`):**  
Added `io.use()` middleware that verifies the JWT from `socket.handshake.auth.token` on every connection. Stores `socket.cafeId` and `socket.isAdmin` on the socket object. In the `joinCafe` handler, checks `socket.isAdmin && socket.cafeId === cafeId` — disconnects the socket immediately if either check fails.

**Fix (frontend `lib/socket.js`):**  
Changed `auth` from a static object (evaluated once at import time — always `null` for new logins) to a callback function evaluated on every (re)connection:
```js
auth: (cb) => {
  cb({ token: localStorage.getItem("token") || null });
}
```
This ensures the token is picked up correctly after Google OAuth redirects and normal logins.

**Behaviour after fix:**  
- Admin dashboard sockets: JWT verified, can only join their own café's room
- Customer sockets (no token): `joinCafe` disconnects them immediately
- Cross-café attack: rejected — `socket.cafeId !== cafeId`

---

### Fix #5 — Password Reset Token in HTTP Response
**Severity:** HIGH  
**Files:** `backend/routes/authRoutes.js`, `backend/config/mailer.js` (new), `frontend/src/pages/ForgotPassword.jsx`

**Problem:**  
`/auth/verify-secret` returned the raw reset token directly in the response body (`res.json({ resetToken: rawToken })`). The token was stored in browser network logs, server access logs, proxy/WAF logs, and API monitoring tools. The raw token was also stored in the database (not hashed).

**Fix (backend):**  
- Installed `nodemailer`
- Created `backend/config/mailer.js` with `sendResetEmail()` using Gmail SMTP
- In `/auth/verify-secret`: generate raw token → hash it with SHA-256 → store **hash** in DB → send **raw token** via email → return only `{ message: "Password reset link sent to your email." }`
- In `/auth/reset-password`: hash the submitted token before DB lookup — comparison is always hash-vs-hash

**Fix (frontend `ForgotPassword.jsx`):**  
- Added `STEP.DONE` state
- `handleAnswerSubmit` no longer reads `res.data.resetToken` or navigates with token in URL
- On success, moves to DONE step showing "Check your email" UI
- Reset link in email goes directly to `/reset-password?token=<rawToken>`

**Environment variables added to `backend/.env`:**
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_gmail@gmail.com
MAIL_PASS=your_gmail_app_password
MAIL_FROM=your_gmail@gmail.com
```

---

### Fix #6 — `GET /api/orders/customer` No Session Validation
**Severity:** HIGH  
**Files:** `backend/controllers/orderController.js`, `frontend/src/pages/OrderStatus.jsx`, `frontend/src/hooks/useOrderCount.js`

**Problem:**  
The customer order status endpoint had no authentication. `cafeId` is publicly visible in QR codes and `tableNumber` is 1–8 (easily iterable). Anyone could enumerate all active orders for any table at any café in real time.

**Fix (backend):**  
Added `sessionId` as a required query parameter. Validates it is a string between 10–100 characters. Added `sessionId` to the MongoDB query so only orders belonging to that browser session are returned:
```js
Order.find({ cafeId, tableNumber, sessionId, ... })
```

**Fix (frontend):**  
Both `OrderStatus.jsx` and `useOrderCount.js` now read `sessionId` from `localStorage` and include it as a query parameter in the API call.

**Bonus fix in same session:**  
`getBillingOrders` date range was using UTC which caused orders to disappear from the billing tab for IST users (UTC+5:30). Fixed by treating the date parameter as IST midnight-to-midnight and converting to UTC for the DB query using `+05:30` offset.

---

## 🔲 Remaining Fixes

---

### Fix #7 — `GET /auth/settings` Response Over-Exposes Data
**Severity:** HIGH  
**File:** `backend/routes/authRoutes.js`  
**Problem:** Returns full Cafe document (minus password) including `secretAnswer`, `resetToken`, `resetTokenExpiry`, encrypted Razorpay keys.  
**Plan:** Return only the fields the Settings UI actually needs via explicit DTO mapping.

---

### Fix #8 — `PUT /auth/settings` Response Over-Exposes Data
**Severity:** HIGH  
**File:** `backend/routes/authRoutes.js`  
**Problem:** Response after settings update returns the full updated Cafe document including sensitive fields.  
**Plan:** Same DTO approach as Fix #7 — return only safe branding/business fields in the response.

---

### Fix #9 — `menuController` Spreads `req.body` Directly
**Severity:** HIGH  
**Files:** `backend/controllers/menuController.js`  
**Problem:** `Menu.create({ ...req.body, cafeId })` and `Menu.findOneAndUpdate(..., req.body, ...)` pass the entire request body to Mongoose. Price is not validated (could be negative/zero), image is not validated as a URL, and MongoDB operators in req.body could be injected.  
**Plan:** Explicitly pick allowed fields from `req.body`, validate price > 0, validate image as https:// URL.

---

## Notes

- **Google OAuth** was also fixed during this session (separate from the numbered fixes):
  - Created `frontend/.env` for local dev (`VITE_API_URL`, `VITE_SOCKET_URL`)
  - Removed trailing slash from `CLIENT_URL2` in `backend/.env`
  - Changed `callbackURL` in `passport.js` to use `${process.env.SERVER_URL}/api/auth/google/callback`
  - Added `SERVER_URL=http://localhost:5000` to `backend/.env`
  - Added correct redirect URI in Google Cloud Console

- **Production URLs** (for reference when deploying fixes):
  - Frontend: `https://cafeproject-rho.vercel.app`
  - Backend: `https://cafeproject-nn33.onrender.com`
  - Remember to add production `SERVER_URL` and `CLIENT_URL2` to production environment variables
