import type { SellerProfileSetup } from '../types/sellerProfile';
import { isSellerProductCreationAllowed } from './sellerSetupSections';

/**
 * Product creation gate (web parity: pages/seller/product/index.jsx).
 * Strict `profileSetup` flags only — no data fallback.
 * Use when implementing Seller Products; do not block navigation elsewhere.
 */
export function canSellerCreateProducts(profileSetup?: SellerProfileSetup): boolean {
  return isSellerProductCreationAllowed(profileSetup);
}

export const SELLER_PRODUCT_CREATION_BLOCKED_MESSAGE =
  'Please complete your profile setup before creating products.';
