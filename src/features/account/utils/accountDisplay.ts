import type { AuthUser } from '../../auth/types';

export function getAccountDisplayName(user: AuthUser | null | undefined): string {
  if (!user) {
    return 'Guest';
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (fullName) {
    return fullName;
  }

  const emailPrefix = user.email?.split('@')[0]?.trim();
  return emailPrefix || 'Account';
}

export function getAccountInitials(user: AuthUser | null | undefined): string {
  const displayName = getAccountDisplayName(user);
  const parts = displayName.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

export function getAccountEmail(user: AuthUser | null | undefined): string {
  return user?.email?.trim() || 'Sign in to view your account';
}
