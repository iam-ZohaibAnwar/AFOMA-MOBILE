import type { AdminProductCardAction } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminCommissionDisplayRow } from '../types/adminCommission';
import {
  canInitiateAdminCommissionPayout,
  canUpdateAdminCommissionPayoutStatus,
} from './adminCommissionMutationGuards';

export function buildAdminCommissionCardActions(
  row: AdminCommissionDisplayRow,
  initiatingCommissionId: string | null,
  updatingStatusCommissionId: string | null,
): AdminProductCardAction[] {
  const canInitiate = canInitiateAdminCommissionPayout(row, initiatingCommissionId);
  const canChangeStatus =
    row.payoutStatus !== 'Paid' &&
    canUpdateAdminCommissionPayoutStatus(row, updatingStatusCommissionId);

  return [
    { id: 'view', label: 'View details' },
    {
      id: 'preview',
      label: 'Initiate Korapay payout',
      disabled: !canInitiate,
    },
    {
      id: 'edit',
      label: 'Change payout status',
      disabled: !canChangeStatus,
    },
  ];
}

export function getAdminCommissionMenuTitle(row: AdminCommissionDisplayRow): string {
  return `${row.recipientName} · ${row.orderDisplayId}`;
}
