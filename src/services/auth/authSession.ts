import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../storage/secureStorage';
import {
  clearStoredUserProfile,
  getStoredUserProfile,
  setStoredUserProfile,
} from '../storage/userStorage';
import type { AuthUser, StoredUserProfile, UserRole, VerifyOtpUserPayload } from '../../features/auth/types';
import {
  buildAuthUser,
  decodeJwtPayload,
  extractStoredProfile,
  isJwtExpired,
  resolveFullAccess,
  resolveRoleFromToken,
} from './jwt';

export interface LoadedSession {
  user: AuthUser;
  role: UserRole | null;
  fullAccess: boolean;
}

function assertVerifyUserPayload(raw: VerifyOtpUserPayload): VerifyOtpUserPayload {
  if (!raw.accessToken || typeof raw.accessToken !== 'string') {
    throw new Error('Invalid authentication response');
  }
  return raw;
}

export async function saveAuthenticatedSession(rawUser: VerifyOtpUserPayload): Promise<LoadedSession> {
  const userPayload = assertVerifyUserPayload(rawUser);
  const profile = extractStoredProfile(userPayload);

  await setAccessToken(userPayload.accessToken);
  await setStoredUserProfile(profile);

  const { user, role, fullAccess } = buildAuthUser(userPayload.accessToken, profile);
  return { user, role, fullAccess };
}

export async function loadAuthenticatedSession(): Promise<LoadedSession | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return null;
  }

  const payload = decodeJwtPayload(accessToken);
  if (isJwtExpired(payload)) {
    await clearAuthenticatedSession();
    return null;
  }

  const profile = (await getStoredUserProfile()) ?? {};
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

export async function clearAuthenticatedSession(): Promise<void> {
  await clearAccessToken();
  await clearStoredUserProfile();
}

export async function updateStoredProfile(profile: StoredUserProfile): Promise<void> {
  await setStoredUserProfile(profile);
}
