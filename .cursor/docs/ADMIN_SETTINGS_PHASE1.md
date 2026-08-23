# Admin Settings — Phase 1 Contract (locked)

**Date:** 2026-08-23  
**Environment:** `development.afomamarketplace.com` (staging)  
**V1 scope:** Hub + Commission Rates (3) + Featured Shops  
**Terms edit:** deferred (read path exists)  
**Commission/Payout module:** frozen — do not modify

Capture tooling: `node scripts/adminSettingsPhase1Capture.mjs`

---

## V1 setting types

| Type | Purpose |
|---|---|
| `affiliate-commission` | Affiliate commission % |
| `seller-referral-commission` | Seller referral commission % |
| `buyer-referral-commission` | Buyer referral commission % |
| `shops` | Featured seller spotlight list |

---

## Authentication

| Probe | Result |
|---|---|
| GET without `x-api-key` | **403** |
| GET with invalid `x-api-key` | **403** |
| GET with valid `x-api-key` only | **200** |
| JWT / `fullAccess` | **Not required** for settings APIs (matches web middleware — any admin UX, API is key-gated) |

Mobile: gate Settings screens with `useRequireAdmin` only — **do not** add to `ADMIN_FULL_ACCESS_ROUTE_NAMES`.

---

## GET contract

**Endpoint:** `GET /settings/type/{type}`

**Response (200):**

```json
{
  "message": "Setting fetched successfully.",
  "settings": [
    {
      "_id": "<objectId>",
      "type": "affiliate-commission",
      "content": "\"3\"",
      "createdBy": "<userId>",
      "__v": 0
    }
  ]
}
```

- `settings` is an array; web/mobile use **`settings[0]`** when present.
- Empty/missing doc: staging returns `{ settings: [] }` or failed GET — handle create path via POST.

### Parsed `content` shapes

| Type | Stored `content` | Parse for UI |
|---|---|---|
| Commission rates | JSON-encoded string, e.g. `"\"3\""` | `JSON.parse(content)` → `"3"` → number |
| `shops` | JSON-encoded **array of seller user objects** | `JSON.parse(content)` → `Seller[]` |

**Featured shop objects:** full seller records as selected in web (`id`, `fullName`, `email`, etc.) — not IDs-only. Mobile should persist the same object shape web sends (reuse admin seller list item fields).

**Consumer read (already mobile):** `GET /settings/all/types` + `extractFeaturedShopIds()` uses `id` from `shops` entries — order in array = spotlight order.

---

## Mutation contract

### PUT (update existing)

**Endpoint:** `PUT /settings/{_id}`

**Body (web parity):**

```json
{
  "type": "affiliate-commission",
  "content": "\"3\"",
  "createdBy": "<actingAdminUserId>"
}
```

- `content` must be a **string** (already JSON-stringified payload):
  - Commission: `JSON.stringify(String(value))` e.g. `"\"3\""`
  - Shops: `JSON.stringify(sellerObjectArray)`
- **Response (200):** flat updated document (not wrapped in `{ settings: [...] }`):

```json
{
  "_id": "...",
  "type": "affiliate-commission",
  "content": "\"3\"",
  "createdBy": "...",
  "__v": 0
}
```

### POST (create when no doc)

**Endpoint:** `POST /settings`

Same body shape as PUT minus `_id`. Web uses when `resource?._id` is missing.

---

## Validation (client-enforced)

| Rule | Web | Backend (staging) |
|---|---|---|
| Commission % 0–9 | ✅ input clamp | ❌ **No server validation** — accepts e.g. `"15"` |
| Max 3 featured shops | ✅ `MAX_FEATURED_SHOPS = 3` | ❌ **No server validation** — accepts 4+ entries |
| Shops non-empty on submit | Web disables if empty | Empty array **accepted** (verified) |

**Mobile must enforce web validation client-side** — do not rely on backend rejection.

---

## Featured Shops behavior (verified)

| Action | Contract |
|---|---|
| **Select** | Append full seller object to array; max **3** (client guard) |
| **Remove** | Filter by `id` / `_id`; PUT full updated array |
| **Reorder** | PUT reordered array — order preserved on GET |
| **Replace** | PUT new array (subset swap) |
| **Clear all** | `JSON.stringify([])` accepted |

No separate reorder/remove endpoints — always **replace entire `content` array** via PUT.

**Picker data source:** reuse admin seller list (`GET /sellers` or existing `adminSellerManagementApi`) — same objects web checkbox selection stores.

**Do not implement** enable/disable shop here — `PUT /sellers/seller-shop/update-status/{id}` remains in Seller Management only.

---

## Commission rates vs Commission/Payout

| Concern | Module | API |
|---|---|---|
| Rate configuration | **Admin Settings (V1)** | `/settings/type/*-commission` |
| Payout list / initiate / status | **Admin Commission (frozen)** | `/commission/*` |

No shared code changes in `src/features/admin/commission/`.

---

## Terms (deferred)

| Capability | Status |
|---|---|
| Read | ✅ `getSettingsByType('terms-conditions')` + `useTermsConditions` |
| Admin edit | ❌ **Not V1** — Quill/rich-text is a separate surface |

Phase 1 did **not** verify terms mutations.

---

## Mobile implementation checklist (post-lock)

### Phase 2 — Foundation ✅

- `src/features/admin/settings/` — types, API, content utils, hooks, navigation, hub screens
- `AdminNavigator` + Account → Settings (any admin, not `fullAccess`)
- Regression: `npx --yes tsx scripts/test-admin-settings-content.ts`

### Phase 3 — Editors ✅

- Commission rate screens: numeric input, 0–9 validation, save + reconcile
- Featured shops: picker, max 3, remove/reorder, save full object array + reconcile
- Empty state, loading/saving states, contextual errors

### Phase 4 — QA/polish + freeze ✅

See `.cursor/docs/ADMIN_SETTINGS_PHASE4.md`. Module frozen: `src/features/admin/settings/FROZEN.md`.

---

## Out of scope (unchanged)

Tier C exclusions and Tier B “not in migration until required” items from Phase 0 doc remain in force. No Phase 1 verification spent on those areas.
