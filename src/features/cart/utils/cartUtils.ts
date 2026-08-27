import { getCartByUserId, saveCart } from '../../../services/api/cartApi';
import { saveGuestCart } from '../../../services/storage/cartStorage';
import type { UserPricingInfo } from '../../../services/pricing/types';
import type { CartLineItem, CartMap, GetCartResponse } from '../../../services/types/cart';
import {
  findMatchingVariation,
  getVariationMaxQuantity,
  type SelectedAttributes,
  type VariationAttributeSelection,
} from '../../products/utils/productVariations';
import { invalidateCartShipping } from './applyShippingToCart';
import { setCartMemoryCache } from './cartMemoryCache';
import { notifyCartChanged } from './cartRefresh';
import { mergeProductIntoCart, parseMaxQuantity } from './cartLineMerge';

const ZERO_SHIPPING_RATES = {
  totalShippingRate: 0,
  fetchedShippingRate: 0,
} as const;

export function calculateSubTotal(cart: CartMap): number {
  return Object.values(cart).reduce((sum, line) => sum + (line.totalAmount ?? 0), 0);
}

export function getCartEntries(cart: CartMap): Array<{ id: string; line: CartMap[string] }> {
  return Object.entries(cart).map(([id, line]) => ({ id, line }));
}

export function removeCartLine(cart: CartMap, itemId: string): CartMap {
  const nextCart = { ...cart };
  delete nextCart[itemId];
  return nextCart;
}

export function getCartItemCount(cart: CartMap): number {
  return Object.values(cart).reduce((sum, line) => sum + (line.orderQuantiy ?? 0), 0);
}

export function getCartLineAttributes(line: CartLineItem): string | undefined {
  const values = line.selectedVariations
    ?.map((variation) => variation.attributeValue?.trim())
    .filter(Boolean);

  if (values?.length) {
    return values.join(' · ');
  }

  return undefined;
}

export function selectedVariationsToAttributes(
  selectedVariations: CartLineItem['selectedVariations'],
): SelectedAttributes {
  if (!selectedVariations?.length) {
    return {};
  }

  return selectedVariations.reduce<SelectedAttributes>((acc, variation) => {
    const attributeName = variation.attributeName?.trim();
    const attributeValue = variation.attributeValue?.trim();
    if (attributeName && attributeValue) {
      acc[attributeName] = attributeValue;
    }
    return acc;
  }, {});
}

export function replaceCartLineVariations(
  cart: CartMap,
  itemId: string,
  selectedVariations: VariationAttributeSelection[],
  userInfo: UserPricingInfo,
): CartMap {
  const line = cart[itemId];
  if (!line?.productData || line.productData.productType !== 'Customizable') {
    return cart;
  }

  const selectedAttributes = Object.fromEntries(
    selectedVariations.map((entry) => [entry.attributeName, entry.attributeValue]),
  );
  const matchingVariation = findMatchingVariation(line.productData.variations, selectedAttributes);
  const maxQuantity = getVariationMaxQuantity(matchingVariation) || matchingVariation?.quantity;
  const quantity = line.orderQuantiy ?? 1;
  const cartWithoutLine = removeCartLine(cart, itemId);

  const { cart: nextCart } = mergeProductIntoCart(cartWithoutLine, {
    product: line.productData,
    userInfo,
    quantity,
    selectedVariations,
    maxQuantity,
    mergeMode: 'set',
  });

  return nextCart;
}

export function updateCartLineQuantity(
  cart: CartMap,
  itemId: string,
  nextQuantity: number,
): CartMap {
  const line = cart[itemId];
  if (!line) {
    return cart;
  }

  if (line.productData?.productType === 'Downloadable') {
    return cart;
  }

  const maxQuantity = parseMaxQuantity(line.maxQuantity, line.productData?.quantity);
  const quantity = Math.max(1, Math.min(nextQuantity, maxQuantity));
  const unitPrice = line.basePrice ?? 0;

  return {
    ...cart,
    [itemId]: {
      ...line,
      orderQuantiy: quantity,
      totalAmount: parseFloat((unitPrice * quantity).toFixed(2)),
    },
  };
}

export async function persistCart(
  userId: string,
  cart: CartMap,
  existing?: Pick<GetCartResponse, 'totalShippingRate' | 'fetchedShippingRate'>,
): Promise<void> {
  await saveCart({
    user_id: userId,
    cart,
    subTotal: calculateSubTotal(cart),
    totalShippingRate: existing?.totalShippingRate ?? 0,
    fetchedShippingRate: existing?.fetchedShippingRate ?? 0,
  });
}

export async function loadUserCart(userId: string): Promise<GetCartResponse> {
  return getCartByUserId(userId);
}

export function removePurchasedCartLines(cart: CartMap, purchasedItemIds: string[]): CartMap {
  if (purchasedItemIds.length === 0) {
    return {};
  }

  const purchased = new Set(purchasedItemIds);
  const nextCart: CartMap = {};

  for (const [itemId, line] of Object.entries(cart)) {
    if (!purchased.has(itemId)) {
      nextCart[itemId] = line;
    }
  }

  return nextCart;
}

async function persistCartSnapshot(userId: string | undefined, cart: CartMap): Promise<void> {
  if (userId) {
    await persistCart(userId, cart, ZERO_SHIPPING_RATES);
  } else {
    await saveGuestCart(cart);
  }

  setCartMemoryCache(userId, {
    cart,
    ...ZERO_SHIPPING_RATES,
  });
  notifyCartChanged();
}

/** Clears the entire cart locally and remotely (web thank-you parity). */
export async function clearCartForUser(userId?: string): Promise<void> {
  await persistCartSnapshot(userId, {});
}

/** Removes purchased cart lines after checkout and invalidates shipping on any remaining items. */
export async function removePurchasedItemsFromCart(
  userId: string | undefined,
  cart: CartMap,
  purchasedItemIds: string[],
): Promise<CartMap> {
  const nextCart = invalidateCartShipping(removePurchasedCartLines(cart, purchasedItemIds));
  await persistCartSnapshot(userId, nextCart);
  return nextCart;
}
