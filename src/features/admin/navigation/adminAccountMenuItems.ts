import type { AccountMenuIconName } from '../../account/components/AccountMenuIcon';
import type { AdminStackParamList } from './adminTypes';

export interface AdminAccountMenuItem {
  label: string;
  icon: AccountMenuIconName;
  screen: keyof AdminStackParamList;
  requiresFullAccess?: boolean;
}

/** Account → Admin section order (matches web admin sidebar). */
export const ADMIN_ACCOUNT_MENU_ITEMS: AdminAccountMenuItem[] = [
  { label: 'Dashboard', icon: 'admin-dashboard', screen: 'AdminDashboard' },
  { label: 'Order Management', icon: 'order-management', screen: 'AdminOrderManagement' },
  { label: 'Product Management', icon: 'product-management', screen: 'AdminProductManagement' },
  { label: 'Seller Management', icon: 'seller-management', screen: 'AdminSellerManagement' },
  {
    label: 'User Management',
    icon: 'user-management',
    screen: 'AdminUserManagement',
    requiresFullAccess: true,
  },
  { label: 'Commission', icon: 'commission', screen: 'AdminCommission', requiresFullAccess: true },
  { label: 'Global Attributes', icon: 'global-attributes', screen: 'AdminGlobalAttributes' },
  { label: 'Reviews', icon: 'admin-reviews', screen: 'AdminReviews' },
  { label: 'Coupon', icon: 'admin-coupons', screen: 'AdminCoupons' },
  { label: 'Settings', icon: 'admin-settings', screen: 'AdminSettingsHub' },
];
