import { Platform } from 'react-native';

import type { CartLineItem, CartMap } from '../../../services/types/cart';
import type {
  CaptureCheckoutOrderRequest,
  CreateCheckoutOrderRequest,
} from '../../../services/types/order';
import type { CheckoutIdentity } from '../types/checkoutIdentity';
import type { CheckoutShippingOption } from '../hooks/useCheckoutShippingRates';
import type { ShippingAddress } from '../types/shippingAddress';
import { buildShippingUserInfo } from './buildShippingUserInfo';
import {
  resolvePayPalMobileCancelUrl,
  resolvePayPalMobileReturnUrl,
} from './resolvePayPalMobileReturnUrl';

export interface CheckoutOrderTotals {
  subTotal: number;
  shippingTotal: number;
  grandTotal: number;
}

function buildCheckoutUserInfo(
  identity: CheckoutIdentity,
  address: ShippingAddress,
): Record<string, unknown> {
  const shippingUserInfo = buildShippingUserInfo(address, identity);

  return {
    ...identity,
    ...shippingUserInfo,
    userId: identity.userId ?? identity._id,
    ZipCode: address.zip.trim(),
  };
}

function applySelectedShippingToLine(
  line: CartLineItem,
  selectedOption?: CheckoutShippingOption,
): CartLineItem {
  if (!selectedOption) {
    return line;
  }

  return {
    ...line,
    shippingRate: selectedOption.rate,
    shippingService: {
      value: String(selectedOption.option.service_id),
      label: selectedOption.label,
      carrier_name: selectedOption.option.carrier_name,
    },
    shippingOptions: line.shippingOptions ?? [],
  };
}

/** Mirrors web checkout.jsx: prefer CAD fetchedShippingRate, else totalShippingRate (CAD). */
export function resolveWebParityShippingTotal(
  fetchedShippingRate = 0,
  totalShippingRate = 0,
  fallbackShippingTotal = 0,
): number {
  if (fetchedShippingRate > 0) {
    return fetchedShippingRate;
  }

  if (totalShippingRate > 0) {
    return totalShippingRate;
  }

  return fallbackShippingTotal;
}

function adjustCartLinesForPayPalCurrency(
  cart: CartMap,
  displayCurrency: string | undefined,
  paypalCurrency: string,
  displayRate: number,
  paypalRate: number,
): CartMap {
  if (!displayCurrency || displayCurrency === paypalCurrency || displayRate <= 0) {
    return cart;
  }

  const next: CartMap = {};

  for (const [key, line] of Object.entries(cart)) {
    const shippingRate = line.shippingRate;
    next[key] = {
      ...line,
      shippingRate:
        shippingRate != null
          ? parseFloat(((shippingRate / displayRate) * paypalRate).toFixed(2))
          : shippingRate,
    };
  }

  return next;
}

export function buildCheckoutCartLines(
  cart: CartMap,
  selectedOptions: CheckoutShippingOption[],
): CartLineItem[] {
  const optionsBySeller = new Map(selectedOptions.map((option) => [option.sellerId, option]));

  return Object.values(cart).map((line) => {
    const sellerId = line.productData?.seller?._id;
    const selectedOption = sellerId ? optionsBySeller.get(sellerId) : undefined;
    return applySelectedShippingToLine(line, selectedOption);
  });
}

export function cartHasShippableItems(cart: CartMap): boolean {
  return Object.values(cart).some((line) => line.productData?.productType !== 'Downloadable');
}

function buildMobileCreateOrderFields(): Pick<
  CreateCheckoutOrderRequest,
  'returnUrl' | 'cancelUrl' | 'return_url' | 'cancel_url' | 'client' | 'platform'
> {
  return {
    returnUrl: resolvePayPalMobileReturnUrl(),
    cancelUrl: resolvePayPalMobileCancelUrl(),
    return_url: resolvePayPalMobileReturnUrl(),
    cancel_url: resolvePayPalMobileCancelUrl(),
    client: 'mobile',
    platform: Platform.OS,
  };
}

/** Core checkout payload shared by create + capture (web parity fields only). */
export function buildCheckoutOrderCorePayload(params: {
  identity: CheckoutIdentity;
  cart: CartMap;
  shippingAddress: ShippingAddress;
  selectedOptions: CheckoutShippingOption[];
  totals: CheckoutOrderTotals;
  currency?: string;
  conversionRate?: number;
  couponCode?: string;
  displayCurrency?: string;
  displayConversionRate?: number;
}): Omit<CreateCheckoutOrderRequest, keyof ReturnType<typeof buildMobileCreateOrderFields>> {
  const {
    identity,
    cart,
    shippingAddress,
    selectedOptions,
    totals,
    currency,
    conversionRate,
    couponCode,
    displayCurrency,
    displayConversionRate,
  } = params;

  const normalizedCouponCode = couponCode?.trim() ?? '';
  const paypalCurrency = currency ?? 'CAD';
  const paypalRate = conversionRate ?? 1;
  const pricedCart = adjustCartLinesForPayPalCurrency(
    cart,
    displayCurrency,
    paypalCurrency,
    displayConversionRate ?? 1,
    paypalRate,
  );

  return {
    cart: buildCheckoutCartLines(pricedCart, selectedOptions),
    subTotal: totals.subTotal,
    totalShippingRate: totals.shippingTotal,
    userInfo: buildCheckoutUserInfo(identity, shippingAddress),
    currency: paypalCurrency,
    conversionRate: paypalRate,
    coupon: normalizedCouponCode,
  };
}

export function buildCheckoutOrderPayload(params: {
  identity: CheckoutIdentity;
  cart: CartMap;
  shippingAddress: ShippingAddress;
  selectedOptions: CheckoutShippingOption[];
  totals: CheckoutOrderTotals;
  currency?: string;
  conversionRate?: number;
  couponCode?: string;
  displayCurrency?: string;
  displayConversionRate?: number;
}): CreateCheckoutOrderRequest {
  return {
    ...buildCheckoutOrderCorePayload(params),
    ...buildMobileCreateOrderFields(),
  };
}

export type CheckoutOrderParams = Parameters<typeof buildCheckoutOrderPayload>[0];

export function buildCaptureCheckoutOrderPayload(
  orderId: string,
  params: CheckoutOrderParams,
  paymentMethod: 'paypal' | 'stripe' | 'korapay' = 'paypal',
): CaptureCheckoutOrderRequest {
  return {
    ...buildCheckoutOrderCorePayload(params),
    orderId,
    paymentMethod,
  };
}

export function buildCaptureCheckoutOrderPayloadFromCreate(
  orderId: string,
  createPayload: CreateCheckoutOrderRequest,
  paymentMethod: 'paypal' | 'stripe' | 'korapay' = 'paypal',
): CaptureCheckoutOrderRequest {
  const {
    returnUrl: _returnUrl,
    cancelUrl: _cancelUrl,
    return_url: _return_url,
    cancel_url: _cancel_url,
    client: _client,
    platform: _platform,
    ...corePayload
  } = createPayload as CreateCheckoutOrderRequest & Record<string, unknown>;

  return {
    ...corePayload,
    orderId,
    paymentMethod,
  };
}
