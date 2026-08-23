import type { Product, ProductVariation } from '../../../services/types/product';
import { getVariationImageUrl } from './productVariations';

export interface ProductGalleryImage {
  id: string;
  url: string;
}

export function getProductGalleryImages(
  product: Product,
  matchingVariation?: ProductVariation,
): ProductGalleryImage[] {
  const seen = new Set<string>();
  const images: ProductGalleryImage[] = [];

  const pushUrl = (url: string | undefined, index: number) => {
    if (!url || seen.has(url)) {
      return;
    }

    seen.add(url);
    images.push({ id: `${url}-${index}`, url });
  };

  pushUrl(getVariationImageUrl(matchingVariation), 0);

  product.images?.forEach((image, index) => {
    pushUrl(image.imageUrl, index + 1);
  });

  return images;
}

export function getEstimatedArrivalLabel(daysFromNow = 5): string {
  const arrival = new Date();
  arrival.setDate(arrival.getDate() + daysFromNow);

  return arrival.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getDeliveryEstimateMessage(product: Product): string | null {
  if (product.productType === 'Downloadable') {
    return 'Instant digital download after purchase';
  }

  const arrival = getEstimatedArrivalLabel();

  if (product.freeDelivery) {
    return `Free delivery, arrives ${arrival}`;
  }

  return `Delivery estimate: arrives ${arrival}`;
}

export function getProductBrandName(product: Product): string | undefined {
  const storeSlug = product.seller?.storeSlug?.trim();
  if (storeSlug) {
    return storeSlug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return product.Category?.name?.trim() || undefined;
}
