import type { AdminFeaturedShopSeller } from '../types/adminSettings';
import { getAdminFeaturedShopSellerId } from './adminSettingsContent';

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
