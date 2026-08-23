# Admin Reviews — Phase 1 Contract (locked)

**Date:** 2026-08-24  
**Environment:** `development.afomamarketplace.com` (staging)  
**V1 scope:** Customer reviews list + detail + status moderation  
**Frozen modules:** Settings, Commission, Product Management, Attributes (pending QA), Seller Reviews — do not modify

Capture tooling: `node scripts/adminReviewsPhase1Capture.mjs`  
Mutations: `node scripts/adminReviewsPhase1Capture.mjs --mutations --confirm`

---

## Phase 1 exit flow (locked)

```
GET /reviews/
       ↓
Review[]  (populated list items)


GET /reviews/:id
       ↓
ReviewDetail  (unpopulated ids — prefer list item passthrough)


PUT /reviews/:id/update-status
       ↓
{ message, Data }
       ↓
reconcile: refresh list row + optional GET detail
```

---

## Authentication (confirmed on staging)

Probed **GET list**, **GET detail**, and **PUT update-status** — do not infer from web middleware alone.

| Request | GET `/reviews/` | GET `/reviews/:id` | PUT `.../update-status` |
|---|---|---|---|
| No auth | **403** | **403** | **403** |
| Invalid `x-api-key` | **403** | **403** | **403** |
| Valid `x-api-key` only | **200** | **200** | **200** |
| `x-api-key` + admin JWT | Not probed (no token in env) | — | — |
| `x-api-key` + non-admin JWT | Not probed | — | — |
| Bearer only | Not probed | — | — |

**Locked mobile contract:**
- API calls use **`x-api-key` only** via standard client (same as list/detail GET).
- Web admin sends **Bearer + key** on status PUT — staging **does not require Bearer** for success.
- Screen gate: **`useRequireAdmin`** — **not** `ADMIN_FULL_ACCESS_ROUTE_NAMES`.
- **`fullAccess` not enforced** at API layer (key alone mutates status).

Optional re-probe with env tokens:

```bash
ADMIN_BEARER_TOKEN=... node scripts/adminReviewsPhase1Capture.mjs --auth-matrix
```

---

## 1. GET `/reviews/`

### Response shape

**200 — top-level JSON array** (no wrapper object):

```json
[
  {
    "_id": "67b0e2a6770e012ae3f74659",
    "reviewStatus": "Approved",
    "title": "Just Beautiful",
    "reviewText": "...",
    "avgRating": 5,
    "price": 5,
    "value": 5,
    "quality": 5,
    "sellerId": "...",
    "UserId": {
      "firstName": "Eric",
      "lastName": "Osuorah",
      ...
    },
    "productId": {
      "_id": "...",
      "productName": "...",
      "slug": "...",
      "Category": { "name": "...", "slug": "..." },
      "SubCategory": { ... },
      "childCategory": { ... },
      ...
    },
    "createdAt": "...",
    "updatedAt": "...",
    "__v": 0
  }
]
```

| Rule | Detail |
|---|---|
| Wrapper | **None** — `Review[]` at root |
| Pagination metadata | **None** — no `totalPages`, `page`, `limit` |
| Default page/limit | **N/A** — returns full set (staging: 7 items) |
| Trailing slash | `/reviews` and `/reviews/` both **200**, same count |

### Query params (staging)

| Query | Effect |
|---|---|
| `?page=1&limit=10` | **Ignored** — same full count |
| `?reviewStatus=Approved` | **Ignored** — server returns all |
| `?reviewStatus=Pending` | **Ignored** |
| `?q=test` | **Ignored** |

**Mobile:** client-side status filter only (web parity).

### Fields on list items (staging sample)

`_id`, `reviewStatus`, `title`, `reviewText`, `avgRating`, `price`, `value`, `quality`, `sellerId`, `UserId` (populated object), `productId` (populated product), `createdAt`, `updatedAt`, `__v`

### Status values observed

| Status | Seen on staging |
|---|---|
| `Approved` | ✅ |
| `Pending` | ✅ |
| `Disapproved` | ✅ (via mutation round-trip) |

No other enum values observed. Invalid status on PUT → **500** (see §3).

### Empty results

Not observed on staging (7 reviews). Expect **`[]`** when empty — same top-level array shape.

---

## 2. GET `/reviews/:id`

### Response shape

**200 — flat review object** (not wrapped):

Same **field keys** as list item, but **references are unpopulated strings**:

| Field | List GET | Detail GET |
|---|---|---|
| `UserId` | Populated `{ firstName, lastName, ... }` | **String** user id |
| `productId` | Populated product object | **String** product id |

All other review fields (title, ratings, reviewText, reviewStatus, etc.) present on both.

### Detail-only fields

**None** — same key set; difference is **population depth only**.

### Invalid / missing ID

| Case | Result |
|---|---|
| Invalid ObjectId `000...000` | **404** `{ "error": "Review not found" }` (casing may vary) |

### Mobile detail strategy (locked)

**Do not rely on GET detail alone** for customer/product display labels.

```
List navigation → pass initialReview (populated) as route param
       ↓
Detail screen renders from initialReview immediately
       ↓
Optional background GET /reviews/:id for fresh reviewStatus + text
       ↓
After status PUT → reconcile from PUT response Data + patch list row
```

Seller module already uses `initialReview` passthrough — admin should mirror.

---

## 3. PUT `/reviews/:id/update-status`

**Endpoint:** `PUT /reviews/{reviewId}/update-status`

**Body:**

```json
{
  "newStatus": "Approved"
}
```

Accepted values confirmed: **`Approved`**, **`Pending`**, **`Disapproved`** (exact casing).

### Response (200)

**Wrapped — not a flat `Review`:**

```json
{
  "message": "Review status updated successfully",
  "Data": {
    "_id": "...",
    "productId": "673dd141ee3169b75d55211d",
    "UserId": "66a13971ab426ae52f7d172d",
    "sellerId": "...",
    "reviewStatus": "Approved",
    "title": "...",
    "reviewText": "...",
    "avgRating": 5,
    "value": 5,
    "quality": 5,
    "price": 5,
    "createdAt": "...",
    "updatedAt": "...",
    "__v": 0
  }
}
```

| Rule | Detail |
|---|---|
| Return shape | **`{ message, Data }`** — parse `Data.reviewStatus` for optimistic patch |
| `Data` population | **Partial** — ids as strings, not populated objects |
| Idempotent repeat | **200** — same status applied again succeeds |
| List reconciliation | **Immediate** — subsequent `GET /reviews/` shows new status |

### Error cases

| Case | Status | Body |
|---|---|---|
| Invalid review id | **404** | `{ "error": "Review Not Found" }` |
| Invalid `newStatus` (`Phase1InvalidStatus`) | **500** | `{ "error": "Internal server error" }` |
| No / bad API key | **403** | — |

### Contract note — shared `reviewsApi.ts`

Existing `updateReviewStatus()` types return value as flat `Review` — **incorrect for admin**. Phase 2 admin module must use:

```typescript
interface UpdateReviewStatusResponse {
  message?: string;
  Data?: Review;  // unpopulated ids
}
```

Do **not** change shared seller/consumer callers in Phase 2 without need — add `adminReviewsApi.ts` wrapper.

---

## 4. Status model (locked V1)

| Status | UI | Backend |
|---|---|---|
| `Pending` | ✅ | ✅ |
| `Approved` | ✅ | ✅ |
| `Disapproved` | ✅ | ✅ |

- All transitions probed successfully (no ordering restriction observed).
- Unknown status → **500** — mobile should restrict picker to the three values.
- **No evidence** of additional backend enum values on staging.

---

## 5. Reconciliation strategy (locked for Phase 2)

### After status PUT

1. Parse `{ message, Data }` — update local detail state from `Data`.
2. Patch list row `reviewStatus` for matching `_id` (or full list refresh).
3. Optional: `GET /reviews/:id` — only needed if verifying text/ratings unchanged.

### No requirement to re-fetch full list

Status change reflected immediately on staging list GET; patch-in-place or lightweight refresh both valid.

---

## 6. Tier B reference — seller replies list

`GET /reviews/all/replies` → **200**, top-level array (staging: empty `[]`).

Same array shape expected as customer reviews. **Deferred from V1** per Phase 0.

---

## Phase 1 exit criteria — met

| Criterion | Status |
|---|---|
| GET list contract | ✅ top-level array, populated refs |
| No server pagination/filter | ✅ client-side only |
| GET detail contract | ✅ flat object, unpopulated refs |
| Detail vs list asymmetry | ✅ documented + passthrough strategy |
| PUT status body + response wrapper | ✅ `{ message, Data }` |
| Auth matrix (key endpoints) | ✅ key-only sufficient |
| Status enum | ✅ three values |
| Invalid id / invalid status | ✅ documented |
| Reconciliation | ✅ immediate list consistency |

---

## Phase 2 preview (not started)

```
src/features/admin/reviews/
├── api/adminReviewsApi.ts       # getAdminReviews(), updateAdminReviewStatus()
├── types/adminReview.ts         # AdminReviewListItem, UpdateReviewStatusResponse
├── hooks/useAdminReviewsList.ts
├── hooks/useAdminReviewDetail.ts
└── screens/ ...                 # foundation shell first
```

**Do not modify** `src/services/api/reviewsApi.ts` return types until admin wrapper exists.

---

## Related

- `ADMIN_REVIEWS_PHASE0.md`
- `scripts/captures/admin-reviews-phase1-*.json`
- `src/features/seller/reviews/` — passthrough + card patterns (read-only reference)
