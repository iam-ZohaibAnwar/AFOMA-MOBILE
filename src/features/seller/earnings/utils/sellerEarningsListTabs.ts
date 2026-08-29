import type { SellerEarningsPayoutStatusFilter } from '../types/sellerEarning';

export const SELLER_EARNINGS_PAYOUT_STATUS_FILTER_OPTIONS: Array<{
  value: SellerEarningsPayoutStatusFilter;
  label: string;
}> = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
];

export const SELLER_EARNINGS_PAGE_SIZE = 10;
