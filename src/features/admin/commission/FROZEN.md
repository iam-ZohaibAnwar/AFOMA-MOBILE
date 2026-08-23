# Admin Commission / Payout — FROZEN

**Status:** Frozen after Phases 0–4 (2026-08-23)

Do **not** modify this module casually while working on other admin or mobile features. Changes require an explicit bugfix, security fix, or approved scope expansion.

**Dependency rule:** Treat this folder as **read-only by default** during other module work. If Settings or another feature needs commission behavior, integrate at the caller boundary — do not edit files here unless the change is an explicitly approved Commission fix.

## Included (complete)

- `GET /commission` list with search, payout-status filter, role filter, raw-document pagination
- `GET /commission/total/amount` summary (independent of list rows)
- `adminCommissionDisplayMapper` — seller / affiliate / referral display rows
- `buildKorapayPayoutLinkPayload` — full web synthetic POST body (distinct from display rows)
- Initiate Korapay payout (`POST /commission/payout-link-kora`) with client guards + confirmation
- Payout status mutation (`PUT /commission/updatePayoutStatus/:id`) — Pending ↔ Paid
- Cache-first list, stale-request protection, mutation reconciliation, per-row action errors
- `useRequireFullAccess` gate + dashboard Pending preset

## Explicitly out of scope (separate tracks)

- GetPaid / Korapay recipient completion
- Legacy SB `/payout` flow
- Commission rate settings (`/admin/settings/*-commission`)
- Bulk payouts, commission CRUD, Seller Management commission tab
- Email URL verification (external QA; does not block admin mutations)

## Open freeze checklist item

- **Backend JWT / `fullAccess` enforcement on commission APIs** — not verified; mobile gate is UX-only until backend QA completes

## Module location

```
src/features/admin/commission/
```

## Regression tests

```bash
npx --yes tsx scripts/test-admin-commission-display-mapper.ts
```

## Staging capture tooling (non-runtime)

```
scripts/adminCommissionPhase3Capture.mjs
scripts/captures/          # gitignored
```
