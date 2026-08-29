import type { AdminManagedUserRole } from './adminUserManagement';

export type AdminUserFormField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'dob'
  | 'gender'
  | 'userRole'
  | 'fullAccess'
  | 'country'
  | 'state'
  | 'city'
  | 'streetAddress'
  | 'zipCode'
  | 'userProfile';

export interface AdminUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  userRole: AdminManagedUserRole | '';
  fullAccess: boolean;
  country: string;
  state: string;
  countryCode: string;
  stateCode: string;
  city: string;
  streetAddress: string;
  zipCode: string;
  userProfile: string;
  profileLocalUri: string;
}

export type AdminUserFormFieldErrors = Partial<Record<AdminUserFormField, string>>;

export const ADMIN_USER_CREATE_INITIAL_VALUES: AdminUserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  userRole: '',
  fullAccess: false,
  country: '',
  state: '',
  countryCode: '',
  stateCode: '',
  city: '',
  streetAddress: '',
  zipCode: '',
  userProfile: '',
  profileLocalUri: '',
};
