import type { CartLineItem, CartMap } from '../../../services/types/cart';

export interface SellerCartGroup {
  sellerId: string;
  sellerName: string;
  lines: CartLineItem[];
}

function toCartLinePayload(line: CartLineItem): CartLineItem {
  return {
    orderQuantiy: line.orderQuantiy,
    totalAmount: line.totalAmount,
    productData: line.productData,
    basePrice: line.basePrice,
    maxQuantity: line.maxQuantity,
    remark: line.remark,
    shippingOptions: line.shippingOptions ?? [],
    shippingRate: line.shippingRate,
    shippingService: line.shippingService,
    selectedVariations: line.selectedVariations,
  };
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
