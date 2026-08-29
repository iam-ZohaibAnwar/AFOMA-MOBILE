import type { AffiliateCommissionRecord } from '../../../services/types/commission';
import { formatCustomerName, formatOrderDate, formatOrderDisplayId } from '../../orders/utils/orderDisplay';
import type { AppBadgeProps } from '../../../components/ui/AppBadge';

export function formatReferralSummaryAmount(amount?: number | string | null): string {
  if (amount == null || amount === '') {
    return 'CA$0.00';
  }

  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return 'CA$0.00';
  }

  return `CA$${value.toFixed(2)}`;
}

export function formatReferralAmount(amount?: number | string): string {
  if (amount == null || amount === '') {
    return '—';
  }

  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `CA$${value.toFixed(2)}`;
}

export function formatCommissionOrderId(record: AffiliateCommissionRecord): string {
  return formatOrderDisplayId(record.orderId?._id);
}

export function formatReferralEarningDate(record: AffiliateCommissionRecord): string {
  return formatOrderDate(record.createdAt);
}

export function formatCommissionCustomerName(record: AffiliateCommissionRecord): string {
  return formatCustomerName(record.orderId?.userInfo) ?? '—';
}

export function formatPayoutStatus(status?: string): string {
  return status?.trim() || '—';
}

export function payoutStatusBadgeVariant(status?: string): AppBadgeProps['variant'] {
  const normalized = status?.trim().toLowerCase();

  if (normalized === 'paid') {
    return 'success';
  }

  if (normalized === 'pending' || normalized === 'inprocess' || normalized === 'in process') {
    return 'warning';
  }

  return 'neutral';
}
