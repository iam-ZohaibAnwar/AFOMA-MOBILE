import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { SellerReviewStatusFilter } from '../types/sellerReview';
import { SELLER_REVIEW_STATUS_TAB_OPTIONS } from '../utils/sellerReviewListTabs';

export interface SellerReviewStatusTabsProps {
  activeStatus: SellerReviewStatusFilter;
  onStatusChange: (status: SellerReviewStatusFilter) => void;
}

export function SellerReviewStatusTabs({ activeStatus, onStatusChange }: SellerReviewStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={SELLER_REVIEW_STATUS_TAB_OPTIONS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
