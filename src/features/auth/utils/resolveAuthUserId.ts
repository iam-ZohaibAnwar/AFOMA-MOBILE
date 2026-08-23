import type { AuthUser, StoredUserProfile } from '../types';

export function resolveAuthUserId(
  user: AuthUser | StoredUserProfile | null | undefined,
): string | undefined {
  const candidate = user as (AuthUser | StoredUserProfile) & { id?: string };
  const id = candidate?.userId ?? candidate?._id ?? candidate?.id;
  return typeof id === 'string' && id.trim() ? id.trim() : undefined;
}
