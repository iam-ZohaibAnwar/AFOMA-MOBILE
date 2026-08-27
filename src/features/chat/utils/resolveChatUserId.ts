import type { AuthUser, StoredUserProfile } from '../../auth/types';

/** Matches web chat identity: sellers use userId, customers use _id. */
export function resolveChatUserId(
  user: AuthUser | StoredUserProfile | null | undefined,
): string | undefined {
  if (!user) {
    return undefined;
  }

  if (user.userRole === 'seller' || user.sellerId) {
    const sellerId = user.userId?.trim();
    return sellerId || undefined;
  }

  const customerId = user._id?.trim() || user.userId?.trim();
  return customerId || undefined;
}
