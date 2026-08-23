import type { CartLineItem } from '../../../../services/types/cart';
import type { SellerOrderDetail } from '../types/sellerOrder';
import type {
  PickupScheduleDateParts,
  PickupScheduleDetails,
  PickupScheduleTimeParts,
  SellerPickupFormValues,
  SellerShipmentContext,
  SellerShipmentKind,
  ShipmentConsignmentDocument,
} from '../types/sellerOrderShipping';
import { getSellerOrderLineItems } from './sellerOrderMappers';

function getCarrierName(line?: CartLineItem): string | undefined {
  const carrier = (line?.shippingService as { carrier_name?: string } | undefined)?.carrier_name;
  return carrier?.trim() || undefined;
}

function getConsignment(line: CartLineItem): ShipmentConsignmentDocument[] | undefined {
  const consignment = (line as CartLineItem & { consignment?: ShipmentConsignmentDocument[] }).consignment;
  return Array.isArray(consignment) && consignment.length > 0 ? consignment : undefined;
}

function getShipmentId(line: CartLineItem): string | undefined {
  const shipmentId = (line as CartLineItem & { shipmentId?: string }).shipmentId;
  if (typeof shipmentId !== 'string') {
    return undefined;
  }

  const trimmed = shipmentId.trim();
  return trimmed || undefined;
}

function hasNgShipping(line: CartLineItem): boolean {
  return (line as CartLineItem & { NGShipping?: boolean }).NGShipping === true;
}

export function lineHasShipmentData(line: CartLineItem): boolean {
  return Boolean(getShipmentId(line) || getConsignment(line)?.length || hasNgShipping(line));
}

export function findSellerShipmentLine(order: SellerOrderDetail): CartLineItem | undefined {
  return getSellerOrderLineItems(order).find((line) => lineHasShipmentData(line));
}

export function hasSellerShipmentOperations(order?: SellerOrderDetail | null): boolean {
  if (!order) {
    return false;
  }

  return Boolean(findSellerShipmentLine(order));
}

export function carrierUsesIntegratedPickup(carrierName?: string): boolean {
  const normalized = carrierName?.trim();
  return normalized === 'DHL' || normalized === 'Eshipper';
}

function resolveShipmentKind(line: CartLineItem): SellerShipmentKind | null {
  if (getShipmentId(line)) {
    return 'freightcom';
  }

  if (getConsignment(line)?.length) {
    return 'consignment';
  }

  if (hasNgShipping(line)) {
    return 'ngshipping';
  }

  return null;
}

export function getSellerShipmentContext(order: SellerOrderDetail): SellerShipmentContext | null {
  const line = findSellerShipmentLine(order);
  if (!line) {
    return null;
  }

  const kind = resolveShipmentKind(line);
  if (!kind) {
    return null;
  }

  const carrierName = getCarrierName(line);
  const consignment = getConsignment(line);
  const shipmentId = getShipmentId(line);

  return {
    line,
    kind,
    shipmentId,
    carrierName,
    trackingNumber: consignment?.[0]?.tracking_number?.trim() || undefined,
    supportsPickup:
      kind === 'freightcom' ||
      (kind === 'consignment' && carrierUsesIntegratedPickup(carrierName)),
    supportsExtraLabel: kind === 'consignment' && Boolean(consignment?.[0]?.extra_label),
  };
}

export function emptyPickupFormValues(order?: SellerOrderDetail | null): SellerPickupFormValues {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');

  const contactName = [order?.userInfo?.firstName, order?.userInfo?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    pickupDate: `${year}-${month}-${day}`,
    readyFrom: '09:00',
    readyUntil: '17:00',
    pickupLocation: order?.userInfo?.streetAddress?.trim() ?? '',
    contactName,
    contactPhone: '',
  };
}

function parseDateParts(value: string): PickupScheduleDateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function parseTimeParts(value: string): PickupScheduleTimeParts | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

export function validatePickupForm(values: SellerPickupFormValues): string | null {
  if (!parseDateParts(values.pickupDate)) {
    return 'Enter a valid pickup date (YYYY-MM-DD).';
  }

  if (!parseTimeParts(values.readyFrom)) {
    return 'Enter a valid ready-from time (HH:MM).';
  }

  if (!parseTimeParts(values.readyUntil)) {
    return 'Enter a valid ready-until time (HH:MM).';
  }

  if (!values.pickupLocation.trim()) {
    return 'Pickup location is required.';
  }

  if (!values.contactName.trim()) {
    return 'Contact name is required.';
  }

  if (!values.contactPhone.trim()) {
    return 'Contact phone is required.';
  }

  return null;
}

export function pickupFormToDetails(values: SellerPickupFormValues): PickupScheduleDetails | null {
  const date = parseDateParts(values.pickupDate);
  const readyAt = parseTimeParts(values.readyFrom);
  const readyUntil = parseTimeParts(values.readyUntil);

  if (!date || !readyAt || !readyUntil) {
    return null;
  }

  return {
    pre_scheduled_pickup: false,
    date,
    ready_at: readyAt,
    ready_until: readyUntil,
    pickup_location: values.pickupLocation.trim(),
    contact_name: values.contactName.trim(),
    contact_phone_number: {
      number: values.contactPhone.trim(),
    },
  };
}

export function getFreightcomLabelUrl(
  labels: Array<{ url?: string; padded?: boolean }> | undefined,
): string | undefined {
  if (!labels?.length) {
    return undefined;
  }

  const preferred = labels.find((label) => label.padded === true && label.url);
  if (preferred?.url) {
    return preferred.url;
  }

  return labels.find((label) => label.url)?.url;
}

export function getConsignmentDocument(
  line: CartLineItem,
  kind: 'label' | 'invoice',
): string | undefined {
  const consignment = getConsignment(line)?.[0];
  if (!consignment) {
    return undefined;
  }

  if (kind === 'invoice') {
    return consignment.extra_label?.trim() || undefined;
  }

  return consignment.label?.trim() || undefined;
}

export { getSellerOrderLineItems };
