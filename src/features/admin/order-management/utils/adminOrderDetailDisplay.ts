import type { CartLineItem } from '../../../../services/types/cart';
import type { AdminOrderDetail, AdminOrderListItem } from '../types/adminOrderManagement';
import {
  formatSellerLineFulfillmentStatus,
  getSellerOrderCarrierLabel,
} from '../../../seller/orders/utils/sellerOrderMappers';
import {
  findSellerShipmentLine,
  getSellerShipmentContext,
} from '../../../seller/orders/utils/sellerOrderShippingMappers';

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

export function formatAdminPaymentStatus(paymentStatus?: string): string {
  if (paymentStatus === 'PaymentDone') {
    return 'Done';
  }

  if (paymentStatus === 'PaymentPending') {
    return 'Pending';
  }

  return paymentStatus?.trim() || '—';
}

export function formatAdminLineFulfillmentStatus(line: CartLineItem): string {
  const productType = line.productData?.productType;
  if (productType === 'Downloadable') {
    return '—';
  }

  return formatSellerLineFulfillmentStatus(line.productData?.shippingStatus);
}

export interface AdminLabelAvailabilityItem {
  label: string;
  detail?: string;
}

export interface AdminShipmentReadOnlyInfo {
  hasShipmentData: boolean;
  kind: 'freightcom' | 'consignment' | 'ngshipping' | null;
  carrierName?: string;
  trackingNumber?: string;
  freightcomShipmentId?: string;
  consignmentPaymentPaid?: boolean;
  labelAvailability: AdminLabelAvailabilityItem[];
}

function getExtendedLine(line: CartLineItem): ExtendedCartLine {
  return line as ExtendedCartLine;
}

export function getAdminShipmentReadOnlyInfo(
  order: AdminOrderListItem | AdminOrderDetail,
): AdminShipmentReadOnlyInfo {
  const line = findSellerShipmentLine(order as AdminOrderDetail);
  if (!line) {
    return {
      hasShipmentData: false,
      kind: null,
      labelAvailability: [],
    };
  }

  const context = getSellerShipmentContext(order as AdminOrderDetail);
  const extended = getExtendedLine(line);
  const consignment = extended.consignment?.[0];
  const labelAvailability: AdminLabelAvailabilityItem[] = [];

  if (context?.kind === 'freightcom' && context.shipmentId) {
    labelAvailability.push({
      label: 'Freightcom shipping label',
      detail: `Shipment ID ${context.shipmentId}`,
    });
  }

  if (context?.kind === 'consignment') {
    if (consignment?.label) {
      labelAvailability.push({
        label: 'Consignment shipping label',
        detail: consignment.tracking_number
          ? `Tracking ${consignment.tracking_number}`
          : 'Label data on file',
      });
    }

    if (consignment?.extra_label) {
      labelAvailability.push({
        label: 'Consignment invoice',
        detail: consignment.tracking_number
          ? `Tracking ${consignment.tracking_number}`
          : 'Invoice data on file',
      });
    }

    if (labelAvailability.length === 0) {
      labelAvailability.push({
        label: 'Consignment shipment',
        detail: consignment?.tracking_number
          ? `Tracking ${consignment.tracking_number}`
          : 'Consignment data present',
      });
    }
  }

  if (context?.kind === 'ngshipping') {
    labelAvailability.push({
      label: 'NG Shipping label',
      detail: 'Label generation supported for this shipment',
    });
  }

  return {
    hasShipmentData: true,
    kind: context?.kind ?? null,
    carrierName: context?.carrierName ?? getSellerOrderCarrierLabel(order),
    trackingNumber: context?.trackingNumber,
    freightcomShipmentId: extended.shipmentId ?? context?.shipmentId,
    consignmentPaymentPaid: consignment?.paymentPaid,
    labelAvailability,
  };
}

export function formatAdminShipmentPaymentStatus(paymentPaid?: boolean): string | undefined {
  if (paymentPaid === true) {
    return 'Paid';
  }

  if (paymentPaid === false) {
    return 'Unpaid';
  }

  return undefined;
}

export function getAdminCustomerUserId(order: AdminOrderListItem): string | undefined {
  const userId = order.userInfo?.userId;
  if (userId == null || userId === '') {
    return undefined;
  }

  const value = String(userId).trim();
  return value || undefined;
}
