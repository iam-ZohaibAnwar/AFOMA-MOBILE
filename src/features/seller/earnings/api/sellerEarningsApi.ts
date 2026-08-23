import { apiGet } from '../../../../services/api/request';
import type {
  SellerCommissionsQuery,
  SellerCommissionsResponse,
} from '../types/sellerEarning';

/**
 * GET /commission/seller/{sellerId}
 *
 * Paginated seller commission ledger. Uses sellerId (not userId).
 */
export async function getSellerCommissionsPage(
  sellerId: string,
  query: SellerCommissionsQuery = {},
): Promise<SellerCommissionsResponse> {
  const params: Record<string, string> = {};

  if (query.page != null) {
    params.page = String(query.page);
  }
  if (query.limit != null) {
    params.limit = String(query.limit);
  }
  if (query.payoutStatus?.trim()) {
    params.payoutStatus = query.payoutStatus.trim();
  }

  return apiGet<SellerCommissionsResponse>(
    `/commission/seller/${encodeURIComponent(sellerId)}`,
    Object.keys(params).length > 0 ? { params } : undefined,
    'Failed to load seller earnings',
  );
}
