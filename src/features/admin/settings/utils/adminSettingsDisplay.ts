import type { AdminCommissionRateValue, AdminFeaturedShopSeller } from '../types/adminSettings';
import type { AdminSettingsHubCardMeta } from '../components/AdminSettingsHubCard';
import { ADMIN_FEATURED_SHOPS_MAX } from './adminSettingsConstants';
import { getAdminFeaturedShopSellerId } from './adminSettingsContent';

export function formatAdminCommissionRateDisplay(value: AdminCommissionRateValue | null): string {
  if (value == null) {
    return 'Not set';
  }

  return `${value}%`;
}

export function formatAdminCommissionRateMeta(
  value: AdminCommissionRateValue | null,
): AdminSettingsHubCardMeta | null {
  if (value == null) {
    return {
      label: 'Not configured',
      icon: 'alert-circle-outline',
      tone: 'neutral',
    };
  }

  return {
    label: `Current: ${value}%`,
    icon: 'trending-up-outline',
    tone: 'info',
  };
}

export function formatAdminFeaturedShopsMeta(count: number | null): AdminSettingsHubCardMeta {
  if (count == null) {
    return {
      label: 'Loading…',
      icon: 'time-outline',
      tone: 'neutral',
    };
  }

  if (count === 0) {
    return {
      label: 'No shops selected',
      icon: 'storefront-outline',
      tone: 'neutral',
    };
  }

  return {
    label: `${count} of ${ADMIN_FEATURED_SHOPS_MAX} shops`,
    icon: 'star-outline',
    tone: count >= ADMIN_FEATURED_SHOPS_MAX ? 'success' : 'info',
  };
}

export function formatAdminShippingTiersMeta(count: number | null): AdminSettingsHubCardMeta {
  if (count == null) {
    return {
      label: 'Loading…',
      icon: 'time-outline',
      tone: 'neutral',
    };
  }

  if (count === 0) {
    return {
      label: 'No tiers configured',
      icon: 'globe-outline',
      tone: 'neutral',
    };
  }

  return {
    label: `${count} tier${count === 1 ? '' : 's'}`,
    icon: 'layers-outline',
    tone: 'info',
  };
}

export function formatAdminFeaturedShopDisplayName(
  shop: AdminFeaturedShopSeller,
  fallbackIndex?: number,
): string {
  const fromParts = [shop.firstName, shop.lastName].filter(Boolean).join(' ').trim();
  const name =
    shop.fullName?.trim() ||
    fromParts ||
    shop.email?.trim() ||
    getAdminFeaturedShopSellerId(shop) ||
    (fallbackIndex != null ? `Shop ${fallbackIndex + 1}` : 'Featured shop');

  return name;
}
