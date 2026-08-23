import { apiGet, apiPost } from '../../../../services/api/request';
import type { SaveSellerShippingConfigRequest, SellerShippingConfig } from '../types/sellerShipping';

/** GET /seller/shipping-config/{sellerId} */
export async function getSellerShippingConfig(sellerId: string): Promise<SellerShippingConfig> {
  return apiGet<SellerShippingConfig>(
    `/seller/shipping-config/${encodeURIComponent(sellerId)}`,
    undefined,
    'Failed to load shipping configuration',
  );
}

/** POST /seller/shipping-config/create */
export async function saveSellerShippingConfig(
  body: SaveSellerShippingConfigRequest,
): Promise<SellerShippingConfig> {
  return apiPost<SellerShippingConfig>(
    '/seller/shipping-config/create',
    body,
    undefined,
    'Failed to save shipping configuration',
  );
}
