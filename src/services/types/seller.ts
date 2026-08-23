export interface SellerStorePolicy {
  cancellationPolicy?: boolean | string;
  cancellationPolicyTime?: number | string;
  returnPolicy?: boolean | string;
  returnPolicyDetails?: string;
  faqList?: Array<{ question?: string; answer?: string }>;
}

/**
 * Seller types from storefront usage.
 */
export interface Seller {
  _id?: string;
  userRole?: string;
  firstName?: string;
  lastName?: string;
  storeSlug?: string;
  storeTitle?: string;
  storeDesc?: string;
  storeBanner?: string;
  storeLogo?: string;
  userProfile?: string;
  shop_status?: number;
  city?: string;
  state?: string;
  country?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  storePolicy?: SellerStorePolicy;
}

export interface SellerByIdsRequest {
  ids: string[];
}

export type SellerByIdsResponse = Seller[];
