import { useCallback } from 'react';

import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type {
  AdminProductApprovalFilter,
  AdminProductInventoryFilter,
} from '../types/adminProductManagement';
import type { AdminProductListTabId } from '../utils/adminProductDisplay';
import {
  ADMIN_PRODUCT_LIST_TAB_OPTIONS,
  getAdminProductListTab,
  resolveAdminProductListTabId,
} from '../utils/adminProductDisplay';

export interface AdminProductFilterTabsProps {
  approvalFilter: AdminProductApprovalFilter;
  inventoryFilter: AdminProductInventoryFilter;
  onSelect: (approval: AdminProductApprovalFilter, inventory: AdminProductInventoryFilter) => void;
}

export function AdminProductFilterTabs({
  approvalFilter,
  inventoryFilter,
  onSelect,
}: AdminProductFilterTabsProps) {
  const activeTabId = resolveAdminProductListTabId(approvalFilter, inventoryFilter) ?? 'all';

  const handleTabChange = useCallback(
    (tabId: AdminProductListTabId) => {
      const tab = getAdminProductListTab(tabId);
      onSelect(tab.approval, tab.inventory);
    },
    [onSelect],
  );

  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_PRODUCT_LIST_TAB_OPTIONS}
      activeValue={activeTabId}
      onChange={handleTabChange}
    />
  );
}
