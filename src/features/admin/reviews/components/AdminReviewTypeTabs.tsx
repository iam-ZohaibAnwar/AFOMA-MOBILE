import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { AdminReviewListTabId } from '../types/adminReviews';
import { ADMIN_REVIEW_LIST_TAB_OPTIONS } from '../utils/adminReviewListTabs';

export interface AdminReviewTypeTabsProps {
  activeTab: AdminReviewListTabId;
  onTabChange: (tab: AdminReviewListTabId) => void;
}

export function AdminReviewTypeTabs({ activeTab, onTabChange }: AdminReviewTypeTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_REVIEW_LIST_TAB_OPTIONS}
      activeValue={activeTab}
      onChange={onTabChange}
    />
  );
}
