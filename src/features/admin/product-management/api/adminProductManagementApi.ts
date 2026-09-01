import { apiDelete, apiGet, apiPost, apiPut } from '../../../../services/api/request';
import type { AdminProductApprovalStatus, AdminProductVisibilityStatus } from '../types/adminProductOperations';
import type {
  AdminProductDetail,
  AdminProductListItem,
  AdminProductListQuery,
  AdminProductListResponse,
} from '../types/adminProductManagement';

function buildAdminProductListParams(query: AdminProductListQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    limit: query.limit,
  };

  if (query.search) {
    params.search = query.search;
  }

  if (query.productStatus) {
    params.productStatus = query.productStatus;
  }

  if (query.inventoryStatus) {
    params.status = query.inventoryStatus;
  }

  if (query.stockAlert) {
    params.stockAlert = query.stockAlert;
  }

  return params;
}

/** GET /products — platform-wide admin product list (web parity). */
export async function getAdminProductList(
  query: AdminProductListQuery,
): Promise<AdminProductListResponse> {
  const response = await apiGet<AdminProductListResponse | AdminProductListItem[]>(
    '/products',
    { params: buildAdminProductListParams(query) },
    'Failed to load products',
  );

  if (Array.isArray(response)) {
    return {
      products: response,
      totalProducts: response.length,
      totalPages: 1,
    };
  }

  const products = Array.isArray(response.products) ? response.products : [];

  return {
    products,
    totalProducts: response.totalProducts ?? products.length,
    totalPages: response.totalPages ?? 1,
  };
}

/** GET /products/{productId} — admin product detail. */
export async function getAdminProductById(productId: string): Promise<AdminProductDetail> {
  return apiGet<AdminProductDetail>(
    `/products/${encodeURIComponent(productId)}`,
    undefined,
    'Failed to load product',
  );
}

/** PUT /products/status/{productId} — approval workflow only. */
export async function updateAdminProductApprovalStatus(
  productId: string,
  productStatus: AdminProductApprovalStatus | string,
): Promise<void> {
  await apiPut<void>(
    `/products/status/${encodeURIComponent(productId)}`,
    { productStatus },
    undefined,
    'Failed to update product approval status',
  );
}

/** POST /products/update-status — store visibility (single or bulk). */
export async function updateAdminProductsStoreVisibility(
  productIds: string[],
  status: AdminProductVisibilityStatus,
): Promise<void> {
  await apiPost<void>(
    '/products/update-status',
    { status, ids: productIds },
    undefined,
    'Failed to update product visibility',
  );
}

/** DELETE /products/{productId} */
export async function deleteAdminProduct(productId: string): Promise<void> {
  await apiDelete<void>(
    `/products/${encodeURIComponent(productId)}`,
    undefined,
    'Failed to delete product',
  );
}
