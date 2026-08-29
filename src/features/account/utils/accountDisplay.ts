import type { AuthUser } from '../../auth/types';
import { resolveUserProfileImageUrl } from '../../../utils/resolveUserProfileImageUrl';

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

export function formatAccountTenure(createdAt?: string): string | undefined {
  if (!createdAt?.trim()) {
    return undefined;
  }

  const joinedAt = new Date(createdAt);
  if (Number.isNaN(joinedAt.getTime())) {
    return undefined;
  }

  const elapsedYears =
    (Date.now() - joinedAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  if (elapsedYears < 1) {
    const months = Math.max(1, Math.floor(elapsedYears * 12));
    return `${months} ${months === 1 ? 'month' : 'months'} on AFOMA`;
  }

  const roundedYears = Math.round(elapsedYears * 10) / 10;
  const label = Number.isInteger(roundedYears) ? String(roundedYears) : roundedYears.toFixed(1);
  const unit = roundedYears === 1 ? 'year' : 'years';
  return `${label} ${unit} on AFOMA`;
}

export function getUserProfileImageUrl(user: AuthUser | null | undefined): string | undefined {
  return resolveUserProfileImageUrl(user?.userProfile);
}

export function getUserAvatarLabel(
  user: AuthUser | null | undefined,
  isAuthenticated: boolean,
): string {
  if (!isAuthenticated) {
    return 'GU';
  }

  const fromFirstName = user?.firstName?.trim()?.charAt(0);
  if (fromFirstName) {
    return fromFirstName.toUpperCase();
  }

  const fromEmail = user?.email?.trim()?.charAt(0);
  if (fromEmail) {
    return fromEmail.toUpperCase();
  }

  return getAccountDisplayName(user).charAt(0).toUpperCase() || 'A';
}
