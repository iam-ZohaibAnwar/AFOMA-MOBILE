import type { SavedUserAddress, UserProfileResponse } from '../../../services/api/usersApi';
import type { ShippingAddress } from '../types/shippingAddress';
import { resolveAddressRegionCodes } from './resolveAddressRegionCodes';

function pickString(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return '';
}

export function mapSavedUserAddressToShippingAddress(address: SavedUserAddress): ShippingAddress {
  const regionCodes = resolveAddressRegionCodes({
    country: address.country,
    state: address.state,
    countryCode: address.countryCode,
    stateCode: address.stateCode,
  });

  return {
    name: [address.firstName, address.lastName].filter(Boolean).join(' ').trim(),
    email: '',
    phone: pickString(address.phone, address.moNumber),
    streetAddress: pickString(address.streetAddress),
    city: pickString(address.city),
    state: pickString(address.state),
    zip: pickString(address.ZipCode, address.zipcode),
    country: pickString(address.country),
    countryCode: regionCodes.countryCode,
    stateCode: regionCodes.stateCode,
  };
}

export function mapUserProfileToShippingAddress(
  profile: UserProfileResponse,
  emailFallback = '',
): ShippingAddress {
  const regionCodes = resolveAddressRegionCodes({
    country: pickString(profile.country, profile.countryName, profile.Country),
    state: profile.state,
    countryCode: profile.countryCode,
    stateCode: profile.stateCode,
  });

  return {
    name: [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim(),
    email: pickString(profile.email, emailFallback),
    phone: pickString(profile.phone, profile.moNumber),
    streetAddress: pickString(profile.streetAddress),
    city: pickString(profile.city),
    state: pickString(profile.state),
    zip: pickString(profile.ZipCode, profile.zipcode),
    country: pickString(profile.country, profile.countryName, profile.Country),
    countryCode: regionCodes.countryCode,
    stateCode: regionCodes.stateCode,
  };
}

export function mergeShippingAddress(
  current: ShippingAddress,
  next: ShippingAddress,
): ShippingAddress {
  return {
    name: pickString(next.name, current.name),
    email: pickString(next.email, current.email),
    phone: pickString(next.phone, current.phone),
    streetAddress: pickString(next.streetAddress, current.streetAddress),
    city: pickString(next.city, current.city),
    state: pickString(next.state, current.state),
    zip: pickString(next.zip, current.zip),
    country: pickString(next.country, current.country),
    countryCode: pickString(next.countryCode, current.countryCode),
    stateCode: pickString(next.stateCode, current.stateCode),
  };
}

export function hasCompleteShippingAddress(address: ShippingAddress): boolean {
  return Boolean(
    address.email.trim() &&
      address.streetAddress.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.zip.trim() &&
      address.country.trim() &&
      address.phone.trim(),
  );
}
