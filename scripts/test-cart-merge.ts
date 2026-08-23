/**
 * Step 27.3 cart merge tests — run: npx --yes tsx scripts/test-cart-merge.ts
 */
import { calculateSurcharge } from '../src/services/pricing/pricingUtils';
import type { UserPricingInfo } from '../src/services/pricing/types';
import type { Product } from '../src/services/types/product';
import {
  AddToCartValidationError,
  buildAddToCartInputFromPdp,
  mergeProductIntoCart,
} from '../src/features/cart/utils/cartLineMerge';

const userInfo: UserPricingInfo = {
  country: 'Canada',
  currency: 'CAD',
  currencyRate: 1,
  surCharge: {},
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function priceProduct(product: Product): Product {
  return calculateSurcharge([structuredClone(product)], userInfo)[0]!;
}

const standardProduct = priceProduct({
  _id: 'std-1',
  productName: 'Standard Widget',
  productType: 'Standard',
  price: 20,
  quantity: 5,
  inventory: 'In Stock',
  status: 1,
  seller: { country: 'Canada', shippingConfigId: {} },
});

const oosProduct = priceProduct({
  ...standardProduct,
  _id: 'std-oos',
  inventory: 'OutOffStock',
});

const downloadableProduct = priceProduct({
  _id: 'dl-1',
  productName: 'Digital File',
  productType: 'Downloadable',
  price: 10,
  quantity: 99,
  inventory: 'In Stock',
  status: 1,
});

const customizableProduct = priceProduct({
  _id: 'cust-1',
  productName: 'Custom Earrings',
  productType: 'Customizable',
  price: 30,
  discountCode: 10,
  status: 1,
  variations: [
    { Size: 'Small', inventory: 'In Stock', quantity: 3, price: 30 },
    { Size: 'Medium', inventory: 'In Stock', quantity: 2, price: 35 },
    { Size: 'Large', inventory: 'OutOffStock', quantity: 1, price: 40 },
  ],
});

function testStandardIncrementAndCap() {
  let cart = {};
  const first = mergeProductIntoCart(cart, {
    product: standardProduct,
    userInfo,
    quantity: 1,
    maxQuantity: 5,
  });
  assert(first.prepared.totalQuantity === 1, 'standard first add qty 1');
  cart = first.cart;

  const second = mergeProductIntoCart(cart, {
    product: standardProduct,
    userInfo,
    quantity: 1,
    maxQuantity: 5,
  });
  assert(second.prepared.totalQuantity === 2, 'standard increment to 2');
  cart = second.cart;

  const third = mergeProductIntoCart(cart, {
    product: standardProduct,
    userInfo,
    quantity: 2,
    maxQuantity: 5,
  });
  assert(third.prepared.totalQuantity === 4, 'standard increment 2 more -> 4');
  cart = third.cart;

  let threw = false;
  try {
    mergeProductIntoCart({}, {
      product: standardProduct,
      userInfo,
      quantity: 6,
      maxQuantity: 5,
    });
  } catch (err) {
    threw = err instanceof AddToCartValidationError;
  }
  assert(threw, 'standard new line above max throws');
}

function testStandardOutOfStock() {
  let threw = false;
  try {
    mergeProductIntoCart({}, {
      product: oosProduct,
      userInfo,
      quantity: 1,
      maxQuantity: 5,
    });
  } catch (err) {
    threw = err instanceof AddToCartValidationError;
  }
  assert(threw, 'standard out of stock blocked');
}

function testCustomizableVariantKeys() {
  const smallInput = buildAddToCartInputFromPdp({
    product: customizableProduct,
    userInfo,
    quantity: 1,
    selectedAttributes: { Size: 'Small' },
  });
  const mediumInput = buildAddToCartInputFromPdp({
    product: customizableProduct,
    userInfo,
    quantity: 1,
    selectedAttributes: { Size: 'Medium' },
  });

  assert(smallInput.cartKey === undefined, 'build input leaves cartKey optional');
  const small = mergeProductIntoCart({}, { ...smallInput, userInfo });
  const medium = mergeProductIntoCart(small.cart, { ...mediumInput, userInfo });

  assert(small.prepared.cartKey === 'cust-1_Small', `small key got ${small.prepared.cartKey}`);
  assert(medium.prepared.cartKey === 'cust-1_Medium', `medium key got ${medium.prepared.cartKey}`);
  assert(Object.keys(medium.cart).length === 2, 'two variant lines exist');

  const smallAgain = mergeProductIntoCart(medium.cart, { ...smallInput, userInfo });
  assert(smallAgain.prepared.totalQuantity === 2, 'small variant increments to 2');
  assert(
    smallAgain.prepared.line.selectedVariations?.[0]?.attributeValue === 'Small',
    'selectedVariations preserved',
  );
}

function testCustomizableVariationLimit() {
  const mediumInput = buildAddToCartInputFromPdp({
    product: customizableProduct,
    userInfo,
    quantity: 1,
    selectedAttributes: { Size: 'Medium' },
  });
  let cart = mergeProductIntoCart({}, { ...mediumInput, userInfo }).cart;
  cart = mergeProductIntoCart(cart, { ...mediumInput, userInfo }).cart;
  const capped = mergeProductIntoCart(cart, { ...mediumInput, userInfo });
  assert(capped.prepared.totalQuantity === 2, 'customizable medium capped at quantity 2');
  assert(capped.prepared.quantityAdded === 0, 'customizable medium third add adds 0');
}

function testCustomizableOutOfStockVariation() {
  let threw = false;
  try {
    mergeProductIntoCart(
      {},
      buildAddToCartInputFromPdp({
        product: customizableProduct,
        userInfo,
        quantity: 1,
        selectedAttributes: { Size: 'Large' },
      }),
    );
  } catch (err) {
    threw = err instanceof AddToCartValidationError;
  }
  assert(threw, 'customizable OOS variation blocked');
}

function testDownloadableQuantityOne() {
  const input = buildAddToCartInputFromPdp({
    product: downloadableProduct,
    userInfo,
    quantity: 1,
  });
  assert(input.quantity === 1, 'downloadable forces qty 1');

  let cart = mergeProductIntoCart({}, { ...input, userInfo }).cart;
  const again = mergeProductIntoCart(cart, { ...input, userInfo });
  assert(again.prepared.totalQuantity === 1, 'downloadable stays at 1 after second add');
  assert(again.prepared.quantityAdded === 0, 'downloadable second add adds 0');

  let threw = false;
  try {
    buildAddToCartInputFromPdp({
      product: downloadableProduct,
      userInfo,
      quantity: 2,
    });
  } catch {
    threw = true;
  }
  assert(!threw, 'build input coerces downloadable qty to 1');
}

function testRepriceBeforePersistFields() {
  const result = mergeProductIntoCart({}, {
    product: standardProduct,
    userInfo,
    quantity: 2,
    maxQuantity: 5,
  });

  assert(result.prepared.unitCad > 0, 'unitCad computed');
  assert(result.prepared.line.basePrice === result.prepared.unitCad, 'basePrice uses CAD unit');
  assert(
    result.prepared.line.totalAmount === parseFloat((result.prepared.unitCad * 2).toFixed(2)),
    'totalAmount = unitCad * qty',
  );
  assert(result.prepared.line.productData?.finalPrice !== undefined, 'productData repriced');
}

function run() {
  const tests = [
    ['Standard increment and max cap', testStandardIncrementAndCap],
    ['Standard out of stock', testStandardOutOfStock],
    ['Customizable variant cart keys', testCustomizableVariantKeys],
    ['Customizable variation quantity cap', testCustomizableVariationLimit],
    ['Customizable OOS variation', testCustomizableOutOfStockVariation],
    ['Downloadable quantity locked to 1', testDownloadableQuantityOne],
    ['Re-price payload fields', testRepriceBeforePersistFields],
  ] as const;

  for (const [name, fn] of tests) {
    fn();
    console.log(`PASS: ${name}`);
  }

  console.log(`\nAll ${tests.length} cart merge tests passed.`);
}

run();
