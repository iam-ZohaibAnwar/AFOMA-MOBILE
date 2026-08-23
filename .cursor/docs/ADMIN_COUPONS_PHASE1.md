# Admin Coupons — Phase 1 Contract (locked)

**Date:** 2026-08-24  
**Environment:** `development.afomamarketplace.com` (staging)  
**V1 scope:** Admin's own coupon list + server pagination + create/edit/delete (`percentage` + `fixed`)  
**Frozen modules:** Settings, Commission, Product Management, User Management, Attributes (pending QA), Reviews (pending QA), Seller Coupons — do not modify

**Capture (2026-08-23):** `scripts/captures/admin-coupons-phase1-2026-08-23T19-41-04-516Z.json`

---

## Phase 1 exit criteria

```
Admin Coupons
│
├── List contract          ✅
├── Create contract        ✅
├── Edit contract          ✅
├── Delete contract        ✅
├── Validation contract    ✅
├── Auth contract          ✅
└── Notification boundary  ✅
```

**Phase 1 complete.** Contract locked. Proceed to **Phase 2 foundation** (no mobile UI yet).

---

## Capture commands

```bash
# Read-only list/detail/notify/pagination probes
node scripts/adminCouponsPhase1Capture.mjs

# Full contract verification (recommended)
node scripts/adminCouponsPhase1Capture.mjs --auth-matrix --mutations --confirm
```

Optional env: `ADMIN_USER_ID` (defaults to first `createdBy.userRole === 'admin'` from `GET /coupon/`)

---

## Phase 1 exit flow (locked)

```
GET /coupon/created-by/:adminUserId?page&limit
       ↓
{ message, coupons[], totalCount, page, limit, totalPages }


GET /coupon/:id
       ↓
flat Coupon  (createdBy = string id)


POST /coupon
       ↓
201 { message, coupon: Coupon }


PUT /coupon/:id
       ↓
200 flat Coupon  (not wrapped)


DELETE /coupon/:id
       ↓
204 empty body
```

**Mobile list source:** `GET /coupon/created-by/{actingAdminUserId}` using authenticated admin's `userId` — **not** seller mobile list assumptions.

---

## Authentication (confirmed on staging)

| Request | No auth | Invalid key | Valid `x-api-key` only |
|---|---|---|---|
| GET `/coupon/created-by/:id` | **403** | **403** | **200** |
| GET `/coupon/:id` | **403** | **403** | **200** |
| POST `/coupon` | **403** | **403** | **201** (valid body) |
| PUT `/coupon/:id` | **403** | **403** | **200** |
| DELETE `/coupon/:id` | **403** | **403** | **204** (valid id) |
| GET `/notifications/send-all/:id` (Tier B doc) | **403** | **403** | **200** |

JWT + Bearer probes **skipped** (no tokens in env). Staging succeeds with **`x-api-key` only** — matches web admin coupon pages.

---

## 1. GET `/coupon/created-by/{userId}`

### Response shape

**200 — wrapper object:**

```json
{
  "message": "Coupons fetched successfully.",
  "coupons": [ /* Coupon[] */ ],
  "totalCount": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

| Rule | Detail |
|---|---|
| Wrapper | **`coupons` array inside object** — not top-level array |
| Metadata | **`totalCount`, `page`, `limit`, `totalPages`** present on staging |
| Empty user id | **200** with `coupons: []` (invalid ObjectId still returns empty list) |
| `createdBy` on list items | **Populated user object** (firstName, lastName, email, userRole, …) |

| Query | Effect |
|---|---|
| `page` + `limit` | **Honored** — distinct pages, `totalPages`/`totalCount` accurate |
| Page beyond last | **200**, `coupons: []`, `page` echoes requested page |
| Unknown user id | **200**, `coupons: []`, `totalCount: 0` |

### Ordering (staging)

List items **do not include `createdAt`/`updatedAt`**. Observed stable server order for admin user sample:

`HAPPY2025` → `XMAS10` → `XMAS20`

**Mobile:** display in API return order; no client re-sort unless product adds explicit sort later.

### Pagination (confirmed)

Probe with `limit=2`, `totalCount=3`:

| Page | Coupons returned | Codes (sample) |
|---|---|---|
| `page=1&limit=2` | 2 | distinct from page 2 |
| `page=2&limit=2` | 1 | distinct from page 1 |
| `totalPages` | 2 | Matches math |

**Mobile V1:** use server pagination (`page`, `limit`, `totalPages`, `totalCount`). Do not assume Reviews-style ignored params.

### List item fields (staging sample)

`_id`, `couponCode`, `couponType`, `discountAmount`, `description`, `minimumCartAmount`, `expirationDate`, `usageCount`, `usageLimitPerCoupon`, `usageLimitPerCustomer`, `createdBy`, `__v`

---

## 2. GET `/coupon/{id}`

### Response shape

**200 — flat coupon object** (no `{ message, Data }` wrapper):

```json
{
  "_id": "...",
  "couponCode": "HAPPY2025",
  "couponType": "percentage",
  "discountAmount": 5,
  "minimumCartAmount": 50,
  "expirationDate": "2025-01-15T00:00:00.000Z",
  "usageCount": 7,
  "usageLimitPerCoupon": 1000,
  "usageLimitPerCustomer": 100,
  "createdBy": "66a135afab426ae52f7d16a6",
  "description": "...",
  "__v": 0
}
```

| Rule | Detail |
|---|---|
| Invalid id | **404** `{ "error": "Coupon not found" }` |
| `createdBy` | **String id** on detail (list has populated object) |
| Prefer passthrough | Navigate list → form with list item; background GET merges ids |

---

## 3. POST `/coupon` — create

### Success

**201:**

```json
{
  "message": "Coupon created successfully.",
  "coupon": {
    "_id": "...",
    "couponCode": "Phase1Probe-Pct1787513984601",
    "couponType": "percentage",
    "discountAmount": 15,
    "minimumCartAmount": 10,
    "expirationDate": "2027-08-23T00:00:00.000Z",
    "usageLimitPerCoupon": 5,
    "usageLimitPerCustomer": 1,
    "usageCount": 0,
    "createdBy": "66a135afab426ae52f7d16a6",
    "description": "Phase 1 staging probe",
    "__v": 0
  }
}
```

**Mobile must parse `coupon` from response** — not top-level `_id`.

### Locked create payloads (V1)

**Percentage:**

```json
{
  "couponCode": "UNIQUE-CODE",
  "couponType": "percentage",
  "description": "Optional",
  "discountAmount": 15,
  "minimumCartAmount": 10,
  "expirationDate": "2027-08-23",
  "usageLimitPerCoupon": 5,
  "usageLimitPerCustomer": 1,
  "createdBy": "<actingAdminUserId>"
}
```

**Fixed:**

```json
{
  "couponCode": "UNIQUE-CODE",
  "couponType": "fixed",
  "discountAmount": 8,
  "minimumCartAmount": 10,
  "expirationDate": "2027-08-23",
  "usageLimitPerCoupon": 5,
  "usageLimitPerCustomer": 1,
  "createdBy": "<actingAdminUserId>"
}
```

| Field | Staging notes |
|---|---|
| `expirationDate` | `YYYY-MM-DD` accepted; stored as ISO datetime |
| `createdBy` | **Should be set** to acting admin `userId` so coupon appears in admin tab list |
| `createdBy` omitted | **201** but coupon may lack owner — avoid |

---

## 4. PUT `/coupon/{id}` — edit

### Success

**200 — flat updated coupon** (same keys as GET detail):

```json
{
  "_id": "...",
  "couponCode": "...",
  "couponType": "percentage",
  "discountAmount": 22,
  "createdBy": "66a135afab426ae52f7d16a6",
  "description": "partial update only",
  ...
}
```

### `createdBy` semantics (critical)

| Scenario | Staging behavior |
|---|---|
| PUT with **wrong** `createdBy` | **Overwrites** owner on server |
| PUT **without** `createdBy` (partial: `{ description }`) | **Preserves** existing owner |
| PUT with **original** `createdBy` | Restores/preserves owner |

**Locked mobile contract:**
- On edit submit, **always include original `createdBy`** string from GET detail.
- **V1 edits own coupons only** — cross-edit probe confirmed PUT can reassign owner if `createdBy` changes (Tier B seller oversight risk).

### Cross-edit probe (Tier B documentation)

PUT on another creator's coupon with `createdBy: adminUserId` → **owner changed** to admin. Restored after probe. Not in V1 scope.

**Date on PUT:** send `expirationDate` as `YYYY-MM-DD` (split ISO from GET when hydrating form).

**Invalid id:** PUT `/coupon/{invalidId}` → **404** `{ "error": "Coupon not found" }`

---

## 5. DELETE `/coupon/{id}`

| Case | Status | Body |
|---|---|---|
| Success | **204** | Empty |
| Invalid id | **404** | `{ "error": "Coupon not found" }` |

**Mobile:** treat 204 as success; remove row from list optimistically after confirm.

---

## 6. Validation — backend vs client (staging matrix)

Capture source: `--mutations --confirm` on staging. **Do not infer from seller mobile validation alone.**

| Case | Status | Backend response |
|---|---|---|
| Duplicate `couponCode` | **400** | `{ "message": "Coupon with this code already exists." }` |
| Invalid `couponType` | **400** | Mongoose enum error |
| Code `< 3` chars | **400** | `{ "message": "Coupon code must be at least 3 characters." }` |
| Code `> 32` chars | **400** | `{ "message": "Coupon code must be at most 32 characters." }` |
| Space in code | **400** | `{ "message": "Coupon code may only contain letters, numbers, and hyphens." }` |
| Underscore in code | **400** | Same charset message |
| Percentage `discountAmount: 150` | **201** | No server cap at 100 |
| Fixed `discountAmount: 0` | **201** | Accepted |
| `minimumCartAmount: 0` | **201** | Accepted |
| Past `expirationDate` | **201** | Accepted |
| Body `{ couponCode }` only | **201** | Very permissive — mobile must not mirror |
| POST without `createdBy` | **201** | Coupon created with **`createdBy` absent** — avoid |

### Client validation (locked for mobile V1)

Implement in **`src/features/admin/coupons/utils/adminCouponValidation.ts`** based on **admin web + staging gaps**:

| Field | Mobile client rule |
|---|---|
| `couponCode` | Required; 3–32 chars; `/^[A-Za-z0-9-]+$/` (from `src/utils/couponCodeRules.ts`) |
| `couponType` | Required; `percentage` \| `fixed` |
| `discountAmount` | Required number ≥ 1; **if percentage, ≤ 100** (client guard — backend does not enforce) |
| `minimumCartAmount` | Required number ≥ 1 (stricter than backend) |
| `expirationDate` | Required; valid `YYYY-MM-DD`; **≥ today** (client guard — backend accepts past) |
| `usageLimitPerCoupon` | Required integer ≥ 1 |
| `usageLimitPerCustomer` | Required integer ≥ 1 |
| `description` | Optional |

**Rationale:** Backend is permissive on several admin-web fields. Mobile adds guards where admin UX expects sanity, without importing seller-module form builders.

**Affiliate rules (min cart 10, 1% lock, max 3) — not applied** in admin module.

---

## 7. Notification endpoint (Tier B — documented only)

`GET /notifications/send-all/{couponId}`

| Probe | Result |
|---|---|
| Valid key | **200** `{ "message": "Successfully sent" }` |
| No / invalid key | **403** |

**V1 mobile:** excluded. Documented for boundary completeness. No side effect on coupon document.

---

## 8. Tier B endpoint (documented, not V1)

`GET /coupon/` → top-level **`Coupon[]`** (staging: 32 items). Used by web admin **Seller Coupons** tab with client filter. **Not in mobile V1.**

---

## 9. Locked V1 mobile module contract

### In scope

- `GET /coupon/created-by/{adminUserId}?page&limit`
- `GET /coupon/{id}`
- `POST /coupon`
- `PUT /coupon/{id}`
- `DELETE /coupon/{id}`
- Types: `percentage`, `fixed`
- Pagination from server metadata
- `useRequireAdmin` gate

### Out of scope

- Seller oversight tab (`GET /coupon/` + filter)
- Notify all
- Affiliate coupon rules
- `POST /coupon/apply-coupon` (cart)
- Changes to `src/features/seller/coupons/`

### New module path

```
src/features/admin/coupons/
├── api/adminCouponsApi.ts
├── types/adminCoupon.ts
├── utils/adminCouponValidation.ts
├── utils/adminCouponDisplay.ts
├── hooks/...
├── components/...
├── screens/AdminCouponsScreen.tsx
├── screens/AdminCouponFormScreen.tsx
└── navigation/adminCouponsNavigation.ts
```

**API wrapper notes:**
- Parse POST `body.coupon` for created record
- Parse PUT flat body directly
- DELETE expect 204

---

## 10. Phase 2+ roadmap (after contract approval)

| Phase | Deliverable |
|---|---|
| **Phase 2** | API/types/hooks/navigation foundation (shell screens) |
| **Phase 3** | List + create/edit/delete UI |
| **Phase 4** | QA/polish → `FROZEN.md` |

---

## Related docs

- `ADMIN_COUPONS_PHASE0.md` — boundary and tiering
- `scripts/adminCouponsPhase1Capture.mjs` — reproducible capture
- `scripts/captures/admin-coupons-phase1-*.json` — raw staging output
- Web reference: `pages/admin/coupons/index.js`, `pages/admin/coupons/[id].js`
- Web validation: `lib/couponCodeRules.js`
