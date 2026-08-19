# Security Fixes — #7, #8, #9
## saas_cafe_ordering_v5 — NexOp Café SaaS
**Date:** 2026-08-11

---

## Fix #7 — `GET /auth/settings` Response Over-Exposes Data
**Severity:** HIGH  
**File:** `backend/routes/authRoutes.js`

### Problem
The settings endpoint returned the full Cafe document (minus password) to the logged-in admin. This included fields that should never leave the server:

- `secretAnswer` — bcrypt hash, offline brute-forceable
- `secretQuestion` — gives attacker knowledge needed for account takeover
- `resetToken` + `resetTokenExpiry` — if a reset is in progress, the admin's own dashboard exposed the active reset token
- `razorpay.keyId` + `razorpay.keySecret` — encrypted ciphertext sent to the browser unnecessarily
- `googleId` — raw Google profile ID exposed
- `__v` — internal Mongoose field

```js
// BEFORE — dangerous
const cafe = await Cafe.findById(req.cafeId).select("-password");
res.json(cafe); // entire document goes to browser
```

### Fix
Replaced with an explicit allowlist `.select()` and a clean DTO response:

```js
// AFTER — safe
const cafe = await Cafe.findById(req.cafeId).select(
  "name email phone logo themeColor description category " +
  "totalTables address city state pincode country " +
  "gstNumber fssaiNumber legalBusinessName billingEmail " +
  "isVerified googleId createdAt"
);

res.json({
  id:                cafe._id.toString(),
  name:              cafe.name,
  email:             cafe.email,
  phone:             cafe.phone,
  logo:              cafe.logo,
  themeColor:        cafe.themeColor,
  description:       cafe.description,
  category:          cafe.category,
  totalTables:       cafe.totalTables,
  address:           cafe.address,
  city:              cafe.city,
  state:             cafe.state,
  pincode:           cafe.pincode,
  country:           cafe.country,
  gstNumber:         cafe.gstNumber,
  fssaiNumber:       cafe.fssaiNumber,
  legalBusinessName: cafe.legalBusinessName,
  billingEmail:      cafe.billingEmail,
  isVerified:        cafe.isVerified,
  hasGoogleAuth:     !!cafe.googleId,  // boolean only — never expose raw googleId
  createdAt:         cafe.createdAt,
});
```

### Fields removed from response

| Field | Reason |
|---|---|
| `secretAnswer` | Bcrypt hash — offline attackable |
| `secretQuestion` | Account takeover knowledge |
| `resetToken` | Active account takeover vector |
| `resetTokenExpiry` | Leaks reset state |
| `razorpay` | Encrypted keys — never go to browser |
| `googleId` (raw) | Replaced with `hasGoogleAuth` boolean |
| `__v` | Internal Mongoose field |

### Related fixes in same session

**`GET /auth/me`** had the same `googleId` exposure issue:
```js
// BEFORE
googleId: cafe.googleId || null,

// AFTER
hasGoogleAuth: !!cafe.googleId,
```

**`SettingsSection.jsx`** was reading `cafe?.googleId` — updated to:
```js
// BEFORE
const isGoogleUser = Boolean(cafe?.googleId);

// AFTER
const isGoogleUser = Boolean(cafe?.hasGoogleAuth);
```

**Error responses** — `err.message` was being returned in catch blocks, leaking internal details. Replaced with generic `"Internal server error"`.

---

## Fix #8 — `PUT /auth/settings` Response Over-Exposes Data
**Severity:** HIGH  
**File:** `backend/routes/authRoutes.js`

### Problem
After saving settings, the response used `...updatedCafe.toObject()` which spread the entire Cafe document into the response — same sensitive fields as Fix #7 plus all internal Mongoose fields.

```js
// BEFORE — spreads full document into response
res.json({
  message: "Settings updated",
  cafe: {
    ...updatedCafe.toObject(),   // everything goes out
    id: updatedCafe._id.toString(),
  },
});
```

### Fix
Replaced with the same clean DTO shape as Fix #7 so both `GET` and `PUT` settings endpoints return a consistent, safe structure:

```js
// AFTER — explicit safe DTO
res.json({
  message: "Settings updated",
  cafe: {
    id:                updatedCafe._id.toString(),
    name:              updatedCafe.name,
    email:             updatedCafe.email,
    phone:             updatedCafe.phone,
    logo:              updatedCafe.logo,
    themeColor:        updatedCafe.themeColor,
    description:       updatedCafe.description,
    category:          updatedCafe.category,
    totalTables:       updatedCafe.totalTables,
    address:           updatedCafe.address,
    city:              updatedCafe.city,
    state:             updatedCafe.state,
    pincode:           updatedCafe.pincode,
    country:           updatedCafe.country,
    gstNumber:         updatedCafe.gstNumber,
    fssaiNumber:       updatedCafe.fssaiNumber,
    legalBusinessName: updatedCafe.legalBusinessName,
    billingEmail:      updatedCafe.billingEmail,
    isVerified:        updatedCafe.isVerified,
    hasGoogleAuth:     !!updatedCafe.googleId,
    createdAt:         updatedCafe.createdAt,
  },
});
```

### AuthContext check
`AuthContext.jsx` was reviewed — no changes needed. It stores and retrieves the cafe object as-is via `updateCafe()`. The consistent DTO shape between `GET` and `PUT` ensures the frontend always receives the same structure regardless of which endpoint is called.

### Bonus fix in same session
`OrderStatus.jsx` document title was hardcoded as `"Your Orders | My Cafe"`. Updated to use the real café name from `useCafe(cafeId)`:

```js
// BEFORE
useEffect(() => {
  document.title = "Your Orders | My Cafe";
}, []);

// AFTER
useEffect(() => {
  document.title = `Your Orders | ${cafe?.name || "My Cafe"}`;
}, [cafe?.name]);
```

---

## Fix #9 — `menuController` Spreads `req.body` Directly
**Severity:** HIGH  
**File:** `backend/controllers/menuController.js`

### Problem
Two controller functions passed `req.body` directly to Mongoose without any field picking or validation:

```js
// createMenuItem — BEFORE
Menu.create({ ...req.body, cafeId: req.cafeId })
// entire req.body spread — client controls all fields

// updateMenuItem — BEFORE
Menu.findOneAndUpdate(
  { _id: id, cafeId: req.cafeId },
  req.body,   // raw body as update payload — MongoDB operators injectable
  { returnDocument: "after" }
)
```

**What an attacker could do:**
- Send `price: -1` or `price: 0` to create free items
- Send `image: "javascript:alert(1)"` or any arbitrary URL
- Inject MongoDB operators via `req.body` e.g. `{ "$set": { "cafeId": "anotherCafeId" } }`
- Override `cafeId` in the create call if `req.body.cafeId` was spread before `cafeId: req.cafeId`

### Fix
Added a `pickAndValidateMenuFields()` helper that validates all fields and returns only an explicit safe payload:

```js
const VALID_IMAGE_RE = /^https?:\/\/.+/i;

const pickAndValidateMenuFields = (body, isUpdate = false) => {
  const { name, price, category, description, image, isAvailable, options } = body;

  // Required field checks on create
  if (!isUpdate) {
    if (!name || typeof name !== "string" || !name.trim())
      return { error: "Item name is required" };
    if (price === undefined || price === null)
      return { error: "Price is required" };
    if (!category || typeof category !== "string" || !category.trim())
      return { error: "Category is required" };
  }

  // Price validation
  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0)
      return { error: "Price must be a non-negative number" };
    if (parsedPrice > 100000)
      return { error: "Price exceeds maximum allowed value" };
  }

  // Image URL validation
  if (image !== undefined && image !== null && image !== "") {
    if (typeof image !== "string" || !VALID_IMAGE_RE.test(image.trim()))
      return { error: "Image must be a valid http/https URL" };
  }

  // Options validation
  if (options !== undefined) {
    // validates each option title, choice name, and choice price
  }

  // Returns only explicitly allowed fields
  const data = {};
  if (name        !== undefined) data.name        = String(name).trim();
  if (price       !== undefined) data.price        = Number(price);
  if (category    !== undefined) data.category     = String(category).trim();
  if (description !== undefined) data.description  = String(description).trim();
  if (isAvailable !== undefined) data.isAvailable  = Boolean(isAvailable);
  if (image       !== undefined) data.image        = image ? String(image).trim() : "";
  if (options     !== undefined) data.options      = /* sanitized options array */;

  return { data };
};
```

The update call now uses explicit `{ $set: data }` — never raw `req.body`:

```js
// updateMenuItem — AFTER
Menu.findOneAndUpdate(
  { _id: id, cafeId: req.cafeId },
  { $set: data },                          // explicit $set — operator injection blocked
  { returnDocument: "after", runValidators: true }
)
```

### What is now validated

| Field | Before | After |
|---|---|---|
| `price` | any value accepted | non-negative number, max ₹1,00,000 |
| `image` | any string accepted | valid http/https URL or empty |
| `options[].choices[].price` | any value accepted | non-negative number, max ₹1,00,000 |
| `cafeId` from body | could override JWT cafeId | always set from JWT only |
| MongoDB operators in body | injectable via req.body | blocked — only known fields reach query |
| Unknown fields | passed to Mongoose (relied on strict mode) | never reach Mongoose at all |
| `deleteMenuItem` ObjectId | not validated | validated, returns 400 on invalid |
| `name`, `category` | any string | trimmed, type-checked |
| `isAvailable` | any value | cast to boolean |
