import type { AffiliateCommissionRecord } from '../../../../services/types/commission';
import type { ReferralEarningsSummary } from '../types/referralEarning';

export function sumReferralAmount(records: AffiliateCommissionRecord[]): number {
  return records.reduce((total, record) => {
    const value = Number(record.referralAmount);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

export function buildReferralEarningsSummary(
  pendingRecords: AffiliateCommissionRecord[],
  paidRecords: AffiliateCommissionRecord[],
  pendingCount: number,
  paidCount: number,
): ReferralEarningsSummary {
  return {
    pendingAmount: sumReferralAmount(pendingRecords),
    paidAmount: sumReferralAmount(paidRecords),
    pendingCount,
    paidCount,
  };
}

export const EMPTY_REFERRAL_EARNINGS_SUMMARY: ReferralEarningsSummary = {
  pendingAmount: 0,
  paidAmount: 0,
  pendingCount: 0,
  paidCount: 0,
};
