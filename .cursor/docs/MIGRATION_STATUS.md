# AFOMA Mobile Migration Status

## Status Legend

- ⬜ Not started
- 🟡 In progress
- 🟢 Completed
- 🔴 Blocked
- ⚪ Deferred

## Foundation

- ⬜ React Native project setup
- ⬜ TypeScript configuration
- ⬜ Environment configuration
- ⬜ API client
- ⬜ Authentication infrastructure
- ⬜ Secure storage
- ⬜ Navigation
- ⬜ Shared UI components
- ⬜ Error handling
- ⬜ Logging

## Shopping

- ⬜ Home
- ⬜ Categories
- ⬜ Subcategories
- ⬜ Child categories
- ⬜ Product listing
- ⬜ Product details
- ⬜ Product variants
- ⬜ Search
- ⬜ Seller storefront
- ⬜ Wishlist

## Cart

- ⬜ Guest cart
- ⬜ Authenticated cart
- ⬜ Cart synchronization
- ⬜ Add product
- ⬜ Update quantity
- ⬜ Remove product
- ⬜ Shipping rates
- ⬜ Coupons
- ⬜ Delivery address

## Checkout

- ⬜ Checkout flow
- ⬜ PayPal
- ⬜ Stripe
- ⬜ Apple Pay
- ⬜ Korapay
- ⬜ Start Button
- ⬜ Order confirmation

## Customer

- ⬜ Login
- ⬜ Registration
- ⬜ OTP verification
- ⬜ Password reset
- ⬜ Profile
- ⬜ Orders
- ⬜ Order details
- ⬜ Order cancellation
- ⬜ Reviews
- ⬜ Addresses
- ⬜ Wishlist
- ⬜ Rewards
- ⬜ Notifications
- ⬜ Chat

## Seller

- ⬜ Registration
- ⬜ Seller onboarding
- ⬜ Dashboard
- ⬜ Profile
- ⬜ Shipping configuration
- ⬜ Products
- ⬜ Product creation
- ⬜ Product editing
- ⬜ Inventory
- ⬜ Attributes
- ⬜ Orders
- ⬜ Shipping
- ⬜ Earnings
- ⬜ Payout
- ⬜ Coupons
- ⬜ Reviews
- ⬜ Shop status
- ⬜ Rewards

## Affiliate

- ⬜ Login
- ⬜ Dashboard
- ⬜ Coupons
- ⬜ Commissions
- ⬜ Withdrawals
- ⬜ Rewards
- ⬜ My orders

## Admin

- ⚪ Mobile admin decision required

### Admin modules (mobile)

| Module | Status |
|---|---|
| Dashboard | 🟢 |
| Seller Management | 🟢 |
| Order Management | 🟢 |
| Product Management | 🟢 **Frozen** |
| User Management | 🟢 **Frozen** |
| Commission / Payout | 🟢 **Frozen** (Phases 0–4) |
| Settings | 🟢 **Frozen** (V1) |
| Attributes | 🟢 **Phase 3 complete** — freeze pending QA |
| Reviews | 🟢 **Phase 3 complete** — freeze pending QA |
| Coupons | 🟢 **Phase 3 complete** — freeze pending QA |

**Settings V1 frozen:** Hub + commission rates (3) + featured shops. See `src/features/admin/settings/FROZEN.md`.

**Attributes Phase 3:** Global attribute list + add/rename/delete UI with mobile validation. Freeze after QA — see `.cursor/docs/ADMIN_ATTRIBUTES_PHASE1.md`.

**Coupons Phase 3:** Admin-owned list (pagination, pull-to-refresh, load-more), create/edit form with mobile validation, detail with edit/delete, `createdBy` preservation on edit. Freeze after QA — see `.cursor/docs/ADMIN_COUPONS_PHASE1.md`.

**Reviews Phase 3:** List + detail + status moderation UI with populated-field preservation. Freeze after QA — see `.cursor/docs/ADMIN_REVIEWS_PHASE1.md`.

**Commission / Payout freeze notes:** See `src/features/admin/commission/FROZEN.md`. Rates live under Settings; payout ops stay frozen. GetPaid recipient flow is a separate track.

## Cross-Cutting

- ⬜ Notifications
- ⬜ Chat
- ⬜ Deep linking
- ⬜ Push notifications
- ⬜ Analytics
- ⬜ Crash reporting

## Decisions Required

- ⬜ Mobile admin or web-only admin
- ⬜ Payment SDK strategy
- ⬜ Chat in V1
- ⬜ Push notification requirements
- ⬜ Thirdweb wallet requirement
- ⬜ Paystack requirement
- ⬜ Wishlist requirement