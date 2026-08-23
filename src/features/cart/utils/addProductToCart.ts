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
import { persistCart } from './cartUtils';

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
  let existingCartResponse;

  if (userId) {
    existingCartResponse = await getCartByUserId(userId);
    currentCart = existingCartResponse.cart ?? {};
  } else {
    currentCart = await loadGuestCart();
  }

  const { cart: nextCart, prepared } = mergeProductIntoCart(currentCart, {
    product,
    userInfo,
    quantity: options.quantity ?? 1,
    cartKey: options.cartKey,
    selectedVariations: options.selectedVariations ?? [],
    maxQuantity: options.maxQuantity,
    mergeMode: options.mergeMode ?? 'increment',
  });

  if (prepared.totalQuantity <= 0) {
    throw new AddToCartValidationError('Unable to add this item to your cart.');
  }

  if (userId) {
    await persistCart(userId, nextCart, existingCartResponse);
  } else {
    await saveGuestCart(nextCart);
  }

  notifyCartChanged();
  return prepared;
}
