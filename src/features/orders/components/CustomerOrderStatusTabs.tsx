import { ScrollableOrderStatusTabs } from './ScrollableOrderStatusTabs';
import {
  CUSTOMER_ORDER_STATUS_FILTERS,
  type CustomerOrderStatusFilter,
} from '../utils/customerOrderListFilters';

interface CustomerOrderStatusTabsProps {
  activeStatus: CustomerOrderStatusFilter;
  onStatusChange: (status: CustomerOrderStatusFilter) => void;
}

export function CustomerOrderStatusTabs({
  activeStatus,
  onStatusChange,
}: CustomerOrderStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={CUSTOMER_ORDER_STATUS_FILTERS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
