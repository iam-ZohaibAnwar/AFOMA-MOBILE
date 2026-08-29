import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { SellerCouponStatusFilter } from '../types/sellerCoupon';
import { SELLER_COUPON_STATUS_TAB_OPTIONS } from '../utils/sellerCouponListTabs';

export interface SellerCouponStatusTabsProps {
  activeStatus: SellerCouponStatusFilter;
  onStatusChange: (status: SellerCouponStatusFilter) => void;
}

export function SellerCouponStatusTabs({
  activeStatus,
  onStatusChange,
}: SellerCouponStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={SELLER_COUPON_STATUS_TAB_OPTIONS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
