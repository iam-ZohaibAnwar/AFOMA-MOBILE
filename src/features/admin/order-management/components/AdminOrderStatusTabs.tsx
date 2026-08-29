import type { AdminOrderStatusFilter } from '../types/adminOrderManagement';
import { ADMIN_ORDER_STATUS_FILTERS } from '../utils/adminOrderDisplay';
import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';

interface AdminOrderStatusTabsProps {
  activeStatus: AdminOrderStatusFilter;
  onStatusChange: (status: AdminOrderStatusFilter) => void;
}

export function AdminOrderStatusTabs({ activeStatus, onStatusChange }: AdminOrderStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_ORDER_STATUS_FILTERS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
