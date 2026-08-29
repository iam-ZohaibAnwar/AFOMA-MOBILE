import { colors } from '../../../../design-system';
import type { AdminUserListItem, AdminUserRoleFilter } from '../types/adminUserManagement';
import { resolveUserProfileImageUrl } from '../../../../utils/resolveUserProfileImageUrl';
import { getAdminUserInitials } from './adminUserDetailDisplay';
import {
  formatAdminUserDisplayName,
  formatAdminUserRoleLabel,
  getAdminUserFullAccessBadgeLabel,
} from './adminUserRoleOptions';

export type AdminUserListTabId = AdminUserRoleFilter;

export const ADMIN_USER_LIST_TAB_OPTIONS: Array<{ value: AdminUserListTabId; label: string }> = [
  { value: '', label: 'All' },
  { value: 'customer', label: 'Customer' },
  { value: 'seller', label: 'Seller' },
  { value: 'affiliate', label: 'Affiliate' },
];

export interface AdminUserListStatusChip {
  id: string;
  label: string;
  icon: string;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

export function resolveAdminUserAccentColor(role?: string): string {
  switch (role) {
    case 'admin':
      return colors.warning;
    case 'seller':
      return colors.success;
    case 'affiliate':
      return colors.secondary;
    default:
      return colors.primary;
  }
}

export function getAdminUserListSubtitle(user: AdminUserListItem): string {
  const phone = user.phone?.trim();
  if (phone) {
    return phone;
  }

  const email = user.email?.trim();
  if (email) {
    return email;
  }

  return formatAdminUserRoleLabel(user.userRole);
}

function resolveRoleIcon(role?: string): string {
  switch (role) {
    case 'admin':
      return 'shield-outline';
    case 'seller':
      return 'storefront-outline';
    case 'affiliate':
      return 'link-outline';
    default:
      return 'person-outline';
  }
}

function resolveRoleTone(role?: string): AdminUserListStatusChip['tone'] {
  switch (role) {
    case 'admin':
      return 'warning';
    case 'seller':
      return 'success';
    case 'affiliate':
      return 'info';
    default:
      return 'neutral';
  }
}

export function resolveAdminUserListStatusChips(user: AdminUserListItem): AdminUserListStatusChip[] {
  const chips: AdminUserListStatusChip[] = [
    {
      id: 'role',
      label: formatAdminUserRoleLabel(user.userRole),
      icon: resolveRoleIcon(user.userRole),
      tone: resolveRoleTone(user.userRole),
    },
  ];

  const fullAccessBadge = getAdminUserFullAccessBadgeLabel(user);
  if (fullAccessBadge) {
    chips.push({
      id: 'access',
      label: fullAccessBadge,
      icon: user.fullAccess ? 'key-outline' : 'lock-closed-outline',
      tone: user.fullAccess ? 'warning' : 'neutral',
    });
  }

  return chips;
}

export function resolveAdminUserAvatarUrl(user: AdminUserListItem): string | undefined {
  return resolveUserProfileImageUrl(user.userProfile);
}

export { formatAdminUserDisplayName, getAdminUserInitials };
