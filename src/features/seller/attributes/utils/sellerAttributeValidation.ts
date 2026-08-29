export function normalizeAttributeName(value: string): string {
  return value.trim();
}

export function validateAttributeName(value: string): string | null {
  if (value.length > 0 && !value.trim()) {
    return 'Attribute name cannot be only whitespace';
  }

  const name = normalizeAttributeName(value);

  if (!name) {
    return 'Attribute name is required';
  }

  return null;
}

export function validateAddAttributeName(rawValue: string, existingNames: string[]): string | null {
  const baseError = validateAttributeName(rawValue);
  if (baseError) {
    return baseError;
  }

  return getDuplicateAttributeError(normalizeAttributeName(rawValue), existingNames);
}

export function validateRenameAttributeName(
  rawValue: string,
  existingNames: string[],
  excludeIndex: number,
): string | null {
  const baseError = validateAttributeName(rawValue);
  if (baseError) {
    return baseError;
  }

  return getDuplicateAttributeError(normalizeAttributeName(rawValue), existingNames, excludeIndex);
}

export function findAttributeByIndex(
  attributes: Array<{ name: string; index: number }>,
  index: number,
): { name: string; index: number } | undefined {
  return attributes.find((attribute) => attribute.index === index);
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
