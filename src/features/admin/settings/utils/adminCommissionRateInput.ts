import { ADMIN_COMMISSION_RATE_MAX, ADMIN_COMMISSION_RATE_MIN } from './adminSettingsConstants';

/** Web parity — integer percent only (0–9); allow empty while editing. */
export function sanitizeAdminCommissionRateInput(raw: string): string {
  if (raw === '') {
    return '';
  }

  // Decimal input (e.g. 3.5) uses the whole-number part only — not 35.
  const integerPart = raw.split(/[.,]/)[0] ?? '';
  const digitsOnly = integerPart.replace(/\D/g, '');
  if (!digitsOnly) {
    return '';
  }

  const numeric = Number(digitsOnly);
  if (!Number.isFinite(numeric)) {
    return '';
  }

  if (numeric > ADMIN_COMMISSION_RATE_MAX) {
    return String(ADMIN_COMMISSION_RATE_MAX);
  }

  if (numeric < ADMIN_COMMISSION_RATE_MIN) {
    return String(ADMIN_COMMISSION_RATE_MIN);
  }

  return String(Math.trunc(numeric));
}

export function parseAdminCommissionRateInput(raw: string): number | null {
  const sanitized = sanitizeAdminCommissionRateInput(raw);
  if (!sanitized) {
    return null;
  }

  const numeric = Number(sanitized);
  return Number.isFinite(numeric) ? numeric : null;
}
