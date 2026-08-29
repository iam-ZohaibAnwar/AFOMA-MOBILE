import type { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../design-system';
import type { AdminProductStatusChipTone } from '../../../admin/product-management/components/AdminProductStatusChip';
import type { ReferralCommissionRecord } from '../types/referralEarning';
import {
  formatCommissionCustomerName,
  formatCommissionOrderId,
  formatPayoutStatus,
  formatReferralAmount,
  formatReferralEarningDate,
  payoutStatusBadgeVariant,
} from '../../utils/referralEarningsDisplay';

export function resolveReferralEarningAccentColor(record: ReferralCommissionRecord): string {
  const variant = payoutStatusBadgeVariant(record.payoutStatus);
  return variant === 'success' ? colors.textMuted : colors.primary;
}

export function resolveReferralEarningListIcon(): keyof typeof Ionicons.glyphMap {
  return 'people-outline';
}

export function resolveReferralEarningListStatusChips(record: ReferralCommissionRecord) {
  const status = formatPayoutStatus(record.payoutStatus);
  const variant = payoutStatusBadgeVariant(record.payoutStatus);

  return [
    {
      id: 'payout-status',
      label: status,
      icon: (variant === 'success' ? 'checkmark-circle-outline' : 'time-outline') as keyof typeof Ionicons.glyphMap,
      tone: (variant === 'success' ? 'success' : 'warning') as AdminProductStatusChipTone,
    },
  ];
}

export function getReferralEarningListSubtitle(record: ReferralCommissionRecord): string {
  return `Referral commission · ${formatReferralAmount(record.referralAmount)}`;
}

export function getReferralEarningPurchasedDate(record: ReferralCommissionRecord): string {
  return formatReferralEarningDate(record);
}

export function getReferralEarningOrderLabel(record: ReferralCommissionRecord): string {
  return formatCommissionOrderId(record);
}

export function getReferralEarningCustomerName(record: ReferralCommissionRecord): string {
  return formatCommissionCustomerName(record);
}
