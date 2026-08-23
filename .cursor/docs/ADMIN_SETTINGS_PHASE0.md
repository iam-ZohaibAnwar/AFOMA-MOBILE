# Admin Settings — Phase 0 Discovery

**Date:** 2026-08-23  
**Status:** Phase 0 complete — **V1 scope locked**; **Phase 1 contract locked** — see `ADMIN_SETTINGS_PHASE1.md`  
**Constraint:** `src/features/admin/commission/` remains **read-only** during Settings migration.

---

## Locked mobile scope (agreed)

Settings on mobile is **configuration-only**. No duplication of other admin modules.

### Tier A — V1 (locked)

| Item | V1 |
|---|---|
| Settings hub | ✅ |
| Commission rate settings (3 types) | ✅ |
| Featured Shops | ✅ |
| Terms & Conditions **edit** | ❌ **Deferred** — read already shipped via `useTermsConditions` |

```
Admin Settings (V1)
│
├── Settings Hub
├── Commission Rates
│   ├── Affiliate %
│   ├── Seller Referral %
│   └── Buyer Referral %
└── Featured Shops

Terms (outside V1 Settings)
├── Read → already supported
└── Edit → deferred
```

### Tier B — not in current migration

Shipping Matrix, Seller Shipping Configuration, CSV export, and any other settings surfaced during contract verification that are not required for the mobile admin workflow.

**Not committed as future mobile requirements** — revisit only when there is a concrete product need.

### Tier C — permanently out of Settings (mobile)

| Excluded | Reason |
|---|---|
| Chatbot Knowledge | Web-only; no mobile chatbot admin need |
| Banner / Carousel CMS | Web-only; mobile home does not consume CMS |
| Enable/Disable Seller | **Owned by Seller Management** — do not recreate under Settings |
| Reward Management | Separate domain; excluded |
| `/admin/afoma-rewards` | Separate wallet airdrop ledger |
| Legacy duplicate routes | e.g. `/admin/shipping-config`, `/admin/reward-management` |

### Module boundary (Commission rates ≠ Commission/Payout)

```
Admin Settings                    Admin Commission (FROZEN)
    │                                   │
    └── Commission Rates                └── Payout Operations
          ├── Affiliate %                     ├── Commission list
          ├── Seller Referral %               ├── Initiate payout
          └── Buyer Referral %                └── Payout status
```

- Rates: `/settings` types — implemented in `admin/settings/`
- Payout ops: `/commission/*` — **do not modify** `src/features/admin/commission/`

### Phase 1 verification scope (in scope only)

- [x] Settings hub / navigation contract (any admin, not `fullAccess`)
- [x] Commission rate GET / POST / PUT contract (3 types)
- [x] Featured Shops GET / update contract
- [ ] Terms GET / update — **skipped** (edit deferred from V1)
- [x] Authentication behavior on staging (`x-api-key` required; no `fullAccess`)
- [x] Validation: 0–9% and max 3 shops are **client-only**; backend accepts out-of-range values

**Phase 1 results:** `.cursor/docs/ADMIN_SETTINGS_PHASE1.md`

---

## 1. Web route map

### Hub

| Route | File | Purpose |
|---|---|---|
| `/admin/settings` | `pages/admin/settings/index.jsx` | Card grid hub — 13 destinations |

### Dedicated pages (outside dynamic `[id]`)

| Route | File | Notes |
|---|---|---|
| `/admin/settings/chatbot-knowledge` | `pages/admin/settings/chatbot-knowledge/index.jsx` | Full CRUD UI |
| `/admin/settings/reward-management` | `pages/admin/settings/reward-management/index.jsx` | Buyer/seller rewards, threshold, airdrop |
| `/admin/settings/shipping-config` | `pages/admin/settings/shipping-config/index.jsx` | Platform shipping matrix |
| `/admin/settings/seller-shipping-config` | `pages/admin/settings/seller-shipping-config/index.jsx` | Seller list → detail |
| `/admin/settings/seller-shipping-config/[id]` | `pages/admin/settings/seller-shipping-config/[id].js` | Admin edits seller shipping config |

### Dynamic `[id]` routes (`pages/admin/settings/[id].jsx`)

| `id` / query | UI | Mutations |
|---|---|---|
| `terms-conditions` | Quill rich-text editor | GET/POST/PUT `/settings` |
| `csvs` | Schema + date range download | GET `/settings/downloadCSV/{schema}` |
| `shops?tab=advertise` | Reuses `AdminSellerMgmt` — pick ≤3 featured shops | PUT `/settings/{id}` type `shops` |
| `shops?tab=enable-disable` | Reuses `AdminSellerMgmt` with `isStatus` | **Bug:** Submit wired to `handleAddShop`, not `handleSubmit` |
| `upload-images` | `UploadImages` carousel (max 5) | POST `/settings/upload-image` + POST/PUT `/settings` |
| `upload-single-image` | `UploadImages` banner (max 1) | Same |
| `affiliate-commission` | Number input 0–9% | POST/PUT `/settings` |
| `seller-referral-commission` | Number input 0–9% | POST/POST `/settings` |
| `buyer-referral-commission` | Number input 0–9% | POST/PUT `/settings` |

### Legacy duplicates (same implementation, not in active sidebar)

| Route | Notes |
|---|---|
| `/admin/shipping-config` | Duplicate of `settings/shipping-config`; sidebar link **commented out** |
| `/admin/reward-management` | Duplicate of `settings/reward-management`; sidebar link **commented out** |

### Related admin routes **outside** Settings hub

| Route | Relationship |
|---|---|
| `/admin/afoma-rewards` | Separate — wallet airdrop ledger (`GET /rewards/all`), not reward-management config |
| `/admin/seller-management` | Overlaps shop enable/disable; featured shops stored in settings type `shops` |

---

## 2. Functional vs shell / weak

| Area | Verdict | Rationale |
|---|---|---|
| Chatbot Knowledge | **Functional** | Full list + modal CRUD + seed; uses Next proxy → backend `/chatbot-knowledge/*` |
| Reward Management | **Functional** | CRUD buyer/seller rewards, threshold, CSV/web3 airdrop — large surface |
| Shipping Matrix | **Functional** | Tier + matrix CRUD via `/shipping-config/*` |
| Seller Shipping Config (admin) | **Functional** | Reuses seller shipping form; heavy UI |
| Terms & Conditions | **Functional** | Quill + settings API |
| Carousel / Banner images | **Functional** | Multipart upload + settings JSON content |
| Featured Shops (`shops` advertise) | **Functional** | Settings-backed; max 3 sellers |
| Enable/Disable Shop (settings path) | **Broken / duplicate** | Same as Seller Management; submit bug on web |
| CSV export | **Functional** | Download trigger; mobile file handling TBD |
| Commission % (3 types) | **Functional** | Simple numeric settings; **not** Commission/Payout module |
| `/admin/afoma-rewards` | **Functional** | Separate from settings hub |
| `/admin/report`, `/admin/activitylog`, `/admin/my-account` | **Stub / coming soon** | Out of Settings scope |

---

## 3. API inventory

### Generic settings (`/settings/*`)

| Method | Endpoint | Used by | Auth observed (web) |
|---|---|---|---|
| GET | `/settings/type/{type}` | `[id].jsx`, public terms page | x-api-key; Bearer on admin GET |
| GET | `/settings/all/types` | Home featured shops | x-api-key |
| POST | `/settings` | Create setting doc | x-api-key + `createdBy` |
| PUT | `/settings/{id}` | Update setting doc | x-api-key + `createdBy` |
| POST | `/settings/upload-image` | Carousel/banner upload | x-api-key, multipart |
| GET | `/settings/downloadCSV/{schema}?from=&to=` | CSV export | x-api-key |

**Setting types (admin-managed):** `terms-conditions`, `shops`, `upload-images`, `upload-single-image`, `affiliate-commission`, `seller-referral-commission`, `buyer-referral-commission`

### Shipping config

| Method | Endpoint |
|---|---|
| GET | `/shipping-config/all` |
| POST | `/shipping-config/create` |
| DELETE | `/shipping-config/{id}` |

### Seller shipping (admin view)

| Method | Endpoint |
|---|---|
| GET | `/sellers` |
| GET | `/seller/shipping-config/{sellerId}` |
| POST | `/seller/shipping-config/create` |

### Reward management

| Method | Endpoint |
|---|---|
| GET | `/reward-management/all` |
| POST | `/reward-management/create` |
| POST | `/reward-management/create/threshold` |
| DELETE | `/reward-management/{id}` |
| GET | `/reward-management/Threshold` | *(consumer wallets — not admin)* |
| GET | `/users/` | Airdrop user picker |
| POST | `/rewards/air-drop` | Token airdrop |

### Chatbot knowledge

| Method | Endpoint | Notes |
|---|---|---|
| GET/POST/PUT/DELETE | `/chatbot-knowledge/*` | Web uses `/api/admin/chatbot-knowledge` Next proxy with `BACKEND_API_KEY` |

### Shop visibility (overlap)

| Method | Endpoint |
|---|---|
| PUT | `/sellers/seller-shop/update-status/{sellerId}?shop_status=0\|1` |

---

## 4. Auth & permission boundaries

### Web (`middleware.js`)

- All `/admin/*`: requires admin JWT cookie.
- **`fullAccess` required only for:** `/admin/user-management`, `/admin/commission`.
- **`/admin/settings/*` is NOT fullAccess-gated** on web (any admin).

### Web sidebar (`AdminProductSidebar.jsx`)

- Settings link: **visible to all admins**
- User Management + Commission: **`fullAccess` only**
- Legacy Shipping Config / Reward Management nav: **commented out** (hub replaces them)

### Mobile (current)

| Mechanism | Scope |
|---|---|
| `useRequireAdmin` | All admin stack screens |
| `ADMIN_FULL_ACCESS_ROUTE_NAMES` | User Management, Commission only |
| Account → Admin menu | Dashboard, Seller/Order/Product Mgmt always; User + Commission if `fullAccess` |
| **Settings** | **Not implemented** — no route, no menu entry |

**Working assumption for Phase 1:** Match web — Settings available to any acting admin, not `fullAccess`-gated — **pending staging verification**.

---

## 5. Existing mobile implementation

### Consumer / shared (already shipped)

| Location | API | Purpose |
|---|---|---|
| `src/services/api/settingsApi.ts` | GET `/settings/type/{type}`, GET `/settings/all/types` | Terms (read), featured shop IDs |
| `src/features/legal/hooks/useTermsConditions.ts` | settings type `terms-conditions` | Read-only legal page |
| `src/features/home/hooks/useFeaturedSellers.ts` | `/settings/all/types` | Home shop spotlight |
| `src/services/api/shippingApi.ts` | GET `/shipping-config/user-surcharge` | Checkout geo surcharge |

### Seller (not admin settings)

| Location | Purpose |
|---|---|
| `src/features/seller/settings/screens/SellerShopSettingsScreen.tsx` | Seller shop preferences |
| `src/features/seller/shipping/*` | Seller self-service shipping config |

### Admin overlap (reduces Settings scope)

| Mobile module | Overlaps web Settings item |
|---|---|
| `admin/seller-management` | Enable/disable shop (`updateAdminSellerShopVisibility`) |
| *(none)* | Featured shops admin picker |
| *(none)* | Carousel/banner CMS — home uses **hardcoded** promo slides from product images |
| *(none)* | Commission % editors |
| *(none)* | Shipping matrix, reward config, chatbot CRUD, CSV export, terms editor |

### Admin stack gap

- No `src/features/admin/settings/`
- `AdminNavigator` ends at `AdminCommission`
- `adminTypes.ts` has no Settings routes

---

## 6. Shared vs admin-only

| Concern | Audience | Mobile today |
|---|---|---|
| Terms content | Public read | Read-only ✅ |
| Featured shops | Home consumer | Read via settings API ✅ |
| Geo shipping surcharge | Checkout consumer | Read ✅ |
| Reward threshold | Wallet consumer | Not wired on mobile admin |
| Terms editor, images, commission %, matrix, rewards config, chatbot KB, CSV | Admin only | ❌ |

**Commission/Payout module (frozen)** handles payout **operations** (`/commission/*`). Settings commission **rates** (`affiliate-commission`, `*-referral-commission`) are separate settings documents — no conflict if Commission folder stays read-only.

---

## 7. Phase 1 APIs in scope (Tier A only)

| Concern | Endpoints | Setting `type` |
|---|---|---|
| Commission rates | GET `/settings/type/{type}`, POST `/settings`, PUT `/settings/{id}` | `affiliate-commission`, `seller-referral-commission`, `buyer-referral-commission` |
| Featured shops | Same + seller list for picker (reuse admin seller APIs) | `shops` |
| Terms (if V1) | Same | `terms-conditions` |

**Web validation to confirm on staging:**

- Commission %: integer 0–9 (web blocks values &gt; 9)
- Featured shops: max **3** sellers (web toast at limit; hub copy says "4" in one place — verify)
- Terms: `content` is JSON-stringified HTML from Quill

**Out of Phase 1 API verification:** `/settings/upload-image`, `/settings/downloadCSV/*`, `/shipping-config/*`, `/reward-management/*`, `/chatbot-knowledge/*`, shop enable/disable (`/sellers/seller-shop/update-status/*` — Seller Management).

---

## 8. Suggested implementation phases (after Phase 1 lock)

| Phase | Scope |
|---|---|
| **1** | Contract verification (staging) — Tier A APIs + auth only |
| **2** | Foundation — hub, navigator, Account menu, types, read/mutation API layer |
| **3** | Tier A screens — commission rates, featured shops, terms (if V1) |
| **4** | Polish — cache-first, validation parity, regression scripts |

---

## 9. Files to reference (web — Tier A only)

```
pages/admin/settings/index.jsx          # hub pattern (mobile hub will be subset)
pages/admin/settings/[id].jsx           # commission %, shops, terms
pages/admin/seller-management/index.jsx # featured-shop picker behavior (fromSettings)
middleware.js                           # any-admin, not fullAccess
components/AdminProductSidebar.jsx
pages/terms-conditions.jsx              # consumer read parity
```

## 10. Files to reference (mobile)

```
src/services/api/settingsApi.ts          # extend for admin mutations
src/features/admin/navigation/AdminNavigator.tsx
src/features/admin/utils/adminFullAccessRoutes.ts
src/features/account/screens/AccountScreen.tsx
src/features/admin/seller-management/  # shop visibility overlap
src/features/admin/commission/FROZEN.md
```
