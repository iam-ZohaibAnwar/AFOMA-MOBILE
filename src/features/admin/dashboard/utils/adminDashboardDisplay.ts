import type { AdminLatestProduct, AdminLatestSeller } from '../types/adminDashboard';
import { formatCadAmount } from '../../../../utils/currencyFormat';

export function formatAdminCount(value: unknown, fallback = '0'): string {
  if (value == null || value === '') {
    return fallback;
  }

  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (Number.isFinite(parsed)) {
    return String(Math.trunc(parsed));
  }

  return String(value);
}

export function formatAdminCurrency(value: unknown, fallback = '—'): string {
  if (value == null || value === '') {
    return fallback;
  }

  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return formatCadAmount(parsed, fallback);
}

export function formatAdminOptionalCount(value: unknown): string {
  if (value == null || value === '' || value === 0 || value === '0') {
    return '0';
  }

  return formatAdminCount(value);
}

export function formatAdminSellerName(seller: AdminLatestSeller): string {
  const parts = [seller.firstName, seller.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '—';
}

export function formatAdminProductPrice(product: AdminLatestProduct): string {
  if (product.productType === 'Customizable') {
    const variation = product.variations?.[0];
    const raw = variation?.finalPrice ?? variation?.price ?? 0;
    const parsed = Number.parseFloat(String(raw));
    return formatCadAmount(parsed);
  }

  const parsed = Number.parseFloat(String(product.finalPrice ?? ''));
  return formatCadAmount(parsed);
}

export function formatAdminSearchKeyword(term: { _id?: string }): string {
  return term._id?.trim() || '—';
}
