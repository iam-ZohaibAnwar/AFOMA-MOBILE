import type {
  AffiliateCommissionsQuery,
  AffiliateCommissionsResponse,
} from '../types/commission';
import { apiGet } from './request';

/**
 * GET /commission/affiliate/{id}
 *
 * Shared by affiliate portal and customer referral earnings (web parity).
 * `{id}` is the authenticated user's MongoDB user id (`_id` / `userId`).
 */
export async function getAffiliateCommissions(
  userId: string,
  query?: AffiliateCommissionsQuery,
): Promise<AffiliateCommissionsResponse> {
  const params: Record<string, string> = {};

  if (query?.page != null) {
    params.page = String(query.page);
  }
  if (query?.limit != null) {
    params.limit = String(query.limit);
  }
  if (query?.payoutStatus?.trim()) {
    params.payoutStatus = query.payoutStatus.trim();
  }

  return apiGet<AffiliateCommissionsResponse>(
    `/commission/affiliate/${userId}`,
    Object.keys(params).length > 0 ? { params } : undefined,
    'Failed to load referral earnings',
  );
}
