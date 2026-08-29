import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { SellerReviewReplyFilter } from '../types/sellerReview';
import { SELLER_REVIEW_REPLY_TAB_OPTIONS } from '../utils/sellerReviewListTabs';

export interface SellerReviewReplyTabsProps {
  activeFilter: SellerReviewReplyFilter;
  onFilterChange: (filter: SellerReviewReplyFilter) => void;
}

export function SellerReviewReplyTabs({ activeFilter, onFilterChange }: SellerReviewReplyTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={SELLER_REVIEW_REPLY_TAB_OPTIONS}
      activeValue={activeFilter}
      onChange={onFilterChange}
    />
  );
}
