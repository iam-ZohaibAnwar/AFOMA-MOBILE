import type { AuthUser, StoredUserProfile } from '../types';

export function resolveAuthSellerId(
  user: AuthUser | StoredUserProfile | null | undefined,
): string | undefined {
  const sellerId = user?.sellerId;
  return typeof sellerId === 'string' && sellerId.trim() ? sellerId.trim() : undefined;
}
