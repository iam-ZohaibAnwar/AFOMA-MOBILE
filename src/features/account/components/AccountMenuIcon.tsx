import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type AccountMenuIconName =
  | 'account-details'
  | 'orders'
  | 'addresses'
  | 'referral-earnings'
  | 'messages'
  | 'shop-profile'
  | 'dashboard'
  | 'products'
  | 'seller-orders'
  | 'shipping'
  | 'shop-settings'
  | 'seller-earnings'
  | 'coupons'
  | 'attributes'
  | 'reviews'
  | 'admin-dashboard'
  | 'seller-management'
  | 'order-management'
  | 'product-management'
  | 'global-attributes'
  | 'admin-reviews'
  | 'admin-coupons'
  | 'admin-settings'
  | 'user-management'
  | 'commission'
  | 'notifications'
  | 'help'
  | 'terms'
  | 'logout'
  | 'membership';

const ICON_MAP: Record<AccountMenuIconName, ComponentProps<typeof Ionicons>['name']> = {
  'account-details': 'person-outline',
  orders: 'bag-outline',
  addresses: 'location-outline',
  'referral-earnings': 'gift-outline',
  messages: 'chatbubbles-outline',
  'shop-profile': 'storefront-outline',
  dashboard: 'speedometer-outline',
  products: 'cube-outline',
  'seller-orders': 'receipt-outline',
  shipping: 'car-outline',
  'shop-settings': 'settings-outline',
  'seller-earnings': 'wallet-outline',
  coupons: 'ticket-outline',
  attributes: 'pricetags-outline',
  reviews: 'star-outline',
  'admin-dashboard': 'grid-outline',
  'seller-management': 'people-outline',
  'order-management': 'clipboard-outline',
  'product-management': 'layers-outline',
  'global-attributes': 'options-outline',
  'admin-reviews': 'chatbubbles-outline',
  'admin-coupons': 'ticket-outline',
  'admin-settings': 'settings-outline',
  'user-management': 'people-circle-outline',
  commission: 'cash-outline',
  notifications: 'notifications-outline',
  help: 'help-circle-outline',
  terms: 'document-text-outline',
  logout: 'log-out-outline',
  membership: 'ribbon-outline',
};

export interface AccountMenuIconProps {
  name: AccountMenuIconName;
  color: string;
  size?: number;
}

export function AccountMenuIcon({ name, color, size = 18 }: AccountMenuIconProps) {
  return <Ionicons name={ICON_MAP[name]} size={size} color={color} />;
}
