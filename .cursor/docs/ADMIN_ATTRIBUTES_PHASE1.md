# Admin Attributes — Phase 1 Contract (locked)

**Date:** 2026-08-24  
**Environment:** `development.afomamarketplace.com` (staging)  
**V1 scope:** Global attribute name list CRUD (singleton document)  
**Frozen modules:** Settings, Commission, Product Management — do not modify

Capture tooling: `node scripts/adminAttributesPhase1Capture.mjs`  
Mutation probes: `node scripts/adminAttributesPhase1Capture.mjs --mutations --confirm`

---

## Architecture model (confirmed)

This is **not** conventional REST resource CRUD. Mobile must model a **singleton global document** with index/name mutation semantics:

```
GET /global-attribute
        ↓
documents[0]  →  GlobalAttributeDocument
        ↓
parse attributes[]  (filter null / empty holes before UI)

ADD ──────────┐
RENAME ───────┼──→ mutation → response → reconcile GET (always after DELETE)
DELETE ───────┘
```

**Path parameter `{id}`** = Mongo `_id` of the **singleton platform document** — **not** an attribute id, **not** an array index.

Staging document id: `652d282c6e37a025ac69cbf1`

---

## Authentication (confirmed)

Probed all four operations — **do not infer from GET alone**; results are consistent across endpoints.

| Probe | GET | PUT rename | PUT add | DELETE |
|---|---|---|---|---|
| No `x-api-key` | **403** | **403** | **403** | **403** |
| Invalid `x-api-key` | **403** | **403** | **403** | **403** |
| Valid `x-api-key` only | **200** | **200**\* | **200**\* | **200**\* |
| Bearer JWT without key | Not probed (no token in env) | — | — | — |

\*Success status for valid mutations; invalid document id returns **403** (add) or **500** (rename).

**Mobile contract:**
- Send **`x-api-key` only** via standard API client (same as web axios).
- Gate screens with **`useRequireAdmin`** — **not** `fullAccess`.
- Do **not** add Attributes routes to `ADMIN_FULL_ACCESS_ROUTE_NAMES`.

---

## GET contract

**Endpoint:** `GET /global-attribute`

**Response (200):** **Top-level JSON array** of documents (not wrapped):

```json
[
  {
    "_id": "652d282c6e37a025ac69cbf1",
    "attributes": ["Texture", "Pattern", "Colour", "Fragrance", "Material", "Size"],
    "createdAt": "2023-10-16T12:10:20.048Z",
    "updatedAt": "2026-06-25T20:25:57.393Z",
    "__v": 0
  }
]
```

### Parsing rules (mobile)

| Rule | Detail |
|---|---|
| Singleton | Use **`response[0]`** when present — staging always returns exactly **one** document |
| `attributes` type | `string[]` — ordered list of variation **dimension names** |
| Missing doc | If `response[0]` absent → empty list UI; Phase 2 should not assume POST create (no active web flow) |
| **Null holes** | Array may contain `null` entries if a prior rename used an out-of-range index (backend bug). **Filter `null` before UI.** |
| Empty strings | Rename-to-`""` can insert `""` entries; filter for display; delete via DELETE by name `""` |
| Order | Order is meaningful for index-based rename; display order = array order after filtering |

**No search, filter, or pagination parameters.**

---

## ADD contract

**Endpoint:** `PUT /global-attribute/add/{documentId}`

**Body:**

```json
{
  "attributes": "Size"
}
```

| Field | Semantics |
|---|---|
| `attributes` | **Single new name string** — not an array, no index field |
| Insert position | **Prepends** to front of array (index **0**) — verified on staging |
| `{documentId}` | Singleton Mongo `_id` from GET |

**Response (200):** **Flat updated document** (same shape as GET item):

```json
{
  "_id": "652d282c6e37a025ac69cbf1",
  "attributes": ["NewName", "Texture", "..."],
  "createdAt": "...",
  "updatedAt": "...",
  "__v": 0
}
```

Note: PUT add response may return a **compact** `attributes` array (non-null only); always reconcile with GET for DELETE follow-up.

**Error (400):**

```json
{ "error": "Attribute is required" }
```

Triggered by empty string `""`. Web does not hit this (client-side required only).

| Validation probe | Backend result |
|---|---|
| Duplicate exact name | **Allowed** — second copy added |
| Case variant (`Size` vs `size`) | **Allowed** — case-sensitive |
| Empty `""` | **400** `Attribute is required` |
| Whitespace only `"   "` | **Allowed** — stored as-is |
| Invalid document id | **403** `{ "message": "Failed to Add Attributes" }` |

**Mobile:** enforce trim + non-empty + case-insensitive duplicate check client-side (web does not; seller mobile module already has patterns).

---

## RENAME contract

**Endpoint:** `PUT /global-attribute/{documentId}`

**Body:**

```json
{
  "updatedAttributeValue": "Colour",
  "indexToUpdate": 2
}
```

| Field | Semantics |
|---|---|
| `indexToUpdate` | **Array index** into `attributes[]` at time of request — **not** attribute id |
| `updatedAttributeValue` | New name string — **replaces** value at index in-place |
| `{documentId}` | Singleton Mongo `_id |

**Response (200):**

```json
{
  "message": "Attributes updated successfully",
  "updatedAttribute": {
    "_id": "652d282c6e37a025ac69cbf1",
    "attributes": ["...", "..."],
    "createdAt": "...",
    "updatedAt": "...",
    "__v": 0
  }
}
```

Use `updatedAttribute.attributes` for immediate UI update; optional GET refresh for parity with DELETE flow.

| Validation probe | Backend result |
|---|---|
| Happy path rename | **200** — old name gone at index, new name present |
| Rename to existing name | **Allowed** — creates duplicate entries |
| Rename to `""` | **200** — empty string stored at index |
| Stale / huge index (e.g. `9999`) | **200** — expands sparse array with `null` holes (**dangerous**) |
| Negative index (e.g. `-1`) | **200** — do not send; unpredictable |
| Invalid document id | **500** `{ "error": "Internal Server Error" }` |

**Mobile:** track **index at tap time**; after any add/delete, indices shift — refresh list from GET before edit, or resolve by name + re-fetch index. Never send out-of-range index.

---

## DELETE contract

**Endpoint:** `DELETE /global-attribute/one/{documentId}`

**Body:**

```json
{
  "attributes": "Texture"
}
```

| Field | Semantics |
|---|---|
| `attributes` | **Attribute name string** to delete — **not** Mongo id, **not** array index |
| `{documentId}` | Singleton Mongo `_id |

**Response (200):**

```json
{
  "message": "Attribute deleted successfully"
}
```

**Does not return updated document** — mobile **must reconcile via GET** after delete.

| Validation probe | Backend result |
|---|---|
| Delete existing name | **200** — when multiple copies existed (`Texture` ×3), **one DELETE removed all copies** |
| Delete missing name | **200** with same success message (false success — idempotent UX) |
| Delete last remaining name | **200** — list can become empty `[]` (verified: delete `Size`, re-add works) |
| Invalid document id | **404** |
| Order after delete | Remaining items shift; no null holes from normal delete |

**Mobile:** confirm destructive delete in UI; after delete always `GET` reconcile.

---

## Reconciliation flow (locked for Phase 2 API layer)

```typescript
// Types (illustrative — Phase 2)
interface GlobalAttributeDocument {
  _id: string;
  attributes: string[];
  createdAt?: string;
  updatedAt?: string;
}

function parseGlobalAttributeNames(doc: GlobalAttributeDocument | undefined): string[] {
  return (doc?.attributes ?? []).filter(
    (name): name is string => typeof name === 'string' && name.length > 0,
  );
}

// After DELETE only:
async function deleteGlobalAttributeName(documentId: string, name: string) {
  await apiDelete(`/global-attribute/one/${documentId}`, { data: { attributes: name } });
  const fresh = await getGlobalAttributeDocument(); // GET → [0]
  return parseGlobalAttributeNames(fresh);
}
```

Do **not** model as `POST /attributes` or per-item REST resources until backend changes.

---

## Web validation parity

Source: `pages/admin/attribute/global-attribute-management/index.js`

| Scenario | Web behavior | Backend (staging) | Mobile V1 recommendation |
|---|---|---|---|
| Empty name | Client `"Required"` — no request | **400** if sent | Block submit (match backend, improve on web) |
| Whitespace only | Allowed (no trim) | **200** stored | Trim + reject whitespace-only |
| Duplicate add | Allowed | **200** duplicate appended/prepended | Reject duplicate client-side |
| Duplicate rename | Allowed | **200** | Reject duplicate client-side |
| Delete confirm | None | N/A | Confirm dialog |
| Add after delete | Works | **200** prepend | Same |
| Index tracking | Uses index from map at click | Index must be current | Re-fetch or resolve index before rename |

---

## Staging probe notes / hazards

1. **Sparse array corruption:** `indexToUpdate` far beyond array length returns **200** and fills with `null` entries (~10k slots observed). Mobile must validate index bounds client-side.
2. **Auth matrix script:** initial capture used mutating bodies on auth probe — fixed in script to use invalid document id only.
3. **Staging restored** after probes to six canonical names (order may differ from pre-probe): Texture, Pattern, Colour, Fragrance, Material, Size all present.

---

## Phase 1 exit criteria — met

| Criterion | Status |
|---|---|
| GET document shape + parse rules | ✅ |
| ADD body, prepend semantics, validation | ✅ |
| RENAME index body, response shape | ✅ |
| DELETE name body, reconcile GET | ✅ |
| Auth all four ops | ✅ `x-api-key` only |
| Singleton `{id}` semantics | ✅ document Mongo `_id |
| Not conventional REST | ✅ documented |

---

## Phase 2 preview (not started)

Foundation only — no UI yet:

```
src/features/admin/attributes/
├── api/adminGlobalAttributesApi.ts   # document-centric, not REST CRUD
├── types/adminGlobalAttribute.ts
├── hooks/useAdminGlobalAttributes.ts
└── utils/adminGlobalAttributeParse.ts  # filter null/empty, index helpers
```

Navigation shell: `AdminGlobalAttributes` route + Account admin menu row + `useRequireAdmin`.

**Phase 3:** Global attribute list + add / rename / delete UI.

---

## Related

- `ADMIN_ATTRIBUTES_PHASE0.md` — boundary + scope
- `scripts/adminAttributesPhase1Capture.mjs` — capture harness
- `scripts/captures/admin-attributes-phase1-*.json` — raw probe output
