import { useCallback } from 'react';

import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type {
  SellerApprovalStatusFilter,
  SellerInventoryStatusFilter,
  SellerProductListTabId,
} from '../utils/sellerProductListDisplay';
import {
  getSellerProductListTab,
  resolveSellerProductListTabId,
  SELLER_PRODUCT_LIST_TAB_OPTIONS,
} from '../utils/sellerProductListDisplay';

export interface SellerProductFilterTabsProps {
  approvalFilter: SellerApprovalStatusFilter;
  inventoryFilter: SellerInventoryStatusFilter;
  onSelect: (approval: SellerApprovalStatusFilter, inventory: SellerInventoryStatusFilter) => void;
}

export function SellerProductFilterTabs({
  approvalFilter,
  inventoryFilter,
  onSelect,
}: SellerProductFilterTabsProps) {
  const activeTabId = resolveSellerProductListTabId(approvalFilter, inventoryFilter) ?? 'all';

  const handleTabChange = useCallback(
    (tabId: SellerProductListTabId) => {
      const tab = getSellerProductListTab(tabId);
      onSelect(tab.approval, tab.inventory);
    },
    [onSelect],
  );

  return (
    <ScrollableOrderStatusTabs
      tabs={SELLER_PRODUCT_LIST_TAB_OPTIONS}
      activeValue={activeTabId}
      onChange={handleTabChange}
    />
  );
}
