import type { ReferralEarningsPayoutStatusFilter } from '../types/referralEarning';

export const REFERRAL_EARNINGS_PAYOUT_STATUS_FILTER_OPTIONS: Array<{
  value: ReferralEarningsPayoutStatusFilter;
  label: string;
}> = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
];

export const REFERRAL_EARNINGS_PAGE_SIZE = 10;
