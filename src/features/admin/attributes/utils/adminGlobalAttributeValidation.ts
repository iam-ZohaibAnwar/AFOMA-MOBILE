import type { GlobalAttributeEntry } from '../types/adminGlobalAttributes';

export function normalizeGlobalAttributeName(value: string): string {
  return value.trim();
}

function isDuplicateName(name: string, existingNames: string[], ignoreRawIndex?: number, entries?: GlobalAttributeEntry[]): boolean {
  const normalized = normalizeGlobalAttributeName(name).toLowerCase();

  if (entries) {
    return entries.some((entry) => {
      if (ignoreRawIndex != null && entry.rawIndex === ignoreRawIndex) {
        return false;
      }

      return normalizeGlobalAttributeName(entry.name).toLowerCase() === normalized;
    });
  }

  return existingNames.some(
    (existing) => normalizeGlobalAttributeName(existing).toLowerCase() === normalized,
  );
}

/** Mobile UX validation for add — not enforced by API layer. */
export function validateAddGlobalAttributeName(
  rawValue: string,
  existingNames: string[],
): string | null {
  if (rawValue.length > 0 && !rawValue.trim()) {
    return 'Attribute name cannot be only whitespace';
  }

  const name = normalizeGlobalAttributeName(rawValue);

  if (!name) {
    return 'Attribute name is required';
  }

  if (isDuplicateName(name, existingNames)) {
    return 'An attribute with this name already exists';
  }

  return null;
}

/** Mobile UX validation for rename — uses rawIndex against current parsed entries. */
export function validateRenameGlobalAttributeName(
  rawValue: string,
  entries: GlobalAttributeEntry[],
  rawIndex: number,
): string | null {
  const targetEntry = entries.find((entry) => entry.rawIndex === rawIndex);

  if (!targetEntry) {
    return 'This attribute is no longer available. Refresh and try again.';
  }

  if (rawValue.length > 0 && !rawValue.trim()) {
    return 'Attribute name cannot be only whitespace';
  }

  const name = normalizeGlobalAttributeName(rawValue);

  if (!name) {
    return 'Attribute name is required';
  }

  if (isDuplicateName(name, [], rawIndex, entries)) {
    return 'An attribute with this name already exists';
  }

  return null;
}

export function findGlobalAttributeEntryByRawIndex(
  entries: GlobalAttributeEntry[],
  rawIndex: number,
): GlobalAttributeEntry | undefined {
  return entries.find((entry) => entry.rawIndex === rawIndex);
}
