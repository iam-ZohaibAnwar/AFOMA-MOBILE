import type { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../design-system';
import type { AdminProductStatusChipTone } from '../../product-management/components/AdminProductStatusChip';
import type { AdminCommissionDisplayRow, AdminCommissionDisplayType } from '../types/adminCommission';
import {
  adminCommissionPayoutStatusBadgeVariant,
  formatAdminCommissionPayoutStatus,
  formatAdminCommissionRecipientType,
} from './adminCommissionFormatters';

export function resolveAdminCommissionAccentColor(type: AdminCommissionDisplayType): string {
  switch (type) {
    case 'seller':
      return colors.primary;
    case 'affiliate':
      return colors.warningText;
    case 'referral':
      return colors.textSecondary;
    default:
      return colors.borderStrong;
  }
}

export function resolveAdminCommissionTypeIcon(
  type: AdminCommissionDisplayType,
): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'seller':
      return 'storefront-outline';
    case 'affiliate':
      return 'link-outline';
    case 'referral':
      return 'people-outline';
    default:
      return 'cash-outline';
  }
}

export function resolveAdminCommissionListStatusChips(row: AdminCommissionDisplayRow) {
  const chips: Array<{
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    tone: AdminProductStatusChipTone;
  }> = [
    {
      id: 'type',
      label: formatAdminCommissionRecipientType(row.type),
      icon: resolveAdminCommissionTypeIcon(row.type),
      tone: 'info',
    },
  ];

  const payoutLabel = formatAdminCommissionPayoutStatus(row.payoutStatus);
  const payoutVariant = adminCommissionPayoutStatusBadgeVariant(row.payoutStatus);

  chips.push({
    id: 'payout',
    label: payoutLabel,
    icon:
      payoutVariant === 'success'
        ? 'checkmark-circle-outline'
        : payoutVariant === 'warning'
          ? 'time-outline'
          : 'ellipse-outline',
    tone: payoutVariant === 'success' ? 'success' : payoutVariant === 'warning' ? 'warning' : 'neutral',
  });

  if (row.isPayout && row.payoutStatus !== 'Paid') {
    chips.push({
      id: 'initiated',
      label: 'Link sent',
      icon: 'mail-outline',
      tone: 'neutral',
    });
  }

  return chips;
}

export function getAdminCommissionPrimaryPayoutAmount(row: AdminCommissionDisplayRow): number {
  if (row.type === 'affiliate') {
    return row.affiliateAmount ?? 0;
  }

  if (row.type === 'referral') {
    return row.referralAmount ?? 0;
  }

  return row.payoutAmount ?? 0;
}

export function getAdminCommissionListSubtitle(row: AdminCommissionDisplayRow): string {
  if (row.type === 'seller' && row.productNames !== '—') {
    return row.productNames;
  }

  return row.recipientName;
}
