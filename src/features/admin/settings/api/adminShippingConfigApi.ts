import { apiDelete, apiGet, apiPost } from '../../../../services/api/request';
import type {
  AdminShippingConfigDocument,
  AdminShippingConfigSavePayload,
} from '../types/adminShippingConfig';

/** GET /shipping-config/all — global tier matrix document. */
export async function getAdminShippingConfig(): Promise<AdminShippingConfigDocument | null> {
  const response = await apiGet<AdminShippingConfigDocument | null>(
    '/shipping-config/all',
    undefined,
    'Failed to load shipping configuration',
  );

  if (!response || !response.tiers) {
    return null;
  }

  return response;
}

/** POST /shipping-config/create — upsert tiers + full N×N matrix. */
export async function saveAdminShippingConfig(
  body: AdminShippingConfigSavePayload,
): Promise<AdminShippingConfigDocument> {
  return apiPost<AdminShippingConfigDocument>(
    '/shipping-config/create',
    body,
    undefined,
    'Failed to save shipping configuration',
  );
}

/** DELETE /shipping-config/{id} — remove config when last tier is deleted. */
export async function deleteAdminShippingConfig(configId: string): Promise<void> {
  await apiDelete(`/shipping-config/${encodeURIComponent(configId)}`, undefined, 'Failed to delete shipping configuration');
}
