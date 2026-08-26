import type { CartLineItem, CartMap } from '../../../services/types/cart';
import type { ProductSellerRef } from '../../../services/types/product';

export interface SellerCartGroup {
  sellerId: string;
  sellerName: string;
  lines: CartLineItem[];
}

/** Stable seller key — web groups by `seller._id`; fall back when API shape varies. */
export function getProductSellerId(seller?: ProductSellerRef): string | undefined {
  if (!seller) {
    return undefined;
  }

  const primaryId = seller._id ?? seller.id;
  if (primaryId != null && String(primaryId).trim()) {
    return String(primaryId).trim();
  }

  if (seller.uuid != null && String(seller.uuid).trim()) {
    return String(seller.uuid).trim();
  }

  if (seller.userId?.trim()) {
    return seller.userId.trim();
  }

  return undefined;
}

/** Display name for seller/store sections — mirrors web cart grouping labels. */
export function getProductSellerName(seller?: ProductSellerRef): string {
  if (!seller) {
    return 'Seller';
  }

  return (
    seller.storeTitle?.trim() ||
    [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim() ||
    seller.storeSlug?.trim() ||
    'Seller'
  );
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
    const sellerId = getProductSellerId(seller);
    if (!sellerId) {
      continue;
    }

    const existing = groups.get(sellerId);
    const sellerName = getProductSellerName(seller);

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
