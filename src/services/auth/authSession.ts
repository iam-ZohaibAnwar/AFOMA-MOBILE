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
import { getSellerByUserId, getSellerProfile } from '../api/sellersApi';
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

  const storedProfile = (await getStoredUserProfile()) ?? {};
  const role = resolveRoleFromToken(accessToken, storedProfile);
  const profile = await repairSellerStoredProfile(storedProfile, role);
  const fullAccess = resolveFullAccess(accessToken);

  if (profile.sellerId && profile.sellerId !== storedProfile.sellerId) {
    await setStoredUserProfile(profile);
  }

  return {
    user: {
      ...profile,
      accessToken,
    },
    role,
    fullAccess,
  };
}

async function repairSellerStoredProfile(
  profile: StoredUserProfile,
  role: UserRole | null,
): Promise<StoredUserProfile> {
  if (role !== 'seller') {
    return profile;
  }

  const existingSellerId =
    typeof profile.sellerId === 'string' && profile.sellerId.trim()
      ? profile.sellerId.trim()
      : undefined;

  if (existingSellerId) {
    return {
      ...profile,
      sellerId: existingSellerId,
      userRole: profile.userRole ?? 'seller',
    };
  }

  const linkedUserId =
    typeof profile.userId === 'string' && profile.userId.trim()
      ? profile.userId.trim()
      : undefined;

  if (linkedUserId) {
    try {
      const seller = await getSellerByUserId(linkedUserId);
      const sellerId = seller._id?.trim();
      if (sellerId) {
        return {
          ...profile,
          sellerId,
          userRole: 'seller',
        };
      }
    } catch {
      // Try fallback below.
    }
  }

  const candidateSellerId =
    typeof profile._id === 'string' && profile._id.trim() ? profile._id.trim() : undefined;

  if (candidateSellerId) {
    try {
      const seller = await getSellerProfile(candidateSellerId);
      const sellerId = seller._id?.trim();
      if (sellerId) {
        return {
          ...profile,
          sellerId,
          userRole: 'seller',
        };
      }
    } catch {
      // Seller id could not be restored from storage.
    }
  }

  return profile;
}

export async function clearAuthenticatedSession(): Promise<void> {
  await clearAccessToken();
  await clearStoredUserProfile();
}

export async function updateStoredProfile(patch: StoredUserProfile): Promise<void> {
  const existing = (await getStoredUserProfile()) ?? {};
  await setStoredUserProfile({ ...existing, ...patch });
}
