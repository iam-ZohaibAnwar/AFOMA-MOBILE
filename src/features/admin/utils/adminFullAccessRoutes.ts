import type { AdminStackParamList } from '../navigation/adminTypes';

/** Admin stack screens gated by the acting admin's JWT fullAccess claim. */
export const ADMIN_FULL_ACCESS_ROUTE_NAMES = [
  'AdminUserManagement',
  'AdminUserDetail',
  'AdminUserForm',
  'AdminCommission',
] as const satisfies ReadonlyArray<keyof AdminStackParamList>;

export type AdminFullAccessRouteName = (typeof ADMIN_FULL_ACCESS_ROUTE_NAMES)[number];

export function isAdminFullAccessRoute(
  screen: keyof AdminStackParamList,
): screen is AdminFullAccessRouteName {
  return (ADMIN_FULL_ACCESS_ROUTE_NAMES as ReadonlyArray<keyof AdminStackParamList>).includes(screen);
}
