import type { CartLineItem, CartMap } from '../../../services/types/cart';
import type {
  CaptureCheckoutOrderRequest,
  CreateCheckoutOrderRequest,
} from '../../../services/types/order';
import type { AuthUser } from '../../auth/types';
import type { CheckoutShippingOption } from '../hooks/useCheckoutShippingRates';
import type { ShippingAddress } from '../types/shippingAddress';
import { buildShippingUserInfo } from './buildShippingUserInfo';

export interface CheckoutOrderTotals {
  subTotal: number;
  shippingTotal: number;
  grandTotal: number;
}

function buildCheckoutUserInfo(user: AuthUser, address: ShippingAddress): Record<string, unknown> {
  const shippingUserInfo = buildShippingUserInfo(address, user);

  return {
    ...user,
    ...shippingUserInfo,
    userId: user.userId,
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

export function buildCheckoutOrderPayload(params: {
  user: AuthUser;
  cart: CartMap;
  shippingAddress: ShippingAddress;
  selectedOptions: CheckoutShippingOption[];
  totals: CheckoutOrderTotals;
}): CreateCheckoutOrderRequest {
  const { user, cart, shippingAddress, selectedOptions, totals } = params;

  return {
    cart: buildCheckoutCartLines(cart, selectedOptions),
    subTotal: totals.subTotal,
    totalShippingRate: totals.shippingTotal,
    userInfo: buildCheckoutUserInfo(user, shippingAddress),
    currency: 'CAD',
    conversionRate: 1,
    coupon: '',
  };
}

export type CheckoutOrderParams = Parameters<typeof buildCheckoutOrderPayload>[0];

export function buildCaptureCheckoutOrderPayload(
  paypalOrderId: string,
  params: CheckoutOrderParams,
): CaptureCheckoutOrderRequest {
  return {
    ...buildCheckoutOrderPayload(params),
    orderId: paypalOrderId,
    paymentMethod: 'paypal',
  };
}
