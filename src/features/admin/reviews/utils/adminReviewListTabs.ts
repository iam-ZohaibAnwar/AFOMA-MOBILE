import type { AdminReviewListTabId } from '../types/adminReviews';

export const ADMIN_REVIEW_LIST_TAB_OPTIONS: Array<{ label: string; value: AdminReviewListTabId }> = [
  { label: 'Customer reviews', value: 'customer' },
  { label: 'Seller replies', value: 'seller-replies' },
];

export const ADMIN_REVIEW_STATUS_TAB_OPTIONS: Array<{
  label: string;
  value: import('../types/adminReviews').AdminReviewStatusFilter;
}> = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Disapproved', value: 'Disapproved' },
];

export const ADMIN_REVIEW_LIST_PAGE_SIZE = 10;
