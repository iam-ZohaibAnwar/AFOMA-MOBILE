import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { AdminCommissionPayoutStatusFilter } from '../types/adminCommission';
import { ADMIN_COMMISSION_PAYOUT_STATUS_FILTER_OPTIONS } from '../utils/adminCommissionFilterOptions';

export interface AdminCommissionPayoutStatusTabsProps {
  activeStatus: AdminCommissionPayoutStatusFilter;
  onStatusChange: (status: AdminCommissionPayoutStatusFilter) => void;
}

export function AdminCommissionPayoutStatusTabs({
  activeStatus,
  onStatusChange,
}: AdminCommissionPayoutStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_COMMISSION_PAYOUT_STATUS_FILTER_OPTIONS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
