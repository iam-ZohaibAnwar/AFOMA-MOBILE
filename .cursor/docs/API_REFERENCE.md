# AFOMA Mobile API Reference

## Backend

The mobile application uses the existing AFOMA backend.

Do not create a separate mobile backend.

## API Base URL

The web application currently uses:

NEXT_PUBLIC_BASE_URL

The mobile application will use an environment-based API URL.

Do not hardcode production URLs.

## Authentication

Authenticated requests use:

Authorization: Bearer {accessToken}

Most API requests also require:

x-api-key

## API Source of Truth

The complete API inventory is documented in:

docs/FEATURE_INVENTORY.md

The existing backend implementation is the final source of truth.

Do not invent endpoints.

Do not change HTTP methods.

Do not change request or response structures without verification.

## API Architecture

All HTTP communication must go through the mobile API layer.

Do not call fetch/axios directly from screens.

Recommended structure:

services/
└── api/
    ├── client
    ├── interceptors
    └── errors

Feature-specific API functions should live with their feature.

Example:

features/
└── products/
    └── api/
        ├── getProduct.ts
        ├── getProducts.ts
        └── searchProducts.ts

## API Discovery Rule

Before implementing a feature:

1. Inspect the existing web implementation.
2. Identify the API endpoint.
3. Identify HTTP method.
4. Identify request parameters/body.
5. Identify authentication requirements.
6. Identify response structure.
7. Identify error behavior.
8. Verify the backend behavior if unclear.

If an endpoint is missing or unclear:

DO NOT GUESS.

Report the issue.

## API Reuse

Do not duplicate API logic.

If multiple features use the same endpoint, create an appropriate
shared service.

Do not create abstractions merely to avoid a few lines of code.

## Error Handling

API errors must be handled consistently.

The API layer should normalize errors where appropriate.

Screens should be responsible for presenting the appropriate
user-facing state.

## Pagination

Respect the existing backend pagination behavior.

Do not assume every API uses the same pagination format.

Verify pagination per feature.

## Authentication Tokens

Token storage and retrieval must be centralized.

Screens and feature components must never manually manage
authentication tokens.

## API Types

API request and response types should be defined using TypeScript.

Do not use `any` unless there is a documented reason.

When backend responses are unclear, verify them instead of guessing.