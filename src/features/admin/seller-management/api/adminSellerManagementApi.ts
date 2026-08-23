import { apiDelete, apiGet, apiPost, apiPut } from '../../../../services/api/request';
import type { AdminCreateSellerPayload } from '../types/adminCreateSeller';
import type {
  AdminSellerApprovalChoice,
  AdminSellerListItem,
  AdminSellerListQuery,
  AdminSellerListResponse,
} from '../types/adminSellerManagement';

function buildSellerListParams(query: AdminSellerListQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    limit: query.limit,
  };

  if (query.search) {
    params.search = query.search;
  }

  if (query.status) {
    params.status = query.status;
  }

  if (query.shopStatus) {
    params.shopStatus = query.shopStatus;
  }

  return params;
}

/** GET /sellers — admin seller list (web parity). */
export async function getAdminSellerList(query: AdminSellerListQuery): Promise<AdminSellerListResponse> {
  const response = await apiGet<AdminSellerListResponse | AdminSellerListItem[]>(
    '/sellers',
    { params: buildSellerListParams(query) },
    'Failed to load sellers',
  );

  if (Array.isArray(response)) {
    return {
      sellers: response,
      totalSellers: response.length,
      totalPages: 1,
    };
  }

  const sellers = Array.isArray(response.sellers) ? response.sellers : [];

  return {
    sellers,
    totalSellers: response.totalSellers ?? sellers.length,
    totalPages: response.totalPages ?? 1,
  };
}

/** GET /sellers/{sellerId} */
export async function getAdminSellerById(sellerId: string): Promise<AdminSellerListItem> {
  return apiGet<AdminSellerListItem>(
    `/sellers/${encodeURIComponent(sellerId)}`,
    undefined,
    'Failed to load seller',
  );
}

/** PUT /sellers/seller-shop/update-status/{sellerId}?shop_status=0|1 */
export async function updateAdminSellerShopVisibility(
  sellerId: string,
  shopStatus: 0 | 1,
): Promise<void> {
  await apiPut<void>(
    `/sellers/seller-shop/update-status/${encodeURIComponent(sellerId)}`,
    undefined,
    { params: { shop_status: shopStatus } },
    'Failed to update shop visibility',
  );
}

/** DELETE /sellers/{sellerId} */
export async function deleteAdminSeller(sellerId: string): Promise<void> {
  await apiDelete<void>(
    `/sellers/${encodeURIComponent(sellerId)}`,
    undefined,
    'Failed to delete seller',
  );
}

/** POST /sellers — admin create seller (distinct from seller self-service registration). */
export async function createAdminSeller(body: AdminCreateSellerPayload): Promise<AdminSellerListItem> {
  return apiPost<AdminSellerListItem>('/sellers', body, undefined, 'Failed to create seller');
}

export interface AdminSellerBasicInfoUpdatePayload {
  firstName: string;
  lastName: string;
  email: string;
  DOB?: string;
  gender?: string;
  phone?: string;
}

/** PUT /sellers/{sellerId} — basic information only (no approval fields). */
export async function updateAdminSellerBasicInfo(
  sellerId: string,
  body: AdminSellerBasicInfoUpdatePayload,
): Promise<AdminSellerListItem> {
  return updateAdminSellerProfile(sellerId, body);
}

/** PUT /sellers/{sellerId} — admin section updates (no approval fields). */
export async function updateAdminSellerProfile(
  sellerId: string,
  body: Record<string, unknown> | AdminSellerBasicInfoUpdatePayload,
): Promise<AdminSellerListItem> {
  return apiPut<AdminSellerListItem>(
    `/sellers/${encodeURIComponent(sellerId)}`,
    body,
    undefined,
    'Failed to update seller',
  );
}

export interface AdminSellerChangeStatusPayload {
  status: AdminSellerApprovalChoice;
  userRole: 'seller' | 'customer';
}

/** PUT /sellers/change-status/{sellerId} */
export async function changeAdminSellerApprovalStatus(
  sellerId: string,
  body: AdminSellerChangeStatusPayload,
): Promise<void> {
  await apiPut<void>(
    `/sellers/change-status/${encodeURIComponent(sellerId)}`,
    body,
    undefined,
    'Failed to update approval status',
  );
}
