# AFOMA Ecommerce Mobile App

## Purpose

Build a new React Native mobile application for iOS and Android.

The existing Next.js ecommerce application is the functional reference.

The mobile application must reproduce the required business functionality
of the web application while using a clean, mobile-first architecture.

## Backend

The existing backend will be shared by:

- Next.js web application
- React Native mobile application

Do not create a new backend.

Do not modify backend behavior unless explicitly required.

## Frontend Architecture

The mobile application is being built from scratch.

Do not copy the Next.js architecture or implementation.

Do not directly reuse:

- Next.js components
- Next.js pages
- Web CSS
- Browser APIs
- Browser-specific libraries
- Web-only SDKs

Reuse the existing backend APIs and business behavior.

## User Roles

The application supports:

- Customer
- Seller
- Affiliate
- Admin

Role-based access must be enforced by the backend.

The mobile client may use the user's role to control navigation and UI,
but client-side role checks must never be considered sufficient authorization.

## Ecommerce Functionality

The mobile application must support the required functionality for:

- Home
- Categories
- Subcategories
- Child categories
- Product listing
- Product details
- Search
- Seller storefronts
- Wishlist
- Cart
- Checkout
- Payments
- Orders

## Customer

Support the required customer functionality identified in:

`docs/FEATURE_INVENTORY.md`

## Seller

Support the required seller functionality identified in:

`docs/FEATURE_INVENTORY.md`

## Affiliate

Support the required affiliate functionality identified in:

`docs/FEATURE_INVENTORY.md`

## Admin

Admin functionality is currently under evaluation.

Do not implement the complete admin portal until the product decision
has been made regarding mobile admin support.

## Functional Parity

The goal is:

Functional parity, not page-by-page parity.

The mobile application does not need to reproduce the web application's
URLs, layouts, or page structure.

The mobile application should reproduce the required:

- business rules
- user actions
- API behavior
- permissions
- validation
- success states
- loading states
- empty states
- error states

while using mobile-appropriate UX.

## Source of Truth

Use:

`docs/FEATURE_INVENTORY.md`

as the current functional inventory.

Use the existing Next.js application to verify functionality when needed.

Use the existing backend as the API source of truth.

If functionality or API behavior is unclear, do not guess.
Document the uncertainty and request clarification.