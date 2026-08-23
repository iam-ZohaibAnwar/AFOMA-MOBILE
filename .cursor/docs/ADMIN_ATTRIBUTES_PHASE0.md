# Admin Attributes — Phase 0 Discovery

**Date:** 2026-08-24  
**Status:** Phase 0 complete — **module boundary locked**; **Phase 1 contract locked** — see `ADMIN_ATTRIBUTES_PHASE1.md`  
**Constraints:**
- `src/features/admin/commission/` — **FROZEN / read-only**
- `src/features/admin/settings/` — **FROZEN / read-only**
- `src/features/admin/product-management/` — **FROZEN** — consumes attributes read-only; do not extend for attribute CRUD

---

## Executive summary

Attributes in AFOMA are **variation dimension names** (e.g. Size, Colour, Material) used by **Customizable** products — not category metadata and not product fields.

There are **two distinct attribute domains**:

| Domain | Scope | Admin mobile? | Seller mobile? |
|---|---|---|---|
| **Global attributes** | Platform-wide catalog (`/global-attribute/*`) | ✅ **V1 target** | N/A (read via merge API) |
| **Per-seller custom attributes** | Seller-scoped (`/attributes/*`) | ❌ Out of scope | ✅ Already shipped |

**Boundary decision (locked):** Admin Attributes is a **separate admin module** (`src/features/admin/attributes/`), **not** part of frozen Product Management. Web treats Attribute as a **sibling nav item** to Product Management. Product Management only **reads** merged attribute names when editing customizable product variations.

---

## Locked module boundary

```
Admin Product Management (FROZEN)          Admin Attributes (new module)
        │                                           │
        └── Consumes read-only:                     └── CRUD platform global list
              GET /global-attribute/all/{sellerId}        GET /global-attribute
              (via getSellerGlobalAttributes)             PUT /global-attribute/{id}
                                                          PUT /global-attribute/add/{id}
                                                          DELETE /global-attribute/one/{id}

Seller Custom Attributes (existing, separate)
        │
        └── CRUD per seller: /attributes/*
            Mobile: src/features/seller/attributes/
```

### Why not under Product Management

1. Web sidebar places **Attribute** as its own expandable section adjacent to Product Management — not nested under `/admin/product`.
2. Global attributes are **catalog configuration** affecting all sellers; product management is operational (approve/edit products).
3. Frozen product-management already imports `getSellerGlobalAttributes` from seller products API for the variations wizard — adding CRUD there would violate the freeze and mix concerns.
4. Per-seller custom attributes belong to the **seller** role (already on mobile); admin web does not expose seller-scoped attribute management in navigation.

---

## Locked mobile scope (preliminary V1)

### Tier A — V1 (recommended lock)

| Item | V1 |
|---|---|
| Global attribute list | ✅ |
| Add global attribute name | ✅ |
| Rename global attribute (index-based) | ✅ |
| Delete global attribute (by name) | ✅ |
| Auth gate | `useRequireAdmin` (any admin — **not** `fullAccess`) |
| Navigation | Account → Admin section row (sibling to Product Management) |

```
Admin Attributes (V1)
│
└── Global Attributes
    ├── List (platform-wide names)
    ├── Add
    ├── Edit (rename)
    └── Delete
```

### Tier B — not in V1 (revisit only with product need)

| Item | Reason |
|---|---|
| Per-seller custom attribute admin UI | Seller owns this; mobile seller module exists |
| Bulk import/export | Web has none |
| Attribute value management | Attributes are **names only**; values live on product variations |
| Search / filter / pagination | Web is a flat table; staging shows ~6 items in singleton doc |

### Tier C — permanently out of scope

| Excluded | Reason |
|---|---|
| `/admin/attribute/custom-attribute-management` | Not in web sidebar; broken implementation (see §2) |
| `POST /global-attribute` (create document) | Only commented dead code in `register.js`; platform uses singleton doc |
| Category ↔ attribute linkage | No web or API evidence |
| Chatbot / settings overlap | Unrelated domains |

---

## 1. Web route map

### Admin routes

| Route | File | Sidebar? | Functional? | Notes |
|---|---|---|---|---|
| `/admin/attribute/global-attribute-management` | `pages/admin/attribute/global-attribute-management/index.js` | **Yes** — only linked Attribute page | ✅ | Full CRUD against `/global-attribute/*` |
| `/admin/attribute/custom-attribute-management` | `pages/admin/attribute/custom-attribute-management/index.js` | **No** | ⚠️ Broken / dead | Duplicate UI; still calls `/global-attribute` but delete uses `userData.userId` instead of doc `_id`; add/update uses corrupted `editData` state |

### Seller routes (reference — not admin mobile)

| Route | File | API |
|---|---|---|
| `/seller/custom-attribute-management` | `pages/seller/custom-attribute-management/index.js` | `/attributes/*` scoped by `sellerId` |

### Navigation entry points (web)

**`components/AdminProductSidebar.jsx`**
- Expandable **Attribute** menu (tag icon) — sibling to Product Management, Order Management, Categories
- Single child link: **Global Attribute** → `/admin/attribute/global-attribute-management`
- **No `fullAccess` gate** on Attribute nav (same pattern as Settings, Product Management)

**`middleware.js`**
- Restricted to `fullAccess`: `/admin/user-management`, `/admin/commission` only
- Attribute routes accessible to any authenticated admin JWT

**Mobile admin nav (current)**
- No Attributes route in `AdminNavigator.tsx`
- Account → Admin: Dashboard, Seller management, Order management, Product management, Settings (+ User management / Commission when `fullAccess`)
- **Gap:** no Attributes row yet (expected for Phase 2+)

---

## 2. Functional vs stub/broken pages

### Global Attribute Management — functional

Single-page CRUD:
- Loads `GET /global-attribute`, uses **first document** `[0]` as the platform singleton
- Form: attribute name input + Save (add or update)
- Table: list with Edit / Delete per row
- Client validation: non-empty name only (`validation = "Required"`)
- No duplicate-name check, no trim normalization, no confirmation on delete

### Custom Attribute Management (admin) — treat as dead code

Evidence it should **not** be migrated:
1. **Not linked** from `AdminProductSidebar.jsx`
2. Still fetches `/global-attribute` (global API), not `/attributes/single/{sellerId}`
3. `handleDelete` URL: `/global-attribute/one/${userData.userId}` — wrong ID type
4. `onSubmit` add path uses `editData?.personId` but `editData` is set to `res.data[0]` (full document, no `personId`)
5. No toasts, minimal error handling

---

## 3. API inventory

### A. Global attributes (admin V1)

| Method | Endpoint | Purpose | Request body (web) | Response (staging GET) |
|---|---|---|---|---|
| GET | `/global-attribute` | List platform document(s) | — | `[{ "_id", "attributes": string[], "createdAt", "updatedAt", "__v" }]` — **singleton** in staging |
| PUT | `/global-attribute/{id}` | Rename by index | `{ updatedAttributeValue: string, indexToUpdate: number }` | Phase 1 |
| PUT | `/global-attribute/add/{id}` | Add name | `{ attributes: string }` | Phase 1 |
| DELETE | `/global-attribute/one/{id}` | Delete by name | `{ attributes: string }` (attribute name, not id) | Phase 1 |

**Staging read probes (2026-08-24):**
- `GET /global-attribute` → **200**, 1 document, 6 names: Texture, Pattern, Colour, Fragrance, Material, Size
- `GET /global-attribute` without `x-api-key` → **403**
- Document id: `652d282c6e37a025ac69cbf1`

**Not used in active web flows:**
- `POST /global-attribute` — only in commented `pages/register.js`

### B. Merged read (product/variation consumers — not admin CRUD)

| Method | Endpoint | Purpose | Response (staging) |
|---|---|---|---|
| GET | `/global-attribute/all/{sellerId}` | Global + seller-local names for variation pickers | `{ "global": string[], "local": string[] }` |

**Staging:** seller `6a82e61e571d6a56deb64cb7` → `{ global: [6 names], local: [] }`  
Invalid sellerId → **500** (backend does not return empty merge gracefully)

### C. Per-seller custom attributes (seller domain — reference)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/attributes/single/{sellerId}` | Seller's local attribute document |
| PUT | `/attributes/update/{sellerId}` | Add `{ attributes: string }` |
| PUT | `/attributes/updateAttributes/{sellerId}` | Rename `{ updatedAttributeValue, indexToUpdate }` |
| DELETE | `/attributes/delete/{sellerId}` | Delete `{ attributes: string }` |

**Staging GET** `/attributes/single/{sellerId}` → array with one doc: `{ _id, sellerID, attributes: [], ... }`

Web seller update URL has double slash (`//`) — mobile seller API uses single slash (correct).

---

## 4. Request/response shapes (detailed)

### Global attribute document

```typescript
interface GlobalAttributeDocument {
  _id: string;
  attributes: string[];  // ordered list of dimension names
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

type GlobalAttributeListResponse = GlobalAttributeDocument[];
```

Web assumes `response[0]` is the platform document. Mobile V1 should treat absence of `[0]` as empty state (Phase 1: confirm backend always returns exactly one doc on staging).

### Merged attributes (read-only consumer)

```typescript
interface GlobalAttributesResponse {
  global?: string[];
  local?: string[];
}
// Consumer merges: [...new Set([...global, ...local])]
```

Implemented in `src/features/seller/products/api/sellerProductsApi.ts` → `getSellerGlobalAttributes()`.

### Mutation payloads (mirror web)

```typescript
interface AddGlobalAttributePayload {
  attributes: string;  // single new name
}

interface UpdateGlobalAttributePayload {
  updatedAttributeValue: string;
  indexToUpdate: number;
}

interface DeleteGlobalAttributePayload {
  attributes: string;  // name to delete, not Mongo _id
}
```

**Index semantics:** Edit/delete target the **array index** at time of load. Concurrent edits could shift indices — same risk as web. Phase 1 should verify backend behavior on stale index.

---

## 5. Search / filter / pagination

**None on web.** Single flat table of all names in the singleton document. Mobile V1: simple scrollable list; no server-side query params observed.

---

## 6. Permission / auth requirements

| Surface | Web | Mobile (recommended V1) |
|---|---|---|
| Global attribute CRUD | Admin layout + `x-api-key` on axios | `useRequireAdmin` + standard API client key |
| `fullAccess` JWT | **Not required** | **Not required** — do not add to `ADMIN_FULL_ACCESS_ROUTE_NAMES` |
| Seller custom attributes | Seller session + `sellerId` | Seller module (`useRequireSeller`) — already implemented |

Matches Settings pattern (any admin), not Commission/User Management (`fullAccess`).

---

## 7. Validation (web vs mobile opportunity)

### Web (global-attribute-management)

| Rule | Enforced? |
|---|---|
| Non-empty name | ✅ Client only |
| Trim whitespace | ❌ |
| Duplicate names | ❌ |
| Max length / character set | ❌ |
| Confirm delete | ❌ |
| Block delete if used by products | ❌ |

### Mobile seller module (reuse candidate)

`src/features/seller/attributes/utils/sellerAttributeValidation.ts`:
- Trim normalization
- Required name
- Case-insensitive duplicate detection

**Recommendation for admin V1:** Reuse validation **patterns** (new shared util or copy into admin module). Do not assume backend rejects duplicates — Phase 1 must probe.

### Operational risk (document, not block V1)

Renaming/deleting a global attribute name does **not** update existing `product.variations` keys. Products may retain old dimension keys until manually edited. Web does not warn about this.

---

## 8. Connection to products / categories

### Products

- **Product type:** Customizable products only use attribute **names** as variation dimension keys.
- **Storage:** `product.variations[]` — each row has dynamic keys (attribute names) plus meta keys (`inventory`, `price`, `quantity`, `image`, `currencyPrice`, etc.).
- **Wizard flow (admin + seller):**
  1. `GET /global-attribute/all/{sellerId}` → merged name list
  2. User selects subset of names
  3. User fills variation matrix (values per dimension)
  4. `PUT` product with `variations` array

**Admin frozen touchpoint:** `useAdminProductVariationsWizard` → `getSellerGlobalAttributes(sellerId)` — **read only**.

**Consumer PDP:** `src/features/products/utils/productVariations.ts` — parses variation keys excluding `VARIATION_META_KEYS`.

### Categories

**No connection found.** Category CRUD under `/admin/categories/*` does not reference attributes. Attributes are independent of category hierarchy.

---

## 9. Existing mobile code inventory

### Reuse for admin V1

| Asset | Path | Use |
|---|---|---|
| Validation patterns | `seller/attributes/utils/sellerAttributeValidation.ts` | Trim, required, duplicate checks |
| UI patterns | `seller/attributes/screens/SellerAttributesScreen.tsx`, `SellerAttributeRow.tsx` | List + inline add/edit/delete UX |
| Hook shape | `seller/attributes/hooks/useSellerAttributes.ts` | Cache-first list, action loading states |
| Merged read (products) | `seller/products/api/sellerProductsApi.ts` → `getSellerGlobalAttributes` | **Do not move** — product-mgmt depends on it |

### Do NOT reuse directly

| Asset | Reason |
|---|---|
| `seller/attributes/api/sellerAttributesApi.ts` | Different endpoints (`/attributes/*` vs `/global-attribute/*`) |
| Product Management module | Frozen; admin attributes is separate CRUD |

### Not admin — already shipped

| Module | Path |
|---|---|
| Seller custom attributes | `src/features/seller/attributes/` |
| Product variation selection (shopper) | `src/features/products/utils/productVariations.ts`, `ProductVariationSelectors.tsx` |
| Seller variations wizard | `src/features/seller/products/hooks/useProductVariationsWizard.ts` |

### Missing (Phase 2+)

- `src/features/admin/attributes/` module
- `AdminNavigator` routes
- Account admin menu row
- `adminGlobalAttributesApi.ts` (new)
- Types for global document + payloads

---

## 10. Phase 1 verification — complete

**Results:** `.cursor/docs/ADMIN_ATTRIBUTES_PHASE1.md`  
**Capture:** `scripts/adminAttributesPhase1Capture.mjs`

Do **not** implement mobile UI until Phase 2 foundation is approved.

---

## 11. Recommended implementation structure (Phase 2+ preview — not started)

```
src/features/admin/attributes/
├── api/adminGlobalAttributesApi.ts
├── types/adminGlobalAttribute.ts
├── hooks/useAdminGlobalAttributes.ts
├── components/AdminGlobalAttributeRow.tsx
├── screens/AdminGlobalAttributesScreen.tsx
└── utils/adminGlobalAttributeValidation.ts  # adapted from seller validation
```

**Navigation:**
- `AdminGlobalAttributes` screen in `AdminNavigator`
- Account → Admin → **Global attributes** (or **Attributes**)
- Optional: dashboard operations shortcut (web has none — skip unless UX request)

**Auth:** `useRequireAdmin` only.

**Freeze compliance:** Do not modify `product-management/` except explicit user-approved fixes. New global names appear automatically in variation wizards via existing `getSellerGlobalAttributes` read path.

---

## 12. Open questions resolved vs remaining

| Question | Phase 0 answer |
|---|---|
| Part of Product Management? | **No** — sibling catalog config module |
| Separate admin module? | **Yes** — `features/admin/attributes/` |
| Admin manages seller custom attrs? | **No** — seller domain |
| Is admin custom-attribute-management real? | **No** — dead/broken |
| Category linkage? | **None** |
| fullAccess required? | **No** — any admin |
| V1 scope | Global attribute name CRUD only |

| Question | Deferred to Phase 1 |
|---|---|
| Backend duplicate enforcement | Staging mutation probe |
| Exact PUT/DELETE response bodies | Staging capture |
| Singleton doc always present | Staging + empty-env edge case |
| Rename impact on existing products | Document only; no auto-migration API |

---

## Related docs

- `ADMIN_SETTINGS_PHASE0.md` — pattern for phased discovery
- `FEATURE_INVENTORY.md` — § Admin Attribute management, § Seller Custom attributes
- `MIGRATION_STATUS.md` — admin roadmap
- `src/features/admin/settings/FROZEN.md` — do not touch Settings
- `src/features/admin/commission/FROZEN.md` — do not touch Commission
