# Admin Settings — Phase 4 QA (complete)

**Date:** 2026-08-24  
**Result:** V1 frozen — see `src/features/admin/settings/FROZEN.md`  
**Constraint:** `src/features/admin/commission/` untouched throughout.

Phase 4 was **QA/polish only** — no new functionality.

---

## Polish applied in Phase 4

| Item | Fix |
|---|---|
| Decimal commission input (`3.5`) | Sanitizer uses whole-number part only (not `35`) |
| Navigate away / back | `useFocusEffect` refresh when not dirty (editors reconcile from API) |
| Failed refresh with cached data | `documentRef` — errors only when no cached document |
| Stale load callback | Removed `document` from `load` deps; request-version guard retained |

---

## Commission Rates — verification

| Check | Status | Notes |
|---|---|---|
| All 3 rate types independent | ✅ | Separate routes + `rateType` param; hydration resets on type change |
| Input 0 | ✅ | Allowed; saves as `"0"` |
| Input 9 | ✅ | Max clamp |
| Decimal / invalid input | ✅ | `3.5` → `3`; non-digits stripped; empty blocked on save |
| Empty input | ✅ | Save disabled; field error on submit attempt |
| Save failure keeps draft | ✅ | Catch path does not reset `inputValue` / `isDirty` |
| Successful save reconciles | ✅ | `saveRate` → `refresh` → hydration updates input |
| Navigate away/back | ✅ | Focus refresh + hydration |
| `createdBy` | ✅ | `resolveAuthUserId(user)` on save body |
| Endpoint-specific auth | ✅ | Documented Phase 1; not blanket-assumed in code |

---

## Featured Shops — verification

| Check | Status | Notes |
|---|---|---|
| 0 → 1 → 2 → 3 shops | ✅ | Client validation + picker `canSelectMore` |
| 4th shop blocked | ✅ | `validateAdminFeaturedShopsSelection` + disabled picker rows |
| Search/filter picker | ✅ | Debounced search → `getAdminSellerList` |
| Remove | ✅ | `removeShop` |
| Reorder up/down at boundaries | ✅ | No-op at index 0 / last |
| Save reordered list → order preserved | ✅ | Array order in PUT content |
| Empty list save | ✅ | `[]` passes validation when dirty |
| Save failure preserves draft | ✅ | `setIsDirty(false)` only on success |
| Successful save reconciles | ✅ | `saveShops` → `refresh` |
| Full seller-object payload | ✅ | `toAdminFeaturedShopSellerPayload` + regression asserts email in JSON |

---

## Cross-module checks

| Check | Status |
|---|---|
| Settings without `fullAccess` | ✅ Not in `ADMIN_FULL_ACCESS_ROUTE_NAMES`; Account menu always shows Settings for admin |
| `fullAccess` routes unaffected | ✅ User Management + Commission unchanged |
| Account → Settings | ✅ |
| Auth-return all Settings routes | ✅ `adminSettingsHub`, `CommissionRates`, `CommissionRate(rateType)`, `FeaturedShops` |
| Back navigation editors → hub | ✅ Stack navigator |
| Loading/error don't blank content | ✅ Cache-first document + conditional error UI |
| Commission/Payout untouched | ✅ |
| Regression test | ✅ `npx --yes tsx scripts/test-admin-settings-content.ts` |

---

## Next admin domains (not started)

Per roadmap after Settings freeze:

- Attributes
- Reviews
- Coupons

Terms editing, Shipping, Rewards, Chatbot, Banner/Carousel, etc. remain out of Settings V1 scope.
