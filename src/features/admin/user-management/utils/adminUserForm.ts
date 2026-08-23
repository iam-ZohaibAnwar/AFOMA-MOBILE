import { isValidEmail } from '../../../auth/utils/validation';
import { resolveAddressRegionCodes } from '../../../checkout/utils/resolveAddressRegionCodes';
import type {
  AdminUserAdminUpdatePayload,
  AdminUserCreatePayload,
  AdminUserCreateRole,
  AdminUserListItem,
  AdminUserWritePayload,
} from '../types/adminUserManagement';
import type { AdminUserFormFieldErrors, AdminUserFormValues } from '../types/adminUserForm';

function formatDobForForm(dob?: string): string {
  if (!dob?.trim()) {
    return '';
  }

  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

export function mapAdminUserToFormValues(user: AdminUserListItem): AdminUserFormValues {
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    dob: formatDobForForm(user.DOB),
    gender: user.gender ?? '',
    userRole: user.userRole ?? '',
    fullAccess: user.fullAccess ?? false,
    country: user.country ?? '',
    state: user.state ?? '',
    countryCode: user.countryCode ?? '',
    stateCode: user.stateCode ?? '',
    city: user.city ?? '',
    streetAddress: user.streetAddress ?? '',
    zipCode: user.ZipCode ?? '',
    userProfile: user.userProfile ?? '',
    profileLocalUri: '',
    web3address: user.web3address ?? '',
  };
}

function isValidDobInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return false;
  }

  const date = new Date(`${value.trim()}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

/** Web create-user / userform Yup parity for admin user create + edit. */
export function validateAdminUserForm(values: AdminUserFormValues): AdminUserFormFieldErrors {
  const errors: AdminUserFormFieldErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'Required';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Required';
  }

  if (!values.email.trim()) {
    errors.email = 'Required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Required';
  }

  if (!values.userRole) {
    errors.userRole = 'Required';
  }

  if (!values.country.trim()) {
    errors.country = 'Required';
  }

  if (!values.state.trim()) {
    errors.state = 'Required';
  }

  if (!values.city.trim()) {
    errors.city = 'Required';
  }

  if (!values.streetAddress.trim()) {
    errors.streetAddress = 'Required';
  }

  if (!values.zipCode.trim()) {
    errors.zipCode = 'Required';
  }

  if (values.dob.trim() && !isValidDobInput(values.dob)) {
    errors.dob = 'Use YYYY-MM-DD';
  }

  return errors;
}

/** @deprecated Use validateAdminUserForm */
export const validateAdminUserCreateForm = validateAdminUserForm;

function buildAdminUserWritePayload(values: AdminUserFormValues): AdminUserWritePayload {
  const { countryCode, stateCode } = resolveAddressRegionCodes({
    country: values.country,
    state: values.state,
    countryCode: values.countryCode,
    stateCode: values.stateCode,
  });

  const dobValue = values.dob.trim();
  const payload: AdminUserWritePayload = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    userRole: values.userRole as AdminUserWritePayload['userRole'],
    country: values.country.trim(),
    state: values.state.trim(),
    city: values.city.trim(),
    streetAddress: values.streetAddress.trim(),
    ZipCode: values.zipCode.trim(),
    countryCode,
    stateCode,
  };

  if (dobValue) {
    payload.DOB = new Date(`${dobValue}T00:00:00.000Z`).toISOString();
  }

  if (values.gender.trim()) {
    payload.gender = values.gender.trim();
  }

  if (values.userProfile.trim()) {
    payload.userProfile = values.userProfile.trim();
  }

  if (values.web3address.trim()) {
    payload.web3address = values.web3address.trim();
  }

  if (values.userRole === 'admin') {
    payload.fullAccess = values.fullAccess;
  }

  return payload;
}

export function buildAdminUserCreatePayload(values: AdminUserFormValues): AdminUserCreatePayload {
  return {
    ...buildAdminUserWritePayload(values),
    userRole: values.userRole as AdminUserCreateRole,
  };
}

export function buildAdminUserUpdatePayload(
  values: AdminUserFormValues,
): AdminUserAdminUpdatePayload {
  return buildAdminUserWritePayload(values);
}
