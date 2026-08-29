import type { SellerOrderDetail } from '../types/sellerOrder';
import {
  getConsignmentDocument,
  getSellerShipmentContext,
  hasSellerShipmentOperations,
} from './sellerOrderShippingMappers';

export function sellerOrderHasShippingOperations(order?: SellerOrderDetail | null): boolean {
  return hasSellerShipmentOperations(order);
}

export function getSellerShippingActionFlags(order: SellerOrderDetail) {
  const shipmentContext = getSellerShipmentContext(order);

  return {
    shipmentContext,
    canDownloadLabel: Boolean(
      shipmentContext &&
        (shipmentContext.kind === 'freightcom' ||
          (shipmentContext.kind === 'consignment' &&
            getConsignmentDocument(shipmentContext.line, 'label')) ||
          shipmentContext.kind === 'ngshipping'),
    ),
    canPrintPackingSlip: Boolean(
      shipmentContext?.kind === 'consignment' &&
        getConsignmentDocument(shipmentContext.line, 'invoice'),
    ),
    canSchedulePickup: Boolean(shipmentContext?.supportsPickup),
  };
}
