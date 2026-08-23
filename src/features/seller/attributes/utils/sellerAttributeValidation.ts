export function normalizeAttributeName(value: string): string {
  return value.trim();
}

export function validateAttributeName(value: string): string | null {
  const name = normalizeAttributeName(value);

  if (!name) {
    return 'Attribute name is required';
  }

  return null;
}

export function findDuplicateAttributeIndex(
  name: string,
  attributes: string[],
  excludeIndex?: number,
): number {
  const normalized = normalizeAttributeName(name).toLowerCase();

  return attributes.findIndex((attribute, index) => {
    if (excludeIndex != null && index === excludeIndex) {
      return false;
    }

    return normalizeAttributeName(attribute).toLowerCase() === normalized;
  });
}

export function getDuplicateAttributeError(name: string, attributes: string[], excludeIndex?: number): string | null {
  const duplicateIndex = findDuplicateAttributeIndex(name, attributes, excludeIndex);

  if (duplicateIndex >= 0) {
    return 'An attribute with this name already exists';
  }

  return null;
}
