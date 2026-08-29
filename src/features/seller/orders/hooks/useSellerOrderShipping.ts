import { useCallback, useMemo, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  buildPickupSchedulePayload,
  createPickupSchedule,
  generateShippingLabel,
  getShipmentDetails,
} from '../api/sellerOrderShippingApi';
import type { SellerOrderDetail } from '../types/sellerOrder';
import type {
  SellerPickupFormValues,
  SellerShippingDocumentKind,
  SellerShipmentContext,
} from '../types/sellerOrderShipping';
import {
  openBase64Pdf,
  openHtmlShippingLabel,
  openRemotePdfUrl,
} from '../utils/sellerOrderShippingDocuments';
import {
  emptyPickupFormValues,
  getConsignmentDocument,
  getFreightcomLabelUrl,
  getSellerOrderLineItems,
  getSellerShipmentContext,
  validatePickupForm,
  pickupFormToDetails,
} from '../utils/sellerOrderShippingMappers';
import { getSellerShippingActionFlags } from '../utils/sellerOrderShippingActions';

export function useSellerOrderShipping(
  order: SellerOrderDetail | null,
  onRefresh: () => Promise<void>,
) {
  const [isOpeningLabel, setIsOpeningLabel] = useState(false);
  const [isOpeningInvoice, setIsOpeningInvoice] = useState(false);
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);
  const [isSchedulingPickup, setIsSchedulingPickup] = useState(false);
  const [pickupSheetVisible, setPickupSheetVisible] = useState(false);
  const [pickupForm, setPickupForm] = useState<SellerPickupFormValues>(() =>
    emptyPickupFormValues(order),
  );
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [pickupSuccessMessage, setPickupSuccessMessage] = useState<string | null>(null);

  const shipmentContext = useMemo(
    () => (order ? getSellerShipmentContext(order) : null),
    [order],
  );

  const actionFlags = useMemo(
    () => (order ? getSellerShippingActionFlags(order) : null),
    [order],
  );

  const openPickupSheet = useCallback(() => {
    setPickupForm(emptyPickupFormValues(order));
    setPickupError(null);
    setPickupSuccessMessage(null);
    setPickupSheetVisible(true);
  }, [order]);

  const closePickupSheet = useCallback(() => {
    if (isSchedulingPickup) {
      return;
    }

    setPickupSheetVisible(false);
  }, [isSchedulingPickup]);

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
        if (shipmentContext.kind === 'freightcom') {
          const shipmentId = shipmentContext.shipmentId;
          if (!shipmentId) {
            throw new Error('Shipment ID unavailable.');
          }

          const response = await getShipmentDetails(shipmentId);
          const labelUrl = getFreightcomLabelUrl(response.shipment?.labels);
          if (!labelUrl) {
            throw new Error('Shipping label is not available yet.');
          }

          await openRemotePdfUrl(labelUrl);
          return true;
        }

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

        if (shipmentContext.kind === 'ngshipping') {
          setIsGeneratingLabel(true);
          const html = await generateShippingLabel({
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
    [order, shipmentContext],
  );

  const schedulePickup = useCallback(async () => {
    if (!order || !shipmentContext?.supportsPickup) {
      return false;
    }

    const validationError = validatePickupForm(pickupForm);
    if (validationError) {
      setPickupError(validationError);
      return false;
    }

    const pickupDetails = pickupFormToDetails(pickupForm);
    if (!pickupDetails) {
      setPickupError('Enter valid pickup details.');
      return false;
    }

    setIsSchedulingPickup(true);
    setPickupError(null);
    setPickupSuccessMessage(null);

    try {
      const payload = buildPickupSchedulePayload({
        order,
        shipmentId:
          shipmentContext.kind === 'freightcom' ? shipmentContext.shipmentId : undefined,
        pickupDetails,
      });

      const response = await createPickupSchedule(payload);
      setPickupSuccessMessage(response.message?.trim() || 'Pickup scheduled.');
      setPickupSheetVisible(false);
      await onRefresh();
      return true;
    } catch (err) {
      setPickupError(getErrorMessage(err, 'Failed to schedule pickup'));
      return false;
    } finally {
      setIsSchedulingPickup(false);
    }
  }, [onRefresh, order, pickupForm, shipmentContext]);

  const clearShippingError = useCallback(() => setShippingError(null), []);
  const clearPickupError = useCallback(() => setPickupError(null), []);

  return {
    shipmentContext: shipmentContext as SellerShipmentContext | null,
    canDownloadLabel: actionFlags?.canDownloadLabel ?? false,
    canPrintPackingSlip: actionFlags?.canPrintPackingSlip ?? false,
    canSchedulePickup: actionFlags?.canSchedulePickup ?? false,
    isOpeningLabel,
    isOpeningInvoice,
    isGeneratingLabel,
    isSchedulingPickup,
    pickupSheetVisible,
    pickupForm,
    setPickupForm,
    shippingError,
    pickupError,
    pickupSuccessMessage,
    openPickupSheet,
    closePickupSheet,
    openShippingDocument,
    schedulePickup,
    clearShippingError,
    clearPickupError,
  };
}
