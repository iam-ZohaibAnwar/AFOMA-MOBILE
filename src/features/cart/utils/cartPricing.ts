import type { UserPricingInfo } from '../../../services/pricing/types';
import { calculateSurcharge } from '../../../services/pricing/pricingUtils';
import type { CartLineItem, CartMap } from '../../../services/types/cart';
import type { VariationAttributeSelection } from '../../products/utils/productVariations';
import { getCartUnitPriceCad } from '../../products/utils/productDisplay';

function resolveBuyerCountry(userInfo: UserPricingInfo, override?: string): string {
  if (override?.trim()) {
    return override.trim();
  }

  const country = userInfo.country;
  if (typeof country === 'string') {
    return country.trim();
  }

  return '';
}

/**
 * International AFOMA shipping surcharge (CAD) for one seller group.
 * Mirrors web `getInternationalDeductedCadForSellerGroup`.
 */
export function getInternationalDeductedCadForSellerGroup(
  products: CartLineItem[],
  userInfo: UserPricingInfo,
  buyerCountryOverride?: string,
): number {
  if (!Array.isArray(products) || products.length === 0) {
    return 0;
  }

  const userSurcharge = userInfo.surCharge ?? {};
  const buyerCountry = resolveBuyerCountry(userInfo, buyerCountryOverride);

  for (const item of products) {
    let surcharge = 0;

    if (
      item.productData?.productType !== 'Downloadable' &&
      (item.productData?.seller?.shippingConfigId as Record<string, any> | undefined)?.international
        ?.afoma_shipping &&
      item.productData?.seller?.country?.trim() !== buyerCountry
    ) {
      surcharge =
        userSurcharge[
          `${item.productData?.seller?.country?.trim()}-${buyerCountry}`
        ] ?? 0;
    }

    const qty = parseFloat(String(item.orderQuantiy)) || 0;
    return surcharge * (qty - 1 + products.length);
  }

  return 0;
}

/** Cart row total in the user's display currency — aligns with home listing cards. */
export function getCartLineDisplayAmountUserCurrency(
  lineItem: CartLineItem,
  sellerGroupLines: CartLineItem[],
  userInfo: UserPricingInfo,
): number {
  const rate = parseFloat(String(userInfo.currencyRate ?? 1)) || 1;
  const deductedCad = getInternationalDeductedCadForSellerGroup(sellerGroupLines, userInfo);
  const groupSub = sellerGroupLines.reduce(
    (sum, item) => sum + parseFloat(String(item.totalAmount ?? 0)),
    0,
  );
  const lineCad = parseFloat(String(lineItem.totalAmount ?? 0));
  const shareCad = groupSub > 0 ? (lineCad / groupSub) * deductedCad : 0;

  return parseFloat(((lineCad + shareCad) * rate).toFixed(2));
}

export function groupCartLinesBySeller(cart: CartMap): Map<string, CartLineItem[]> {
  const groups = new Map<string, CartLineItem[]>();

  for (const line of Object.values(cart)) {
    const sellerId = line.productData?.seller?._id;
    if (!sellerId) {
      continue;
    }

    const existing = groups.get(sellerId);
    if (existing) {
      existing.push(line);
      continue;
    }

    groups.set(sellerId, [line]);
  }

  return groups;
}

/** CAD subtotal including proportional international surcharge per seller group. */
export function getCartSubtotalCad(cart: CartMap, userInfo: UserPricingInfo): number {
  const sellerGroups = groupCartLinesBySeller(cart);
  let subtotal = 0;

  for (const lines of sellerGroups.values()) {
    const groupSub = lines.reduce((sum, line) => sum + (line.totalAmount ?? 0), 0);
    subtotal += groupSub + getInternationalDeductedCadForSellerGroup(lines, userInfo);
  }

  return parseFloat(subtotal.toFixed(2));
}

/** Display subtotal in user currency — matches web cart summary "Item(s) total". */
export function getCartDisplaySubtotal(cart: CartMap, userInfo: UserPricingInfo): number {
  const rate = parseFloat(String(userInfo.currencyRate ?? 1)) || 1;
  return parseFloat((getCartSubtotalCad(cart, userInfo) * rate).toFixed(2));
}

export function getCartLineDisplayAmount(
  line: CartLineItem,
  cart: CartMap,
  userInfo: UserPricingInfo,
): number {
  const sellerId = line.productData?.seller?._id;
  if (!sellerId) {
    const rate = parseFloat(String(userInfo.currencyRate ?? 1)) || 1;
    return parseFloat(((line.totalAmount ?? 0) * rate).toFixed(2));
  }

  const sellerGroupLines = groupCartLinesBySeller(cart).get(sellerId) ?? [line];
  return getCartLineDisplayAmountUserCurrency(line, sellerGroupLines, userInfo);
}

/** Re-price cart line snapshots when geo/pricing context changes — mirrors web `syncCartLinePrices`. */
export function syncCartLinePrices(cart: CartMap, userInfo: UserPricingInfo): CartMap {
  const nextCart: CartMap = {};

  for (const [itemId, line] of Object.entries(cart)) {
    if (!line?.productData) {
      nextCart[itemId] = line;
      continue;
    }

    const pricedProducts = calculateSurcharge([line.productData], userInfo);
    const pricedProduct = pricedProducts[0] ?? line.productData;
    const qty = parseFloat(String(line.orderQuantiy)) || 1;
    const unitCad = getCartUnitPriceCad(
      pricedProduct,
      line.selectedVariations as VariationAttributeSelection[] | undefined,
    );

    nextCart[itemId] = {
      ...line,
      productData: pricedProduct,
      basePrice: unitCad,
      totalAmount: parseFloat((unitCad * qty).toFixed(2)),
    };
  }

  return nextCart;
}

export function getSelectedCartDisplaySubtotal(
  cart: CartMap,
  selectedItemIds: Set<string>,
  userInfo: UserPricingInfo,
): number {
  return Array.from(selectedItemIds).reduce((sum, itemId) => {
    const line = cart[itemId];
    if (!line) {
      return sum;
    }

    return sum + getCartLineDisplayAmount(line, cart, userInfo);
  }, 0);
}
