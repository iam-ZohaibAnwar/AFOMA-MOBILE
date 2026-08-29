import type { Ionicons } from '@expo/vector-icons';

import type { AdminProductStatusChipTone } from '../../../admin/product-management/components/AdminProductStatusChip';
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

export function resolveSellerShopVisibilityMeta(profile?: Pick<SellerProfile, 'shop_status'> | null) {
  const visible = isSellerShopVisible(profile);

  return {
    label: visible ? 'Visible' : 'Hidden',
    icon: (visible ? 'eye-outline' : 'eye-off-outline') as keyof typeof Ionicons.glyphMap,
    tone: (visible ? 'success' : 'warning') as AdminProductStatusChipTone,
  };
}
