import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';
import type {
  AdminCommissionRateSettingType,
  AdminCommissionRateValue,
  AdminFeaturedShopSeller,
  AdminSettingsV1SettingType,
} from '../types/adminSettings';
import {
  ADMIN_COMMISSION_RATE_MAX,
  ADMIN_COMMISSION_RATE_MIN,
  ADMIN_FEATURED_SHOPS_MAX,
} from './adminSettingsConstants';

export function isAdminCommissionRateSettingType(
  type: string,
): type is AdminCommissionRateSettingType {
  return (
    type === 'affiliate-commission' ||
    type === 'seller-referral-commission' ||
    type === 'buyer-referral-commission'
  );
}

export function isAdminSettingsV1SettingType(type: string): type is AdminSettingsV1SettingType {
  return isAdminCommissionRateSettingType(type) || type === 'shops';
}

/** GET → UI: parse stored content string to commission rate number. */
export function parseAdminCommissionRateContent(rawContent: string | undefined | null): AdminCommissionRateValue | null {
  if (rawContent == null || rawContent === '') {
    return null;
  }

  let parsed: unknown = rawContent;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    parsed = rawContent;
  }

  if (typeof parsed === 'number' && Number.isFinite(parsed)) {
    return parsed;
  }

  if (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    if (!trimmed) {
      return null;
    }
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
}

/**
 * UI → PUT: web sends JSON.stringify(String(value)) e.g. `"\"3\""`.
 */
export function stringifyAdminCommissionRateContent(value: AdminCommissionRateValue): string {
  return JSON.stringify(String(value));
}

/** GET → UI: parse shops array from settings content. */
export function parseAdminFeaturedShopsContent(rawContent: string | undefined | null): AdminFeaturedShopSeller[] {
  if (rawContent == null || rawContent === '') {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((entry): entry is AdminFeaturedShopSeller => Boolean(entry) && typeof entry === 'object');
}

/** UI → PUT: preserve full seller objects and array order. */
export function stringifyAdminFeaturedShopsContent(shops: AdminFeaturedShopSeller[]): string {
  return JSON.stringify(shops);
}

export function getAdminFeaturedShopSellerId(shop: AdminFeaturedShopSeller): string | null {
  const id = shop.id ?? shop._id;
  return id ? String(id) : null;
}

/** Map admin seller list row to web featured-shop payload shape (`id` field). */
export function toAdminFeaturedShopSellerPayload(seller: AdminSellerListItem): AdminFeaturedShopSeller {
  const fullName = [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim();

  return {
    ...(seller as unknown as AdminFeaturedShopSeller),
    id: seller._id,
    _id: seller._id,
    fullName: fullName || seller.storeTitle || seller.email || seller._id,
    userRole: seller.userRole ?? 'seller',
  };
}

export function validateAdminCommissionRateValue(value: number): string | null {
  if (!Number.isFinite(value)) {
    return 'Enter a valid commission percentage.';
  }

  if (value < ADMIN_COMMISSION_RATE_MIN || value > ADMIN_COMMISSION_RATE_MAX) {
    return `Commission must be between ${ADMIN_COMMISSION_RATE_MIN} and ${ADMIN_COMMISSION_RATE_MAX}%.`;
  }

  return null;
}

export function validateAdminFeaturedShopsSelection(shops: AdminFeaturedShopSeller[]): string | null {
  if (shops.length > ADMIN_FEATURED_SHOPS_MAX) {
    return `You can select up to ${ADMIN_FEATURED_SHOPS_MAX} featured shops.`;
  }

  const ids = shops.map(getAdminFeaturedShopSellerId).filter(Boolean);
  if (new Set(ids).size !== ids.length) {
    return 'Featured shops must be unique.';
  }

  return null;
}

export function getAdminCommissionRateSettingLabel(rateType: AdminCommissionRateSettingType): string {
  switch (rateType) {
    case 'affiliate-commission':
      return 'Affiliate Commission';
    case 'seller-referral-commission':
      return 'Seller Referral Commission';
    case 'buyer-referral-commission':
      return 'Buyer Referral Commission';
    default:
      return 'Commission Rate';
  }
}

export function getAdminCommissionRateSettingDescription(
  rateType: AdminCommissionRateSettingType,
): string {
  switch (rateType) {
    case 'affiliate-commission':
      return 'Percentage paid to affiliates on referred sales';
    case 'seller-referral-commission':
      return 'Reward when a seller refers another seller to the marketplace';
    case 'buyer-referral-commission':
      return 'Reward when a buyer refers another customer';
    default:
      return 'Set the commission percentage (0–9%)';
  }
}

export const ADMIN_COMMISSION_RATE_SETTING_TYPES: AdminCommissionRateSettingType[] = [
  'affiliate-commission',
  'seller-referral-commission',
  'buyer-referral-commission',
];
