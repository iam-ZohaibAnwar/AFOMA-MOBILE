import { apiGet, apiPost, apiPut } from '../../../../services/api/request';
import type {
  AdminCommissionListQuery,
  AdminCommissionListResponse,
  AdminCommissionPayoutLinkResponse,
  AdminCommissionRecord,
  AdminCommissionStatusMutation,
  AdminCommissionTotalAmountResponse,
  AdminCommissionUpdatePayoutStatusBody,
} from '../types/adminCommission';
import type { AdminCommissionKorapayPayoutPayload } from '../utils/adminCommissionPayoutPayload';

export const ADMIN_COMMISSION_LIST_PAGE_SIZE = 10;

function buildAdminCommissionListParams(
  query: AdminCommissionListQuery,
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    limit: query.limit,
  };

  if (query.search?.trim()) {
    params.search = query.search.trim();
  }

  if (query.payoutStatus) {
    params.payoutStatus = query.payoutStatus;
  }

  if (query.role) {
    params.role = query.role;
  }

  return params;
}

/** GET /commission?page&limit&search&payoutStatus&role — raw commission documents (paginated). */
export async function getAdminCommissionList(
  query: AdminCommissionListQuery,
): Promise<AdminCommissionListResponse> {
  const response = await apiGet<AdminCommissionListResponse | AdminCommissionRecord[]>(
    '/commission',
    { params: buildAdminCommissionListParams(query) },
    'Failed to load commissions',
  );

  if (Array.isArray(response)) {
    return {
      commissions: response,
      totalCommissions: response.length,
      totalPages: 1,
    };
  }

  const commissions = Array.isArray(response.commissions) ? response.commissions : [];

  return {
    commissions,
    totalCommissions: response.totalCommissions ?? commissions.length,
    totalPages: response.totalPages ?? 1,
    currentPage: response.currentPage,
    limit: response.limit,
  };
}

/** GET /commission/total/amount — platform commission summary card (web parity). */
export async function getAdminCommissionTotalAmount(): Promise<AdminCommissionTotalAmountResponse> {
  return apiGet<AdminCommissionTotalAmountResponse>(
    '/commission/total/amount',
    undefined,
    'Failed to load total commission',
  );
}

/** GET /commission/:id — reconcile single commission after initiate (orderId may be sparse). */
export async function getAdminCommissionById(commissionId: string): Promise<AdminCommissionRecord> {
  return apiGet<AdminCommissionRecord>(
    `/commission/${encodeURIComponent(commissionId)}`,
    undefined,
    'Failed to load commission',
  );
}

/** POST /commission/payout-link-kora — send Korapay payout link email (web synthetic row body). */
export async function postAdminCommissionKorapayPayoutLink(
  payload: AdminCommissionKorapayPayoutPayload,
): Promise<AdminCommissionPayoutLinkResponse> {
  return apiPost<AdminCommissionPayoutLinkResponse>(
    '/commission/payout-link-kora',
    payload,
    undefined,
    'Failed to send payout link',
  );
}

/** PUT /commission/updatePayoutStatus/:id — manual payout status toggle. */
export async function putAdminCommissionPayoutStatus(
  commissionId: string,
  newPayoutStatus: AdminCommissionStatusMutation,
): Promise<AdminCommissionRecord> {
  const body: AdminCommissionUpdatePayoutStatusBody = { newPayoutStatus };
  return apiPut<AdminCommissionRecord>(
    `/commission/updatePayoutStatus/${encodeURIComponent(commissionId)}`,
    body,
    undefined,
    'Failed to update payout status',
  );
}
