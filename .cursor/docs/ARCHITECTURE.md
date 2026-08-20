# AFOMA Mobile Architecture

## Core Principle

The mobile app is a new React Native application.

The Next.js application is only the functional reference.

Do not copy its architecture or code.

## Application Structure

src/
├── app/
│   ├── navigation/
│   ├── providers/
│   └── config/
│
├── components/
│   └── shared UI components
│
├── features/
│   ├── auth/
│   ├── shopping/
│   ├── cart/
│   ├── checkout/
│   ├── customer/
│   ├── seller/
│   ├── affiliate/
│   ├── admin/
│   ├── notifications/
│   └── chat/
│
├── services/
│   ├── api/
│   ├── auth/
│   ├── storage/
│   ├── payments/
│   ├── notifications/
│   └── websocket/
│
├── hooks/
├── utils/
├── constants/
└── types/

## Feature Architecture

Each feature should contain its own related code.

Example:

features/products/
├── api/
├── components/
├── hooks/
├── screens/
├── types.ts
└── utils/

Do not put feature-specific code into shared directories.

## Shared Code

Create shared components, hooks or utilities only when they are
genuinely reusable.

Avoid premature abstractions.

Avoid duplicated API logic.

Avoid giant utility files.

Avoid giant components.

## API Layer

Screens and UI components must not directly implement API communication.

API calls should live in feature API modules or services.

Example:

features/products/api/getProduct.ts

The screen should consume the API through a hook or appropriate
application service.

## Authentication

Authentication logic must be centralized.

Do not implement login/token handling separately for:

- Customer
- Seller
- Affiliate
- Admin

Role-specific navigation and permissions should build on the
central authentication system.

## Storage

Do not use browser localStorage or cookies.

Use mobile-appropriate storage.

Sensitive authentication data must use secure storage.

Cart persistence should support guest users and synchronization
with the existing backend for authenticated users.

## Navigation

Navigation must be mobile-first.

Do not convert web URLs directly into mobile navigation.

Use appropriate:

- stacks
- tabs
- modals
- nested navigators

Role-specific navigation should be separated from public shopping
navigation.

## Payments

Payment integrations must be isolated behind a payment service layer.

The UI should not directly depend on individual payment SDKs.

Payment providers currently identified by the web application include:

- PayPal
- Stripe
- Apple Pay
- Korapay
- Start Button

The exact mobile implementation must be determined before checkout
implementation.

## Web-to-Mobile Migration

Preserve functionality, not implementation.

For every web feature:

1. Understand the existing behavior.
2. Identify the backend APIs.
3. Identify business rules.
4. Identify permissions.
5. Identify validation.
6. Identify edge cases.
7. Design the mobile UX.
8. Implement the feature independently.

## Code Quality

Use TypeScript.

Keep UI, business logic and API communication separated.

Prefer composition over duplication.

Keep functions focused.

Keep components focused.

Use descriptive names.

Do not introduce dependencies without a clear reason.

## Testing

Each completed feature should be checked for:

- TypeScript errors
- lint errors
- API errors
- loading state
- empty state
- error state
- successful flow
- important edge cases

## Important Rule

Never modify unrelated features while implementing a feature.

If an existing backend or web behavior appears incorrect or unclear,
document it instead of silently changing its behavior.