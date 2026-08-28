import {
  calculateSurcharge,
  cloneProductsForPricing,
  compareAtWithDiscountFallback,
} from '../../../services/pricing/pricingUtils';
import type { UserPricingInfo } from '../../../services/pricing/types';
import type { Product, ProductStorePolicy, ProductVariation } from '../../../services/types/product';
import {
  areAllAttributesSelected,
  findMatchingVariation,
  findCartVariation,
  hasAnyInStockVariation,
  isInventoryOutOfStock,
  type SelectedAttributes,
  type VariationAttributeSelection,
} from './productVariations';

export function filterApprovedProducts(products: Product[]): Product[] {
  return products.filter(
    (product) => product.productStatus === 'Approved' && product.status === 1,
  );
}

export function getProductDisplayName(product: Product): string {
  return product.productName?.trim() || 'Product';
}

export function getProductImageUrl(product: Product): string | undefined {
  return getProductImageUrls(product)[0];
}

export function getProductImageUrls(product: Product): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const image of product.images ?? []) {
    const url = image.imageUrl?.trim();
    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    urls.push(url);
  }

  return urls;
}

function parseDiscountCode(product: Product): number | undefined {
  const discount =
    typeof product.discountCode === 'number'
      ? product.discountCode
      : Number(product.discountCode);

  return Number.isFinite(discount) && discount > 0 ? discount : undefined;
}

function getCustomizableVariation(product: Product, selectedAttributes?: SelectedAttributes) {
  if (selectedAttributes && product.variations?.length) {
    return findMatchingVariation(product.variations, selectedAttributes);
  }

  return product.variations?.[0];
}

function getVariationSalePrice(variation: ProductVariation | undefined): number | undefined {
  const price =
    variation?.surTotalAmount ??
    variation?.finalPrice ??
    variation?.price;

  return typeof price === 'number' && Number.isFinite(price) ? price : undefined;
}

function getVariationCompareAtPrice(
  variation: ProductVariation | undefined,
  product: Product,
): number | undefined {
  const discountPercent = parseDiscountCode(product);
  const salePrice = getVariationSalePrice(variation);
  const compareAt =
    variation?.surTotalAmountBDis ??
    variation?.totalPrice ??
    product.totalPrice ??
    product.totalAmount ??
    product.basePrice ??
    product.price;

  return compareAtWithDiscountFallback(salePrice, compareAt, discountPercent);
}

export function getProductPriceForSelection(
  product: Product,
  selectedAttributes?: SelectedAttributes,
): number | undefined {
  if (product.productType === 'Customizable') {
    const variation =
      selectedAttributes &&
      areAllAttributesSelected(product.variations, selectedAttributes)
        ? findMatchingVariation(product.variations, selectedAttributes)
        : product.variations?.[0];

    return getVariationSalePrice(variation);
  }

  return getProductPrice(product);
}

export function getProductCompareAtPriceForSelection(
  product: Product,
  selectedAttributes?: SelectedAttributes,
): number | undefined {
  if (product.productType === 'Customizable') {
    const variation =
      selectedAttributes &&
      areAllAttributesSelected(product.variations, selectedAttributes)
        ? findMatchingVariation(product.variations, selectedAttributes)
        : product.variations?.[0];

    return getVariationCompareAtPrice(variation, product);
  }

  return getProductCompareAtPrice(product);
}

export function getProductPrice(product: Product): number | undefined {
  if (product.productType === 'Customizable') {
    const variation = getCustomizableVariation(product);
    const variationPrice =
      variation?.surTotalAmount ??
      variation?.finalPrice ??
      variation?.price ??
      product.finalPrice ??
      product.price;

    return typeof variationPrice === 'number' && Number.isFinite(variationPrice)
      ? variationPrice
      : undefined;
  }

  const price =
    product.surTotalAmount ??
    product.finalPrice ??
    product.totalAmount ??
    product.price ??
    product.basePrice;

  return typeof price === 'number' && Number.isFinite(price) ? price : undefined;
}

export function getProductCompareAtPrice(product: Product): number | undefined {
  const discountPercent = parseDiscountCode(product);
  const salePrice = getProductPrice(product);

  if (product.productType === 'Customizable') {
    return getVariationCompareAtPrice(getCustomizableVariation(product), product);
  }

  const compareAt =
    product.surTotalAmountBDis ??
    product.totalPrice ??
    product.totalAmount ??
    product.basePrice ??
    product.price;

  return compareAtWithDiscountFallback(salePrice, compareAt, discountPercent);
}

export function getProductDiscountPercent(product: Product): number | undefined {
  return parseDiscountCode(product);
}

export function formatProductPrice(
  price: number | undefined,
  currency = 'CAD',
): string {
  if (price === undefined) {
    return '—';
  }

  return `${currency} ${price.toFixed(2)}`;
}

export function applyProductPricing(
  products: Product[],
  userInfo: UserPricingInfo,
): Product[] {
  return calculateSurcharge(cloneProductsForPricing(products), userInfo);
}

/** Apply geo/user-country pricing to a single product (PDP, cart re-pricing). */
export function applySingleProductPricing(
  product: Product,
  userInfo: UserPricingInfo,
): Product {
  return applyProductPricing([product], userInfo)[0] ?? product;
}

export function getProductRouteId(product: Product): string | undefined {
  return product._id ?? product.slug;
}

export function formatProductDescriptionForDisplay(raw: string | undefined): string {
  if (!raw?.trim()) {
    return '';
  }

  let text = raw
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|h[1-6]|li|tr)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  text = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

export function getProductDescription(product: Product): string {
  const formatted = formatProductDescriptionForDisplay(product.description);
  return formatted || 'No description available.';
}

export function getSellerDisplayName(product: Product): string | undefined {
  const seller = product.seller;
  if (!seller) {
    return undefined;
  }

  if (seller.storeTitle?.trim()) {
    return seller.storeTitle.trim();
  }

  if (seller.storeSlug?.trim()) {
    return seller.storeSlug.trim();
  }

  const fullName = [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim();
  return fullName || undefined;
}

function isPolicyEnabled(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === 'yes' || normalized === '1';
  }

  return false;
}

export function getSellerStorePolicy(product: Product): ProductStorePolicy | undefined {
  return product.seller?.storePolicy;
}

export function hasSellerStorePolicy(policy: ProductStorePolicy | undefined): boolean {
  if (!policy) {
    return false;
  }

  return isPolicyEnabled(policy.cancellationPolicy) || isPolicyEnabled(policy.returnPolicy);
}

export function hasDisplayableStorePolicy(policy: ProductStorePolicy | undefined): boolean {
  if (!policy) {
    return false;
  }

  const hasFaqs = (policy.faqList ?? []).some((faq) => faq.question?.trim());

  return Boolean(
    getCancellationPolicyMessage(policy) || getReturnPolicyMessage(policy) || hasFaqs,
  );
}

export function getCancellationPolicyMessage(policy: ProductStorePolicy): string | null {
  if (!isPolicyEnabled(policy.cancellationPolicy)) {
    return null;
  }

  const hours = policy.cancellationPolicyTime;
  if (hours != null && String(hours).trim()) {
    return `I accept order cancellations within ${hours} hours of purchase. After this timeframe, cancellations may not be possible. Feel free to contact me with any questions.`;
  }

  return 'I accept order cancellations within a limited time after purchase. After this timeframe, cancellations may not be possible. Feel free to contact me with any questions.';
}

export function getReturnPolicyMessage(policy: ProductStorePolicy): string | null {
  if (!isPolicyEnabled(policy.returnPolicy)) {
    return null;
  }

  if (policy.returnPolicyDetails?.trim()) {
    return policy.returnPolicyDetails.trim();
  }

  return getReturnPolicyFallbackMessage();
}

/** Legacy fallback copy for contexts that still need a default when return policy is enabled without details. */
export function getReturnPolicyFallbackMessage(): string {
  return "Returns and exchanges are subject to the seller's discretion. If you have an issue with your order, please contact the seller within 7 days of delivery. Buyers may be responsible for return shipping costs.";
}

export function isProductDisabled(product: Product): boolean {
  return product.status === 0;
}

export function isProductOutOfStock(
  product: Product,
  selectedAttributes?: SelectedAttributes,
): boolean {
  if (product.productType === 'Customizable' && product.variations?.length) {
    if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) {
      return true;
    }

    const inventory = findMatchingVariation(product.variations, selectedAttributes)?.inventory;
    return isInventoryOutOfStock(inventory ?? 'OutOffStock');
  }

  return isInventoryOutOfStock(product.inventory);
}

/** Listing cards have no selected variation — avoid false "Out of stock" badges. */
export function isProductOutOfStockForListing(product: Product): boolean {
  if (product.productType === 'Customizable') {
    if (product.variations?.length) {
      return !hasAnyInStockVariation(product.variations);
    }

    // Home list APIs often omit variations; don't badge from parent inventory alone.
    return false;
  }

  return isInventoryOutOfStock(product.inventory);
}

/** CAD unit price stored on cart lines — mirrors web `getCartUnitPriceCad`. */
export function getCartUnitPriceCad(
  product: Product,
  selectedVariations?: VariationAttributeSelection[],
): number {
  if (product.productType === 'Customizable' && selectedVariations?.length) {
    const variation = findCartVariation(product, selectedVariations);
    if (variation?.finalPrice != null && Number.isFinite(Number(variation.finalPrice))) {
      return parseFloat(Number(variation.finalPrice).toFixed(2));
    }

    if (variation?.price != null && Number.isFinite(Number(variation.price))) {
      return parseFloat(Number(variation.price).toFixed(2));
    }
  }

  if (product.finalPrice != null && Number.isFinite(Number(product.finalPrice))) {
    return parseFloat(Number(product.finalPrice).toFixed(2));
  }

  return parseFloat(String(product.price ?? 0)) || 0;
}
