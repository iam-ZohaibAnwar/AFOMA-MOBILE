import { getCartByUserId } from '../../../services/api/cartApi';
import { loadGuestCart, clearGuestCart } from '../../../services/storage/cartStorage';
import type { UserPricingInfo } from '../../../services/pricing/types';
import type { VariationAttributeSelection } from '../../products/utils/productVariations';
import { mergeProductIntoCart } from './cartLineMerge';
import { notifyCartChanged } from './cartRefresh';
import { persistCart } from './cartUtils';

export async function mergeGuestCartIntoAccount(
  userId: string,
  userInfo: UserPricingInfo,
): Promise<void> {
  const guestCart = await loadGuestCart();
  const guestLineCount = Object.keys(guestCart).length;

  if (guestLineCount === 0) {
    return;
  }

  const serverResponse = await getCartByUserId(userId);
  let mergedCart = serverResponse.cart ?? {};

  for (const line of Object.values(guestCart)) {
    if (!line.productData) {
      continue;
    }

    const result = mergeProductIntoCart(mergedCart, {
      product: line.productData,
      userInfo,
      quantity: line.orderQuantiy ?? 1,
      cartKey: undefined,
        selectedVariations: (line.selectedVariations ?? []) as VariationAttributeSelection[],
      maxQuantity: line.maxQuantity,
      mergeMode: 'increment',
    });

    mergedCart = result.cart;
  }

  await persistCart(userId, mergedCart, serverResponse);
  await clearGuestCart();
  notifyCartChanged();
}
