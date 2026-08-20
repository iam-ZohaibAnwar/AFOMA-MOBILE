import type {
  JwtPayload,
  StoredUserProfile,
  UserRole,
  VerifyOtpUserPayload,
} from '../../features/auth/types';

const USER_ROLES: UserRole[] = ['customer', 'seller', 'affiliate', 'admin'];

function base64UrlDecode(input: string): string | null {
  if (!input) {
    return null;
  }

  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  if (typeof globalThis.atob !== 'function') {
    return null;
  }

  return globalThis.atob(padded);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const json = base64UrlDecode(parts[1]);
    if (!json) {
      return null;
    }

    const payload: unknown = JSON.parse(json);
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) {
    return false;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSec;
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
}

export function resolveRoleFromToken(
  accessToken: string,
  profile?: StoredUserProfile | null,
): UserRole | null {
  const payload = decodeJwtPayload(accessToken);
  if (payload?.role && isUserRole(payload.role)) {
    return payload.role;
  }

  if (profile?.userRole && isUserRole(profile.userRole)) {
    return profile.userRole;
  }

  return null;
}

export function resolveFullAccess(accessToken: string): boolean {
  const payload = decodeJwtPayload(accessToken);
  return payload?.fullAccess === true;
}

export function extractStoredProfile(raw: VerifyOtpUserPayload): StoredUserProfile {
  const { accessToken: _accessToken, ...profile } = raw;
  return profile;
}

export function buildAuthUser(
  accessToken: string,
  profile: StoredUserProfile,
): {
  user: StoredUserProfile & { accessToken: string };
  role: UserRole | null;
  fullAccess: boolean;
} {
  const role = resolveRoleFromToken(accessToken, profile);
  const fullAccess = resolveFullAccess(accessToken);

  return {
    user: {
      ...profile,
      accessToken,
    },
    role,
    fullAccess,
  };
}
