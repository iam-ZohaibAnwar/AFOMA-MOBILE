export function validateAdminCsvDateInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return 'Use YYYY-MM-DD format.';
  }

  return null;
}
