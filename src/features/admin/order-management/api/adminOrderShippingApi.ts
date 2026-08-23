import { apiGet, apiPost, apiRequest } from '../../../../services/api/request';
import type { ShipmentDetailsResponse } from '../../../seller/orders/types/sellerOrderShipping';
import type { GenerateShippingLabelPayload } from '../../../seller/orders/types/sellerOrderShipping';

export interface AdminPayShipmentPayload {
  id: string;
  orderId: string;
}

export interface AdminPayShipmentResponse {
  message?: string;
}

/** POST /orders/payShipment */
export async function payAdminOrderShipment(
  payload: AdminPayShipmentPayload,
): Promise<AdminPayShipmentResponse> {
  return apiPost<AdminPayShipmentResponse>(
    '/orders/payShipment',
    payload,
    undefined,
    'Failed to pay shipment',
  );
}

/** GET /shipping/shipment-details/{shipmentId} */
export async function getAdminShipmentDetails(
  shipmentId: string,
): Promise<ShipmentDetailsResponse> {
  return apiGet<ShipmentDetailsResponse>(
    `/shipping/shipment-details/${encodeURIComponent(shipmentId)}`,
    undefined,
    'Failed to load shipment details',
  );
}

/** POST /shipping/generate-label — returns HTML label markup for NGShipping. */
export async function generateAdminShippingLabel(
  payload: GenerateShippingLabelPayload,
): Promise<string> {
  return apiRequest<string>(
    {
      method: 'POST',
      url: '/shipping/generate-label',
      data: payload,
      responseType: 'text',
      transformResponse: [(data) => data],
    },
    'Failed to generate shipping label',
  );
}
