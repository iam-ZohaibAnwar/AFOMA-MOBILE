import type { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../../design-system';
import type { AdminProductStatusChipTone } from '../../../admin/product-management/components/AdminProductStatusChip';
import type { SellerCommissionRecord } from '../types/sellerEarning';
import {
  formatPayoutStatus,
  formatSellerEarningCustomerName,
  formatSellerEarningDate,
  formatSellerEarningOrderId,
  getSellerEarningLineItems,
  payoutStatusBadgeVariant,
} from './sellerEarningsDisplay';

export function resolveSellerEarningAccentColor(record: SellerCommissionRecord): string {
  const variant = payoutStatusBadgeVariant(record.payoutStatus);
  return variant === 'success' ? colors.textMuted : colors.primary;
}

export function resolveSellerEarningListIcon(): keyof typeof Ionicons.glyphMap {
  return 'storefront-outline';
}

export function resolveSellerEarningListStatusChips(record: SellerCommissionRecord) {
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

export function getSellerEarningListSubtitle(record: SellerCommissionRecord): string {
  const lineItems = getSellerEarningLineItems(record);
  if (!lineItems.length) {
    return 'No product details';
  }

  const names = lineItems.map((item) => item.productName).filter((name) => name && name !== '—');
  if (!names.length) {
    return 'No product details';
  }

  return names.slice(0, 2).join(' · ') + (names.length > 2 ? ` +${names.length - 2} more` : '');
}

export function getSellerEarningMenuTitle(record: SellerCommissionRecord): string {
  return `Order #${formatSellerEarningOrderId(record)}`;
}

export function getSellerEarningDetailTitle(record: SellerCommissionRecord): string {
  return formatSellerEarningCustomerName(record);
}

export function getSellerEarningPurchasedDate(record: SellerCommissionRecord): string {
  return formatSellerEarningDate(record);
}
