import { useCallback } from 'react';

import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { AdminSellerApprovalFilter, AdminSellerShopFilter } from '../types/adminSellerManagement';
import type { AdminSellerListTabId } from '../utils/adminSellerDisplay';
import {
  ADMIN_SELLER_LIST_TAB_OPTIONS,
  getAdminSellerListTab,
  resolveAdminSellerListTabId,
} from '../utils/adminSellerDisplay';

export interface AdminSellerFilterTabsProps {
  approvalFilter: AdminSellerApprovalFilter;
  shopVisibilityFilter: AdminSellerShopFilter;
  onSelect: (approval: AdminSellerApprovalFilter, shop: AdminSellerShopFilter) => void;
}

export function AdminSellerFilterTabs({
  approvalFilter,
  shopVisibilityFilter,
  onSelect,
}: AdminSellerFilterTabsProps) {
  const activeTabId = resolveAdminSellerListTabId(approvalFilter, shopVisibilityFilter) ?? 'all';

  const handleTabChange = useCallback(
    (tabId: AdminSellerListTabId) => {
      const tab = getAdminSellerListTab(tabId);
      onSelect(tab.approval, tab.shop);
    },
    [onSelect],
  );

  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_SELLER_LIST_TAB_OPTIONS}
      activeValue={activeTabId}
      onChange={handleTabChange}
    />
  );
}
