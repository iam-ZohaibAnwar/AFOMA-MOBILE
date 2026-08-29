import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { SellerEarningsPayoutStatusFilter } from '../types/sellerEarning';
import { SELLER_EARNINGS_PAYOUT_STATUS_FILTER_OPTIONS } from '../utils/sellerEarningsListTabs';

export interface SellerEarningsPayoutStatusTabsProps {
  activeStatus: SellerEarningsPayoutStatusFilter;
  onStatusChange: (status: SellerEarningsPayoutStatusFilter) => void;
}

export function SellerEarningsPayoutStatusTabs({
  activeStatus,
  onStatusChange,
}: SellerEarningsPayoutStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={SELLER_EARNINGS_PAYOUT_STATUS_FILTER_OPTIONS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
