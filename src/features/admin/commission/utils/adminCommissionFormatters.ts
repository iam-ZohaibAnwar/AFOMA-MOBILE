import type { AppBadgeProps } from '../../../../components/ui/AppBadge';
import { formatCadAmount } from '../../../../utils/currencyFormat';
import { formatOrderDate, formatOrderDisplayId } from '../../../orders/utils/orderDisplay';
import type { AdminCommissionDisplayRow, AdminCommissionDisplayType } from '../types/adminCommission';

export function formatAdminCommissionAmount(amount?: number | null): string {
  return formatCadAmount(amount);
}

export function formatAdminCommissionSummaryAmount(amount?: number | null): string {
  return formatCadAmount(amount, 'CAD 0.00');
}

export function formatAdminCommissionRecipientType(type: AdminCommissionDisplayType): string {
  switch (type) {
    case 'seller':
      return 'Seller';
    case 'affiliate':
      return 'Affiliate';
    case 'referral':
      return 'Referral';
    default:
      return '—';
  }
}

export function adminCommissionRecipientTypeBadgeVariant(
  type: AdminCommissionDisplayType,
): AppBadgeProps['variant'] {
  switch (type) {
    case 'seller':
      return 'primary';
    case 'affiliate':
      return 'warning';
    case 'referral':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function formatAdminCommissionPayoutStatus(status?: string): string {
  const normalized = status?.trim();
  if (!normalized) {
    return '—';
  }

  if (normalized.toLowerCase() === 'inprocess') {
    return 'In Progress';
  }

  return normalized;
}

export function adminCommissionPayoutStatusBadgeVariant(status?: string): AppBadgeProps['variant'] {
  const normalized = status?.trim().toLowerCase();

  if (normalized === 'paid') {
    return 'success';
  }

  if (normalized === 'pending' || normalized === 'inprocess' || normalized === 'in process') {
    return 'warning';
  }

  return 'neutral';
}

/** Read-only payout state label for Phase 2 cards — no mutation affordances. */
export function getAdminCommissionPayoutStateLabel(row: AdminCommissionDisplayRow): string | null {
  if (row.payoutStatus === 'Paid') {
    return null;
  }

  if (row.payoutStatus === 'InProcess' || row.payoutStatus === 'In Process') {
    return 'Payout in progress';
  }

  if (row.isPayout) {
    return 'Payout initiated';
  }

  return null;
}

export function getInitiatePayoutButtonLabel(
  row: AdminCommissionDisplayRow,
  isInitiating: boolean,
): string {
  if (isInitiating) {
    return 'Sending...';
  }

  if (row.payoutStatus === 'Paid') {
    return 'Payout completed';
  }

  if (row.isPayout) {
    return 'Payout initiated';
  }

  return 'Initiate Payout';
}

export function normalizeAdminCommissionStatusMutation(
  status: string,
): 'Pending' | 'Paid' {
  return status === 'Paid' ? 'Paid' : 'Pending';
}

export function formatAdminCommissionPurchasedDate(createdAt?: string): string {
  return formatOrderDate(createdAt);
}

export function formatAdminCommissionOrderDisplayId(orderId?: string): string {
  return formatOrderDisplayId(orderId);
}
