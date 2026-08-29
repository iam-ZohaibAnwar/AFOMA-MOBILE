import type { AffiliateCommissionRecord } from '../../../../services/types/commission';

export type ReferralEarningsPayoutStatusFilter = '' | 'Pending' | 'Paid';

export type ReferralCommissionRecord = AffiliateCommissionRecord;

export interface ReferralEarningsSummary {
  pendingAmount: number;
  paidAmount: number;
  pendingCount: number;
  paidCount: number;
}
