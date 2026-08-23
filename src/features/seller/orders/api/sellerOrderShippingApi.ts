import { apiGet, apiPost, apiRequest } from '../../../../services/api/request';
import type { SellerOrderDetail } from '../types/sellerOrder';
import type {
  CreatePickupSchedulePayload,
  CreatePickupScheduleResponse,
  GenerateShippingLabelPayload,
  ShipmentDetailsResponse,
} from '../types/sellerOrderShipping';

/** GET /shipping/shipment-details/{shipmentId} */
export async function getShipmentDetails(shipmentId: string): Promise<ShipmentDetailsResponse> {
  return apiGet<ShipmentDetailsResponse>(
    `/shipping/shipment-details/${encodeURIComponent(shipmentId)}`,
    undefined,
    'Failed to load shipment details',
  );
}

/** POST /shipping/create-schedule */
export async function createPickupSchedule(
  payload: CreatePickupSchedulePayload,
): Promise<CreatePickupScheduleResponse> {
  return apiPost<CreatePickupScheduleResponse>(
    '/shipping/create-schedule',
    payload,
    undefined,
    'Failed to schedule pickup',
  );
}

/** POST /shipping/generate-label — returns HTML label markup for NGShipping. */
export async function generateShippingLabel(
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

export type { CreatePickupSchedulePayload, GenerateShippingLabelPayload };

/** Convenience builder used by the pickup sheet hook. */
export function buildPickupSchedulePayload(params: {
  order: SellerOrderDetail;
  shipmentId?: string;
  pickupDetails: CreatePickupSchedulePayload['pickup_details'];
}): CreatePickupSchedulePayload {
  return {
    shipment_data: {
      ...(params.shipmentId ? { shipment_id: params.shipmentId } : {}),
      shipment: params.order,
    },
    pickup_details: params.pickupDetails,
  };
}
