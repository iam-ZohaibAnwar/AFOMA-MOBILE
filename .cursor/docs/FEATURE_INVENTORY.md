AFOMA Ecommerce — Web Feature Inventory & Mobile Gap Analysis
Exploration covered 183 pages in afomaFrontend_STG (Pages Router only, no app/ directory) and the afomaMobile workspace, which currently contains only a Cursor rules file — no app code.

API base: {NEXT_PUBLIC_BASE_URL} via lib/apiUrl.js
Common header: x-api-key on most calls; authenticated calls add Authorization: Bearer {accessToken}
Auth storage: localStorage.user + cookie accessToken
Cart state: global in components/AppShell.jsx, persisted to localStorage and synced via /cart/* for logged-in users

Architecture Overview
Roles
Auth Layer
Commerce Core
/thank-you
Customer
Seller
Affiliate
Admin
/sign-in — OTP email
middleware.js — /admin/* only
Layout.jsx — client JWT role gate
Browse / Search / PDP
/cart
/checkout
POST /paypal/captureorder
Layer	Mechanism	Scope
Server auth
middleware.js
/admin/* only — JWT role === 'admin'; fullAccess for user-mgmt & commission
Client auth
Layout.jsx, Auth.jsx, MyAccountSidebar.jsx
Seller, affiliate, customer areas — JWT role check in browser
Backend enforcement
All APIs
Must not rely on client role checks alone
1. Shopping (Public Browse)
Feature	Route(s)	Key APIs	Business Rules
Home
/
GET /products/best/Product, /discounted/Product, /newArrival/Product, /bestSelling/Product, GET /sellers/{id}, GET /settings/all/types
Geo-based currency via lib/geoIP.js; pricing via calculateSurcharge() in utils/pricingUtils.js; ISR/cache via /api/cache-version
Categories
/category, /category/[categoryId]
GET /categories, /sub-categories, /child-category, GET /products/search/related/{id}
Only productStatus === "Approved" && status == 1; category slugs mapped in lib/categoryMap.js
Sub/child categories
/category/{cat}/{sub}, /category/{cat}/{sub}/{child}/{slug}
Same as above
Pagination/load-more; 4-segment URLs for child categories
Product detail (PDP)
/category/.../[...productId], /product?id=, /preview/[id]
GET /products/slug/{slug}, /reviews/single/{id}, /reviews/average-review/{id}, POST /shipping/product-create-estimates
3 product types: Standard, Customizable (variant key {productId}_{values}), Downloadable (qty=1). Inventory gates add-to-cart. Recently viewed in localStorage
Seller storefront
/shop/[slug]
GET /sellers/store/{slug}, GET /products/by/{sellerId}, GET /reviews/seller/{sellerId}
Hidden when shop_status === 0
Search
/search?q=
GET /products/global/search?name={q}
Load-more 12 at a time; no faceted filters
Wishlist (add)
PDP components
POST /wishlist
Requires login
Reviews (read)
PDP
GET /reviews/single/{productId}, customized variant endpoint
Average rating displayed
Geo/pricing
Global
GET /api/geo, GET /shipping-config/user-surcharge?userCountry=
International surcharge per seller route; currency conversion via Frankfurter CDN
Mobile status: ❌ All missing — afomaMobile has no code.

2. Cart
Feature	Route	Key APIs	Business Rules
Cart page
/cart
POST /shipping/getRate, POST /coupon/apply-coupon, POST /cart/add-cart, GET /cart/{userId}
Cart in localStorage; server sync on save for logged-in users
Add/update/remove
Global (AppShell.jsx)
—
Surcharge applied on add; customizable products use composite keys
Shipping quotes
Cart
POST /shipping/getRate (Freightcom)
Grouped by seller; downloadable → no shipping (rate = -1); user picks carrier per line
Coupons
Cart
POST /coupon/apply-coupon
Seller, admin, or affiliate coupons; split across lines; validated via lib/couponCodeRules.js (3–32 chars)
Guest checkout identity
Cart
POST /users/send-otp-toEmail, POST /users/verify-otp, POST /guest-user, reCAPTCHA
Score > 0.5 bypasses OTP; guest stored in localStorage.user
Service fee (display)
Cart summary
—
(subtotal + shipping) × 0.03 + 0.30 — client-side display only
Address selection
/change-delivery-address
GET/PUT /users/{userId}
Default = profile fields; additional in user.address[]; selected stored in localStorage.selected-delivery-address
Mobile status: ❌ All missing. Must replicate localStorage contract or replace with mobile-native persistence + server sync.

3. Checkout & Payments
Feature	Route	Key APIs	Business Rules
Checkout
/checkout
See payment table below
Single-page; reads cart/totals from localStorage; merges delivery address
PayPal
Checkout
POST /paypal/createorder → POST /paypal/captureorder
PayPal SDK approval flow
Stripe (card)
Checkout
POST /payments/payment/intent → capture
Modal card entry
Apple Pay
Checkout
POST /api/create-payment-intent (Next proxy) → capture
Uses Stripe confirm
Korapay
Checkout
POST /korapay/initialize → capture
Popup; African corridors (NGN, GHS, ZAR, KES, etc.)
Start Button
Checkout
POST /paypal/createorder (paymentMethod: "startButton") → capture
Bank transfer popup
Order placement
All methods
POST /paypal/captureorder
Single convergence point — sends full cart payload + paymentMethod
Success
/thank-you
—
Clears cart, coupon, delivery address client-side
First-order discount popup
Global component
POST /guest-user/first-order-signup
25s delay; blocked on cart/checkout/sign-in
Payment rules:

Stripe hidden for African currencies; Korapay + Start Button shown instead
No Paystack in active checkout (only in legacy checkout-copy/)
Google Pay radio exists but not wired
No frontend webhooks — confirmation is synchronous via captureorder
No explicit sales tax calculation in frontend
Mobile status: ❌ All missing. Mobile will need native SDK integrations for PayPal, Stripe, Korapay, and Start Button, all converging on /paypal/captureorder.

4. Customer
Feature	Route	Key APIs	Status (Web)	Mobile
Sign in (OTP)
/sign-in
POST /users/login, POST /users/verify-otp
✅ Live
❌
Register
/register
POST /users (userRole: "customer")
✅ Live
❌
Forgot/reset password
/forgot-password, /forgot-password/[id]
POST /users/forgot-password, POST /users/reset-password/{token}
✅ Live
❌
Legacy login
/login, /reset-password
None
⚠️ Stub (no API)
Skip
Account hub
/my-account/*
—
✅ (no dedicated dashboard)
❌
Profile
/my-account/account-details
GET/PUT /users/{userId}
✅ Live
❌
Orders list
/my-account/my-orders
GET /orders/getOrders/ByUserId/{userId}
✅ Live
❌
Order detail
/my-account/my-orders/view?id=
GET /orders/{id}, DELETE /shipping/cancel-shipment/{orderId}
✅ Live
❌
Cancel order
Order detail
DELETE /shipping/cancel-shipment/{orderId}
Disabled if Shipped/Cancelled
❌
Reviews (write)
Order detail
POST/PUT /reviews/*
From purchased items
❌
Address book
/change-delivery-address
GET/PUT /users/{userId}
✅ Live
❌
Wishlist
/my-account/wish-list
GET/POST/DELETE /wishlist/*
⚠️ Page exists; sidebar disabled ("Coming soon")
❌
Rewards/wallet
/my-account/my-wallet
GET /rewards/{userId}, POST /rewards/redeem, GET /reward-management/Threshold
✅ Live
❌
Earnings
/my-account/earning
GET /commission/affiliate/{id}
⚠️ Uses affiliate API — likely wrong for customers
❌
Downloads
/my-account/downloads
Orders API
⚠️ Stub UI
❌
Crypto details
/my-account/my-crypto-details
None
⚠️ Stub
❌
Reward points
/my-account/my-reward-points
None
⚠️ Empty shell
❌
Change password
/my-account/reset-password
PUT /users/password/{userId}
⚠️ Page exists; nav disabled
❌
Notifications
Header dropdown
GET/PUT/DELETE /notifications/*
✅ Live
❌
Chat
/chat
WebSocket + GET {SOCKET_URL}/api/chats/{userId}
✅ Live (cross-role)
❌
Customer auth rules: Blocked countries on register; OTP 6 digits; 60s resend cooldown; client-only route protection on /my-account/*.

5. Seller
Feature	Route	Key APIs	Business Rules	Mobile
Register
/register-as-a-seller
POST /sellers
Multi-field validation; blocked countries; referral fields
❌
Dashboard
/seller/dashboard
GET /seller-dashboard/seller/{id}/orders/count, pending payouts, latest orders
—
❌
Profile setup (8-step gate)
/seller/my-account/*
GET/PUT /sellers/{id}
Must complete: basicInfo, sellerDetails, sellerPolicies, paymentInfo, currency, domesticShipping, internationalShipping before product creation
❌
Shipping config
/seller/shipping-config
GET/POST /seller/shipping-config/*
Flat rate / AFOMA / hand delivery; AFOMA domestic = CA, US only
❌
Products (3 types)
/seller/product/*
GET/POST/PUT/DELETE /products/*, upload endpoints, AI listing
Standard ≥3 images, Downloadable ≥2, max 2MB; lifecycle Draft→Review→Approved; inventory InStock/OutOffStock
❌
Custom attributes
/seller/custom-attribute-management
GET/PUT/DELETE /attributes/*
Per-seller attribute CRUD
❌
Order management
/seller/order-management
GET /orders/sellerData/{sellerId}, shipping status updates, label generation
Statuses: Pending/Shipped/Delivered/Cancelled/Abandoned/Processing
❌
My orders (as buyer)
/seller/my-orders
Same as customer orders
—
❌
Earnings
/seller/earning
GET /commission/seller/{sellerId}
Filter by payout status
❌
Payout (Korapay)
/get-paid?commissionId=
POST /commission/korapay-payout-request + Korapay resolve
Admin-initiated link; bank/mobile money
❌
Coupons
/seller/coupons
GET/POST/PUT/DELETE /coupon/*
Full coupon CRUD
❌
Reviews
/seller/review
GET /reviews/seller/{sellerId}, reply CRUD
Seller can reply to reviews
❌
Shop toggle
/seller/settings
PUT /sellers/seller-shop/update-status/{id}
shop_status 0/1
❌
Rewards
/seller/my-wallet
Same as customer rewards
—
❌
Support
/seller/support
None
⚠️ Coming Soon
❌
Legacy order pages
/seller/order
None
⚠️ UI shell only
Skip
Storefront
/shop/[slug]
Public
Respects shop_status
❌ (public)
Seller auth: Client JWT role === "seller" via Layout.jsx; no server middleware on /seller/*.

6. Affiliate
Feature	Route	Key APIs	Business Rules	Mobile
Auth
Shared /sign-in
Same OTP flow
No self-registration — admin creates affiliates
❌
Dashboard
/affiliate/dashboard
GET /affiliate-dashboard/total-sales/{userId}
Total sales, order count, AOV
❌
Affiliate links
/affiliate/coupons
GET/POST/PUT/DELETE /coupon/*
Implemented as coupons, not named "links"; max 3 per affiliate; locked to 1% percentage
❌
Commissions
/affiliate/earning
GET /commission/affiliate/{userId}
Read-only; filter by payout status
❌
Withdrawals
/get-paid?commissionId=
Korapay payout APIs
Not self-service — admin sends payout link
❌
Rewards
/affiliate/my-wallet
Rewards APIs
Token redeem + OMA buy/sell external link
❌
My orders
/affiliate/my-orders
Customer order APIs
Affiliate's own purchases
❌
Referrals
—
—
Not implemented for affiliates
❌
Settings/account
/affiliate/my-account
None
⚠️ Coming Soon stub
❌
Affiliate auth: Client-only JWT check; no server middleware on /affiliate/*.

7. Admin
Feature	Route	Key APIs	Permission	Mobile
Auth
/sign-in + middleware.js
OTP flow
Server JWT role === 'admin'
❌
Dashboard
/admin/dashboard
10+ dashboard endpoints
Admin; some widgets need fullAccess
❌
User management
/admin/user-management/*
GET/POST/PUT/DELETE /users/*
fullAccess required
❌
Seller management
/admin/seller-management/*
GET/POST/PUT /sellers/*, status change
Admin
❌
Product management
/admin/product/*
Full product CRUD
Admin
❌
Category management
/admin/categories/*
/categories, /sub-categories, /child-category
⚠️ Partial Coming Soon overlays
❌
Attribute management
/admin/attribute/*
/global-attribute/*
⚠️ Partial stub
❌
Order management
/admin/order-management/*
Orders CRUD, shipping labels, pay shipment
Admin
❌
Commission/payouts
/admin/commission/*
GET /commission, PUT /commission/updatePayoutStatus, POST /commission/payout-link-kora
fullAccess required
❌
Coupons
/admin/coupons
Full coupon CRUD + notifications
Admin
❌
Reviews moderation
/admin/review/*
GET /reviews/, status updates
Admin
❌
Rewards admin
/admin/reward-management, /admin/afoma-rewards
Airdrop, threshold config
Admin
❌
Shipping config
/admin/shipping-config, settings
Platform + per-seller config
Admin
❌
Settings hub
/admin/settings/*
Terms, images, shops, CSV export, commission %, chatbot knowledge
Admin
❌
Reports
/admin/report
None
⚠️ Coming Soon
❌
Activity log
/admin/activitylog
None
⚠️ Static placeholder
❌
My account
/admin/my-account
None
⚠️ Coming Soon
❌
Admin sub-permission: JWT claim fullAccess gates user management and commission in both middleware and sidebar.

8. Cross-Cutting Features (All Roles)
Feature	Route/Component	APIs	Mobile
Chat
/chat
WebSocket + REST
❌
Notifications
Header dropdown
/notifications/*
❌
Geo/currency
Global (geoIP.js)
/api/geo, surcharge config
❌
Training
/training
Separate flow
❌ (out of core ecommerce scope)
Blogs
/blogs, /blogs-category
Content pages
❌
Thirdweb wallet
Sign-in (hidden)
/auth/login-tw
⚠️ Unclear if needed on mobile
9. Mobile Feature Inventory Summary
Current mobile state
afomaMobile contains zero application code — only .cursor/rules/mobile-developement.mdc defining intended parity. No screens, navigation, API client, or dependencies exist.

Recommended mobile build phases
Phase	Scope	Priority APIs	Complexity
P0 — Core shopping
Home, categories, PDP, search, cart
Products, categories, shipping rates, cart sync
High (3 product types, geo pricing)
P0 — Auth & checkout
OTP login, guest checkout, address, payments
Users, guest-user, captureorder, PayPal/Stripe/Korapay SDKs
Very high (5 payment methods)
P1 — Customer account
Profile, orders, addresses, reviews, notifications
Users, orders, reviews, notifications
Medium
P2 — Seller portal
Dashboard, products, orders, shipping, earnings
Seller, products, orders, commission APIs
Very high (8-step profile gate)
P3 — Affiliate portal
Dashboard, coupons (links), commissions
Affiliate dashboard, coupon, commission APIs
Medium
P4 — Admin portal
Full admin surface
All admin APIs
Very high; consider web-only for admin
10. Missing / Unclear Areas
Web app gaps (clarify before mobile parity)
Area	Issue	Recommendation
Auth protection
/my-account/*, /seller/*, /affiliate/* are client-only
Confirm backend enforces ownership on all APIs; mobile must not trust client role
Wishlist
Page exists but nav disabled
Decide: ship or drop on mobile
Customer earnings page
Uses affiliate commission API
Likely bug — clarify intended behavior
Affiliate referrals
No UI exists
Confirm if referral program is coupon-only
Affiliate withdrawals
Admin-initiated Korapay links only
Mobile needs deep link handler for /get-paid?commissionId=
Paystack
Only in legacy checkout-copy
Confirm if mobile needs Paystack at all
Google Pay
Radio shown but unwired
Skip on mobile unless backend adds support
Service fee
Client-calculated 3% + $0.30
Confirm backend validates same amount on capture
Tax
No frontend tax logic
Confirm if tax is backend-only or not applicable
Downloads page
Stub UI
Implement using productData.downloadableLink from order detail
Crypto/OMA wallet
Partial stubs + external afoma.io links
Clarify if mobile needs Web3 integration
Admin stubs
Reports, activity log, parts of categories
Don't port stubs — wait for web completion
Seller sidebar link
Points to non-existent basic-information/view route
Fix on web first
Thirdweb wallet login
Hidden in sign-in UI
Clarify if mobile needs wallet auth
Mobile-specific decisions needed
Decision	Options	Impact
Admin on mobile
Full admin app vs. web-only admin
Large scope reduction if web-only
Payment SDKs
Native PayPal/Stripe/Korapay vs. WebView checkout
Affects App Store compliance
Cart persistence
AsyncStorage + server sync vs. server-only
Must match guest + logged-in flows
Geo/currency
Device locale vs. IP-based geo
Web uses IP; mobile may differ
Chat
Native socket vs. skip v1
Real-time dependency
Push notifications
FCM/APNs for order updates
Not in web — new capability
Deep links
Affiliate coupons, payout links, product slugs
Required for affiliate/seller flows
11. Master API Reference (Grouped)
Auth & Users
POST /users/login, /users/verify-otp, /users/send-otp-toEmail, /users, /users/forgot-password, /users/reset-password/{token}, PUT /users/password/{userId}, GET/PUT /users/{userId}, PUT /users/byAdmin/{id}, DELETE /users/{id}, POST /users/upload-profile, POST /auth/login, /auth/login-tw, /auth/logout, POST /guest-user, POST /guest-user/first-order-signup

Products & Categories
GET /products/* (slug, by seller, search, global search, related, best/discounted/newArrival/bestSelling), POST/PUT/DELETE /products/{id}, PUT /products/status/{id}, PUT /products/update-status, upload image/video/file endpoints, AI listing endpoints, GET /categories, /sub-categories/*, /child-category/*, /global-attribute/*, /attributes/*

Cart, Shipping, Coupons
POST /cart/add-cart, GET /cart/{userId}, POST /shipping/getRate, POST /shipping/product-create-estimates, POST /coupon/apply-coupon, GET/POST/PUT/DELETE /coupon/*

Orders & Reviews
GET /orders/getOrders/ByUserId/{userId}, GET /orders/{id}, GET /orders/sellerData/{sellerId}, GET /orders/single/{sellerId}/{orderId}, PUT /orders/update/status/{id}, PUT /orders/{orderId}/products/{productId}/shipping, POST /orders/payShipment, shipping label/schedule/cancel endpoints, GET/POST/PUT /reviews/*

Payments
POST /paypal/createorder, POST /paypal/captureorder, POST /payments/payment/intent, POST /korapay/initialize, Korapay payout resolve/disburse endpoints

Sellers, Commission, Rewards
GET/POST/PUT /sellers/*, seller dashboard, shipping config, shop status, GET /commission/seller|affiliate/{id}, PUT /commission/updatePayoutStatus/{orderId}, POST /commission/payout-link-kora, POST /commission/korapay-payout-request, rewards CRUD + redeem + threshold + airdrop

Admin & Settings
Admin dashboard endpoints, GET/POST/PUT/DELETE /settings/*, /shipping-config/*, /reward-management/*, /notifications/*, chatbot knowledge proxy

12. Conclusion
The web app is a mature multi-role marketplace with ~183 pages covering customer shopping/checkout, seller product/order management, affiliate coupon-based tracking, and a full admin back office. The commerce core (browse → cart → multi-gateway checkout → order management) is the most complex area due to geo-pricing, 3 product types, Freightcom shipping, and 5 payment methods converging on a single capture endpoint.

The mobile app has not been started — afomaMobile is a planning workspace only. Building mobile parity requires scaffolding the app first, then prioritizing P0 (shopping + auth + checkout) before role-specific portals. Several web features are stubs or internally inconsistent (wishlist nav, customer earnings, affiliate referrals, admin reports) and should be clarified with stakeholders before mobile implementation to avoid porting dead ends.

If useful, I can next produce a screen-by-screen mobile blueprint (navigation tree + API mapping per screen) or a prioritized sprint backlog from this inventory.



Agent