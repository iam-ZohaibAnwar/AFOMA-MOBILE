import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { AdminReviewStatusFilter } from '../types/adminReviews';
import { ADMIN_REVIEW_STATUS_TAB_OPTIONS } from '../utils/adminReviewListTabs';

export interface AdminReviewStatusTabsProps {
  activeStatus: AdminReviewStatusFilter;
  onStatusChange: (status: AdminReviewStatusFilter) => void;
}

export function AdminReviewStatusTabs({ activeStatus, onStatusChange }: AdminReviewStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={ADMIN_REVIEW_STATUS_TAB_OPTIONS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
