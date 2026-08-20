import { getCartByUserId } from '../../../services/api/cartApi';
import type { CartLineItem, CartMap } from '../../../services/types/cart';
import type { Product } from '../../../services/types/product';
import { getProductPrice, getProductRouteId } from '../../products/utils/productDisplay';
import { persistCart } from './cartUtils';

function buildCartLine(product: Product, quantity: number): CartLineItem {
  const unitPrice = getProductPrice(product) ?? 0;

  return {
    orderQuantiy: quantity,
    basePrice: unitPrice,
    totalAmount: unitPrice * quantity,
    maxQuantity: typeof product.quantity === 'number' ? product.quantity : undefined,
    remark: '',
    productData: product,
    selectedVariations: [],
    shippingOptions: [],
    shippingService: '',
    shippingRate: 0,
  };
}

function mergeProductIntoCart(cart: CartMap, product: Product): CartMap {
  const cartKey = getProductRouteId(product);
  if (!cartKey) {
    throw new Error('Product is missing an id.');
  }

  const unitPrice = getProductPrice(product) ?? 0;
  const nextCart: CartMap = { ...cart };
  const existingLine = nextCart[cartKey];
  const nextQuantity = (existingLine?.orderQuantiy ?? 0) + 1;

  nextCart[cartKey] = {
    ...(existingLine ?? buildCartLine(product, nextQuantity)),
    orderQuantiy: nextQuantity,
    productData: product,
    basePrice: unitPrice,
    totalAmount: unitPrice * nextQuantity,
  };

  return nextCart;
}

export async function addProductToCart(userId: string, product: Product): Promise<void> {
  const existingCartResponse = await getCartByUserId(userId);
  const currentCart = existingCartResponse.cart ?? {};
  const nextCart = mergeProductIntoCart(currentCart, product);

  await persistCart(userId, nextCart, existingCartResponse);
}
