# Admin Settings — FROZEN (V1)

**Status:** Frozen after Phases 0–4 (2026-08-24)

Do **not** modify this module casually while working on other admin or mobile features. Changes require an explicit bugfix, security fix, or approved scope expansion.

**Dependency rule:** Treat this folder as **read-only by default** during other module work. Integrate at caller boundaries — do not edit files here unless the change is an explicitly approved Settings fix.

**Commission/Payout:** `src/features/admin/commission/` remains a separate frozen module. Settings **commission rates** configure `/settings/*-commission` documents — not payout operations.

---

## V1 scope (frozen)

```
Admin Settings
├── Settings Hub                         🔒
├── Commission Rates
│   ├── Affiliate Commission %          🔒
│   ├── Seller Referral Commission %    🔒
│   └── Buyer Referral Commission %     🔒
├── Featured Shops                       🔒
├── Shipping Matrix                      🔒
├── CSV Export                           🔒
└── Seller Shipping Config               🔒
```

## Included (complete)

- Settings hub + navigation (`useRequireAdmin` only — **not** `fullAccess`)
- Account → Settings entry for any admin role
- Auth return-to helpers for all Settings routes
- Commission rate editors: integer 0–9 input, client validation, save, reconcile on focus/save
- Featured shops: picker (max 3), remove, reorder, save full seller-object array, empty list allowed
- Shipping Matrix: tier CRUD, country multi-select, origin→destination surcharge matrix, Save All upsert, delete on last tier
- CSV Export: schema picker, optional date range, download + share via `/settings/downloadCSV/{schema}` and `/csv/{schema}.csv`
- Seller Shipping Config: seller list + per-seller editor reusing seller shipping UI/API (admin save omits `profileSetup`)
- Raw document vs parsed content separation (`AdminSettingDocument` / parse helpers)
- Cache-first load — refresh failures do not clear cached document or draft
- POST/PUT `/settings` via `adminSettingsApi.ts`

## Explicitly out of scope (unchanged)

- Reward Management, Chatbot Knowledge, Banner/Carousel CMS
- Terms & Conditions editing (web admin only; customer read path in `src/features/legal/`)
- Seller enable/disable (Seller Management)
- Attributes, Reviews, Coupons
- Legacy duplicate web routes

## Client-enforced validation (backend does not enforce)

- Commission rates: **0–9** integer %
- Featured shops: **max 3**, unique sellers, full objects (not IDs-only)
- Shipping Matrix: tier name + ≥1 country; unique tier names (client); full N×N matrix on save (missing cells → 0)

## Auth notes

- Mobile UX: any acting admin (`useRequireAdmin`)
- API: endpoint-specific — see Phase 1 contract; do not assume a blanket settings auth model
- Settings routes are **not** in `ADMIN_FULL_ACCESS_ROUTE_NAMES`

## Module location

```
src/features/admin/settings/
```

## Regression tests

```bash
npx --yes tsx scripts/test-admin-settings-content.ts
```

## Staging capture (read-only)

```bash
node scripts/adminSettingsPhase1Capture.mjs
node scripts/adminSettingsPhase1Capture.mjs --auth-matrix
```

## Phase docs

- Discovery / scope: `.cursor/docs/ADMIN_SETTINGS_PHASE0.md`
- API contract: `.cursor/docs/ADMIN_SETTINGS_PHASE1.md`
- QA checklist: `.cursor/docs/ADMIN_SETTINGS_PHASE4.md`
