/**
 * Simulates cart payloads against live API product shapes (no auth persist).
 * Run: npx --yes tsx scripts/test-cart-api-simulation.ts
 */
import { calculateSurcharge } from '../src/services/pricing/pricingUtils';
import type { UserPricingInfo } from '../src/services/pricing/types';
import {
  buildAddToCartInputFromPdp,
  mergeProductIntoCart,
} from '../src/features/cart/utils/cartLineMerge';

const base = 'https://development.afomamarketplace.com';
const key = 'gCV_WZOz9nIa8QwTyEFvccQmIK94Ufxm';
const userInfo: UserPricingInfo = {
  country: 'Canada',
  currency: 'CAD',
  currencyRate: 1,
  surCharge: {},
};

async function loadProduct(slug: string) {
  const response = await fetch(`${base}/products/slug/${encodeURIComponent(slug)}`, {
    headers: { 'x-api-key': key },
  });
  const product = await response.json();
  return calculateSurcharge([product], userInfo)[0]!;
}

async function main() {
  const standard = await loadProduct('macrame-keychain-(set-of-3)');
  const customizable = await loadProduct(
    'elegant-rose-gold-teardrop-earrings-with-sparkling-crystals-luxury-statement-jewelry',
  );
  const downloadable = await loadProduct(
    'abstract-fluid-art-digital-print-or-bold-splash-wall-art-for-modern-interiors',
  );

  let cart = {};
  const add1 = mergeProductIntoCart(cart, {
    product: standard,
    userInfo,
    quantity: 1,
    maxQuantity: standard.quantity,
  });
  cart = add1.cart;
  const add2 = mergeProductIntoCart(cart, {
    product: standard,
    userInfo,
    quantity: 1,
    maxQuantity: standard.quantity,
  });
  cart = add2.cart;

  const sizeSmall = mergeProductIntoCart(
    cart,
    buildAddToCartInputFromPdp({
      product: customizable,
      userInfo,
      quantity: 1,
      selectedAttributes: { Size: 'Small' },
    }),
  );
  cart = sizeSmall.cart;

  const sizeMedium = mergeProductIntoCart(
    cart,
    buildAddToCartInputFromPdp({
      product: customizable,
      userInfo,
      quantity: 1,
      selectedAttributes: { Size: 'Medium' },
    }),
  );
  cart = sizeMedium.cart;

  const dl1 = mergeProductIntoCart(
    cart,
    buildAddToCartInputFromPdp({ product: downloadable, userInfo, quantity: 1 }),
  );
  const dl2 = mergeProductIntoCart(
    dl1.cart,
    buildAddToCartInputFromPdp({ product: downloadable, userInfo, quantity: 1 }),
  );

  console.log('=== API-shaped simulation ===');
  console.log('Standard qty after 2x add:', add2.prepared.totalQuantity);
  console.log('Standard payload:', {
    cartKey: add2.prepared.cartKey,
    orderQuantiy: add2.prepared.line.orderQuantiy,
    basePrice: add2.prepared.line.basePrice,
    totalAmount: add2.prepared.line.totalAmount,
    maxQuantity: add2.prepared.line.maxQuantity,
  });
  console.log('Customizable cart keys:', Object.keys(cart).filter((id) => id.includes('_')));
  console.log('Small line selectedVariations:', sizeSmall.prepared.line.selectedVariations);
  console.log('Downloadable qty after 2x add:', dl2.prepared.totalQuantity);
  console.log('Cart line count:', Object.keys(dl2.cart).length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
