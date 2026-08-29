import type { Ionicons } from '@expo/vector-icons';

import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminSettingsHubCardMeta } from '../components/AdminSettingsHubCard';

type SettingsHubScreen = Extract<
  keyof AdminStackParamList,
  | 'AdminSettingsCommissionRates'
  | 'AdminSettingsFeaturedShops'
  | 'AdminSettingsShippingConfig'
  | 'AdminSettingsCsvExport'
  | 'AdminSettingsSellerShippingList'
>;

export type AdminSettingsHubMetaKey =
  | 'commissionRates'
  | 'featuredShops'
  | 'shippingMatrix';

export interface AdminSettingsHubItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  screen: SettingsHubScreen;
  metaKey?: AdminSettingsHubMetaKey;
}

export interface AdminSettingsHubSection {
  id: string;
  title: string;
  items: AdminSettingsHubItem[];
}

/** Grouped Settings hub destinations — mirrors web admin categories for mobile. */
export const ADMIN_SETTINGS_HUB_SECTIONS: AdminSettingsHubSection[] = [
  {
    id: 'commissions',
    title: 'Commissions & referrals',
    items: [
      {
        id: 'commission-rates',
        title: 'Commission Rates',
        description: 'Affiliate, seller referral, and buyer referral percentages',
        icon: 'pie-chart-outline',
        screen: 'AdminSettingsCommissionRates',
        metaKey: 'commissionRates',
      },
    ],
  },
  {
    id: 'marketplace',
    title: 'Marketplace display',
    items: [
      {
        id: 'featured-shops',
        title: 'Featured Shops',
        description: 'Shops shown in the marketplace spotlight',
        icon: 'storefront-outline',
        screen: 'AdminSettingsFeaturedShops',
        metaKey: 'featuredShops',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping',
    items: [
      {
        id: 'shipping-matrix',
        title: 'Shipping Matrix',
        description: 'Tier-based origin→destination shipping surcharges',
        icon: 'globe-outline',
        screen: 'AdminSettingsShippingConfig',
        metaKey: 'shippingMatrix',
      },
      {
        id: 'seller-shipping',
        title: 'Seller Shipping Config',
        description: 'Per-seller domestic and international shipping rules',
        icon: 'boat-outline',
        screen: 'AdminSettingsSellerShippingList',
      },
    ],
  },
  {
    id: 'data',
    title: 'Data & exports',
    items: [
      {
        id: 'csv-export',
        title: 'CSV Export',
        description: 'Download customers, sellers, affiliates, and more',
        icon: 'document-text-outline',
        screen: 'AdminSettingsCsvExport',
      },
    ],
  },
];

export function resolveAdminSettingsHubMeta(
  metaKey: AdminSettingsHubMetaKey | undefined,
  summary: {
    commissionRatesMeta: AdminSettingsHubCardMeta;
    featuredShopsMeta: AdminSettingsHubCardMeta;
    shippingMatrixMeta: AdminSettingsHubCardMeta;
  },
): AdminSettingsHubCardMeta | null {
  switch (metaKey) {
    case 'commissionRates':
      return summary.commissionRatesMeta;
    case 'featuredShops':
      return summary.featuredShopsMeta;
    case 'shippingMatrix':
      return summary.shippingMatrixMeta;
    default:
      return null;
  }
}
