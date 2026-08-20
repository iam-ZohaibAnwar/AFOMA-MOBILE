/**
 * Product fields referenced by the web storefront.
 * TODO: Verify full backend product schema.
 */
export interface ProductImage {
  imageUrl?: string;
  altText?: string;
}

export interface ProductSellerRef {
  _id?: string;
  id?: string;
  storeSlug?: string;
  firstName?: string;
  lastName?: string;
}

export interface ProductVariation {
  finalPrice?: number;
  [key: string]: unknown;
}

export interface ProductCategoryRef {
  name?: string;
}

export interface Product {
  _id?: string;
  productName?: string;
  slug?: string;
  description?: string;
  productStatus?: string;
  status?: number;
  productType?: 'Standard' | 'Customizable' | 'Downloadable' | string;
  price?: number;
  totalAmount?: number;
  finalPrice?: number;
  basePrice?: number;
  discountCode?: number;
  couponCode?: string | boolean;
  couponDiscount?: number;
  variations?: ProductVariation[];
  images?: ProductImage[];
  seller?: ProductSellerRef;
  Category?: ProductCategoryRef;
  SubCategory?: ProductCategoryRef;
  inventory?: string;
  quantity?: number;
  // TODO: variations, shipping, downloadableLink, and other PDP fields
}

export interface GlobalSearchResponse {
  matchedProducts?: Product[];
  suggestedProducts?: Product[];
}

export interface ProductsBySellerCountResponse {
  totalProducts?: number;
}

/** Response shape for `/products/search/related/*` and `/products/category/*`. */
export interface ProductsListResponse {
  products?: Product[];
  pagination?: {
    hasNextPage?: boolean;
    page?: number;
    limit?: number;
  };
  category?: ProductCategoryRef;
}
