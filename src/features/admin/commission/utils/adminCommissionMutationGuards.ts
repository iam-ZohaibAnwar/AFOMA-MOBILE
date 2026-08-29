import type { AdminCommissionDisplayRow } from '../types/adminCommission';

export function canInitiateAdminCommissionPayout(
  row: AdminCommissionDisplayRow,
  initiatingCommissionId: string | null,
): boolean {
  if (row.payoutStatus === 'Paid') {
    return false;
  }

  if (row.isPayout) {
    return false;
  }

  if (initiatingCommissionId === row.commissionId) {
    return false;
  }

  return true;
}

export function canUpdateAdminCommissionPayoutStatus(
  row: AdminCommissionDisplayRow,
  updatingStatusCommissionId: string | null,
): boolean {
  if (row.payoutStatus === 'Paid') {
    return false;
  }

  return updatingStatusCommissionId !== row.commissionId;
}
