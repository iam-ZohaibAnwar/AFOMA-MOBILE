import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { AdminCouponListTabId } from '../types/adminCoupons';
import { ADMIN_COUPON_LIST_TAB_OPTIONS } from '../utils/adminCouponListTabs';

export interface AdminCouponScopeTabsProps {
  activeTab: AdminCouponListTabId;
  onTabChange: (tab: AdminCouponListTabId) => void;
}

export function AdminCouponScopeTabs({ activeTab, onTabChange }: AdminCouponScopeTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_COUPON_LIST_TAB_OPTIONS}
      activeValue={activeTab}
      onChange={onTabChange}
    />
  );
}
