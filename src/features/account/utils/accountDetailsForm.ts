import type { StoredUserProfile } from '../../auth/types';
import type { UpdateUserProfileRequest, UserProfileResponse } from '../../../services/api/usersApi';
import { resolveAddressRegionCodes } from '../../checkout/utils/resolveAddressRegionCodes';
import { resolveCountryStateSelection } from '../../../utils/regionOptions';
import { isValidEmail } from '../../auth/utils/validation';

export type AccountDetailsFormField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'gender'
  | 'dob'
  | 'country'
  | 'state'
  | 'countryCode'
  | 'stateCode'
  | 'city'
  | 'streetAddress'
  | 'zipCode'
  | 'web3address'
  | 'networkType';

export interface AccountDetailsFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  country: string;
  state: string;
  countryCode: string;
  stateCode: string;
  city: string;
  streetAddress: string;
  zipCode: string;
  web3address: string;
  networkType: string;
}

export type AccountDetailsFormErrors = Partial<Record<AccountDetailsFormField, string>>;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export function emptyAccountDetailsFormValues(): AccountDetailsFormValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    country: '',
    state: '',
    countryCode: '',
    stateCode: '',
    city: '',
    streetAddress: '',
    zipCode: '',
    web3address: '',
    networkType: '',
  };
}

function formatDobForInput(value?: string): string {
  if (!value?.trim()) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.trim();
  }

  return date.toISOString().slice(0, 10);
}

function mapRegionFields(
  profile: UserProfileResponse,
  cachedUser?: StoredUserProfile | null,
) {
  return resolveCountryStateSelection({
    country: profile.country ?? profile.countryName ?? cachedUser?.country ?? cachedUser?.countryName,
    state: profile.state ?? cachedUser?.state,
    countryCode: profile.countryCode ?? cachedUser?.countryCode,
    stateCode: profile.stateCode ?? cachedUser?.stateCode,
  });
}

export function accountDetailsFormFromProfile(
  profile: UserProfileResponse,
  cachedUser?: StoredUserProfile | null,
): AccountDetailsFormValues {
  const region = mapRegionFields(profile, cachedUser);

  return {
    firstName: profile.firstName ?? cachedUser?.firstName ?? '',
    lastName: profile.lastName ?? cachedUser?.lastName ?? '',
    email: profile.email ?? cachedUser?.email ?? '',
    phone: profile.phone ?? profile.moNumber ?? cachedUser?.phone ?? cachedUser?.moNumber ?? '',
    gender: profile.gender ?? cachedUser?.gender ?? '',
    dob: formatDobForInput(profile.DOB ?? cachedUser?.DOB),
    country: region.country,
    state: region.state,
    countryCode: region.countryCode,
    stateCode: region.stateCode,
    city: profile.city ?? cachedUser?.city ?? '',
    streetAddress: profile.streetAddress ?? cachedUser?.streetAddress ?? '',
    zipCode: profile.ZipCode ?? profile.zipcode ?? cachedUser?.ZipCode ?? cachedUser?.zipcode ?? '',
    web3address: profile.web3address ?? cachedUser?.web3address ?? '',
    networkType: profile.networkType ?? cachedUser?.networkType ?? '',
  };
}

export function accountDetailsFormFromCachedUser(user: StoredUserProfile): AccountDetailsFormValues {
  const region = resolveCountryStateSelection({
    country: user.country ?? user.countryName,
    state: user.state,
    countryCode: user.countryCode,
    stateCode: user.stateCode,
  });

  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? user.moNumber ?? '',
    gender: user.gender ?? '',
    dob: formatDobForInput(user.DOB),
    country: region.country,
    state: region.state,
    countryCode: region.countryCode,
    stateCode: region.stateCode,
    city: user.city ?? '',
    streetAddress: user.streetAddress ?? '',
    zipCode: user.ZipCode ?? user.zipcode ?? '',
    web3address: user.web3address ?? '',
    networkType: user.networkType ?? '',
  };
}

function isValidDobInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return false;
  }

  const date = new Date(`${value.trim()}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

/** Validation aligned with web account-details Yup schema. */
export function validateAccountDetailsForm(
  values: AccountDetailsFormValues,
): AccountDetailsFormErrors {
  const errors: AccountDetailsFormErrors = {};

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

export function buildUpdateUserProfileRequest(
  values: AccountDetailsFormValues,
  existing?: UserProfileResponse,
): UpdateUserProfileRequest {
  const { countryCode, stateCode } = resolveAddressRegionCodes({
    country: values.country,
    state: values.state,
    countryCode: values.countryCode || existing?.countryCode,
    stateCode: values.stateCode || existing?.stateCode,
  });

  const dobValue = values.dob.trim();

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    DOB: dobValue ? new Date(`${dobValue}T00:00:00.000Z`).toISOString() : null,
    gender: values.gender.trim() || undefined,
    email: values.email.trim(),
    phone: values.phone.trim(),
    web3address: values.web3address.trim() || undefined,
    country: values.country.trim(),
    state: values.state.trim(),
    city: values.city.trim(),
    streetAddress: values.streetAddress.trim(),
    ZipCode: values.zipCode.trim(),
    countryCode,
    stateCode,
  };
}

export function mapUserProfileToStoredProfile(
  profile: UserProfileResponse,
  authUserId: string,
  existing?: StoredUserProfile | null,
): StoredUserProfile {
  return {
    ...existing,
    userRole: profile.userRole ?? existing?.userRole,
    userId: profile.userId ?? profile._id ?? authUserId,
    _id: profile._id ?? profile.userId ?? authUserId,
    email: profile.email ?? existing?.email,
    firstName: profile.firstName ?? existing?.firstName,
    lastName: profile.lastName ?? existing?.lastName,
    gender: profile.gender ?? existing?.gender,
    DOB: profile.DOB ?? existing?.DOB,
    web3address: profile.web3address ?? existing?.web3address,
    networkType: profile.networkType ?? existing?.networkType,
    userProfile: profile.userProfile ?? existing?.userProfile,
    country: profile.country ?? profile.countryName ?? existing?.country,
    countryName: profile.countryName ?? profile.country ?? existing?.countryName,
    Country: profile.Country ?? existing?.Country,
    countryCode: profile.countryCode ?? existing?.countryCode,
    stateCode: profile.stateCode ?? existing?.stateCode,
    streetAddress: profile.streetAddress ?? existing?.streetAddress,
    state: profile.state ?? existing?.state,
    city: profile.city ?? existing?.city,
    ZipCode: profile.ZipCode ?? profile.zipcode ?? existing?.ZipCode,
    zipcode: profile.zipcode ?? profile.ZipCode ?? existing?.zipcode,
    phone: profile.phone ?? profile.moNumber ?? existing?.phone,
    moNumber: profile.moNumber ?? profile.phone ?? existing?.moNumber,
    company: profile.company ?? existing?.company,
  };
}

export function hasAccountDetailsFormErrors(errors: AccountDetailsFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
