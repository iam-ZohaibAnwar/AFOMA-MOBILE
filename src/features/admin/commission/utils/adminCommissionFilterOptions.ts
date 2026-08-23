import type {
  AdminCommissionPayoutStatusFilter,
  AdminCommissionRecipientRoleFilter,
} from '../types/adminCommission';

export interface AdminCommissionFilterOption<T extends string> {
  label: string;
  value: T;
}

export const ADMIN_COMMISSION_PAYOUT_STATUS_FILTER_OPTIONS: AdminCommissionFilterOption<AdminCommissionPayoutStatusFilter>[] =
  [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Paid', value: 'Paid' },
  ];

export const ADMIN_COMMISSION_RECIPIENT_ROLE_FILTER_OPTIONS: AdminCommissionFilterOption<AdminCommissionRecipientRoleFilter>[] =
  [
    { label: 'All', value: '' },
    { label: 'Seller', value: 'seller' },
    { label: 'Affiliate', value: 'affiliate' },
    { label: 'Referral', value: 'referral' },
  ];

export function formatAdminCommissionPayoutStatusLabel(
  value: AdminCommissionPayoutStatusFilter,
): string {
  return ADMIN_COMMISSION_PAYOUT_STATUS_FILTER_OPTIONS.find((option) => option.value === value)
    ?.label ?? 'All';
}

export function formatAdminCommissionRecipientRoleLabel(
  value: AdminCommissionRecipientRoleFilter,
): string {
  return ADMIN_COMMISSION_RECIPIENT_ROLE_FILTER_OPTIONS.find((option) => option.value === value)
    ?.label ?? 'All';
}
