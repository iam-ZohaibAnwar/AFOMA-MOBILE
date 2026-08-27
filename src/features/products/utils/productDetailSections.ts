const DEFAULT_PREVIEW_MAX_LENGTH = 180;

export function truncateProductDetailPreview(
  text: string,
  maxLength = DEFAULT_PREVIEW_MAX_LENGTH,
): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

export function shouldShowProductDescriptionSection(description: string | undefined): boolean {
  return Boolean(description?.trim());
}
