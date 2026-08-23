import type { SellerProfile } from '../../types/sellerProfile';

/** Shop is visible unless backend explicitly sets shop_status to 0. */
export function isSellerShopVisible(profile?: Pick<SellerProfile, 'shop_status'> | null): boolean {
  return Number(profile?.shop_status) !== 0;
}

export function getSellerShopVisibilityLabel(profile?: Pick<SellerProfile, 'shop_status'> | null): string {
  return isSellerShopVisible(profile) ? 'Visible' : 'Hidden';
}

export function getSellerShopDisplayName(profile?: SellerProfile | null): string {
  if (profile?.storeTitle?.trim()) {
    return profile.storeTitle.trim();
  }

  if (profile?.storeSlug?.trim()) {
    return profile.storeSlug.trim();
  }

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  return fullName || 'Your shop';
}
