import type { AdminUserListItem } from '../types/adminUserManagement';

const sessionPatches = new Map<string, Partial<AdminUserListItem>>();

export function setAdminUserSessionPatch(
  userId: string,
  patch: Partial<AdminUserListItem>,
): void {
  sessionPatches.set(userId, {
    ...sessionPatches.get(userId),
    ...patch,
  });
}

export function applyAdminUserSessionPatch<T extends AdminUserListItem>(
  user: T | null | undefined,
): T | null | undefined {
  if (!user?._id) {
    return user;
  }

  const patch = sessionPatches.get(user._id);
  return patch ? { ...user, ...patch } : user;
}

export function peekAdminUserSessionPatches(): Map<string, Partial<AdminUserListItem>> {
  return new Map(sessionPatches);
}

export function clearAdminUserSessionPatch(userId: string): void {
  sessionPatches.delete(userId);
}
