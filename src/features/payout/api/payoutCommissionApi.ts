import { apiGet } from '../../../services/api/request';
import type { PayoutCommissionDetail } from '../types/payoutCommission';

/**
 * GET /commission/{commissionId}
 *
 * Public get-paid lookup. Web uses x-api-key only; mobile may also send Bearer when logged in.
 */
export async function getPayoutCommissionById(
  commissionId: string,
): Promise<PayoutCommissionDetail> {
  return apiGet<PayoutCommissionDetail>(
    `/commission/${encodeURIComponent(commissionId)}`,
    undefined,
    'Failed to load payout details',
  );
}
