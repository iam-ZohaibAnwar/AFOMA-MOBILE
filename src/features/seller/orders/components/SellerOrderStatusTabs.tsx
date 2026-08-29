import type { SellerOrderStatusFilter } from '../types/sellerOrder';
import { SELLER_ORDER_STATUS_FILTERS } from '../utils/sellerOrderMappers';
import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';

interface SellerOrderStatusTabsProps {
  activeStatus: SellerOrderStatusFilter;
  onStatusChange: (status: SellerOrderStatusFilter) => void;
}

export function SellerOrderStatusTabs({ activeStatus, onStatusChange }: SellerOrderStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={SELLER_ORDER_STATUS_FILTERS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
