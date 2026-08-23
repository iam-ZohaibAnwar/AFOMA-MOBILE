import { useCallback, useMemo, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  generateAdminShippingLabel,
  getAdminShipmentDetails,
  payAdminOrderShipment,
} from '../api/adminOrderShippingApi';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import { setAdminOrderSessionPatch } from '../state/adminOrderSessionPatch';
import type { SellerShippingDocumentKind } from '../../../seller/orders/types/sellerOrderShipping';
import type { ShipmentDetailsResponse } from '../../../seller/orders/types/sellerOrderShipping';
import {
  getConsignmentDocument,
  getFreightcomLabelUrl,
  getSellerOrderLineItems,
  getSellerShipmentContext,
} from '../../../seller/orders/utils/sellerOrderShippingMappers';
import {
  openBase64Pdf,
  openHtmlShippingLabel,
  openRemotePdfUrl,
} from '../../../seller/orders/utils/sellerOrderShippingDocuments';
import {
  buildAdminPayShipmentPayload,
  hasAdminConsignmentInvoice,
  hasAdminConsignmentLabel,
  hasAdminFreightcomLabel,
  patchAdminOrderConsignmentPaymentPaid,
} from '../utils/adminOrderShipping';
import { toAdminOrderListPatch } from '../utils/adminOrderOperations';

export function useAdminOrderShipping(
  order: AdminOrderDetail | null,
  onOrderUpdated: (order: AdminOrderDetail) => void,
  onRefresh: () => Promise<void>,
) {
  const [isPayingShipment, setIsPayingShipment] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isOpeningLabel, setIsOpeningLabel] = useState(false);
  const [isOpeningInvoice, setIsOpeningInvoice] = useState(false);
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [paySuccessMessage, setPaySuccessMessage] = useState<string | null>(null);
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetailsResponse | null>(null);

  const shipmentContext = useMemo(
    () => (order ? getSellerShipmentContext(order) : null),
    [order],
  );

  const commitOrderUpdate = useCallback(
    (updatedOrder: AdminOrderDetail) => {
      if (!updatedOrder._id) {
        return;
      }

      setAdminOrderSessionPatch(updatedOrder._id, toAdminOrderListPatch(updatedOrder));
      onOrderUpdated(updatedOrder);
    },
    [onOrderUpdated],
  );

  const clearPayError = useCallback(() => setPayError(null), []);
  const clearShippingError = useCallback(() => setShippingError(null), []);

  const loadShipmentDetails = useCallback(async () => {
    if (!shipmentContext?.shipmentId) {
      return null;
    }

    setIsLoadingDetails(true);
    setShippingError(null);

    try {
      const response = await getAdminShipmentDetails(shipmentContext.shipmentId);
      setShipmentDetails(response);
      return response;
    } catch (err) {
      setShippingError(getErrorMessage(err, 'Failed to load shipment details'));
      return null;
    } finally {
      setIsLoadingDetails(false);
    }
  }, [shipmentContext?.shipmentId]);

  const payShipment = useCallback(async () => {
    if (!order) {
      return false;
    }

    const payload = buildAdminPayShipmentPayload(order);
    if (!payload) {
      return false;
    }

    setIsPayingShipment(true);
    setPayError(null);
    setPaySuccessMessage(null);

    try {
      const response = await payAdminOrderShipment(payload);
      const patched = patchAdminOrderConsignmentPaymentPaid(order);
      commitOrderUpdate(patched);
      setPaySuccessMessage(response.message?.trim() || 'Shipment payment completed.');
      await onRefresh();
      return true;
    } catch (err) {
      setPayError(getErrorMessage(err, 'Failed to pay shipment'));
      return false;
    } finally {
      setIsPayingShipment(false);
    }
  }, [commitOrderUpdate, onRefresh, order]);

  const openShippingDocument = useCallback(
    async (documentKind: SellerShippingDocumentKind = 'label') => {
      if (!order || !shipmentContext) {
        return false;
      }

      const setLoading =
        documentKind === 'invoice' ? setIsOpeningInvoice : setIsOpeningLabel;

      setLoading(true);
      setShippingError(null);

      try {
        if (shipmentContext.kind === 'consignment') {
          const base64 = getConsignmentDocument(shipmentContext.line, documentKind);
          if (!base64) {
            throw new Error(
              documentKind === 'invoice'
                ? 'Invoice document is not available.'
                : 'Shipping label is not available.',
            );
          }

          const tracking = shipmentContext.trackingNumber ?? 'label';
          const fileName =
            documentKind === 'invoice'
              ? `invoice-${tracking}.pdf`
              : `label-${tracking}.pdf`;

          await openBase64Pdf(base64, fileName);
          return true;
        }

        if (shipmentContext.kind === 'freightcom') {
          const shipmentId = shipmentContext.shipmentId;
          if (!shipmentId) {
            throw new Error('Shipment ID unavailable.');
          }

          let details = shipmentDetails;
          if (!hasAdminFreightcomLabel(details)) {
            details = await getAdminShipmentDetails(shipmentId);
            setShipmentDetails(details);
          }

          const labelUrl = getFreightcomLabelUrl(details?.shipment?.labels);
          if (!labelUrl) {
            throw new Error('Shipping label is not available yet.');
          }

          await openRemotePdfUrl(labelUrl);
          return true;
        }

        if (shipmentContext.kind === 'ngshipping') {
          setIsGeneratingLabel(true);
          const html = await generateAdminShippingLabel({
            order_id: order._id ?? '',
            shipment: getSellerOrderLineItems(order),
            userInfo: order.userInfo,
          });

          await openHtmlShippingLabel(html, `AFOMAExpress-${order._id ?? 'label'}.pdf`);
          return true;
        }

        throw new Error('Unsupported shipment type.');
      } catch (err) {
        setShippingError(getErrorMessage(err, 'Failed to open shipping document'));
        return false;
      } finally {
        setLoading(false);
        setIsGeneratingLabel(false);
      }
    },
    [order, shipmentContext, shipmentDetails],
  );

  const showFreightcomLabelAction = shipmentContext?.kind === 'freightcom';
  const showConsignmentLabelAction =
    shipmentContext?.kind === 'consignment' && hasAdminConsignmentLabel(shipmentContext.line);
  const showConsignmentInvoiceAction =
    shipmentContext?.kind === 'consignment' && hasAdminConsignmentInvoice(shipmentContext.line);
  const showGenerateLabelAction = shipmentContext?.kind === 'ngshipping';

  return {
    shipmentContext,
    shipmentDetails,
    isPayingShipment,
    isLoadingDetails,
    isOpeningLabel,
    isOpeningInvoice,
    isGeneratingLabel,
    payError,
    shippingError,
    paySuccessMessage,
    showFreightcomLabelAction,
    showConsignmentLabelAction,
    showConsignmentInvoiceAction,
    showGenerateLabelAction,
    clearPayError,
    clearShippingError,
    payShipment,
    loadShipmentDetails,
    openShippingDocument,
  };
}
