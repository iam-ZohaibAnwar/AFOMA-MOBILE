import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { AdminCommissionRecipientRoleFilter } from '../types/adminCommission';
import { ADMIN_COMMISSION_RECIPIENT_ROLE_FILTER_OPTIONS } from '../utils/adminCommissionFilterOptions';

export interface AdminCommissionRoleTabsProps {
  activeRole: AdminCommissionRecipientRoleFilter;
  onRoleChange: (role: AdminCommissionRecipientRoleFilter) => void;
}

export function AdminCommissionRoleTabs({ activeRole, onRoleChange }: AdminCommissionRoleTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_COMMISSION_RECIPIENT_ROLE_FILTER_OPTIONS}
      activeValue={activeRole}
      onChange={onRoleChange}
    />
  );
}
