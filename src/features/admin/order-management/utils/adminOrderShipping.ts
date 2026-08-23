import type { CartLineItem } from '../../../../services/types/cart';
import type { ShipmentDetailsResponse } from '../../../seller/orders/types/sellerOrderShipping';
import {
  findSellerShipmentLine,
  getConsignmentDocument,
  getFreightcomLabelUrl,
  getSellerShipmentContext,
} from '../../../seller/orders/utils/sellerOrderShippingMappers';
import type { AdminPayShipmentPayload } from '../api/adminOrderShippingApi';
import type { AdminOrderDetail } from '../types/adminOrderManagement';

type ExtendedCartLine = CartLineItem & {
  shipmentId?: string;
  consignment?: Array<{
    shipmentId?: string;
    paymentPaid?: boolean;
    tracking_number?: string;
    label?: string;
    extra_label?: string;
  }>;
  NGShipping?: boolean;
};

export function getAdminConsignmentEntry(order: AdminOrderDetail) {
  const line = order.cart?.[0] as ExtendedCartLine | undefined;
  return line?.consignment?.[0];
}

export function canPayAdminShipment(order: AdminOrderDetail): boolean {
  if (order.status === 'Cancelled') {
    return false;
  }

  const consignment = getAdminConsignmentEntry(order);
  const shipmentId = consignment?.shipmentId?.trim();
  return Boolean(shipmentId && consignment?.paymentPaid !== true);
}

export function buildAdminPayShipmentPayload(order: AdminOrderDetail): AdminPayShipmentPayload | null {
  const consignment = getAdminConsignmentEntry(order);
  const shipmentId = consignment?.shipmentId?.trim();
  const orderId = order._id?.trim();

  if (!shipmentId || !orderId || consignment?.paymentPaid === true) {
    return null;
  }

  return { id: shipmentId, orderId };
}

export function patchAdminOrderConsignmentPaymentPaid(order: AdminOrderDetail): AdminOrderDetail {
  return {
    ...order,
    cart: order.cart?.map((line) => {
      const extended = line as ExtendedCartLine;
      if (!Array.isArray(extended.consignment) || extended.consignment.length === 0) {
        return line;
      }

      return {
        ...line,
        consignment: extended.consignment.map((entry, index) =>
          index === 0 ? { ...entry, paymentPaid: true } : entry,
        ),
      };
    }),
  };
}

export function hasAdminConsignmentLabel(line: CartLineItem): boolean {
  return Boolean(getConsignmentDocument(line, 'label'));
}

export function hasAdminConsignmentInvoice(line: CartLineItem): boolean {
  return Boolean(getConsignmentDocument(line, 'invoice'));
}

export function hasAdminFreightcomLabel(details?: ShipmentDetailsResponse | null): boolean {
  return Boolean(getFreightcomLabelUrl(details?.shipment?.labels));
}

export function adminOrderHasShippingOperations(order: AdminOrderDetail): boolean {
  return Boolean(getSellerShipmentContext(order));
}

export function getAdminShippingSummary(order: AdminOrderDetail) {
  const context = getSellerShipmentContext(order);
  const line = findSellerShipmentLine(order);
  const consignment = line ? (line as ExtendedCartLine).consignment?.[0] : undefined;

  return {
    context,
    line,
    consignment,
    canPay: canPayAdminShipment(order),
    hasConsignmentLabel: line ? hasAdminConsignmentLabel(line) : false,
    hasConsignmentInvoice: line ? hasAdminConsignmentInvoice(line) : false,
  };
}
