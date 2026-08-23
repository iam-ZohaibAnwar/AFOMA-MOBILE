import type { CartLineItem, CartMap } from '../../../services/types/cart';

export interface SellerCartGroup {
  sellerId: string;
  sellerName: string;
  lines: CartLineItem[];
}

function hasShippingService(value: CartLineItem['shippingService']): value is NonNullable<CartLineItem['shippingService']> {
  if (value == null || value === '') {
    return false;
  }

  if (typeof value === 'object' && Object.keys(value as object).length === 0) {
    return false;
  }

  return true;
}

/** Payload shape sent to POST /shipping/getRate — mirrors web `formatCartGrouping` cart lines. */
function toCartLinePayload(line: CartLineItem): CartLineItem {
  const payload: CartLineItem = {
    orderQuantiy: line.orderQuantiy,
    totalAmount: line.totalAmount,
    productData: line.productData,
    basePrice: line.basePrice,
    maxQuantity: line.maxQuantity,
    remark: line.remark ?? '',
    shippingOptions: line.shippingOptions ?? [],
    shippingRate: line.shippingRate,
    selectedVariations: line.selectedVariations,
  };

  if (hasShippingService(line.shippingService)) {
    payload.shippingService = line.shippingService;
  }

  return payload;
}

export function groupCartBySeller(cart: CartMap): SellerCartGroup[] {
  const groups = new Map<string, SellerCartGroup>();

  for (const line of Object.values(cart)) {
    const seller = line.productData?.seller;
    const sellerId = seller?._id;
    if (!sellerId) {
      continue;
    }

    const existing = groups.get(sellerId);
    const sellerName =
      seller.storeSlug?.trim() ||
      [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim() ||
      'Seller';

    if (existing) {
      existing.lines.push(toCartLinePayload(line));
      continue;
    }

    groups.set(sellerId, {
      sellerId,
      sellerName,
      lines: [toCartLinePayload(line)],
    });
  }

  return Array.from(groups.values());
}

export function buildSellerCartPayload(lines: CartLineItem[]): CartLineItem[] {
  return lines.map(toCartLinePayload);
}
