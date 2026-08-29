import type { Ionicons } from '@expo/vector-icons';

import type { SellerProfile, SellerSetupSectionId } from '../../types/sellerProfile';
import {
  getSellerDisplayName,
  getSellerStoreLabel,
  isSetupSectionComplete,
} from '../../utils/sellerSetupSections';
import { isSellerShopVisible } from '../../settings/utils/shopVisibilityDisplay';

export interface SellerProfileStatusChip {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

export function resolveSellerBannerUrl(profile?: SellerProfile | null): string | undefined {
  return profile?.storeBanner?.trim() || undefined;
}

export function resolveSellerAvatarUrl(profile?: SellerProfile | null): string | undefined {
  return profile?.storeLogo?.trim() || profile?.userProfile?.trim() || undefined;
}

export function formatSellerApprovalStatus(status?: string | null): string {
  const normalized = status?.trim();
  if (!normalized) {
    return 'Pending';
  }

  return normalized;
}

export function formatSellerLocation(profile?: SellerProfile | null): string {
  const parts = [profile?.city?.trim(), profile?.state?.trim(), profile?.country?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

export function formatSellerShopSlug(profile?: SellerProfile | null): string {
  return profile?.storeSlug?.trim() || profile?.slug?.trim() || '—';
}

export function resolveSellerProfileStatusChips(profile?: SellerProfile | null): SellerProfileStatusChip[] {
  if (!profile) {
    return [];
  }

  const chips: SellerProfileStatusChip[] = [
    {
      id: 'visibility',
      label: isSellerShopVisible(profile) ? 'Visible' : 'Hidden',
      icon: isSellerShopVisible(profile) ? 'eye-outline' : 'eye-off-outline',
      tone: isSellerShopVisible(profile) ? 'success' : 'warning',
    },
  ];

  const approval = formatSellerApprovalStatus(profile.status);
  if (approval === 'Approved') {
    chips.push({ id: 'approval', label: 'Approved', icon: 'checkmark-circle-outline', tone: 'success' });
  } else if (approval === 'Disapproved') {
    chips.push({ id: 'approval', label: 'Disapproved', icon: 'close-circle-outline', tone: 'danger' });
  } else {
    chips.push({ id: 'approval', label: 'Pending approval', icon: 'time-outline', tone: 'warning' });
  }

  return chips;
}

export function isSellerProfileSectionComplete(
  sectionId: SellerSetupSectionId,
  profile?: SellerProfile | null,
): boolean {
  return isSetupSectionComplete(sectionId, profile?.profileSetup, profile);
}

export function getSellerProfileHeroName(profile?: SellerProfile | null): string {
  return getSellerDisplayName(profile);
}

export function getSellerProfileHeroSubtitle(profile?: SellerProfile | null): string {
  return getSellerStoreLabel(profile);
}
