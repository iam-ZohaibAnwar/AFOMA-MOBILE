import { useCallback } from 'react';

import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { AdminUserRoleFilter } from '../types/adminUserManagement';
import { ADMIN_USER_LIST_TAB_OPTIONS, type AdminUserListTabId } from '../utils/adminUserDisplay';

export interface AdminUserFilterTabsProps {
  roleFilter: AdminUserRoleFilter;
  onSelect: (role: AdminUserRoleFilter) => void;
}

export function AdminUserFilterTabs({ roleFilter, onSelect }: AdminUserFilterTabsProps) {
  const handleTabChange = useCallback(
    (tabId: AdminUserListTabId) => {
      onSelect(tabId);
    },
    [onSelect],
  );

  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_USER_LIST_TAB_OPTIONS}
      activeValue={roleFilter}
      onChange={handleTabChange}
    />
  );
}
