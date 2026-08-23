import type { AdminManagedUserRole, AdminUserCreateRole, AdminUserRoleFilter } from '../types/adminUserManagement';

export const ADMIN_USER_ROLE_LABELS: Record<AdminManagedUserRole, string> = {
  customer: 'Customer',
  seller: 'Seller',
  admin: 'Admin',
  affiliate: 'Affiliate',
};

export const ADMIN_USER_ROLE_FILTER_OPTIONS: Array<{ value: AdminUserRoleFilter; label: string }> = [
  { value: '', label: 'All roles' },
  { value: 'customer', label: 'Customer' },
  { value: 'seller', label: 'Seller' },
  { value: 'affiliate', label: 'Affiliate' },
];

/** Web create-user.jsx — seller excluded; use Seller Management for seller creation. */
export const ADMIN_USER_CREATE_ROLE_OPTIONS: Array<{ value: AdminUserCreateRole; label: string }> = [
  { value: 'customer', label: 'Customer' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'admin', label: 'Admin' },
];

/** Web userform/index.jsx edit — all four roles editable. */
export const ADMIN_USER_EDIT_ROLE_OPTIONS: Array<{ value: AdminManagedUserRole; label: string }> = [
  { value: 'customer', label: 'Customer' },
  { value: 'seller', label: 'Seller' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'admin', label: 'Admin' },
];

export const ADMIN_USER_FULL_ACCESS_OPTIONS = [
  { value: true as const, label: 'Enabled' },
  { value: false as const, label: 'Disabled' },
];

export function formatAdminUserRoleLabel(role?: string): string {
  if (!role) {
    return 'Unknown';
  }

  return ADMIN_USER_ROLE_LABELS[role as AdminManagedUserRole] ?? role;
}

/** Secondary badge for admin-role users in list/detail headers. */
export function getAdminUserFullAccessBadgeLabel(user: {
  userRole?: string;
  fullAccess?: boolean;
}): string | null {
  if (user.userRole !== 'admin') {
    return null;
  }

  return user.fullAccess ? 'Full access' : 'Limited access';
}

export function formatAdminUserDisplayName(user: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): string {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email || 'User';
}
