import type { AppBadgeProps } from '../../../../components/ui/AppBadge';
import type { AdminUserListItem } from '../types/adminUserManagement';
import { formatAdminUserDisplayName, formatAdminUserRoleLabel } from './adminUserRoleOptions';

export interface AdminUserDetailField {
  label: string;
  value: string;
}

function hasText(value?: string | null): value is string {
  return Boolean(value?.trim());
}

function requiredValue(value?: string | null, fallback = '—'): string {
  return value?.trim() || fallback;
}

function formatUserDob(value?: string): string | null {
  if (!hasText(value)) {
    return null;
  }

  const dateOnly = value.slice(0, 10);
  const parsed = new Date(`${dateOnly}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value.trim();
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatUserGender(value?: string): string | null {
  if (!hasText(value)) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'male') return 'Male';
  if (normalized === 'female') return 'Female';
  if (normalized === 'other') return 'Other';
  return value.trim();
}

function optionalField(label: string, value: string | null | undefined): AdminUserDetailField | null {
  if (!hasText(value)) {
    return null;
  }

  return { label, value: value.trim() };
}

function requiredField(label: string, value?: string | null): AdminUserDetailField {
  return { label, value: requiredValue(value) };
}

export function getAdminUserInitials(user: Pick<AdminUserListItem, 'firstName' | 'lastName' | 'email'>): string {
  const displayName = formatAdminUserDisplayName(user);
  const parts = displayName.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

export function adminUserRoleBadgeVariant(
  role?: string,
): NonNullable<AppBadgeProps['variant']> {
  switch (role) {
    case 'admin':
      return 'warning';
    case 'seller':
      return 'success';
    case 'affiliate':
      return 'primary';
    default:
      return 'neutral';
  }
}

export function getAdminUserAccountFields(user: AdminUserListItem): AdminUserDetailField[] {
  return [
    requiredField('First name', user.firstName),
    requiredField('Last name', user.lastName),
    requiredField('Email', user.email),
    optionalField('Phone', user.phone),
    optionalField('Date of birth', formatUserDob(user.DOB)),
    optionalField('Gender', formatUserGender(user.gender)),
  ].filter((field): field is AdminUserDetailField => field !== null);
}

export function getAdminUserPermissionsFields(user: AdminUserListItem): AdminUserDetailField[] | null {
  if (user.userRole !== 'admin') {
    return null;
  }

  return [
    {
      label: 'Full access',
      value: user.fullAccess ? 'Enabled' : 'Disabled',
    },
  ];
}

export function getAdminUserAddressFields(user: AdminUserListItem): AdminUserDetailField[] {
  const fields = [
    optionalField('Country', user.country),
    optionalField('State', user.state),
    optionalField('City', user.city),
    optionalField('Street', user.streetAddress),
    optionalField('ZIP', user.ZipCode),
  ].filter((field): field is AdminUserDetailField => field !== null);

  return fields;
}

export function hasAdminUserAddress(user: AdminUserListItem): boolean {
  return getAdminUserAddressFields(user).length > 0;
}

export function getAdminUserHeaderEmail(user: AdminUserListItem): string {
  return requiredValue(user.email, 'No email');
}

export function getAdminUserRoleLabel(user: AdminUserListItem): string {
  return formatAdminUserRoleLabel(user.userRole);
}
