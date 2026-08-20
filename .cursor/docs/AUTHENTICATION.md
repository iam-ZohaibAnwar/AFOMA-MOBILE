# AFOMA Authentication — Web Reference (Code-Traced)

**Source:** Next.js application at `afomaFrontend_STG` (read-only analysis)  
**Purpose:** Document actual authentication behavior for mobile implementation  
**Date:** August 2026

> This document reflects what the Next.js **frontend code** does. The backend is the final authority for validation and authorization. Where the frontend does not show response shapes or backend rules, items are marked **UNKNOWN — NEEDS VERIFICATION**.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Shared Login Entry Point](#2-shared-login-entry-point)
3. [Role-Specific Login Flows](#3-role-specific-login-flows)
4. [OTP Flow (Primary)](#4-otp-flow-primary)
5. [Guest Checkout Identity (Related)](#5-guest-checkout-identity-related)
6. [Legacy / Alternate Flows](#6-legacy--alternate-flows)
7. [Authentication APIs](#7-authentication-apis)
8. [Token Handling](#8-token-handling)
9. [User Object Structure](#9-user-object-structure)
10. [JWT / Role Structure](#10-jwt--role-structure)
11. [Admin `fullAccess` Behavior](#11-admin-fullaccess-behavior)
12. [Client-Side Role Checks](#12-client-side-role-checks)
13. [Logout Behavior](#13-logout-behavior)
14. [Session Timeout & Expiry](#14-session-timeout--expiry)
15. [Error States](#15-error-states)
16. [Role Differences Summary](#16-role-differences-summary)
17. [Unknown / Unclear Behavior](#17-unknown--unclear-behavior)
18. [Mobile Implementation Notes](#18-mobile-implementation-notes)

---

## 1. Overview

All four marketplace roles — **customer**, **seller**, **affiliate**, and **admin** — use the **same primary sign-in page** and the **same OTP email flow**. There are no separate login routes or login APIs per role in the active web application.

| Role | Active login route | Active login API | Post-login redirect (default) |
|------|-------------------|------------------|-------------------------------|
| Customer | `/sign-in` | `POST /users/login` → `POST /users/verify-otp` | `/` |
| Seller | `/sign-in` | Same | `/` |
| Affiliate | `/sign-in` | Same | `/` |
| Admin | `/sign-in` | Same | `/` |

**Key files:**

| File | Role |
|------|------|
| `pages/sign-in.js` | Primary OTP login UI and flow |
| `lib/verifyOtp.js` | OTP verification API call |
| `lib/thirdwebClearAuth.js` | Logout / session clear (client-side) |
| `utils/jwtLite.js` | JWT payload decode + expiry check (client UI only) |
| `middleware.js` | Server-side guard for `/admin/*` only |
| `components/Layout.jsx` | Role-based portal shell (seller/affiliate/admin) |
| `components/Auth.jsx` | Logged-in gate for portal pages |
| `components/Header.jsx` | Global nav, role menus, logout |
| `components/AppShell.jsx` | 1-hour inactivity session timeout |

---

## 2. Shared Login Entry Point

**Route:** `/sign-in`  
**File:** `pages/sign-in.js`

### UI flow

1. User enters email and submits.
2. Frontend calls `POST /users/login`.
3. On success, UI switches to 6-digit OTP entry.
4. OTP auto-submits when all 6 digits are entered (or on paste of 6 digits).
5. Frontend calls `POST /users/verify-otp`.
6. On success, user object + cookie are stored; user is redirected.

### Pre-login cleanup (wallet path only)

Before **Thirdweb wallet login** (`doLogin`), the code clears:

- `localStorage.appliedCoupon`
- `localStorage.selected-delivery-address`
- `localStorage.user`

The **OTP path does not** perform this cleanup before login.

### Redirect query parameter

Cart and sign-in prompt link to `/sign-in?redirect=/cart`.

- **Wallet login** (`doLogin`, status `USER_SIGNED_IN`): honors `redirect` query if present.
- **OTP login** (`handleVerifyOtp`): **does not** read or use `redirect`. All roles redirect to `/` regardless of `?redirect=`.

**Source:** `pages/sign-in.js` — `redirect` used in `doLogin` only (lines ~160–161); OTP handler always `router.push("/")`.

---

## 3. Role-Specific Login Flows

### 3.1 Customer

| Item | Behavior (from code) |
|------|----------------------|
| Login page | `/sign-in` (shared) |
| Registration | Separate public route `/register` (`POST /users` with `userRole: "customer"`) — not part of sign-in |
| Post-login redirect | `/` |
| Account area gate | `components/MyAccountSidebar.jsx` — redirects to `/sign-in` if no `localStorage.user.accessToken` |
| Header menu | Links to `/my-account/account-details` when JWT `role === "customer"` |

**No separate customer login API or OTP flow.**

### 3.2 Seller

| Item | Behavior (from code) |
|------|----------------------|
| Login page | `/sign-in` (shared) |
| Registration | Separate public route `/register-as-a-seller` (`POST /sellers`) — not part of sign-in |
| Post-login redirect | `/` (same as all roles) |
| Portal gate | `components/Layout.jsx` — JWT `role === "seller"` required to render seller shell |
| Seller APIs | Use `localStorage.user.sellerId` for seller-scoped endpoints |
| Header menu | Links to `/seller/dashboard` when JWT `role === "seller"` |

**No separate seller login API or OTP flow.**

### 3.3 Affiliate

| Item | Behavior (from code) |
|------|----------------------|
| Login page | `/sign-in` (shared) |
| Self-registration | **Not present** in frontend — affiliates are created by admin (`POST /users` with `userRole: "affiliate"`) or backend during wallet registration |
| Post-login redirect | `/` |
| Portal gate | `components/Layout.jsx` — JWT `role === "affiliate"` required |
| Dashboard API | Uses `userData.userId` — `GET /affiliate-dashboard/total-sales/{userId}` |
| Header menu | Links to `/affiliate/dashboard` when JWT `role === "affiliate"` |

**No separate affiliate login API or OTP flow.**

### 3.4 Admin

| Item | Behavior (from code) |
|------|----------------------|
| Login page | `/sign-in` (shared) |
| Self-registration | **Not present** — admins created via admin user management |
| Post-login redirect | `/` |
| Server gate | `middleware.js` — all `/admin/*` require cookie JWT with `role === 'admin'` |
| Portal gate | `components/Layout.jsx` — JWT `role === "admin"` required |
| Sub-permission | JWT claim `fullAccess` gates user management and commission (see §11) |
| Header menu | Links to `/admin/dashboard` when JWT `role === "admin"` |

**No separate admin login API or OTP flow in the active app.**

---

## 4. OTP Flow (Primary)

### Step 1 — Request OTP

**Endpoint:** `POST {NEXT_PUBLIC_BASE_URL}/users/login`

**Headers:**

```http
x-api-key: gCV_WZOz9nIa8QwTyEFvccQmIK94Ufxm
```

**Request body:**

```json
{
  "email": "user@example.com"
}
```

**Response handling (frontend):**

| Condition | Frontend action |
|-----------|-----------------|
| `response.data.success === true` | Show OTP UI; store `response.data.otpToken` in component state |
| `response.data.success !== true` | Toast: `response.data.error \|\| "Sign-in request failed"` |
| Network/axios error | Toast: `err.message \|\| "Sign-in request failed"` |

**Response fields used by frontend:**

- `success` (boolean)
- `otpToken` (string) — required for step 2
- `error` (string) — shown on failure

**Full response shape:** UNKNOWN — NEEDS VERIFICATION (only above fields are read in code)

### Step 2 — Verify OTP

**Endpoint:** `POST {NEXT_PUBLIC_BASE_URL}/users/verify-otp`  
**File:** `lib/verifyOtp.js`

**Headers:**

```http
Content-Type: application/json
x-api-key: gCV_WZOz9nIa8QwTyEFvccQmIK94Ufxm
```

**Request body:**

```json
{
  "otp": "123456",
  "otpToken": "<otpToken from step 1>"
}
```

**Response handling (frontend):**

| Condition | Frontend action |
|-----------|-----------------|
| Valid JSON object with `success === true` | Store `result.user` in `localStorage`; set cookie; redirect |
| `success !== true` or invalid body | Set OTP error UI state |
| Fetch exception | Return `{ success: false, message: "<error>" }` internally; OTP error UI |

**OTP validation (client):**

- Must be exactly **6 digits**
- Auto-verify when 6th digit entered or 6 digits pasted
- Resend: calls step 1 again; **60-second** cooldown timer

**On successful OTP login (`pages/sign-in.js`):**

```javascript
localStorage.setItem("bypassthirdweb", true);
localStorage.setItem("user", JSON.stringify(result.user));
Cookies.set("accessToken", result.user.accessToken, { secure: true });
// redirect all roles to "/"
// optionally: getGeoIP(country) from result.user country fields
```

**Fields read from `result.user` after OTP:**

- `userRole` — used for redirect branching (all branches go to `/`)
- `accessToken` — stored in localStorage + cookie
- `country` \| `countryName` \| `Country` — passed to `getGeoIP()` for pricing

**Full `result.user` shape:** UNKNOWN — NEEDS VERIFICATION (see §9 for fields referenced elsewhere)

---

## 5. Guest Checkout Identity (Related)

Not full account login, but uses overlapping OTP APIs on the cart page.

**File:** `pages/cart.js`

### Path A — reCAPTCHA bypass (no OTP)

1. Guest fills address form.
2. `getRecaptchaToken()` → `POST /users/verify-recaptcha` with `{ token }`.
3. If `result.data.success && result.data.score > 0.5`:
   - Store guest object in `localStorage.user` (**no `accessToken` observed in this path**).
   - Call `POST /guest-user` to persist guest.

### Path B — Guest OTP

1. reCAPTCHA score ≤ 0.5 → `sendOTP(user)` → `POST /users/send-otp-toEmail`.
2. Request body: `{ user: <guest object> }` where guest object includes `name`, `email`, `country`, address fields, `phone`, etc.
3. On success: store `result.otpToken`; show OTP modal.
4. Verify via same `POST /users/verify-otp` with `{ otp, otpToken }`.
5. On success: `localStorage.setItem("user", JSON.stringify(result.user))`; call `POST /guest-user`.

### Cart “logged in” check

`isLoggedIn` in cart is `true` if **any** `localStorage.user` exists — including guests **without** `accessToken`.

**Source:** `pages/cart.js` — `setIsLoggedIn(true)` when `userData` is truthy.

---

## 6. Legacy / Alternate Flows

### 6.1 Dashboard email/password login (legacy)

**Route:** `/dashboard/sign-in`  
**File:** `pages/dashboard/sign-in.js`

**Endpoint:** `POST {NEXT_PUBLIC_BASE_URL}/auth/login`

**Request body:**

```json
{
  "email": "<emailId from form>",
  "password": "<password>"
}
```

**On success, stores in `localStorage.afomaCred` (NOT `localStorage.user`):**

```javascript
{
  email: response.data.data.email,
  userRole: response.data.data.userRole,
  accessToken: response.data.data.accessToken,
  refreshToken: response.data.data.refreshToken
}
```

Redirects to `/dashboard`. **Not integrated** with the main app auth (`Header`, `Layout`, `middleware`, OTP flow).

**Status:** Separate legacy flow; **not** the active marketplace login path.

### 6.2 Stub login page

**Route:** `/login` — Formik form with validation; **no submit handler / no API call**.

### 6.3 Thirdweb wallet login (hidden in UI)

**Endpoints:**

- `GET /auth/login-tw-payload?address=&chainId=56`
- `POST /auth/login-tw`

**UI:** Register tab and wallet panel are **commented out** in `pages/sign-in.js`.

**On `USER_SIGNED_IN`:**

- Reads `payload.data` as user object
- Role from `userPayload.role` (not `userRole`)
- **Deletes** `role` and `fullAccess` from object before storing in `localStorage.user`
- Sets cookie `accessToken`
- Honors `?redirect=` query

**On `USER_CREATE_NEW`:** Shows account-type chooser (buyer vs seller registration).

**Status:** Code exists but primary UI is disabled (“Thirdweb discontinued” comment).

### 6.4 Password reset (unauthenticated)

Not login, but related auth:

| Route | API |
|-------|-----|
| `/forgot-password` | `POST /users/forgot-password` — `{ email }` |
| `/forgot-password/[id]` | `POST /users/reset-password/{resetToken}` — `{ resetToken, password, newPassword }` |

---

## 7. Authentication APIs

### Active (used in primary flows)

| Method | Endpoint | Used by | Auth headers |
|--------|----------|---------|--------------|
| POST | `/users/login` | `/sign-in`, OTP resend | `x-api-key` |
| POST | `/users/verify-otp` | `/sign-in`, cart guest OTP | `x-api-key` |
| POST | `/users/send-otp-toEmail` | Cart guest OTP fallback | `x-api-key` |
| POST | `/users/verify-recaptcha` | Cart guest reCAPTCHA | `x-api-key` |
| POST | `/guest-user` | Cart guest persistence | `x-api-key` |

### Secondary / legacy / disabled

| Method | Endpoint | Used by | Notes |
|--------|----------|---------|-------|
| POST | `/auth/login` | `/dashboard/sign-in` | Email/password; separate storage key |
| POST | `/auth/login-tw` | `sign-in.js` (wallet, hidden) | Wallet JWT login |
| GET | `/auth/login-tw-payload` | `sign-in.js` (wallet, hidden) | Wallet auth payload |
| POST | `/auth/logout` | `sign-in.js` `doLogout` only | **Not** called by Header/sidebar logout |

### Authenticated API pattern (post-login)

Most protected calls use:

```http
Authorization: Bearer {accessToken}
x-api-key: gCV_WZOz9nIa8QwTyEFvccQmIK94Ufxm
```

**Note:** Some endpoints use `x-api-key` only (e.g. order list) — authorization enforcement is backend-dependent.

**API key value:** Hardcoded in frontend as `gCV_WZOz9nIa8QwTyEFvccQmIK94Ufxm`. Mobile `.env.example` uses `EXPO_PUBLIC_API_KEY` — mapping to same value should be verified per environment.

---

## 8. Token Handling

### Storage locations

| Storage | Key | Content |
|---------|-----|---------|
| `localStorage` | `user` | JSON string of user profile object (includes `accessToken`) |
| Cookie | `accessToken` | JWT string (`js-cookie`, `{ secure: true }`) |
| `sessionStorage` | `cachedUserRole` | JWT `role` string (UI cache for `Layout.jsx`) |
| `localStorage` | `bypassthirdweb` | `true` after OTP login |
| `localStorage` | `afomaCred` | Legacy dashboard login only |

### Cookie usage

- Set on OTP success and wallet login success.
- Read by `middleware.js` for `/admin/*` route protection (server-side JWT verify).
- Removed by `clearThirdWebAuthTokens()` on logout/expiry.

### JWT verification

| Context | Method |
|---------|--------|
| Admin middleware | `jose.jwtVerify(accessToken, NEXT_PUBLIC_ACCESS_KEY)` — **server-side signature verify** |
| All other UI | `decodeJwtPayload()` in `utils/jwtLite.js` — **decode only, no signature verify** |

### Refresh token

`refreshToken` appears **only** in legacy `/dashboard/sign-in` response stored in `afomaCred`.

**Refresh flow in active OTP login:** UNKNOWN — NEEDS VERIFICATION (no refresh logic found in active code paths)

---

## 9. User Object Structure

The frontend does **not** define a TypeScript schema. Fields below are **only those referenced in code** after login or in authenticated flows.

### Fields observed on `localStorage.user` (OTP / authenticated users)

| Field | Used for | Roles |
|-------|----------|-------|
| `accessToken` | Bearer auth, JWT decode, gates | All authenticated |
| `userRole` | Some page logic, OTP redirect branching | All (on user object) |
| `userId` | Customer APIs, affiliate dashboard, notifications | Customer, affiliate, seller (rewards) |
| `sellerId` | Seller-scoped APIs (products, orders, commission) | Seller |
| `_id` | Fallback ID in chat, notifications, some commission pages | UNKNOWN which roles receive this vs `userId` |
| `email` | Profile, checkout | All |
| `firstName`, `lastName` | Profile display | All |
| `country`, `countryName`, `Country` | Geo/pricing after login | All (when present) |
| `web3address` | OMA buy/sell links | When present |

### Guest user object (cart, reCAPTCHA path)

Built client-side before storage — **no `accessToken`** in the reCAPTCHA bypass path:

```javascript
{
  name, email, country, streetAddress, state, stateCode,
  ZipCode, city, countryCode, phone
}
```

Guest object after OTP verify uses `result.user` from backend — **UNKNOWN** whether it includes `accessToken` or `userRole`.

### Wallet login stored object

`role` and `fullAccess` are **removed** from the stored object; role is only available afterward via JWT decode.

### Complete backend user response

**UNKNOWN — NEEDS VERIFICATION.** Capture a live `POST /users/verify-otp` response per role before defining mobile types.

---

## 10. JWT / Role Structure

### JWT payload fields used in frontend code

| Claim | Used for |
|-------|----------|
| `role` | Primary role check in Header, Layout, affiliate dashboard, downloads page |
| `fullAccess` | Admin sub-permission (sidebar + middleware + dashboard widgets) |
| `exp` | Expiry check via `isJwtExpired()` |

### Role values (from `lib/select-option.js`)

```text
"customer" | "seller" | "admin" | "affiliate"
```

### Naming inconsistency (important for mobile)

| Source | Role field name |
|--------|-----------------|
| JWT payload | `role` |
| `localStorage.user` (OTP) | `userRole` |
| Wallet login before storage | `role` (then deleted from stored object) |

**UI role resolution pattern:**

- `Header.jsx`, `Layout.jsx`, `AdminProductSidebar.jsx` → decode JWT → use `decoded.role`
- `pages/sign-in.js` OTP handler → use `result.user.userRole`
- `pages/my-account/downloads.jsx` → copies `decoded.role` onto `userData.userRole`

**Mobile recommendation:** Treat JWT `role` as the canonical role for navigation after login; verify whether `userRole` on the user object always matches JWT `role`.

---

## 11. Admin `fullAccess` Behavior

### What it is

Boolean JWT claim (`fullAccess`) assigned to admin users via admin user management forms.

**Admin user form fields:** `fullAccess: true | false` sent in `POST /users` and `PUT /users/byAdmin/{id}`.

### Server enforcement (`middleware.js`)

Applies to `/admin/*`:

1. Require cookie `accessToken`.
2. Require JWT `role === 'admin'`.
3. For paths starting with `/admin/user-management` or `/admin/commission`:
   - Require JWT `fullAccess === true`
   - Otherwise redirect to `/forbidden`

### Client enforcement

| Location | Behavior |
|----------|----------|
| `AdminProductSidebar.jsx` | Hides User Management and Commission nav items unless `decoded.fullAccess` |
| `pages/admin/dashboard/index.jsx` | Some dashboard widgets only load when `decoded.role == "admin" && decoded.fullAccess` |

### Not applicable to other roles

`fullAccess` is **only referenced for admin** in traced code. Customer, seller, and affiliate have no equivalent sub-permission in the frontend.

---

## 12. Client-Side Role Checks

### Server-side (only admin)

| Guard | Scope | Rule |
|-------|-------|------|
| `middleware.js` | `/admin/*` | JWT in cookie; `role === 'admin'`; `fullAccess` for restricted paths |

### Client-side gates

| Component / page | Check | On failure |
|------------------|-------|------------|
| `Auth.jsx` | `localStorage.user` exists | “Sign in first” prompt |
| `Layout.jsx` | JWT `role` matches portal (`admin`/`seller`/`affiliate`) | “You don't have access to this page” |
| `MyAccountSidebar.jsx` | `user.accessToken` exists | Redirect `/sign-in` |
| `Header.jsx` | JWT not expired | Clear session → `/sign-in` |
| `AdminProductSidebar.jsx` | JWT not expired | Clear session → `/sign-in` |
| `pages/affiliate/dashboard/index.jsx` | JWT `role == "affiliate"` | Skips dashboard API (sets sale to 0) |
| `pages/my-account/downloads.jsx` | JWT `role === "customer"` | Skips order fetch |
| `pages/my-account/account-details.jsx` | API response `userRole === "customer"` | Does not populate profile otherwise |

### Routes **without** server middleware

| Area | Protection |
|------|------------|
| `/my-account/*` | Client only (`MyAccountSidebar`) |
| `/seller/*` | Client only (`Layout` + `Auth`) |
| `/affiliate/*` | Client only (`Layout` + `Auth`) |

**Critical:** Client checks are for UI/navigation only. Backend must enforce authorization on every API call.

---

## 13. Logout Behavior

### Primary logout (used everywhere in UI)

**Function:** `clearThirdWebAuthTokens()` in `lib/thirdwebClearAuth.js`

**Does NOT call** `POST /auth/logout`.

**Clears:**

- Thirdweb-related localStorage keys (regex match)
- `localStorage.user`, `userInfo`, `appliedCoupon`, `oldSubTotal`, `bypassthirdweb`
- Cookie `accessToken`
- `sessionStorage.cachedUserRole`
- Refreshes geo/pricing via `getGeoIP()`
- Invalidates product list caches

**Then redirects:**

| Trigger | Redirect target |
|---------|-----------------|
| Header, MyAccountSidebar, Seller/Affiliate/Admin headers & sidebars | `/` |
| JWT expiry handlers (Header, Layout, AdminProductSidebar, affiliate dashboard) | `/sign-in` |
| AppShell session timeout | `/sign-in` (after `localStorage.clear()` — **includes cart**) |

### Backend logout (wallet path only)

**Endpoint:** `POST /auth/logout`  
**Called from:** `doLogout()` in `pages/sign-in.js` (Thirdweb wallet flow)  
**On failure:** Warns in console; still clears client tokens via `clearThirdWebAuthTokens()`

---

## 14. Session Timeout & Expiry

### JWT expiry

- Checked client-side via JWT `exp` claim (`utils/jwtLite.js`).
- If `exp` missing → treated as **non-expiring** for UI purposes.
- On expiry → `clearThirdWebAuthTokens()` → redirect `/sign-in`.

### Inactivity timeout

**File:** `components/AppShell.jsx`  
**Duration:** `1 * 60 * 60 * 1000` (1 hour)  
**Behavior:** Clears **all** localStorage (including cart), redirects to `/sign-in`  
**Reset:** On route change (Next.js router events)

**Note:** This timeout runs globally for all users browsing the storefront shell, not only authenticated users.

---

## 15. Error States

### OTP request (`POST /users/login`)

| Error | User-facing behavior |
|-------|---------------------|
| `success !== true` | Toast with `body.error` or generic message |
| Axios/network error | Toast with `err.message` or generic message |
| Invalid email format | HTML5 `required` + `type="email"` on input |

### OTP verify (`POST /users/verify-otp`)

| Error | User-facing behavior |
|-------|---------------------|
| OTP length ≠ 6 | Red border on OTP inputs (`otpError` state) |
| `success !== true` | Red border on OTP inputs |
| Invalid/non-JSON response | Treated as failure (`verifyOtp.js`) |
| Exception | Red border; console error |

### Admin middleware

| Condition | Result |
|-----------|--------|
| No cookie token | Redirect `/sign-in` |
| JWT verify throws | Redirect `/sign-in` |
| `role !== 'admin'` | Redirect `/forbidden` |
| Restricted path + `!fullAccess` | Redirect `/forbidden` |

### Portal Layout

| Condition | Result |
|-----------|--------|
| Logged in but wrong role | Static “You don't have access” message with home link |
| Not logged in (`Auth.jsx`) | “You have to Sign in first” with sign-in button |

### Legacy dashboard login

| Error | User-facing behavior |
|-------|---------------------|
| API failure | Toast “Something went wrong!” |

---

## 16. Role Differences Summary

| Aspect | Customer | Seller | Affiliate | Admin |
|--------|----------|--------|-----------|-------|
| Login page | `/sign-in` | `/sign-in` | `/sign-in` | `/sign-in` |
| Login API | OTP | OTP | OTP | OTP |
| Self-registration | `/register` | `/register-as-a-seller` | None | None (admin-created) |
| Post-login default redirect | `/` | `/` | `/` | `/` |
| Portal layout | Public header + `/my-account/*` | `Layout` seller shell | `Layout` affiliate shell | `Layout` admin shell |
| Server route guard | None | None | None | `middleware.js` on `/admin/*` |
| Primary ID for APIs | `userId` | `sellerId` (+ `userId` for buyer orders/rewards) | `userId` | **UNKNOWN** — admin pages use various patterns |
| Sub-permission | None | None | None | `fullAccess` (JWT) |
| Logout | `clearThirdWebAuthTokens` → `/` | Same | Same | Same |
| Header “My Menu” link | `/my-account/account-details` | `/seller/dashboard` | `/affiliate/dashboard` | `/admin/dashboard` |

**No role uses a different OTP endpoint or login API in the active codebase.**

---

## 17. Unknown / Unclear Behavior

| Topic | Status |
|-------|--------|
| Full JSON response from `POST /users/login` | **UNKNOWN — NEEDS VERIFICATION** |
| Full JSON response from `POST /users/verify-otp` (`result.user` fields) | **UNKNOWN — NEEDS VERIFICATION** |
| Whether `userId` and `_id` are always both present or interchangeable | **UNKNOWN — NEEDS VERIFICATION** (code uses both with fallback logic in notifications) |
| Whether guest OTP verify returns `accessToken` / `userRole` | **UNKNOWN — NEEDS VERIFICATION** |
| JWT `exp` duration set by backend | **UNKNOWN — NEEDS VERIFICATION** |
| Whether `POST /auth/logout` should be called on mobile logout | **UNKNOWN — NEEDS VERIFICATION** (active UI does not call it) |
| `?redirect=` not honored after OTP login | **Confirmed bug/ gap in web code** — mobile should decide whether to implement redirect correctly |
| `refreshToken` usage in active OTP flow | **Not present in code** — **UNKNOWN** if backend issues one |
| Backend behavior when OTP sent to non-existent email | **UNKNOWN — NEEDS VERIFICATION** |
| Backend behavior when wrong OTP exceeded N times | **UNKNOWN — NEEDS VERIFICATION** |
| Whether admin login requires different email domain or 2FA | **UNKNOWN — NEEDS VERIFICATION** |
| Exact JWT signing secret relationship (`NEXT_PUBLIC_ACCESS_KEY` vs backend) | Middleware uses `NEXT_PUBLIC_ACCESS_KEY`; mobile cannot replicate middleware verify client-side |
| Whether seller accounts always receive `sellerId` in OTP login response | **UNKNOWN — NEEDS VERIFICATION** (seller pages assume it exists) |

---

## 18. Mobile Implementation Notes

Based on traced web behavior (not prescriptive architecture):

1. **Single auth module** — one OTP login flow for all roles; branch navigation on JWT `role`.
2. **Store securely** — `accessToken` in secure storage; user profile in appropriate storage tier.
3. **Always send** `x-api-key` + `Authorization: Bearer` on protected calls (when token exists).
4. **Do not trust client role alone** — mirror web UI gates for navigation, but rely on backend for authorization.
5. **Implement `?redirect=` correctly** if cart/checkout deep-linking is required (web OTP flow currently does not).
6. **Handle ID field inconsistency** — support both `userId` and `_id` until backend contract is verified.
7. **Admin mobile** — if supported, implement `fullAccess` gating equivalent to middleware + sidebar rules.
8. **Guest checkout** — separate from authenticated login; may not produce a full JWT (reCAPTCHA path stores user without token).
9. **Session timeout** — web uses 1-hour inactivity clear; confirm whether mobile should match.
10. **Verify live API responses** before defining TypeScript types — do not guess field names beyond what code references.

---

## Appendix — Key Source Files

| Path | Relevance |
|------|-----------|
| `afomaFrontend_STG/pages/sign-in.js` | Primary OTP login |
| `afomaFrontend_STG/lib/verifyOtp.js` | OTP verify API |
| `afomaFrontend_STG/lib/thirdwebClearAuth.js` | Logout / clear session |
| `afomaFrontend_STG/lib/api.js` | Guest OTP send, reCAPTCHA verify |
| `afomaFrontend_STG/utils/jwtLite.js` | JWT decode + expiry |
| `afomaFrontend_STG/middleware.js` | Admin server auth |
| `afomaFrontend_STG/components/Layout.jsx` | Portal role gate |
| `afomaFrontend_STG/components/Auth.jsx` | Login presence gate |
| `afomaFrontend_STG/components/Header.jsx` | Global auth UI |
| `afomaFrontend_STG/components/AppShell.jsx` | Session timeout |
| `afomaFrontend_STG/pages/cart.js` | Guest identity + OTP |
| `afomaFrontend_STG/pages/dashboard/sign-in.js` | Legacy password login |
