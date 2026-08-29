import type { UserRole } from '../../../auth/types';

/** Managed user roles — matches web `lib/select-option.js` userRole. */
export type AdminManagedUserRole = UserRole;

/** List filter roles — web sends lowercased values; admin role is not filterable. */
export type AdminUserRoleFilter = '' | 'customer' | 'seller' | 'affiliate';

export interface AdminUserListItem {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  DOB?: string;
  gender?: string;
  userRole?: AdminManagedUserRole;
  /** Elevated admin permissions for managed admin users — not the acting admin's gate. */
  fullAccess?: boolean;
  userProfile?: string;
  country?: string;
  state?: string;
  city?: string;
  streetAddress?: string;
  ZipCode?: string;
  countryCode?: string;
  stateCode?: string;
  web3address?: string;
  networkType?: string;
}

export interface AdminUserListQuery {
  page: number;
  limit: number;
  search?: string;
  role?: AdminUserRoleFilter;
}

export interface AdminUserListResponse {
  users?: AdminUserListItem[];
  totalUsers?: number;
  totalPages?: number;
}

/** POST /users — create roles exclude seller (web create-user parity). */
export type AdminUserCreateRole = Extract<AdminManagedUserRole, 'customer' | 'affiliate' | 'admin'>;

export interface AdminUserWritePayload {
  firstName: string;
  lastName: string;
  DOB?: string | null;
  gender?: string;
  email: string;
  phone: string;
  userRole: AdminManagedUserRole;
  fullAccess?: boolean;
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  ZipCode: string;
  countryCode?: string;
  stateCode?: string;
  userProfile?: string;
}

export type AdminUserCreatePayload = Omit<AdminUserWritePayload, 'userRole'> & {
  userRole: AdminUserCreateRole;
};

export type AdminUserAdminUpdatePayload = AdminUserWritePayload;

export type AdminUserFormMode = 'create' | 'edit';
