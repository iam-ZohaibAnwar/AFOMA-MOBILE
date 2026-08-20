import type { Product } from '../../../services/types/product';

export function filterApprovedProducts(products: Product[]): Product[] {
  return products.filter(
    (product) => product.productStatus === 'Approved' && product.status === 1,
  );
}

export function getProductDisplayName(product: Product): string {
  return product.productName?.trim() || 'Product';
}

export function getProductImageUrl(product: Product): string | undefined {
  return product.images?.[0]?.imageUrl;
}

export function getProductPrice(product: Product): number | undefined {
  const price =
    product.finalPrice ??
    product.totalAmount ??
    product.price ??
    product.basePrice;

  return typeof price === 'number' && Number.isFinite(price) ? price : undefined;
}

export function formatProductPrice(price: number | undefined): string {
  if (price === undefined) {
    return '—';
  }

  return `CAD ${price.toFixed(2)}`;
}

export function getProductRouteId(product: Product): string | undefined {
  return product._id ?? product.slug;
}

export function getProductDescription(product: Product): string {
  const raw = product.description?.trim();
  if (!raw) {
    return 'No description available.';
  }

  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSellerDisplayName(product: Product): string | undefined {
  const seller = product.seller;
  if (!seller) {
    return undefined;
  }

  if (seller.storeSlug?.trim()) {
    return seller.storeSlug.trim();
  }

  const fullName = [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim();
  return fullName || undefined;
}

export function isProductOutOfStock(product: Product): boolean {
  return product.inventory === 'OutOffStock';
}
