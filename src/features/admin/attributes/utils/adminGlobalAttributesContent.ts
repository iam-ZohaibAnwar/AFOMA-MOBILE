import type {
  GlobalAttributeDocument,
  GlobalAttributeEntry,
  GlobalAttributeListResponse,
} from '../types/adminGlobalAttributes';

/** First singleton document from GET /global-attribute, if present. */
export function getSingletonGlobalAttributeDocument(
  response: GlobalAttributeListResponse,
): GlobalAttributeDocument | null {
  if (!Array.isArray(response) || response.length === 0) {
    return null;
  }

  return response[0] ?? null;
}

/**
 * Safe attribute names for UI — removes null holes only.
 * Does not trim or dedupe (transport contract vs mobile UX validation).
 */
export function parseGlobalAttributeNames(attributes: (string | null)[] | undefined): string[] {
  if (!Array.isArray(attributes)) {
    return [];
  }

  return attributes.filter((name): name is string => typeof name === 'string');
}

/**
 * Entries with raw array indices for index-based rename mutations.
 * Null holes are skipped; empty strings are retained.
 */
export function parseGlobalAttributeEntries(
  attributes: (string | null)[] | undefined,
): GlobalAttributeEntry[] {
  if (!Array.isArray(attributes)) {
    return [];
  }

  return attributes.flatMap((name, rawIndex) => {
    if (typeof name !== 'string') {
      return [];
    }

    return [{ name, rawIndex }];
  });
}

export function parseGlobalAttributeDocument(
  document: GlobalAttributeDocument | null | undefined,
): {
  documentId: string | null;
  attributeNames: string[];
  entries: GlobalAttributeEntry[];
} {
  if (!document?._id) {
    return {
      documentId: null,
      attributeNames: [],
      entries: [],
    };
  }

  const attributeNames = parseGlobalAttributeNames(document.attributes);
  const entries = parseGlobalAttributeEntries(document.attributes);

  return {
    documentId: document._id,
    attributeNames,
    entries,
  };
}
