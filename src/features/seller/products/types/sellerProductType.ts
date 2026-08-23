/** Backend `productType` values — do not introduce mobile-only aliases. */
export type SellerProductType = 'Standard' | 'Customizable' | 'Downloadable';

export const SELLER_PRODUCT_TYPE_LABELS: Record<SellerProductType, string> = {
  Standard: 'Standard product',
  Customizable: 'Customizable product',
  Downloadable: 'Downloadable product',
};
