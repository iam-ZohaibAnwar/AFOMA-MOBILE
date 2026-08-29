import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { AdminCouponStatusFilter } from '../types/adminCoupons';
import { ADMIN_COUPON_STATUS_TAB_OPTIONS } from '../utils/adminCouponListTabs';

export interface AdminCouponStatusTabsProps {
  activeStatus: AdminCouponStatusFilter;
  onStatusChange: (status: AdminCouponStatusFilter) => void;
}

export function AdminCouponStatusTabs({ activeStatus, onStatusChange }: AdminCouponStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_COUPON_STATUS_TAB_OPTIONS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
