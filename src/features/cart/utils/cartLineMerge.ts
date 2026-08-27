import type { CartLineItem, CartMap } from '../../../services/types/cart';
import type { Product } from '../../../services/types/product';
import type { UserPricingInfo } from '../../../services/pricing/types';
import {
  applySingleProductPricing,
  getCartUnitPriceCad,
  getProductRouteId,
  isProductDisabled,
  isProductOutOfStock,
} from '../../products/utils/productDisplay';
import {
  buildCustomizableCartKey,
  buildSelectedVariationsForCart,
  findMatchingVariation,
  getVariationMaxQuantity,
  type VariationAttributeSelection,
} from '../../products/utils/productVariations';

export class AddToCartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AddToCartValidationError';
  }
}

export interface AddToCartLineInput {
  product: Product;
  userInfo: UserPricingInfo;
  quantity: number;
  cartKey?: string;
  selectedVariations?: VariationAttributeSelection[];
  maxQuantity?: number | string;
  mergeMode?: 'increment' | 'set';
}

export interface PreparedCartLine {
  cartKey: string;
  line: CartLineItem;
  pricedProduct: Product;
  quantityAdded: number;
  totalQuantity: number;
  unitCad: number;
  wasCartEmptyBeforeAdd: boolean;
}

export function parseMaxQuantity(raw: number | string | undefined, fallback?: number | string): number {
  const value = raw ?? fallback;
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return Number.POSITIVE_INFINITY;
}

export function resolveCartKey(
  product: Product,
  selectedVariations: VariationAttributeSelection[] = [],
  explicitKey?: string,
): string {
  const productRouteId = getProductRouteId(product);
  if (!productRouteId) {
    throw new AddToCartValidationError('Product is missing an id.');
  }

  if (explicitKey?.trim()) {
    return explicitKey.trim();
  }

  if (product.productType === 'Customizable' && selectedVariations.length > 0) {
    return buildCustomizableCartKey(productRouteId, selectedVariations);
  }

  return productRouteId;
}

export function validateAddToCartInput(input: AddToCartLineInput): void {
  const { product, quantity, selectedVariations = [] } = input;

  if (!product) {
    throw new AddToCartValidationError('Product is missing.');
  }

  if (isProductDisabled(product)) {
    throw new AddToCartValidationError('This product is unavailable.');
  }

  if (product.productType === 'Downloadable' && quantity !== 1) {
    throw new AddToCartValidationError('Downloadable products can only be added with quantity 1.');
  }

  if (product.productType === 'Customizable') {
    const selectedAttributes = Object.fromEntries(
      selectedVariations.map((entry) => [entry.attributeName, entry.attributeValue]),
    );

    if (selectedVariations.length === 0) {
      throw new AddToCartValidationError('Select all product options before adding to cart.');
    }

    if (isProductOutOfStock(product, selectedAttributes)) {
      throw new AddToCartValidationError('The selected variation is out of stock.');
    }
  } else if (isProductOutOfStock(product)) {
    throw new AddToCartValidationError('This product is out of stock.');
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new AddToCartValidationError('Quantity must be at least 1.');
  }
}

export function preparePricedProductForCart(
  product: Product,
  userInfo: UserPricingInfo,
): Product {
  return applySingleProductPricing(product, userInfo);
}

export function mergeProductIntoCart(
  cart: CartMap,
  input: AddToCartLineInput,
): { cart: CartMap; prepared: PreparedCartLine } {
  validateAddToCartInput(input);

  const mergeMode = input.mergeMode ?? 'increment';
  const pricedProduct = preparePricedProductForCart(input.product, input.userInfo);
  const selectedVariations = input.selectedVariations ?? [];
  const cartKey = resolveCartKey(pricedProduct, selectedVariations, input.cartKey);
  const maxQuantity = parseMaxQuantity(input.maxQuantity, pricedProduct.quantity);
  const unitCad = getCartUnitPriceCad(pricedProduct, selectedVariations);
  const existingLine = cart[cartKey];
  const existingQuantity = existingLine?.orderQuantiy ?? 0;

  let totalQuantity =
    mergeMode === 'set'
      ? input.quantity
      : existingLine
        ? existingQuantity + input.quantity
        : input.quantity;

  if (totalQuantity > maxQuantity) {
    if (mergeMode === 'increment' && existingLine) {
      totalQuantity = maxQuantity;
    } else {
      throw new AddToCartValidationError(
        `Maximum available quantity is ${Number.isFinite(maxQuantity) ? maxQuantity : 'unlimited'}.`,
      );
    }
  }

  const quantityAdded = Math.max(0, totalQuantity - existingQuantity);
  const wasCartEmptyBeforeAdd = Object.keys(cart).length === 0;

  const line: CartLineItem = {
    ...(existingLine ?? {}),
    orderQuantiy: totalQuantity,
    basePrice: unitCad,
    totalAmount: parseFloat((unitCad * totalQuantity).toFixed(2)),
    maxQuantity: input.maxQuantity ?? pricedProduct.quantity ?? existingLine?.maxQuantity,
    remark: existingLine?.remark ?? '',
    productData: pricedProduct,
    selectedVariations,
    shippingOptions: existingLine?.shippingOptions ?? [],
    shippingService: existingLine?.shippingService,
    shippingRate: existingLine?.shippingRate ?? 0,
  };

  return {
    cart: {
      ...cart,
      [cartKey]: line,
    },
    prepared: {
      cartKey,
      line,
      pricedProduct,
      quantityAdded,
      totalQuantity,
      unitCad,
      wasCartEmptyBeforeAdd,
    },
  };
}

export function buildAddToCartInputFromPdp(params: {
  product: Product;
  userInfo: UserPricingInfo;
  quantity: number;
  selectedAttributes?: Record<string, string>;
  cartKey?: string;
}): AddToCartLineInput {
  const { product, userInfo, quantity, selectedAttributes = {}, cartKey } = params;
  const selectedVariations =
    product.productType === 'Customizable'
      ? buildSelectedVariationsForCart(product.variations, selectedAttributes)
      : [];

  let maxQuantity: number | string | undefined = product.quantity;
  if (product.productType === 'Downloadable') {
    maxQuantity = 1;
  } else if (product.productType === 'Customizable') {
    const matching = findMatchingVariation(product.variations, selectedAttributes);
    maxQuantity = getVariationMaxQuantity(matching) || matching?.quantity;
  }

  return {
    product,
    userInfo,
    quantity: product.productType === 'Downloadable' ? 1 : quantity,
    cartKey,
    selectedVariations,
    maxQuantity,
    mergeMode: 'increment',
  };
}
