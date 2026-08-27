import { getCartByUserId } from '../../../services/api/cartApi';
import { loadGuestCart, saveGuestCart } from '../../../services/storage/cartStorage';
import type { UserPricingInfo } from '../../../services/pricing/types';
import type { Product } from '../../../services/types/product';
import type { VariationAttributeSelection } from '../../products/utils/productVariations';
import {
  AddToCartValidationError,
  mergeProductIntoCart,
  type PreparedCartLine,
} from './cartLineMerge';
import { notifyCartChanged } from './cartRefresh';
import { invalidateCartShipping } from './applyShippingToCart';
import { persistCart } from './cartUtils';
import { setCartMemoryCache } from './cartMemoryCache';

const ZERO_SHIPPING_RATES = {
  totalShippingRate: 0,
  fetchedShippingRate: 0,
} as const;

export { AddToCartValidationError } from './cartLineMerge';
export type { PreparedCartLine } from './cartLineMerge';

export interface AddToCartOptions {
  quantity?: number;
  cartKey?: string;
  selectedVariations?: VariationAttributeSelection[];
  maxQuantity?: number | string;
  mergeMode?: 'increment' | 'set';
}

export async function addProductToCart(
  userId: string | undefined,
  product: Product,
  userInfo: UserPricingInfo,
  options: AddToCartOptions = {},
): Promise<PreparedCartLine> {
  let currentCart = {};

  if (userId) {
    const existingCartResponse = await getCartByUserId(userId);
    currentCart = existingCartResponse.cart ?? {};
  } else {
    currentCart = await loadGuestCart();
  }

  const { cart: mergedCart, prepared } = mergeProductIntoCart(currentCart, {
    product,
    userInfo,
    quantity: options.quantity ?? 1,
    cartKey: options.cartKey,
    selectedVariations: options.selectedVariations ?? [],
    maxQuantity: options.maxQuantity,
    mergeMode: options.mergeMode ?? 'increment',
  });

  const nextCart = invalidateCartShipping(mergedCart);

  if (prepared.totalQuantity <= 0) {
    throw new AddToCartValidationError('Unable to add this item to your cart.');
  }

  if (userId) {
    await persistCart(userId, nextCart, ZERO_SHIPPING_RATES);
  } else {
    await saveGuestCart(nextCart);
  }

  setCartMemoryCache(userId, {
    cart: nextCart,
    ...ZERO_SHIPPING_RATES,
  });

  notifyCartChanged();
  return prepared;
}
