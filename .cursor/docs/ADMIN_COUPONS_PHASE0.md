# Admin Coupons — Phase 0 Discovery

**Date:** 2026-08-24  
**Status:** Phase 0 complete — **module boundary locked**; **Phase 1 contract locked** — see `ADMIN_COUPONS_PHASE1.md`  
**Constraints (unchanged):**
- `src/features/admin/commission/` — **FROZEN**
- `src/features/admin/settings/` — **FROZEN**
- `src/features/admin/product-management/` — **FROZEN**
- `src/features/admin/attributes/` — Phase 3 complete; **freeze pending QA**
- `src/features/admin/reviews/` — Phase 3 complete; **freeze pending QA**
- `src/features/seller/coupons/` — **Do not modify** for admin work
- `src/services/api/couponsApi.ts` — **Do not extend** (checkout `apply-coupon` only)

**Sequence:** Final queued admin domain in the current roadmap.

---

## Executive summary

Admin Coupons on web is **promotional coupon CRUD** plus **cross-seller oversight** and a **broadcast notification** action. It is **not** checkout coupon application, **not** seller self-service coupons (separate nav), and **not** affiliate referral links (separate role with hard-coded rules).

**Boundary decision (locked):** separate module `src/features/admin/coupons/`, sibling to other admin domains. Admin must establish **its own API wrapper, types, hooks, and validation** — do **not** reuse assumptions from `src/features/seller/coupons/` or affiliate web flows, even where endpoints overlap.

---

## Locked module boundary

```
Checkout / Cart                         Admin Coupons (new)
     │                                        │
     └── POST /coupon/apply-coupon            ├── Admin tab: own coupons (CRUD)
         (couponsApi.ts — frozen scope)       ├── Seller tab: other creators' coupons (oversight)
                                              └── Notify: GET /notifications/send-all/{couponId}

Seller Coupons (existing mobile)            Affiliate Coupons (web only today)
     │                                            │
     └── GET/POST/PUT/DELETE /coupon/*             └── Locked 1% / max 3 / min cart 10
         src/features/seller/coupons/                  NOT admin scope
         DO NOT MODIFY for admin
```

### Why not reuse Seller Coupons mobile module

| Factor | Seller mobile | Admin web |
|---|---|---|
| List sources | Single `GET /coupon/created-by/{userId}` | **Two tabs** — same endpoint **or** `GET /coupon/` + client filter |
| Coupon types | `percentage` \| `fixed` (user picks) | Same on admin **own** form |
| Role locks | None | **Affiliate rules do not apply**; seller-tab shows **other users'** coupons |
| Extra actions | Delete only | Delete + **Notify all users** |
| Pagination | Server `page`/`limit` on created-by | Server on admin tab; **client slice** on seller tab |
| `createdBy` on submit | Acting seller user id | Acting **admin** user id |

Shared utility **only:** `src/utils/couponCodeRules.ts` (code length/charset — platform-wide, not seller-specific).

---

## 1. What `/admin/coupons` exposes (web)

### Routes

| Route | File | Purpose |
|---|---|---|
| `/admin/coupons` | `pages/admin/coupons/index.js` | Hub: tabs, list, actions |
| `/admin/coupons/add` | `pages/admin/coupons/[id].js` (`id === "add"`) | Create coupon |
| `/admin/coupons/{id}` | `pages/admin/coupons/[id].js` | Edit coupon |

### Navigation

- **`components/AdminProductSidebar.jsx`** → **Coupons** → `/admin/coupons`
- **Not** behind `fullAccess` gate (same tier as Review, Settings)
- Mobile gap: no `AdminCoupons` route or Account row yet

### List hub — two tabs

#### Tab 1: **Admin Coupons** (coupons created by logged-in admin)

- **GET** `/coupon/created-by/{adminUserId}?page={n}&limit=10`
- **Response (web expects):** `{ coupons: Coupon[], totalPages?: number }`
- **Pagination:** server-driven via query params
- **Columns:** code, type, discount, min cart, usage count, limit per coupon, limit per customer
- **Actions:** Edit · Delete · **Notify**

#### Tab 2: **Seller Coupons** (coupons **not** created by admin)

- **GET** `/coupon/` → top-level **array** (web: `res.data` when `Array.isArray`)
- **Client filter:** `coupon.createdBy._id !== adminUserId`
- **Client sort:** `.reverse()` (newest first)
- **Pagination:** client slice, 10 per page (`resources.slice`)
- **Extra column:** Seller name (`createdBy.firstName` + `lastName`)
- **Actions:** Edit · Delete · Notify (same action menu as admin tab)

**Important:** Seller-tab **Edit** navigates to `/admin/coupons/{id}` — admin can mutate seller-created coupons through the **same** admin form endpoints.

### Create / edit form (`/admin/coupons/add` | `/admin/coupons/{id}`)

| Field | Required | Admin web control |
|---|---|---|
| `couponCode` | Yes | Text; manual entry; paste blocked |
| `couponType` | Yes | Select: `percentage` \| `fixed` |
| `discountAmount` | Yes | Number, min 1 |
| `description` | No | Textarea |
| `minimumCartAmount` | Yes | Number, min 1 |
| `expirationDate` | Yes | Date (`YYYY-MM-DD` submitted) |
| `usageLimitPerCoupon` | Yes | Number, min 1 |
| `usageLimitPerCustomer` | Yes | Number, min 1 |
| `createdBy` | Set on submit | `userData.userId` from localStorage (admin id) |

**Submit:**
- Create: **POST** `/coupon` + body
- Update: **PUT** `/coupon/{id}` + body
- Success → redirect `/admin/coupons`

### Delete

- **DELETE** `/coupon/{id}`
- Confirm modal; optimistically removes row from list

### Notify (admin-only side effect on web)

- **GET** `/notifications/send-all/{couponId}`
- Confirm modal: "notification to all users"
- Success toast only; **no list mutation**
- **Only exposed on admin coupons page** (not seller/affiliate coupon lists)

---

## 2. Coupon types required for mobile V1

### Web admin **own** coupon form

| Type | Required for admin V1? | Notes |
|---|---|---|
| `percentage` | **Yes** | Selectable |
| `fixed` | **Yes** | Selectable |

No other `couponType` values appear in admin UI.

### Explicitly **not** admin V1 (other roles)

| Surface | Types | Why excluded |
|---|---|---|
| Affiliate web | `percentage` only, discount locked `1` | Affiliate referral program — separate domain |
| Checkout | N/A (apply only) | Customer cart — already on mobile |

**Phase 0 V1 recommendation:** admin mobile supports **`percentage` and `fixed`** on **admin-created** coupons only. Do not port affiliate locks into admin module.

---

## 3. Admin create/edit flows (web behavior)

```
Account (admin) → Sidebar Coupons
    → /admin/coupons
        → [Admin tab] paginated list of own coupons
        → [Seller tab] all other creators' coupons (filtered)
        → Add new Coupon → /admin/coupons/add → POST /coupon
        → Edit → /admin/coupons/{id} → GET /coupon/{id} → PUT /coupon/{id}
        → Delete → DELETE /coupon/{id}
        → Notify → GET /notifications/send-all/{id}
```

**Create flow:** empty form → fill fields → submit → `createdBy = adminUserId` injected → POST → list.

**Edit flow:** GET detail by id → hydrate form → PUT full values object (including `createdBy` re-set to admin user id on submit).

**Cross-edit:** Admin can open seller-tab coupon → same edit route → same PUT (oversight, not impersonation in payload — `createdBy` still set to **admin** user id on submit in web code; **Phase 1 must verify** whether backend preserves original `createdBy` on PUT).

---

## 4. Which `/coupon/*` endpoints belong to admin

### Admin operational (V1 candidates)

| Method | Endpoint | Admin web usage |
|---|---|---|
| GET | `/coupon/created-by/{userId}?page&limit` | Admin tab list |
| GET | `/coupon/` | Seller tab source (all coupons) |
| GET | `/coupon/{id}` | Edit form load |
| POST | `/coupon` | Create |
| PUT | `/coupon/{id}` | Update |
| DELETE | `/coupon/{id}` | Delete |

### Admin-adjacent (notification)

| Method | Endpoint | Admin web usage |
|---|---|---|
| GET | `/notifications/send-all/{couponId}` | Broadcast notify |

### Shared but **not** admin module scope

| Method | Endpoint | Owner |
|---|---|---|
| POST | `/coupon/apply-coupon` | Cart/checkout (`src/services/api/couponsApi.ts`) |

### Not observed in admin web

- No admin-specific `/coupon/admin/*` prefix — same REST paths as seller/affiliate.

---

## 5. Payload / response shapes (from web — **Phase 1 must verify on staging**)

### POST / PUT body (admin form submit)

```json
{
  "couponCode": "SUMMER10",
  "couponType": "percentage",
  "description": "Optional text",
  "discountAmount": 10,
  "minimumCartAmount": 50,
  "expirationDate": "2026-12-31",
  "usageLimitPerCoupon": 100,
  "usageLimitPerCustomer": 1,
  "createdBy": "<adminUserId>"
}
```

**Phase 1 open:** Is `expirationDate` accepted as `YYYY-MM-DD` string vs ISO datetime? Web sends date input string.

### GET `/coupon/{id}` (edit load)

- Web assigns **`response.data`** directly to form state (expects **flat coupon object**, not `{ Data: ... }` wrapper).

### GET `/coupon/created-by/{id}` (admin tab)

```json
{
  "coupons": [ /* Coupon[] */ ],
  "totalPages": 3
}
```

Web also tolerates missing `totalPages` → defaults to 1.

### GET `/coupon/` (seller tab)

- Web expects **top-level array** `Coupon[]`
- Items may include populated `createdBy: { _id, firstName, lastName, ... }`

### Inferred coupon list item fields (from web table + forms)

| Field | Type (inferred) | Notes |
|---|---|---|
| `_id` | string | Route id |
| `couponCode` | string | |
| `couponType` | `percentage` \| `fixed` | |
| `discountAmount` | number | |
| `description` | string? | |
| `minimumCartAmount` | number | |
| `expirationDate` | string (ISO/date) | |
| `usageLimitPerCoupon` | number | |
| `usageLimitPerCustomer` | number | |
| `usageCount` | number? | Read-only in UI |
| `createdBy` | string \| populated user | Populated on seller tab |

**Phase 1 must capture:** POST/PUT/DELETE response bodies, error shapes, duplicate-code errors, and whether GET list returns populated `createdBy` on admin tab.

---

## 6. Validation — client vs backend

### Client-side (web admin form — Yup)

| Field | Web client rule |
|---|---|
| `couponCode` | Required; trim; 3–32 chars; `/^[A-Za-z0-9-]+$/` (`lib/couponCodeRules.js`) |
| `couponType` | Required; web Yup chains two `.oneOf` — **likely bug**; intent is `percentage` \| `fixed` |
| `discountAmount` | Required number, min 1 |
| `minimumCartAmount` | Required number, min 1 |
| `expirationDate` | Required date |
| `usageLimitPerCoupon` | Required number, min 1 |
| `usageLimitPerCustomer` | Required number, min 1 |
| `description` | Optional string |

**Web UX:** coupon code input blocks paste/drop (`couponCodeNoPasteInputProps`).

### Client-side (mobile seller — reference only, do not assume for admin)

Seller mobile adds:
- Percentage discount **≤ 100**
- Expiration **YYYY-MM-DD** format validation
- Integer enforcement on usage limits

**Phase 0 recommendation for admin mobile V1:** mirror **seller-grade** validation (including percentage cap) **plus** admin web required fields — implemented in **`admin/coupons` utils**, not by importing seller form builders.

### Backend (unknown until Phase 1)

Phase 1 should probe:
- Duplicate `couponCode` rejection
- Expired / past `expirationDate`
- `discountAmount` > 100 for percentage
- Ownership on PUT/DELETE for seller-created coupons
- Affiliate-specific server rules when `createdBy` is affiliate (should not affect admin-created coupons)

---

## 7. Role-specific rules (do not import into admin blindly)

| Rule | Admin | Seller (web/mobile) | Affiliate (web) |
|---|---|---|---|
| Coupon types | `percentage`, `fixed` | `percentage`, `fixed` | **`percentage` only** (UI disabled) |
| Discount | User entered, min 1 | User entered, min 1 | **Locked to 1** (1%) |
| Min cart | min 1 | min 1 | **min 10** |
| Max coupons | None in UI | None in UI | **Max 3** (`Add` disabled when `length > 2`) |
| Delete | Enabled | Enabled | **Disabled in UI** (handler exists but menu commented) |
| Notify all | **Yes** | No | No |
| List scope | Own + others' (tabs) | Own only | Own only |
| `createdBy` on create | Admin user id | Seller user id | Affiliate user id |

**Admin mobile must not** copy affiliate max-3 or 1% lock. **Admin mobile should not** assume seller list pagination applies to seller-tab oversight (client filter path).

---

## 8. Notification side effects

| Action | Endpoint | When | UI feedback | Data side effect |
|---|---|---|---|---|
| **Notify all** | `GET /notifications/send-all/{couponId}` | Admin confirms modal | Success/error toast | None on coupon row |

**Unknown until Phase 1:**
- Auth headers required (web: `x-api-key` only)
- Response body shape
- Whether idempotent / rate-limited
- Push vs in-app vs email channel
- Whether non-admin roles can call endpoint

**Phase 0 tiering:**
- **Tier B** for mobile V1 (after core CRUD stable) — operationally sensitive broadcast

---

## 9. Mobile V1 scope recommendation

### Tier A — recommended V1

| Item | Include |
|---|---|
| Admin tab list | Own coupons via `GET /coupon/created-by/{adminId}` |
| Server pagination | `page` / `limit` — **verify honored in Phase 1** |
| Create coupon | POST `/coupon` — `percentage` + `fixed` |
| Edit coupon | GET + PUT `/coupon/{id}` |
| Delete coupon | DELETE `/coupon/{id}` |
| Form fields | All admin web fields (see §3) |
| Validation | Code rules + numeric mins + percentage ≤ 100 |
| Auth gate | `useRequireAdmin` (likely not `fullAccess` — matches web sidebar) |
| Navigation | Account → Admin → **Coupons** |
| Zero-blocking list | Render shell; hydrate list in background |

### Tier B — defer unless product insists

| Item | Reason |
|---|---|
| **Seller Coupons tab** | Second list source + client filter + populated `createdBy` |
| Edit/delete **seller-created** coupons | Oversight policy + `createdBy` PUT behavior unclear |
| **Notify all users** | Separate notifications domain; confirm side effects in Phase 1 |

### Tier C — out of scope

| Excluded | Reason |
|---|---|
| Affiliate coupon rules / UI | Different role program |
| `POST /coupon/apply-coupon` | Cart/checkout — already mobile |
| Seller mobile module changes | Frozen boundary |
| Coupon analytics / usage drill-down | Not in web admin |
| Bulk import / CSV | Not in web admin |

---

## 10. Authentication per endpoint (web observed — Phase 1 must confirm)

All admin coupon web calls use **`x-api-key` only** (hardcoded in pages). **No `Authorization: Bearer`** on coupon CRUD or notify in admin coupon files.

| Endpoint | Web headers | Expected mobile gate |
|---|---|---|
| GET `/coupon/created-by/{id}` | `x-api-key` | API key + `useRequireAdmin` |
| GET `/coupon/` | `x-api-key` | Tier B |
| GET `/coupon/{id}` | `x-api-key` | API key + admin session |
| POST `/coupon` | `x-api-key` | API key + admin session |
| PUT `/coupon/{id}` | `x-api-key` | API key + admin session |
| DELETE `/coupon/{id}` | `x-api-key` | API key + admin session |
| GET `/notifications/send-all/{id}` | `x-api-key` | Tier B; confirm admin-only server-side |

**Phase 1 action:** replay each call against staging with admin credentials; record status codes, bodies, and whether Bearer/JWT is enforced server-side despite web omission.

---

## 11. Existing mobile assets (reference inventory)

### Reuse (read-only shared utilities)

| Asset | Path | Use |
|---|---|---|
| Coupon code rules | `src/utils/couponCodeRules.ts` | Code validation constants/helpers |

### Do NOT modify / extend for admin CRUD

| Asset | Path |
|---|---|
| Seller coupons module | `src/features/seller/coupons/` |
| Checkout apply API | `src/services/api/couponsApi.ts` |
| Applied coupon storage | `src/services/storage/appliedCouponStorage.ts` |
| Cart coupon hooks | `src/features/cart/hooks/useCartCoupon.ts` |

### New (Phase 2+, after Phase 1 locked)

```
src/features/admin/coupons/
├── api/adminCouponsApi.ts
├── api/adminCouponNotificationsApi.ts   # Tier B
├── types/adminCoupon.ts
├── utils/adminCouponValidation.ts
├── utils/adminCouponDisplay.ts
├── hooks/useAdminCouponsList.ts
├── hooks/useAdminCouponForm.ts
├── components/...
├── screens/AdminCouponsScreen.tsx
├── screens/AdminCouponFormScreen.tsx
└── navigation/adminCouponsNavigation.ts
```

---

## 12. Phase 1 verification checklist

**Deliverable:** `.cursor/docs/ADMIN_COUPONS_PHASE1.md`  
**Capture script (to create):** `scripts/adminCouponsPhase1Capture.mjs`

| # | Probe |
|---|---|
| 1 | `GET /coupon/created-by/{adminId}?page=1&limit=10` — wrapper shape, pagination metadata |
| 2 | `GET /coupon/` — array vs wrapper; `createdBy` population |
| 3 | `GET /coupon/{id}` — flat vs wrapped; all fields |
| 4 | `POST /coupon` — create percentage + fixed; response shape |
| 5 | `PUT /coupon/{id}` — update; does `createdBy` change? |
| 6 | `DELETE /coupon/{id}` — success/error; ownership rules |
| 7 | Invalid payload matrix — duplicate code, bad type, past date, discount > 100 |
| 8 | `GET /notifications/send-all/{couponId}` — response, auth, idempotency |
| 9 | Confirm `page`/`limit` honored vs ignored (Reviews taught us to verify) |
| 10 | Auth: `x-api-key` alone vs Bearer required |

**Do not implement mobile UI until Phase 1 contract is approved.**

---

## 13. Open questions (Phase 1 must resolve)

| Question | Phase 0 assumption |
|---|---|
| PUT preserves original `createdBy` when admin edits seller coupon? | Unknown — web overwrites with admin id in payload |
| POST/PUT response flat coupon vs `{ message, Data }`? | Web ignores response body on success |
| Server pagination on created-by reliable? | Web depends on it for admin tab |
| GET `/coupon/` size at scale | Seller tab loads entire array — mobile Tier B risk |
| Notify endpoint scope | Broadcast; confirm channels and permissions |
| Percentage discount cap enforced server-side? | Seller mobile validates ≤ 100; web admin form does not |

---

## Related docs

- `ADMIN_REVIEWS_PHASE0.md` — phased migration pattern predecessor
- `FEATURE_INVENTORY.md` — § Admin Coupons, § Seller/Affiliate coupons
- `MIGRATION_STATUS.md` — admin roadmap
- Web: `pages/admin/coupons/index.js`, `pages/admin/coupons/[id].js`
- Web (contrast only): `pages/seller/coupons/*`, `pages/affiliate/coupons/*`
- Web validation: `lib/couponCodeRules.js`
