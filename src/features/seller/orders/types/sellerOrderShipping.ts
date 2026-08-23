import type { CartLineItem } from '../../../../services/types/cart';
import type { OrderUserInfo } from '../../../../services/types/order';
import type { SellerOrderDetail } from './sellerOrder';

export interface ShipmentConsignmentDocument {
  label?: string;
  extra_label?: string;
  tracking_number?: string;
}

export interface ShipmentLabelAsset {
  url?: string;
  padded?: boolean;
  format?: string;
}

export interface ShipmentDetailsResponse {
  shipment?: {
    labels?: ShipmentLabelAsset[];
  };
  message?: string;
}

export interface PickupScheduleDateParts {
  year: number;
  month: number;
  day: number;
}

export interface PickupScheduleTimeParts {
  hour: number;
  minute: number;
}

export interface PickupScheduleDetails {
  pre_scheduled_pickup: false;
  date: PickupScheduleDateParts;
  ready_at: PickupScheduleTimeParts;
  ready_until: PickupScheduleTimeParts;
  pickup_location: string;
  contact_name: string;
  contact_phone_number: {
    number: string;
  };
}

export interface CreatePickupSchedulePayload {
  shipment_data: {
    shipment_id?: string;
    shipment: SellerOrderDetail;
  };
  pickup_details: PickupScheduleDetails;
}

export interface CreatePickupScheduleResponse {
  message?: string;
}

export interface GenerateShippingLabelPayload {
  order_id: string;
  shipment: CartLineItem[];
  userInfo?: OrderUserInfo;
}

export type SellerShipmentKind = 'freightcom' | 'consignment' | 'ngshipping';

export interface SellerShipmentContext {
  line: CartLineItem;
  kind: SellerShipmentKind;
  shipmentId?: string;
  carrierName?: string;
  trackingNumber?: string;
  supportsPickup: boolean;
  supportsExtraLabel: boolean;
}

export interface SellerPickupFormValues {
  pickupDate: string;
  readyFrom: string;
  readyUntil: string;
  pickupLocation: string;
  contactName: string;
  contactPhone: string;
}

export type SellerShippingDocumentKind = 'label' | 'invoice';
