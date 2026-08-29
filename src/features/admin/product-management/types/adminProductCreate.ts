export type AdminProductListingCategory = 'physical' | 'digital';

export interface AdminProductCreateParams {
  sellerId?: string;
}

export interface AdminProductSubtypeParams extends AdminProductCreateParams {
  category: 'physical';
}
