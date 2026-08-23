# Admin Reviews — Phase 0 Discovery

**Date:** 2026-08-24  
**Status:** Phase 0 complete — **module boundary locked**; **Phase 1 contract locked** — see `ADMIN_REVIEWS_PHASE1.md`  
**Constraints:**
- `src/features/admin/commission/` — **FROZEN**
- `src/features/admin/settings/` — **FROZEN**
- `src/features/admin/product-management/` — **FROZEN**
- `src/features/admin/attributes/` — Phase 3 complete; **freeze pending QA**

**Sequence decision:** **Reviews before Coupons** — no stronger immediate business case for Coupons on mobile admin.

---

## Why Reviews before Coupons

| Factor | Reviews | Coupons |
|---|---|---|
| Mobile reuse | Shared `services/api/reviewsApi.ts`, `Review` type, seller reviews module | Separate admin/seller/affiliate surfaces; checkout rules |
| Web admin scope | Moderation-focused (list + status) | Full CRUD + admin/seller tabs + notifications |
| Trust/ops priority | Unblocks product trust workflow | Promotional config; less urgent for mobile admin MVP |
| Product adjacency | Reads product linkage; does not edit products | Tied to cart/checkout validation across roles |
| Implementation risk | Lower — fewer mutation shapes | Higher — coupon types, limits, role-specific create flows |

**Coupons remains queued** after Reviews boundary is locked and implemented.

---

## Executive summary

Admin Reviews on web is **moderation** — list all customer reviews (and seller replies in a second tab), open a review, change **`reviewStatus`** (`Approved` | `Pending` | `Disapproved`).

This is **not** product management, **not** seller reply authoring (seller module owns that), and **not** customer review submission (order/PDP flows).

**Boundary decision (preliminary lock):** separate module `src/features/admin/reviews/`, sibling to Order/Product admin modules. Reuse shared review API helpers and display patterns from seller reviews — **do not** extend frozen Product Management or modify seller reviews module for admin CRUD.

---

## Locked module boundary (preliminary)

```
Admin Product Management (FROZEN)     → products only; no review moderation
Admin Reviews (new)                   → list all reviews + status moderation
Seller Reviews (existing)             → seller-scoped list + reply CRUD
Consumer reviews (existing)           → PDP read + order write
services/api/reviewsApi.ts            → shared GET detail + update-status (extend admin list GET here or admin API wrapper)
```

---

## Preliminary V1 scope

### Tier A — recommended V1

| Item | V1 |
|---|---|
| Customer reviews list | ✅ `GET /reviews/` |
| Status filter (client-side) | ✅ Approved / Pending / Disapproved / All |
| Review detail | ✅ `GET /reviews/{id}` |
| Status update | ✅ `PUT /reviews/{id}/update-status` |
| Auth gate | `useRequireAdmin` (likely not `fullAccess` — verify Phase 1) |
| Navigation | Account → Admin → **Reviews** |
| Pull-to-refresh / focus reconcile | ✅ |

### Tier B — defer unless Phase 1 proves essential

| Item | Reason |
|---|---|
| Seller Reply tab | Separate list `GET /reviews/all/replies` — moderate separately |
| Open product on storefront | Web "View" deep-link; mobile can deep-link web or navigate to admin product detail |
| Server-side pagination | Web loads **entire array** client-side; mobile can mirror with client filter + FlatList |
| Edit review body/ratings | Web detail is **read-only** except status — no V1 edit |

### Tier C — out of scope

| Excluded | Reason |
|---|---|
| `/admin/review/product-reviews/index.jsx` | Not in sidebar; orphan duplicate list |
| Customer review create/edit | Customer/order domain |
| Seller reply create/edit | Seller module (`src/features/seller/reviews/`) |
| Coupon admin | Separate domain — queued after Reviews |

---

## 1. Web route map

### Active admin routes (sidebar-linked)

| Route | File | Sidebar? | Purpose |
|---|---|---|---|
| `/admin/review` | `pages/admin/review/index.jsx` | **Yes** | Hub: tabs + list + filters |
| `/admin/review/product-reviews/[id]` | `pages/admin/review/product-reviews/[id].jsx` | via Edit link | Review detail + status dropdown |

### Orphan / legacy

| Route | File | Sidebar? | Notes |
|---|---|---|---|
| `/admin/review/product-reviews` | `pages/admin/review/product-reviews/index.jsx` | **No** | Duplicate flat list; no status filter; not linked |

### Navigation entry points

**`components/AdminProductSidebar.jsx`**
- **Review** → `/admin/review` (single link, no submenu)
- Adjacent to **Coupons** — separate domains
- **No `fullAccess` gate** on Review nav (same as Settings, Attributes)

**Mobile admin nav (current gap)**
- No Reviews route in `AdminNavigator.tsx`
- Account → Admin has no Reviews row yet

---

## 2. Web functional behavior

### List hub (`/admin/review`)

**Tabs:**
1. **Customer Reviews** — `GET /reviews/` → `res.data.reverse()`
2. **Seller Reply** — `GET /reviews/all/replies` → `res.data.reverse()`

**Filters (customer tab only):**
- Client-side `reviewStatus`: `""` | `Approved` | `Pending` | `Disapproved`

**Columns:** Customer/Seller name, Product name, avg/price/value/quality ratings

**Pagination:** Client-side slice, 10 per page (no server page params)

**Actions per row:**
- **Edit** → `/admin/review/product-reviews/{_id}`
- **View** → opens product PDP hash `#customerReviews` in new tab (when `productId` populated)

### Detail (`/admin/review/product-reviews/[id]`)

**Read:** `GET /reviews/{id}` — full review + populated `UserId`, `productId`

**Write (only mutation):** `PUT /reviews/{id}/update-status`

```json
{ "newStatus": "Approved" | "Pending" | "Disapproved" }
```

**Web auth on status update:** sends **`Authorization: Bearer ${accessToken}`** **and** `x-api-key` — Phase 1 must verify whether Bearer is required.

**UI:** read-only fields for title, ratings (avg/price/value/quality), review text; status dropdown only interactive element.

---

## 3. API inventory

### Admin moderation (V1)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/reviews/` | All customer reviews (admin list) |
| GET | `/reviews/{id}` | Review detail |
| PUT | `/reviews/{id}/update-status` | Body `{ newStatus: string }` |

### Admin list — seller replies (Tier B)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/reviews/all/replies` | All seller reply records |

### Shared (already in mobile `reviewsApi.ts`)

| Method | Endpoint | Mobile today |
|---|---|---|
| GET | `/reviews/{id}` | ✅ `getReviewById` |
| PUT | `/reviews/{id}/update-status` | ✅ `updateReviewStatus` |
| GET | `/reviews/seller/{sellerId}` | Seller module only |
| GET | `/reviews/single/{productId}` | PDP consumer |
| POST | `/reviews/` | Customer/seller create |

### Missing from mobile shared API

| Method | Endpoint | Needed for admin |
|---|---|---|
| GET | `/reviews/` | Admin list |
| GET | `/reviews/all/replies` | Tier B replies tab |

**Staging read probe (2026-08-24):**
- `GET /reviews/` → **200**, top-level JSON **array** (populated productId objects)
- `GET /reviews/all/replies` → **200**, array (same probe window)

---

## 4. Review document shape (from web + mobile `Review` type)

Key fields observed:

| Field | Notes |
|---|---|
| `_id` | Review id |
| `reviewStatus` | `Approved` \| `Pending` \| `Disapproved` |
| `title` / `heading` | Review title |
| `reviewText` / `comment` | Body |
| `avgRating`, `price`, `value`, `quality` | Numeric ratings |
| `UserId` | Populated `{ firstName, lastName, ... }` on admin list |
| `productId` | Populated product object or string id |
| `isReply` | Seller reply records |
| `sellerId`, `replyReviewId` | Reply linkage |

Mobile type: `src/services/types/review.ts` — extend in admin module if admin list needs stricter typing.

---

## 5. Search / filter / pagination

| Concern | Web behavior | Mobile V1 recommendation |
|---|---|---|
| Search | None | None |
| Status filter | Client-side on full array | Same |
| Pagination | Client 10/page | FlatList + optional client pages or infinite scroll on cached array |
| Sort | `reverse()` on fetch (newest first) | Match web: newest first |

**Risk:** large review volume loads entire array — acceptable V1 parity with web; revisit if perf issues.

---

## 6. Permission / auth (preliminary)

| Surface | Web | Mobile (expected) |
|---|---|---|
| List/detail GET | `x-api-key` | Standard API client key |
| Status update | `x-api-key` + **Bearer JWT** on web | **Phase 1 must confirm** — may need acting admin token on PUT |
| `fullAccess` | Not gated in sidebar/middleware | Likely **`useRequireAdmin` only** |

---

## 7. Connection to products / orders / sellers

| Domain | Relationship |
|---|---|
| **Products** | Review references `productId`; moderation does not mutate product |
| **Product Management** | No web link from review admin to product edit; optional mobile link to `AdminProductDetail` (Tier B) |
| **Orders** | Customer reviews created from order view — out of admin Reviews scope |
| **Seller Reviews** | Seller replies appear in admin Replies tab; seller mobile module handles reply CRUD |
| **Attributes** | No connection |

---

## 8. Existing mobile reuse inventory

### Reuse (read-only or shared API)

| Asset | Path |
|---|---|
| Review type | `src/services/types/review.ts` |
| GET detail + update status | `src/services/api/reviewsApi.ts` |
| Seller list patterns | `src/features/seller/reviews/` — card layout, rating display, pagination UX |
| `SellerReviewCard`, display utils | Adapt for admin list rows |

### Do NOT modify (frozen / separate domain)

| Module | Reason |
|---|---|
| `admin/product-management/` | Frozen |
| `seller/reviews/` | Seller domain; admin is separate read/moderate |
| `admin/settings/`, `admin/commission/` | Frozen |

### New (Phase 2+)

```
src/features/admin/reviews/
├── api/adminReviewsApi.ts          # GET /reviews/, wrap update-status
├── types/adminReview.ts
├── hooks/useAdminReviewsList.ts
├── hooks/useAdminReviewDetail.ts
├── components/...
├── screens/AdminReviewsScreen.tsx
├── screens/AdminReviewDetailScreen.tsx
└── navigation/...
```

---

## 9. Phase 1 verification — complete

**Results:** `.cursor/docs/ADMIN_REVIEWS_PHASE1.md`  
**Capture:** `scripts/adminReviewsPhase1Capture.mjs`

Do **not** implement mobile UI until Phase 2 foundation is approved.

---

## 10. Open questions for Phase 1

| Question | Phase 0 assumption |
|---|---|
| Bearer required on status PUT? | Web sends both; verify staging |
| Update-status response shape | Web expects `{ Data: { _id, reviewStatus } }` — verify vs mobile `apiPut<Review>` |
| Seller Reply tab in V1? | **Defer to Tier B** unless product insists |
| Link to admin product from review? | Nice-to-have; not web-critical |

---

## Related docs

- `ADMIN_ATTRIBUTES_PHASE1.md` — phased migration pattern
- `FEATURE_INVENTORY.md` — § Admin Reviews moderation, § Seller Reviews
- `MIGRATION_STATUS.md` — admin roadmap
- `src/services/api/reviewsApi.ts` — existing shared review client
