import type {
  GlobalSearchResponse,
  Product,
  ProductsBySellerCountResponse,
  ProductsListResponse,
} from '../types/product';
import type { PaginationParams } from '../types/common';
import { apiGet } from './request';

function normalizeProductList(data: Product[] | ProductsListResponse | undefined): Product[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return data.products ?? [];
}

export async function getBestProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/products/best/Product', undefined, 'Failed to load best products');
}

export async function getDiscountedProducts(limit: number): Promise<Product[]> {
  return apiGet<Product[]>(
    '/products/discounted/Product',
    { params: { limit } },
    'Failed to load discounted products',
  );
}

export async function getNewArrivalProducts(limit: number): Promise<Product[]> {
  return apiGet<Product[]>(
    '/products/newArrival/Product',
    { params: { limit } },
    'Failed to load new arrival products',
  );
}

export async function getBestSellingProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/products/bestSelling/Product', undefined, 'Failed to load best selling products');
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return apiGet<Product>(`/products/slug/${encodeURIComponent(slug)}`, undefined, 'Failed to load product');
}

export async function getProductById(id: string): Promise<Product> {
  return apiGet<Product>(`/products/${encodeURIComponent(id)}`, undefined, 'Failed to load product');
}

export async function getProductsBySellerId(
  sellerId: string,
  params: PaginationParams = {},
): Promise<Product[]> {
  return apiGet<Product[]>(
    `/products/by/${encodeURIComponent(sellerId)}`,
    { params },
    'Failed to load seller products',
  );
}

export async function getProductsBySellerCount(sellerId: string): Promise<ProductsBySellerCountResponse> {
  return apiGet<ProductsBySellerCountResponse>(
    `/products/by/${encodeURIComponent(sellerId)}/count`,
    undefined,
    'Failed to load seller product count',
  );
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const joined = ids.map(encodeURIComponent).join(',');
  return apiGet<Product[]>(`/products/byIds/${joined}`, undefined, 'Failed to load products');
}

export async function getRelatedProducts(
  categoryOrProductId: string,
  params: PaginationParams = {},
): Promise<Product[]> {
  const data = await apiGet<ProductsListResponse | Product[]>(
    `/products/search/related/${encodeURIComponent(categoryOrProductId)}`,
    { params },
    'Failed to load related products',
  );
  return normalizeProductList(data);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const data = await apiGet<ProductsListResponse | Product[]>(
    `/products/category/${encodeURIComponent(categoryId)}`,
    undefined,
    'Failed to load category products',
  );
  return normalizeProductList(data);
}

export async function globalProductSearch(name: string): Promise<GlobalSearchResponse> {
  return apiGet<GlobalSearchResponse>(
    '/products/global/search',
    { params: { name } },
    'Failed to search products',
  );
}
