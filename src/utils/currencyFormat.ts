export function normalizeCurrencyCode(currency?: string): string {
  if (!currency?.trim()) {
    return 'CAD';
  }

  return currency.trim().toUpperCase();
}

export function formatMoneyAmount(
  value: unknown,
  currency = 'CAD',
  fallback = '—',
): string {
  if (value == null || value === '') {
    return fallback;
  }

  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return `${normalizeCurrencyCode(currency)} ${parsed.toFixed(2)}`;
}

export function formatCadAmount(value: unknown, fallback = '—'): string {
  return formatMoneyAmount(value, 'CAD', fallback);
}
