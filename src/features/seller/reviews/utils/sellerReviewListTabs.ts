import type { SellerReviewReplyFilter, SellerReviewStatusFilter } from '../types/sellerReview';

export const SELLER_REVIEW_STATUS_TAB_OPTIONS: Array<{
  label: string;
  value: SellerReviewStatusFilter;
}> = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Disapproved', value: 'Disapproved' },
];

export const SELLER_REVIEW_REPLY_TAB_OPTIONS: Array<{
  label: string;
  value: SellerReviewReplyFilter;
}> = [
  { label: 'All reviews', value: '' },
  { label: 'Needs reply', value: 'needs-reply' },
  { label: 'Replied', value: 'replied' },
];

export const SELLER_REVIEW_PAGE_SIZE = 10;
